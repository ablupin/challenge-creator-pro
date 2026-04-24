export interface Influencer {
  id: string;
  name: string;
  handle: string | null;
  niche: string | null;
  brand_color: string;
  created_at: string;
}

export interface ChallengeRecord {
  id: string;
  influencer_id: string;
  title: string;
  type: "food" | "fitness";
  drop_date: string;
  expiry_date: string;
  status: "draft" | "active" | "expired";
  plan_json: any | null;
  pdf_url: string | null;
  notes: string | null;
  created_at: string;
  influencer?: Influencer;
}
