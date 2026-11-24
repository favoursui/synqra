import React,{useState} from 'react';
import {MessageSquare} from 'lucide-react';
import {buildAgentPrompt} from '../../shared/rovo.mjs';
import type {ScanResult} from '../../shared/workflow';

export function RovoPanel({scan,live,busy}:{scan:ScanResult;live:boolean;busy:boolean}){
 const [issueKey,setIssueKey]=useState(scan.issues[0]?.id??'');
 const [opening,setOpening]=useState(false),[message,setMessage]=useState('');
 async function launch(){
  if(!live||!issueKey||busy||opening)return;
  setOpening(true);setMessage('');
  try{
   const {rovo}=await import('@forge/bridge');
   if(!await rovo.isEnabled()){setMessage('Rovo is not enabled on this site.');return;}
   await rovo.open({type:'forge',agentName:'Synqra Assistant',agentKey:'synqra-agent',prompt:buildAgentPrompt({pageId:scan.spec.id,issueKey})});
  }catch{setMessage('Unable to open Rovo. Check your installation and Rovo access.');}
  finally{setOpening(false);}
 }
 return <section className="panel semantic-panel">
  <div className="panelhead"><div><h2><MessageSquare size={17}/> Synqra Assistant</h2><p>Ask Rovo to explain potential mismatches and suggest what to review. The comparison is read only.</p></div></div>
  {!live?<p className="scanmeta">Available in the installed app when Rovo is enabled.</p>:!scan.issues.length?<p className="scanmeta">Scan a readable issue first.</p>:<>
   <label className="semantic-select">Jira issue<select value={issueKey} disabled={busy||opening} onChange={e=>{setIssueKey(e.target.value);setMessage('')}}>{scan.issues.map(i=><option key={i.id} value={i.id}>{i.id}: {i.title}</option>)}</select></label>
   <p className="scanmeta">Opens a new Rovo chat with the selected page ID and issue key. The assistant reads both sources again using your permissions.</p>
   <div className="actions" style={{marginTop:12}}><button className="primary" disabled={busy||opening||!issueKey} onClick={()=>void launch()}><MessageSquare size={16}/>{opening?'Opening...':'Ask Synqra'}</button></div>
   {message&&<p role="status" className="notice">{message}</p>}
  </>}
 </section>;
}
