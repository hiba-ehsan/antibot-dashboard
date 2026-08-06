import { proxyFetch } from "./api";

export interface OsintResult {
  ipAddress: string;
  abuseConfidenceScore: number;
  countryCode: string;
  usageType: string;
  isp: string;
  isTor: boolean;
  totalReports: number;
}

export async function lookupIp(ip: string): Promise<OsintResult> {
  return proxyFetch<OsintResult>(`/api/v1/osint?ip=${encodeURIComponent(ip)}`);
}
