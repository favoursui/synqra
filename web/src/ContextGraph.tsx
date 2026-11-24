import React,{useState} from 'react';
import {FileText,Network,Search,SquareCheck,AlertCircle,ArrowRight,ExternalLink} from 'lucide-react';
import type {ScanResult,Finding} from '../../shared/workflow';
import {buildContextGraph,filterGraph,graphSelection,graphCounts} from '../../shared/context-graph.mjs';

type Node={id:string;title:string;state:'findings'|'none_detected'|'unavailable';high:number;medium:number;findings:Finding[]};
type Filter='all'|'high'|'medium'|'none_detected'|'unavailable';
const stateLabel=(node:Node)=>node.state==='unavailable'?'Unavailable':node.state==='none_detected'?'No findings detected':node.findings.length+' potential '+(node.findings.length===1?'conflict':'conflicts');
export function ContextGraph({scan,live,busy,onReview,onOpen}:{scan:ScanResult;live:boolean;busy:boolean;onReview:(findingId:string)=>void;onOpen:(path:string)=>void}){
 const [filter,setFilter]=useState<Filter>('all'),[query,setQuery]=useState(''),[selected,setSelected]=useState('');
 const graph=buildContextGraph(scan),nodes=graph.nodes as Node[],visible=filterGraph(nodes,filter,query) as Node[];
 const active=graphSelection(visible,selected) as Node|null,counts=graphCounts(nodes);
 function changeFilter(value:Filter){setFilter(value);setSelected('');}
 function changeQuery(value:string){setQuery(value);setSelected('');}
 return <section className="panel context context-map">
  <div className="panelhead"><div><h2><Network size={18}/> Context map</h2><p>Explore the reference, issues and potential conflicts in this scan. Lines represent comparisons, not verified dependencies.</p></div><span className="pill">{counts.total} issue{counts.total===1?'':'s'}</span></div>
  <div className="map-stats"><span><strong>{counts.withFindings}</strong> with findings</span><span><strong>{counts.findings}</strong> findings</span><span><strong>{counts.unavailable}</strong> unavailable</span></div>
  <div className="map-tools"><label><span>Search issues</span><div className="map-search"><Search size={16}/><input value={query} onChange={e=>changeQuery(e.target.value)} placeholder="Issue key or title"/></div></label><label>Filter<select value={filter} onChange={e=>changeFilter(e.target.value as Filter)}><option value="all">All issues</option><option value="high">High severity</option><option value="medium">Medium severity</option><option value="none_detected">No findings detected</option><option value="unavailable">Unavailable</option></select></label><button className="secondary" onClick={()=>{changeFilter('all');changeQuery('')}}>Reset filters</button></div>
  <div className="map-layout">
   <div className="map-canvas">
    <div className="map-reference"><FileText size={24}/><small>CONFLUENCE REFERENCE</small><strong>{graph.reference.title}</strong><p>Page {graph.reference.id}</p>{live&&<button className="secondary" disabled={busy} onClick={()=>onOpen('/wiki/pages/viewpage.action?pageId='+graph.reference.id)}><ExternalLink size={14}/> Open reference</button>}</div>
    {visible.length>0?<ul className="map-branches" aria-label="Compared Jira issues">{visible.map(node=><li key={node.id}><button className={'map-node '+node.state+(active?.id===node.id?' selected':'')} aria-pressed={active?.id===node.id} onClick={()=>setSelected(node.id)}>{node.state==='unavailable'?<AlertCircle size={18}/>:<SquareCheck size={18}/>}<span className="map-node-body"><strong>{node.id}</strong><span>{node.title}</span><small>{stateLabel(node)}</small></span><ArrowRight size={16}/></button></li>)}</ul>:<p className="empty">No issues match these filters.</p>}
   </div>
   <div className="map-inspector" aria-live="polite">
    <h3>Resource details</h3>
    {!active?<p>Select an issue to inspect its findings and open the evidence review.</p>:<><strong>{active.id}</strong><p>{active.title}</p><p className="map-detail-status">{stateLabel(active)}</p>
    {active.state==='unavailable'?<p>The issue could not be read in this scan. Its requirements were not assessed.</p>:<>
     {live&&<button className="secondary" disabled={busy} onClick={()=>onOpen('/browse/'+active.id)}><ExternalLink size={14}/> Open Jira issue</button>}
     {active.findings.length?active.findings.map(f=><button key={f.id} className="finding map-finding" disabled={busy} onClick={()=>onReview(f.id)}><span><small className={'severity '+f.severity}>{f.severity}</small><strong>{f.field}</strong><small>{f.expected} vs {f.actual}</small></span><ArrowRight size={16}/></button>):<p>No supported structured conflicts were detected. This does not establish alignment.</p>}
    </>}
    </>}
   </div>
  </div>
  <p className="scanmeta">Snapshot from {new Date(scan.scannedAt).toLocaleString()}. Run a new scan to refresh. AI suggestions are not included in this graph.</p>
 </section>;
}
