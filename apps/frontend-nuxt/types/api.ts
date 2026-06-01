export type ApiUser = {
  id: number;
  name: string;
  email: string;
  role: string | null;
};

export type ApiCity = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  status: "draft" | "published";
  category: string | null;
  landmarks_count?: number;
  landmarks?: ApiLandmark[];
};

export type ApiPaginated<T> = {
  data: T[];
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
};

export type ApiLandmark = {
  id: number;
  city_id: number;
  external_id: string | null;
  name: string;
  description: string | null;
  categories: string[];
  category_names: string[];
  latitude: number | null;
  longitude: number | null;
  google_maps_url: string | null;
  images: string[];
  sort_order: number;
  is_active: boolean;
  city?: {
    id: number;
    slug: string;
    name: string;
  };
};

export type ApiStatsCityBreakdown = {
  name: string;
  name_en: string | null;
  slug: string;
  landmarks_count: number;
  map_views_count: number;
  avg_lat: number | null;
  avg_lng: number | null;
};

export type ApiStatsCategoryBreakdown = {
  name: string;
  count: number;
};

export type ApiStatsOverview = {
  cities_count: number;
  landmarks_count: number;
  map_views_count: number;
  active_landmarks_count: number;
  cities_breakdown: ApiStatsCityBreakdown[];
  category_breakdown: ApiStatsCategoryBreakdown[];
  monthly_views: number[];
};
