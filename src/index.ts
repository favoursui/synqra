import Resolver from '@forge/resolver';
import api,{route} from '@forge/api';
import {adfText,type Source} from '../shared/engine';
import {parseIssueKeys,assemble,assertUnchanged,reviewText,commentBody} from '../shared/workflow';
import {scanSummary,reviewSummary} from '../shared/history';
import {saveHistory,listHistory,newHistoryId} from './history';
import {discoverIssueLinks} from '../shared/discovery';
import {analyzePair} from './semantic';
import {pairInput,agentReport} from '../shared/rovo.mjs';
const resolver=new Resolver();
function validatePage(value:unknown){const id=String(value??'').trim();if(!/^\d{1,24}$/.test(id))throw Error('Enter a numeric Confluence page ID.');return id;}
async function readPageDocument(pageId:string){
 const c=await api.asUser().requestConfluence(route`/wiki/api/v2/pages/${pageId}?body-format=atlas_doc_format`,{headers:{Accept:'application/json'}});
 if(!c.ok)throw Error(`Cannot read Confluence page (${c.status}). Check permissions and installation.`);
 const page=await c.json();const body=page.body?.atlas_doc_format?.value;
 if(!body)throw Error('Confluence page body unavailable.');
 const document=typeof body==='string'?JSON.parse(body):body;
 const source:Source={kind:'Confluence',id:pageId,title:page.title,text:adfText(document)};
 return {source,document};
}
async function readPage(pageId:string):Promise<Source>{return (await readPageDocument(pageId)).source;}
resolver.define('discoverIssues',async ({payload})=>{
 const page=validatePage(payload?.pageId);
 const [{document},info]=await Promise.all([readPageDocument(page),api.asUser().requestJira(route`/rest/api/3/serverInfo`,{headers:{Accept:'application/json'}})]);
 if(!info.ok)throw Error('Unable to verify the Jira site for link discovery.');
 const site=await info.json();
 return discoverIssueLinks(document,[site.baseUrl,site.displayUrl]);
});
async function readIssue(key:string):Promise<Source>{
 const j=await api.asUser().requestJira(route`/rest/api/3/issue/${key}?fields=summary,description`,{headers:{Accept:'application/json'}});
 if(!j.ok)throw Error(`Unable to read Jira issue (${j.status}).`);
 const issue=await j.json();return {kind:'Jira',id:issue.key,title:issue.fields.summary,text:adfText(issue.fields.description)};
}
resolver.define('scanWorkspace',async ({payload,context})=>{
 const keys=parseIssueKeys(payload?.issueKeys),page=validatePage(payload?.pageId),spec=await readPage(page);
 const issues:Source[]=[],failures:{issueId:string;message:string}[]=[];
 // Bounded concurrency to avoid unnecessary rate-limit pressure.
 for(let i=0;i<keys.length;i+=3){const batch=keys.slice(i,i+3);const results=await Promise.allSettled(batch.map(readIssue));results.forEach((r,k)=>{if(r.status==='fulfilled')issues.push(r.value);else failures.push({issueId:batch[k],message:'Issue unavailable. Check its key and your permissions.'});});}
 const result=assemble(spec,issues,failures);
 const historySaved=await saveHistory(context.accountId,scanSummary(result,newHistoryId()));
 return {...result,historySaved};
});
resolver.define('analyzeIssue',async ({payload})=>{
 if(payload?.confirmed!==true)throw Error('Confirm AI analysis before continuing.');
 const page=validatePage(payload?.pageId),keys=parseIssueKeys(payload?.issueKey);
 if(keys.length!==1)throw Error('Select one issue for AI analysis.');
 const [reference,issue]=await Promise.all([readPage(page),readIssue(keys[0])]);
 try{return {issueId:issue.id,...await analyzePair(reference,issue)};}
 catch{throw Error('AI analysis unavailable or source too large. Your rule-based scan remains available.');}
});
resolver.define('requestReview',async ({payload,context})=>{
 if(payload?.confirmed!==true)throw Error('Explicit confirmation is required.');
 const page=validatePage(payload?.pageId),keys=parseIssueKeys(payload?.issueKey);
 if(keys.length!==1)throw Error('Select one issue.');
 const [spec,issue]=await Promise.all([readPage(page),readIssue(keys[0])]);
 const finding=assemble(spec,[issue]).findings.find(f=>f.id===payload?.finding?.id);
 assertUnchanged(finding,payload?.finding);
 // Recompute the message from current authorized sources. Never accept arbitrary comment text.
 const response=await api.asUser().requestJira(route`/rest/api/3/issue/${issue.id}/comment`,{method:'POST',headers:{Accept:'application/json','Content-Type':'application/json'},body:JSON.stringify({body:commentBody(reviewText(spec,finding))})});
 if(!response.ok)throw Error(`Review comment could not be confirmed (${response.status}). Check Jira comment permissions before retrying.`);
 const comment=await response.json();
 const historySaved=await saveHistory(context.accountId,reviewSummary(newHistoryId(),new Date().toISOString()));
 return {commentId:String(comment.id),issueId:issue.id,historySaved};
});
resolver.define('listHistory',async ({context})=>listHistory(context.accountId));
// Rovo action: read only. Never fall back to app-level access or write history.
export async function compareForRovo(payload:unknown){
 let pair;
 try{pair=pairInput(payload);}catch{return {status:'invalid_input',message:'Provide a numeric Confluence page ID and one Jira issue key.'};}
 try{
  const [spec,issue]=await Promise.all([readPage(pair.pageId),readIssue(pair.issueKey)]);
  if(spec.text.length>60000||issue.text.length>60000)return {status:'unavailable',message:'Source too large. Select a smaller reference.'};
  if(!spec.text.trim()||!issue.text.trim())return {status:'unavailable',message:'Both sources need readable text.'};
  const result=assemble(spec,[issue]);
  return agentReport({pageId:spec.id,issueKey:issue.id},result.findings);
 }catch{return {status:'unavailable',message:'Unable to compare both sources. Check the IDs, installation and your permissions.'};}
}
export const handler=resolver.getDefinitions();
