import {compare,type Source,type Conflict} from './engine';
export const MAX_ISSUES=8;
export type Finding=Conflict & {issueId:string; issueTitle:string};
export type ScanResult={spec:Source;issues:Source[];findings:Finding[];failures:{issueId:string;message:string}[];scannedAt:string;historySaved?:boolean};
export function parseIssueKeys(value:unknown):string[]{
 if(typeof value!=='string')throw Error('Enter Jira issue keys.');
 const keys=Array.from(new Set(value.trim().toUpperCase().split(/[\s,]+/).filter(Boolean)));
 if(!keys.length||keys.length>MAX_ISSUES||keys.some(k=>!/^[A-Z][A-Z0-9_]{0,29}-\d{1,12}$/.test(k)))throw Error(`Enter 1 to ${MAX_ISSUES} valid Jira issue keys, separated by commas.`);
 return keys;
}
export function assemble(spec:Source,issues:Source[],failures:ScanResult['failures']=[]):ScanResult{
 return {spec,issues,failures,findings:issues.flatMap(issue=>compare(spec,issue).map(c=>({...c,issueId:issue.id,issueTitle:issue.title}))),scannedAt:new Date().toISOString()};
}
export function reviewText(spec:Source,finding:Finding):string{
 return `Synqra: requirement review requested\nConfluence reference: ${spec.title} (page ${spec.id})\nJira issue: ${finding.issueId}\nPotential mismatch: ${finding.field}\nReference evidence: ${finding.evidence[0]}\nIssue evidence: ${finding.evidence[1]}\nPlease confirm the reference is current and approved, then reconcile the issue if appropriate. No requirement was changed by Synqra.`;
}
export function assertUnchanged(current:Finding|undefined,previous:unknown):asserts current is Finding{
 if(!current||!previous||typeof previous!=='object')throw Error('Finding no longer exists. Run a fresh scan.');
 const p=previous as Partial<Finding>;
 if(current.id!==p.id||current.expected!==p.expected||current.actual!==p.actual||!Array.isArray(p.evidence)||current.evidence.some((e,i)=>e!==p.evidence![i]))throw Error('Evidence changed. Run a fresh scan before requesting review.');
}
export const commentBody=(text:string)=>({type:'doc',version:1,content:text.split('\n').map(line=>({type:'paragraph',content:[{type:'text',text:line}]}))});
