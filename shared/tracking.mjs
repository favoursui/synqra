export function makeRecord(pair,finding,at){
 const {pageId,issueKey}=pair;
 const fields=['maximum slippage','session timeout','api version','release date','authentication method'];
 if(typeof pageId!=='string'||!/^\d{1,24}$/.test(pageId)||typeof issueKey!=='string'||!/^[A-Z][A-Z0-9_]{0,29}-\d{1,12}$/.test(issueKey)||!fields.includes(finding?.field)||finding.id!==`${pageId}:${issueKey}:${finding.field}`||!Number.isFinite(Date.parse(at)))throw Error('Invalid finding.');
 return {pageId,issueKey,field:finding.field,savedAt:at};
}

export function recordIdentity(record){return JSON.stringify([record.pageId,record.issueKey,record.field]);}

export function isFresh(record,now=Date.now()){const at=Date.parse(record?.savedAt);return Number.isFinite(at)&&at<=now&&at>now-30*86400000;}

export function currentState(record,findings){const f=findings.find(x=>x.field===record.field);return f?{status:'detected',finding:{field:f.field,severity:f.severity,expected:f.expected,actual:f.actual,evidence:f.evidence}}:{status:'not_detected',finding:null};}

export function validToken(value){return typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);}
