import { supabase } from "@/integrations/supabase/client";

export type EntityType = "procedure" | "work_order";
export type ActionType = "create" | "update" | "delete" | "complete" | "archive" | "restore";

export const logActivity = async (
  action: ActionType,
  entityType: EntityType,
  entityId?: string,
  details?: Record<string, string | number | boolean | null>
) => {
  try {
    await supabase.from("activity_logs").insert([{
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      details: details || {},
    }]);
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};
