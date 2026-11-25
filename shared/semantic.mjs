export function boundedText(text){if(typeof text!=='string'||!text.trim())throw Error('Both sources need readable text.');if(text.length>12000)throw Error('A source exceeds the 12,000 character AI analysis limit. Use a smaller reference.');return text;}

export function validateCandidates(raw,reference,issue){
 if(typeof raw!=='string'||raw.length>16000)throw Error('Invalid AI response.');
 let parsed;try{parsed=JSON.parse(raw);}catch{throw Error('Invalid AI response.');}
 if(!parsed||!Array.isArray(parsed.findings)||parsed.findings.length>4)throw Error('Invalid AI response.');
 const findings=[],seen=new Set();let rejected=0;
 for(const f of parsed.findings){
  if(!f||typeof f!=='object'){rejected++;continue;}
  const {topic,referenceQuote,issueQuote,reason}=f;
  if(typeof topic!=='string'||!topic.trim()||topic.length>100||typeof reason!=='string'||!reason.trim()||reason.length>400||typeof referenceQuote!=='string'||typeof issueQuote!=='string'||referenceQuote.trim().length<12||issueQuote.trim().length<12||referenceQuote.length>500||issueQuote.length>500||!reference.includes(referenceQuote)||!issue.includes(issueQuote)||referenceQuote.trim().toLowerCase()===issueQuote.trim().toLowerCase()){rejected++;continue;}
  const key=JSON.stringify([referenceQuote,issueQuote]);if(seen.has(key)){rejected++;continue;}seen.add(key);
  findings.push({topic:topic.trim(),referenceQuote,issueQuote,reason:reason.trim()});
 }
 return {findings,rejected};
}

export function responseText(response){
 const choice=response?.choices?.[0];
 if(!choice||choice.finish_reason!=='stop')throw Error('Incomplete AI response.');
 const content=choice.message?.content;
 if(typeof content==='string')return content;
 if(Array.isArray(content)&&content.every(p=>p?.type==='text'&&typeof p.text==='string'))return content.map(p=>p.text).join('');
 throw Error('Invalid AI response.');
}

export function chooseHaiku(response){
 if(!Array.isArray(response?.models))throw Error('Model availability unavailable.');
 const supported=['claude-haiku-5-5','claude-haiku-4-5-20251001'];
 const model=supported.find(id=>response.models.some(m=>m?.model===id&&typeof m.status==='string'&&m.status.toLowerCase()==='active'));
 if(!model)throw Error('No supported active Haiku model.');
 return model;
}
