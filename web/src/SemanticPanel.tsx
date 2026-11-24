import React,{useState} from 'react';
import {Sparkles} from 'lucide-react';
import type {ScanResult} from '../../shared/workflow';
type Candidate={topic:string;referenceQuote:string;issueQuote:string;reason:string};
type Analysis={issueId:string;findings:Candidate[];rejected:number};
export function SemanticPanel({scan,live,busy}:{scan:ScanResult;live:boolean;busy:boolean}){
 const [key,setKey]=useState(scan.issues[0]?.id??'');
 const [confirmed,setConfirmed]=useState(false),[loading,setLoading]=useState(false);
 const [analysis,setAnalysis]=useState<Analysis|null>(null),[error,setError]=useState('');
 async function analyze(){
  if(!live||!confirmed||!key||loading||busy)return;
  setLoading(true);setAnalysis(null);setError('');setConfirmed(false);
  try{
   const {invoke}=await import('@forge/bridge');
   setAnalysis(await invoke<Analysis>('analyzeIssue',{pageId:scan.spec.id,issueKey:key,confirmed:true}));
  }catch{setError('AI analysis could not be completed. Try again or use the rule-based findings.');}
  finally{setLoading(false);}
 }
 return <section className="panel semantic-panel">
  <div className="panelhead"><div><h2><Sparkles size={17}/> AI conflict analysis</h2><p>Look for contradictions in natural-language requirements. AI suggestions require human review.</p></div><span className="pill">Preview</span></div>
  {!live?<p className="scanmeta">Available in the installed Forge app. No AI requests are made in demo mode.</p>:!scan.issues.length?<p className="scanmeta">Scan a readable Jira issue first.</p>:<>
  <label className="semantic-select">Jira issue to analyze<select value={key} disabled={loading||busy} onChange={e=>{setKey(e.target.value);setAnalysis(null);setConfirmed(false);setError('')}}>{scan.issues.map(i=><option key={i.id} value={i.id}>{i.id}: {i.title}</option>)}</select></label>
  <label className="check"><input type="checkbox" checked={confirmed} disabled={loading||busy} onChange={e=>setConfirmed(e.target.checked)}/><span>Send the current reference and selected issue text to Atlassian-hosted AI for analysis. Usage charges may apply.</span></label>
  <button className="primary" disabled={!confirmed||loading||busy||!key} onClick={()=>void analyze()}>{loading?'Analyzing...':'Analyze requirements'}</button>
  {error&&<p role="alert" className="error">{error}</p>}
  {analysis&&<div className="semantic-results"><p role="status">{analysis.findings.length} potential AI findings for {analysis.issueId}.{analysis.rejected>0?' Some candidates were rejected because their evidence could not be validated.':''}</p>
  {!analysis.findings.length&&<p className="scanmeta">No validated AI findings returned. This does not establish alignment.</p>}
  {analysis.findings.map((f,i)=><article className="semantic-finding" key={i}><h3>{f.topic}</h3><p>{f.reason}</p><div className="evidence"><span>CONFLUENCE QUOTE</span><p>{f.referenceQuote}</p></div><div className="evidence mismatch"><span>JIRA QUOTE</span><p>{f.issueQuote}</p></div></article>)}
  <p className="scanmeta">Quotes were checked against source text. AI interpretations may still be incorrect. No Jira changes were made.</p></div>}
  </>}
 </section>;
}
