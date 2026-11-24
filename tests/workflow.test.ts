import {test} from 'node:test';
import assert from 'node:assert/strict';
import {assemble,parseIssueKeys,assertUnchanged,reviewText,commentBody} from '../shared/workflow.ts';
import {sampleSpec,sampleIssue} from '../shared/engine.ts';
test('normalizes keys and removes duplicates',()=>assert.deepEqual(parseIssueKeys('cad-102, CAD-102\nCAD-103'),['CAD-102','CAD-103']));
test('rejects bad and excessive keys',()=>{for(const v of ['',null,'../../abc','CAD-1 CAD-2 CAD-3 CAD-4 CAD-5 CAD-6 CAD-7 CAD-8 CAD-9'])assert.throws(()=>parseIssueKeys(v));});
test('groups findings by issue and reports failed reads separately',()=>{const r=assemble(sampleSpec,[sampleIssue,{...sampleIssue,id:'CAD-103',text:sampleSpec.text}],[{issueId:'CAD-104',message:'unavailable'}]);assert.equal(r.findings.length,3);assert.equal(r.issues.length,2);assert.equal(r.failures.length,1);assert.equal(r.findings[0].issueId,'CAD-102');});
test('refuses stale and missing evidence',()=>{const f=assemble(sampleSpec,[sampleIssue]).findings[0];assert.doesNotThrow(()=>assertUnchanged(f,f));assert.throws(()=>assertUnchanged(f,{...f,actual:'3%'}));assert.throws(()=>assertUnchanged(f,{...f,evidence:['forged',f.evidence[1]]}));assert.throws(()=>assertUnchanged(undefined,f));});
test('review is evidence-backed and rendered as ADF text',()=>{const f=assemble(sampleSpec,[sampleIssue]).findings[0];const text=reviewText(sampleSpec,f);assert.match(text,/0\.5%/);assert.match(text,/No requirement was changed/);assert.equal(commentBody(text).content.length,text.split('\n').length);});
