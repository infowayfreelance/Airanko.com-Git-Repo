'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Download, ImagePlus, Layers3, ScanSearch, ShieldAlert } from 'lucide-react'

const MAX_BYTES = 20 * 1024 * 1024
const MAX_SIDE = 960
const ACCEPT = ['image/jpeg', 'image/png', 'image/webp']
type Mode = 'regions' | 'edges'
type Analysis = { width: number; height: number; pixels: ImageData; centers: number[][]; labels: Uint8Array }
type Quality = { psnr: string; ssim: string; change: string; warning: string }

function closest(r: number, g: number, b: number, centers: number[][]) {
  let best = 0, distance = Infinity
  for (let k = 0; k < centers.length; k++) {
    const c = centers[k]
    const d = (r-c[0])**2 + (g-c[1])**2 + (b-c[2])**2
    if (d < distance) { distance = d; best = k }
  }
  return best
}

function segment(img: ImageData): Analysis {
  const { width, height, data } = img
  const n = width * height
  const sample: number[][] = []
  const stride = Math.max(1, Math.floor(n / 5000))
  for (let p = 0; p < n; p += stride) {
    const i = p * 4
    if (data[i+3] < 16) continue
    sample.push([data[i], data[i+1], data[i+2]])
  }
  if (!sample.length) sample.push([0,0,0])
  const centers = Array.from({length: 5}, (_, k) => [...sample[Math.min(sample.length - 1, Math.floor(((k+0.5)/5)*sample.length))]])
  for (let step = 0; step < 9; step++) {
    const sums = Array.from({length: 5}, () => [0,0,0,0])
    for (const [r,g,b] of sample) {
      const c = closest(r,g,b,centers)
      sums[c][0]+=r; sums[c][1]+=g; sums[c][2]+=b; sums[c][3]++
    }
    for (let k=0; k<5; k++) if(sums[k][3]) centers[k] = sums[k].slice(0,3).map(v=>v/sums[k][3])
  }
  const labels = new Uint8Array(n)
  for(let p=0;p<n;p++) {
    const i=p*4
    labels[p]= data[i+3] < 16 ? 255 : closest(data[i],data[i+1],data[i+2],centers)
  }
  return {width,height,pixels:img,centers,labels}
}

function imageDataFor(bitmap: ImageBitmap, width: number, height: number) {
  const c = document.createElement('canvas')
  c.width=width; c.height=height
  const ctx=c.getContext('2d',{willReadFrequently:true})
  if(!ctx) throw Error('Canvas is unavailable in this browser.')
  ctx.drawImage(bitmap,0,0,width,height)
  return ctx.getImageData(0,0,width,height)
}

function measure(a: ImageData,b: ImageData): Quality {
  const n=a.width*a.height; let mse=0, changed=0
  let sx=0,sy=0,sxx=0,syy=0,sxy=0
  for(let p=0;p<n;p++) {
    const i=p*4
    const dr=a.data[i]-b.data[i],dg=a.data[i+1]-b.data[i+1],db=a.data[i+2]-b.data[i+2]
    mse+=(dr*dr+dg*dg+db*db)/3
    if(dr||dg||db||a.data[i+3]!==b.data[i+3]) changed++
    const x=.2126*a.data[i]+.7152*a.data[i+1]+.0722*a.data[i+2]
    const y=.2126*b.data[i]+.7152*b.data[i+1]+.0722*b.data[i+2]
    sx+=x;sy+=y;sxx+=x*x;syy+=y*y;sxy+=x*y
  }
  mse/=n
  const mx=sx/n,my=sy/n
  const vx=Math.max(0,sxx/n-mx*mx),vy=Math.max(0,syy/n-my*my),cov=sxy/n-mx*my
  const c1=(.01*255)**2,c2=(.03*255)**2
  const ssim=((2*mx*my+c1)*(2*cov+c2))/((mx*mx+my*my+c1)*(vx+vy+c2))
  return {
    psnr:mse===0?'Identical':(10*Math.log10(255*255/mse)).toFixed(2)+' dB',
    ssim:Math.max(-1,Math.min(1,ssim)).toFixed(4),
    change:(100*changed/n).toFixed(2)+'%',
    warning:'Global SSIM is an approximate quality score, not a SynthID detector.'
  }
}

export default function ImageAnalysisLab() {
  const [original,setOriginal]=useState<File|null>(null)
  const [comparison,setComparison]=useState<File|null>(null)
  const [analysis,setAnalysis]=useState<Analysis|null>(null)
  const [quality,setQuality]=useState<Quality|null>(null)
  const [mode,setMode]=useState<Mode>('regions')
  const [region,setRegion]=useState(0)
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState('')
  const canvas=useRef<HTMLCanvasElement>(null)

  const select = (file:File|undefined, which:'original'|'comparison') => {
    if(!file)return
    if(!ACCEPT.includes(file.type)||file.size>MAX_BYTES){setMessage('Please choose a PNG, JPG or WebP image smaller than 20 MB.');return}
    setMessage('')
    setAnalysis(null);setQuality(null)
    if(which==='original')setOriginal(file)
    else setComparison(file)
  }

  const run = useCallback(async()=>{
    if(!original)return
    setBusy(true);setMessage('');setQuality(null)
    let first:ImageBitmap|null=null,second:ImageBitmap|null=null
    try{
      first=await createImageBitmap(original)
      const scale=Math.min(1,MAX_SIDE/Math.max(first.width,first.height))
      const w=Math.max(1,Math.round(first.width*scale)),h=Math.max(1,Math.round(first.height*scale))
      const a=imageDataFor(first,w,h)
      const next=segment(a)
      if(comparison){
        second=await createImageBitmap(comparison)
        if(second.width===first.width&&second.height===first.height){
          setQuality(measure(a,imageDataFor(second,w,h)))
        }else{
          setQuality({psnr:'—',ssim:'—',change:'—',warning:'Original and comparison image dimensions differ. Compare images with the same width and height.'})
        }
      }
      setAnalysis(next)
    }catch(e){setMessage(e instanceof Error?e.message:'Could not process this image.')}
    finally {first?.close();second?.close();setBusy(false)}
  },[original,comparison])

  useEffect(()=>{
    if(!analysis||!canvas.current)return
    const {width:w,height:h,pixels,labels}=analysis
    const c=canvas.current;c.width=w;c.height=h
    const ctx=c.getContext('2d')
    if(!ctx)return
    const out=new ImageData(new Uint8ClampedArray(pixels.data),w,h)
    if(mode==='regions'){
      for(let p=0;p<w*h;p++){
        const i=p*4
        if(labels[p]===region){
          out.data[i]=Math.round(out.data[i]*.5+84)
          out.data[i+1]=Math.round(out.data[i+1]*.5+240*.5)
          out.data[i+2]=Math.round(out.data[i+2]*.5+211*.5)
        }else{out.data[i]*=.42;out.data[i+1]*=.42;out.data[i+2]*=.42}
      }
    }else{
      const lum=new Float32Array(w*h)
      for(let p=0;p<w*h;p++){const i=p*4;lum[p]=.2126*pixels.data[i]+.7152*pixels.data[i+1]+.0722*pixels.data[i+2]}
      for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
        const p=y*w+x,i=p*4
        const gx=-lum[p-w-1]+lum[p-w+1]-2*lum[p-1]+2*lum[p+1]-lum[p+w-1]+lum[p+w+1]
        const gy=-lum[p-w-1]-2*lum[p-w]-lum[p-w+1]+lum[p+w-1]+2*lum[p+w]+lum[p+w+1]
        const edge=Math.min(255,Math.hypot(gx,gy))
        out.data[i]=out.data[i+1]=out.data[i+2]=edge
        out.data[i+3]=255
      }
    }
    ctx.putImageData(out,0,0)
  },[analysis,mode,region])

  function saveMask(){
    if(!analysis)return
    const {width:w,height:h,labels,pixels}=analysis
    const c=document.createElement('canvas');c.width=w;c.height=h
    const ctx=c.getContext('2d');if(!ctx)return
    const out=new ImageData(new Uint8ClampedArray(pixels.data),w,h)
    for(let p=0;p<w*h;p++)if(labels[p]!==region)out.data[p*4+3]=0
    ctx.putImageData(out,0,0)
    c.toBlob(blob=>{
      if(!blob)return
      const url=URL.createObjectURL(blob)
      const link=document.createElement('a');link.href=url;link.download='ai-ranko-colour-region-mask.png';link.click()
      setTimeout(()=>URL.revokeObjectURL(url),3000)
    },'image/png')
  }

  return <section aria-label="Image structure and fidelity analysis" className="mx-auto max-w-6xl px-4 py-12 text-slate-100">
    <div className="rounded-3xl border border-slate-700 bg-slate-900/90 p-5 shadow-xl md:p-8">
      <div className="mb-6 flex items-start gap-3">
        <Layers3 className="mt-1 h-7 w-7 shrink-0 text-teal-300"/>
        <div>
          <h2 className="text-2xl font-bold">Image structure & quality lab</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">Explore colour regions, detect boundaries and measure image similarity. All files stay in your browser. This is analysis—not a verified SynthID removal method.</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block rounded-2xl border border-slate-600 bg-slate-800 p-5">
          <span className="mb-2 flex items-center gap-2 font-semibold"><ImagePlus className="h-5 w-5"/> Original image</span>
          <input className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-teal-300 file:px-3 file:py-2 file:font-semibold file:text-slate-900" type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>select(e.target.files?.[0],'original')}/>
          <p className="mt-2 break-all text-xs text-slate-300">{original?.name||'PNG, JPG or WebP · Up to 20 MB'}</p>
        </label>
        <label className="block rounded-2xl border border-slate-600 bg-slate-800 p-5">
          <span className="mb-2 flex items-center gap-2 font-semibold"><ScanSearch className="h-5 w-5"/> Comparison image (optional)</span>
          <input className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-teal-300 file:px-3 file:py-2 file:font-semibold file:text-slate-900" type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>select(e.target.files?.[0],'comparison')}/>
          <p className="mt-2 break-all text-xs text-slate-300">{comparison?.name||'Upload an edited version to compare quality'}</p>
          {comparison&&<button className="mt-2 text-xs text-teal-200 underline" onClick={()=>{setComparison(null);setQuality(null)}} type="button">Clear comparison</button>}
        </label>
      </div>
      <button type="button" onClick={run} disabled={!original||busy} className="mt-5 rounded-xl bg-teal-300 px-6 py-3 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40">
        {busy?'Analyzing image…':'Analyze image'}
      </button>
      {message&&<p role="alert" className="mt-3 text-sm text-amber-300">{message}</p>}
      {analysis&&<div className="mt-7 grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            <button type="button" onClick={()=>setMode('regions')} aria-pressed={mode==='regions'} className={'rounded-lg px-3 py-2 text-sm '+(mode==='regions'?'bg-teal-300 text-slate-950':'bg-slate-700 text-white')}>Colour regions</button>
            <button type="button" onClick={()=>setMode('edges')} aria-pressed={mode==='edges'} className={'rounded-lg px-3 py-2 text-sm '+(mode==='edges'?'bg-teal-300 text-slate-950':'bg-slate-700 text-white')}>Edge map</button>
          </div>
          <canvas ref={canvas} className="max-h-[550px] w-full rounded-xl border border-slate-600 object-contain" aria-label="Image regions or edge detection visualization"/>
          <p className="mt-2 text-xs text-slate-300">Analysis preview: {analysis.width} × {analysis.height} pixels (large images downscaled to {MAX_SIDE}px maximum for speed).</p>
        </div>
        <div>
          <h3 className="mb-3 text-lg font-semibold">Region selection</h3>
          <p className="mb-4 text-sm text-slate-300">These five groups are found by colour clustering, not AI object recognition. A single object can span several groups.</p>
          <div className="flex flex-wrap gap-2">
            {analysis.centers.map((c,i)=><button type="button" key={i} onClick={()=>{setRegion(i);setMode('regions')}} aria-pressed={region===i} className={'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm '+(region===i?'border-teal-300 bg-slate-700':'border-slate-600 bg-slate-800')}>
              <span className="h-5 w-5 rounded border border-white/30" style={{backgroundColor:'rgb('+c.map(v=>Math.round(v)).join(',')+')'}}/> Region {i+1}
            </button>)}
          </div>
          <button type="button" className="mt-4 flex items-center gap-2 rounded-xl border border-teal-300 px-4 py-2 font-semibold text-teal-200" onClick={saveMask}><Download className="h-4 w-4"/> Download selected region mask</button>
          <div className="mt-5 rounded-xl border border-slate-700 bg-slate-800 p-4 text-sm text-slate-300">
            <p><strong className="text-white">Real object segmentation:</strong> Not yet integrated; it needs a separate trained model.</p>
            <p className="mt-2"><strong className="text-white">LPIPS:</strong> Not available until a licensed model is installed. The scores below do not imitate LPIPS.</p>
          </div>
          {quality&&<div className="mt-5 rounded-xl border border-slate-600 p-4">
            <h3 className="mb-3 font-semibold">Visual similarity check</h3>
            <dl className="grid grid-cols-3 gap-3 text-center">
              <div><dt className="text-xs text-slate-300">PSNR</dt><dd className="text-lg font-bold">{quality.psnr}</dd></div>
              <div><dt className="text-xs text-slate-300">Global SSIM</dt><dd className="text-lg font-bold">{quality.ssim}</dd></div>
              <div><dt className="text-xs text-slate-300">Pixels changed</dt><dd className="text-lg font-bold">{quality.change}</dd></div>
            </dl>
            <p className="mt-3 text-xs text-slate-300">{quality.warning}</p>
          </div>}
        </div>
      </div>}
      <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-600/50 bg-amber-950/30 p-4 text-sm text-amber-100">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0"/>
        <p>Watermark detection is not provided here. Colour clustering, edge maps, SSIM and PSNR cannot confirm whether SynthID is present or removed. Use an authorised detector to check original and processed files separately.</p>
      </div>
    </div>
  </section>
}
