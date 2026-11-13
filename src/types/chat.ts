export interface ChatMessageItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  unresolved?: boolean;
  reason?: string;
  category?: string;
}

export interface SuggestionChip {
  id: string;
  label: string;
  query: string;
  iconType: "location" | "requirements" | "coins" | "calendar" | "support";
}
