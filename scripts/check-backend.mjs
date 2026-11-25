import {createRequire} from 'node:module';
import {existsSync} from 'node:fs';
// Vite already depends on esbuild. Resolve its locked copy rather than install another tool.
const require=createRequire(import.meta.url);
const viteRequire=createRequire(require.resolve('vite/package.json'));
const {build}=viteRequire('esbuild');
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
