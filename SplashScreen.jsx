import { useEffect, useRef } from 'react'
import s from './SplashScreen.module.css'

export default function SplashScreen({ onEnter, lang }) {
  const cvRef = useRef(null)
  const animRef = useRef(null)

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return
    const ctx = cv.getContext('2d')
    const stars = Array.from({ length: 160 }, () => ({
      x: Math.random()*2-1, y: Math.random()*2-1,
      z: Math.random(), speed: .0006 + Math.random()*.0009, size: Math.random()*1.2
    }))
    let lightZ = 0, t = 0

    const resize = () => { cv.width = cv.offsetWidth || 400; cv.height = cv.offsetHeight || 700 }
    resize()
    const obs = new ResizeObserver(resize); obs.observe(cv)

    function frame() {
      const W = cv.width, H = cv.height, cx = W/2, cy = H*.32
      ctx.clearRect(0, 0, W, H)
      const isDark = document.body.classList.contains('dark')
      const sc = isDark ? '235,233,225' : '20,20,16'

      stars.forEach(st => {
        st.z += st.speed
        if (st.z > 1) { st.z = .01; st.x = Math.random()*2-1; st.y = Math.random()*2-1 }
        const p = 1/(1-st.z*.9), px = cx+st.x*W*.5*p, py = cy+st.y*H*.38*p
        if (px<0||px>W||py<0||py>H) return
        const r = Math.max(.2, st.size*st.z*1.2), a = st.z*.7
        ctx.beginPath(); ctx.arc(px,py,r,0,Math.PI*2)
        ctx.fillStyle = `rgba(${sc},${a})`; ctx.fill()
      })

      lightZ = Math.min(1, lightZ + .002)
      const sR = lightZ < .1 ? .5 : lightZ*5, gR = sR*7
      const al = lightZ
      ;[gR*3,gR*2,gR,sR*2.5,sR].forEach((r,i) => {
        const a = [.015,.03,.07,.13,.7][i]*al
        const g = ctx.createRadialGradient(cx,cy,0,cx,cy,r)
        const col = isDark ? `rgba(255,255,252,${a})` : `rgba(40,38,30,${a*.35})`
        g.addColorStop(0, col)
        g.addColorStop(.5, isDark ? `rgba(240,238,230,${a*.3})` : `rgba(40,38,30,${a*.1})`)
        g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fillStyle=g; ctx.fill()
      })

      if (lightZ > .4) {
        const ra = (lightZ-.4)/.6*.1
        ;[60,110,180,260].forEach((r,i) => {
          ctx.beginPath(); ctx.arc(cx,cy,r+Math.sin(t*.015+i)*3,0,Math.PI*2)
          ctx.strokeStyle = isDark ? `rgba(200,196,184,${ra*(1-i*.2)})` : `rgba(40,38,30,${ra*.4*(1-i*.2)})`
          ctx.lineWidth = .4; ctx.stroke()
        })
      }
      t++; animRef.current = requestAnimationFrame(frame)
    }
    animRef.current = requestAnimationFrame(frame)
    return () => { obs.disconnect(); cancelAnimationFrame(animRef.current) }
  }, [])

  const T = {
    en: {
      sub: 'frequencies',
      desc: '22 science-backed healing frequencies.\nTune your nervous system.',
      hpMain: 'Headphones required',
      hpSub: 'BINAURAL BEATS · STEREO SEPARATION',
      btn: 'Enter echo.11 →'
    },
    he: {
      sub: 'תדרים',
      desc: '22 תדרי ריפוי מבוססי מדע.\nכווני את מערכת העצבים שלך.',
      hpMain: 'חובה להשתמש באוזניות',
      hpSub: 'BINAURAL BEATS · הפרדה סטריאו',
      btn: 'כנסי לאפליקציה ←'
    }
  }[lang]

  return (
    <div className={s.splash}>
      {/* Particle canvas — behind image */}
      <canvas ref={cvRef} className={s.canvas} />

      {/* Real astronaut image — full bleed */}
      <div className={s.imgLayer}>
        <img
          src="/astronaut.jpg"
          alt="echo.11 — a figure walking through a white desert"
          className={s.img}
          onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='block' }}
        />
        {/* SVG fallback — faithful to the photo */}
        <svg className={s.fallback} viewBox="0 0 500 360" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="ls" cx="78%" cy="10%" r="48%">
              <stop offset="0%" stopColor="#fff" stopOpacity=".9"/>
              <stop offset="55%" stopColor="#e8e7e0" stopOpacity=".3"/>
              <stop offset="100%" stopColor="#c8c7c0" stopOpacity="0"/>
            </radialGradient>
            <linearGradient id="sg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#dddcd6"/><stop offset="100%" stopColor="#c0bfb8"/>
            </linearGradient>
            <linearGradient id="lsh" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8a8980" stopOpacity=".3"/><stop offset="35%" stopColor="#8a8980" stopOpacity="0"/>
            </linearGradient>
          </defs>
          <rect width="500" height="360" fill="url(#sg)"/>
          <path d="M-20,175 Q80,138 180,175 Q280,212 380,175 Q440,152 520,175" fill="none" stroke="#a8a7a0" strokeWidth="1.2" opacity=".6"/>
          <path d="M-20,195 Q90,158 200,195 Q310,232 420,195 Q465,172 520,197" fill="none" stroke="#a8a7a0" strokeWidth=".9" opacity=".44"/>
          <path d="M-20,155 Q70,120 160,155 Q250,190 340,155 Q400,130 520,158" fill="none" stroke="#a8a7a0" strokeWidth=".7" opacity=".33"/>
          <path d="M-20,135 Q60,104 140,135 Q220,166 300,135 Q380,104 520,138" fill="none" stroke="#a8a7a0" strokeWidth=".55" opacity=".25"/>
          <path d="M-20,215 Q100,180 220,215 Q340,250 460,215 Q490,202 520,217" fill="none" stroke="#a0a098" strokeWidth=".7" opacity=".33"/>
          <g transform="translate(215,22)">
            <ellipse cx="38" cy="295" rx="50" ry="10" fill="#888" opacity=".18" transform="skewX(-15) translate(-8,0)"/>
            <path d="M28 245 Q26 270 24 295" stroke="#b8b7b0" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
            <path d="M48 245 Q50 268 52 292" stroke="#b8b7b0" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
            <ellipse cx="23" cy="298" rx="11" ry="5" fill="#b0afaa"/>
            <ellipse cx="53" cy="295" rx="11" ry="5" fill="#b0afaa"/>
            <path d="M20 100 Q14 120 12 145 Q10 168 14 195 Q16 220 20 238 L24 248 L52 248 L56 238 Q60 220 62 195 Q66 168 64 145 Q62 120 56 100 Z" fill="#cccbc4"/>
            <path d="M20 108 Q4 130 -4 165 Q-10 196 0 224 Q8 244 20 256" fill="none" stroke="#c8c7c0" strokeWidth="2.5" strokeLinecap="round" opacity=".65"/>
            <path d="M18 115 Q-6 142 -14 178 Q-20 210 -8 238" fill="none" stroke="#c0bfb8" strokeWidth="1.5" strokeLinecap="round" opacity=".38"/>
            <path d="M20 108 Q8 128 5 155 Q3 172 8 185" stroke="#c8c7c0" strokeWidth="3" fill="none" strokeLinecap="round"/>
            <path d="M56 108 Q68 128 71 155 Q73 172 68 185" stroke="#c8c7c0" strokeWidth="3" fill="none" strokeLinecap="round"/>
            <ellipse cx="7" cy="190" rx="8" ry="9" fill="#bebdb6"/>
            <ellipse cx="69" cy="190" rx="8" ry="9" fill="#bebdb6"/>
            <rect x="26" y="88" width="24" height="14" rx="4" fill="#c8c7c0" stroke="#b8b7b0" strokeWidth=".5"/>
            <ellipse cx="38" cy="60" rx="30" ry="32" fill="#d8d7d0"/>
            <ellipse cx="38" cy="60" rx="28" ry="30" fill="#d0cfca"/>
            <ellipse cx="38" cy="63" rx="18" ry="15" fill="#1a1918" opacity=".62"/>
            <ellipse cx="28" cy="48" rx="8" ry="5" fill="white" opacity=".22" transform="rotate(-15,28,48)"/>
            <ellipse cx="-15" cy="305" rx="9" ry="3.5" fill="#a8a7a0" opacity=".38" transform="rotate(-12,-15,305)"/>
            <ellipse cx="5" cy="312" rx="9" ry="3.5" fill="#a8a7a0" opacity=".28" transform="rotate(8,5,312)"/>
          </g>
          <rect width="500" height="360" fill="url(#ls)"/>
          <rect width="500" height="360" fill="url(#lsh)"/>
        </svg>
      </div>

      <div className={s.topVig} />
      <div className={s.botFade} />

      <div className={s.ui}>
        <div className={s.icon}>
          <span className={s.ib}/><span className={`${s.ib} ${s.it}`}/><span className={s.is}/><span className={`${s.ib} ${s.it}`}/><span className={s.ib}/>
        </div>
        <h1 className={s.title}>echo.11</h1>
        <p className={s.sub}>{T.sub}</p>
        <div className={s.line}/>
        <p className={s.desc}>{T.desc}</p>
        <div className={s.hp}>
          <span style={{fontSize:20,flexShrink:0}}>🎧</span>
          <div>
            <p className={s.hpMain}>{T.hpMain}</p>
            <p className={s.hpSub}>{T.hpSub}</p>
          </div>
        </div>
        <button className={s.enter} onClick={onEnter}>{T.btn}</button>
      </div>
    </div>
  )
}
