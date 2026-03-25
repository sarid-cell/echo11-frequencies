import { useState } from 'react'
import s from './LibraryScreen.module.css'

const CAT = { science:{en:'Science',he:'מדע מוכח'}, solfeggio:{en:'Solfeggio',he:'סולפג׳יו'}, echo11:{en:'echo.11',he:'echo.11'} }

export default function LibraryScreen({ frequencies, lang, playingId, onSelect, onBack }) {
  const [hov, setHov] = useState(null)
  const T = {
    en:{ back:'← Back', title:'Library · 22 Frequencies', search:'Search frequencies...' },
    he:{ back:'← חזרה', title:'ספריה · 22 תדרים', search:'חיפוש תדרים...' }
  }[lang]

  return (
    <div className={s.screen}>
      <div className={s.hdr}>
        <button className={s.back} onClick={onBack}>{T.back}</button>
        <div className={s.title}>{T.title}</div>
      </div>
      <div className={s.searchWrap}>
        <span className={s.searchIcon}>⌕</span>
        <input className={s.searchInput} placeholder={T.search}/>
      </div>

      <div className={s.scroll}>
        {['science','solfeggio','echo11'].map(cat => {
          const group = frequencies.filter(f => f.cat === cat)
          return (
            <div key={cat}>
              <div className={s.grpHdr}>
                <div className={s.grpLbl}>{CAT[cat][lang]}</div>
                <div className={s.grpLine}/>
                <div className={s.grpCnt}>{group.length}</div>
              </div>
              {group.map(f => {
                const txt = f[lang]
                const isPlay = playingId === f.id
                const isHov = hov === f.id
                return (
                  <button key={f.id}
                    className={`${s.row} ${isPlay?s.rowPlaying:''}`}
                    style={{ background: isHov ? 'var(--card)' : 'var(--bg)' }}
                    onMouseEnter={() => setHov(f.id)}
                    onMouseLeave={() => setHov(null)}
                    onClick={() => onSelect(f)}>
                    <div className={s.accent} style={{ opacity: isHov ? 1 : 0 }}/>
                    <div className={s.hzCol}>
                      <span className={s.hzV} style={{ color: isHov||isPlay ? 'var(--t1)' : 'var(--t3)' }}>{f.hz}</span>
                      <span className={s.hzU}>Hz</span>
                    </div>
                    <div className={s.mid}>
                      <div className={s.nm} style={{ color: isHov||isPlay ? 'var(--t1)' : 'var(--t2)' }}>{txt.name}</div>
                      <div className={s.sb}>{txt.sub}</div>
                    </div>
                    <div className={s.right}>
                      {isPlay && <div className={s.playDot}/>}
                      <span className={s.typeIcon}>{f.type==='binaural'?'🎧':f.noHp?'🔊':''}</span>
                      <span className={s.arrow} style={{ color: isHov ? 'var(--t2)' : 'var(--t4)' }}>›</span>
                    </div>
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
