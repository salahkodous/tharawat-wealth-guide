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
      ai_agent_memory: {
        Row: {
          created_at: string
          id: string
          memory: Json
          summary: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          memory?: Json
          summary?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          memory?: Json
          summary?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
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
      bank_products: {
        Row: {
          bank_name: string
          bank_name_ar: string | null
          created_at: string | null
          currency: string | null
          early_withdrawal_penalty: number | null
          eligibility: string | null
          eligibility_ar: string | null
          features: string | null
          features_ar: string | null
          id: number
          interest_rate: number | null
          is_active: boolean | null
          last_updated: string | null
          maximum_amount: number | null
          minimum_amount: number | null
          monthly_fee: number | null
          opening_fee: number | null
          product_name: string
          product_name_ar: string | null
          product_type: string
          term_description: string | null
          term_description_ar: string | null
          term_months: number | null
          updated_at: string | null
        }
        Insert: {
          bank_name: string
          bank_name_ar?: string | null
          created_at?: string | null
          currency?: string | null
          early_withdrawal_penalty?: number | null
          eligibility?: string | null
          eligibility_ar?: string | null
          features?: string | null
          features_ar?: string | null
          id?: number
          interest_rate?: number | null
          is_active?: boolean | null
          last_updated?: string | null
          maximum_amount?: number | null
          minimum_amount?: number | null
          monthly_fee?: number | null
          opening_fee?: number | null
          product_name: string
          product_name_ar?: string | null
          product_type: string
          term_description?: string | null
          term_description_ar?: string | null
          term_months?: number | null
          updated_at?: string | null
        }
        Update: {
          bank_name?: string
          bank_name_ar?: string | null
          created_at?: string | null
          currency?: string | null
          early_withdrawal_penalty?: number | null
          eligibility?: string | null
          eligibility_ar?: string | null
          features?: string | null
          features_ar?: string | null
          id?: number
          interest_rate?: number | null
          is_active?: boolean | null
          last_updated?: string | null
          maximum_amount?: number | null
          minimum_amount?: number | null
          monthly_fee?: number | null
          opening_fee?: number | null
          product_name?: string
          product_name_ar?: string | null
          product_type?: string
          term_description?: string | null
          term_description_ar?: string | null
          term_months?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      bonds: {
        Row: {
          country: string
          coupon_rate: number | null
          created_at: string | null
          currency: string
          face_value: number | null
          id: string
          last_updated: string | null
          maturity: string
          name: string
          price: number
          rating: string | null
          symbol: string
          yield: number
        }
        Insert: {
          country: string
          coupon_rate?: number | null
          created_at?: string | null
          currency: string
          face_value?: number | null
          id?: string
          last_updated?: string | null
          maturity: string
          name: string
          price: number
          rating?: string | null
          symbol: string
          yield: number
        }
        Update: {
          country?: string
          coupon_rate?: number | null
          created_at?: string | null
          currency?: string
          face_value?: number | null
          id?: string
          last_updated?: string | null
          maturity?: string
          name?: string
          price?: number
          rating?: string | null
          symbol?: string
          yield?: number
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          chat_id: string
          content: string
          created_at: string
          id: string
          metadata: Json | null
          role: string
          user_id: string
        }
        Insert: {
          chat_id: string
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role: string
          user_id: string
        }
        Update: {
          chat_id?: string
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      chats: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      cryptocurrencies: {
        Row: {
          ath: number | null
          atl: number | null
          blockchain: string | null
          category: string | null
          change_24h: number | null
          change_percentage_24h: number | null
          circulating_supply: number | null
          created_at: string | null
          high_24h: number | null
          id: number
          last_updated: string | null
          low_24h: number | null
          market_cap: number | null
          max_supply: number | null
          name: string
          price_egp: number | null
          price_usd: number | null
          rank: number | null
          symbol: string
          total_supply: number | null
          updated_at: string | null
          volume_24h: number | null
        }
        Insert: {
          ath?: number | null
          atl?: number | null
          blockchain?: string | null
          category?: string | null
          change_24h?: number | null
          change_percentage_24h?: number | null
          circulating_supply?: number | null
          created_at?: string | null
          high_24h?: number | null
          id?: number
          last_updated?: string | null
          low_24h?: number | null
          market_cap?: number | null
          max_supply?: number | null
          name: string
          price_egp?: number | null
          price_usd?: number | null
          rank?: number | null
          symbol: string
          total_supply?: number | null
          updated_at?: string | null
          volume_24h?: number | null
        }
        Update: {
          ath?: number | null
          atl?: number | null
          blockchain?: string | null
          category?: string | null
          change_24h?: number | null
          change_percentage_24h?: number | null
          circulating_supply?: number | null
          created_at?: string | null
          high_24h?: number | null
          id?: number
          last_updated?: string | null
          low_24h?: number | null
          market_cap?: number | null
          max_supply?: number | null
          name?: string
          price_egp?: number | null
          price_usd?: number | null
          rank?: number | null
          symbol?: string
          total_supply?: number | null
          updated_at?: string | null
          volume_24h?: number | null
        }
        Relationships: []
      }
      currency_rates: {
        Row: {
          ask_rate: number | null
          base_currency: string
          bid_rate: number | null
          change_24h: number | null
          change_percentage_24h: number | null
          created_at: string | null
          exchange_rate: number
          high_24h: number | null
          id: number
          last_updated: string | null
          low_24h: number | null
          source: string
          target_currency: string
          updated_at: string | null
        }
        Insert: {
          ask_rate?: number | null
          base_currency: string
          bid_rate?: number | null
          change_24h?: number | null
          change_percentage_24h?: number | null
          created_at?: string | null
          exchange_rate: number
          high_24h?: number | null
          id?: number
          last_updated?: string | null
          low_24h?: number | null
          source: string
          target_currency: string
          updated_at?: string | null
        }
        Update: {
          ask_rate?: number | null
          base_currency?: string
          bid_rate?: number | null
          change_24h?: number | null
          change_percentage_24h?: number | null
          created_at?: string | null
          exchange_rate?: number
          high_24h?: number | null
          id?: number
          last_updated?: string | null
          low_24h?: number | null
          source?: string
          target_currency?: string
          updated_at?: string | null
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
      egypt_stocks: {
        Row: {
          change: number | null
          change_amount: number | null
          change_percent: number | null
          country: string | null
          created_at: string | null
          currency: string | null
          exchange: string | null
          high: number | null
          high_price: number | null
          id: number
          last_updated: string | null
          low: number | null
          low_price: number | null
          market_cap: number | null
          name: string
          open: number | null
          open_price: number | null
          previous_close: number | null
          price: number | null
          sector: string | null
          source: string | null
          status: string | null
          symbol: string
          turnover: number | null
          updated_at: string | null
          url: string | null
          volume: number | null
        }
        Insert: {
          change?: number | null
          change_amount?: number | null
          change_percent?: number | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          exchange?: string | null
          high?: number | null
          high_price?: number | null
          id?: number
          last_updated?: string | null
          low?: number | null
          low_price?: number | null
          market_cap?: number | null
          name: string
          open?: number | null
          open_price?: number | null
          previous_close?: number | null
          price?: number | null
          sector?: string | null
          source?: string | null
          status?: string | null
          symbol: string
          turnover?: number | null
          updated_at?: string | null
          url?: string | null
          volume?: number | null
        }
        Update: {
          change?: number | null
          change_amount?: number | null
          change_percent?: number | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          exchange?: string | null
          high?: number | null
          high_price?: number | null
          id?: number
          last_updated?: string | null
          low?: number | null
          low_price?: number | null
          market_cap?: number | null
          name?: string
          open?: number | null
          open_price?: number | null
          previous_close?: number | null
          price?: number | null
          sector?: string | null
          source?: string | null
          status?: string | null
          symbol?: string
          turnover?: number | null
          updated_at?: string | null
          url?: string | null
          volume?: number | null
        }
        Relationships: []
      }
      etfs: {
        Row: {
          benchmark: string | null
          category: string
          change_amount: number | null
          change_percent: number | null
          country: string
          created_at: string | null
          dividend_yield: number | null
          expense_ratio: number | null
          id: string
          last_updated: string | null
          market_cap: number | null
          name: string
          nav: number | null
          price: number
          symbol: string
          volume: number | null
        }
        Insert: {
          benchmark?: string | null
          category: string
          change_amount?: number | null
          change_percent?: number | null
          country: string
          created_at?: string | null
          dividend_yield?: number | null
          expense_ratio?: number | null
          id?: string
          last_updated?: string | null
          market_cap?: number | null
          name: string
          nav?: number | null
          price: number
          symbol: string
          volume?: number | null
        }
        Update: {
          benchmark?: string | null
          category?: string
          change_amount?: number | null
          change_percent?: number | null
          country?: string
          created_at?: string | null
          dividend_yield?: number | null
          expense_ratio?: number | null
          id?: string
          last_updated?: string | null
          market_cap?: number | null
          name?: string
          nav?: number | null
          price?: number
          symbol?: string
          volume?: number | null
        }
        Relationships: []
      }
      europe_etfs: {
        Row: {
          assets_under_management: number | null
          category: string | null
          change: number | null
          change_percentage: number | null
          country: string
          created_at: string | null
          currency: string
          dividend_yield: number | null
          domicile: string | null
          exchange: string | null
          expense_ratio: number | null
          fund_house: string | null
          fund_type: string | null
          id: number
          inception_date: string | null
          is_active: boolean | null
          last_updated: string | null
          name: string
          nav: number
          pe_ratio: number | null
          price: number | null
          symbol: string
          underlying_index: string | null
          updated_at: string | null
          volume: number | null
        }
        Insert: {
          assets_under_management?: number | null
          category?: string | null
          change?: number | null
          change_percentage?: number | null
          country: string
          created_at?: string | null
          currency: string
          dividend_yield?: number | null
          domicile?: string | null
          exchange?: string | null
          expense_ratio?: number | null
          fund_house?: string | null
          fund_type?: string | null
          id?: number
          inception_date?: string | null
          is_active?: boolean | null
          last_updated?: string | null
          name: string
          nav: number
          pe_ratio?: number | null
          price?: number | null
          symbol: string
          underlying_index?: string | null
          updated_at?: string | null
          volume?: number | null
        }
        Update: {
          assets_under_management?: number | null
          category?: string | null
          change?: number | null
          change_percentage?: number | null
          country?: string
          created_at?: string | null
          currency?: string
          dividend_yield?: number | null
          domicile?: string | null
          exchange?: string | null
          expense_ratio?: number | null
          fund_house?: string | null
          fund_type?: string | null
          id?: number
          inception_date?: string | null
          is_active?: boolean | null
          last_updated?: string | null
          name?: string
          nav?: number
          pe_ratio?: number | null
          price?: number | null
          symbol?: string
          underlying_index?: string | null
          updated_at?: string | null
          volume?: number | null
        }
        Relationships: []
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
      gold_prices: {
        Row: {
          change_amount: number | null
          change_percent: number | null
          country: string
          created_at: string | null
          currency: string
          exchange_rate: number | null
          global_gold_price_usd: number | null
          id: string
          karat: number
          last_updated: string | null
          market_premium: number | null
          name: string
          price_per_gram: number
          purity: number
          source: string | null
        }
        Insert: {
          change_amount?: number | null
          change_percent?: number | null
          country: string
          created_at?: string | null
          currency: string
          exchange_rate?: number | null
          global_gold_price_usd?: number | null
          id?: string
          karat: number
          last_updated?: string | null
          market_premium?: number | null
          name: string
          price_per_gram: number
          purity: number
          source?: string | null
        }
        Update: {
          change_amount?: number | null
          change_percent?: number | null
          country?: string
          created_at?: string | null
          currency?: string
          exchange_rate?: number | null
          global_gold_price_usd?: number | null
          id?: string
          karat?: number
          last_updated?: string | null
          market_premium?: number | null
          name?: string
          price_per_gram?: number
          purity?: number
          source?: string | null
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
      international_indices: {
        Row: {
          change: number | null
          change_percent: number | null
          country: string
          country_ar: string | null
          country_code: string
          created_at: string | null
          currency: string | null
          high: number | null
          id: number
          last_updated: string | null
          low: number | null
          market_cap: number | null
          name: string
          name_ar: string | null
          open: number | null
          region: string
          scraped_at: string | null
          source: string
          status: string | null
          symbol: string
          value: number | null
          volume: number | null
        }
        Insert: {
          change?: number | null
          change_percent?: number | null
          country: string
          country_ar?: string | null
          country_code: string
          created_at?: string | null
          currency?: string | null
          high?: number | null
          id?: number
          last_updated?: string | null
          low?: number | null
          market_cap?: number | null
          name: string
          name_ar?: string | null
          open?: number | null
          region: string
          scraped_at?: string | null
          source: string
          status?: string | null
          symbol: string
          value?: number | null
          volume?: number | null
        }
        Update: {
          change?: number | null
          change_percent?: number | null
          country?: string
          country_ar?: string | null
          country_code?: string
          created_at?: string | null
          currency?: string | null
          high?: number | null
          id?: number
          last_updated?: string | null
          low?: number | null
          market_cap?: number | null
          name?: string
          name_ar?: string | null
          open?: number | null
          region?: string
          scraped_at?: string | null
          source?: string
          status?: string | null
          symbol?: string
          value?: number | null
          volume?: number | null
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
      news_articles: {
        Row: {
          category: string | null
          country: string
          created_at: string | null
          full_text: string
          id: string
          keywords: string[] | null
          priority_score: number | null
          sentiment: string
          source_website: string | null
          sources: string[]
          summary: string
          title: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          category?: string | null
          country?: string
          created_at?: string | null
          full_text: string
          id?: string
          keywords?: string[] | null
          priority_score?: number | null
          sentiment: string
          source_website?: string | null
          sources: string[]
          summary: string
          title: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          category?: string | null
          country?: string
          created_at?: string | null
          full_text?: string
          id?: string
          keywords?: string[] | null
          priority_score?: number | null
          sentiment?: string
          source_website?: string | null
          sources?: string[]
          summary?: string
          title?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
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
      personalized_news_analysis: {
        Row: {
          analysis_content: string
          article_id: string
          created_at: string
          id: string
          impact_score: number | null
          recommendations: string | null
          relevance_score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_content: string
          article_id: string
          created_at?: string
          id?: string
          impact_score?: number | null
          recommendations?: string | null
          relevance_score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_content?: string
          article_id?: string
          created_at?: string
          id?: string
          impact_score?: number | null
          recommendations?: string | null
          relevance_score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      portfolio_goals: {
        Row: {
          asset_type: string | null
          created_at: string
          current_value: number | null
          goal_type: string
          id: string
          status: string | null
          target_date: string | null
          target_percentage: number | null
          target_value: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          asset_type?: string | null
          created_at?: string
          current_value?: number | null
          goal_type: string
          id?: string
          status?: string | null
          target_date?: string | null
          target_percentage?: number | null
          target_value: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          asset_type?: string | null
          created_at?: string
          current_value?: number | null
          goal_type?: string
          id?: string
          status?: string | null
          target_date?: string | null
          target_percentage?: number | null
          target_value?: number
          title?: string
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
      real_estate: {
        Row: {
          area_name: string
          avg_property_size: number | null
          avg_total_price: number | null
          city: string
          country: string
          created_at: string | null
          currency: string
          id: string
          last_updated: string | null
          market_activity: string | null
          monthly_change_percent: number | null
          price_per_sqm: number
          price_trend: string | null
          property_type: string
          rental_yield: number | null
          tier: string
        }
        Insert: {
          area_name: string
          avg_property_size?: number | null
          avg_total_price?: number | null
          city: string
          country: string
          created_at?: string | null
          currency: string
          id?: string
          last_updated?: string | null
          market_activity?: string | null
          monthly_change_percent?: number | null
          price_per_sqm: number
          price_trend?: string | null
          property_type: string
          rental_yield?: number | null
          tier: string
        }
        Update: {
          area_name?: string
          avg_property_size?: number | null
          avg_total_price?: number | null
          city?: string
          country?: string
          created_at?: string | null
          currency?: string
          id?: string
          last_updated?: string | null
          market_activity?: string | null
          monthly_change_percent?: number | null
          price_per_sqm?: number
          price_trend?: string | null
          property_type?: string
          rental_yield?: number | null
          tier?: string
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
      saudi_stocks: {
        Row: {
          change: number | null
          change_percent: number | null
          country: string | null
          created_at: string | null
          currency: string | null
          exchange: string | null
          high: number | null
          id: number
          last_updated: string | null
          low: number | null
          market_cap: number | null
          name: string
          name_ar: string | null
          open: number | null
          price: number | null
          sector: string | null
          source: string | null
          status: string | null
          symbol: string
          turnover: number | null
          url: string | null
          volume: number | null
        }
        Insert: {
          change?: number | null
          change_percent?: number | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          exchange?: string | null
          high?: number | null
          id?: number
          last_updated?: string | null
          low?: number | null
          market_cap?: number | null
          name: string
          name_ar?: string | null
          open?: number | null
          price?: number | null
          sector?: string | null
          source?: string | null
          status?: string | null
          symbol: string
          turnover?: number | null
          url?: string | null
          volume?: number | null
        }
        Update: {
          change?: number | null
          change_percent?: number | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          exchange?: string | null
          high?: number | null
          id?: number
          last_updated?: string | null
          low?: number | null
          market_cap?: number | null
          name?: string
          name_ar?: string | null
          open?: number | null
          price?: number | null
          sector?: string | null
          source?: string | null
          status?: string | null
          symbol?: string
          turnover?: number | null
          url?: string | null
          volume?: number | null
        }
        Relationships: []
      }
      uae_stocks: {
        Row: {
          change: number | null
          change_percent: number | null
          country: string | null
          created_at: string | null
          currency: string | null
          exchange: string | null
          high: number | null
          id: number
          last_updated: string | null
          low: number | null
          market_cap: number | null
          name: string
          name_ar: string | null
          open: number | null
          price: number | null
          sector: string | null
          source: string | null
          status: string | null
          symbol: string
          turnover: number | null
          url: string | null
          volume: number | null
        }
        Insert: {
          change?: number | null
          change_percent?: number | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          exchange?: string | null
          high?: number | null
          id?: number
          last_updated?: string | null
          low?: number | null
          market_cap?: number | null
          name: string
          name_ar?: string | null
          open?: number | null
          price?: number | null
          sector?: string | null
          source?: string | null
          status?: string | null
          symbol: string
          turnover?: number | null
          url?: string | null
          volume?: number | null
        }
        Update: {
          change?: number | null
          change_percent?: number | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          exchange?: string | null
          high?: number | null
          id?: number
          last_updated?: string | null
          low?: number | null
          market_cap?: number | null
          name?: string
          name_ar?: string | null
          open?: number | null
          price?: number | null
          sector?: string | null
          source?: string | null
          status?: string | null
          symbol?: string
          turnover?: number | null
          url?: string | null
          volume?: number | null
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          currency: string | null
          data_sharing: boolean | null
          email_notifications: boolean | null
          id: string
          language: string | null
          profile_visibility: string | null
          push_notifications: boolean | null
          sms_notifications: boolean | null
          theme: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          data_sharing?: boolean | null
          email_notifications?: boolean | null
          id?: string
          language?: string | null
          profile_visibility?: string | null
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          theme?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          data_sharing?: boolean | null
          email_notifications?: boolean | null
          id?: string
          language?: string | null
          profile_visibility?: string | null
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          theme?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      international_indices_by_region: {
        Row: {
          avg_change_percent: number | null
          country: string | null
          gainers: number | null
          index_count: number | null
          losers: number | null
          region: string | null
          unchanged: number | null
        }
        Relationships: []
      }
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
      cleanup_old_currency_rates: {
        Args: { keep_records?: number }
        Returns: number
      }
      cleanup_old_gold_prices: {
        Args: { keep_records?: number }
        Returns: number
      }
      get_bond_market_summary: {
        Args: Record<PropertyKey, never>
        Returns: {
          avg_coupon: number
          avg_yield: number
          corporate_bonds: number
          government_bonds: number
          sukuk_bonds: number
          total_bonds: number
          total_face_value: number
          treasury_bonds: number
        }[]
      }
      get_crypto_market_summary: {
        Args: Record<PropertyKey, never>
        Returns: {
          avg_change: number
          bitcoin_dominance: number
          negative_cryptos: number
          positive_cryptos: number
          total_cryptos: number
          total_market_cap: number
          total_volume_24h: number
        }[]
      }
      get_deposit_view: {
        Args: { p_deposit_id: string }
        Returns: Json
      }
      get_etf_performance_summary: {
        Args: Record<PropertyKey, never>
        Returns: {
          avg_change: number
          negative_etfs: number
          positive_etfs: number
          total_etfs: number
          total_market_cap: number
          total_volume: number
        }[]
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
