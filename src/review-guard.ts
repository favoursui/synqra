import {createHash} from 'node:crypto';
import {kvs} from '@forge/kvs';
import {reviewIdentity,guardedReview} from '../shared/review-guard.mjs';
import type {Finding} from '../shared/workflow';

export async function protectReview<T>(accountId:unknown,pageId:string,issueId:string,finding:Finding,post:()=>Promise<T>):Promise<T>{
 const identity=reviewIdentity(accountId,pageId,issueId,finding);
 const key='review:v1:'+createHash('sha256').update(identity).digest('hex');
 return guardedReview(
  ()=>kvs.set(key,{reserved:true},{keyPolicy:'FAIL_IF_EXISTS',ttl:{unit:'DAYS',value:1}}),
  post
 );
}
