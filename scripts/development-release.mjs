import {existsSync,readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const fail=message=>{console.error(message);process.exit(1);};
const args=process.argv.slice(2);
if(args.length>1||(args.length===1&&args[0]!=='--deploy'))fail('Use npm run verify:forge or npm run deploy:dev.');
const [major,minor]=process.versions.node.split('.').map(Number);
if(major!==22||minor<13)fail('Use Node.js 22.13 or later in the Node 22 series.');
if(!existsSync('package-lock.json'))fail('Missing reviewed package-lock.json. Do not deploy from an unverified dependency tree.');
const manifest=readFileSync('manifest.yml','utf8');
if(!/^  id:\s*['"]?ari:cloud:ecosystem::app\/[0-9a-f-]{36}['"]?\s*$/mi.test(manifest))fail('Register the app with forge register Synqra on your own Atlassian account first.');
function run(command,params){
 console.log('> '+[command,...params].join(' '));
 const r=spawnSync(command,params,{stdio:'inherit',shell:process.platform==='win32'});
 if(r.error||r.status!==0)fail('Release stopped at '+command+' '+params.join(' '));
}
run('npm',['ci','--no-audit','--no-fund']);
run('node',['scripts/check-resolved-dependencies.mjs']);
run('npm',['test']);
run('npm',['run','build']);
run('npm',['audit','--omit=dev','--audit-level=high']);
run('forge',['lint','--environment','development']);
if(args[0]==='--deploy')run('forge',['deploy','--environment','development']);
else console.log('Development preflight passed. No deployment performed.');
