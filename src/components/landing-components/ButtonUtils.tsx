import React from 'react';
import { SelectableElement } from '@/components/builder/SelectableElement';
import { supabase } from '@/integrations/supabase/client';

// Utility function to generate UUID with fallback
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback UUID generation for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Shared button click handler
export function handleButtonClick(action: unknown, isEditing: boolean, e: React.MouseEvent) {
  if (isEditing || !action) return;
  e.preventDefault();
  
  const actionObj = action as Record<string, unknown>;
  console.log('Button click handler triggered:', { action: actionObj, isEditing });
  
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
      // Check if we have a valid productId - amount can be 0 or missing
      console.log('Checkout action triggered:', actionObj);
      if (actionObj.productId && actionObj.productId !== '') {
        handleCheckout(action, isEditing);
      } else {
        console.warn('Checkout action missing productId:', actionObj);
        if (!isEditing) {
          alert('Checkout configuration is incomplete. Please contact support.');
        }
      }
      break;
    default:
      console.warn('Unknown action type:', actionObj.type);
      break;
  }
}

// Checkout handler function
async function handleCheckout(action: unknown, isEditing: boolean) {
  if (isEditing) return;
  
  const actionObj = action as Record<string, unknown>;
  console.log('Starting checkout process with action:', actionObj);
  
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

    console.log('Form data collected:', formData);

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

    // Generate proper UUID for order ID
    const orderId = generateUUID();
    const buyerName = formData.name || formData.full_name || userEmail.split('@')[0];
    
    // Get amount, defaulting to 0 if not provided
    const amount = Number(actionObj.amount) || 0;
    console.log('Processing checkout for productId:', actionObj.productId, 'amount:', amount);
    
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
        amount: Math.round(amount * 1000), // Convert to millimes using validated amount
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
    console.log('Redirecting to payment URL:', paymentData.payUrl);
    window.location.href = paymentData.payUrl;

  } catch (error) {
    console.error('Checkout error:', error);
    console.error('Checkout error details:', {
      actionObj,
      error: error.message || error
    });
    alert(`Checkout failed: ${error.message || 'An unexpected error occurred'}. Please try again.`);
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
  
  // Debug logging for button actions
  console.log('Rendering button:', {
    elementId,
    isEditing,
    actionType: actionObj?.type,
    actionData: actionObj
  });
  
  // Unified button rendering for both builder preview AND deployed pages
  // Always use data attributes + click handlers for consistency
  if (!isEditing && actionObj?.type) {
    const buttonAttributes: Record<string, any> = {
      'data-action': actionObj.type,
      className,
      style,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        handleButtonClick(action, isEditing, e);
      }
    };

    // Add action data based on action type (for fallback JS handlers)
    switch (actionObj.type) {
      case 'open_link':
        buttonAttributes['data-action-data'] = JSON.stringify({
          url: actionObj.url,
          newTab: actionObj.newTab
        });
        break;
      case 'scroll':
        buttonAttributes['data-action-data'] = String(actionObj.targetId || '');
        break;
      case 'checkout':
        const checkoutData = {
          productId: actionObj.productId,
          amount: actionObj.amount,
          checkoutUrl: actionObj.checkoutUrl
        };
        console.log('Setting checkout data attributes:', checkoutData);
        buttonAttributes['data-action-data'] = JSON.stringify(checkoutData);
        break;
    }

    console.log('Rendering unified button with attributes and React handler:', buttonAttributes);
    return React.createElement('button', buttonAttributes, content);
  }
  
  // Builder mode - use SelectableElement with click handlers
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