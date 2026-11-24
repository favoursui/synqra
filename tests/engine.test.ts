import {test} from 'node:test';
import assert from 'node:assert/strict';
import {compare,adfText,sampleSpec,sampleIssue} from '../shared/engine.ts';
test('finds three mismatches and treats equivalent timeout units as equal',()=>{const c=compare(sampleSpec,sampleIssue);assert.deepEqual(c.map(x=>x.field),['maximum slippage','api version','release date']);assert.equal(c[0].expected,'0.5%');assert.equal(c[0].actual,'2%');});
test('does not flag matching values',()=>{assert.deepEqual(compare(sampleSpec,{...sampleIssue,text:sampleSpec.text}),[])});
test('does not compare duplicate, missing or unknown-unit fields',()=>{assert.deepEqual(compare({...sampleSpec,text:'Maximum slippage: 1%\nMaximum slippage: 0.5%\nSession timeout: 30 minutes'}, {...sampleIssue,text:'Maximum slippage: 2%\nSession timeout: 30 ticks'}),[])});
test('extracts separate ADF paragraphs and hard breaks',()=>{assert.equal(adfText({type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'API version: v2'},{type:'hardBreak'},{type:'text',text:'Maximum slippage: 0.5%'}]}]}),'API version: v2\nMaximum slippage: 0.5%\n')});
test('ignores invalid date values',()=>{assert.deepEqual(compare({...sampleSpec,text:'Release date: 2026-02-30'},{...sampleIssue,text:'Release date: 2026-03-01'}),[])});
