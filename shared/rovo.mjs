export function pairInput(payload){
 const page=payload?.pageId,key=payload?.issueKey;
 if(typeof page!=='string'||!/^\d{1,24}$/.test(page.trim()))throw Error('Enter a numeric Confluence page ID.');
 if(typeof key!=='string'||!/^[A-Z][A-Z0-9_]{0,29}-\d{1,12}$/.test(key.trim().toUpperCase()))throw Error('Enter one valid Jira issue key.');
 return {pageId:page.trim(),issueKey:key.trim().toUpperCase()};
}

export function buildAgentPrompt(payload){
 const {pageId,issueKey}=pairInput(payload);
 return `Compare Confluence page ${pageId} with Jira issue ${issueKey} using Synqra's comparison action. Explain the verified potential mismatches, show the evidence and recommend what I should review. Do not make changes.`;
}

export function agentReport(pair,findings){
 const {pageId,issueKey}=pairInput(pair);
 const safe=findings.filter(f=>typeof f.field==='string'&&Array.isArray(f.evidence)&&f.evidence.length===2&&f.evidence.every(e=>typeof e==='string'&&e.length<=500)&&typeof f.expected==='string'&&f.expected.length<=500&&typeof f.actual==='string'&&f.actual.length<=500);
 return {status:'ok',pageId,issueKey,method:'Structured field comparison',findings:safe.slice(0,5).map(f=>({field:f.field,severity:f.severity,referenceValue:f.expected,issueValue:f.actual,referenceQuote:f.evidence[0],issueQuote:f.evidence[1]})),omitted:findings.length-Math.min(safe.length,5),limitations:'Only supported unique structured fields are checked. No findings does not establish alignment. The reference is user-selected, not verified as approved. All findings need human review. No data was changed.'};
}
