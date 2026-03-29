export type LoveNote = {
  id: string;
  content: string;
  created_at: string;
};

export type UserSettings = {
  theme: "rose" | "dusk";
  notifications_enabled: boolean;
};
