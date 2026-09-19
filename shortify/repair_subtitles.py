#!/usr/bin/env python3
"""One-time repair for clips rendered before the subtitle sizing/font fix."""
import json, subprocess, sys, time
from pathlib import Path
from worker import FFMPEG, FONT_DIR, make_ass, escape_filter_path
ROOT=Path(__file__).resolve().parent
pid=sys.argv[1]
project_file=ROOT/'data'/'projects'/f'{pid}.json'
p=json.loads(project_file.read_text(encoding='utf8'))
outdir=ROOT/'media'/pid
p['stageLabel']='Repairing subtitle layout'; p['subtitleRepair']='in_progress'
project_file.write_text(json.dumps(p,indent=2,ensure_ascii=False),encoding='utf8')
try:
    for index,clip in enumerate(p['clips'],1):
        src=outdir/f'clip-{clip["number"]}.mp4'; temp=outdir/f'clip-{clip["number"]}.fixed.mp4'; ass=outdir/f'clip-{clip["number"]}.fixed.ass'
        duration=float(clip['duration'])
        make_ass(ass,[{'start':0,'end':duration,'text':clip['caption']}],0,duration)
        # Hide glyph boxes burned by the old renderer, then add correctly shaped safe-area captions.
        vf=f"drawbox=x=0:y=0:w=iw:h=340:color=0x111111:t=fill,subtitles='{escape_filter_path(ass)}':fontsdir='{escape_filter_path(FONT_DIR)}'"
        subprocess.run([FFMPEG,'-y','-i',str(src),'-vf',vf,'-c:v','libx264','-preset','veryfast','-crf','22','-c:a','copy','-movflags','+faststart',str(temp)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        temp.replace(src); ass.unlink(missing_ok=True)
        p['stageLabel']=f'Repaired subtitles {index} of {len(p["clips"])}'; p['updatedAt']=time.strftime('%Y-%m-%dT%H:%M:%SZ')
        project_file.write_text(json.dumps(p,indent=2,ensure_ascii=False),encoding='utf8')
    stamp=int(time.time())
    for clip in p['clips']: clip['videoUrl']=f'/media/{pid}/clip-{clip["number"]}.mp4?v={stamp}'
    p['subtitleRepair']='completed'; p['stageLabel']='Ready to download'; p['updatedAt']=time.strftime('%Y-%m-%dT%H:%M:%SZ')
finally:
    project_file.write_text(json.dumps(p,indent=2,ensure_ascii=False),encoding='utf8')
