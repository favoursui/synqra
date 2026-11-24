import type { ScanResult } from './workflow.ts';
export const HISTORY_LIMIT = 20;
export const RETENTION_DAYS = 30;
export type HistoryEntry = {
  id: string; at: string; kind: 'scan' | 'review';
  issues?: number; unavailable?: number; high?: number; medium?: number;
};
export function scanSummary(scan: ScanResult, id: string): HistoryEntry {
  return {id, at: scan.scannedAt, kind: 'scan', issues: scan.issues.length,
    unavailable: scan.failures.length, high: scan.findings.filter(f=>f.severity==='high').length,
    medium: scan.findings.filter(f=>f.severity==='medium').length};
}
export function reviewSummary(id: string, at: string): HistoryEntry { return {id, at, kind:'review'}; }
export function recentHistory(entries: HistoryEntry[], now = Date.now()): HistoryEntry[] {
  const cutoff = now - RETENTION_DAYS * 86400000;
  return entries.filter(e=>Date.parse(e.at)>cutoff && Date.parse(e.at)<=now)
    .sort((a,b)=>b.at.localeCompare(a.at)||a.id.localeCompare(b.id)).slice(0,HISTORY_LIMIT);
}
