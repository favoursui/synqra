export function reviewIdentity(accountId, pageId, issueId, finding) {
 if(typeof accountId!=='string'||!accountId.trim()||accountId==='unidentified')throw Error('Sign in to request a review.');
 if(typeof pageId!=='string'||!/^\d{1,24}$/.test(pageId)||typeof issueId!=='string'||!/^\d{1,24}$/.test(issueId))throw Error('Missing stable source identifiers.');
 if(!finding||typeof finding.field!=='string'||!finding.field||typeof finding.expected!=='string'||typeof finding.actual!=='string'||!Array.isArray(finding.evidence)||finding.evidence.length!==2||finding.evidence.some(e=>typeof e!=='string'))throw Error('Invalid finding.');
 return JSON.stringify([accountId,pageId,issueId,finding.field,finding.expected,finding.actual,...finding.evidence]);
}

export function validateReviewBody(body){
 if(typeof body!=='string'||!body.trim()||body.length>8000)throw Error('Review comment is too large. Use Jira to request a review manually.');
 return body;
}

export async function guardedReview(reserve,post){
 try{await reserve();}catch{throw Error('Review already requested, or duplicate protection unavailable. Check Jira before trying again.');}
 // Do not release the reservation: a network failure can occur after the comment was created.
 return await post();
}
