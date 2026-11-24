import {test} from 'node:test';
import assert from 'node:assert/strict';
import {scanSummary,reviewSummary,recentHistory,HISTORY_LIMIT} from '../shared/history.ts';
import {assemble} from '../shared/workflow.ts';
import {sampleSpec,sampleIssue} from '../shared/engine.ts';
test('scan summary contains only counts and timestamps',()=>{
  const s=scanSummary(assemble(sampleSpec,[sampleIssue],[{issueId:'PRIVATE-1',message:'private'}]),'id');
  assert.deepEqual(Object.keys(s).sort(),['at','high','id','issues','kind','medium','unavailable']);
  assert.equal(s.high,2);assert.equal(s.medium,1);assert.equal(s.unavailable,1);
  assert.doesNotMatch(JSON.stringify(s),/CAD-102|PRIVATE-1|Trading|0\.5%/);
});
test('review summary stores no issue or comment content',()=>assert.deepEqual(reviewSummary('id','2026-11-24T00:00:00Z'),{id:'id',at:'2026-11-24T00:00:00Z',kind:'review'}));
test('history excludes expired, invalid and future timestamps',()=>{
  const now=Date.parse('2026-11-24T00:00:00Z');
  const rows=['2026-10-25T00:00:00Z','2026-11-24T00:00:01Z','invalid','2026-11-23T00:00:00Z'].map((at,i)=>reviewSummary(String(i),at));
  assert.deepEqual(recentHistory(rows,now).map(x=>x.id),['3']);
});
test('history is newest first and capped at the display limit',()=>{
  const now=Date.parse('2026-11-24T00:00:00Z');
  const rows=Array.from({length:30},(_,i)=>reviewSummary(String(i),new Date(now-i*1000).toISOString())).reverse();
  const result=recentHistory(rows,now);assert.equal(result.length,HISTORY_LIMIT);assert.equal(result[0].id,'0');assert.equal(result.at(-1)?.id,'19');
});
