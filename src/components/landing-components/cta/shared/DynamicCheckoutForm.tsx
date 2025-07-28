
import React, { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase';
import { CtaClassMaps } from './CtaClassMaps';

interface CheckoutField {
  id: string;
  label: string;
  field_key: string;
  is_required: boolean;
  display_order: number;
}

interface DynamicCheckoutFormProps {
  productId?: string;
  onSubmit?: (data: Record<string, any>) => void;
  className?: string;
}

export const DynamicCheckoutForm: React.FC<DynamicCheckoutFormProps> = ({
  productId,
  onSubmit,
  className = ''
}) => {
  const [fields, setFields] = useState<CheckoutField[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchCheckoutFields = async () => {
      try {
        const { data, error } = await supabase
          .from('checkout_fields')
          .select('*')
          .order('display_order', { ascending: true });

        if (error) throw error;
        
        // Filter fields by product if productId is provided
        const filteredFields = data?.filter(field => 
          !productId || field.product_ids.includes(productId)
        ) || [];

        setFields(filteredFields);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchCheckoutFields();
  }, [productId]);

  // Always ensure a required email field is present
  const fieldsWithEmail = React.useMemo(() => {
    return [
      {
        id: 'email',
        label: 'Email',
        field_key: 'email',
        is_required: true,
        display_order: 0
      },
      ...fields
    ];
  }, [fields]);

  // Validation function for each field
  const validateField = (field: CheckoutField, value: any): string => {
    switch (field.field_key) {
      case 'email': {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) return 'Email is required.';
        if (!emailRegex.test(value)) return 'Invalid email address.';
        return '';
      }
      case 'phone': {
        const phoneRegex = /^[0-9+\-()\s]{6,20}$/;
        if (field.is_required && !value) return 'Phone is required.';
        if (value && !phoneRegex.test(value)) return 'Invalid phone number.';
        return '';
      }
      default: {
        // Only allow letters, numbers, spaces, and basic punctuation
        const textRegex = /^[\w\s.,'"+!?@#\-()/]{0,100}$/i;
        if (field.is_required && !value) return `${field.label} is required.`;
        if (value && !textRegex.test(value)) return 'Invalid characters detected.';
        return '';
      }
    }
  };

  const handleInputChange = (fieldKey: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldKey]: value
    }));
    const field = fieldsWithEmail.find(f => f.field_key === fieldKey);
    if (field) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [fieldKey]: error }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate all fields before submit
    let valid = true;
    const newErrors: Record<string, string> = {};
    fieldsWithEmail.forEach(field => {
      const error = validateField(field, formData[field.field_key]);
      if (error) valid = false;
      newErrors[field.field_key] = error;
    });
    setErrors(newErrors);
    if (!valid) return;
    onSubmit?.(formData);
  };

  const renderField = (field: CheckoutField) => {
    const commonProps = {
      id: field.field_key,
      required: field.is_required,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => 
        handleInputChange(field.field_key, e.target.value)
    };

    switch (field.field_key) {
      case 'email':
        return (
          <input
            {...commonProps}
            type="email"
            placeholder="Enter your email"
            className={CtaClassMaps.form.input}
          />
        );
      case 'name':
      case 'full_name':
        return (
          <input
            {...commonProps}
            type="text"
            placeholder="Enter your name"
            className={CtaClassMaps.form.input}
          />
        );
      case 'phone':
        return (
          <input
            {...commonProps}
            type="tel"
            placeholder="Enter your phone number"
            className={CtaClassMaps.form.input}
          />
        );
      case 'company':
        return (
          <input
            {...commonProps}
            type="text"
            placeholder="Enter your company"
            className={CtaClassMaps.form.input}
          />
        );
      case 'country':
        return (
          <select {...commonProps} className={CtaClassMaps.form.select}>
            <option value="">Select Country</option>
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="UK">United Kingdom</option>
            <option value="AU">Australia</option>
            <option value="DE">Germany</option>
            <option value="FR">France</option>
            <option value="OTHER">Other</option>
          </select>
        );
      default:
        return (
          <input
            {...commonProps}
            type="text"
            placeholder={`Enter ${field.label.toLowerCase()}`}
            className={CtaClassMaps.form.input}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className={`${CtaClassMaps.form.container} ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-muted rounded-lg"></div>
          <div className="h-12 bg-muted rounded-lg"></div>
          <div className="h-12 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (fields.length === 0) {
    return (
      <div className={`${CtaClassMaps.form.container} ${className}`}>
        <input
          type="email"
          placeholder="Enter your email"
          className={CtaClassMaps.form.input}
          onChange={(e) => handleInputChange('email', e.target.value)}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`${CtaClassMaps.form.container} ${className}`}>
      {fieldsWithEmail.map((field) => (
        <div key={field.id}>
          <label htmlFor={field.field_key} className="block text-sm font-medium text-foreground mb-2">
            {field.label} {field.is_required && <span className="text-destructive">*</span>}
          </label>
          {renderField(field)}
          {errors[field.field_key] && (
            <div className="text-destructive text-xs mt-1">{errors[field.field_key]}</div>
          )}
        </div>
      ))}
    </form>
  );
};
