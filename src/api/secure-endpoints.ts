// Secure Server-Side API Endpoints for Landing Page Operations
// This file shows the server-side implementation needed to handle sensitive operations

import { createClient } from '@supabase/supabase-js'

// Server-side environment variables (NOT exposed to client)
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for server operations

const supabaseServer = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

/**
 * Secure Checkout Endpoint
 * POST /api/secure-checkout
 */
export async function POST_secureCheckout(request: Request) {
  try {
    const body = await request.json()
    const { orderId, productId, amount, buyerEmail, buyerName, formData, pageSlug } = body
    
    // 1. SECURITY VALIDATION
    // Validate page slug exists and is authorized
    const { data: pageData, error: pageError } = await supabaseServer
      .from('landing_pages')
      .select('id, user_id, product_id, status')
      .eq('slug', pageSlug)
      .eq('status', 'published')
      .single()
    
    if (pageError || !pageData) {
      return new Response(JSON.stringify({ error: 'Invalid page' }), { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // 2. VALIDATE PRODUCT AND PRICING
    // Verify product exists and get actual pricing (prevent price manipulation)
    const { data: productData, error: productError } = await supabaseServer
      .from('products')
      .select('id, price, currency, status')
      .eq('id', productId)
      .eq('status', 'active')
      .single()
    
    if (productError || !productData) {
      return new Response(JSON.stringify({ error: 'Invalid product' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Use server-validated price, not client-provided amount
    const validatedAmount = productData.price
    
    // 3. CREATE SECURE ORDER
    const { data: orderData, error: orderError } = await supabaseServer.rpc('create_pending_order', {
      p_order_id: orderId,
      p_buyer_id: null,
      p_buyer_email: buyerEmail,
      p_buyer_name: buyerName,
      p_global_submission_data: formData,
      p_language: 'en',
      p_is_guest_purchase: true,
      p_cart_items: [{
        product_id: productId,
        quantity: 1,
        submission_data: formData
      }],
      p_payment_method: 'konnect',
      p_page_id: pageData.id, // Store page reference securely
      p_user_id: pageData.user_id // Store owner reference securely
    })

    if (orderError) {
      console.error('Order creation error:', orderError)
      return new Response(JSON.stringify({ error: 'Failed to create order' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // 4. CREATE SECURE PAYMENT SESSION
    const successUrl = `https://demarky.tn/download/order-${orderId}-${productId}`
    const failUrl = `https://${pageSlug}.netlify.app`

    const { data: paymentData, error: paymentError } = await supabaseServer.functions.invoke('create-payment', {
      body: {
        amount: Math.round(validatedAmount * 1000), // Use validated amount
        orderId,
        successUrl,
        failUrl,
        user: {
          email: buyerEmail,
          name: buyerName
        }
      }
    })

    if (paymentError || !paymentData?.payUrl) {
      console.error('Payment creation error:', paymentError)
      return new Response(JSON.stringify({ error: 'Failed to create payment session' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // 5. LOG TRANSACTION SECURELY
    await supabaseServer
      .from('transaction_logs')
      .insert({
        order_id: orderId,
        page_id: pageData.id,
        user_id: pageData.user_id,
        product_id: productId,
        amount: validatedAmount,
        buyer_email: buyerEmail,
        status: 'initiated',
        created_at: new Date().toISOString()
      })

    // 6. RETURN SECURE RESPONSE
    return new Response(JSON.stringify({ 
      success: true, 
      paymentUrl: paymentData.payUrl 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Secure checkout error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

/**
 * Secure Form Submission Endpoint
 * POST /api/form-submission
 */
export async function POST_formSubmission(request: Request) {
  try {
    const body = await request.json()
    const { form_data, page_slug, utm_data, session_id, user_agent, page_url } = body
    
    // 1. VALIDATE PAGE
    const { data: pageData, error: pageError } = await supabaseServer
      .from('landing_pages')
      .select('id, user_id')
      .eq('slug', page_slug)
      .eq('status', 'published')
      .single()
    
    if (pageError || !pageData) {
      return new Response(JSON.stringify({ error: 'Invalid page' }), { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // 2. SANITIZE AND VALIDATE FORM DATA
    const sanitizedFormData = {}
    const allowedFields = ['email', 'name', 'full_name', 'phone', 'message', 'company']
    
    for (const [key, value] of Object.entries(form_data)) {
      if (allowedFields.includes(key) && typeof value === 'string' && value.length < 1000) {
        sanitizedFormData[key] = value.trim()
      }
    }
    
    // 3. RATE LIMITING (basic implementation)
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimitKey = `form_submission_${clientIP}_${page_slug}`
    
    // Check if this IP has submitted too many forms recently (implement rate limiting logic)
    
    // 4. STORE SECURELY IN DATABASE
    const { error: insertError } = await supabaseServer
      .from('landing_page_contacts')
      .insert({
        page_id: pageData.id,
        user_id: pageData.user_id,
        form_data: sanitizedFormData,
        utm_data,
        session_id,
        visitor_ip: clientIP,
        user_agent,
        page_url,
        created_at: new Date().toISOString()
      })
    
    if (insertError) {
      console.error('Form submission storage error:', insertError)
      return new Response(JSON.stringify({ error: 'Failed to store submission' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // 5. SEND NOTIFICATIONS (if configured)
    // Could trigger email notifications to page owner here
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('Form submission error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

/**
 * Secure Analytics Endpoint
 * POST /api/analytics
 */
export async function POST_analytics(request: Request) {
  try {
    const body = await request.json()
    const { event_type, event_data, page_slug } = body
    
    // 1. VALIDATE PAGE
    const { data: pageData, error: pageError } = await supabaseServer
      .from('landing_pages')
      .select('id, user_id')
      .eq('slug', page_slug)
      .single()
    
    if (pageError || !pageData) {
      return new Response(JSON.stringify({ error: 'Invalid page' }), { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // 2. SANITIZE EVENT DATA
    const allowedEventTypes = ['page_view', 'button_click', 'form_submission', 'scroll_depth', 'time_on_page']
    
    if (!allowedEventTypes.includes(event_type)) {
      return new Response(JSON.stringify({ error: 'Invalid event type' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // 3. STORE ANALYTICS SECURELY
    const { error: analyticsError } = await supabaseServer
      .from('page_analytics')
      .insert({
        page_id: pageData.id,
        user_id: pageData.user_id,
        event_type,
        event_data,
        visitor_ip: request.headers.get('x-forwarded-for'),
        user_agent: request.headers.get('user-agent'),
        created_at: new Date().toISOString()
      })
    
    if (analyticsError) {
      console.error('Analytics storage error:', analyticsError)
    }
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('Analytics error:', error)
    return new Response(JSON.stringify({ success: true }), { // Don't fail for analytics
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
