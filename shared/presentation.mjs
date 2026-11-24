export function resolveTheme(saved,preferDark){return saved==='light'||saved==='dark'?saved:preferDark?'dark':'light';}

export function pageMeta(page){
 const items={
  Overview:{title:'Workspace overview',description:'Review the latest scan and investigate potential requirement conflicts.'},
  Conflicts:{title:'Conflict center',description:'Compare source evidence and request a review.'},
  Context:{title:'Context map',description:'Explore relationships between the selected reference and Jira issues.'},
  Saved:{title:'Saved findings',description:'Follow important findings and check for source updates.'},
  Assistant:{title:'Synqra Assistant',description:'Explore natural-language contradictions and investigate findings with Rovo.'},
  Activity:{title:'Review activity',description:'See recent scans and review requests.'}
 };
 return Object.prototype.hasOwnProperty.call(items,page)?items[page]:items.Overview;
}
