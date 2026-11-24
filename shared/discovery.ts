import {MAX_ISSUES} from './workflow.ts';
export type DiscoveryResult={keys:string[];limited:boolean};
type Node={type?:string;attrs?:{url?:unknown;href?:unknown};marks?:Node[];content?:unknown[]};
// Only use explicit Jira links. Never fetch a URL supplied by a document.
export function discoverIssueLinks(doc:unknown,siteUrls:unknown[]):DiscoveryResult{
 const origins=new Set<string>();
 for(const value of siteUrls){try{if(typeof value==='string'){const u=new URL(value);if(u.protocol==='https:'&&!u.username&&!u.password)origins.add(u.origin);}}catch{/* Ignore invalid server metadata. */}}
 const keys=new Set<string>();let limited=false;
 function add(value:unknown){
  if(typeof value!=='string'||value.length>2048||!origins.size)return;
  try{
   const u=value.startsWith('/browse/')?new URL(value,[...origins][0]):new URL(value);
   if(u.protocol!=='https:'||u.username||u.password||!origins.has(u.origin))return;
   const match=u.pathname.match(/^\/browse\/([A-Z][A-Z0-9_]{0,29}-\d{1,12})\/?$/i);
   if(!match)return;const key=match[1].toUpperCase();
   if(keys.has(key))return;if(keys.size===MAX_ISSUES){limited=true;return;}keys.add(key);
  }catch{/* Ignore malformed or unrelated links. */}
 }
 const stack:unknown[]=[doc];let visited=0;
 while(stack.length&&!limited){
  if(++visited>20000){limited=true;break;}
  const value=stack.pop();if(!value||typeof value!=='object')continue;const n=value as Node;
  if(n.type==='inlineCard'||n.type==='blockCard')add(n.attrs?.url);
  if(Array.isArray(n.marks))for(const m of n.marks){if(m?.type==='link')add(m.attrs?.href);}
  if(Array.isArray(n.content)){for(let i=n.content.length-1;i>=0;i--)stack.push(n.content[i]);}
 }
 return {keys:[...keys],limited};
}
