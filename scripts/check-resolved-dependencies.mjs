import {readFileSync} from 'node:fs';
const lock=JSON.parse(readFileSync('package-lock.json','utf8'));
const manifest=JSON.parse(readFileSync('package.json','utf8'));
const packages=lock.packages;
if(!packages||!packages[''])throw Error('Missing npm lockfile package metadata.');
for(const [name,version] of Object.entries({...manifest.dependencies,...manifest.devDependencies})){
 if(packages['node_modules/'+name]?.version!==version)throw Error('Direct dependency does not match reviewed pin: '+name);
}
const views=Object.entries(packages).filter(([path])=>path.endsWith('/prosemirror-view'));
if(!views.length)throw Error('Expected ProseMirror dependency not present.');
for(const [path,meta] of views){
 console.log(path+': '+meta.version);
 if(meta.version!=='1.42.3')throw Error('Unexpected ProseMirror version: '+path);
}
console.log('Reviewed dependency pins and ProseMirror copies verified.');
