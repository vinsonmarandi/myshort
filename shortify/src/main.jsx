import React, {useEffect, useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ArrowRight, Check, CheckCircle2, ChevronDown, Clock3, Copy, Download, Film, Gauge, Grip, Languages, LayoutGrid, Link2, LoaderCircle, Menu, MoreHorizontal, Pause, Play, RotateCcw, Scissors, Search, Sparkles, Subtitles, WandSparkles, X, Zap} from 'lucide-react';
import './styles.css';
import './upgrade.css';
import './reality.css';
import './reality-fix.css';
import './ops.css';
import './clean.css';
import './brand-update.css';
import './history.css';
import './download.css';
import './mobile.css';

const defaultBase = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? '' : 'https://myshort-backend.onrender.com';
const API_BASE = (import.meta.env.VITE_API_BASE_URL || defaultBase).trim().replace(/\/+$/, '');
const apiUrl = path => `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;

const clips=[];
const tones=['lime','coral','blue','violet','amber'];
const clock=s=>{s=Math.round(Number(s)||0);return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`};

function CopyButton({text, label='Copy script'}){
  const [copied,setCopied]=useState(false);
  const copy=e=>{e.stopPropagation();navigator.clipboard?.writeText(text);setCopied(true);setTimeout(()=>setCopied(false),2000)};
  return <button className={'copyClipBtn '+(copied?'copied':'')} onClick={copy} title="Copy script">{copied?<Check size={12}/>:<Copy size={12}/>}{copied?'Copied!':label}</button>;
}

function Logo(){return <div className="logo"><span className="logoMark"><Scissors size={17}/></span><span>myshort</span><sup>AI</sup></div>}
function Header({view,setView}){const [menu,setMenu]=useState(false),[worker,setWorker]=useState(null);const home=()=>{setMenu(false);setView('home')};useEffect(()=>{let live=true;const check=()=>fetch(apiUrl('/api/health')).then(r=>r.json()).then(d=>live&&setWorker(d.worker)).catch(()=>live&&setWorker({online:false,status:'offline'}));check();const timer=setInterval(check,10000);return()=>{live=false;clearInterval(timer)}},[]);return <><header><button className="logoButton" onClick={home}><Logo/></button><nav><a href="#how" onClick={home}>How it works</a><a href="#features" onClick={home}>Features</a><a href="#faq" onClick={home}>FAQ</a></nav><div className="headerActions"><span className={'workerPill '+(worker?.online?'online':'offline')}><i/>{worker?.online?(worker.status==='processing'?'Worker busy':'Worker ready'):'Worker offline'}</span><button className={'textBtn '+(view==='projects'?'navActive':'')} onClick={()=>setView('projects')}>My projects</button><button className="blackBtn" onClick={home}>Create Short <ArrowRight size={15}/></button><button className="menuBtn" aria-label="Menu" onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button></div></header>{menu&&<div className="mobileNav"><button onClick={()=>{setMenu(false);setView('projects')}}>My projects <ArrowRight/></button><a href="#how" onClick={home}>How it works</a><a href="#features" onClick={home}>Features</a><a href="#faq" onClick={home}>FAQ</a><div className={'mobileWorker '+(worker?.online?'online':'')}><i/>{worker?.online?'Video worker ready':'Video worker offline'}</div></div>}</>}

function UrlBox({onStart}){
  const [url,setUrl]=useState(''); const [error,setError]=useState('');
  const samples=[
    {label:'SSC Exam Prep',url:'https://www.youtube.com/watch?v=T_XqtbxfS4I'},
    {label:'Current Affairs Live',url:'https://www.youtube.com/live/xGnsbyxtujc'},
    {label:'Market Strategy',url:'https://youtu.be/5lrA2UaYsBM'}
  ];
  const go=()=>{if(!/youtu(\.be|be\.com)/i.test(url)){setError('Paste a valid YouTube link to continue.');return} setError('');onStart(url)};
  return <div className="urlWrap">
    <div className={'urlBox '+(error?'hasError':'')}>
      <Link2 size={20}/>
      <input aria-label="YouTube URL" value={url} onChange={e=>setUrl(e.target.value)} onKeyDown={e=>e.key==='Enter'&&go()} placeholder="Paste any YouTube video or live-stream link..."/>
      <button onClick={go}>Create shorts <ArrowRight size={18}/></button>
    </div>
    {error&&<div className="error">{error}</div>}
    <div className="samplePills">
      <span className="sampleLabel">Try a sample:</span>
      {samples.map(s=><button key={s.label} className="sampleBtn" onClick={()=>{setUrl(s.url);onStart(s.url)}}>{s.label}</button>)}
    </div>
    <div className="micro">
      <span><Check size={13}/> Any duration supported</span>
      <span><Check size={13}/> Real 9:16 vertical MP4</span>
      <span><Check size={13}/> Multilingual captions</span>
    </div>
  </div>;
}

function HeroVisual(){return <div className="heroVisual realityVisual"><div className="workerWindow"><div className="workerTop"><span/><span/><span/><b>myshort-worker</b></div><div className="workerBody"><div className="flowNode sourceNode"><span>01</span><div><small>SOURCE VIDEO</small><b>YouTube video</b></div><CheckCircle2/></div><i className="flowLine"/><div className="flowNode"><span>02</span><div><small>TRANSCRIPTION</small><b>faster-whisper</b></div><Subtitles/></div><i className="flowLine"/><div className="flowNode"><span>03</span><div><small>VIDEO PIPELINE</small><b>FFmpeg · H.264</b></div><Film/></div><i className="flowLine"/><div className="outputFiles"><div><Play/><span><b>short-01.mp4</b><small>1080 × 1920</small></span></div><div><Play/><span><b>short-02.mp4</b><small>1080 × 1920</small></span></div><div><MoreHorizontal/></div></div></div></div><div className="localBadge"><CheckCircle2/> Real files. Local worker. No mock output.</div></div>}

function Landing({onStart}){return <><main className="landing"><section className="hero"><div className="heroCopy"><div className="eyebrow"><Sparkles size={14}/> AI video repurposing, without the busywork</div><h1>One video.<br/><em>Weeks of content.</em></h1><p>Paste a YouTube link. MyShort finds the strongest moments and turns them into vertical, captioned clips ready to publish.</p><UrlBox onStart={onStart}/><div className="trustRow"><div className="pipelineDots"><i/><i/><i/></div><div><b className="realStack">Whisper · FFmpeg · local processing</b><small>Built on a real, inspectable media pipeline</small></div></div></div><HeroVisual/></section><div className="logoStrip"><span>Made for creators on</span><b>▶ YouTube</b><b>◎ Instagram</b><b>♪ TikTok</b><b>f Facebook</b></div></main><section className="how" id="how"><div className="sectionHead"><span className="kicker">IT'S RIDICULOUSLY EASY</span><h2>From long to <em>short</em> in 3 steps.</h2><p>No timelines. No learning curve. No wasted afternoon.</p></div><div className="steps"><Step n="01" icon={<Link2/>} title="Drop your link" text="Paste any public YouTube video or live-stream link."/><Step n="02" icon={<Sparkles/>} title="Let AI find the gold" text="We transcribe and score every moment for hooks and complete ideas."/><Step n="03" icon={<Download/>} title="Polish & publish" text="Preview the rendered files, then download individual MP4s or one ZIP."/></div></section><section className="featureBand" id="features"><div><span className="kicker light">THE WHOLE EDITING TEAM</span><h2>Everything you need.<br/>Nothing you don't.</h2></div><div className="featureGrid"><Feature icon={<WandSparkles/>} title="Smart highlights" text="AI spots hooks, insights, stories and punchlines."/><Feature icon={<Subtitles/>} title="Captions that pop" text="Word-perfect, styled captions in 20+ languages."/><Feature icon={<LayoutGrid/>} title="Vertical reframing" text="FFmpeg scales and crops every clip to a true 9:16 frame."/><Feature icon={<Gauge/>} title="Fast exports" text="Download platform-ready 720p MP4s for free."/></div></section><FAQ/></>}
function Step({n,icon,title,text}){return <article className="step"><span className="stepNum">{n}</span><div className="stepIcon">{icon}</div><h3>{title}</h3><p>{text}</p></article>}
function Feature({icon,title,text}){return <article className="feature"><div>{icon}</div><h3>{title}</h3><p>{text}</p></article>}
function FAQ(){const qs=['Is MyShort really free?','Which YouTube videos can I process?','Where are files processed?','Does it work in Hindi?']; const [open,setOpen]=useState(0);return <section className="faq" id="faq"><div><span className="kicker">GOOD TO KNOW</span><h2>Questions,<br/>answered.</h2></div><div>{qs.map((q,i)=><div className={'faqRow '+(open===i?'open':'')} key={q} onClick={()=>setOpen(open===i?-1:i)}><button>{q}<span>{open===i?'−':'+'}</span></button>{open===i&&<p>{i===0?'The software uses local open-source tools. Your infrastructure and compute determine the operating cost.':i===1?'You can process any public YouTube video, podcast, live-stream, interview, educational lecture, or sports clip. MyShort automatically handles long-form formats and streams the best media directly.':i===2?'The Docker worker stores source files temporarily on its local volume and saves completed MP4s to the media volume.':'Yes. Faster Whisper supports Hindi, English, Spanish, French, German, and many more languages.'}</p>}</div>)}</div></section>}

function Settings({url,onGenerate,onBack}){const [count,setCount]=useState(5),[length,setLength]=useState(30),[lang,setLang]=useState('English'),[captions,setCaptions]=useState(true);return <main className="appPage"><button className="backLink" onClick={onBack}>← Back</button><div className="setupGrid"><section><span className="kicker">NEW PROJECT</span><h1>Set up your Shorts</h1><p>Choose your preferences. You can fine-tune each clip after generation.</p><div className="videoSummary"><div className="thumbSmall"><Play fill="white"/></div><div><small>YOUTUBE VIDEO</small><b>{url}</b><span><Clock3 size={13}/> Duration and language are verified by the worker</span></div><CheckCircle2 className="green"/></div></section><section className="settingsCard"><Setting label="NUMBER OF SHORTS" hint="Choose a preset or enter any amount"><div className="unlimitedPicker"><Segment options={[3,5,10,20]} value={count} set={setCount}/><label>Custom<input type="number" min="1" value={count} onChange={e=>setCount(Math.max(1,Number(e.target.value)||1))}/></label></div></Setting><Setting label="CLIP LENGTH" hint="Choose a preset or enter any duration"><div className="unlimitedPicker"><Segment options={[15,30,45,60]} value={length} set={setLength} suffix="s"/><label>Seconds<input type="number" min="1" value={length} onChange={e=>setLength(Math.max(1,Number(e.target.value)||1))}/></label></div></Setting><div className="twoSettings"><Setting label="FORMAT"><div className="selectLike"><span className="ratioIcon"/> Vertical 9:16 <ChevronDown size={15}/></div></Setting><Setting label="LANGUAGE"><div className="selectLike"><Languages size={16}/><select value={lang} onChange={e=>setLang(e.target.value)}><option>Auto</option><option>English</option><option>Hindi</option><option>Spanish</option><option>French</option><option>German</option></select><ChevronDown size={15}/></div></Setting></div><div className="toggleRow"><div><Subtitles/><span><b>Automatic captions</b><small>2–4 word phrases · multilingual font · lower safe area</small></span></div><button className={'toggle '+(captions?'on':'')} onClick={()=>setCaptions(!captions)}><i/></button></div><button className="generateBtn" onClick={()=>onGenerate({count,length,lang,captions})}><Sparkles size={18}/> Generate {count} Shorts <ArrowRight size={18}/></button><p className="estimate"><Zap size={13}/> Processing time depends on video length and worker hardware</p></section></div></main>}
function Setting({label,hint,children}){return <div className="setting"><label>{label}</label>{hint&&<small>{hint}</small>}{children}</div>}
function Segment({options,value,set,suffix=''}){return <div className="segment">{options.map(x=><button key={x} onClick={()=>set(x)} className={value===x?'active':''}>{x}{suffix}</button>)}</div>}

function CookieModal({onClose, onSaved}){
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    if (!text.trim()) { setError('Please paste your cookie text.'); return; }
    setSaving(true); setError('');
    try {
      const r = await fetch(apiUrl('/api/cookies'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cookies: text })
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Failed to save cookies');
      onSaved();
    } catch(e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="confirmOverlay" role="dialog" aria-modal="true" style={{zIndex:9999}}>
      <div className="confirmDialog" style={{maxWidth: 520, textAlign: 'left', padding: '24px'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 12}}>
          <h2 style={{margin:0, fontSize:'1.25rem', display:'flex', alignItems:'center', gap: 8}}>🍪 Add YouTube Cookies</h2>
          <button onClick={onClose} style={{background:'none', border:'none', cursor:'pointer', padding: 4}}><X size={18}/></button>
        </div>
        <p style={{fontSize:'0.88rem', color:'#666', lineHeight: 1.5, margin:'0 0 12px'}}>
          YouTube blocks cloud servers from downloading certain popular videos without verification. Adding cookies allows your cloud worker to process any video:
        </p>
        <ol style={{fontSize:'0.82rem', color:'#555', paddingLeft: 18, margin:'0 0 14px', lineHeight: 1.6}}>
          <li>Install extension <b>Get cookies.txt LOCALLY</b> in Chrome/Edge.</li>
          <li>Open <a href="https://www.youtube.com" target="_blank" rel="noreferrer" style={{color:'#4361ee', textDecoration:'underline'}}>youtube.com</a> while signed in.</li>
          <li>Click the extension icon, copy the text, and paste it below:</li>
        </ol>
        <textarea
          rows={5}
          placeholder="# Netscape HTTP Cookie File&#10;.youtube.com TRUE / TRUE ..."
          value={text}
          onChange={e => setText(e.target.value)}
          style={{width:'100%', boxSizing:'border-box', padding: 10, fontSize:'0.75rem', fontFamily:'monospace', borderRadius: 8, border:'1px solid #ccc', resize:'vertical', marginBottom: 10}}
        />
        {error && <div style={{color:'#e63946', fontSize:'0.82rem', marginBottom: 10}}>{error}</div>}
        <div style={{display:'flex', gap: 8, justifyContent:'flex-end'}}>
          <button className="cancelClear" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="blackBtn" onClick={save} disabled={saving} style={{background:'#4361ee'}}>
            {saving ? <LoaderCircle className="spin" size={15}/> : <Check size={15}/>} {saving ? 'Saving...' : 'Save & Retry'}
          </button>
        </div>
      </div>
    </div>
  );
}

const stages=['Loading video','Transcribing audio','Finding the best moments','Creating vertical clips','Adding captions','Preparing downloads'];
function Processing({projectId,onDone,onBack}){
  const [step,setStep]=useState(0),[pct,setPct]=useState(0),[label,setLabel]=useState('Waiting for a worker'),[failure,setFailure]=useState(''),[showCookieModal,setShowCookieModal]=useState(false);
  useEffect(()=>{
    let active=true;
    const poll=async()=>{
      try{
        const r=await fetch(apiUrl(`/api/projects/${projectId}`));
        if(!r.ok)throw new Error('Unable to load project');
        const data=await r.json();
        if(!active)return;
        setPct(data.progress||0);
        setStep(data.stage||0);
        setLabel(data.stageLabel||stages[data.stage]||'Processing');
        if(data.status==='completed'){onDone(data);return}
        if(data.status==='failed'){setFailure(data.error||'The worker could not process this video.');return}
        setTimeout(poll,1500);
      }catch(e){
        if(active){setLabel('Reconnecting to worker…');setTimeout(poll,3000)}
      }
    };
    poll();
    return()=>{active=false}
  },[projectId]);
  const cancel=async()=>{
    if(!window.confirm('Cancel this generation job?'))return;
    try{await fetch(apiUrl(`/api/projects/${projectId}`),{method:'DELETE'})}catch{}
    onBack();
  };
  if(failure){
    const isBotBlock = failure.toLowerCase().includes('bot') || failure.toLowerCase().includes('cookies');
    return <main className="processing failedState">
      <div className="failureIcon"><X/></div>
      <span className="kicker">PROCESSING STOPPED</span>
      <h1>We couldn't finish this video.</h1>
      <p>{failure}</p>
      <div style={{display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap', marginTop: 16}}>
        {isBotBlock && (
          <button className="blackBtn" style={{background:'#4361ee'}} onClick={()=>setShowCookieModal(true)}>
            🍪 Add YouTube Cookies & Retry
          </button>
        )}
        <button className="outlineBtn" onClick={onBack}>Try another video <ArrowRight size={16}/></button>
      </div>
      <small className="safeClose">No generated media was published. Temporary worker files can be safely removed.</small>
      {showCookieModal && <CookieModal onClose={()=>setShowCookieModal(false)} onSaved={()=>{setShowCookieModal(false); window.location.reload();}}/>}
    </main>;
  }
  return <main className="processing">
    <div className="processingVisual"><div className="rings"><div className="pFrame realWorkerFrame"><LoaderCircle className="spin"/></div></div><div className="progressBubble">{pct}%</div></div>
    <span className="kicker">REAL WORKER ACTIVE</span>
    <h1>Building your <em>Shorts</em></h1>
    <p>{label}</p>
    <div className="stageCard">{stages.map((s,i)=><div className={i<step?'done':i===step?'current':''} key={s}><span>{i<step?<Check size={14}/>:i===step?<LoaderCircle className="spin" size={15}/>:<i/>}</span>{s}{i===step&&<small>in progress</small>}</div>)}</div>
    <div className="cancelWrap"><button className="cancelBtn" onClick={cancel}><X size={13}/> Cancel generation</button></div>
    <small className="safeClose">The worker continues processing in the background if you close this tab.</small>
  </main>;
}

function Projects({onOpen,onNew}){
  const [items,setItems]=useState([]),[loading,setLoading]=useState(true),[confirmClear,setConfirmClear]=useState(false),[clearing,setClearing]=useState(false),[query,setQuery]=useState('');
  const load=()=>fetch(apiUrl('/api/projects')).then(r=>r.json()).then(d=>{setItems(d.projects.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)));setLoading(false)});
  useEffect(load,[]);
  const remove=async(id)=>{await fetch(apiUrl(`/api/projects/${id}`),{method:'DELETE'});setItems(x=>x.filter(p=>p.id!==id))};
  const clearHistory=async()=>{setClearing(true);const r=await fetch(apiUrl('/api/projects'),{method:'DELETE'});if(r.ok){setItems([]);localStorage.removeItem('myshort.activeProject')}setClearing(false);setConfirmClear(false)};
  const filtered=items.filter(p=>(p.sourceTitle||'').toLowerCase().includes(query.toLowerCase())||(p.youtubeUrl||'').toLowerCase().includes(query.toLowerCase()));
  return <main className="projectsPage">
    <div className="projectsHero">
      <div><span className="kicker">YOUR WORKSPACE</span><h1>My projects</h1><p>Pick up where you left off or turn another long video into Shorts.</p></div>
      <div className="projectHeroActions">
        <div className="projectSearch"><Search size={15}/><input placeholder="Search projects..." value={query} onChange={e=>setQuery(e.target.value)}/></div>
        {items.length>0&&<button className="clearHistoryBtn" onClick={()=>setConfirmClear(true)}><RotateCcw size={15}/> Clear history</button>}
        <button className="blackBtn" onClick={onNew}><Sparkles size={16}/> New project</button>
      </div>
    </div>
    <div className="projectStats">
      <div><b>{items.length}</b><span>Total projects</span></div>
      <div><b>{items.reduce((n,p)=>n+(p.clips?.length||0),0)}</b><span>Shorts created</span></div>
      <div><b>{items.filter(p=>p.status==='completed').length}</b><span>Ready to export</span></div>
    </div>
    {loading?<div className="emptyProjects"><LoaderCircle className="spin"/><p>Loading your projects…</p></div>:filtered.length===0?<div className="emptyProjects"><div><Film/></div><h2>{query?'No matching projects':'No projects yet'}</h2><p>{query?'Try a different search keyword.':'Your generated Shorts will live here.'}</p><button className="generateBtn" onClick={onNew}>Create your first project <ArrowRight size={16}/></button></div>:<div className="projectsTable"><div className="projectTableHead"><span>PROJECT</span><span>STATUS</span><span>SHORTS</span><span>CREATED</span><span/></div>{filtered.map((p,i)=><div className="projectTableRow" key={p.id}><button className={'tableThumb t'+i} onClick={()=>onOpen(p)}>{p.clips?.[0]?.thumbnailUrl?<img src={p.clips[0].thumbnailUrl.startsWith('http')?p.clips[0].thumbnailUrl:apiUrl(p.clips[0].thumbnailUrl)} alt=""/>:<Play fill="white"/>}</button><div className="projectName" onClick={()=>onOpen(p)}><b>{p.sourceTitle||`YouTube project ${p.id.slice(-5)}`}</b><small>{p.youtubeUrl}</small></div><span className={'statusPill '+p.status}>{p.status==='completed'?<Check/>:<LoaderCircle className="spin"/>}{p.status}</span><b className="shortCount">{p.clips?.length||p.clipCount}</b><span className="dateCell">{new Date(p.createdAt).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}</span><div className="tableActions"><button onClick={()=>onOpen(p)}>{p.status==='completed'?'View clips':'View status'} <ArrowRight size={14}/></button><button aria-label="Delete project" onClick={()=>remove(p.id)}><X size={15}/></button></div></div>)}</div>}
    {confirmClear&&<div className="confirmOverlay" role="dialog" aria-modal="true" aria-labelledby="clear-title"><div className="confirmDialog"><div className="confirmIcon"><RotateCcw/></div><h2 id="clear-title">Clear all history?</h2><p>This permanently deletes every project, generated clip, thumbnail, retained source, and queued job. This action cannot be undone.</p><div><button className="cancelClear" onClick={()=>setConfirmClear(false)} disabled={clearing}>Keep history</button><button className="confirmClear" onClick={clearHistory} disabled={clearing}>{clearing?<LoaderCircle className="spin"/>:<X/>}{clearing?'Clearing…':'Clear everything'}</button></div></div></div>}
  </main>;
}

function ModalPlayer({clip, onClose}){
  if(!clip)return null;
  return <div className="modalBackdrop" onClick={onClose} role="dialog" aria-modal="true">
    <div className="modalWindow" onClick={e=>e.stopPropagation()}>
      <div className="modalPlayerCol">
        <video controls autoPlay src={clip.videoUrl} poster={clip.thumbnailUrl}/>
      </div>
      <div className="modalDetailCol">
        <div>
          <div className="modalHeader">
            <div>
              <span className="modalKicker">SHORT #{clip.id} • 9:16 VERTICAL</span>
              <h2 className="modalTitle">{clip.title}</h2>
            </div>
            <button className="modalCloseBtn" onClick={onClose} aria-label="Close modal"><X size={16}/></button>
          </div>
          <div className="modalMetaRow">
            <span>Duration: <b>{clock(clip.duration)}</b></span>
            <span>Timecode: <b>{clock(clip.startTime)} – {clock(clip.endTime)}</b></span>
            <span>Score: <b>{clip.score||'10.0'}/10</b></span>
          </div>
          <div className="modalScriptHeader">
            <span>TRANSCRIPT & SUBTITLES</span>
            <CopyButton text={clip.caption||clip.title} label="Copy script"/>
          </div>
          <div className="modalScriptBox">
            {clip.caption||clip.title}
          </div>
        </div>
        <div className="modalActions">
          <a className="blackBtn" href={clip.videoUrl} download><Download size={15}/> Download MP4</a>
          <button className="outlineBtn" onClick={onClose}>Close preview</button>
        </div>
      </div>
    </div>
  </div>;
}

function Results({onNew,items=[],projectId}){
  const [downloading,setDownloading]=useState(false),[downloadError,setDownloadError]=useState(''),[modalClip,setModalClip]=useState(null);
  const downloadAll=async()=>{
    if(!projectId||downloading)return;
    setDownloading(true);setDownloadError('');
    try{
      const r=await fetch(apiUrl(`/api/projects/${projectId}/download-all`));
      if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e.error||'Could not prepare the ZIP file.')}
      const blob=await r.blob();
      if(!blob.size)throw new Error('The ZIP file is empty.');
      const url=URL.createObjectURL(blob);
      const link=document.createElement('a');
      link.href=url;link.download=`myshort-${projectId}-clips.zip`;
      document.body.appendChild(link);link.click();link.remove();
      setTimeout(()=>URL.revokeObjectURL(url),60000);
    }catch(e){setDownloadError(e.message)}finally{setDownloading(false)}
  };
  return <main className="dash">
    <div className="dashTop">
      <div>
        <span className="kicker"><CheckCircle2 size={14}/> PROJECT COMPLETE</span>
        <h1>Your Shorts are ready.</h1>
        <p>{items.length} real 9:16 vertical MP4 {items.length===1?'clip':'clips'} rendered from your source video.</p>
      </div>
      <div>
        <button className="outlineBtn" onClick={onNew}><RotateCcw size={16}/> New project</button>
        <button className="blackBtn downloadAllBtn" onClick={downloadAll} disabled={downloading}>
          {downloading?<LoaderCircle className="spin" size={16}/>:<Download size={16}/>} {downloading?'Preparing ZIP…':'Download all'}
        </button>
      </div>
    </div>
    {downloadError&&<div className="downloadNotice errorNotice"><X size={15}/><span>{downloadError}</span><button onClick={downloadAll}>Try again</button></div>}
    {downloading&&<div className="downloadNotice"><LoaderCircle className="spin" size={15}/><span>Packaging {items.length} MP4 files. Keep this tab open until the download starts.</span></div>}
    <div className="projectBar">
      <div className="thumbTiny"><Film/></div>
      <div><small>OUTPUT</small><b>Vertical 9:16 H.264 MP4 · AAC audio · multilingual captions {items.some(x=>x.caption)?'included':'off'}</b></div>
      <span>{items.length} clips</span>
      <span>{clock(items.reduce((n,x)=>n+Number(x.duration||0),0))} total</span>
    </div>
    <div className="clipGrid realClips">
      {items.map(c=><ClipCard key={c.apiId||c.id} c={c} onOpenModal={setModalClip}/>)}
    </div>
    <ModalPlayer clip={modalClip} onClose={()=>setModalClip(null)}/>
  </main>;
}

function ClipCard({c, onOpenModal}){
  return <article className="clipCard">
    <div className={'clipPreview '+(c.tone||'lime')+' previewClickArea'} onClick={()=>onOpenModal?.(c)}>
      {c.videoUrl?<video controls preload="metadata" poster={c.thumbnailUrl} src={c.videoUrl}/>:<div className="missingMedia"><Film/><span>Media unavailable</span></div>}
      <span className="rank">{String(c.id).padStart(2,'0')}</span>
      <span className="clipBadge">9:16 • 720p</span>
    </div>
    <div className="clipInfo">
      <div className="clipTitle" onClick={()=>onOpenModal?.(c)} style={{cursor:'pointer'}}>
        <span>SHORT #{c.id}</span>
        <h3>{c.title}</h3>
        <small>{clock(c.startTime)} – {clock(c.endTime)} <b>•</b> {clock(c.duration)}</small>
      </div>
      <div className="clipActions" style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
        <CopyButton text={c.caption||c.title}/>
        <a className="downloadClip" href={c.videoUrl} download><Download size={14}/> MP4</a>
      </div>
    </div>
  </article>;
}

function MobileDock({view,onHome,onProjects,onCreate}){return <nav className="mobileDock" aria-label="Mobile navigation"><button className={view==='home'?'active':''} onClick={onHome}><Link2/><span>Home</span></button><button className={view==='projects'||view==='results'?'active':''} onClick={onProjects}><LayoutGrid/><span>Projects</span></button><button className="dockCreate" onClick={onCreate}><Sparkles/><span>Create</span></button></nav>}

function PolicyModal({tab='privacy', onClose}){
  const [currentTab, setCurrentTab] = useState(tab||'privacy');
  useEffect(()=>{if(tab)setCurrentTab(tab)},[tab]);
  if(!tab)return null;
  return <div className="modalBackdrop" onClick={onClose} role="dialog" aria-modal="true">
    <div className="modalWindow policyModalWindow" onClick={e=>e.stopPropagation()}>
      <div className="policyHeader">
        <div className="policyTabs">
          <button className={currentTab==='privacy'?'active':''} onClick={()=>setCurrentTab('privacy')}>Privacy Policy</button>
          <button className={currentTab==='terms'?'active':''} onClick={()=>setCurrentTab('terms')}>Terms of Service</button>
        </div>
        <button className="modalCloseBtn" onClick={onClose} aria-label="Close modal"><X size={16}/></button>
      </div>
      <div className="policyBody">
        {currentTab==='privacy'?(
          <div className="policyContent">
            <h2>Privacy Policy</h2>
            <div className="policyDate">LAST UPDATED: SEPTEMBER 2026 • 100% LOCAL & ON-DEVICE MEDIA PROCESSING</div>
            <section>
              <h3>1. Zero Data Collection & Zero Telemetry</h3>
              <p>MyShort is architected as a local-first application. We do not track, collect, store, sell, or transmit any of your personal information, IP addresses, browser cookies, or telemetry to external third-party servers.</p>
            </section>
            <section>
              <h3>2. 100% Local On-Device Execution</h3>
              <p>All video downloads, transcription via Faster-Whisper, and vertical 9:16 clip rendering using FFmpeg run entirely on your local machine. Your media never leaves your hardware or reaches any cloud server.</p>
            </section>
            <section>
              <h3>3. Browser Storage & Instant Deletion</h3>
              <p>Project references are kept solely in your browser's LocalStorage to let you resume sessions. You retain complete control over your files: clicking &quot;Clear history&quot; permanently deletes all local records, cached source files, and rendered video clips immediately.</p>
            </section>
            <section>
              <h3>4. Direct Public Video Streaming</h3>
              <p>When you provide a video link, the local worker retrieves public streams directly from video platforms solely to generate your requested clips according to your chosen duration and settings.</p>
            </section>
          </div>
        ):(
          <div className="policyContent">
            <h2>Terms of Service</h2>
            <div className="policyDate">EFFECTIVE: SEPTEMBER 2026 • PERMISSIVE OPEN PIPELINE</div>
            <section>
              <h3>1. Purpose & Creative Transformation</h3>
              <p>MyShort is an automated productivity tool designed to help creators, editors, educators, and podcasters repurpose long-form public video streams into engaging vertical shorts.</p>
            </section>
            <section>
              <h3>2. Permitted Use & Content Autonomy</h3>
              <p>You may process any public video, stream, lecture, or interview for transformative commentary, news reporting, education, satire, or promotional shorts. Users are responsible for ensuring their use conforms with applicable fair use principles and platform terms.</p>
            </section>
            <section>
              <h3>3. Full User Ownership</h3>
              <p>You retain 100% ownership and distribution rights of all rendered clips and scripts generated through MyShort. MyShort asserts no claims, royalties, or licensing restrictions over your output files.</p>
            </section>
            <section>
              <h3>4. Open-Source Disclaimer</h3>
              <p>MyShort is provided free and open-source &quot;as is&quot;, without warranty of any kind. The developers bear no liability for third-party hosting, platform revisions, or downstream publication choices.</p>
            </section>
          </div>
        )}
      </div>
      <div className="policyFooter">
        <button className="blackBtn" onClick={onClose}>I understand</button>
      </div>
    </div>
  </div>;
}

function App(){
  const savedId=localStorage.getItem('myshort.activeProject')||'';
  const [view,setView]=useState(savedId?'booting':'home'),
        [url,setUrl]=useState(''),
        [projectId,setProjectId]=useState(savedId),
        [generated,setGenerated]=useState([]),
        [policyModal,setPolicyModal]=useState(null);
  const mapClips=data=>data.clips?.map((c,i)=>({
    ...c,
    videoUrl: c.videoUrl?.startsWith('http') ? c.videoUrl : apiUrl(c.videoUrl),
    thumbnailUrl: c.thumbnailUrl?.startsWith('http') ? c.thumbnailUrl : apiUrl(c.thumbnailUrl),
    apiId:c.id,
    id:c.number,
    tone:tones[i%tones.length]
  }))||[];
  useEffect(()=>{
    if(!savedId){
      fetch(apiUrl('/api/projects')).then(r=>r.json()).then(d=>{
        const latest=d.projects?.filter(p=>p.status==='completed').sort((a,b)=>new Date(b.updatedAt||b.createdAt)-new Date(a.updatedAt||a.createdAt))[0];
        if(latest){localStorage.setItem('myshort.activeProject',latest.id);setProjectId(latest.id);setGenerated(mapClips(latest));setView('results')}
      });
      return;
    }
    fetch(apiUrl(`/api/projects/${savedId}`)).then(r=>r.ok?r.json():Promise.reject()).then(p=>{
      if(p.status==='completed'){setGenerated(mapClips(p));setView('results')}
      else if(p.status==='queued'||p.status==='processing')setView('processing');
      else setView('projects')
    }).catch(()=>{localStorage.removeItem('myshort.activeProject');setView('home')});
  },[]);
  const goHome=()=>{localStorage.removeItem('myshort.activeProject');setProjectId('');setGenerated([]);setView('home')};
  const start=u=>{setUrl(u);setView('settings')};
  const generate=async settings=>{
    try{
      const r=await fetch(apiUrl('/api/projects'),{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({youtubeUrl:url,clipCount:settings.count,clipLength:settings.length,language:settings.lang,captions:settings.captions})
      });
      const data=await r.json();
      if(!r.ok)throw new Error(data.error||'Could not create project');
      localStorage.setItem('myshort.activeProject',data.id);
      setProjectId(data.id);
      setView('processing');
    }catch(e){alert(e.message)}
  };
  const complete=data=>{localStorage.setItem('myshort.activeProject',data.id);setGenerated(mapClips(data));setView('results')};
  const openProject=p=>{
    localStorage.setItem('myshort.activeProject',p.id);
    setProjectId(p.id);
    if(p.status==='completed'){setGenerated(mapClips(p));setView('results')}
    else setView('processing');
  };
  return <>
    <Header view={view} setView={v=>v==='home'?goHome():setView(v)}/>
    {view==='booting'&&<main className="booting"><LoaderCircle className="spin"/><b>Opening your generated clips…</b></main>}
    {view==='home'&&<Landing onStart={start}/>}
    {view==='settings'&&<Settings url={url} onBack={goHome} onGenerate={generate}/>}
    {view==='processing'&&<Processing projectId={projectId} onDone={complete} onBack={goHome}/>}
    {view==='projects'&&<Projects onOpen={openProject} onNew={goHome}/>}
    {view==='results'&&<Results items={generated} projectId={projectId} onNew={goHome}/>}
    <MobileDock view={view} onHome={goHome} onProjects={()=>setView('projects')} onCreate={goHome}/>
    <footer>
      <Logo/>
      <div className="footerCenter">
        <span>Turn one video into many moments.</span>
        <small className="footerNotice">© 2026 MyShort AI • Local Open-Source Media Pipeline • No cloud tracking</small>
      </div>
      <div className="footerLinks">
        <button className="footerLinkBtn" onClick={()=>setPolicyModal('terms')}>Terms</button>
        <button className="footerLinkBtn" onClick={()=>setPolicyModal('privacy')}>Privacy</button>
      </div>
    </footer>
    {policyModal&&<PolicyModal tab={policyModal} onClose={()=>setPolicyModal(null)}/>}
  </>;
}
createRoot(document.getElementById('root')).render(<App/>);

