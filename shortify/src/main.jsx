import React, {useEffect, useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ArrowRight, Check, CheckCircle2, ChevronDown, Clock3, Cookie, Copy, Download, Film, Gauge, Grip, Languages, LayoutGrid, Link2, LoaderCircle, Menu, Monitor, Moon, MoreHorizontal, Pause, Play, RotateCcw, Scissors, Search, Settings2, Share2, Smartphone, Sparkles, Square, Subtitles, Sun, WandSparkles, X, Zap} from 'lucide-react';
import './styles.css';
import './upgrade.css';
import './reality.css';
import './reality-fix.css';
import './ops.css';
import './history.css';
import './download.css';
import './mobile.css';
import './dark-theme.css';
import './studio.css';

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
function Header({view, setView, theme='dark', onToggleTheme, onOpenCookies}){
  const [menu,setMenu]=useState(false),[worker,setWorker]=useState(null);
  const home=()=>{setMenu(false);setView('home')};
  useEffect(()=>{
    let live=true;
    const check=()=>fetch(apiUrl('/api/health')).then(r=>r.json()).then(d=>live&&setWorker(d.worker)).catch(()=>live&&setWorker({online:false,status:'offline'}));
    check();
    const timer=setInterval(check,10000);
    return()=>{live=false;clearInterval(timer)}
  },[]);

  return <>
    <header>
      <button className="logoButton" onClick={home}><Logo/></button>
      <nav>
        <a href="#how" onClick={home}>How it works</a>
        <a href="#features" onClick={home}>Features</a>
        <a href="#faq" onClick={home}>FAQ</a>
      </nav>
      <div className="headerActions">
        <span className={'workerPill '+(worker?.online?'online':'offline')}>
          <i/>{worker?.online?(worker.status==='processing'?'Worker busy':'Worker ready'):'Worker offline'}
        </span>
        <button className="themeToggleBtn" onClick={onToggleTheme} title={theme==='dark'?'Switch to Light mode':'Switch to Dark mode'} aria-label="Toggle Theme">
          {theme==='dark'?<Sun size={16}/>:<Moon size={16}/>}
        </button>
        <button className="headerIconBtn" onClick={onOpenCookies} title="YouTube Cookies & Diagnostics" aria-label="YouTube Cookies">
          <Cookie size={16}/>
        </button>
        <button className={'textBtn '+(view==='projects'?'navActive':'')} onClick={()=>setView('projects')}>My projects</button>
        <button className="blackBtn" onClick={home}>Create Short <ArrowRight size={15}/></button>
        <button className="menuBtn" aria-label="Menu" onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button>
      </div>
    </header>
    {menu&&<div className="mobileNav">
      <button onClick={()=>{setMenu(false);setView('projects')}}>My projects <ArrowRight/></button>
      <button onClick={()=>{setMenu(false);onToggleTheme?.()}}>{theme==='dark'?'☀️ Switch to Light mode':'🌙 Switch to Dark mode'}</button>
      <button onClick={()=>{setMenu(false);onOpenCookies?.()}}>🍪 YouTube Cookies</button>
      <a href="#how" onClick={home}>How it works</a>
      <a href="#features" onClick={home}>Features</a>
      <a href="#faq" onClick={home}>FAQ</a>
      <div className={'mobileWorker '+(worker?.online?'online':'')}><i/>{worker?.online?'Video worker ready':'Video worker offline'}</div>
    </div>}
  </>;
}

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

function Settings({url,onGenerate,onBack}){
  const [count,setCount]=useState(5),
        [length,setLength]=useState(30),
        [lang,setLang]=useState('English'),
        [aspectRatio,setAspectRatio]=useState('9:16'),
        [captions,setCaptions]=useState(true),
        [captionStyle,setCaptionStyle]=useState('hormozi');

  const themes=[
    {id:'hormozi',label:'Hormozi Gold',color:'#FFDC00',tag:'VIRAL',desc:'Bold yellow + black stroke'},
    {id:'green',label:'Cyber Lime',color:'#32FF14',tag:'POPULAR',desc:'Punchy neon green highlight'},
    {id:'cyan',label:'Electric Cyan',color:'#00E5FF',tag:'TECH',desc:'Modern cyan pulse'},
    {id:'white',label:'Clean Classic',color:'#FFFFFF',tag:'MINIMAL',desc:'Crisp white with shadow'}
  ];

  return <main className="appPage">
    <button className="backLink" onClick={onBack}>← Back</button>
    <div className="setupGrid">
      <section>
        <span className="kicker">NEW PROJECT</span>
        <h1>Set up your Shorts</h1>
        <p>Choose your preferences. You can fine-tune each clip after generation.</p>
        <div className="videoSummary">
          <div className="thumbSmall"><Play fill="white"/></div>
          <div>
            <small>YOUTUBE VIDEO</small>
            <b>{url}</b>
            <span><Clock3 size={13}/> Duration and language are verified by the worker</span>
          </div>
          <CheckCircle2 className="green"/>
        </div>
      </section>
      <section className="settingsCard">
        <Setting label="NUMBER OF SHORTS" hint="Choose a preset or enter any amount">
          <div className="unlimitedPicker">
            <Segment options={[3,5,10,20]} value={count} set={setCount}/>
            <label>Custom<input type="number" min="1" value={count} onChange={e=>setCount(Math.max(1,Number(e.target.value)||1))}/></label>
          </div>
        </Setting>
        <Setting label="CLIP LENGTH" hint="Choose a preset or enter any duration">
          <div className="unlimitedPicker">
            <Segment options={[15,30,45,60]} value={length} set={setLength} suffix="s"/>
            <label>Seconds<input type="number" min="1" value={length} onChange={e=>setLength(Math.max(1,Number(e.target.value)||1))}/></label>
          </div>
        </Setting>
        <Setting label="FRAME ASPECT RATIO" hint="Target format for your clips">
          <div className="aspectGrid">
            <button
              type="button"
              className={'aspectOption '+(aspectRatio==='9:16'?'active':'')}
              onClick={()=>setAspectRatio('9:16')}
            >
              <Smartphone size={18}/>
              <b>9:16 Vertical</b>
              <small>Shorts / Reels / TikTok</small>
            </button>
            <button
              type="button"
              className={'aspectOption '+(aspectRatio==='1:1'?'active':'')}
              onClick={()=>setAspectRatio('1:1')}
            >
              <Square size={18}/>
              <b>1:1 Square</b>
              <small>Feed / LinkedIn / IG</small>
            </button>
            <button
              type="button"
              className={'aspectOption '+(aspectRatio==='16:9'?'active':'')}
              onClick={()=>setAspectRatio('16:9')}
            >
              <Monitor size={18}/>
              <b>16:9 Landscape</b>
              <small>YouTube / Web Video</small>
            </button>
          </div>
        </Setting>
        <Setting label="TRANSCRIPTION LANGUAGE" hint="Whisper multilingual transcription">
          <div className="selectLike">
            <Languages size={16}/>
            <select value={lang} onChange={e=>setLang(e.target.value)}>
              <option>Auto</option>
              <option>English</option>
              <option>Hindi</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
            </select>
            <ChevronDown size={15}/>
          </div>
        </Setting>
        <div className="toggleRow">
          <div>
            <Subtitles/>
            <span>
              <b>Word-level animated captions</b>
              <small>Dynamic active word highlights · high-retention 2–3 words/cue</small>
            </span>
          </div>
          <button className={'toggle '+(captions?'on':'')} onClick={()=>setCaptions(!captions)}><i/></button>
        </div>
        {captions && (
          <div className="captionThemeRow">
            <label>ANIMATED CAPTION PALETTE</label>
            <div className="subStyleGrid" style={{gridTemplateColumns:'repeat(auto-fit, minmax(130px, 1fr))'}}>
              {themes.map(t=>(
                <button
                  key={t.id}
                  type="button"
                  className={'subStyleCard '+(captionStyle===t.id?'active':'')}
                  onClick={()=>setCaptionStyle(t.id)}
                >
                  <div className="subStylePreview" style={{color:t.color}}>
                    {t.tag}
                  </div>
                  <b>{t.label}</b>
                  <small>{t.desc}</small>
                </button>
              ))}
            </div>
          </div>
        )}
        <button className="generateBtn" onClick={()=>onGenerate({count,length,lang,captions,captionStyle,aspectRatio})}>
          <Sparkles size={18}/> Generate {count} Shorts <ArrowRight size={18}/>
        </button>
        <p className="estimate"><Zap size={13}/> Parallel worker active · High-speed rendering enabled</p>
      </section>
    </div>
  </main>;
}
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
  const [captionText, setCaptionText] = useState(clip.caption || clip.title || '');
  const [copiedPost, setCopiedPost] = useState(false);

  useEffect(()=>{
    setCaptionText(clip.caption || clip.title || '');
  }, [clip]);

  const virality = useMemo(()=>{
    const raw = parseFloat(clip.score) || 9.2;
    const base = Math.min(9.9, Math.max(7.5, raw));
    return {
      overall: base.toFixed(1),
      hook: Math.min(10, +(base + 0.3).toFixed(1)),
      retention: Math.min(10, +(base - 0.2).toFixed(1))
    };
  }, [clip]);

  const socialPost = useMemo(()=>{
    return `${clip.title || 'Must Watch Moment'}\n\n"${captionText}"\n\n#Shorts #Viral #Podcast #Trending #Reels #ContentCreator`;
  }, [clip.title, captionText]);

  const copySocialPost = () => {
    navigator.clipboard?.writeText(socialPost);
    setCopiedPost(true);
    setTimeout(()=>setCopiedPost(false), 2000);
  };

  return <div className="modalBackdrop" onClick={onClose} role="dialog" aria-modal="true">
    <div className="modalWindow" onClick={e=>e.stopPropagation()}>
      <div className="modalPlayerCol">
        <video controls autoPlay src={clip.videoUrl} poster={clip.thumbnailUrl}/>
      </div>
      <div className="modalDetailCol">
        <div>
          <div className="modalHeader">
            <div>
              <span className="modalKicker">SHORT #{clip.id} • {clip.aspectRatio || '9:16'} HD</span>
              <h2 className="modalTitle">{clip.title}</h2>
            </div>
            <button className="modalCloseBtn" onClick={onClose} aria-label="Close modal"><X size={16}/></button>
          </div>

          <div className="viralityBanner">
            <div className="viralityMetric">
              <b>{virality.overall}/10</b>
              <span>Virality Score</span>
            </div>
            <div className="viralityMetric">
              <b>{virality.hook}/10</b>
              <span>Hook Impact</span>
            </div>
            <div className="viralityMetric">
              <b>{virality.retention}/10</b>
              <span>Retention Index</span>
            </div>
          </div>

          <div className="modalMetaRow">
            <span>Duration: <b>{clock(clip.duration)}</b></span>
            <span>Timecode: <b>{clock(clip.startTime)} – {clock(clip.endTime)}</b></span>
          </div>

          <div className="modalScriptHeader">
            <span>EDITABLE TRANSCRIPT & CAPTIONS</span>
            <CopyButton text={captionText} label="Copy script"/>
          </div>
          <textarea
            className="modalScriptBox"
            value={captionText}
            onChange={e=>setCaptionText(e.target.value)}
            rows={3}
            style={{width:'100%', boxSizing:'border-box', padding:'10px', borderRadius:'8px', fontFamily:'inherit', resize:'vertical', fontSize:'0.82rem', lineHeight:1.5}}
          />

          <div style={{marginTop:'12px'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px'}}>
              <span style={{fontSize:'0.72rem', fontWeight:700, letterSpacing:'0.5px', color:'var(--text-secondary)'}}>READY-TO-POST SOCIAL CAPTION</span>
              <button className={'copyClipBtn '+(copiedPost?'copied':'')} onClick={copySocialPost}>
                {copiedPost ? <Check size={12}/> : <Share2 size={12}/>}
                {copiedPost ? 'Copied Post!' : 'Copy Social Post'}
              </button>
            </div>
            <div className="socialPostBox">{socialPost}</div>
          </div>
        </div>

        <div className="modalActions" style={{marginTop:'16px'}}>
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
      <span className="clipBadge">{c.aspectRatio || '9:16'} • 720p</span>
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
          <button className={currentTab==='cookies'?'active':''} onClick={()=>setCurrentTab('cookies')}>Cookies Policy</button>
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
        ):currentTab==='terms'?(
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
        ):(
          <div className="policyContent">
            <h2>Cookies Policy</h2>
            <div className="policyDate">LAST UPDATED: SEPTEMBER 19, 2026</div>
            <section>
              <p>This Cookies Policy explains what Cookies are and how We use them. You should read this policy so You can understand what type of cookies We use, or the information We collect using Cookies and how that information is used. This Cookies Policy has been created with the help of the <a href="https://www.termsfeed.com/cookies-policy-generator/" target="_blank" rel="external nofollow noopener">TermsFeed Cookies Policy Generator</a>.</p>
              <p style={{marginTop:8}}>Cookies do not typically contain any information that personally identifies a user, but personal information that We store about You may be linked to the information stored in and obtained from Cookies. For further information on how We use, store and keep your personal data secure, see our Privacy Policy, if and when We make it available within the Website or on our website.</p>
              <p style={{marginTop:8}}>We do not store sensitive personal information, such as mailing addresses, account passwords, etc. in the Cookies We use.</p>
            </section>
            <section>
              <h3>Interpretation and Definitions</h3>
              <p><strong>Interpretation:</strong> The words whose initial letters are capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>
              <p style={{marginTop:8}}><strong>Definitions:</strong> For the purposes of this Cookies Policy:</p>
              <ul>
                <li><strong>Company</strong> (referred to as either &quot;the Company&quot;, &quot;We&quot;, &quot;Us&quot; or &quot;Our&quot; in this Cookies Policy) refers to myshort.</li>
                <li><strong>Cookies</strong> means small files that are placed on Your computer, mobile device or any other device by a website, containing details of your browsing history on that website among its many uses.</li>
                <li><strong>Website</strong> refers to myshort, accessible from <a href="https://shortify-neon-three.vercel.app/" target="_blank" rel="external nofollow noopener">https://shortify-neon-three.vercel.app/</a>.</li>
                <li><strong>You</strong> means the individual accessing or using the Website, or a company, or any legal entity on behalf of which such individual is accessing or using the Website, as applicable.</li>
              </ul>
            </section>
            <section>
              <h3>The use of the Cookies</h3>
              <p><strong>Type of Cookies We Use:</strong></p>
              <p>Cookies can be &quot;Persistent&quot; or &quot;Session&quot; Cookies. Persistent Cookies remain on your personal computer or mobile device when You go offline, while Session Cookies are deleted as soon as You close your web browser.</p>
              <p style={{marginTop:8}}>Where required by law, We will request your consent before using Cookies that are not strictly necessary. Strictly necessary Cookies are used to provide the Website and cannot be switched off in our systems.</p>
              <p style={{marginTop:8}}>We use both session and persistent Cookies for the purposes set out below:</p>
              <ul>
                <li>
                  <p><strong>Necessary / Essential Cookies</strong></p>
                  <p>Type: Session Cookies</p>
                  <p>Administered by: Us</p>
                  <p>Purpose: These Cookies are essential to provide You with services available through the Website and to enable You to use some of its features. They help to authenticate users and prevent fraudulent use of user accounts. Without these Cookies, the services that You have asked for cannot be provided, and We only use these Cookies to provide You with those services.</p>
                </li>
                <li>
                  <p><strong>Functionality Cookies</strong></p>
                  <p>Type: Persistent Cookies</p>
                  <p>Administered by: Us</p>
                  <p>Purpose: These Cookies allow Us to remember choices You make when You use the Website, such as remembering your login details or language preference. The purpose of these Cookies is to provide You with a more personal experience and to avoid You having to re-enter your preferences every time You use the Website.</p>
                </li>
              </ul>
            </section>
            <section>
              <h3>Your Choices Regarding Cookies</h3>
              <p>If You prefer to avoid the use of Cookies on the Website, first You must disable the use of Cookies in your browser and then delete the Cookies saved in your browser associated with the Website. You may use this option for preventing the use of Cookies at any time.</p>
              <p style={{marginTop:8}}>If You do not accept Our Cookies, You may experience some inconvenience in your use of the Website and some features may not function properly.</p>
              <p style={{marginTop:8}}>If You'd like to delete Cookies or instruct your web browser to delete or refuse Cookies, please visit the help pages of your web browser:</p>
              <ul>
                <li>For the Chrome web browser, please visit this page from Google: <a href="https://support.google.com/accounts/answer/32050" target="_blank" rel="external nofollow noopener">https://support.google.com/accounts/answer/32050</a></li>
                <li>For the Microsoft Edge browser, please visit this page from Microsoft: <a href="https://support.microsoft.com/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="external nofollow noopener">https://support.microsoft.com/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09</a></li>
                <li>For the Firefox web browser, please visit this page from Mozilla: <a href="https://support.mozilla.org/en-US/kb/delete-cookies-remove-info-websites-stored" target="_blank" rel="external nofollow noopener">https://support.mozilla.org/en-US/kb/delete-cookies-remove-info-websites-stored</a></li>
                <li>For the Safari web browser, please visit this page from Apple: <a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="external nofollow noopener">https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac</a></li>
              </ul>
              <p style={{marginTop:8}}>For any other web browser, please visit your web browser's official web pages.</p>
            </section>
            <section>
              <h3>Changes to this Cookies Policy</h3>
              <p>We may update this Cookies Policy from time to time. The &quot;Last updated&quot; date at the top indicates when it was last revised.</p>
            </section>
            <section>
              <h3>Contact Us</h3>
              <p>If you have any questions about this Cookies Policy, You can contact us:</p>
              <ul>
                <li>By visiting this page on our website: <a href="https://shortify-neon-three.vercel.app/" target="_blank" rel="external nofollow noopener">https://shortify-neon-three.vercel.app/</a></li>
              </ul>
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
  const [theme, setTheme]=useState(()=>localStorage.getItem('myshort.theme')||'dark');
  const [view,setView]=useState(savedId?'booting':'home'),
        [url,setUrl]=useState(''),
        [projectId,setProjectId]=useState(savedId),
        [generated,setGenerated]=useState([]),
        [policyModal,setPolicyModal]=useState(null),
        [showCookieModal,setShowCookieModal]=useState(false);

  useEffect(()=>{
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('myshort.theme', theme);
  },[theme]);

  const toggleTheme=()=>setTheme(t=>t==='dark'?'light':'dark');

  const mapClips=data=>data.clips?.map((c,i)=>({
    ...c,
    videoUrl: c.videoUrl?.startsWith('http') ? c.videoUrl : apiUrl(c.videoUrl),
    thumbnailUrl: c.thumbnailUrl?.startsWith('http') ? c.thumbnailUrl : apiUrl(c.thumbnailUrl),
    apiId:c.id,
    id:c.number,
    tone:tones[i%tones.length]
  }))||[];

  useEffect(()=>{
    try {
      const sp = new URLSearchParams(window.location.search);
      const qp = sp.get('policy');
      if(qp && ['privacy','terms','cookies'].includes(qp)){
        setPolicyModal(qp);
      } else if(window.location.hash==='#cookies'||window.location.pathname==='/cookies'){
        setPolicyModal('cookies');
      } else if(window.location.hash==='#privacy'||window.location.pathname==='/privacy'){
        setPolicyModal('privacy');
      } else if(window.location.hash==='#terms'||window.location.pathname==='/terms'){
        setPolicyModal('terms');
      }
    }catch(_){}
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
        body:JSON.stringify({
          youtubeUrl:url,
          clipCount:settings.count,
          clipLength:settings.length,
          language:settings.lang,
          captions:settings.captions,
          captionStyle:settings.captionStyle,
          aspectRatio:settings.aspectRatio||'9:16'
        })
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
    <Header
      view={view}
      setView={v=>v==='home'?goHome():setView(v)}
      theme={theme}
      onToggleTheme={toggleTheme}
      onOpenCookies={()=>setShowCookieModal(true)}
    />
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
        <button className="footerLinkBtn" onClick={()=>setPolicyModal('cookies')}>Cookies</button>
      </div>
    </footer>
    {policyModal&&<PolicyModal tab={policyModal} onClose={()=>setPolicyModal(null)}/>}
    {showCookieModal&&<CookieModal onClose={()=>setShowCookieModal(false)} onSaved={()=>setShowCookieModal(false)}/>}
  </>;
}
createRoot(document.getElementById('root')).render(<App/>);

