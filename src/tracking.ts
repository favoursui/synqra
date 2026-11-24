import {createHash} from 'node:crypto';
import {kvs,WhereConditions} from '@forge/kvs';
import {recordIdentity,isFresh,validToken} from '../shared/tracking.mjs';

export type TrackedRecord={pageId:string;issueKey:string;field:string;savedAt:string};
const hash=(value:string)=>createHash('sha256').update(value).digest('hex');
function prefix(accountId:unknown){
 if(typeof accountId!=='string'||!accountId.trim()||accountId==='unidentified')throw Error('Sign in to manage saved findings.');
 return 'tracked:v1:'+hash(accountId)+':';
}
export async function saveTracked(accountId:unknown,record:TrackedRecord){
 const token=hash(recordIdentity(record));
 await kvs.set(prefix(accountId)+token,record,{ttl:{unit:'DAYS',value:30}});
 return token;
}
export async function listTracked(accountId:unknown,cursor:unknown){
 const root=prefix(accountId);
 if(cursor!==undefined&&cursor!==null&&(typeof cursor!=='string'||!cursor.length||cursor.length>4096))throw Error('Invalid history cursor.');
 let query=kvs.query().where('key',WhereConditions.beginsWith(root)).limit(5);
 if(typeof cursor==='string')query=query.cursor(cursor);
 const result=await query.getMany();
 const entries=result.results.flatMap(row=>{
  if(!row.key.startsWith(root))return [];
  const token=row.key.slice(root.length),record=row.value as TrackedRecord;
  if(!validToken(token)||!isFresh(record)||!record||typeof record.pageId!=='string'||typeof record.issueKey!=='string'||typeof record.field!=='string'||hash(recordIdentity(record))!==token)return [];
  return [{token,record}];
 });
 return {entries,nextCursor:result.nextCursor??null};
}
export async function removeTracked(accountId:unknown,token:unknown){
 if(!validToken(token))throw Error('Invalid saved finding.');
 await kvs.delete(prefix(accountId)+token);
}
