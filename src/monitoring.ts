import {createHash} from 'node:crypto';
import {kvs} from '@forge/kvs';
import {resource,eventResource,watchActive,monitoringState} from '../shared/monitoring.mjs';
type Resource={kind:'jira'|'confluence';id:string};
const ttl={unit:'DAYS' as const,value:30};
const key=(type:'watch'|'event',r:Resource)=>'monitor:v1:'+type+':'+createHash('sha256').update(r.kind+':'+r.id).digest('hex');
function pair(pageId:unknown,issueId:unknown):Resource[]{
 const p=resource('confluence',pageId),i=resource('jira',issueId);
 if(!p||!i)throw Error('Missing stable source identifier.');
 return [p,i] as Resource[];
}
// Register only resources that were successfully read by the current user.
export async function registerMonitoring(pageId:unknown,issueId:unknown):Promise<boolean>{
 try{
  const refs=pair(pageId,issueId),expiresAt=Date.now()+30*86400000;
  await Promise.all(refs.map(r=>kvs.set(key('watch',r),{expiresAt},{ttl})));
  return true;
 }catch{return false;}
}
// Forge event handler. Do not store, log, or fetch the source content.
export async function recordSourceUpdate(event:unknown){
 const ref=eventResource(event) as Resource|null;
 if(!ref)return;
 const now=Date.now();
 if(!watchActive(await kvs.get(key('watch',ref)),now))return;
 // Receipt time is deliberately conservative: delayed or duplicate events may flag a newer receipt.
 await kvs.set(key('event',ref),{receivedAt:now},{ttl});
}
// Call only after verifying current access to BOTH resources.
export async function checkMonitoring(pageId:unknown,issueId:unknown,savedAt:string){
 try{
  const refs=pair(pageId,issueId);
  const [watches,events]=await Promise.all([
   Promise.all(refs.map(r=>kvs.get(key('watch',r)))),
   Promise.all(refs.map(r=>kvs.get(key('event',r))))
  ]);
  return monitoringState(watches,events,savedAt,Date.now());
 }catch{return 'unavailable';}
}
