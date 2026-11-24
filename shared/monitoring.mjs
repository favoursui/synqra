export function resource(kind,id){
 if(kind!=='jira'&&kind!=='confluence')return null;
 if(typeof id==='number'&&Number.isSafeInteger(id)&&id>0)id=String(id);
 if(typeof id!=='string'||!/^[1-9]\d{0,23}$/.test(id))return null;
 return {kind,id};
}

export function eventResource(event){
 if(event?.eventType==='avi:jira:updated:issue')return resource('jira',event.issue?.id);
 if(event?.eventType==='avi:confluence:updated:page')return resource('confluence',event.content?.id);
 return null;
}

export function watchActive(value,now){
 const expires=value?.expiresAt;
 return typeof expires==='number'&&Number.isFinite(expires)&&expires>now;
}

export function observedAfter(marker,savedAt,now){
 const received=marker?.receivedAt,baseline=Date.parse(savedAt);
 return typeof received==='number'&&Number.isFinite(received)&&Number.isFinite(baseline)&&received>=baseline&&received<=now&&received>now-30*86400000;
}

export function monitoringState(watches,events,savedAt,now){
 if(!Number.isFinite(Date.parse(savedAt))||watches.length!==2||events.length!==2)return 'unavailable';
 if(events.some(m=>observedAfter(m,savedAt,now)))return 'update_received';
 if(watches.every(w=>watchActive(w,now)))return 'no_update_received';
 return 'not_registered';
}
