import {readFileSync} from 'node:fs';
const raw=readFileSync('package-lock.json','utf8');
const lock=JSON.parse(raw);
if(lock.lockfileVersion!==3||!lock.packages)throw Error('Expected npm lockfile v3.');
for(const [path,pkg] of Object.entries(lock.packages)){
 if(!path)continue;
 if(pkg.link||typeof pkg.resolved!=='string'||!pkg.integrity)throw Error('Unexpected non-registry package: '+path);
 const url=new URL(pkg.resolved);
 if(url.origin!=='https://registry.npmjs.org'||url.username||url.password||url.search||url.hash)throw Error('Refusing to export non-public registry metadata.');
}
// Each line is a JSON-escaped text chunk. Logs contain only reviewed public dependency metadata.
const safe=JSON.stringify(lock,null,2)+'\n';
for(let i=0;i<safe.length;i+=1500)console.log('SYNQRA_LOCK_PART '+JSON.stringify(safe.slice(i,i+1500)));
console.log('SYNQRA_LOCK_END '+safe.length);
