export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      checkout_fields: {
        Row: {
          created_at: string
          display_order: number
          field_key: string
          id: string
          is_required: boolean
          label: string
          product_ids: string[]
          seller_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          field_key: string
          id?: string
          is_required?: boolean
          label: string
          product_ids: string[]
          seller_id: string
        }
        Update: {
          created_at?: string
          display_order?: number
          field_key?: string
          id?: string
          is_required?: boolean
          label?: string
          product_ids?: string[]
          seller_id?: string
        }
        Relationships: []
      }
      component_variations: {
        Row: {
          button_actions: Json | null
          character_limits: Json | null
          component_type: string
          created_at: string | null
          default_content: Json | null
          description: string | null
          id: string
          is_active: boolean | null
          required_images: number | null
          supports_video: boolean | null
          updated_at: string | null
          variation_name: string
          variation_number: number
          visibility_keys: Json | null
        }
        Insert: {
          button_actions?: Json | null
          character_limits?: Json | null
          component_type: string
          created_at?: string | null
          default_content?: Json | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          required_images?: number | null
          supports_video?: boolean | null
          updated_at?: string | null
          variation_name: string
          variation_number: number
          visibility_keys?: Json | null
        }
        Update: {
          button_actions?: Json | null
          character_limits?: Json | null
          component_type?: string
          created_at?: string | null
          default_content?: Json | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          required_images?: number | null
          supports_video?: boolean | null
          updated_at?: string | null
          variation_name?: string
          variation_number?: number
          visibility_keys?: Json | null
        }
        Relationships: []
      }
      deployment_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          job_data: Json | null
          landing_page_id: string | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          job_data?: Json | null
          landing_page_id?: string | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          job_data?: Json | null
          landing_page_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deployment_jobs_landing_page_id_fkey"
            columns: ["landing_page_id"]
            isOneToOne: false
            referencedRelation: "landing_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      landing_page_components: {
        Row: {
          component_variation_id: string
          content: Json
          created_at: string | null
          custom_actions: Json | null
          custom_styles: Json | null
          id: string
          media_urls: Json | null
          order_index: number
          page_id: string | null
          updated_at: string | null
          visibility: Json | null
        }
        Insert: {
          component_variation_id: string
          content?: Json
          created_at?: string | null
          custom_actions?: Json | null
          custom_styles?: Json | null
          id?: string
          media_urls?: Json | null
          order_index: number
          page_id?: string | null
          updated_at?: string | null
          visibility?: Json | null
        }
        Update: {
          component_variation_id?: string
          content?: Json
          created_at?: string | null
          custom_actions?: Json | null
          custom_styles?: Json | null
          id?: string
          media_urls?: Json | null
          order_index?: number
          page_id?: string | null
          updated_at?: string | null
          visibility?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "landing_page_components_component_variation_id_fkey"
            columns: ["component_variation_id"]
            isOneToOne: false
            referencedRelation: "component_variations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "landing_page_components_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "landing_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      landing_pages: {
        Row: {
          created_at: string | null
          custom_domain: string | null
          global_theme: Json | null
          id: string
          last_deployed_at: string | null
          netlify_site_id: string | null
          product_id: string | null
          seo_config: Json | null
          slug: string
          status: string | null
          tracking_config: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          custom_domain?: string | null
          global_theme?: Json | null
          id?: string
          last_deployed_at?: string | null
          netlify_site_id?: string | null
          product_id?: string | null
          seo_config?: Json | null
          slug: string
          status?: string | null
          tracking_config?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          custom_domain?: string | null
          global_theme?: Json | null
          id?: string
          last_deployed_at?: string | null
          netlify_site_id?: string | null
          product_id?: string | null
          seo_config?: Json | null
          slug?: string
          status?: string | null
          tracking_config?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "landing_pages_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "landing_pages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      library_items: {
        Row: {
          id: string
          is_for_stamping: boolean | null
          order_item_id: string | null
          original_file_url: string | null
          product_id: string | null
          purchase_date: string
          seller_id: string | null
          thumbnail_url: string | null
          title: string
          user_id: string
        }
        Insert: {
          id?: string
          is_for_stamping?: boolean | null
          order_item_id?: string | null
          original_file_url?: string | null
          product_id?: string | null
          purchase_date?: string
          seller_id?: string | null
          thumbnail_url?: string | null
          title: string
          user_id: string
        }
        Update: {
          id?: string
          is_for_stamping?: boolean | null
          order_item_id?: string | null
          original_file_url?: string | null
          product_id?: string | null
          purchase_date?: string
          seller_id?: string | null
          thumbnail_url?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          buyer_email: string | null
          buyer_id: string | null
          buyer_name: string | null
          created_at: string | null
          guest_email: string | null
          guest_name: string | null
          id: string
          is_archived: Json | null
          notes: Json | null
          order_number: string
          payment_method: string | null
          payment_reference: string | null
          status: string | null
          submission_data: Json | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          buyer_email?: string | null
          buyer_id?: string | null
          buyer_name?: string | null
          created_at?: string | null
          guest_email?: string | null
          guest_name?: string | null
          id?: string
          is_archived?: Json | null
          notes?: Json | null
          order_number: string
          payment_method?: string | null
          payment_reference?: string | null
          status?: string | null
          submission_data?: Json | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          buyer_email?: string | null
          buyer_id?: string | null
          buyer_name?: string | null
          created_at?: string | null
          guest_email?: string | null
          guest_name?: string | null
          id?: string
          is_archived?: Json | null
          notes?: Json | null
          order_number?: string
          payment_method?: string | null
          payment_reference?: string | null
          status?: string | null
          submission_data?: Json | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_media: {
        Row: {
          created_at: string
          display_order: number
          file_url: string
          id: string
          media_type: string
          product_id: string | null
        }
        Insert: {
          created_at?: string
          display_order: number
          file_url: string
          id?: string
          media_type: string
          product_id?: string | null
        }
        Update: {
          created_at?: string
          display_order?: number
          file_url?: string
          id?: string
          media_type?: string
          product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_media_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          archived: boolean | null
          categories: string[]
          created_at: string
          deleted: boolean | null
          description: string | null
          file_url: string
          id: string
          original_price: number
          preview_image_url: string | null
          price: number
          product_type: string
          seller_id: string
          stamp_pdf: boolean | null
          tags: string[] | null
          title: string
          Views: number | null
        }
        Insert: {
          archived?: boolean | null
          categories?: string[]
          created_at?: string
          deleted?: boolean | null
          description?: string | null
          file_url: string
          id?: string
          original_price: number
          preview_image_url?: string | null
          price: number
          product_type?: string
          seller_id: string
          stamp_pdf?: boolean | null
          tags?: string[] | null
          title: string
          Views?: number | null
        }
        Update: {
          archived?: boolean | null
          categories?: string[]
          created_at?: string
          deleted?: boolean | null
          description?: string | null
          file_url?: string
          id?: string
          original_price?: number
          preview_image_url?: string | null
          price?: number
          product_type?: string
          seller_id?: string
          stamp_pdf?: boolean | null
          tags?: string[] | null
          title?: string
          Views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          balance: number | null
          bio: string | null
          comission: number
          created_at: string
          email: string | null
          facebook_conversion_api_token: string | null
          facebook_pixel_id: string | null
          id: string
          is_company_verified: boolean | null
          is_creator: boolean
          is_verified: boolean | null
          logo: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          balance?: number | null
          bio?: string | null
          comission?: number
          created_at?: string
          email?: string | null
          facebook_conversion_api_token?: string | null
          facebook_pixel_id?: string | null
          id: string
          is_company_verified?: boolean | null
          is_creator?: boolean
          is_verified?: boolean | null
          logo?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          balance?: number | null
          bio?: string | null
          comission?: number
          created_at?: string
          email?: string | null
          facebook_conversion_api_token?: string | null
          facebook_pixel_id?: string | null
          id?: string
          is_company_verified?: boolean | null
          is_creator?: boolean
          is_verified?: boolean | null
          logo?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      complete_order_purchase: {
        Args: {
          p_order_id: string
          p_payment_id: string
          p_payment_status: string
          p_payment_data: Json
        }
        Returns: Json
      }
      create_pending_order: {
        Args: {
          p_order_id: string
          p_buyer_id: string
          p_buyer_email: string
          p_buyer_name: string
          p_global_submission_data: Json
          p_language: string
          p_is_guest_purchase: boolean
          p_cart_items: Json
          p_payment_method: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
