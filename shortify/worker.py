#!/usr/bin/env python3
"""Real local MyShort worker: YouTube ingest -> Whisper -> highlights -> FFmpeg MP4s."""
import json, os, re, shutil, subprocess, time, traceback, threading
from pathlib import Path
try:
    from imageio_ffmpeg import get_ffmpeg_exe
    FFMPEG=get_ffmpeg_exe()
except ImportError:
    FFMPEG='ffmpeg'
from datetime import datetime, timezone

ROOT=Path(__file__).resolve().parent
FONT_DIR=ROOT/'assets'/'fonts'
PROJECTS=ROOT/'data'/'projects'; QUEUE=ROOT/'data'/'queue'; MEDIA=ROOT/'media'; WORK=ROOT/'data'/'work'; SOURCES=ROOT/'data'/'sources'; CANCELLED=ROOT/'data'/'cancelled'
for d in (PROJECTS,QUEUE,MEDIA,WORK,SOURCES,CANCELLED): d.mkdir(parents=True,exist_ok=True)
MODEL_NAME=os.getenv('WHISPER_MODEL','small'); COMPUTE=os.getenv('COMPUTE_TYPE','int8')
OUTPUT_WIDTH=int(os.getenv('OUTPUT_WIDTH','720')); OUTPUT_HEIGHT=int(OUTPUT_WIDTH*16/9)
HOOKS={'why','how','secret','mistake','never','always','best','worst','important','imagine','truth','actually','problem','simple','first','stop','start'}
_model=None
WORKER_STATE={'status':'starting','projectId':None}

def atomic(path,data):
    tmp=path.with_suffix('.tmp')
    for _ in range(5):
        try:
            tmp.write_text(json.dumps(data,indent=2),encoding='utf8')
            tmp.replace(path)
            return
        except (PermissionError, OSError):
            time.sleep(0.05)

def touch_heartbeat(status=None):
    if status: WORKER_STATE['status']=status
    payload={'lastSeen':datetime.now(timezone.utc).isoformat(),'status':WORKER_STATE['status'],'projectId':WORKER_STATE['projectId'],'model':MODEL_NAME,'outputWidth':OUTPUT_WIDTH}
    try: atomic(ROOT/'data'/'worker.json',payload)
    except Exception: pass

def heartbeat_loop():
    while True:
        touch_heartbeat()
        time.sleep(3)

class ProjectCancelled(Exception): pass
def load_project(pid): return json.loads((PROJECTS/f'{pid}.json').read_text(encoding='utf8'))
def update(p,**values):
    if (CANCELLED/p['id']).exists(): raise ProjectCancelled(p['id'])
    p.update(values); p['updatedAt']=datetime.now(timezone.utc).isoformat(); atomic(PROJECTS/f"{p['id']}.json",p)
    touch_heartbeat(status='processing' if p.get('status')!='completed' else 'idle')
def run(cmd):
    cmd=list(map(str,cmd))
    if cmd and cmd[0]=='ffmpeg': cmd[0]=FFMPEG
    print('+',' '.join(cmd),flush=True); subprocess.run(cmd,check=True)
def probe(file):
    try:
        import av
        with av.open(str(file)) as container:
            if container.duration is not None:
                return float(container.duration/1_000_000)
    except Exception:
        pass
    ffprobe_bin = os.getenv('FFPROBE_BIN', 'ffprobe')
    cmd = [ffprobe_bin, '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', str(file)]
    res = subprocess.run(cmd, capture_output=True, text=True, check=True)
    val = res.stdout.strip()
    if not val: raise RuntimeError('Could not determine source duration.')
    return float(val)
def youtube_caption_segments(info, language):
    """Use real creator/automatic captions. Falls back to the source language when needed."""
    codes={'English':'en','Hindi':'hi','Spanish':'es','French':'fr','German':'de','Auto':None}
    video_id=info.get('id')
    try:
        from youtube_transcript_api import YouTubeTranscriptApi
        api=YouTubeTranscriptApi()
        requested=codes.get(language)
        if requested:
            try: transcript=api.fetch(video_id,languages=[requested])
            except Exception:
                available=api.list(video_id)
                track=next(iter(available))
                transcript=track.fetch()
        else:
            available=api.list(video_id)
            transcript=next(iter(available)).fetch()
        result=[]
        for x in transcript:
            text=x.text.replace('\n',' ').strip()
            if text and not text.startswith('['): result.append({'start':float(x.start),'end':float(x.start+x.duration),'text':text})
        if result: return result
    except Exception as exc:
        print(f'YouTube transcript API unavailable ({exc}); trying caption track.',flush=True)
    import urllib.request
    code=codes.get(language) or 'en'
    tracks=(info.get('subtitles') or {}).get(code,[]) or (info.get('automatic_captions') or {}).get(code,[])
    track=next((x for x in tracks if x.get('ext')=='json3'),None)
    if not track: return []
    try:
        with urllib.request.urlopen(track['url'],timeout=30) as r: payload=json.load(r)
    except Exception as exc:
        print(f'Caption track unavailable ({exc}); falling back to local ASR.',flush=True)
        return []
    result=[]
    for event in payload.get('events',[]):
        text=''.join(x.get('utf8','') for x in event.get('segs',[])).replace('\n',' ').strip()
        if not text or text.startswith('['): continue
        start=float(event.get('tStartMs',0))/1000; end=start+float(event.get('dDurationMs',0))/1000
        if end>start: result.append({'start':start,'end':end,'text':text})
    return result

def clean_title(text):
    text=re.sub(r'\s+',' ',text).strip(' .,-–')
    words=text.split()[:10]; title=' '.join(words)
    return title[:1].upper()+title[1:] if title else 'Untitled highlight'
def score_window(text,duration):
    words=re.findall(r"[a-zA-Z']+",text.lower()); unique=len(set(words))/max(1,len(words))
    hook=sum(1 for x in words[:18] if x in HOOKS)*2.2
    question=2.2 if '?' in text else 0
    complete=1.5 if text.rstrip().endswith(('.','?','!')) else 0
    density=min(len(words)/max(duration,1),3)*0.5
    return hook+question+complete+density+unique

def choose_highlights(segments,count,target,total):
    if not segments: return []
    candidates=[]
    for i in range(len(segments)):
        start=max(0,float(segments[i]['start'])-.25); end=start; texts=[]
        for j in range(i,min(i+45,len(segments))):
            proposed=float(segments[j]['end'])-start
            if proposed>target+8: break
            end=float(segments[j]['end']); texts.append(segments[j]['text'].strip())
            if proposed>=max(12,target-5):
                text=' '.join(texts); candidates.append({'start':start,'end':min(end,total),'text':text,'score':score_window(text,end-start)}); break
    if not candidates: return []
    candidates.sort(key=lambda x:x['score'],reverse=True); picked=[]
    min_gap=12 if total>1800 else 4
    for c in candidates:
        if all(c['end']<=p['start']-min_gap or c['start']>=p['end']+min_gap for p in picked):
            picked.append(c)
            if len(picked)>=count: break
    if len(picked)<count:
        for c in candidates:
            if c not in picked and all(c['end']<=p['start']+1 or c['start']>=p['end']-1 for p in picked):
                picked.append(c)
                if len(picked)>=count: break
    return sorted(picked,key=lambda x:x['score'],reverse=True)

def srt_time(sec):
    ms=int(sec*1000); return f'{ms//3600000:02}:{(ms//60000)%60:02}:{(ms//1000)%60:02},{ms%1000:03}'
def make_ass(path,segments,start,end):
    """Create precisely sized, bottom-safe ASS cues with 2–4 words per phrase."""
    timed_words=[]
    for s in segments:
        a=max(float(s['start']),start); b=min(float(s['end']),end)
        if b<=a: continue
        words=s['text'].strip().split()
        if not words: continue
        span=max(.25,b-a)
        for i,word in enumerate(words):
            timed_words.append((word,a+span*i/len(words),a+span*(i+1)/len(words)))
    cues=[]; current=[]
    for word,wa,wb in timed_words:
        current.append((word,wa,wb))
        elapsed=current[-1][2]-current[0][1]
        if len(current)>=4 or (len(current)>=2 and word.rstrip().endswith(('.', '?', '!', ','))) or elapsed>=2.2:
            cues.append(current); current=[]
    if current: cues.append(current)
    def ass_time(sec):
        cs=max(0,int(sec*100)); return f'{cs//360000:01}:{(cs//6000)%60:02}:{(cs//100)%60:02}.{cs%100:02}'
    header="""[Script Info]
ScriptType: v4.00+
PlayResX: 720
PlayResY: 1280
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Caption,Noto Sans Devanagari,54,&H00FFFFFF,&H000000FF,&H00101010,&H80000000,-1,0,0,0,100,100,0,0,1,3,0,2,45,45,105,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    lines=[]
    for cue in cues:
        a=max(0,cue[0][1]-start); b=min(end-start,max(cue[-1][2]-start,a+.45))
        raw_text=' '.join(x[0] for x in cue)
        text=raw_text.replace('{','(').replace('}',')').replace('\\','').replace('\n',' ').replace('\r','').strip()
        if text:
            lines.append(f'Dialogue: 0,{ass_time(a)},{ass_time(b)},Caption,,0,0,0,,{text}')
    path.write_text(header+'\n'.join(lines)+'\n',encoding='utf8')
def escape_filter_path(path): return str(path).replace('\\','/').replace(':','\\:').replace("'","\\'")

def process(job):
    global _model
    pid=job['projectId']; WORKER_STATE.update(status='processing',projectId=pid); p=load_project(pid); wd=WORK/pid; outdir=MEDIA/pid
    wd.mkdir(parents=True,exist_ok=True); outdir.mkdir(parents=True,exist_ok=True)
    try:
        update(p,status='processing',progress=2,stage=0,stageLabel='Connecting to YouTube source')
        source=wd/'source.mp4'; retained=SOURCES/f'{pid}.mp4'; transcript_archive=SOURCES/f'{pid}.transcript.json'
        if retained.exists() and not source.exists(): shutil.copy2(retained,source)
        last_progress_time=[0]
        def dl_progress(d):
            if d.get('status')=='downloading':
                now=time.time()
                if now-last_progress_time[0]>=1.2:
                    last_progress_time[0]=now
                    total=d.get('total_bytes') or d.get('total_bytes_estimate') or 0
                    downloaded=d.get('downloaded_bytes',0)
                    speed=d.get('speed') or 0
                    if total>0:
                        dl_pct=(downloaded/total)*100
                        mapped=2+int(dl_pct*0.13)
                        mb=downloaded/1_048_576; total_mb=total/1_048_576
                        speed_mb=speed/1_048_576 if speed else 0
                        update(p,progress=mapped,stage=0,stageLabel=f'Downloading source ({dl_pct:.0f}% of {total_mb:.0f} MB • {speed_mb:.1f} MB/s)')
        opts={'format':'bestvideo[vcodec^=avc1][height<=720]+bestaudio/bestvideo[height<=720]+bestaudio/best[height<=720]','outtmpl':str(source),'merge_output_format':'mp4','ffmpeg_location':FFMPEG,'noplaylist':True,'quiet':True,'no_warnings':True,'retries':10,'fragment_retries':10,'js_runtimes':{'node':{}} if shutil.which('node') else {},'progress_hooks':[dl_progress]}
        cookie_candidates=[os.getenv('YTDLP_COOKIES_FILE','').strip(),str(ROOT/'cookies.txt'),str(ROOT/'youtube-cookies.txt'),str(ROOT/'youtube.com_cookies.txt'),str(DATA/'cookies.txt')]
        cookie_file=next((c for c in cookie_candidates if c and os.path.isfile(c)),None)
        if cookie_file: opts['cookiefile']=cookie_file
        try:
            import urllib.request
            urllib.request.urlopen('http://127.0.0.1:4416/ping',timeout=1)
            opts.setdefault('extractor_args',{})['youtubepot-bgutilhttp']={'base_url':['http://127.0.0.1:4416']}
        except Exception: pass
        if retained.exists() and transcript_archive.exists():
            info={'id':p.get('youtubeVideoId'),'title':p.get('sourceTitle','YouTube video')}
        else:
            from yt_dlp import YoutubeDL
            with YoutubeDL(opts) as ydl: info=ydl.extract_info(p['youtubeUrl'],download=not source.exists())
        candidates=list(wd.glob('source.*'))
        if not candidates: raise RuntimeError('The video source could not be downloaded.')
        source=candidates[0]; duration=probe(source)
        p['sourceTitle']=info.get('title') or p.get('sourceTitle') or 'YouTube video'; p['sourceDuration']=round(duration,1); p['youtubeVideoId']=info.get('id') or p.get('youtubeVideoId')
        update(p,progress=16,stage=1,stageLabel='Reading captions and transcribing audio')
        segments=json.loads(transcript_archive.read_text(encoding='utf8')) if transcript_archive.exists() else youtube_caption_segments(info,p['language'])
        if segments:
            p['transcriptionSource']='youtube-captions'
        else:
            audio=wd/'audio.wav'; run(['ffmpeg','-y','-i',source,'-vn','-ac','1','-ar','16000',audio])
            if _model is None:
                from faster_whisper import WhisperModel
                _model=WhisperModel(MODEL_NAME,device='cpu' if COMPUTE=='int8' else 'auto',compute_type=COMPUTE)
            lang_codes={'English':'en','Hindi':'hi','Spanish':'es','French':'fr','German':'de','Auto':None}
            seg_iter,meta=_model.transcribe(str(audio),language=lang_codes.get(p['language']),vad_filter=True,word_timestamps=True)
            segments=[]; total_dur=max(duration,1); last_t=time.time()
            for s in seg_iter:
                segments.append({'start':s.start,'end':s.end,'text':s.text})
                now=time.time()
                if now-last_t>=2.0:
                    last_t=now
                    t_pct=min(46,16+int((s.end/total_dur)*30))
                    update(p,progress=t_pct,stage=1,stageLabel=f'Transcribing audio ({round(s.end/60)} / {round(total_dur/60)} min)')
            p['transcriptionSource']='faster-whisper'
        if not segments: raise RuntimeError('No captions or speech were detected in this video.')
        (wd/'transcript.json').write_text(json.dumps(segments,indent=2,ensure_ascii=False),encoding='utf8')
        transcript_archive.write_text(json.dumps(segments,indent=2,ensure_ascii=False),encoding='utf8')
        update(p,progress=48,stage=2,stageLabel='Selecting complete, high-impact moments')
        highlights=choose_highlights(segments,p['clipCount'],p['clipLength'],duration)
        if not highlights: raise RuntimeError('No suitable spoken highlights were found.')
        clips=[]
        for i,h in enumerate(highlights,1):
            base=48+int((i-1)/len(highlights)*47); update(p,progress=base,stage=3 if i==1 else 4,stageLabel=f'Rendering clip {i} of {len(highlights)}')
            srt=wd/f'clip-{i}.ass'; make_ass(srt,segments,h['start'],h['end'])
            video=outdir/f'clip-{i}.mp4'; thumb=outdir/f'clip-{i}.jpg'
            vf=f'scale={OUTPUT_WIDTH}:{OUTPUT_HEIGHT}:force_original_aspect_ratio=increase,crop={OUTPUT_WIDTH}:{OUTPUT_HEIGHT}'
            if p.get('captions'):
                vf+=f",subtitles='{escape_filter_path(srt)}':fontsdir='{escape_filter_path(FONT_DIR)}'"
            clip_dur=max(1.0,h['end']-h['start'])
            run(['ffmpeg','-y','-ss',str(h['start']),'-i',str(source),'-t',str(clip_dur),'-vf',vf,'-c:v','libx264','-preset','veryfast','-crf','22','-c:a','aac','-b:a','128k','-avoid_negative_ts','make_zero','-movflags','+faststart',str(video)])
            seek_thumb=min(1.0,max(0.2,clip_dur/4))
            run(['ffmpeg','-y','-ss',str(seek_thumb),'-i',str(video),'-frames:v','1','-vf','scale=360:-2',str(thumb)])
            clips.append({'id':f'{pid}_clip_{i}','number':i,'title':clean_title(h['text']),'startTime':round(h['start'],2),'endTime':round(h['end'],2),'duration':round(clip_dur,2),'caption':h['text'],'score':round(h['score'],2),'videoUrl':f'/media/{pid}/{video.name}','thumbnailUrl':f'/media/{pid}/{thumb.name}','status':'ready'})
        if source.exists() and not retained.exists(): shutil.copy2(source,retained)
        update(p,status='completed',progress=100,stage=5,stageLabel='Ready to download',clips=clips,sourceRetained=True)
        shutil.rmtree(wd,ignore_errors=True)
    except ProjectCancelled:
        shutil.rmtree(wd,ignore_errors=True); shutil.rmtree(outdir,ignore_errors=True); retained.unlink(missing_ok=True); transcript_archive.unlink(missing_ok=True)
    except Exception as e:
        traceback.print_exc()
        err_msg=str(e)
        if 'Sign in to confirm' in err_msg or 'not a bot' in err_msg:
            err_msg="YouTube is temporarily requiring bot verification for this network. Place a 'cookies.txt' file in the shortify folder to download any video without limitation."
        try: update(p,status='failed',progress=p.get('progress',0),stageLabel='Processing failed',error=err_msg,errorDetail=traceback.format_exc()[-4000:])
        except ProjectCancelled: shutil.rmtree(wd,ignore_errors=True); shutil.rmtree(outdir,ignore_errors=True)

def main():
    WORKER_STATE.update(status='idle',projectId=None)
    threading.Thread(target=heartbeat_loop,daemon=True).start()
    print(f'MyShort worker ready (model={MODEL_NAME}, compute={COMPUTE})',flush=True)
    while True:
        jobs=sorted(QUEUE.glob('*.json'),key=lambda x:x.stat().st_mtime)
        if not jobs: time.sleep(2); continue
        jf=jobs[0]
        try: process(json.loads(jf.read_text()))
        except Exception: traceback.print_exc()
        finally:
            jf.unlink(missing_ok=True)
            WORKER_STATE.update(status='idle',projectId=None)

if __name__=='__main__': main()
