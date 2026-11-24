export type Source = { kind: 'Jira' | 'Confluence'; id: string; title: string; text: string };
export type Conflict = { id: string; field: string; expected: string; actual: string; evidence: [string, string]; severity: 'high' | 'medium'; };
// Only compare explicitly paired resources with exact, unique structured fields.
// Unknown units, missing fields and ambiguous duplicates are not treated as matches.
const fields = ['maximum slippage', 'session timeout', 'api version', 'release date', 'authentication method'] as const;
function values(text: string, field: string) {
  const re = new RegExp(`^[ \t]*(?:[-*][ \t]*)?${field}[ \t]*:[ \t]*([^\\n]+)`, 'gim');
  return Array.from(text.matchAll(re), m => ({value:m[1].trim(), evidence:m[0].trim()}));
}
function normalize(field: string, value: string): string | null {
  const v=value.trim().toLowerCase().replace(/\s+/g,' ');
  if (field==='maximum slippage') {const m=v.match(/^(\d+(?:\.\d+)?)\s*%$/); return m ? String(Number(m[1]))+'%' : null;}
  if (field==='session timeout') {const m=v.match(/^(\d+(?:\.\d+)?)\s*(seconds?|minutes?|hours?)$/); return m ? String(Number(m[1])*(m[2].startsWith('hour')?3600:m[2].startsWith('minute')?60:1))+'s' : null;}
  if (field==='release date') {if(!/^\d{4}-\d{2}-\d{2}$/.test(v))return null; const d=new Date(v+'T00:00:00Z');return Number.isFinite(+d)&&d.toISOString().slice(0,10)===v?v:null;}
  return v || null;
}
export function compare(spec:Source,issue:Source):Conflict[] {
  if(spec.kind!=='Confluence'||issue.kind!=='Jira') throw new Error('Select a Confluence reference and Jira issue.');
  return fields.flatMap(field=>{
    const a=values(spec.text,field),b=values(issue.text,field);
    if(a.length!==1||b.length!==1)return [];
    const x=normalize(field,a[0].value),y=normalize(field,b[0].value);
    if(x===null||y===null||x===y)return [];
    return [{id:`${spec.id}:${issue.id}:${field}`,field,expected:a[0].value,actual:b[0].value,evidence:[a[0].evidence,b[0].evidence],severity:field==='release date'?'medium':'high'}];
  });
}
export function adfText(node: unknown):string {
  if(typeof node==='string')return node;
  if(!node||typeof node!=='object')return '';
  const n=node as {type?:string;text?:string;content?:unknown[]};
  if(n.type==='text')return n.text??'';
  if(n.type==='hardBreak')return '\n';
  const content=(n.content??[]).map(adfText).join('');
  return ['paragraph','heading','listItem','tableRow','codeBlock'].includes(n.type??'')?content+'\n':content;
}
export const sampleSpec:Source={kind:'Confluence',id:'10001',title:'Trading specification',text:'Maximum slippage: 0.5%\nSession timeout: 30 minutes\nAPI version: v2\nRelease date: 2026-12-10'};
export const sampleIssue:Source={kind:'Jira',id:'CAD-102',title:'Implement swap execution',text:'Maximum slippage: 2%\nSession timeout: 1800 seconds\nAPI version: v1\nRelease date: 2026-12-08'};
