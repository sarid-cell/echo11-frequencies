import { useState } from 'react'
import s from './HomeScreen.module.css'

const GEO = {
  circle:  `<circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth=".8" opacity=".44"/><circle cx="50" cy="50" r="27" fill="none" stroke="currentColor" strokeWidth=".5" opacity=".27"/><circle cx="50" cy="50" r="14" fill="none" stroke="currentColor" strokeWidth=".4" opacity=".17"/><circle cx="50" cy="50" r="4" fill="currentColor" opacity=".44"/>`,
  triangle:`<polygon points="50,8 90,76 10,76" fill="none" stroke="currentColor" strokeWidth=".8" opacity=".44"/><polygon points="50,24 74,66 26,66" fill="none" stroke="currentColor" strokeWidth=".5" opacity=".27"/><circle cx="50" cy="52" r="4" fill="currentColor" opacity=".44"/>`,
  square:  `<rect x="10" y="10" width="80" height="80" fill="none" stroke="currentColor" strokeWidth=".8" opacity=".44"/><rect x="24" y="24" width="52" height="52" fill="none" stroke="currentColor" strokeWidth=".5" opacity=".27"/><rect x="38" y="38" width="24" height="24" fill="none" stroke="currentColor" strokeWidth=".4" opacity=".17"/><rect x="46" y="46" width="8" height="8" fill="currentColor" opacity=".44"/>`,
  diamond: `<polygon points="50,6 94,50 50,94 6,50" fill="none" stroke="currentColor" strokeWidth=".8" opacity=".44"/><polygon points="50,22 78,50 50,78 22,50" fill="none" stroke="currentColor" strokeWidth=".5" opacity=".27"/><circle cx="50" cy="50" r="4" fill="currentColor" opacity=".44"/>`,
}

const BARS = [38,62,48,78,52,68,88]
const DAYS_EN = ['M','T','W','T','F','S','S']
const DAYS_HE = ['ב','ג','ד','ה','ו','ש','א']

export default function HomeScreen({ modes, lang, onMode, onLibrary, onPlayer, todayFreq }) {
  const [hov, setHov] = useState(null)
  const days = lang === 'he' ? DAYS_HE : DAYS_EN

  const T = {
    en:{ progress:'Your progress', streak:'day streak', streakSub:'Most played: 432 Hz',
         today:"Today's Frequency", tap:'Tap to listen →', choose:'Choose a mode',
         library:'← Full Library · 22 Frequencies', freq:'frequencies' },
    he:{ progress:'ההתקדמות שלך', streak:'ימים רצופים', streakSub:'הכי מאוזן: 432 Hz',
         today:'התדר של היום', tap:'לחצי להאזנה ←', choose:'בחרי מצב',
         library:'← ספריה מלאה · 22 תדרים', freq:'תדרים' },
  }[lang]

  return (
    <div className={s.screen}>
      {/* Progress */}
      <div className={s.progressLabel}>{T.progress}</div>
      <div className={s.streakCard}>
        <div className={s.streakL}>
          <div className={s.streakNum}>11</div>
          <div>
            <div className={s.streakLabel}>{T.streak}</div>
            <div className={s.streakSub}>{T.streakSub}</div>
          </div>
        </div>
        <div className={s.graphWrap}>
          <div className={s.bars}>
            {BARS.map((h,i) => (
              <div key={i} className={`${s.bar} ${i===6?s.barToday:h>50?s.barHas:''}`} style={{height:`${h}%`}}/>
            ))}
          </div>
          <div className={s.dayLabels}>
            {days.map((d,i) => <div key={i} className={`${s.dayLbl} ${i===6?s.dayToday:''}`}>{d}</div>)}
          </div>
        </div>
      </div>

      {/* Today's frequency */}
      <div className={s.hero} onClick={onPlayer}>
        <div className={s.heroWaves}>
          <svg viewBox="0 0 400 145" preserveAspectRatio="none">
            <path d="M-10,72 Q70,42 160,72 Q250,102 340,72 Q370,56 410,72" fill="none" stroke="currentColor" strokeWidth="1.1"/>
            <path d="M-10,88 Q80,58 170,88 Q260,118 350,88 Q378,72 410,90" fill="none" stroke="currentColor" strokeWidth=".7"/>
            <path d="M-10,56 Q60,28 140,56 Q220,84 300,56 Q360,28 410,58" fill="none" stroke="currentColor" strokeWidth=".5"/>
          </svg>
        </div>
        <div className={s.heroFig}>
          <svg viewBox="0 0 52 86" fill="none" stroke="currentColor">
            <ellipse cx="26" cy="13" rx="10" ry="11" strokeWidth=".7"/>
            <ellipse cx="26" cy="15" rx="7" ry="6" fill="currentColor" opacity=".08" stroke="none"/>
            <rect x="19" y="23" width="14" height="7" rx="2" strokeWidth=".6"/>
            <path d="M14 30 Q8 40 7 52 Q6 63 10 72 L14 78 L38 78 L42 72 Q46 63 45 52 Q44 40 38 30 Z" strokeWidth=".6"/>
            <path d="M14 34 Q4 50 2 64" strokeWidth=".28" opacity=".3"/>
            <path d="M14 36 Q6 48 5 60" strokeWidth=".6"/>
            <path d="M38 36 Q46 48 47 60" strokeWidth=".6"/>
          </svg>
        </div>
        <div className={s.heroContent}>
          <div className={s.heroLabel}>
            <div className={s.liveDot}/>
            {T.today}
          </div>
          <div className={s.heroHzRow}>
            <div className={s.heroHz}>{todayFreq?.hz || 432}</div>
            <div className={s.heroUnit}>Hz</div>
          </div>
          <div className={s.heroName}>{todayFreq ? todayFreq[lang].name : (lang==='he'?'היקום':'The Universe')} · {todayFreq ? todayFreq[lang].sub : ''}</div>
          <div className={s.heroCta}>{T.tap}</div>
        </div>
      </div>

      <div className={s.modesLabel}>{T.choose}</div>
      <div className={s.grid}>
        {modes.map(mode => (
          <button
            key={mode.id}
            className={s.card}
            style={{ borderColor: hov===mode.id ? 'var(--b3)' : 'var(--b1)', transform: hov===mode.id ? 'translateY(-2px)' : 'none', boxShadow: hov===mode.id ? 'var(--shadow)' : 'none' }}
            onMouseEnter={() => setHov(mode.id)}
            onMouseLeave={() => setHov(null)}
            onClick={() => onMode(mode)}
          >
            <div className={s.geo}>
              <svg viewBox="0 0 100 100" dangerouslySetInnerHTML={{__html: GEO[mode.shape]}}/>
            </div>
            <div className={s.cardName}>{mode[lang]}</div>
            <div className={s.cardCount}>{mode.ids.length} {T.freq}</div>
          </button>
        ))}
      </div>

      <button className={s.libLink} onClick={onLibrary}>{T.library}</button>
    </div>
  )
}
