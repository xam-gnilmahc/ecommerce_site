export interface Product {
  id: number;
  name: string;
  description?: string | null;
  category?: string | null;
  brand?: string | null;
  rating?: number | null;
  reviews_count?: number | null;
  favourite?: number; // smallint in PostgreSQL is best represented as number
  type?: string | null;
  created_at?: string | null; // ISO timestamp as string
  is_active?: boolean;
  amount?: string | null;
  banner_url?: string | null;
  details_banner?: string | null;
}