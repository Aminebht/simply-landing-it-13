import React from 'react';
import { SelectableElement } from '@/components/builder/SelectableElement';
import { supabase } from '@/integrations/supabase/client';

// Shared button click handler
export function handleButtonClick(action: unknown, isEditing: boolean, e: React.MouseEvent) {
  if (isEditing || !action) return;
  e.preventDefault();
  
  const actionObj = action as Record<string, unknown>;
  
  switch (actionObj.type) {
    case 'open_link':
      if (actionObj.url) {
        let url = String(actionObj.url);
        if (url && !/^https?:\/\//i.test(url)) {
          url = 'https://' + url;
        }
        window.open(url, actionObj.newTab ? '_blank' : '_self');
      }
      break;
    case 'scroll':
      if (actionObj.targetId) {
        const el = document.getElementById(String(actionObj.targetId));
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
      break;
    case 'checkout':
      // Defensive: treat empty string or null as missing
      if (actionObj.productId && actionObj.productId !== '' && actionObj.amount != null && actionObj.amount !== '') {
        handleCheckout(action, isEditing);
      }
      break;
    default:
      break;
  }
}

// Checkout handler function
async function handleCheckout(action: unknown, isEditing: boolean) {
  if (isEditing) return;
  
  const actionObj = action as Record<string, unknown>;
  
  try {
    // Get form data from DynamicCheckoutForm if it exists
    const formElements = document.querySelectorAll('form input, form select');
    const formData: Record<string, string> = {};
    let userEmail = '';
    
    formElements.forEach((element) => {
      const input = element as HTMLInputElement;
      if (input.name || input.id) {
        const key = input.name || input.id;
        formData[key] = input.value;
        if (key === 'email') userEmail = input.value;
      }
    });

    // Validate required email
    if (!userEmail) {
      alert("Please enter your email to proceed with checkout.");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      alert("Please enter a valid email address.");
      return;
    }

    // Generate order ID
    const orderId = crypto.randomUUID();
    const buyerName = formData.name || formData.full_name || userEmail.split('@')[0];
    
    // Create pending order first
    const { data: orderData, error: orderError } = await supabase.rpc('create_pending_order', {
      p_order_id: orderId,
      p_buyer_id: null, // Guest purchase
      p_buyer_email: userEmail,
      p_buyer_name: buyerName,
      p_global_submission_data: formData,
      p_language: 'en',
      p_is_guest_purchase: true,
      p_cart_items: [{
        product_id: String(actionObj.productId),
        quantity: 1,
        submission_data: formData
      }],
      p_payment_method: 'konnect'
    });

    if (orderError) {
      console.error('Order creation error:', orderError);
      alert("Failed to create order. Please try again.");
      return;
    }

    // Prepare success URL
    const successUrl = `https://demarky.tn/download/order-${orderId}-${actionObj.productId}`;
    const failUrl = `${window.location.origin}`;

    // Create payment session
    const { data: paymentData, error: paymentError } = await supabase.functions.invoke('create-payment', {
      body: {
        amount: Math.round(Number(actionObj.amount) * 1000), // Convert to millimes
        orderId,
        successUrl,
        failUrl,
        user: {
          email: userEmail,
          name: buyerName
        }
      }
    });

    if (paymentError || !paymentData?.payUrl) {
      console.error('Payment creation error:', paymentError);
      alert("Failed to create payment session. Please try again.");
      return;
    }

    // Redirect to payment gateway
    window.location.href = paymentData.payUrl;

  } catch (error) {
    console.error('Checkout error:', error);
    alert("An unexpected error occurred. Please try again.");
  }
}

// Props for rendering a CTA button
export interface RenderButtonProps {
  action: unknown;
  isEditing: boolean;
  content: string;
  elementId: string;
  selectedElementId?: string;
  onSelect?: (id: string) => void;
  onContentChange?: (field: string, value: string) => void;
  contentField: string;
  className: string;
  style?: React.CSSProperties;
  as?: 'primary' | 'secondary';
  viewport?: string;
}

export function renderButton({
  action,
  isEditing,
  content,
  elementId,
  selectedElementId,
  onSelect,
  onContentChange,
  contentField,
  className,
  style,
  as = 'primary',
  viewport
}: RenderButtonProps) {
  const actionObj = action as Record<string, unknown>;
  
  if (actionObj?.type === 'open_link' && !isEditing) {
    let url = String(actionObj.url || '#');
    if (url && !/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    return (
      <a
        href={url}
        target={actionObj.newTab ? '_blank' : '_self'}
        rel={actionObj.newTab ? 'noopener noreferrer' : undefined}
        className={className}
        style={style}
      >
        {content}
      </a>
    );
  }
  return (
    <SelectableElement
      elementId={elementId}
      isSelected={selectedElementId === elementId}
      isEditing={isEditing}
      onSelect={onSelect}
      onContentChange={onContentChange}
      contentField={contentField}
      isContentEditable={true}
      className={className}
      style={style}
      onClick={!isEditing ? (e => handleButtonClick(action, isEditing, e)) : undefined}
    >
      {content}
    </SelectableElement>
  );
} 