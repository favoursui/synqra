export function buildContextGraph(scan){
 const reference={id:scan.spec.id,title:scan.spec.title};
 const nodes=new Map();
 for(const issue of scan.issues){
  if(nodes.has(issue.id))continue;
  const findings=scan.findings.filter(f=>f.issueId===issue.id);
  const high=findings.filter(f=>f.severity==='high').length,medium=findings.filter(f=>f.severity==='medium').length;
  nodes.set(issue.id,{id:issue.id,title:issue.title,state:findings.length?'findings':'none_detected',high,medium,findings});
 }
 for(const failure of scan.failures){
  if(nodes.has(failure.issueId))continue;
  nodes.set(failure.issueId,{id:failure.issueId,title:'Issue unavailable',state:'unavailable',high:0,medium:0,findings:[]});
 }
 return {reference,nodes:[...nodes.values()]};
}

export function filterGraph(nodes,filter,query){
 const q=query.trim().toLowerCase();
 return nodes.filter(n=>(filter==='all'||(filter==='high'?n.high>0:filter==='medium'?n.medium>0:n.state===filter))&&(!q||`${n.id} ${n.title}`.toLowerCase().includes(q)));
}

export function graphSelection(nodes,selected){return nodes.find(n=>n.id===selected)??null;}

export function graphCounts(nodes){return {total:nodes.length,withFindings:nodes.filter(n=>n.state==='findings').length,unavailable:nodes.filter(n=>n.state==='unavailable').length,findings:nodes.reduce((total,n)=>total+n.findings.length,0)};}
