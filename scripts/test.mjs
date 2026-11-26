import {createRequire} from 'node:module';
import {mkdtemp,readdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';

const require=createRequire(import.meta.url);
const viteRequire=createRequire(require.resolve('vite/package.json'));
const {build}=viteRequire('esbuild');
const names=(await readdir('tests')).filter(name=>name.endsWith('.test.ts')).sort();
if(!names.length)throw Error('No tests found.');
const outdir=await mkdtemp(join(tmpdir(),'synqra-tests-'));
try{
 await build({
  entryPoints:names.map(name=>resolve('tests',name)),
  outdir,bundle:true,platform:'node',target:'node22',format:'cjs',
  outExtension:{'.js':'.cjs'},logLevel:'warning'
 });
 const result=spawnSync(process.execPath,['--test',...names.map(name=>join(outdir,name.replace(/\.ts$/,'.cjs')))],{stdio:'inherit'});
 if(result.error)throw result.error;
 process.exitCode=result.status??1;
}finally{await rm(outdir,{recursive:true,force:true});}
