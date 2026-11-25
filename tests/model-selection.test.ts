import {test} from 'node:test';
import assert from 'node:assert/strict';
import {chooseHaiku} from '../shared/semantic.mjs';
test("prefers active Haiku 5.5",()=>assert.equal((()=>chooseHaiku({models:[{model:'claude-haiku-4-5-20251001',status:'active'},{model:'claude-haiku-5-5',status:'active'}]})==='claude-haiku-5-5')(),true));
test("uses older active Haiku when 5.5 is not active",()=>assert.equal((()=>chooseHaiku({models:[{model:'claude-haiku-5-5',status:'deprecated'},{model:'claude-haiku-4-5-20251001',status:'ACTIVE'}]})==='claude-haiku-4-5-20251001')(),true));
test("never silently uses a higher-priced model",()=>assert.equal((()=>{try{chooseHaiku({models:[{model:'claude-sonnet-5',status:'active'}]});return false;}catch{return true;}})(),true));
test("rejects malformed availability response",()=>assert.equal((()=>{try{chooseHaiku(null);return false;}catch{return true;}})(),true));
