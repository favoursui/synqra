import {createRequire} from 'node:module';
import {existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
// Vite already depends on esbuild. Resolve its locked copy rather than install another tool.
const require=createRequire(import.meta.url);
const nodeTypes=require('@types/node/package.json');
if(!nodeTypes.version.startsWith('22.'))throw Error('Expected Node 22 type declarations.');
const viteRequire=createRequire(require.resolve('vite/package.json'));
const {build}=viteRequire('esbuild');
const typecheck=spawnSync(process.execPath,[require.resolve('typescript/bin/tsc'),'--noEmit','-p','tsconfig.json'],{stdio:'inherit'});
if(typecheck.error||typecheck.status!==0)throw Error('Backend TypeScript check failed.');
const result=await build({
 entryPoints:['src/index.ts'],
 bundle:true,platform:'node',target:'node22',format:'cjs',
 packages:'external',write:false,metafile:true,logLevel:'warning'
});
if(!result.outputFiles?.length||!result.outputFiles[0].text.length)throw Error('Missing backend bundle.');
const imports=Object.values(result.metafile.outputs).flatMap(o=>o.imports).filter(i=>i.external);
for(const {path} of imports){
 if(path.startsWith('node:'))continue;
 try{require.resolve(path);}catch{throw Error('Unresolved backend dependency: '+path);}
}
if(!existsSync('manifest.yml'))throw Error('Missing Forge manifest.');
console.log('Backend entry and local imports compiled successfully. External runtime modules resolve.');
console.log('This is an offline compilation check, not Forge lint or a runtime integration test.');
