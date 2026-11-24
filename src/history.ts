import {createHash, randomUUID} from 'node:crypto';
import {kvs, WhereConditions} from '@forge/kvs';
import {HISTORY_LIMIT, RETENTION_DAYS, recentHistory, type HistoryEntry} from '../shared/history';
export const newHistoryId = randomUUID;
function prefix(accountId: unknown): string {
  if(typeof accountId!=='string'||!accountId.trim()||accountId==='unidentified') throw Error('Sign in to view personal history.');
  return 'history:v1:'+createHash('sha256').update(accountId).digest('hex')+':';
}
export async function saveHistory(accountId: unknown, entry: HistoryEntry): Promise<boolean> {
  try {
    const reverse = String(Number.MAX_SAFE_INTEGER-Date.parse(entry.at)).padStart(16,'0');
    await kvs.set(prefix(accountId)+reverse+':'+entry.id, entry, {ttl:{unit:'DAYS',value:RETENTION_DAYS}});
    return true;
  } catch { return false; }
}
export async function listHistory(accountId: unknown): Promise<HistoryEntry[]> {
  const page = await kvs.query().where('key',WhereConditions.beginsWith(prefix(accountId))).limit(HISTORY_LIMIT).getMany();
  return recentHistory(page.results.map(r=>r.value as HistoryEntry));
}
