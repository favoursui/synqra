import {test} from 'node:test';
import assert from 'node:assert/strict';
import {resolveTheme,pageMeta} from '../shared/presentation.mjs';
test("uses a saved light preference",()=>assert.equal((()=>resolveTheme('light',true)==='light')(),true));
test("uses a saved dark preference",()=>assert.equal((()=>resolveTheme('dark',false)==='dark')(),true));
test("falls back to the system theme",()=>assert.equal((()=>resolveTheme(null,true)==='dark'&&resolveTheme('invalid',false)==='light')(),true));
test("provides unique navigation titles",()=>assert.equal((()=>new Set(['Overview','Conflicts','Context','Saved','Assistant','Activity'].map(p=>pageMeta(p).title)).size===6)(),true));
test("falls back safely for unknown pages",()=>assert.equal((()=>pageMeta('constructor').title==='Workspace overview'&&pageMeta('missing').title==='Workspace overview')(),true));
