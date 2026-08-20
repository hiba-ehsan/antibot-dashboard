import { proxyFetch } from "./api";

export interface GoogleMapsResult {
  name: string;
  rating: string;
  reviews: string;
  address: string;
  phone: string;
  website: string;
  hours: string;
  category: string;
  imageUrl: string;
}

export interface GoogleMapsResponse {
  query: string;
  location: string;
  results: GoogleMapsResult[];
  resultCount: number;
  sessionId: string;
  telemetry: {
    delta_ms: number;
    risk_score: number;
    is_throttled: boolean;
    proxy_abuse_score: number;
  };
}

export async function runGoogleMaps(
  query: string,
  location: string,
  maxResults: number,
): Promise<GoogleMapsResponse> {
  return proxyFetch<GoogleMapsResponse>("/api/v1/scrapers/google-maps", {
    method: "POST",
    body: JSON.stringify({ query, location, maxResults }),
  });
}
