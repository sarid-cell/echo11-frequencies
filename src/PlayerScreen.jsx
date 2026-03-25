import { useEffect, useRef, useState } from 'react'
import s from './PlayerScreen.module.css'

const BRAIN = [
  { t:0,   txt:(l) => l==='he' ? 'לחצי Play. מערכת העצבים תתחיל להגיב תוך <em>90 שניות</em>.' : 'Press play. Your nervous system will begin to respond within <em>90 seconds</em>.' },
  { t:5,   txt:(l) => l==='he' ? 'האזנה החלה. קליפת השמע שלך <em>מעבדת את 432 Hz</em>.' : 'Listening started. Your auditory cortex is <em>processing 432 Hz</em>.' },
  { t:30,  txt:(l) => l==='he' ? 'גזע המוח מתחיל <em>להסתנכרן</em> עם הקצב.' : 'The brainstem is beginning to <em>entrain</em> to the rhythm.' },
  { t:60,  txt:(l) => l==='he' ? 'פעילות גלי דלתא <em>עולה</em>. רמות קורטיזול מתחילות לרדת.' : 'Delta wave activity <em>increasing</em>. Cortisol beginning to decrease.' },
  { t:90,  txt:(l) => l==='he' ? 'מערכת הפאראסימפתטית <em>מופעלת</em>. קצב הלב מאט באופן טבעי.' : 'Parasympathetic system <em>activating</em>. Heart rate naturally slowing.' },
  { t:180, txt:(l) => l==='he' ? 'שלב הסנכרון העמוק. המוח שלך מייצר <em>גלי דלתא (0.5–4 Hz)</em>.' : 'Deep entrainment. Your brain is generating <em>Delta waves (0.5–4 Hz)</em>.' },
  { t:300, txt:(l) => l==='he' ? 'עומק מיטבי. <em>תהליכי ריפוי טבעיים</em> פעילים.' : 'Optimal depth reached. <em>Natural recovery processes</em> are now active.' },
]

const TIMERS = { en:['8 min','20 min','60 min','∞'], he:['8 דק','20 דק','60 דק','∞'] }
const TABS = { en:['What is it?','Research','Ideal for'], he:['מה זה?','מחקר','מתאים ל'] }

export default function PlayerScreen({ freq, playing, volume, lang, onPlay, onStop, onVolumeChange, onBack, onNext, onPrev }) {
  const cvRef   = useRef(null)
  const animRef = useRef(null)
  const tRef    = useRef(0)
  const [tab,      setTab]      = useState(0)
  const [timerSel, setTimerSel] = useState(1)
  const [elapsed,  setElapsed]  = useState(0)

  const txt = freq[lang]

  useEffect(() => {
    if (!playing) return
    setElapsed(0)
    const iv = setInterval(() => setElapsed(e => e+1), 1000)
    return () => clearInterval(iv)
  }, [playing, freq.id])

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return
    const ctx = cv.getContext('2d')
    const spd = freq.morph || .022

    const resize = () => { cv.width = cv.offsetWidth||400; cv.height = cv.offsetHeight||195 }
    const to = setTimeout(resize, 80)
    const obs = new ResizeObserver(resize)
    if (cv.parentElement) obs.observe(cv.parentElement)

    function frame() {
      const W = cv.width, H = cv.height
      ctx.clearRect(0, 0, W, H)
      const isDark = document.body.classList.contains('dark')
      const c = isDark ? '200,196,184' : '30,28,22'
      const amp = playing ? 1.45 : 1.0
      const p = 1.0 + .018*Math.sin(tRef.current*.02)

      ;[
        [H*.38, H*.18*p*amp, 2.4, .058, .24, 1.3],
        [H*.44, H*.11*p*amp, 4.6, .1,   .16, .85],
        [H*.50, H*.07*p*amp, 7.2, .15,  .13, .65],
        [H*.54, H*.04*p*amp, 11,  .22,  .09, .5 ],
        [H*.70, H*.06*p*amp, 3,   .08,  .14, .9 ],
        [H*.80, H*.03*p*amp, 6,   .16,  .08, .5 ],
      ].forEach(([wy,amp2,fr,sp,al,lw]) => {
        ctx.beginPath()
        for (let x=0; x<=W; x+=2) {
          const y = wy + amp2*Math.sin((x/W)*Math.PI*2*fr + tRef.current*sp)
          x===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y)
        }
        ctx.strokeStyle = `rgba(${c},${al})`; ctx.lineWidth = lw; ctx.stroke()
      })

      for (let i=0; i<9; i++) {
        const nx = (i/8)*W
        const ny = H*.5 + H*.014*Math.sin(tRef.current*.04 + i*.7)
        ctx.beginPath(); ctx.arc(nx, ny, 1.8*p, 0, Math.PI*2)
        ctx.fillStyle = `rgba(${c},.22)`; ctx.fill()
      }

      tRef.current += spd
      animRef.current = requestAnimationFrame(frame)
    }
    animRef.current = requestAnimationFrame(frame)
    return () => { clearTimeout(to); obs.disconnect(); cancelAnimationFrame(animRef.current) }
  }, [playing, freq.morph])

  const fmt = v => `${Math.floor(v/60)}:${String(v%60).padStart(2,'0')}`
  const bsFill = Math.min(100, (elapsed/1200)*100)
  const bsState = [...BRAIN].reverse().find(b => elapsed >= b.t)
  const tabKeys = ['desc','research','ideal']
  const T = { en:{ back:'← Back', what:'What\'s happening', bs:'Brain State', vol:'Vol', play:`▶  Play · ${freq.hz} Hz`, stop:`⏸  Stop · ${freq.hz} Hz`, listening:'Listening' }, he:{ back:'← חזרה', what:'מה קורה עכשיו', bs:'מצב המוח', vol:'עוצמה', play:`▶  הפעל · ${freq.hz} Hz`, stop:`⏸  עצור · ${freq.hz} Hz`, listening:'מאזינים' } }[lang]

  return (
    <div className={s.screen}>
      <div className={s.astroBg}>
        <svg viewBox="0 0 220 400" fill="none" stroke="currentColor">
          <ellipse cx="110" cy="75" rx="44" ry="50" strokeWidth=".7"/>
          <ellipse cx="110" cy="80" rx="26" ry="22" fill="currentColor" opacity=".08" stroke="none"/>
          <rect x="96" y="122" width="28" height="14" rx="3" strokeWidth=".6"/>
          <path d="M68 136 Q55 160 50 200 Q46 240 54 280 L64 312 L84 322 L136 322 L156 312 L166 280 Q174 240 170 200 Q165 160 152 136 Z" strokeWidth=".6"/>
          <path d="M68 148 Q40 175 28 215" strokeWidth=".25" opacity=".3"/>
          <path d="M68 150 Q44 175 38 215" strokeWidth=".6"/>
          <path d="M152 150 Q176 175 182 215" strokeWidth=".6"/>
          <path d="M86 320 Q84 355 82 385" strokeWidth=".6"/>
          <path d="M134 320 Q136 355 138 385" strokeWidth=".6"/>
        </svg>
      </div>

      <div className={s.topNav}>
        <button className={s.backBtn} onClick={onBack}>{T.back}</button>
        <div className={s.num}>{freq.num} · {freq.cat}</div>
      </div>

      {/* Canvas — waves only */}
      <div className={s.cvWrap}>
        <canvas ref={cvRef} className={s.canvas}/>
        <button className={`${s.arr} ${s.arrR}`} onClick={onPrev}>›</button>
        <button className={`${s.arr} ${s.arrL}`} onClick={onNext}>‹</button>
      </div>

      {/* Minimal Hz bar below canvas */}
      <div className={s.freqBar}>
        <div className={s.freqLeft}>
          <span className={s.freqNum}>{freq.hz}</span>
          <span className={s.freqUnit}>Hz</span>
        </div>
        <div className={s.freqRight}>
          <div className={s.freqName}>{txt.name}</div>
          <div className={s.freqType}>{freq.type==='binaural'?'🎧 Binaural':(freq.noHp?'🔊 Pure Tone':'🔊 Pure Tone')}</div>
        </div>
      </div>

      <div className={s.scroll}>
        {/* Brain state */}
        <div className={s.bsSection}>
          <div className={s.bsSectionLabel}>
            <span>{T.what}</span>
            <span className={s.bsLivePill}>Live</span>
          </div>
        </div>
        <div className={s.brainState}>
          <div className={s.bsLabel}>
            <div className={s.bsPulse}/>
            {T.bs}
          </div>
          <div className={s.bsTxt} dangerouslySetInnerHTML={{__html: bsState ? bsState.txt(lang) : BRAIN[0].txt(lang)}}/>
          <div className={s.bsBar}>
            <div className={s.bsBarWrap}><div className={s.bsBarFill} style={{width:`${bsFill}%`}}/></div>
            <div className={s.bsTime}>{playing ? fmt(elapsed) : '0:00'}</div>
          </div>
        </div>

        <div className={s.sub}>{txt.sub?.toUpperCase()}</div>
        <div className={s.audioInfo}>{freq.type==='binaural' ? `${freq.cL} Hz ↔ ${freq.cR} Hz = Δ ${freq.beat} Hz · ${freq.wave}` : `${freq.hz} Hz · ${lang==='he'?'ללא אוזניות':'No headphones needed'}`}</div>

        <div className={s.tabs}>
          {TABS[lang].map((lbl,i) => (
            <button key={i} className={`${s.tab} ${tab===i?s.tabOn:''}`} onClick={() => setTab(i)}>{lbl}</button>
          ))}
        </div>
        <p className={s.tabTxt}>{txt[tabKeys[tab]]}</p>

        <div className={s.timers}>
          {TIMERS[lang].map((lbl,i) => (
            <button key={i} className={`${s.timer} ${timerSel===i?s.timerOn:''}`} onClick={() => setTimerSel(i)}>{lbl}</button>
          ))}
        </div>

        <div className={s.volRow}>
          <span className={s.volLbl}>{T.vol}</span>
          <input type="range" min="0" max="100" value={volume} step="1" onChange={e => onVolumeChange(freq.id, Number(e.target.value))}/>
          <span className={s.volNum}>{volume}</span>
        </div>

        <button className={`${s.playBtn} ${playing?s.playOn:''}`} onClick={() => playing ? onStop(freq.id) : onPlay(freq)}>
          {playing ? T.stop : T.play}
        </button>
        {playing && <p className={s.elapsed}>{T.listening} · {fmt(elapsed)}</p>}
      </div>
    </div>
  )
}
