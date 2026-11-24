import React,{useEffect,useState} from 'react';
import {Bookmark,RefreshCw,Trash2} from 'lucide-react';
import type {ScanResult} from '../../shared/workflow';
type Row={token:string;savedAt:string;status:'detected'|'not_detected'|'unavailable';pageId?:string;issueKey?:string;field?:string;monitoring?:'update_received'|'no_update_received'|'not_registered'|'unavailable';finding?:{field:string;severity:string;expected:string;actual:string;evidence:[string,string]}|null};
type Page={rows:Row[];nextCursor:string|null;checkedAt:string};
export function TrackedPanel({scan,live,busy}:{scan:ScanResult|null;live:boolean;busy:boolean}){
 const [selected,setSelected]=useState(''),[page,setPage]=useState<Page|null>(null),[loading,setLoading]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('');
 const chosen=scan?.findings.find(f=>f.id===selected)??scan?.findings[0];
 useEffect(()=>{setSelected('');},[scan?.scannedAt]);
 async function run(action:'save'|'list'|'remove',token?:string,cursor?:string){
  if(!live||busy||loading)return;
  setLoading(true);setMessage('');setError('');
  try{
   if(window.parent===window)throw Error('Open the installed Forge app to use saved findings.');
   const {invoke}=await import('@forge/bridge');
   if(action==='save'&&chosen&&scan){
    const receipt=await invoke<{token:string;monitoringRegistered:boolean}>('saveFinding',{pageId:scan.spec.id,issueKey:chosen.issueId,finding:chosen});
    setMessage(receipt.monitoringRegistered?'Finding saved. Update monitoring registered.':'Finding saved, but update monitoring could not be registered. Save again to retry.');
   }
   if(action==='remove'){
    await invoke('removeSavedFinding',{token});
    setMessage('Saved finding removed.');
   }
   setPage(null);
   setPage(await invoke<Page>('listSavedFindings',action==='list'&&cursor?{cursor}:{}));
  }catch(e){setError(e instanceof Error?e.message:'Unable to complete the request. Refresh before retrying.');}
  finally{setLoading(false);}
 }
 return <section className="panel semantic-panel">
  <div className="panelhead"><div><h2><Bookmark size={17}/> Saved findings</h2><p>Save findings for follow-up and monitor source updates. Refresh to compare the current sources.</p></div></div>
  {!live?<p className="scanmeta">Personal saved findings are available in the installed app. Demo data is not saved.</p>:<>
   {chosen&&<div className="tracked-save"><label>Finding to save<select value={chosen.id} disabled={busy||loading} onChange={e=>setSelected(e.target.value)}>{scan?.findings.map(f=><option key={f.id} value={f.id}>{f.issueId}: {f.field}</option>)}</select></label><button className="primary" disabled={busy||loading} onClick={()=>void run('save')}><Bookmark size={16}/>Save for follow-up</button></div>}
   <div className="actions tracked-actions"><button className="secondary" disabled={busy||loading} onClick={()=>void run('list')}><RefreshCw size={15}/> {loading?'Checking...':'Refresh saved findings'}</button></div>
   {message&&<p role="status" className="notice">{message}</p>}{error&&<p role="alert" className="error">{error}</p>}
   {page&&<><p className="scanmeta">Checked {new Date(page.checkedAt).toLocaleString()}. Up to five records per page.</p>
   {!page.rows.length&&<p className="empty">No saved findings on this page.</p>}
   {page.rows.map(row=><article className="semantic-finding" key={row.token}>
    <div className="panelhead"><div><h3>{row.status==='unavailable'?'Unavailable finding':row.issueKey+': '+row.field}</h3><p>Saved {new Date(row.savedAt).toLocaleString()}</p></div><button className="secondary" disabled={busy||loading} onClick={()=>void run('remove',row.token)} aria-label="Remove saved finding"><Trash2 size={16}/></button></div>
    {row.status!=='unavailable'&&<p className="scanmeta" role="status">{row.monitoring==='update_received'?'Source update received since this finding was saved.':row.monitoring==='no_update_received'?'No update event received since saving.':row.monitoring==='not_registered'?'Update monitoring not registered or expired. Save again to enable.':'Update monitoring status unavailable.'}</p>}
    {row.status==='detected'&&row.finding?<><p className="severity">Still detected</p><div className="evidence"><span>CONFLUENCE / {row.pageId}</span><p>{row.finding.evidence[0]}</p></div><div className="evidence mismatch"><span>JIRA / {row.issueKey}</span><p>{row.finding.evidence[1]}</p></div></>:row.status==='not_detected'?<p>Not detected in the latest comparison. The requirement may have changed, disappeared or become unsupported. Verify before treating it as resolved.</p>:<p>Both sources could not be checked. Source identifiers and evidence are hidden.</p>}
   </article>)}
   {page.nextCursor&&<button className="secondary tracked-actions" disabled={busy||loading} onClick={()=>void run('list',undefined,page.nextCursor!)}>Next page</button>}
   </>}
   <p className="scanmeta">Saved records and update registrations expire after 30 days. Removing a saved finding hides it; shared resource markers expire independently. Events are best effort and may be delayed or missed. No background source reads, automatic conflict scans or issue edits.</p>
  </>}
 </section>;
}
