export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      assets: {
        Row: {
          area_sqm: number | null
          asset_name: string
          asset_type: string
          city: string | null
          country: string
          created_at: string
          current_price: number | null
          district: string | null
          id: string
          metadata: Json | null
          portfolio_id: string
          property_type: string | null
          purchase_date: string | null
          purchase_price: number | null
          quantity: number | null
          symbol: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          area_sqm?: number | null
          asset_name: string
          asset_type: string
          city?: string | null
          country: string
          created_at?: string
          current_price?: number | null
          district?: string | null
          id?: string
          metadata?: Json | null
          portfolio_id: string
          property_type?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          quantity?: number | null
          symbol?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          area_sqm?: number | null
          asset_name?: string
          asset_type?: string
          city?: string | null
          country?: string
          created_at?: string
          current_price?: number | null
          district?: string | null
          id?: string
          metadata?: Json | null
          portfolio_id?: string
          property_type?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          quantity?: number | null
          symbol?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assets_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          country: string | null
          created_at: string | null
          id: number
          name: string
          slug: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          id?: number
          name: string
          slug: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          id?: number
          name?: string
          slug?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      debts: {
        Row: {
          created_at: string
          duration_months: number | null
          id: string
          interest_rate: number | null
          monthly_payment: number | null
          name: string
          paid_amount: number | null
          start_date: string | null
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_months?: number | null
          id?: string
          interest_rate?: number | null
          monthly_payment?: number | null
          name: string
          paid_amount?: number | null
          start_date?: string | null
          total_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_months?: number | null
          id?: string
          interest_rate?: number | null
          monthly_payment?: number | null
          name?: string
          paid_amount?: number | null
          start_date?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      deposit_transactions: {
        Row: {
          amount: number
          created_at: string
          deposit_id: string
          description: string | null
          id: string
          tx_date: string
          tx_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          deposit_id: string
          description?: string | null
          id?: string
          tx_date?: string
          tx_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          deposit_id?: string
          description?: string | null
          id?: string
          tx_date?: string
          tx_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deposit_transactions_deposit_id_fkey"
            columns: ["deposit_id"]
            isOneToOne: false
            referencedRelation: "deposits"
            referencedColumns: ["id"]
          },
        ]
      }
      deposits: {
        Row: {
          accrued_interest: number
          created_at: string
          deposit_type: string
          id: string
          last_interest_date: string
          linked_asset: string | null
          maturity_date: string | null
          metadata: Json | null
          principal: number
          rate: number
          start_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accrued_interest?: number
          created_at?: string
          deposit_type: string
          id?: string
          last_interest_date?: string
          linked_asset?: string | null
          maturity_date?: string | null
          metadata?: Json | null
          principal?: number
          rate?: number
          start_date?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accrued_interest?: number
          created_at?: string
          deposit_type?: string
          id?: string
          last_interest_date?: string
          linked_asset?: string | null
          maturity_date?: string | null
          metadata?: Json | null
          principal?: number
          rate?: number
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deposits_linked_asset_fkey"
            columns: ["linked_asset"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_streams: {
        Row: {
          amount: number
          created_at: string
          expense_date: string | null
          expense_type: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          expense_date?: string | null
          expense_type: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          expense_date?: string | null
          expense_type?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      financial_goals: {
        Row: {
          ai_strategy: string | null
          category: string | null
          created_at: string
          current_amount: number | null
          id: string
          monthly_saving_amount: number | null
          status: string | null
          target_amount: number
          target_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_strategy?: string | null
          category?: string | null
          created_at?: string
          current_amount?: number | null
          id?: string
          monthly_saving_amount?: number | null
          status?: string | null
          target_amount: number
          target_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_strategy?: string | null
          category?: string | null
          created_at?: string
          current_amount?: number | null
          id?: string
          monthly_saving_amount?: number | null
          status?: string | null
          target_amount?: number
          target_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      income_streams: {
        Row: {
          amount: number
          created_at: string
          id: string
          income_type: string
          is_active: boolean
          name: string
          received_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          income_type: string
          is_active?: boolean
          name: string
          received_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          income_type?: string
          is_active?: boolean
          name?: string
          received_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      kv_store_c952a926: {
        Row: {
          key: string
          value: Json
        }
        Insert: {
          key: string
          value: Json
        }
        Update: {
          key?: string
          value?: Json
        }
        Relationships: []
      }
      neighborhoods: {
        Row: {
          city_id: number | null
          city_name: string | null
          city_slug: string
          created_at: string | null
          id: number
          name: string
          slug: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          city_id?: number | null
          city_name?: string | null
          city_slug: string
          created_at?: string | null
          id?: number
          name: string
          slug: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          city_id?: number | null
          city_name?: string | null
          city_slug?: string
          created_at?: string | null
          id?: number
          name?: string
          slug?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "neighborhoods_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_finances: {
        Row: {
          created_at: string
          id: string
          monthly_expenses: number | null
          monthly_income: number | null
          monthly_investing_amount: number | null
          net_savings: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          monthly_expenses?: number | null
          monthly_income?: number | null
          monthly_investing_amount?: number | null
          net_savings?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          monthly_expenses?: number | null
          monthly_income?: number | null
          monthly_investing_amount?: number | null
          net_savings?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      portfolios: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      real_estate_prices: {
        Row: {
          avg_price_per_meter: number | null
          city_name: string | null
          city_slug: string
          created_at: string | null
          currency: string | null
          id: number
          last_updated: string | null
          max_price: number | null
          max_price_per_meter: number | null
          min_price: number | null
          min_price_per_meter: number | null
          neighborhood_ar: string | null
          neighborhood_name: string | null
          neighborhood_slug: string
          price_per_meter: number | null
          property_type: string | null
          total_properties: number | null
          url: string | null
        }
        Insert: {
          avg_price_per_meter?: number | null
          city_name?: string | null
          city_slug: string
          created_at?: string | null
          currency?: string | null
          id?: number
          last_updated?: string | null
          max_price?: number | null
          max_price_per_meter?: number | null
          min_price?: number | null
          min_price_per_meter?: number | null
          neighborhood_ar?: string | null
          neighborhood_name?: string | null
          neighborhood_slug: string
          price_per_meter?: number | null
          property_type?: string | null
          total_properties?: number | null
          url?: string | null
        }
        Update: {
          avg_price_per_meter?: number | null
          city_name?: string | null
          city_slug?: string
          created_at?: string | null
          currency?: string | null
          id?: number
          last_updated?: string | null
          max_price?: number | null
          max_price_per_meter?: number | null
          min_price?: number | null
          min_price_per_meter?: number | null
          neighborhood_ar?: string | null
          neighborhood_name?: string | null
          neighborhood_slug?: string
          price_per_meter?: number | null
          property_type?: string | null
          total_properties?: number | null
          url?: string | null
        }
        Relationships: []
      }
      stocks: {
        Row: {
          change: number | null
          change_percent: number | null
          country: string
          created_at: string | null
          currency: string
          exchange: string
          id: number
          last_updated: string | null
          market_cap: number | null
          name: string
          price: number | null
          symbol: string
          volume: number | null
        }
        Insert: {
          change?: number | null
          change_percent?: number | null
          country: string
          created_at?: string | null
          currency: string
          exchange: string
          id?: number
          last_updated?: string | null
          market_cap?: number | null
          name: string
          price?: number | null
          symbol: string
          volume?: number | null
        }
        Update: {
          change?: number | null
          change_percent?: number | null
          country?: string
          created_at?: string | null
          currency?: string
          exchange?: string
          id?: number
          last_updated?: string | null
          market_cap?: number | null
          name?: string
          price?: number | null
          symbol?: string
          volume?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_deposit_accrual: {
        Args: { p_deposit_id: string; p_from: string; p_to: string }
        Returns: number
      }
      calculate_monthly_expenses: {
        Args: { user_uuid: string }
        Returns: number
      }
      calculate_monthly_income: {
        Args: { user_uuid: string }
        Returns: number
      }
      get_deposit_view: {
        Args: { p_deposit_id: string }
        Returns: Json
      }
      process_deposit: {
        Args: { p_deposit_id: string }
        Returns: {
          accrued_amount: number
          credited: boolean
          credited_amount: number
          deposit_id: string
          status: string
        }[]
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
