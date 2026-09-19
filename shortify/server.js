import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import fs from 'fs';
import archive from 'archiver';
import { spawn } from 'child_process';

const app=express();
const ROOT=path.dirname(fileURLToPath(import.meta.url));
const PORT=Number(process.env.PORT||5173);
const DATA=path.join(ROOT,'data');
const PROJECTS=path.join(DATA,'projects');
const QUEUE=path.join(DATA,'queue');
const MEDIA=path.join(ROOT,'media');
const CANCELLED=path.join(DATA,'cancelled');
for(const d of [DATA,PROJECTS,QUEUE,MEDIA,CANCELLED])fs.mkdirSync(d,{recursive:true});
app.use((req,res,next)=>{
  res.header('Access-Control-Allow-Origin','*');
  res.header('Access-Control-Allow-Methods','GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers','Content-Type, Authorization');
  if(req.method==='OPTIONS')return res.sendStatus(200);
  next();
});
app.use(express.json({limit:'100kb'}));
app.use('/media',express.static(MEDIA,{fallthrough:false,maxAge:'1h'}));

const projectPath=id=>path.join(PROJECTS,`${id}.json`);
const readProject=id=>{try{return JSON.parse(fs.readFileSync(projectPath(id),'utf8'))}catch{return null}};
const writeJson=(file,data)=>{const tmp=`${file}.tmp`;fs.writeFileSync(tmp,JSON.stringify(data,null,2));fs.renameSync(tmp,file)};
const validYouTube=value=>{try{const u=new URL(value.trim());return /(?:youtube\.com|youtu\.be)$/i.test(u.hostname)}catch{return false}};
const safeProject=p=>({...p,sourcePath:undefined,workDir:undefined,errorDetail:undefined});
const workerOnline=()=>{try{const w=JSON.parse(fs.readFileSync(path.join(DATA,'worker.json'),'utf8'));const maxAge=w.status==='processing'?120000:45000;return Date.now()-new Date(w.lastSeen).getTime()<maxAge}catch{return false}};

// Permanent Worker Supervisor
let workerProc=null;
const PYTHON_CMD=process.env.PYTHON_BIN||(process.platform==='win32'?'python':'python3');
function startWorker(){
  if(workerProc) return;
  console.log(`[Worker Supervisor] Starting persistent worker using ${PYTHON_CMD}...`);
  try {
    workerProc=spawn(PYTHON_CMD,['worker.py'],{cwd:ROOT,stdio:'inherit'});
    workerProc.on('error',(err)=>{
      console.error('[Worker Supervisor] Process error:',err.message);
      workerProc=null;
      setTimeout(ensureWorker,3000);
    });
    workerProc.on('exit',(code)=>{
      console.log(`[Worker Supervisor] Worker exited (code ${code}). Auto-restarting in 2s...`);
      workerProc=null;
      setTimeout(ensureWorker,2000);
    });
  } catch(e) {
    console.error('[Worker Supervisor] Failed to start:',e);
    workerProc=null;
  }
}
function ensureWorker(){
  if(!workerProc && !workerOnline()){
    startWorker();
  }
}
startWorker();
setInterval(ensureWorker,10000);

app.get('/api/health',(_,res)=>{let worker={online:false,status:'offline'};try{const data=JSON.parse(fs.readFileSync(path.join(DATA,'worker.json'),'utf8'));const age=Date.now()-new Date(data.lastSeen).getTime();const maxAge=data.status==='processing'?120000:45000;worker={...data,online:age<maxAge,ageMs:age,status:age<maxAge?(data.status||'idle'):'offline'}}catch{}res.json({ok:true,service:'myshort-api',workerMode:'filesystem-queue',worker})});
app.post('/api/projects',(req,res)=>{const {youtubeUrl,clipCount=5,clipLength=30,language='English',captions=true}=req.body||{};if(!validYouTube(youtubeUrl))return res.status(400).json({error:'Please enter a valid YouTube URL.'});if(!workerOnline())return res.status(503).json({error:'The video worker is offline. Start the worker before creating a project.'});if(!Number.isInteger(Number(clipCount))||Number(clipCount)<1||!Number.isFinite(Number(clipLength))||Number(clipLength)<1)return res.status(400).json({error:'Clip count and duration must be positive numbers.'});const id=`project_${crypto.randomUUID().slice(0,10)}`;const project={id,youtubeUrl,clipCount:Number(clipCount),clipLength:Number(clipLength),language,captions:Boolean(captions),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),status:'queued',progress:0,stage:0,stageLabel:'Waiting for a worker',clips:[]};writeJson(projectPath(id),project);writeJson(path.join(QUEUE,`${id}.json`),{projectId:id,createdAt:project.createdAt});res.status(202).json(safeProject(project))});
app.get('/api/projects',(_,res)=>{const projects=fs.readdirSync(PROJECTS).filter(x=>x.endsWith('.json')).map(x=>readProject(path.basename(x,'.json'))).filter(Boolean).map(safeProject);res.json({projects})});
app.delete('/api/projects',(_,res)=>{const files=fs.readdirSync(PROJECTS).filter(x=>x.endsWith('.json'));for(const file of files){const id=path.basename(file,'.json');fs.writeFileSync(path.join(CANCELLED,id),new Date().toISOString());fs.rmSync(path.join(PROJECTS,file),{force:true})}for(const file of fs.readdirSync(QUEUE))fs.rmSync(path.join(QUEUE,file),{force:true,recursive:true});for(const entry of fs.readdirSync(MEDIA))fs.rmSync(path.join(MEDIA,entry),{force:true,recursive:true});const sources=path.join(DATA,'sources');if(fs.existsSync(sources))for(const entry of fs.readdirSync(sources))fs.rmSync(path.join(sources,entry),{force:true,recursive:true});res.json({deleted:files.length})});
app.get('/api/projects/:id',(req,res)=>{const p=readProject(req.params.id);if(!p)return res.status(404).json({error:'Project not found.'});res.json(safeProject(p))});
app.get('/api/projects/:id/clips',(req,res)=>{const p=readProject(req.params.id);if(!p)return res.status(404).json({error:'Project not found.'});if(p.status!=='completed')return res.status(409).json({error:`Project is ${p.status}.`});res.json({clips:p.clips})});
app.patch('/api/clips/:id',(req,res)=>{const files=fs.readdirSync(PROJECTS).filter(x=>x.endsWith('.json'));for(const file of files){const p=readProject(path.basename(file,'.json'));const clip=p?.clips?.find(c=>c.id===req.params.id);if(!clip)continue;for(const key of ['title','caption','startTime','endTime'])if(req.body?.[key]!==undefined)clip[key]=req.body[key];p.updatedAt=new Date().toISOString();writeJson(projectPath(p.id),p);return res.json({clip})}res.status(404).json({error:'Clip not found.'})});
app.post('/api/clips/:id/render',(req,res)=>res.status(501).json({error:'Edited re-rendering requires the original source retention worker, which is not enabled in the local MVP.'}));
app.get('/api/projects/:id/download-all',(req,res)=>{const p=readProject(req.params.id);if(!p||p.status!=='completed')return res.status(404).json({error:'Completed project not found.'});res.attachment(`${p.id}-shorts.zip`);const zip=archive('zip',{zlib:{level:6}});zip.on('error',e=>res.destroy(e));zip.pipe(res);for(const c of p.clips){const file=path.join(MEDIA,p.id,path.basename(c.videoUrl.split('?')[0]));if(fs.existsSync(file))zip.file(file,{name:`short-${c.number}.mp4`})}zip.finalize()});
app.delete('/api/projects/:id',(req,res)=>{const file=projectPath(req.params.id);if(!fs.existsSync(file))return res.status(404).json({error:'Project not found.'});fs.writeFileSync(path.join(CANCELLED,req.params.id),new Date().toISOString());fs.rmSync(file,{force:true});fs.rmSync(path.join(QUEUE,`${req.params.id}.json`),{force:true});fs.rmSync(path.join(MEDIA,req.params.id),{recursive:true,force:true});for(const ext of ['.mp4','.transcript.json'])fs.rmSync(path.join(DATA,'sources',`${req.params.id}${ext}`),{force:true});res.status(204).end()});

app.get('/api/cookies',(_,res)=>{
  const p=path.join(DATA,'cookies.txt');
  const configured=fs.existsSync(p)&&fs.statSync(p).size>10;
  res.json({configured});
});
app.post('/api/cookies',(req,res)=>{
  const {cookies}=req.body||{};
  if(!cookies||typeof cookies!=='string'||cookies.trim().length<10){
    return res.status(400).json({error:'Please paste valid cookie text.'});
  }
  fs.writeFileSync(path.join(DATA,'cookies.txt'),cookies.trim(),'utf8');
  res.json({ok:true,configured:true});
});

app.use(express.static(path.join(ROOT,'dist')));
app.use((req,res)=>res.sendFile(path.join(ROOT,'dist','index.html')));
app.listen(PORT,'0.0.0.0',()=>console.log(`MyShort running on http://0.0.0.0:${PORT}`));
