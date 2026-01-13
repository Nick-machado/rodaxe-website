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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      acoes: {
        Row: {
          atualizado_em: string | null
          cliente_id: string | null
          criado_em: string | null
          custo: number | null
          data_fim: string | null
          data_inicio: string
          descricao: string
          id: string
          trabalho_id: string | null
        }
        Insert: {
          atualizado_em?: string | null
          cliente_id?: string | null
          criado_em?: string | null
          custo?: number | null
          data_fim?: string | null
          data_inicio: string
          descricao: string
          id?: string
          trabalho_id?: string | null
        }
        Update: {
          atualizado_em?: string | null
          cliente_id?: string | null
          criado_em?: string | null
          custo?: number | null
          data_fim?: string | null
          data_inicio?: string
          descricao?: string
          id?: string
          trabalho_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "acoes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acoes_trabalho_id_fkey"
            columns: ["trabalho_id"]
            isOneToOne: false
            referencedRelation: "trabalhos"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          atualizado_em: string | null
          criado_em: string | null
          documento: string
          email: string | null
          endereco: string | null
          id: string
          nome_ou_razao: string
          telefone: string | null
          whatsapp: boolean | null
        }
        Insert: {
          atualizado_em?: string | null
          criado_em?: string | null
          documento: string
          email?: string | null
          endereco?: string | null
          id?: string
          nome_ou_razao: string
          telefone?: string | null
          whatsapp?: boolean | null
        }
        Update: {
          atualizado_em?: string | null
          criado_em?: string | null
          documento?: string
          email?: string | null
          endereco?: string | null
          id?: string
          nome_ou_razao?: string
          telefone?: string | null
          whatsapp?: boolean | null
        }
        Relationships: []
      }
      custos: {
        Row: {
          atualizado_em: string | null
          categoria: string
          cliente_id: string | null
          criado_em: string | null
          data: string
          descricao: string | null
          id: string
          valor: number
        }
        Insert: {
          atualizado_em?: string | null
          categoria: string
          cliente_id?: string | null
          criado_em?: string | null
          data: string
          descricao?: string | null
          id?: string
          valor: number
        }
        Update: {
          atualizado_em?: string | null
          categoria?: string
          cliente_id?: string | null
          criado_em?: string | null
          data?: string
          descricao?: string | null
          id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "custos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      niches: {
        Row: {
          created_at: string
          description: string | null
          featured_image_url: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          featured_image_url?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          featured_image_url?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_media: {
        Row: {
          created_at: string
          id: string
          project_id: string
          sort_order: number
          thumbnail_url: string | null
          title: string | null
          type: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          sort_order?: number
          thumbnail_url?: string | null
          title?: string | null
          type?: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          sort_order?: number
          thumbnail_url?: string | null
          title?: string | null
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_media_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "portfolio_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_projects: {
        Row: {
          cover_image_url: string
          created_at: string
          description: string | null
          id: string
          is_published: boolean
          location: string | null
          project_date: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          cover_image_url: string
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          location?: string | null
          project_date?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          cover_image_url?: string
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          location?: string | null
          project_date?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      recebimentos: {
        Row: {
          atualizado_em: string | null
          cliente_id: string | null
          criado_em: string | null
          data: string
          descricao: string | null
          forma_pagamento: Database["public"]["Enums"]["forma_pagamento"]
          id: string
          status: Database["public"]["Enums"]["status_recebimento"]
          trabalho_id: string | null
          valor: number
        }
        Insert: {
          atualizado_em?: string | null
          cliente_id?: string | null
          criado_em?: string | null
          data: string
          descricao?: string | null
          forma_pagamento: Database["public"]["Enums"]["forma_pagamento"]
          id?: string
          status?: Database["public"]["Enums"]["status_recebimento"]
          trabalho_id?: string | null
          valor: number
        }
        Update: {
          atualizado_em?: string | null
          cliente_id?: string | null
          criado_em?: string | null
          data?: string
          descricao?: string | null
          forma_pagamento?: Database["public"]["Enums"]["forma_pagamento"]
          id?: string
          status?: Database["public"]["Enums"]["status_recebimento"]
          trabalho_id?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "recebimentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recebimentos_trabalho_id_fkey"
            columns: ["trabalho_id"]
            isOneToOne: false
            referencedRelation: "trabalhos"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      trabalhos: {
        Row: {
          arquivos_finais: Json | null
          atualizado_em: string | null
          briefing_anexos: Json | null
          briefing_texto: string | null
          cliente_id: string | null
          criado_em: string | null
          data_conclusao: string | null
          data_entrega_prevista: string | null
          data_inicio: string | null
          descricao: string | null
          id: string
          status: Database["public"]["Enums"]["status_trabalho"]
          titulo: string
          valor_estimado: number | null
          valor_recebido: number | null
        }
        Insert: {
          arquivos_finais?: Json | null
          atualizado_em?: string | null
          briefing_anexos?: Json | null
          briefing_texto?: string | null
          cliente_id?: string | null
          criado_em?: string | null
          data_conclusao?: string | null
          data_entrega_prevista?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          status?: Database["public"]["Enums"]["status_trabalho"]
          titulo: string
          valor_estimado?: number | null
          valor_recebido?: number | null
        }
        Update: {
          arquivos_finais?: Json | null
          atualizado_em?: string | null
          briefing_anexos?: Json | null
          briefing_texto?: string | null
          cliente_id?: string | null
          criado_em?: string | null
          data_conclusao?: string | null
          data_entrega_prevista?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          status?: Database["public"]["Enums"]["status_trabalho"]
          titulo?: string
          valor_estimado?: number | null
          valor_recebido?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trabalhos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      unique_links: {
        Row: {
          alvo_id: string
          criado_em: string
          expira_em: string | null
          id: string
          tipo: string
          token: string
          url: string | null
        }
        Insert: {
          alvo_id: string
          criado_em?: string
          expira_em?: string | null
          id?: string
          tipo: string
          token?: string
          url?: string | null
        }
        Update: {
          alvo_id?: string
          criado_em?: string
          expira_em?: string | null
          id?: string
          tipo?: string
          token?: string
          url?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      video_niches: {
        Row: {
          created_at: string
          id: string
          niche_id: string
          video_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          niche_id: string
          video_id: string
        }
        Update: {
          created_at?: string
          id?: string
          niche_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_niches_niche_id_fkey"
            columns: ["niche_id"]
            isOneToOne: false
            referencedRelation: "niches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_niches_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      video_tags: {
        Row: {
          created_at: string
          id: string
          tag_id: string
          video_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          tag_id: string
          video_id: string
        }
        Update: {
          created_at?: string
          id?: string
          tag_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_tags_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          created_at: string
          description: string | null
          id: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      forma_pagamento:
        | "dinheiro"
        | "cartao"
        | "pix"
        | "transferencia"
        | "boleto"
        | "outro"
      status_recebimento: "pendente" | "pago" | "cancelado"
      status_trabalho:
        | "novo"
        | "em_andamento"
        | "aguardando_cliente"
        | "aguardando_pagamento"
        | "concluido"
        | "cancelado"
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
    Enums: {
      app_role: ["admin", "user"],
      forma_pagamento: [
        "dinheiro",
        "cartao",
        "pix",
        "transferencia",
        "boleto",
        "outro",
      ],
      status_recebimento: ["pendente", "pago", "cancelado"],
      status_trabalho: [
        "novo",
        "em_andamento",
        "aguardando_cliente",
        "aguardando_pagamento",
        "concluido",
        "cancelado",
      ],
    },
  },
} as const
