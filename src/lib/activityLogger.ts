export type EntityType = "procedure" | "work_order";
export type ActionType = "create" | "update" | "delete" | "complete" | "archive" | "restore";

export interface LocalLogEntry {
  id: string;
  action: ActionType;
  entity_type: EntityType;
  entity_id: string | null;
  details: Record<string, string | number | boolean | null>;
  created_at: string;
}

const STORAGE_KEY = "activity_logs_local";
const MAX_LOGS = 200;

const getLogsFromStorage = (): LocalLogEntry[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveLogsToStorage = (logs: LocalLogEntry[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs.slice(0, MAX_LOGS)));
};

export const logActivity = (
  action: ActionType,
  entityType: EntityType,
  entityId?: string,
  details?: Record<string, string | number | boolean | null>
) => {
  try {
    const logs = getLogsFromStorage();
    const newEntry: LocalLogEntry = {
      id: crypto.randomUUID(),
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      details: details || {},
      created_at: new Date().toISOString(),
    };
    logs.unshift(newEntry);
    saveLogsToStorage(logs);
    // Dispatch event so ActivityLog component updates in real-time
    window.dispatchEvent(new CustomEvent("activity_log_updated"));
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

export const getActivityLogs = (): LocalLogEntry[] => {
  return getLogsFromStorage();
};

export const clearActivityLogs = () => {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("activity_log_updated"));
};
