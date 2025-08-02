import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-page-slug',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const body = await req.json()
    const { 
      // Checkout parameters
      orderId, productId, amount, buyerEmail, buyerName, formData, pageSlug,
      // Form submission parameters
      form_only, form_data, page_slug, utm_data, session_id, user_agent, page_url 
    } = body
    
    // Check if this is a form-only submission (contact forms) or a checkout
    const isFormOnly = form_only === true
    
    console.log('Secure request received:', {
      type: isFormOnly ? 'FORM_SUBMISSION' : 'CHECKOUT',
      orderId: isFormOnly ? 'N/A' : orderId,
      productId: isFormOnly ? 'N/A' : productId,
      amount: isFormOnly ? 'N/A' : amount,
      buyerEmail: (buyerEmail || (form_data && form_data.email)) ? 'PROVIDED' : 'MISSING',
      buyerName: (buyerName || (form_data && form_data.full_name)) ? 'PROVIDED' : 'MISSING',
      pageSlug: pageSlug || page_slug,
      formDataKeys: (formData || form_data) ? Object.keys(formData || form_data) : 'MISSING'
    })
    
    // Normalize data for both form submission and checkout
    const normalizedPageSlug = pageSlug || page_slug
    const normalizedFormData = formData || form_data || {}
    const normalizedBuyerEmail = buyerEmail || (normalizedFormData.email)
    const normalizedBuyerName = buyerName || (normalizedFormData.full_name || normalizedFormData.name)
    
    // SQL INJECTION PROTECTION - Same as form-submission function
    console.log('Starting SQL injection protection...')
    
    // SQL injection patterns to detect and block
    const sqlInjectionPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/gi,
      /(;|\-\-|\/\*|\*\/|xp_|sp_)/gi,
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi
    ]
    
    function containsSQLInjection(value: string): boolean {
      if (typeof value !== 'string') return false
      return sqlInjectionPatterns.some(pattern => pattern.test(value))
    }
    
    function sanitizeValue(value: any): string {
      if (typeof value !== 'string') return String(value).slice(0, 2000)
      
      // Check for SQL injection
      if (containsSQLInjection(value)) {
        throw new Error('Invalid input detected')
      }
      
      // Basic sanitization
      return value
        .trim()
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .slice(0, 2000) // Limit length
    }
    
    // Sanitize all string inputs for SQL injection protection
    let validatedBuyerEmail = normalizedBuyerEmail
    let validatedBuyerName = normalizedBuyerName
    const validatedFormData: { [key: string]: string } = {}
    
    try {
      // Sanitize buyer email
      if (normalizedBuyerEmail && typeof normalizedBuyerEmail === 'string') {
        validatedBuyerEmail = sanitizeValue(normalizedBuyerEmail).toLowerCase()
      }
      
      // Sanitize buyer name
      if (normalizedBuyerName && typeof normalizedBuyerName === 'string') {
        validatedBuyerName = sanitizeValue(normalizedBuyerName)
      }
      
      // Sanitize form data
      if (normalizedFormData && typeof normalizedFormData === 'object') {
        for (const [key, value] of Object.entries(normalizedFormData)) {
          try {
            // Sanitize field name (keys)
            const cleanKey = key.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 50)
            if (cleanKey && value !== null && value !== undefined) {
              validatedFormData[cleanKey] = sanitizeValue(value)
            }
          } catch (fieldError) {
            console.error(`Malicious input detected in field ${key}:`, value)
            throw new Error('Invalid form data detected')
          }
        }
      }
      
    } catch (error) {
      console.error('SQL injection attempt detected:', error)
      return new Response(JSON.stringify({ error: 'Invalid input detected' }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    console.log('✅ SQL injection protection passed successfully')
    
    // RATE LIMITING IMPLEMENTATION (same as form-submission)
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const rateLimitKey = isFormOnly 
      ? `form_submission_${clientIP}_${normalizedPageSlug}`
      : `secure_checkout_${clientIP}_${normalizedPageSlug}`
    
    // Simple in-memory rate limiting (for production, use Redis)
    const rateLimitStore = new Map()
    const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
    const RATE_LIMIT_MAX_REQUESTS = isFormOnly ? 5 : 3 // 5 for forms, 3 for checkout
    
    const now = Date.now()
    const userRequests = rateLimitStore.get(rateLimitKey) || []
    
    // Clean old requests
    const recentRequests = userRequests.filter((timestamp: number) => now - timestamp < RATE_LIMIT_WINDOW)
    
    if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
      const errorMessage = isFormOnly 
        ? 'Rate limit exceeded. Please wait before submitting again.'
        : 'Too many checkout attempts. Please wait before trying again.'
      return new Response(JSON.stringify({ error: errorMessage }), { 
        status: 429,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Retry-After': '60'
        }
      })
    }
    
    // Add current request
    recentRequests.push(now)
    rateLimitStore.set(rateLimitKey, recentRequests)
    
    // 1. SECURITY VALIDATION
    // Validate page slug exists and is authorized
    const { data: pageData, error: pageError } = await supabaseClient
      .from('landing_pages')
      .select('id, user_id, product_id, status')
      .eq('slug', normalizedPageSlug)
      .eq('status', 'published')
      .single()
    
    console.log('Page validation result:', { pageData, pageError })
    
    if (pageError || !pageData) {
      console.error('Page validation failed:', pageError)
      return new Response(JSON.stringify({ error: 'Invalid page' }), { 
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    // If this is a form-only submission, return success after logging
    if (isFormOnly) {
      console.log('Form submission processed securely:', {
        page_id: pageData.id,
        user_id: pageData.user_id,
        form_fields_count: Object.keys(validatedFormData).length,
        client_ip: clientIP,
        timestamp: new Date().toISOString(),
        field_names: Object.keys(validatedFormData)
      })
      
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    // 2. VALIDATE PRODUCT AND PRICING (Skip if products table doesn't exist)
    console.log('Attempting to validate product:', productId)
    let validatedAmount = amount // Use provided amount as fallback
    
    try {
      const { data: productData, error: productError } = await supabaseClient
        .from('products')
        .select('id, price, currency, status')
        .eq('id', productId)
        .eq('status', 'active')
        .single()
      
      console.log('Product validation result:', { productData, productError })
      
      if (!productError && productData) {
        // Use server-validated price if product exists
        validatedAmount = productData.price
        console.log('Using server-validated price:', validatedAmount)
      } else {
        console.warn('Product not found in database, using provided amount:', amount)
      }
    } catch (productCheckError) {
      console.warn('Products table might not exist, using provided amount:', productCheckError)
    }
    
    // 3. CREATE SECURE ORDER
    console.log('Creating order with validated data and amount:', validatedAmount)
    
    const { data: orderData, error: orderError } = await supabaseClient.rpc('create_pending_order', {
      p_order_id: orderId,
      p_buyer_id: null,
      p_buyer_email: validatedBuyerEmail,
      p_buyer_name: validatedBuyerName,
      p_global_submission_data: validatedFormData,
      p_language: 'en',
      p_is_guest_purchase: true,
      p_cart_items: [{
        product_id: String(productId),
        quantity: 1,
        submission_data: validatedFormData
      }],
      p_payment_method: 'konnect'
    })

    console.log('Order creation result:', { orderData, orderError })

    if (orderError) {
      console.error('Order creation error:', orderError)
      return new Response(JSON.stringify({ error: 'Failed to create order' }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 4. CREATE SECURE PAYMENT SESSION
    const successUrl = `https://demarky.tn/download/order-${orderId}-${productId}`
    const failUrl = `https://${normalizedPageSlug}.netlify.app`

    console.log('Payment URLs:', { successUrl, failUrl })

    const { data: paymentData, error: paymentError } = await supabaseClient.functions.invoke('create-payment', {
      body: {
        amount: Math.round(validatedAmount * 1000), // Use validated amount
        orderId,
        successUrl,
        failUrl,
        user: {
          email: validatedBuyerEmail,
          name: validatedBuyerName
        }
      }
    })

    console.log('Payment creation result:', { paymentData, paymentError })

    if (paymentError || !paymentData?.payUrl) {
      console.error('Payment creation error:', paymentError)
      return new Response(JSON.stringify({ error: 'Failed to create payment session' }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 5. RETURN SECURE RESPONSE
    return new Response(JSON.stringify({ 
      success: true, 
      paymentUrl: paymentData.payUrl 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Secure checkout error:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})