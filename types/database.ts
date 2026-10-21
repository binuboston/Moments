
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "public": {
          Tables: {
            "event_categories": {
                  Row: {
                    "created_at": string,"description": string | null,"icon": string | null,"id": string,"is_active": boolean,"name": string,"slug": string,"sort_order": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"description"?: string | null,"icon"?: string | null,"id"?: string,"is_active"?: boolean,"name": string,"slug": string,"sort_order"?: number,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"description"?: string | null,"icon"?: string | null,"id"?: string,"is_active"?: boolean,"name"?: string,"slug"?: string,"sort_order"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"invitation_functions": {
                  Row: {
                    "address": string | null,"created_at": string,"description": string | null,"dress_code": string | null,"ends_at": string | null,"id": string,"invitation_id": string,"maps_url": string | null,"name": string,"sort_order": number,"starts_at": string,"timezone": string,"venue_name": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "address"?: string | null,"created_at"?: string,"description"?: string | null,"dress_code"?: string | null,"ends_at"?: string | null,"id"?: string,"invitation_id": string,"maps_url"?: string | null,"name": string,"sort_order"?: number,"starts_at": string,"timezone"?: string,"venue_name"?: string | null
                  }
                  Update: {
                    "address"?: string | null,"created_at"?: string,"description"?: string | null,"dress_code"?: string | null,"ends_at"?: string | null,"id"?: string,"invitation_id"?: string,"maps_url"?: string | null,"name"?: string,"sort_order"?: number,"starts_at"?: string,"timezone"?: string,"venue_name"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "invitation_functions_invitation_id_fkey"
      columns: ["invitation_id"]
isOneToOne: false
      referencedRelation: "invitations"
      referencedColumns: ["id"]
    }
                  ]
                },"invitation_media": {
                  Row: {
                    "alt": string | null,"created_at": string,"height": number | null,"id": string,"invitation_id": string,"is_uploaded": boolean,"kind": Database["public"]['Enums']["media_kind"],"mime_type": string,"owner_id": string,"size_bytes": number,"sort_order": number,"storage_path": string,"width": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "alt"?: string | null,"created_at"?: string,"height"?: number | null,"id"?: string,"invitation_id": string,"is_uploaded"?: boolean,"kind"?: Database["public"]['Enums']["media_kind"],"mime_type": string,"owner_id": string,"size_bytes": number,"sort_order"?: number,"storage_path": string,"width"?: number | null
                  }
                  Update: {
                    "alt"?: string | null,"created_at"?: string,"height"?: number | null,"id"?: string,"invitation_id"?: string,"is_uploaded"?: boolean,"kind"?: Database["public"]['Enums']["media_kind"],"mime_type"?: string,"owner_id"?: string,"size_bytes"?: number,"sort_order"?: number,"storage_path"?: string,"width"?: number | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "invitation_media_invitation_id_fkey"
      columns: ["invitation_id"]
isOneToOne: false
      referencedRelation: "invitations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "invitation_media_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"invitations": {
                  Row: {
                    "category_id": string,"content": NonNullable<Json>,"created_at": string,"expires_at": string | null,"id": string,"owner_id": string,"published_at": string | null,"search_text": string | null,"settings": NonNullable<Json>,"slug": string,"status": Database["public"]['Enums']["invitation_status"],"template_id": string,"theme": NonNullable<Json>,"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "category_id": string,"content"?: NonNullable<Json>,"created_at"?: string,"expires_at"?: string | null,"id"?: string,"owner_id": string,"published_at"?: string | null,"search_text"?: never,"settings"?: NonNullable<Json>,"slug": string,"status"?: Database["public"]['Enums']["invitation_status"],"template_id": string,"theme"?: NonNullable<Json>,"title"?: string,"updated_at"?: string
                  }
                  Update: {
                    "category_id"?: string,"content"?: NonNullable<Json>,"created_at"?: string,"expires_at"?: string | null,"id"?: string,"owner_id"?: string,"published_at"?: string | null,"search_text"?: never,"settings"?: NonNullable<Json>,"slug"?: string,"status"?: Database["public"]['Enums']["invitation_status"],"template_id"?: string,"theme"?: NonNullable<Json>,"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "invitations_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "event_categories"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "invitations_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "invitations_template_id_fkey"
      columns: ["template_id"]
isOneToOne: false
      referencedRelation: "templates"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "avatar_url": string | null,"created_at": string,"full_name": string,"id": string,"plan": Database["public"]['Enums']["plan_tier"],"role": Database["public"]['Enums']["user_role"],"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "avatar_url"?: string | null,"created_at"?: string,"full_name"?: string,"id": string,"plan"?: Database["public"]['Enums']["plan_tier"],"role"?: Database["public"]['Enums']["user_role"],"updated_at"?: string
                  }
                  Update: {
                    "avatar_url"?: string | null,"created_at"?: string,"full_name"?: string,"id"?: string,"plan"?: Database["public"]['Enums']["plan_tier"],"role"?: Database["public"]['Enums']["user_role"],"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"rsvps": {
                  Row: {
                    "attendance": Database["public"]['Enums']["attendance"],"contact": string | null,"created_at": string,"dietary_notes": string | null,"guest_count": number,"guest_name": string,"id": string,"invitation_id": string,"ip_hash": string | null,"message": string | null,"submission_key": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "attendance": Database["public"]['Enums']["attendance"],"contact"?: string | null,"created_at"?: string,"dietary_notes"?: string | null,"guest_count"?: number,"guest_name": string,"id"?: string,"invitation_id": string,"ip_hash"?: string | null,"message"?: string | null,"submission_key": string,"updated_at"?: string
                  }
                  Update: {
                    "attendance"?: Database["public"]['Enums']["attendance"],"contact"?: string | null,"created_at"?: string,"dietary_notes"?: string | null,"guest_count"?: number,"guest_name"?: string,"id"?: string,"invitation_id"?: string,"ip_hash"?: string | null,"message"?: string | null,"submission_key"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "rsvps_invitation_id_fkey"
      columns: ["invitation_id"]
isOneToOne: false
      referencedRelation: "invitations"
      referencedColumns: ["id"]
    }
                  ]
                },"templates": {
                  Row: {
                    "category_slugs": (string)[],"created_at": string,"description": string | null,"id": string,"is_featured": boolean,"name": string,"renderer_key": string,"slug": string,"sort_order": number,"status": Database["public"]['Enums']["template_status"],"tier": Database["public"]['Enums']["template_tier"],"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "category_slugs"?: (string)[],"created_at"?: string,"description"?: string | null,"id"?: string,"is_featured"?: boolean,"name": string,"renderer_key": string,"slug": string,"sort_order"?: number,"status"?: Database["public"]['Enums']["template_status"],"tier"?: Database["public"]['Enums']["template_tier"],"updated_at"?: string
                  }
                  Update: {
                    "category_slugs"?: (string)[],"created_at"?: string,"description"?: string | null,"id"?: string,"is_featured"?: boolean,"name"?: string,"renderer_key"?: string,"slug"?: string,"sort_order"?: number,"status"?: Database["public"]['Enums']["template_status"],"tier"?: Database["public"]['Enums']["template_tier"],"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "invitation_is_published":
{ Args: { "p_invitation_id": string }; Returns: boolean
                           },
"is_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"is_guest":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"owns_invitation":
{ Args: { "p_invitation_id": string }; Returns: boolean
                           },
"purge_stale_guests":
{ Args: { "p_older_than"?: string }; Returns: number
                           },
"rsvp_summary":
{ Args: { "p_invitation_id": string }; Returns: {
              "guests": number,"maybe": number,"no": number,"total": number,"yes": number
            }[]
                           },
"slug_available":
{ Args: { "p_exclude_id"?: string,"p_slug": string }; Returns: boolean
                           },
"submit_rsvp":
{ Args: { "p_attendance": Database["public"]['Enums']["attendance"],"p_contact": string,"p_dietary_notes": string,"p_guest_count": number,"p_guest_name": string,"p_ip_hash": string,"p_message": string,"p_slug": string }; Returns: Json
                           },
"try_uuid":
{ Args: { "p": string }; Returns: string
                           }
          }
          Enums: {
            "attendance": "yes"|"no"|"maybe","invitation_status": "draft"|"published"|"unpublished","media_kind": "cover"|"gallery","plan_tier": "free"|"pro","template_status": "draft"|"published"|"archived","template_tier": "free"|"premium","user_role": "user"|"admin"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "public": {
          Enums: {
            "attendance": ["yes", "no", "maybe"],"invitation_status": ["draft", "published", "unpublished"],"media_kind": ["cover", "gallery"],"plan_tier": ["free", "pro"],"template_status": ["draft", "published", "archived"],"template_tier": ["free", "premium"],"user_role": ["user", "admin"]
          }
        }
} as const
