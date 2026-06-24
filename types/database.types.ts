/**
 * database.types.ts
 * ------------------------------------------------------------------
 * Bản phản chiếu (mirror) THỦ CÔNG của `database/schema.sql`, viết theo
 * ĐÚNG định dạng đầy đủ mà `supabase gen types typescript` đời mới sinh ra:
 *   - `Database` + `Relationships` có `isOneToOne`.
 *   - Bộ helper generic chuẩn (Tables/TablesInsert/TablesUpdate/Enums/CompositeTypes).
 *   - `export const Constants` (mảng enum dùng ở runtime).
 *
 * => NGUỒN SỰ THẬT về hình dạng dữ liệu khi CHƯA có Supabase chạy.
 *
 * Khi Supabase đã sẵn sàng:
 *   supabase gen types typescript --project-id <id> > types/database.types.ts
 * rồi `git diff`. Sai khác DUY NHẤT có thể xuất hiện là:
 *   1) Khối `__InternalSupabase: { PostgrestVersion: "…" }` mà gen tự thêm
 *      (giá trị phụ thuộc môi trường, không thể biết trước — bộ helper bên dưới
 *       đã dùng `Omit<Database,"__InternalSupabase">` nên thêm khối đó KHÔNG phá vỡ gì).
 *   2) Tên ràng buộc FK nếu DB đặt khác quy ước mặc định của Postgres.
 * Mọi field Row/Insert/Update + Enums + isOneToOne ở đây đã khớp schema.
 * ------------------------------------------------------------------
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      // ---------------------------------------------------------------
      provinces: {
        Row: {
          id: string;
          name_vi: string;
          name_en: string;
          slug: string;
          aliases: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          name_vi: string;
          name_en: string;
          slug: string;
          aliases?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          name_vi?: string;
          name_en?: string;
          slug?: string;
          aliases?: string[];
          created_at?: string;
        };
        Relationships: [];
      };
      // ---------------------------------------------------------------
      ranges: {
        Row: {
          id: string;
          name_vi: string;
          name_en: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name_vi: string;
          name_en: string;
          slug: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name_vi?: string;
          name_en?: string;
          slug?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      // ---------------------------------------------------------------
      mountains: {
        Row: {
          id: string;
          range_id: string | null;
          name_vi: string;
          name_en: string;
          slug: string;
          elevation_m: number | null;
          lat: number | null;
          lng: number | null;
          region: Database["public"]["Enums"]["region"] | null;
          status: Database["public"]["Enums"]["mountain_status"];
          difficulty: number | null;
          rank: number | null;
          summary_vi: string | null;
          summary_en: string | null;
          cover_image_url: string | null;
          last_verified_at: string | null;
          created_at: string;
          updated_at: string;
          /** tsvector generated stored — chỉ đọc, không bao giờ SELECT trực tiếp. */
          search_tsv: unknown;
        };
        Insert: {
          id?: string;
          range_id?: string | null;
          name_vi: string;
          name_en: string;
          slug: string;
          elevation_m?: number | null;
          lat?: number | null;
          lng?: number | null;
          region?: Database["public"]["Enums"]["region"] | null;
          status?: Database["public"]["Enums"]["mountain_status"];
          difficulty?: number | null;
          rank?: number | null;
          summary_vi?: string | null;
          summary_en?: string | null;
          cover_image_url?: string | null;
          last_verified_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          range_id?: string | null;
          name_vi?: string;
          name_en?: string;
          slug?: string;
          elevation_m?: number | null;
          lat?: number | null;
          lng?: number | null;
          region?: Database["public"]["Enums"]["region"] | null;
          status?: Database["public"]["Enums"]["mountain_status"];
          difficulty?: number | null;
          rank?: number | null;
          summary_vi?: string | null;
          summary_en?: string | null;
          cover_image_url?: string | null;
          last_verified_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "mountains_range_id_fkey";
            columns: ["range_id"];
            isOneToOne: false;
            referencedRelation: "ranges";
            referencedColumns: ["id"];
          },
        ];
      };
      // ---------------------------------------------------------------
      mountain_provinces: {
        Row: {
          mountain_id: string;
          province_id: string;
        };
        Insert: {
          mountain_id: string;
          province_id: string;
        };
        Update: {
          mountain_id?: string;
          province_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "mountain_provinces_mountain_id_fkey";
            columns: ["mountain_id"];
            isOneToOne: false;
            referencedRelation: "mountains";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mountain_provinces_province_id_fkey";
            columns: ["province_id"];
            isOneToOne: false;
            referencedRelation: "provinces";
            referencedColumns: ["id"];
          },
        ];
      };
      // ---------------------------------------------------------------
      routes: {
        Row: {
          id: string;
          mountain_id: string;
          name_vi: string;
          name_en: string;
          slug: string;
          start_point: string | null;
          end_point: string | null;
          description_vi: string | null;
          description_en: string | null;
          distance_km: number | null;
          elevation_gain_m: number | null;
          duration_days: number | null;
          difficulty_level: number | null;
          best_season: string | null;
          permit_required: boolean;
          guide_required: boolean;
          gpx_url: string | null;
          audience: Database["public"]["Enums"]["route_audience"] | null;
          last_verified_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          mountain_id: string;
          name_vi: string;
          name_en: string;
          slug: string;
          start_point?: string | null;
          end_point?: string | null;
          description_vi?: string | null;
          description_en?: string | null;
          distance_km?: number | null;
          elevation_gain_m?: number | null;
          duration_days?: number | null;
          difficulty_level?: number | null;
          best_season?: string | null;
          permit_required?: boolean;
          guide_required?: boolean;
          gpx_url?: string | null;
          audience?: Database["public"]["Enums"]["route_audience"] | null;
          last_verified_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          mountain_id?: string;
          name_vi?: string;
          name_en?: string;
          slug?: string;
          start_point?: string | null;
          end_point?: string | null;
          description_vi?: string | null;
          description_en?: string | null;
          distance_km?: number | null;
          elevation_gain_m?: number | null;
          duration_days?: number | null;
          difficulty_level?: number | null;
          best_season?: string | null;
          permit_required?: boolean;
          guide_required?: boolean;
          gpx_url?: string | null;
          audience?: Database["public"]["Enums"]["route_audience"] | null;
          last_verified_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "routes_mountain_id_fkey";
            columns: ["mountain_id"];
            isOneToOne: false;
            referencedRelation: "mountains";
            referencedColumns: ["id"];
          },
        ];
      };
      // ---------------------------------------------------------------
      waypoints: {
        Row: {
          id: string;
          route_id: string;
          name_vi: string | null;
          name_en: string | null;
          type: Database["public"]["Enums"]["waypoint_type"];
          lat: number | null;
          lng: number | null;
          notes_vi: string | null;
          notes_en: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          route_id: string;
          name_vi?: string | null;
          name_en?: string | null;
          type?: Database["public"]["Enums"]["waypoint_type"];
          lat?: number | null;
          lng?: number | null;
          notes_vi?: string | null;
          notes_en?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          route_id?: string;
          name_vi?: string | null;
          name_en?: string | null;
          type?: Database["public"]["Enums"]["waypoint_type"];
          lat?: number | null;
          lng?: number | null;
          notes_vi?: string | null;
          notes_en?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "waypoints_route_id_fkey";
            columns: ["route_id"];
            isOneToOne: false;
            referencedRelation: "routes";
            referencedColumns: ["id"];
          },
        ];
      };
      // ---------------------------------------------------------------
      articles: {
        Row: {
          id: string;
          mountain_id: string | null;
          title_vi: string;
          title_en: string;
          slug: string;
          body_vi: string | null;
          body_en: string | null;
          type: Database["public"]["Enums"]["article_type"];
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          mountain_id?: string | null;
          title_vi: string;
          title_en: string;
          slug: string;
          body_vi?: string | null;
          body_en?: string | null;
          type?: Database["public"]["Enums"]["article_type"];
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          mountain_id?: string | null;
          title_vi?: string;
          title_en?: string;
          slug?: string;
          body_vi?: string | null;
          body_en?: string | null;
          type?: Database["public"]["Enums"]["article_type"];
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "articles_mountain_id_fkey";
            columns: ["mountain_id"];
            isOneToOne: false;
            referencedRelation: "mountains";
            referencedColumns: ["id"];
          },
        ];
      };
      // ---------------------------------------------------------------
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          // id = auth.users.id, KHÔNG có default => bắt buộc khi tạo.
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      // ---------------------------------------------------------------
      comments: {
        Row: {
          id: string;
          user_id: string;
          mountain_id: string | null;
          route_id: string | null;
          body: string;
          status: Database["public"]["Enums"]["ugc_status"];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mountain_id?: string | null;
          route_id?: string | null;
          body: string;
          status?: Database["public"]["Enums"]["ugc_status"];
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          mountain_id?: string | null;
          route_id?: string | null;
          body?: string;
          status?: Database["public"]["Enums"]["ugc_status"];
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_mountain_id_fkey";
            columns: ["mountain_id"];
            isOneToOne: false;
            referencedRelation: "mountains";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_route_id_fkey";
            columns: ["route_id"];
            isOneToOne: false;
            referencedRelation: "routes";
            referencedColumns: ["id"];
          },
        ];
      };
      // ---------------------------------------------------------------
      photos: {
        Row: {
          id: string;
          user_id: string;
          mountain_id: string | null;
          route_id: string | null;
          url: string;
          caption: string | null;
          status: Database["public"]["Enums"]["ugc_status"];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mountain_id?: string | null;
          route_id?: string | null;
          url: string;
          caption?: string | null;
          status?: Database["public"]["Enums"]["ugc_status"];
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          mountain_id?: string | null;
          route_id?: string | null;
          url?: string;
          caption?: string | null;
          status?: Database["public"]["Enums"]["ugc_status"];
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "photos_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "photos_mountain_id_fkey";
            columns: ["mountain_id"];
            isOneToOne: false;
            referencedRelation: "mountains";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "photos_route_id_fkey";
            columns: ["route_id"];
            isOneToOne: false;
            referencedRelation: "routes";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      f_unaccent: {
        Args: { "": string };
        Returns: string;
      };
    };
    Enums: {
      region: "north" | "central" | "south";
      mountain_status: "open" | "restricted" | "permit" | "closed";
      route_audience: "beginner" | "intermediate" | "advanced";
      waypoint_type: "camp" | "water" | "viewpoint" | "marker" | "gate" | "other";
      article_type: "guide" | "gear" | "safety" | "general";
      ugc_status: "pending" | "approved" | "rejected";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// ============================================================
// Bộ helper generic — sao đúng từ output `supabase gen types`.
// `Omit<Database,"__InternalSupabase">` đảm bảo vẫn chạy đúng dù gen
// có thêm khối __InternalSupabase hay không.
// ============================================================

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof DatabaseWithoutInternals, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      region: ["north", "central", "south"],
      mountain_status: ["open", "restricted", "permit", "closed"],
      route_audience: ["beginner", "intermediate", "advanced"],
      waypoint_type: ["camp", "water", "viewpoint", "marker", "gate", "other"],
      article_type: ["guide", "gear", "safety", "general"],
      ugc_status: ["pending", "approved", "rejected"],
    },
  },
} as const;
