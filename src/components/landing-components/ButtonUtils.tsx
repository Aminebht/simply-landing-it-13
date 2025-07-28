import React from 'react';
import { SelectableElement } from '@/components/builder/SelectableElement';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Shared button click handler
export function handleButtonClick(action: any, isEditing: boolean, e: React.MouseEvent) {
  if (isEditing || !action) return;
  e.preventDefault();
  switch (action.type) {
    case 'open_link':
      if (action.url) {
        let url = action.url;
        if (url && !/^https?:\/\//i.test(url)) {
          url = 'https://' + url;
        }
        window.open(url, action.newTab ? '_blank' : '_self');
      }
      break;
    case 'scroll':
      if (action.targetId) {
        const el = document.getElementById(action.targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          console.warn('[Button Scroll Debug] No element found for targetId:', action.targetId);
        }
      }
      break;
    case 'checkout':
      // Defensive: treat empty string or null as missing
      if (action.productId && action.productId !== '' && action.amount != null && action.amount !== '') {
        handleCheckout(action, isEditing);
      } else {
        console.warn('[Button Checkout Debug] Missing productId or amount in action:', {
          productId: action.productId,
          amount: action.amount,
          action
        });
      }
      break;
    default:
      break;
  }
}

// Checkout handler function
async function handleCheckout(action: any, isEditing: boolean) {
  if (isEditing) return;
  
  const { toast } = useToast();
  
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
      toast({
        title: "Email Required",
        description: "Please enter your email to proceed with checkout.",
        variant: "destructive"
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
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
        product_id: action.productId,
        quantity: 1,
        submission_data: formData
      }],
      p_payment_method: 'konnect'
    });

    if (orderError) {
      console.error('Order creation error:', orderError);
      toast({
        title: "Order Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive"
      });
      return;
    }

    // Prepare success URL
    const successUrl = `${window.location.origin}/download/order-${orderId}-${action.productId}`;
    const failUrl = `${window.location.origin}`;

    // Create payment session
    const { data: paymentData, error: paymentError } = await supabase.functions.invoke('create-payment', {
      body: {
        amount: Math.round(action.amount * 1000), // Convert to millimes
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
      toast({
        title: "Payment Error",
        description: "Failed to create payment session. Please try again.",
        variant: "destructive"
      });
      return;
    }

    // Redirect to payment gateway
    window.location.href = paymentData.payUrl;

  } catch (error) {
    console.error('Checkout error:', error);
    toast({
      title: "Checkout Error",
      description: "An unexpected error occurred. Please try again.",
      variant: "destructive"
    });
  }
}

// Props for rendering a CTA button
export interface RenderButtonProps {
  action: any;
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
  if (action?.type === 'open_link' && !isEditing) {
    let url = action.url || '#';
    if (url && !/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    return (
      <a
        href={url}
        target={action.newTab ? '_blank' : '_self'}
        rel={action.newTab ? 'noopener noreferrer' : undefined}
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