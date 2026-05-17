// ─────────────────────────────────────────────────────────────
// Analytics: track() wrapper + lightweight bot detection
// gtag() is defined later (load script at bottom) but dataLayer is
// buffered — so calls made early are queued safely.
// ─────────────────────────────────────────────────────────────
const TRACK_ONCE = new Set()
function detectBotSignals(){
  try{
    const reasons = []
    const ua = (navigator.userAgent || '').toLowerCase()
    if(/headlesschrome|phantomjs|selenium|puppeteer|playwright|electron|bot|spider|crawler|slurp|bingpreview|googlebot|lighthouse|chrome-lighthouse|pingdom|datadog|ahrefs|semrush/i.test(ua)) reasons.push('ua')
    if(navigator.webdriver === true) reasons.push('webdriver')
    if(!navigator.languages || navigator.languages.length === 0) reasons.push('no_lang')
    if(!navigator.cookieEnabled) reasons.push('no_cookies')
    // Headless Chrome often has no plugins AND is not mobile
    const isMobile = /android|iphone|ipad|ipod|mobile/i.test(ua)
    if(!isMobile && navigator.plugins && navigator.plugins.length === 0) reasons.push('no_plugins')
    // Screen size that hints at headless
    if(window.outerWidth === 0 || window.outerHeight === 0) reasons.push('no_window')
    return { isBot: reasons.length >= 2, reasons }
  }catch(e){ return { isBot:false, reasons:['err'] } }
}
const ECHO_BOT = detectBotSignals()
window.__echoBot = ECHO_BOT
const ECHO_SESSION_ID = (()=>{
  try{
    let id = sessionStorage.getItem('echo11_sess_id')
    if(!id){ id = Math.random().toString(36).slice(2,10) + Date.now().toString(36).slice(-4); sessionStorage.setItem('echo11_sess_id', id) }
    return id
  }catch(e){ return 'nosess' }
})()

// Track an event. `opts.once` = true → fire only first time per session.
// Honors per-browser opt-out via localStorage flag set on legal.html.
function track(eventName, params, opts){
  try{
    // GDPR/CCPA opt-out — no events sent if user disabled analytics on this browser
    try{ if(localStorage.getItem('echo11_no_analytics')==='1') return }catch(e){}
    if(opts && opts.once){
      if(TRACK_ONCE.has(eventName)) return
      TRACK_ONCE.add(eventName)
    }
    const payload = Object.assign({
      is_bot: ECHO_BOT.isBot ? 1 : 0,
      bot_reasons: ECHO_BOT.reasons.join(',') || 'none',
      session_id: ECHO_SESSION_ID,
    }, params || {})
    if(typeof gtag === 'function'){
      gtag('event', eventName, payload)
    } else if(window.dataLayer){
      // gtag stub not yet defined — push directly so it's flushed on load
      window.dataLayer.push(['event', eventName, payload])
    }
  }catch(e){ /* analytics must never break the app */ }
}

// ── Weekly Shape system ──────────────────────────────────────
// 7 days = 7 stages, each stage = a more complete geometric form
const SHAPE_STAGES=[
  {days:0, name:'', nameHe:'',          desc:'start listening to begin your journey', descHe:'התחילי להאזין כדי להתחיל את המסע'},
  {days:1, name:'a point.',nameHe:'נקודה.',desc:'you have arrived. the journey begins.',descHe:'הגעת. המסע מתחיל.'},
  {days:2, name:'a line.',nameHe:'קו.',   desc:'two days. you are building a thread.',descHe:'יומיים. את בונה חוט.'},
  {days:3, name:'a triangle.',nameHe:'משולש.',desc:'three points. stability is forming.',descHe:'שלוש נקודות. יציבות מתגבשת.'},
  {days:4, name:'a square.',nameHe:'ריבוע.',desc:'four corners. a foundation is here.',descHe:'ארבע פינות. בסיס נוצר.'},
  {days:5, name:'a pentagon.',nameHe:'מחומש.',desc:'five days. your system is remembering.',descHe:'חמישה ימים. מערכת העצבים זוכרת.'},
  {days:6, name:'a hexagon.',nameHe:'משושה.',desc:'six days. you are almost whole.',descHe:'שישה ימים. כמעט שלמה.'},
  {days:7, name:'a circle.',nameHe:'מעגל.',desc:'seven days complete. you are the frequency.',descHe:'שבעה ימים שלמים. את התדר.'},
]

// ── Monthly progression ─────────────────────────────────────
// Total listening days this calendar month → 0..30
function getMonthlyDays(){
  const sessions=loadSessions()
  const now=new Date()
  const ym=`${now.getFullYear()}-${now.getMonth()+1}`
  return Object.keys(sessions).filter(k=>k.startsWith(ym)&&(sessions[k].total||0)>0).length
}

// Monthly reflection texts — shown in history
const MONTHLY_REFLECTIONS=[
  {min:0,  en:'your journey is waiting. the first frequency changes everything.',                he:'המסע שלך מחכה. התדר הראשון משנה הכל.'},
  {min:1,  en:'you showed up. that is everything.',                                             he:'הגעת. זה הכל.'},
  {min:3,  en:'three days. your nervous system is beginning to remember.',                      he:'שלושה ימים. מערכת העצבים שלך מתחילה לזכור.'},
  {min:7,  en:'a full week. you have drawn your first circle. keep going.',                     he:'שבוע שלם. ציירת את המעגל הראשון שלך. המשיכי.'},
  {min:14, en:'two weeks in. the pattern is forming. your body knows this now.',                he:'שבועיים. הדפוס נוצר. גופך כבר יודע את זה.'},
  {min:21, en:'twenty-one days. science says habits form here. you are proof.',                 he:'עשרים ואחד יום. המדע אומר שהרגלים נוצרים כאן. את ההוכחה.'},
  {min:28, en:'a full month. you are the frequency. this is who you are now.',                  he:'חודש שלם. את התדר. זו את עכשיו.'},
]

function getMonthlyReflection(totalDays){
  const isHe=lang==='he'
  const r=[...MONTHLY_REFLECTIONS].reverse().find(r=>totalDays>=r.min)||MONTHLY_REFLECTIONS[0]
  return isHe?r.he:r.en
}

function drawWeeklyShape(ctx, days, size){
  ctx.clearRect(0,0,size,size)
  const cx=size/2, cy=size/2, r=size*.36
  const isDark=document.body.classList.contains('dark')||document.body.classList.contains('hc-mode')
  const stroke=isDark?'rgba(245,243,238,.7)':'rgba(26,26,24,.55)'
  const fill=isDark?'rgba(245,243,238,.06)':'rgba(26,26,24,.04)'

  // ghost circle = target (full 7-day circle)
  if(days>0 && days<7){
    ctx.save()
    ctx.setLineDash([size*.03,size*.025])
    ctx.strokeStyle=isDark?'rgba(245,243,238,.15)':'rgba(26,26,24,.12)'
    ctx.lineWidth=size*.008
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.stroke()
    ctx.restore()
  }
    ctx.strokeStyle=stroke
  ctx.fillStyle=fill
  ctx.lineWidth=size*.012

  if(days===0){ // dot hint
    ctx.beginPath()
    ctx.arc(cx,cy,size*.04,0,Math.PI*2)
    ctx.fillStyle=isDark?'rgba(245,243,238,.2)':'rgba(26,26,24,.15)'
    ctx.fill()
    return
  }
  if(days===1){ // point
    ctx.beginPath()
    ctx.arc(cx,cy,size*.05,0,Math.PI*2)
    ctx.fillStyle=stroke; ctx.fill()
    return
  }
  if(days>=7){ // full circle
    ctx.beginPath()
    ctx.arc(cx,cy,r,0,Math.PI*2)
    ctx.fill(); ctx.stroke()
    // inner glow ring
    ctx.beginPath()
    ctx.arc(cx,cy,r*.55,0,Math.PI*2)
    ctx.strokeStyle=isDark?'rgba(245,243,238,.2)':'rgba(26,26,24,.15)'
    ctx.stroke()
    return
  }
  // polygon for days 2–6
  const sides=days
  ctx.beginPath()
  for(let i=0;i<sides;i++){
    const angle=(Math.PI*2/sides)*i - Math.PI/2
    const x=cx+r*Math.cos(angle), y=cy+r*Math.sin(angle)
    i===0?ctx.moveTo(x,y):ctx.lineTo(x,y)
  }
  ctx.closePath()
  ctx.fill(); ctx.stroke()
  // vertices
  for(let i=0;i<sides;i++){
    const angle=(Math.PI*2/sides)*i - Math.PI/2
    const x=cx+r*Math.cos(angle), y=cy+r*Math.sin(angle)
    ctx.beginPath()
    ctx.arc(x,y,size*.028,0,Math.PI*2)
    ctx.fillStyle=stroke; ctx.fill()
  }
}

// ── AI Analysis ──────────────────────────────────────────────
async function runAIAnalysis(){
  const sessions=loadSessions()
  const keys=Object.keys(sessions).sort((a,b)=>b.localeCompare(a)).slice(0,7)
  if(!keys.length) return

  const btn=document.getElementById('hist-ai-btn')
  const content=document.getElementById('hist-ai-content')
  btn.style.display='none'
  content.innerHTML=`<div style="display:flex;align-items:center;gap:10px;padding:8px 0">
    <div class="ldot"></div>
    <span style="font-family:'DM Sans',sans-serif;font-size:11px;font-weight:300;color:var(--t3);letter-spacing:.1em">${lang==='he'?'מנתח את השבוע שלך...':'analysing your week...'}</span>
  </div>`

  // Build data summary for Claude
  const summary=keys.map(k=>{
    const d=sessions[k]
    const mins=Math.round((d.total||0)/60)
    const freqs=d.freqs?Object.keys(d.freqs).map(fid=>{
      const f=FREQS.find(x=>x.id===fid)
      return f?`${(f.en).name} (${f.hz}Hz)`:fid
    }).join(', '):'unknown'
    return `${k}: ${mins} min — ${freqs}`
  }).join('\n')

  const prompt=`You are a gentle, science-informed wellness guide for echo.11, a healing frequencies app. 
Analyse this user's listening history from the past 7 days and give a warm, personal weekly insight.

Listening data:
${summary}

Guidelines:
- 3–4 sentences maximum
- Mention specific frequencies they listened to and what that pattern suggests about their nervous system state
- Give one gentle suggestion for next week
- Tone: warm, poetic, scientific but accessible
- ${lang==='he'?'Respond in Hebrew':'Respond in English'}
- Do NOT use bullet points. Write flowing prose.
- Do NOT mention "AI" or "analysis". Speak as if you deeply understand their journey.`

  try{
    const resp=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        model:'claude-sonnet-4-20250514',
        max_tokens:220,
        messages:[{role:'user',content:prompt}]
      })
    })
    const data=await resp.json()
    const text=data.content?.[0]?.text||''
    content.innerHTML=`
      <div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:15px;font-weight:200;font-style:italic;color:var(--t1);line-height:1.75;margin-bottom:14px">${text}</div>
      <button onclick="runAIAnalysis()" style="background:none;border:none;font-family:'DM Sans',sans-serif;font-size:9px;letter-spacing:.18em;color:var(--t4);cursor:pointer;padding:0">↻ ${lang==='he'?'ניתוח מחדש':'refresh'}</button>`
  }catch(e){
    content.innerHTML=`<div style="font-family:'DM Sans',sans-serif;font-size:11px;color:var(--t3);padding:8px 0">${lang==='he'?'לא ניתן להתחבר כרגע.':'Could not connect right now.'}</div>
    <button onclick="runAIAnalysis()" style="background:none;border:none;font-family:'DM Sans',sans-serif;font-size:9px;letter-spacing:.18em;color:var(--t3);cursor:pointer">↻ try again</button>`
  }
}

// ── buildHistory ─────────────────────────────────────────────
function buildHistory(){
  const sessions=loadSessions()
  const keys=Object.keys(sessions).sort((a,b)=>b.localeCompare(a))
  const isHe=lang==='he'

  // ── Dynamic headline ──
  const streak=calcStreak(sessions)
  const totalMins=Math.round(Object.values(sessions).reduce((s,d)=>s+(d.total||0),0)/60)
  const headlines=[
    streak>=7  ? (isHe?`${streak} ימים. את התדר.`:`${streak} days. you are the frequency.`) : null,
    streak>=3  ? (isHe?`${streak} ימים רצופים. מערכת העצבים שלך מרגישה.`:`${streak} days in a row. your nervous system feels it.`) : null,
    streak===1  ? (isHe?'יום ראשון. הנסיעה מתחילה.':'day one. the journey begins.') : null,
    totalMins>=60? (isHe?`${totalMins} דקות של כוונון.`:`${totalMins} minutes of tuning.`) : null,
    isHe?'ההיסטוריה שלך.':'your history.',
  ].find(h=>h!==null)||''
  const headEl=document.getElementById('hist-headline')
  if(headEl) headEl.textContent=headlines

  // ── Stats ──
  const statsEl=document.getElementById('hist-stats')
  if(statsEl) statsEl.innerHTML=[
    [streak, isHe?'ימים רצופים':'day streak'],
    [totalMins, isHe?'דקות':'total min'],
    [keys.length, isHe?'ימים':'days active'],
  ].map(([v,l])=>`
    <div style="background:var(--bg2);border-radius:12px;padding:12px 10px;text-align:center">
      <div style="font-family:'DM Sans',sans-serif;font-size:9px;letter-spacing:.18em;color:var(--t3);text-transform:uppercase;margin-bottom:5px">${l}</div>
      <div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:30px;font-weight:200;color:var(--t1);line-height:1">${v}</div>
    </div>`).join('')

  // ── Monthly stats ──
  const monthlyDays=getMonthlyDays()
  // Reflection
  const reflEl=document.getElementById('hist-reflection')
  if(reflEl){
    const refl=getMonthlyReflection(monthlyDays)
    const isHe=lang==='he'
    reflEl.innerHTML=`
      <div style="font-family:'DM Sans',sans-serif;font-size:9px;letter-spacing:.22em;color:var(--t3);text-transform:uppercase;margin-bottom:10px">${isHe?'תובנת החודש':'this month'} · ${monthlyDays} ${isHe?'ימים':'days'}</div>
      <div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:15px;font-weight:200;font-style:italic;color:var(--t1);line-height:1.75">${refl}</div>`
  }
  // ── Weekly Shape ──
  const daysThisWeek=Math.min(streak,7)
  const stage=SHAPE_STAGES[daysThisWeek]||SHAPE_STAGES[0]
  const cv=document.getElementById('weekly-shape-cv')
  if(cv){ const ctx=cv.getContext('2d'); drawWeeklyShape(ctx,daysThisWeek,180) }
  const shapeLblEl=document.getElementById('hist-shape-lbl')
  if(shapeLblEl) shapeLblEl.textContent=isHe?"המסע השבועי":"this weeks journey"
  const shapeTitleEl=document.getElementById('hist-shape-title')
  if(shapeTitleEl) shapeTitleEl.textContent=isHe?stage.nameHe:stage.name
  const shapeDescEl=document.getElementById('hist-shape-desc')
  if(shapeDescEl) shapeDescEl.textContent=isHe?stage.descHe:stage.desc
  // dots = days filled
  const dotsEl=document.getElementById('hist-dots')
  if(dotsEl) dotsEl.innerHTML=Array.from({length:7},(_,i)=>
    `<div style="width:6px;height:6px;border-radius:50%;background:${i<daysThisWeek?'var(--t1)':'var(--b2)'}"></div>`
  ).join('')
  // progress bar
  const pct=Math.round((daysThisWeek/7)*100)
  const barEl=document.getElementById('hist-prog-bar')
  if(barEl) setTimeout(()=>barEl.style.width=pct+'%',100)
  const progLblEl=document.getElementById('hist-prog-lbl')
  if(progLblEl) progLblEl.textContent=isHe?'לעבר המעגל השלם':'toward full circle'
  const progVal=document.getElementById('hist-prog-val')
  if(progVal) progVal.textContent=`${daysThisWeek}/7`

  // ── Session list ──
  const listEl=document.getElementById('hist-list')
  if(!listEl) return
  if(!keys.length){
    listEl.innerHTML=`<div style="text-align:center;padding:40px 0;font-family:'Cormorant Garamond',Georgia,serif;font-size:18px;font-weight:200;font-style:italic;color:var(--t3)">${isHe?'עדיין לא האזנת':'no sessions yet'}</div>`
    return
  }
  const labelEl=document.getElementById('hist-list')
  let html=`<div style="font-family:'DM Sans',sans-serif;font-size:9px;letter-spacing:.22em;color:var(--t3);text-transform:uppercase;margin-bottom:12px">${isHe?'היסטוריית האזנות':'session history'}</div>`
  keys.forEach(key=>{
    const d=sessions[key]
    const mins=Math.round((d.total||0)/60)
    if(!mins) return
    const [y,m,day]=key.split('-')
    const freqName=d.freqs?Object.keys(d.freqs).map(fid=>{
      const f=FREQS.find(x=>x.id===fid)
      return f?(f[lang]||f.en).name:fid
    }).join(', '):(isHe?'האזנה':'session')
    html+=`<div style="display:flex;align-items:center;justify-content:space-between;padding:14px 0;border-bottom:.5px solid var(--b1)">
      <div style="flex:1;min-width:0">
        <div style="font-family:'DM Sans',sans-serif;font-size:13px;font-weight:400;color:var(--t1);margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${freqName}</div>
        <div style="font-family:'DM Sans',sans-serif;font-size:10px;color:var(--t4)">${day}/${m}/${y} &nbsp;·&nbsp; ${mins} ${isHe?'דק':'min'}</div>
      </div>
      <div style="text-align:right;flex-shrink:0;margin-left:12px">
        <div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:22px;font-weight:200;color:var(--t2)">${mins}</div>
        <div style="font-family:'DM Sans',sans-serif;font-size:9px;letter-spacing:.12em;color:var(--t4)">${isHe?'דק':'min'}</div>
      </div>
    </div>`
  })
  listEl.innerHTML=html
}

// history trigger handled in main show()
const FREQS=[
  {id:'gamma', num:'A1',cat:'science', mode:'focus',   type:'binaural',  hz:40,  cL:200, cR:240, beat:40,  wave:'Gamma',morph:.045,en:{name:'Gamma MIT',sub:'Focus · Brain Health',desc:'Inspired by MIT Picower Institute (2016) research on 40 Hz stimulation and cognitive performance. echo.11 is not a medical device.',res:'MIT Picower Institute · Nature, 2016',ideal:'Deep focus · Writing · Learning · Brain fog relief',feel:'Heightened alertness. Mental clarity after 10–15 min.',rec:'Recommended: 20–40 min. Best in morning.',tag:'clarity begins here.'},he:{name:'גמא MIT',sub:'ריכוז · בריאות המוח',desc:'בהשראת מחקר MIT מ-2016 על גירוי ב-40 Hz וביצועים קוגניטיביים. echo.11 אינה מכשיר רפואי.',res:'MIT · Nature, 2016',ideal:'ריכוז עמוק · כתיבה · למידה · מניעת ערפל מוחי',feel:'ערנות מוגברת. בהירות מנטלית לאחר 10–15 דקות.',rec:'מומלץ: 20–40 דקות. הכי טוב בבוקר.',tag:'הבהירות מתחילה כאן.'}},
  {id:'alpha', num:'A2',cat:'science', mode:'focus',   type:'binaural',  hz:10,  cL:200, cR:210, beat:10,  wave:'Alpha',morph:.025,en:{name:'Alpha Silva',sub:'Creativity · Clarity',desc:'Alpha 8-12 Hz — the bridge between conscious and subconscious. The basis of the Silva Method, EEG-verified.',res:'José Silva · Silva Method · 1966',ideal:'Creativity · Accelerated learning · Light meditation',feel:'Gentle relaxation with alertness. Ideas arrive easily.',rec:'Recommended: 15–30 min. Before creative work.',tag:'where thinking becomes feeling.'},he:{name:'אלפא סילבה',sub:'יצירתיות · בהירות',desc:'אלפא 8-12 Hz — הגשר בין המודע לתת-מודע. הבסיס לשיטת סילבה.',res:'José Silva · שיטת סילבה · 1966',ideal:'יצירה · למידה מואצת · מדיטציה קלה'}},
  {id:'theta', num:'A3',cat:'science', mode:'healing', type:'binaural',  hz:6,   cL:200, cR:206, beat:6,   wave:'Theta',morph:.015,en:{name:'Deep Theta',sub:'Meditation · Subconscious',desc:'Theta 4-8 Hz appear in deep meditation and REM sleep. Excellent for emotional processing and trauma release.',res:'Brainwave Research · Multiple studies',ideal:'Deep meditation · Emotional healing · Misophonia',feel:'Deep calm. May feel on the edge of sleep. Emotional release is common.',rec:'Recommended: 20–45 min. Lying down if possible.',tag:'deep theta. let go.'},he:{name:'Theta עמוק',sub:'מדיטציה · תת-מודע',desc:'גלי תטא 4-8 Hz מופיעים במדיטציה עמוקה ובREM. מעולה לעיבוד רגשי.',res:'מחקרי גלי מוח · מחקרים מאומתים',ideal:'מדיטציה עמוקה · ריפוי רגשי · מיסופוניה',feel:'שלווה עמוקה. על סף שינה. שחרור רגשי שכיח.',rec:'מומלץ: 20–45 דקות. רצוי לשכב.',tag:'תטא עמוקה. שחרר/י.'}},
  {id:'beta',  num:'A4',cat:'science', mode:'focus',   type:'binaural',  hz:18,  cL:300, cR:318, beat:18,  wave:'Beta', morph:.05, en:{name:'Beta Focus',sub:'Attention · ADHD',desc:'Beta 12-30 Hz characterize active focus and logical thinking. Neurofeedback-proven for ADHD.',res:'Neurofeedback Research · EEG studies',ideal:'Focus · ADHD · Analytical tasks'},he:{name:'Beta ריכוז',sub:'קשב · ADHD',desc:'גלי בטא 12-30 Hz אופייניים למצבי ריכוז פעיל. מוכח בנוירופידבק לADHD.',res:'מחקרי נוירופידבק · EEG',ideal:'ריכוז · ADHD · מטלות ניתוח'}},
  {id:'delta', num:'A5',cat:'science', mode:'sleep',   type:'binaural',  hz:2,   cL:200, cR:202, beat:2,   wave:'Delta',morph:.008,en:{name:'Delta Sleep',sub:'Deep Sleep · Renewal',desc:'Delta 0.5-4 Hz are the deepest sleep stages. Body regenerates, immune system strengthens.',res:'Sleep Research · AASM guidelines',ideal:'Deep sleep · Physical recovery · Immune boost',feel:'Extreme drowsiness. You may fall asleep — this is the goal.',rec:'Recommended: 30–60 min. For sleep only.',tag:'your body remembers how to rest.'},he:{name:'Delta שינה',sub:'שינה עמוקה · התחדשות',desc:'גלי דלתא 0.5-4 Hz — שלבי השינה העמוקה ביותר. הגוף מתחדש.',res:'מחקרי שינה · AASM',ideal:'שינה עמוקה · התחדשות פיזית',feel:'ישנוניות עמוקה. ייתכן שתירדם/י — זה המטרה.',rec:'מומלץ: 30–60 דקות. לשינה בלבד.',tag:'הגוף שלך זוכר איך לנוח.'}},
  {id:'hz432', num:'B5',cat:'solfeggio',mode:'sleep',  type:'solfeggio',  hz:432, cL:432, cR:432, beat:null,wave:'Pure', morph:.022,noHp:true,en:{name:'The Universe',sub:'Deep Sleep · Release · Align',desc:'Mathematically aligned with the Golden Ratio and Fibonacci. Differs from standard 440 Hz — many report deeper sleep, greater calm, and natural alignment.',res:'Pythagorean tuning · Nature harmonics · Golden Ratio',ideal:'Deep sleep · Evening meditation · Emotional release · Nervous system reset',feel:'Warmth. Natural alignment. Calming of chest and shoulders.',rec:'Recommended: 20–60 min. Before sleep.',tag:'the universe is tuned to this.'},he:{name:'היקום',sub:'שינה עמוקה · שחרור · יישור',desc:'מיושר מתמטית עם מספר הזהב ופיבונאצ׳י. שונה מ-440 Hz הסטנדרטי.',res:'כוונון פיתגוראי · הרמוניות הטבע',ideal:'שינה עמוקה · מדיטציה · שחרור רגשי',feel:'חמימות. תחושת יישור טבעי.',rec:'מומלץ: 20–60 דקות. לפני שינה.',tag:'היקום מכוון לזה.'}},
  {id:'hz528', num:'B6',cat:'solfeggio',mode:'healing',type:'solfeggio',  hz:528, cL:528, cR:528, beat:null,wave:'Pure', morph:.025,noHp:true,img:'img_528.webp',imgPos:'center 82%',en:{name:'The Love',sub:'Heart · Restoration',desc:'Dr. Leonard Horowitz identified 528 Hz as the MI tone of the ancient Solfeggio scale. Used in sound healing traditions. Not a medical treatment. echo.11 is not a medical device.',res:'Dr. Leonard Horowitz · Solfeggio scale research',ideal:'Heart opening · Self-love · Emotional restoration',feel:'Warmth in the chest. Emotional openness. Tears are common.',rec:'Recommended: 15–30 min. No headphones needed.',tag:'something opens.'},he:{name:'האהבה',sub:'ריפוי · לב · שחרור',desc:'ד"ר הורוביץ זיהה 528 Hz כצליל MI. נפוץ בסאונד היילינג. echo.11 אינה מכשיר רפואי.',res:'ד"ר לאונרד הורוביץ · 2017',ideal:'ריפוי לב · אהבה עצמית · תיקון',feel:'חמימות בחזה. פתיחות רגשית. דמעות שכיחות.',rec:'מומלץ: 15–30 דקות. ללא אוזניות.',tag:'משהו נפתח.'}},
  {id:'hz396', num:'B3',cat:'solfeggio',mode:'healing',type:'solfeggio',  hz:396, cL:396, cR:396, beat:null,wave:'Pure', morph:.018,noHp:true,en:{name:'Liberation',sub:'Guilt · Trauma · Root',desc:'Solfeggio UT. Helps release fear, guilt and deep negative energy.',res:'Solfeggio UT · Ancient Gregorian chant',ideal:'Trauma release · Guilt processing · Emotional freedom'},he:{name:'שחרור עבר',sub:'אשמה · טראומה · שורש',desc:'סולפג׳יו UT. מסייע בשחרור פחד, אשמה ואנרגיה שלילית.',res:'סולפג׳יו UT · שירה גריגוריאנית עתיקה',ideal:'שחרור טראומה · אשמה · חופש רגשי'}},
  {id:'hz369', num:'B7',cat:'solfeggio',mode:'abundance',type:'solfeggio',hz:369, cL:369, cR:369, beat:null,wave:'Pure', morph:.028,noHp:true,en:{name:'Tesla 3-6-9',sub:'Energy · Alignment',desc:'"If you only knew the magnificence of 3, 6 and 9, you would have a key to the universe." — Nikola Tesla',res:'369 Hz · Tesla numerology philosophy',ideal:'Energy · Intention · Cosmic alignment'},he:{name:'טסלה 3-6-9',sub:'אנרגיה · יישור',desc:'״אם רק ידעת את גדולת 3, 6 ו-9, היית מחזיק בכל מפתחות היקום.״ — ניקולה טסלה',res:'בהשראת ניקולה טסלה',ideal:'אנרגיה · כוונה · יישור קוסמי'}},
  {id:'hz963', num:'B11',cat:'solfeggio',mode:'abundance',type:'solfeggio',hz:963,cL:963, cR:963, beat:null,wave:'Pure', morph:.028,noHp:true,en:{name:'Unity',sub:'Abundance · Awakening',desc:'Solfeggio SI — crown chakra. Known as the spiritual awakening frequency.',res:'Solfeggio SI · Ancient scale',ideal:'Abundance · Intention · Spiritual awakening'},he:{name:'אחדות',sub:'שפע · התעוררות',desc:'סולפג׳יו SI — צ׳אקרת הכתר. ידוע כתדר ההתעוררות הרוחנית.',res:'סולפג׳יו SI · צ׳אקרת הכתר',ideal:'שפע · כוונה · התעוררות'}},
  {id:'hz888', num:'B12',cat:'solfeggio',mode:'abundance',type:'solfeggio',hz:888,cL:888, cR:888, beat:null,wave:'Pure', morph:.027,noHp:true,en:{name:'Abundance',sub:'Financial · Attraction',desc:'888 — number of infinite abundance in Eastern numerology.',res:'888 Hz · Eastern numerological tradition',ideal:'Financial abundance · Success · Attraction'},he:{name:'שפע',sub:'כלכלה · משיכה',desc:'888 — מספר השפע האינסופי בנומרולוגיה מזרחית.',res:'נומרולוגיה מזרחית',ideal:'שפע כלכלי · הצלחה · משיכה'}},
  {id:'hz639', num:'B8',cat:'solfeggio',mode:'healing',type:'solfeggio',  hz:639, cL:639, cR:639, beat:null,wave:'Pure', morph:.03, noHp:true,en:{name:'Connection',sub:'Relationships · Heart',desc:'Solfeggio FA — heart chakra frequency. Strengthens relationships and empathy.',res:'Solfeggio FA · Ancient scale',ideal:'Relationships · Empathy · Communication'},he:{name:'חיבור',sub:'מערכות יחסים · לב',desc:'סולפג׳יו FA — תדר צ׳אקרת הלב. מחזק מערכות יחסים ואמפתיה.',res:'סולפג׳יו FA · צ׳אקרת לב',ideal:'מערכות יחסים · אמפתיה · תקשורת'}},
  {id:'hz741', num:'B9',cat:'solfeggio',mode:'focus',  type:'solfeggio',  hz:741, cL:741, cR:741, beat:null,wave:'Pure', morph:.032,noHp:true,en:{name:'Expression',sub:'Creativity · Truth',desc:'Solfeggio SOL — throat chakra. Helps authentic self-expression and creativity.',res:'Solfeggio SOL · Ancient scale',ideal:'Creativity · Writing · Self-expression'},he:{name:'ביטוי',sub:'יצירה · אמת',desc:'סולפג׳יו SOL — צ׳אקרת הגרון. מסייע בביטוי עצמי אמיתי.',res:'סולפג׳יו SOL · צ׳אקרת גרון',ideal:'יצירה · כתיבה · ביטוי עצמי'}},
  {id:'hz852', num:'B10',cat:'solfeggio',mode:'focus', type:'solfeggio',  hz:852, cL:852, cR:852, beat:null,wave:'Pure', morph:.035,noHp:true,en:{name:'Intuition',sub:'Insight · Flow',desc:'Solfeggio LA — third eye chakra. Enhances intuition and heightened awareness.',res:'Solfeggio LA · Ancient scale',ideal:'Intuition · Insight · Flow state'},he:{name:'אינטואיציה',sub:'תובנה · זרימה',desc:'סולפג׳יו LA — עין שלישית. מחזק אינטואיציה ומודעות מוגברת.',res:'סולפג׳יו LA · עין שלישית',ideal:'אינטואיציה · תובנה · זרימה'}},
  {id:'hz174', num:'B1',cat:'solfeggio',mode:'healing',type:'solfeggio',  hz:174, cL:174, cR:174, beat:null,wave:'Pure', morph:.012,noHp:true,en:{name:'Release',sub:'Pain · Fear · Foundation',desc:'Lowest Solfeggio. Acts as a natural anesthetic — helps release physical pain and deep fear.',res:'Ancient Solfeggio Scale · Sound Healing',ideal:'Chronic pain · Deep anxiety · Emotional release'},he:{name:'שחרור',sub:'כאב · פחד · בסיס',desc:'התדר הנמוך ביותר בסולפג׳יו. פועל כמרדים טבעי ומסייע בשחרור כאב.',res:'סולם הסולפג׳יו העתיק',ideal:'כאב כרוני · חרדה עמוקה · שחרור'}},
  {id:'hz285', num:'B2',cat:'solfeggio',mode:'healing',type:'solfeggio',  hz:285, cL:285, cR:285, beat:null,wave:'Pure', morph:.015,noHp:true,en:{name:'Cellular Heal',sub:'Cellular Healing',desc:'Assists in tissue and cellular healing. Strengthens the mind-body connection.',res:'Solfeggio Frequencies · Alternative Medicine',ideal:'Physical healing · Inner connection · Recovery'},he:{name:'ריפוי תאי',sub:'ריפוי תאי',desc:'מסייע בריפוי רקמות ותאים. מחזק את החיבור בין נפש לגוף.',res:'תדרי סולפג׳יו',ideal:'ריפוי גוף · חיבור פנימי'}},
  {id:'hz417', num:'B4',cat:'solfeggio',mode:'abundance',type:'solfeggio',hz:417, cL:417, cR:417, beat:null,wave:'Pure', morph:.02, noHp:true,en:{name:'Change',sub:'Openness · New Reality',desc:'Solfeggio RE. Facilitates acceptance of change and opens doors to new possibilities.',res:'Solfeggio RE · Sound Healing',ideal:'Life transitions · Openness · Embracing change'},he:{name:'שינוי',sub:'פתיחות · מציאות חדשה',desc:'סולפג׳יו RE. מקל על קבלת שינוי ופתיחת דלתות לאפשרויות חדשות.',res:'סולפג׳יו RE',ideal:'מעברים בחיים · פתיחות'}},
  {id:'echo111',num:'C1',cat:'echo11', mode:'healing', type:'binaural',  hz:111, cL:111, cR:122, beat:11,  wave:'Alpha',morph:.022,en:{name:'The Echo',sub:'echo.11 · Home Frequency',desc:'1+1+1=3 · Tesla · Gate 11. The unique frequency of echo.11 — born from the personal journey of healing and creation.',res:'echo.11 original · Tesla 3-6-9 code',ideal:'Home frequency · Self-connection · echo.11 ritual'},he:{name:'ההד',sub:'echo.11 · תדר הבית',desc:'1+1+1=3 · טסלה · שער 11. התדר הייחודי של echo.11 — נולד מהמסע האישי.',res:'תדר מקורי echo.11',ideal:'תדר הבית · חיבור לעצמך'}},
  {id:'echoDual',num:'C2',cat:'echo11',mode:'focus',   type:'binaural',  hz:528, cL:528, cR:568, beat:40,  wave:'Gamma',morph:.04, en:{name:'Gamma + Love',sub:'Healing + Focus',desc:'528 Hz love frequency + 40 Hz Gamma beat — unique echo.11 blend. Healing and clarity together.',res:'echo.11 blend · MIT Gamma + Solfeggio',ideal:'Healing + Focus · Creative work · Flow state'},he:{name:'גמא + אהבה',sub:'ריפוי + ריכוז',desc:'528 Hz תדר האהבה + 40 Hz גמא beat — שילוב ייחודי echo.11.',res:'שילוב echo.11',ideal:'ריפוי + ריכוז · יצירה · זרימה'}},
  {id:'echoFog', num:'C3',cat:'echo11',mode:'focus',   type:'binaural',  hz:40,  cL:200, cR:214, beat:14,  wave:'Beta', morph:.045,en:{name:'Brain Fog Clear',sub:'Mental Clarity',desc:'Carrier 200 Hz + beat 14 Hz Beta — clears brain fog and restores mental clarity.',res:'echo.11 formula · Beta entrainment',ideal:'Brain fog · Morning clarity · Mental reset'},he:{name:'ניקוי ערפל',sub:'בהירות מנטלית',desc:'carrier 200 Hz + beat 14 Hz Beta — מנקה ערפל מוחי ומחזיר בהירות.',res:'נוסחת echo.11',ideal:'ערפל מוחי · בהירות בוקר'}},
  {id:'echoMiso',num:'C4',cat:'echo11',mode:'healing', type:'binaural',  hz:6,   cL:180, cR:186, beat:6,   wave:'Theta',morph:.012,en:{name:'Misophonia',sub:'Sound Sensitivity Relief',desc:'Theta 6 Hz calms the auditory nervous system. Created for those with extreme sound sensitivity.',res:'echo.11 original · Theta therapy',ideal:'Misophonia · Sound sensitivity · Nervous system calm'},he:{name:'מיסופוניה',sub:'רגישות קולית · הרגעה',desc:'Theta 6 Hz מרגיע את מערכת העצבים השמיעתית.',res:'מקורי echo.11 · טיפול בגלי תטא',ideal:'מיסופוניה · רגישות קולית'}},
]

const BRAIN=[
  {t:0,  en:"Press play. Your nervous system will respond within <em>90 seconds</em>.",he:"לחצי Play. מערכת העצבים תתחיל להגיב תוך <em>90 שניות</em>."},
  {t:5,  en:"Your auditory cortex is <em>processing the frequency</em>.",he:"קליפת השמע שלך <em>מעבדת את התדר</em>."},
  {t:30, en:"The brainstem is beginning to <em>entrain</em> to the rhythm.",he:"גזע המוח מתחיל <em>להסתנכרן</em> עם הקצב."},
  {t:60, en:"Delta wave activity <em>increasing</em>. Cortisol beginning to decrease.",he:"פעילות גלי דלתא <em>עולה</em>. קורטיזול מתחיל לרדת."},
  {t:90, en:"Parasympathetic system <em>activating</em>. Heart rate naturally slowing.",he:"מערכת הפאראסימפתטית <em>מופעלת</em>. קצב הלב מאט."},
  {t:180,en:"Deep entrainment. Your brain generating <em>Delta waves (0.5–4 Hz)</em>.",he:"שלב סנכרון עמוק. המוח שלך מייצר <em>גלי דלתא (0.5–4 Hz)</em>."},
  {t:300,en:"Optimal depth. <em>Natural recovery processes</em> are now active.",he:"עומק מיטבי. <em>תהליכי ריפוי טבעיים</em> פעילים."},
]

let lang='en',dark=true,playing=false
let curIdx=FREQS.findIndex(f=>f.id==='hz432')
let volume=40,elapsed=0,activeTab=0,selTimerSec=1200
let elapsedIv=null,audioCtx=null,audioNodes={}
let playerAnimId=null,playerT=0

// ══ localStorage ENGINE ══════════════════════════════════════
const STORE_KEY='echo11_sessions'

function getTodayKey(){
  const d=new Date(); return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`
}

function loadSessions(){
  try{ return JSON.parse(localStorage.getItem(STORE_KEY)||'{}') }catch(e){ return {} }
}

function saveSession(freqId, seconds){
  if(seconds<60) return // min 60s — 1 minute
  const sessions=loadSessions()
  const key=getTodayKey()
  if(!sessions[key]) sessions[key]={total:0,freqs:{}}
  sessions[key].total+=seconds
  sessions[key].freqs[freqId]=(sessions[key].freqs[freqId]||0)+seconds
  // keep only last 30 days
  const keys=Object.keys(sessions).sort()
  while(keys.length>30){ delete sessions[keys.shift()] }
  try{ localStorage.setItem(STORE_KEY,JSON.stringify(sessions)) }catch(e){}
  renderStreak()
}

function calcStreak(sessions){
  // Count consecutive days with >= 60s listened (1 minute minimum)
  // Start from today; if today not yet listened, start from yesterday
  let streak=0, d=new Date()
  const todayKey=`${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`
  // If today has no session yet, start checking from yesterday
  if(!sessions[todayKey]||sessions[todayKey].total<60){
    d.setDate(d.getDate()-1)
  }
  while(true){
    const key=`${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`
    if(sessions[key]&&sessions[key].total>=60){ streak++; d.setDate(d.getDate()-1) }
    else break
  }
  return streak
}

function getMostPlayed(sessions){
  const counts={}
  Object.values(sessions).forEach(day=>{
    Object.entries(day.freqs||{}).forEach(([id,s])=>{ counts[id]=(counts[id]||0)+s })
  })
  const top=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]
  if(!top) return null
  return FREQS.find(f=>f.id===top[0])
}

function get7Days(){
  const sessions=loadSessions()
  const days=[]
  const EN_DAYS=['M','T','W','T','F','S','S']
  const HE_DAYS=['ב','ג','ד','ה','ו','ש','א']
  for(let i=6;i>=0;i--){
    const d=new Date(); d.setDate(d.getDate()-i)
    const key=`${d.getFullYear()}-${(d.getMonth()+1)}-${d.getDate()}`
    // getDay(): 0=Sun,1=Mon...6=Sat → map to M=0..S=6
    const dayIdx=d.getDay()===0?6:d.getDay()-1
    const label=lang==='he'?HE_DAYS[dayIdx]:EN_DAYS[dayIdx]
    days.push({ key, label, secs:(sessions[key]?.total||0), isToday:i===0 })
  }
  return days
}

// ── Daily Frequency Schedule ─────────────────────────────────
// Each day of week maps to a curated frequency
const DAILY_SCHEDULE=[
  {dow:0, id:'hz432', en:'sunday · rest & release',   he:'ראשון · מנוחה ושחרור'},
  {dow:1, id:'gamma', en:'monday · focus & clarity',  he:'שני · ריכוז ובהירות'},
  {dow:2, id:'hz528', en:'tuesday · heal & restore',  he:'שלישי · ריפוי והתחדשות'},
  {dow:3, id:'alpha', en:'wednesday · create & flow', he:'רביעי · יצירה וזרימה'},
  {dow:4, id:'hz741', en:'thursday · express & truth',he:'חמישי · ביטוי ואמת'},
  {dow:5, id:'hz639', en:'friday · connect & open',   he:'שישי · חיבור ופתיחות'},
  {dow:6, id:'hz963', en:'saturday · align & receive',he:'שבת · יישור וקבלה'},
]

function getTodaySchedule(){
  const dow=new Date().getDay()
  return DAILY_SCHEDULE.find(d=>d.dow===dow)||DAILY_SCHEDULE[0]
}

function applyDailyFrequency(){
  const sched=getTodaySchedule()
  const f=FREQS.find(x=>x.id===sched.id)||FREQS[5]
  const t=f[lang]||f.en
  const isHe=lang==='he'
  // Update today label to show day name
  const lbl=document.getElementById('today-lbl')
  if(lbl) lbl.textContent=isHe?sched.he:sched.en
  // Update Hz number
  const hzEl=document.getElementById('hero-hz-num')
  if(hzEl) hzEl.textContent=f.hz
  // Update freq name
  const nameEl=document.getElementById('today-name')
  if(nameEl) nameEl.textContent=(t.sub||t.name)
  // Update listen button target
  const ctaEl=document.getElementById('today-cta')
  if(ctaEl){ ctaEl.setAttribute('data-freq',f.id); ctaEl.onclick=()=>openPlayer(f.id) }
  // Update play button text
  const playBtn=document.getElementById('today-cta')
  // 🎧 Binaural badge — shows inline next to Hz for binaural freqs
  const hpBadge=document.getElementById('home-hp-badge')
  if(hpBadge) hpBadge.style.display=f&&f.type==='binaural'?'inline':'none'
  // Update hero CTA text
  const heroCta=document.getElementById('hero-cta-btn')
  if(heroCta) heroCta.textContent=(isHe?"► השמע את תדר היום":"► play today's frequency")
}

// Intentions per mode — emotional hook before technical number
const INTENTIONS={
  sleep:   {en:"close your eyes. let go.",         he:"עצמי עיניים. שחרי."},
  healing: {en:"breathe. your body knows.",         he:"נשמי. גופך יודע."},
  focus:   {en:"clear the noise. find your centre.", he:"נקי את הרעש. מצאי מרכז."},
  abundance:{en:"open. receive. align.",             he:"פתחי. קבלי. יישרי."},
  science: {en:"your brain is ready.",              he:"המוח שלך מוכן."},
  solfeggio:{en:"ancient sound. modern clarity.",   he:"צליל עתיק. בהירות מודרנית."},
  echo11:  {en:"you are the signal.",               he:"את הסיגנל."},
}

function getIntention(freqId){
  const f=FREQS.find(x=>x.id===freqId)
  if(!f) return ''
  const key=f.mode||f.cat
  const obj=INTENTIONS[key]||INTENTIONS.solfeggio
  return obj[lang]||obj.en
}

function renderStreak(){
  const sessions=loadSessions()
  const streak=calcStreak(sessions)
  // Fire streak milestone events once per milestone reached, persisted in localStorage
  try{
    const milestones = [3, 7, 14, 30, 60, 90]
    const raw = localStorage.getItem('echo11_streak_milestones_fired')
    const fired = raw ? JSON.parse(raw) : []
    milestones.forEach(m => {
      if(streak >= m && !fired.includes(m)){
        fired.push(m)
        track('streak_milestone', { event_category:'engagement', value:m, event_label:`day_${m}` })
      }
    })
    localStorage.setItem('echo11_streak_milestones_fired', JSON.stringify(fired))
  }catch(e){}
  const days=get7Days()
  const maxSecs=Math.max(...days.map(d=>d.secs),1)
  const top=getMostPlayed(sessions)
  const isNew=streak===0 && !top

  // ── Empty state for first-time users ──
  const card=document.getElementById('streak-card-btn')
  const skNum=document.getElementById('sk-num')
  const skRight=document.getElementById('streak-right')
  const progLbl=document.getElementById('prog-lbl')

  if(isNew){
    // Day 1 — show the GOAL (7-day circle) as curiosity hook, not progress
    if(progLbl) progLbl.style.display='none' // hide "YOUR PROGRESS" label
    if(card){
      try{
        card.style.background='none'
        card.style.border='none'
        card.style.boxShadow='none'
        card.style.padding='8px 0 20px'
        card.style.cursor='default'
        card.onclick=null
      }catch(e){}
    }
    if(skNum) skNum.style.display='none'
    if(skRight){
      // Show 7 dots — all empty — as visual curiosity hook
      const isHe=lang==='he'
      skRight.innerHTML=`<div style="display:flex;gap:5px;align-items:center;padding:4px 0">
        ${[...Array(7)].map((_,i)=>`<div style="width:8px;height:8px;border-radius:50%;background:${i===0?'var(--t1)':'var(--b1)'}"></div>`).join('')}
      </div>`
    }
    const lblEl=document.getElementById('sk-lbl')
    const subEl=document.getElementById('sk-sub')
    const ctaEl=document.getElementById('streak-cta-lbl')
    const isHeN=lang==='he'
    if(lblEl) lblEl.textContent=isHeN?'7 ימים יוצרים עיגול':'7 sessions. one complete circle.'
    if(subEl) subEl.textContent=isHeN?'האזיני דקה אחת ● ● ● ● ● ● ●':'listen once a day to reveal your shape'
    if(ctaEl){ ctaEl.style.display=''; ctaEl.textContent=isHeN?'מה זאת הצורה השבועית?':'what is the weekly shape? →'; ctaEl.style.cursor='pointer'; ctaEl.onclick=()=>show('history') }
  } else {
    // Returning user — show streak
    if(progLbl) progLbl.style.display=''
    if(card){
      card.style.background=''
      card.style.border=''
      card.style.padding=''
      card.style.cursor='pointer'
      card.onclick=()=>show('history')
    }
    if(skNum){ skNum.style.display=''; skNum.textContent=streak }
    document.getElementById('sk-lbl').textContent=lang==='he'?'ימים רצופים':'day streak'
    const subEl=document.getElementById('sk-sub')
    if(top){
      const name=top[lang]?.name||top.en.name
      subEl.textContent=(lang==='he'?'הכי מאוזן: ':'Most played: ')+name+' · '+top.hz+' Hz'
    } else {
      subEl.textContent=lang==='he'?'התחילי להאזין היום':'Start listening today'
    }
    // Rebuild bars
    const barsEl=document.getElementById('sk-bars-wrap')
    const daysEl=document.getElementById('sk-days-wrap')
    if(barsEl && daysEl){
      barsEl.innerHTML=''; daysEl.innerHTML=''
      days.forEach(day=>{
        const pct=day.secs>0?Math.max(12,Math.round((day.secs/maxSecs)*100)):5
        const bar=document.createElement('div')
        bar.className='sk-bar'+(day.secs>0?' h':'')+(day.isToday?' t':'')
        bar.style.height=pct+'%'
        if(day.isToday) bar.id='today-bar'
        bar.title=day.secs>0?`${Math.round(day.secs/60)} min`:''
        barsEl.appendChild(bar)
        const dl=document.createElement('div')
        dl.className='sk-d'+(day.isToday?' t':'')
        dl.textContent=day.label
        daysEl.appendChild(dl)
      })
    }
  }

  // ── Mini shape on home page ──
  const homeCv=document.getElementById('home-shape-cv')
  if(homeCv){
    const hCtx=homeCv.getContext('2d')
    drawWeeklyShape(hCtx,Math.min(streak,7),60)
  }
  // ── Apply daily frequency ──
  applyDailyFrequency()
  // ── Update 7-dot progress inline ──
  const miniDots=document.getElementById('home-mini-dots')
  const dayLbl=document.getElementById('home-day-lbl')
  if(miniDots){
    const dots=miniDots.querySelectorAll('div')
    dots.forEach((d,i)=>{ d.style.background=i<Math.min(streak,7)?'var(--t1)':'var(--b1)' })
  }
  if(dayLbl) dayLbl.textContent=lang==='he'?`יום ${Math.min(streak+1,7)} מתוך 7`:`day ${Math.min(streak+1,7)} of 7`
  // ── Update intention text ──
  const intentEl=document.getElementById('today-intention')
  if(intentEl){
    const todayFreqId=document.getElementById('today-cta')?.getAttribute('data-freq')||'hz432'
    intentEl.textContent=getIntention(todayFreqId)
  }
}

function getCtx(){
  if(!audioCtx||audioCtx.state==='closed')
    audioCtx=new(window.AudioContext||window.webkitAudioContext)()
  return audioCtx
}
// ── Screen Wake Lock — keeps screen on during playback ──────
let wakeLockRef=null
async function requestWakeLock(){
  try{
    if('wakeLock' in navigator){
      wakeLockRef=await navigator.wakeLock.request('screen')
      wakeLockRef.addEventListener('release',()=>{ wakeLockRef=null })
    }
  }catch(e){ /* wake lock not supported or denied */ }
}
function releaseWakeLock(){
  if(wakeLockRef){ wakeLockRef.release().catch(()=>{}); wakeLockRef=null }
}

// Re-acquire wake lock when page becomes visible again
document.addEventListener('visibilitychange',async()=>{
  if(document.visibilityState==='visible'){
    // Resume audio context (iOS Safari suspends it on background)
    if(audioCtx&&audioCtx.state==='suspended'){
      try{ await audioCtx.resume() }catch(e){}
    }
    // Re-acquire wake lock if playing
    if(playing && !wakeLockRef) await requestWakeLock()
  }
})

async function audioPlay(f){
  audioStopId(f.id)
  const ctx=getCtx()
  // iOS Safari: MUST resume inside user gesture synchronously
  if(ctx.state==='suspended') await ctx.resume()
  const gain=ctx.createGain()
  gain.gain.setValueAtTime(0,ctx.currentTime)
  gain.gain.linearRampToValueAtTime(.35,ctx.currentTime+0.3)
  gain.connect(ctx.destination)
  if(f.type==='binaural'){
    const merger=ctx.createChannelMerger(2); merger.connect(gain)
    const oL=ctx.createOscillator()
    oL.type='sine'; oL.frequency.value=f.cL; oL.start()
    const oR=ctx.createOscillator()
    oR.type='sine'; oR.frequency.value=f.cR; oR.start()
    // Panning with fallback for older iOS
    if(ctx.createStereoPanner){
      const pL=ctx.createStereoPanner(); pL.pan.value=-1
      const pR=ctx.createStereoPanner(); pR.pan.value=1
      oL.connect(pL); pL.connect(merger,0,0)
      oR.connect(pR); pR.connect(merger,0,1)
    } else {
      oL.connect(merger,0,0); oR.connect(merger,0,1)
    }
    audioNodes[f.id]={oL,oR,gain}
  } else {
    const o=ctx.createOscillator(); o.type='sine'
    o.frequency.value=f.cL; o.connect(gain); o.start()
    audioNodes[f.id]={o,gain}
  }
  // MediaSession API — shows on iOS Lock Screen + Control Center
  if('mediaSession' in navigator){
    const t=f[lang]||f.en
    navigator.mediaSession.metadata=new MediaMetadata({
      title: t.name,
      artist: `echo.11 · ${f.hz} Hz`,
      album: 'echo.11 frequencies'
    })
    navigator.mediaSession.setActionHandler('play', ()=>{ if(!playing) togglePlay() })
    navigator.mediaSession.setActionHandler('pause', ()=>{ if(playing) doStop() })
    navigator.mediaSession.playbackState='playing'
  }
}
function audioStopId(id){
  const n=audioNodes[id]; if(!n) return
  try{ n.gain.gain.setValueAtTime(n.gain.gain.value,getCtx().currentTime); n.gain.gain.linearRampToValueAtTime(0,getCtx().currentTime+1.3) }catch(e){}
  setTimeout(()=>{ try{n.o?.stop();n.oL?.stop();n.oR?.stop();n.gain.disconnect()}catch(e){}; delete audioNodes[id] },1400)
}
function audioVol(id,v){ const n=audioNodes[id]; if(!n) return; try{getCtx(); n.gain.gain.setTargetAtTime((v/100)*.5,getCtx().currentTime,.1)}catch(e){} }

// ── Onboarding ───────────────────────────────────────────────
const OB_STEPS=[
  {icon:'◎',title:'a frequency for every day.',body:'each morning, echo.11 selects a healing frequency matched to the energy of the day. your nervous system will thank you.'},
  {icon:'△',title:'your journey takes shape.',body:'listen for at least 1 minute each day. your shape grows — a point becomes a line becomes a circle. seven days completes the cycle.'},
  {icon:'♡',title:'use headphones for binaural.',body:'solfeggio tones work on any speaker. binaural beats (marked 🎧) need headphones — they use stereo separation to work.'},
]
let obStep=0

function showOnboarding(){
  if(sessionStorage.getItem('echo11_ob_session')) return
  const el=document.getElementById('onboarding')
  if(el){ el.style.display='flex'; renderOb() }
}
function renderOb(){
  const s=OB_STEPS[obStep]
  document.getElementById('ob-icon').textContent=s.icon
  document.getElementById('ob-title').textContent=s.title
  document.getElementById('ob-body').textContent=s.body
  document.getElementById('ob-btn').textContent=obStep<OB_STEPS.length-1?'next →':'begin listening →'
  const dots=document.getElementById('ob-dots')
  if(dots) dots.innerHTML=OB_STEPS.map((_,i)=>
    `<div style="width:${i===obStep?18:6}px;height:6px;border-radius:3px;background:${i===obStep?'var(--t1)':'var(--b2)'};transition:all .3s"></div>`
  ).join('')
}
function obNext(){
  if(obStep<OB_STEPS.length-1){ obStep++; renderOb() }
  else obSkip()
}
function obSkip(){
  sessionStorage.setItem('echo11_ob_session','1')
  const el=document.getElementById('onboarding')
  if(el){ el.style.opacity='0'; el.style.transition='opacity .3s'; setTimeout(()=>el.style.display='none',300) }
}

async function openTodayFreq(){
  // Get the freq assigned to today and open it directly
  const btn=document.getElementById('today-cta')
  const fid=btn?.getAttribute('data-freq')||'hz432'
  openPlayer(fid)
}
function openPlayerDirect(fid){
  // For users without headphones — go straight to solfeggio freq
  const el=document.getElementById('splash')
  if(el) el.style.display='none'
  const idx=FREQS.findIndex(f=>f.id===fid)
  if(idx>=0){ curIdx=idx; renderPlayer() }
  show('player')
  setTimeout(showOnboarding, 1000)
}
async function enterApp(){
  // Show protocol on first visit, otherwise go straight in
  // Always show protocol on every visit
  showProtocol();
  return;
  // Pre-init AudioContext on splash tap (iOS requires user gesture)
  try{
    if(!audioCtx||audioCtx.state==='closed')
      audioCtx=new(window.AudioContext||window.webkitAudioContext)()
    if(audioCtx.state==='suspended') await audioCtx.resume()
  }catch(e){}
  track('app_enter', { event_category:'funnel', source:'splash' })
  // Live counter: increment on enter, show if >= 2
  try{
    let n=parseInt(sessionStorage.getItem('echo11_live')||'0')
    const stored=parseInt(localStorage.getItem('echo11_active')||'0')
    const now=Date.now()
    const active=parseInt(localStorage.getItem('echo11_active_ts')||'0')
    // Count active in last 5 min
    const liveN = (now-active < 300000) ? Math.max(stored,1)+1 : 1
    localStorage.setItem('echo11_active', liveN)
    localStorage.setItem('echo11_active_ts', now)
    const badge=document.getElementById('live-badge')
    const cnt=document.getElementById('live-count')
    const lbl=document.getElementById('live-lbl')
    if(badge&&cnt&&liveN>=2){
      cnt.textContent=liveN
      if(lbl) lbl.textContent=lang==='he'?'מאזינים עכשיו':'listening now'
      badge.style.display='flex'
    }
  }catch(e){}
  try{ const c=new(window.AudioContext||window.webkitAudioContext)(); await c.resume(); c.close() }catch(e){}
  document.getElementById('splash').style.display='none'
  try{ renderStreak() }catch(e){ console.warn('renderStreak:',e) }
  showHome()
  setTimeout(showOnboarding, 800)
}
// ═══════════════════════════════════
// PROFILE SYSTEM — Local Profile (rmA)
// ═══════════════════════════════════
const PROFILE_KEY = 'echo11_profile'
const AVATAR_GRADIENTS = [
  {id:'violet', g:'linear-gradient(135deg,#a78bfa 0%,#7c6ee0 100%)'},
  {id:'rose',   g:'linear-gradient(135deg,#f9a8d4 0%,#ec4899 100%)'},
  {id:'sky',    g:'linear-gradient(135deg,#7dd3fc 0%,#3b82f6 100%)'},
  {id:'emerald',g:'linear-gradient(135deg,#86efac 0%,#10b981 100%)'},
  {id:'amber',  g:'linear-gradient(135deg,#fcd34d 0%,var(--echo-gold) 100%)'},
  {id:'slate',  g:'linear-gradient(135deg,#cbd5e1 0%,#475569 100%)'},
]
const AFFIRMATIONS = [
  {en:'"Your sensitivity is your superpower"',                he:'"הרגישות שלך היא הכוח העל שלך"'},
  {en:'"You are exactly where you need to be"',               he:'"את בדיוק במקום הנכון"'},
  {en:'"Your nervous system remembers safety"',               he:'"מערכת העצבים שלך זוכרת ביטחון"'},
  {en:'"Healing is not linear. Your pace is sacred"',         he:'"הריפוי אינו קווי. הקצב שלך קדוש"'},
  {en:'"You are allowed to take up space"',                   he:'"מותר לך לתפוס מקום"'},
  {en:'"Rest is also progress"',                              he:'"מנוחה היא גם התקדמות"'},
  {en:'"Your stillness is a form of strength"',               he:'"השקט שלך הוא צורה של עוצמה"'},
  {en:'"You came to your body. That is everything"',          he:'"חזרת לגוף שלך. זה הכל"'},
  {en:'"Coming back to yourself is the practice"',            he:'"החזרה אל עצמך היא התרגול"'},
  {en:'"You are softer than you think. And stronger"',        he:'"את רכה יותר ממה שאת חושבת. וחזקה יותר"'},
  {en:'"Slowing down is a kind of arrival"',                  he:'"להאט זו צורה של הגעה"'},
  {en:'"Your breath is always here"',                         he:'"הנשימה שלך תמיד כאן"'},
]

// Time-of-day greeting (5-11 morning, 12-17 day, 18-22 evening, else night)
function getTimeGreeting(isHe){
  const h = new Date().getHours()
  if(h >= 5 && h < 12)  return isHe ? 'בוקר טוב' : 'Good morning'
  if(h >= 12 && h < 18) return isHe ? 'צהריים טובים' : 'Good afternoon'
  if(h >= 18 && h < 23) return isHe ? 'ערב טוב' : 'Good evening'
  return isHe ? 'לילה רגוע' : 'Quiet night'
}

// Color per mode — used for avatar mood ring
const MODE_COLORS = {
  focus:     '#3b82f6',
  healing:   '#10b981',
  abundance: 'var(--echo-gold)',
  sleep:     '#7c6ee0',
}

// Find the mode of the most recently played frequency
function getLastFreqMode(){
  try{
    const sessions = loadSessions()
    const dates = Object.keys(sessions).sort((a,b)=>b.localeCompare(a))
    for(const date of dates){
      const freqIds = Object.keys(sessions[date].freqs||{})
      for(const fid of freqIds){
        const f = FREQS.find(x => x.id === fid)
        if(f) return f.mode
      }
    }
  }catch(e){}
  return null
}

// Count unique frequencies the user has explored (any session ≥ 1 min)
function countFreqsExplored(){
  try{
    const sessions = loadSessions()
    const ids = new Set()
    Object.keys(sessions).forEach(date => {
      Object.keys(sessions[date].freqs||{}).forEach(fid => ids.add(fid))
    })
    return ids.size
  }catch(e){ return 0 }
}

// Affirmation: respects manual override saved for today, else daily rotation
function getTodayAffirmationWithOverride(){
  try{
    const today = getTodayKey()
    const raw = localStorage.getItem('echo11_aff_override')
    if(raw){
      const o = JSON.parse(raw)
      if(o.date === today && typeof o.idx === 'number' && AFFIRMATIONS[o.idx]){
        return AFFIRMATIONS[o.idx]
      }
    }
  }catch(e){}
  return getTodayAffirmation()
}

function shuffleAffirmation(){
  try{
    const today = getTodayKey()
    const current = document.getElementById('prof-affirmation')?.textContent || ''
    // Pick a different one
    let idx = Math.floor(Math.random() * AFFIRMATIONS.length)
    for(let tries = 0; tries < 8; tries++){
      const a = AFFIRMATIONS[idx]
      if(a.en !== current && a.he !== current) break
      idx = (idx + 1) % AFFIRMATIONS.length
    }
    localStorage.setItem('echo11_aff_override', JSON.stringify({date:today, idx}))
    const affEl = document.getElementById('prof-affirmation')
    if(affEl){
      const isHe = lang === 'he'
      const a = AFFIRMATIONS[idx]
      affEl.style.opacity = '0'
      setTimeout(()=>{
        affEl.textContent = isHe ? a.he : a.en
        affEl.style.opacity = '1'
      }, 180)
    }
    track('affirmation_shuffle', { event_category:'engagement' })
  }catch(e){}
}

function loadProfile(){
  try{
    const p = JSON.parse(localStorage.getItem(PROFILE_KEY)||'null')
    return p || { name:'', avatarColor:'violet', createdAt:Date.now() }
  } catch(e){ return { name:'', avatarColor:'violet', createdAt:Date.now() } }
}

function saveProfileData(profile){
  try{ localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)) } catch(e){}
}

function getInitials(name){
  if(!name) return '✦'
  const parts = name.trim().split(/\s+/)
  if(parts.length === 1) return parts[0].slice(0,2).toUpperCase()
  return (parts[0][0] + parts[parts.length-1][0]).toUpperCase()
}

function getAvatarGradient(colorId){
  return AVATAR_GRADIENTS.find(g => g.id === colorId)?.g || AVATAR_GRADIENTS[0].g
}

function getTodayAffirmation(){
  // Pick based on day of year so it changes daily
  const day = Math.floor((Date.now() - new Date(new Date().getFullYear(),0,0)) / 86400000)
  return AFFIRMATIONS[day % AFFIRMATIONS.length]
}

function getMonthlyMomentsCount(){
  const sessions = loadSessions()
  const now = new Date()
  const ym = `${now.getFullYear()}-${now.getMonth()+1}`
  return Object.keys(sessions).filter(k => k.startsWith(ym) && (sessions[k].total||0) >= 60).length
}

function showProfile(){
  show('profile')
  renderProfile()
  // If first time, open edit modal
  const p = loadProfile()
  if(!p.name){
    setTimeout(editProfile, 400)
  }
}

function renderProfile(){
  const isHe = lang === 'he'
  const p = loadProfile()
  const sessions = loadSessions()

  // Stack-card preview labels — dynamic context per card
  try{
    const now = new Date()
    const thisMonthCount = sessions.filter(s => {
      const d = new Date(s.t || s.time || 0)
      return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear()
    }).length
    const mlPrev = document.getElementById('prof-moodlog-preview')
    if(mlPrev){
      mlPrev.textContent = thisMonthCount > 0
        ? (isHe ? `${thisMonthCount} הקשבות החודש` : `${thisMonthCount} sessions this month`)
        : (isHe ? 'עדיין לא הוקלטו הקשבות' : '— no sessions yet')
    }
    const shrPrev = document.getElementById('prof-share-preview')
    if(shrPrev) shrPrev.textContent = 'echo11.space'
    const supPrev = document.getElementById('prof-supp-preview')
    if(supPrev) supPrev.textContent = 'hello@echo11.space'
    const setPrev = document.getElementById('prof-set-preview')
    if(setPrev){
      const langStr = isHe ? 'עב' : 'EN'
      const themeStr = (document.body.classList.contains('dark')) ? (isHe?'כהה':'Dark') : (isHe?'בהיר':'Light')
      setPrev.textContent = `${langStr} · ${themeStr}`
    }
  }catch(e){}


  // Update mini avatar in nav — SVG icon for new users, initial for named
  const miniAvatar = document.getElementById('profile-avatar-mini')
  const profileBtn = document.getElementById('profile-btn')
  if(miniAvatar){
    if(p.name){
      miniAvatar.textContent = getInitials(p.name)
      if(profileBtn){
        profileBtn.style.background = getAvatarGradient(p.avatarColor)
        miniAvatar.style.color = '#fff'
      }
    } else {
      miniAvatar.innerHTML = '<svg class="echo-icon sm" style="display:block" aria-hidden="true"><use href="#i-user"/></svg>'
    }
  }

  // Avatar — minimal dark surface with gold inset ring (matches brand)
  // mood-ring tints removed: were purple by default, off-brand on pure-black bg
  const avatar = document.getElementById('profile-avatar')
  const moodDot = document.getElementById('profile-mood-dot')
  if(avatar){
    // Only apply user-picked color if they've explicitly chosen one; otherwise stay gold/dark
    if(p.avatarColor && p.name){
      avatar.style.background = getAvatarGradient(p.avatarColor)
    } else {
      avatar.style.background = 'linear-gradient(135deg, #1F1B16 0%, #0A0908 100%)'
    }
    avatar.textContent = p.name ? getInitials(p.name) : '✦'
    avatar.style.color = 'var(--echo-gold)'
    avatar.style.boxShadow = [
      'inset 0 0 0 .5px rgba(216,197,162,.50)',
      'inset 0 1px 0 rgba(255,255,255,.10)',
      '0 2px 8px rgba(0,0,0,.6)',
      '0 0 48px rgba(216,197,162,.22)'
    ].join(', ')
    if(moodDot) moodDot.style.display = 'none'
  }

  // Name greeting — time-of-day aware
  const nameEl = document.getElementById('prof-name')
  if(nameEl){
    const greet = getTimeGreeting(isHe)
    const who = p.name || (isHe ? 'נשמה יפה' : 'Beautiful Soul')
    nameEl.textContent = isHe ? `${greet}, ${who}` : `${greet}, ${who}`
  }

  // Sub label
  const subEl = document.getElementById('prof-sub')
  if(subEl) subEl.textContent = isHe ? 'המרחב השקט שלך כאן' : 'Your quiet space is here'

  // Affirmation
  const affLbl = document.getElementById('prof-aff-lbl')
  if(affLbl) affLbl.textContent = isHe ? 'הלחישה של היום' : "Today's whisper"
  const affEl = document.getElementById('prof-affirmation')
  if(affEl){
    const aff = getTodayAffirmationWithOverride()
    affEl.textContent = isHe ? aff.he : aff.en
    affEl.style.opacity = '1'
  }
  const affHint = document.getElementById('prof-aff-hint')
  if(affHint) affHint.textContent = isHe ? 'הקליקי לעוד אחת' : 'tap for another'

  // Monthly count
  const monthCount = getMonthlyMomentsCount()
  const monthCountEl = document.getElementById('prof-month-count')
  if(monthCountEl) monthCountEl.textContent = monthCount
  const monthLbl = document.getElementById('prof-month-lbl')
  if(monthLbl) monthLbl.textContent = isHe ? 'החודש' : 'This month'
  const monthUnit = document.getElementById('prof-month-unit')
  if(monthUnit) monthUnit.textContent = isHe ? 'רגעים שקטים' : 'quiet moments'

  // Frequencies explored progress
  const total = FREQS.length
  const explored = countFreqsExplored()
  const pct = total > 0 ? Math.min(100, Math.round((explored / total) * 100)) : 0
  const exploredCountEl = document.getElementById('prof-explored-count')
  if(exploredCountEl) exploredCountEl.textContent = explored
  const exploredTotalEl = document.getElementById('prof-explored-total')
  if(exploredTotalEl) exploredTotalEl.textContent = isHe ? `מתוך ${total}` : `of ${total}`
  const exploredLblEl = document.getElementById('prof-explored-lbl')
  if(exploredLblEl) exploredLblEl.textContent = isHe ? 'תדרים שגילית' : 'Frequencies explored'
  const exploredBarEl = document.getElementById('prof-explored-bar')
  if(exploredBarEl){
    // Defer to next frame so transition animates
    requestAnimationFrame(()=>{ exploredBarEl.style.width = pct + '%' })
  }

  // Healing tones — last 3 listened
  const tonesLbl = document.getElementById('prof-tones-lbl')
  if(tonesLbl) tonesLbl.textContent = isHe ? 'התדרים שלך' : 'Your Healing Tones'
  const tonesList = document.getElementById('prof-tones-list')
  if(tonesList){
    const recent = []
    Object.keys(sessions).sort((a,b)=>b.localeCompare(a)).forEach(date => {
      const day = sessions[date]
      Object.keys(day.freqs||{}).forEach(fid => {
        if(!recent.find(r => r.id === fid)){
          const f = FREQS.find(x => x.id === fid)
          if(f) recent.push({ id:fid, freq:f, date })
        }
      })
    })
    const top3 = recent.slice(0,3)
    if(top3.length === 0){
      tonesList.innerHTML = `<div style="text-align:center;padding:18px;background:var(--card);border:.5px dashed var(--b2);border-radius:12px;font-family:'Cormorant Garamond',Georgia,serif;font-size:13px;font-weight:200;font-style:italic;color:var(--t3)">${isHe?'התדרים שתאזיני להם יופיעו כאן':'frequencies you listen to will appear here'}</div>`
    } else {
      const colors = [
        {bg:'linear-gradient(90deg,rgba(16,185,129,.18),rgba(20,184,166,.08))', border:'rgba(16,185,129,.3)'},
        {bg:'linear-gradient(90deg,rgba(167,139,250,.18),rgba(124,110,224,.08))', border:'rgba(167,139,250,.3)'},
        {bg:'linear-gradient(90deg,rgba(201,180,152,.18),rgba(184,148,90,.08))', border:'rgba(201,180,152,.3)'},
      ]
      tonesList.innerHTML = top3.map((r,i) => {
        const t = r.freq[lang] || r.freq.en
        const c = colors[i] || colors[0]
        const today = getTodayKey()
        const yest = (()=>{ const d=new Date(); d.setDate(d.getDate()-1); return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}` })()
        const dateLabel = r.date === today ? (isHe?'היום':'Today')
                        : r.date === yest ? (isHe?'אתמול':'Yesterday')
                        : (()=>{const [y,m,d]=r.date.split('-');return isHe?`לפני ${Math.floor((Date.now()-new Date(y,m-1,d))/86400000)} ימים`:`${Math.floor((Date.now()-new Date(y,m-1,d))/86400000)} days ago`})()
        return `<button onclick="openPlayer('${r.id}')" style="
          width:100%;
          background:${c.bg};
          border:.5px solid ${c.border};
          border-radius:12px;
          padding:14px 18px;
          display:flex;align-items:center;justify-content:space-between;
          cursor:pointer;font-family:inherit;text-align:left;
          transition:transform .2s;
        " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
          <div>
            <div style="font-family:'DM Sans',sans-serif;font-size:11px;font-weight:600;color:var(--t1);letter-spacing:.16em;margin-bottom:4px;text-transform:uppercase">${(t.name||'').split(' ').slice(0,2).join(' ')}</div>
            <div style="font-family:'DM Sans',sans-serif;font-size:13px;font-weight:300;color:var(--t2)">${r.freq.hz}Hz</div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
            <span style="color:#fbbf24;font-size:13px">★</span>
            <span style="font-family:'DM Sans',sans-serif;font-size:10px;color:var(--t3)">${dateLabel}</span>
          </div>
        </button>`
      }).join('')
    }
  }

  // Translations for action cards
  const labels = {
    'prof-moodlog-title': {en:'Mood Log', he:'יומן מצבי רוח'},
    'prof-moodlog-sub':   {en:'Track your emotional journey', he:'עקבי אחר המסע הרגשי שלך'},
    'prof-share-title':   {en:'Share echo.11', he:'שתפי את echo.11'},
    'prof-share-sub':     {en:'Pass it on to a friend', he:'העבירי הלאה לחברה'},
    'prof-supp-title':    {en:'Support', he:'תמיכה'},
    'prof-supp-sub':      {en:"We're here to help", he:'אנחנו כאן בשבילך'},
    'prof-set-title':     {en:'Settings', he:'הגדרות'},
    'prof-set-sub':       {en:'Personalize your sanctuary', he:'התאם את המקדש שלך'},
    'prof-signout':       {en:'→ Sign Out Gently', he:'← התנתק בעדינות'},
    'prof-footer':        {en:'A space to return to. Always.', he:'מקום לחזור אליו. תמיד.'},
    'prof-edit-btn':      {en:'Edit', he:'ערוך'},
  }
  Object.keys(labels).forEach(id => {
    const el = document.getElementById(id)
    if(el) el.textContent = isHe ? labels[id].he : labels[id].en
  })

  // Tip Jar labels
  try{ translateTipJar() }catch(e){}
}

function editProfile(){
  const p = loadProfile()
  const isHe = lang === 'he'
  // Set current values
  const nameInput = document.getElementById('prof-input-name')
  if(nameInput) nameInput.value = p.name || ''

  // Build color picker
  const picker = document.getElementById('color-pickers')
  if(picker){
    picker.innerHTML = AVATAR_GRADIENTS.map(g => `
      <button onclick="selectAvatarColor('${g.id}')" data-cid="${g.id}" style="
        width:38px;height:38px;border-radius:50%;
        background:${g.g};
        border:${p.avatarColor === g.id ? '2.5px solid var(--t1)' : '.5px solid var(--b2)'};
        cursor:pointer;padding:0;
        transition:transform .15s;
        box-shadow:${p.avatarColor === g.id ? '0 4px 12px rgba(0,0,0,.2)' : 'none'};
      " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'"></button>
    `).join('')
  }

  // Modal labels
  document.getElementById('prof-modal-title').textContent  = isHe ? 'איך לקרוא לך?' : 'Tell us your name'
  document.getElementById('prof-modal-sub').textContent    = isHe ? 'איך נברך אותך' : "It's how we'll greet you"
  document.getElementById('prof-modal-name-lbl').textContent  = isHe ? 'שמך' : 'Your Name'
  document.getElementById('prof-modal-color-lbl').textContent = isHe ? 'צבע אווטאר' : 'Avatar Color'
  document.getElementById('prof-modal-cancel').textContent = isHe ? 'ביטול' : 'Cancel'
  document.getElementById('prof-modal-save').textContent   = isHe ? 'שמור' : 'Save'
  if(nameInput) nameInput.placeholder = isHe ? 'נשמה יפה' : 'Beautiful Soul'

  // Show modal
  const modal = document.getElementById('prof-modal')
  if(modal) modal.style.display = 'flex'
}

function selectAvatarColor(cid){
  const p = loadProfile()
  p.avatarColor = cid
  saveProfileData(p)
  // Re-render color picker
  document.querySelectorAll('#color-pickers button').forEach(b => {
    const isSel = b.getAttribute('data-cid') === cid
    b.style.border = isSel ? '2.5px solid var(--t1)' : '.5px solid var(--b2)'
    b.style.boxShadow = isSel ? '0 4px 12px rgba(0,0,0,.2)' : 'none'
  })
}

function saveProfile(){
  const nameInput = document.getElementById('prof-input-name')
  const p = loadProfile()
  p.name = (nameInput?.value || '').trim()
  saveProfileData(p)
  closeProfileModal()
  renderProfile()
}

function closeProfileModal(){
  const modal = document.getElementById('prof-modal')
  if(modal) modal.style.display = 'none'
}

function openSettings(){
  const isHe = lang === 'he'
  document.getElementById('settings-title').textContent     = isHe ? 'הגדרות' : 'Settings'
  document.getElementById('settings-lang-lbl').textContent  = isHe ? 'שפה' : 'Language'
  document.getElementById('settings-theme-lbl').textContent = isHe ? 'ערכת נושא' : 'Theme'
  document.getElementById('settings-reset').textContent     = isHe ? '↺ אפס את כל הנתונים' : '↺ Reset all data'
  document.getElementById('settings-close').textContent     = isHe ? 'סגור' : 'Close'
  document.getElementById('settings-modal').style.display = 'flex'
}

function closeSettingsModal(){
  document.getElementById('settings-modal').style.display = 'none'
}

function signOutGently(){
  const isHe = lang === 'he'
  if(confirm(isHe ? 'להתנתק בעדינות? המידע שלך יישמר.' : 'Sign out gently? Your data will be saved.')){
    // For local profile — just go back to splash (data stays in localStorage)
    show('home')
    setTimeout(()=>{
      const splash = document.getElementById('splash')
      if(splash) splash.style.display = 'flex'
    }, 100)
  }
}

// ─────────────────────────────────────────────────────────────
// Tip nudge toast (after 60s of real listening, once per browser)
function showTipNudgeToast(){
  const t=document.getElementById('tip-nudge-toast'); if(!t) return
  const msg=document.getElementById('tip-nudge-msg')
  const cta=document.getElementById('tip-nudge-cta')
  const isHe=lang==='he'
  if(msg) msg.textContent=isHe?'את מאזינה. אם זה הרגיע אותך —':"You're listening. If this brought you calm —"
  if(cta) cta.textContent=isHe?'תמכי ב-echo.11 →':'support echo.11 →'
  t.style.display='block'
  clearTimeout(window._tipNudgeTimer)
  window._tipNudgeTimer=setTimeout(hideTipNudgeToast, 12000)
}
function hideTipNudgeToast(){
  const t=document.getElementById('tip-nudge-toast'); if(t) t.style.display='none'
}

// Tip Jar — opens Ko-fi in a new tab
// ─────────────────────────────────────────────────────────────
const KOFI_URL = 'https://ko-fi.com/echo11'

function startTip(amount){
  const label = [5,7,14].includes(amount) ? `usd_${amount}_suggested` : 'kofi'
  track('tip_clicked', { event_category:'tip_jar', event_label:label, value:amount, currency:'USD' })
  window.open(KOFI_URL, '_blank', 'noopener,noreferrer')
}

// Tip Jar translations — applied when profile renders
function translateTipJar(){
  const isHe = lang === 'he'
  const map = {
    'prof-tip-lbl':      { en:'Support echo.11',                                   he:'תמיכה ב-echo.11' },
    'prof-tip-headline': { en:'If echo.11 brought you calm, you can return the gift.',  he:'אם echo.11 נגע בך, אפשר להגיד תודה.' },
    'prof-tip-sub':      { en:'echo.11 stays free for everyone — no subscription, no ads, no paywall. A tip is a one-time thank-you, like buying coffee for someone whose work moved you.',
                           he:'echo.11 נשאר חינמי לכולם — בלי מנוי, בלי פרסומות, בלי תשלום חובה. טיפ הוא תודה חד-פעמית, כמו לקנות כוס קפה למי שעבודתה ריגשה אותך.' },
    'prof-tip-social':   { en:'Be the first to support echo.11',                   he:'היו הראשונים לתמוך ב-echo.11' },
    'prof-tip-hint':     { en:"You'll choose the exact amount on Ko-fi",           he:'את הסכום המדויק תבחרו ב-Ko-fi' },
    'prof-tip-secure':   { en:'no account needed · one-time · powered by Ko-fi',   he:'בלי הרשמה · חד-פעמי · דרך Ko-fi' },
    'prof-tip-legal':    { en:'Tips support echo.11 as a personal project — not a commercial service or medical product.',
                           he:'תרומה תומכת ב-echo.11 כפרויקט אישי — לא שירות מסחרי או מוצר רפואי.' },
    'prof-gifts-lbl':    { en:'Gifts from echo.11',                                he:'מתנות מ-echo.11' },
    'prof-gifts-title':  { en:'Visions for your screen.',                          he:'חזיונות למסך שלך.' },
    'prof-gifts-sub':    { en:'Free. No login. No paywall. Take what speaks to you.', he:'חינם. בלי הרשמה. בלי חומה. קחו את מה שמדבר אליכם.' },
    'prof-gift1-meta':   { en:'free download',                                     he:'הורדה חינמית' },
    'prof-gift2-meta':   { en:'free download',                                     he:'הורדה חינמית' },
    'prof-gift3-meta':   { en:'free download',                                     he:'הורדה חינמית' },
    'prof-gifts-foot':   { en:'If one moved you — the tip jar is above. ↑',        he:'אם משהו הזיז משהו — צנצנת הטיפים למעלה. ↑' },
    /* Home CTA → Visions */
    'visions-cta-lbl':   { en:'Visions · Free',                                    he:'חזיונות · חינם' },
    'visions-cta-title': { en:'Postcards from inner deserts.',                     he:'גלויות מהמדבר הפנימי.' },
    'visions-cta-sub':   { en:'3 art prints · free for your screen or wall',       he:'3 הדפסי אמנות · חינם למסך או לקיר' },
    /* Visions page */
    'vis-back-lbl':      { en:'Back',                                              he:'חזרה' },
    'vis-eyebrow':       { en:'Visions from echo.11',                              he:'חזיונות מ-echo.11' },
    'vis-title':         { en:'Postcards from inner deserts.',                     he:'גלויות מהמדבר הפנימי.' },
    'vis-sub':           { en:'Free for your screen. Free for your wall. Take what speaks to you.', he:'חינמי למסך. חינמי לקיר. קחו את מה שמדבר אליכם.' },
    'vis-name-1':        { en:'Salt Plains',                                       he:'מישורי המלח' },
    'vis-name-2':        { en:'Inner Horizon',                                     he:'האופק הפנימי' },
    'vis-name-3':        { en:'First Light',                                       he:'אור ראשון' },
    'vis-dl-1':          { en:'Free download',                                     he:'הורדה חינמית' },
    'vis-dl-2':          { en:'Free download',                                     he:'הורדה חינמית' },
    'vis-dl-3':          { en:'Free download',                                     he:'הורדה חינמית' },
    'vis-tip-lbl':       { en:'Support echo.11',                                   he:'תמיכה ב-echo.11' },
    'vis-tip-headline':  { en:'If a vision moved you, you can return the gift.',   he:'אם חיזיון אחד הזיז משהו, אפשר להגיד תודה.' },
    'vis-tip-secure':    { en:'no account needed · one-time · powered by Ko-fi',   he:'בלי הרשמה · חד-פעמי · דרך Ko-fi' },
    'vis-tip-legal':     { en:'Tips support echo.11 as a personal project — not a commercial service or medical product.',
                           he:'תרומה תומכת ב-echo.11 כפרויקט אישי — לא שירות מסחרי או מוצר רפואי.' },
    'vis-footer':        { en:'A space to return to. Always.',                     he:'מרחב לחזור אליו. תמיד.' },
  }
  Object.keys(map).forEach(id => {
    const el = document.getElementById(id)
    if(el) el.textContent = isHe ? map[id].he : map[id].en
  })
  const subs = { 5: { en:'a coffee', he:'קפה' }, 7: { en:'a week', he:'שבוע' }, 14: { en:'a month', he:'חודש' } }
  document.querySelectorAll('[data-tip-sub]').forEach(el => {
    const amt = el.getAttribute('data-tip-sub')
    if(subs[amt]) el.textContent = isHe ? subs[amt].he : subs[amt].en
  })
  const badge = document.querySelector('[data-tip-badge]')
  if(badge) badge.textContent = isHe ? 'הכי נבחר' : 'most chosen'
}

// Share — Web Share API with clipboard fallback
async function shareEcho(){
  const isHe = lang === 'he'
  const url = 'https://echo11.space/'
  const title = 'echo.11'
  const text = isHe
    ? '22 תדרי ריפוי בהשראת מחקר ה-CIA Gateway. רגעי שקט במתנה.'
    : '22 healing frequencies inspired by the declassified CIA Gateway research. Free quiet moments.'
  try{
    if(navigator.share){
      await navigator.share({ title, text, url })
      track('share', { event_category:'engagement', method:'native' })
      return
    }
  }catch(e){ /* user cancelled or share failed — fall through */ }
  // Fallback: copy link
  try{
    await navigator.clipboard.writeText(url)
    const msg = isHe ? 'הקישור הועתק ✓' : 'Link copied ✓'
    if(typeof showHpToast === 'function'){ showHpToast(msg) } else { alert(msg) }
    track('share', { event_category:'engagement', method:'clipboard' })
  }catch(e){
    window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text+' '+url)}`
  }
}

// ═══════════════════════════════════
// END PROFILE SYSTEM
// ═══════════════════════════════════

function showHome(){
  show('home')
  renderStreak()
  try{ renderConsciousnessCard() }catch(e){ console.warn('cs:',e) }
  try{ renderBinauralStrip() }catch(e){ console.warn('bin:',e) }
  // Update profile mini avatar in nav
  try{ 
    const p = loadProfile()
    const miniAvatar = document.getElementById('profile-avatar-mini')
    const profileBtn = document.getElementById('profile-btn')
    if(miniAvatar){
      if(p.name){
        miniAvatar.textContent = getInitials(p.name)
        if(profileBtn){
          profileBtn.style.background = getAvatarGradient(p.avatarColor)
          miniAvatar.style.color = '#fff'
        }
      } else {
        miniAvatar.innerHTML = '<svg class="echo-icon sm" style="display:block" aria-hidden="true"><use href="#i-user"/></svg>'
      }
    }
  } catch(e){ console.warn('prof:',e) }
  // Reset scroll to top
  const homeEl = document.getElementById('home')
  if(homeEl) homeEl.scrollTop = 0
}

// Parallax + sticky nav on home scroll
;(function(){
  let rafId = null
  function onHomeScroll(){
    const home = document.getElementById('home')
    const heroBg = document.getElementById('hero-bg')
    const nav = document.getElementById('home-nav')
    if(!home || !heroBg || !nav) return
    const sy = home.scrollTop
    // Parallax: image moves at 40% of scroll speed (slower = deeper feel)
    heroBg.style.transform = `translateY(${sy * 0.4}px)`
    // Sticky nav: becomes opaque after 60px
    nav.classList.toggle('scrolled', sy > 60)
  }
  function initHomeScroll(){
    const home = document.getElementById('home')
    if(!home) return
    home.removeEventListener('scroll', onHomeScroll)
    home.addEventListener('scroll', onHomeScroll, {passive:true})
  }
  // Init when home becomes active
  const origShow = window.show
  if(origShow){
    window._showOrig = origShow
    window.show = function(id){
      origShow(id)
      if(id==='home') setTimeout(initHomeScroll, 80)
    }
  }
  // Also init on page load if home is visible
  document.addEventListener('DOMContentLoaded', ()=>{
    if(document.getElementById('home')?.classList.contains('on'))
      initHomeScroll()
  })
})();

// Init consciousness + binaural on every page load
document.addEventListener('DOMContentLoaded', ()=>{
  try{ renderConsciousnessCard() }catch(e){}
  try{ renderBinauralStrip() }catch(e){}
  // Funnel entry — fires once at the very top of the funnel
  try{
    const splash = document.getElementById('splash')
    const splashVisible = splash && getComputedStyle(splash).display !== 'none'
    track('splash_view', {
      event_category: 'funnel',
      referrer: document.referrer ? new URL(document.referrer).hostname : 'direct',
      lang: (document.documentElement.lang || lang || 'en'),
      shown: splashVisible ? 1 : 0,
    }, { once: true })
  }catch(e){}

  // ── Scroll-triggered reveal — fade-up cards as they enter viewport ──
  try{
    if(!('IntersectionObserver' in window)) return
    const selectors = [
      '#home .streak-card',
      '#home #consciousness-card',
      '#home #quick-relief-card',
      '#home #lib-link',
      '#home #binaural-strip',
      '#home .home-today-block',
      '#profile > *:not(:first-child)',
    ]
    const targets = document.querySelectorAll(selectors.join(','))
    targets.forEach(el => el.classList.add('echo-reveal'))
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if(e.isIntersecting){
          e.target.classList.add('is-visible')
          io.unobserve(e.target)
        }
      })
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' })
    targets.forEach(t => io.observe(t))
  }catch(e){}
})

// Handle return from legal.html — skip splash if #home in URL
if(window.location.hash==='#home'){
  document.getElementById('splash').style.display='none'
  renderStreak(); showHome()
  history.replaceState(null,'',window.location.pathname)
}
function openQuickRelief(){
  const isHe=lang==='he', idx=FREQS.findIndex(f=>f.id==='theta')
  if(idx<0) return
  if(playing) doStop(); curIdx=idx; renderPlayer(); show('player')
  setTimeout(()=>{
    selTimerSec=180; document.querySelectorAll('.pl-timer').forEach(t=>t.classList.remove('on'))
    const t3=document.getElementById('timer-3'); if(t3) t3.classList.add('on')
    const bsTxt=document.getElementById('bs-txt')
    if(bsTxt) bsTxt.innerHTML=isHe?'נשמי. תוך <em>90 שניות</em> הגוף יתחיל להרגע.':'breathe. within <em>90 seconds</em>, your body will settle.'
  },100)
}
function openMode(mode){
  const isHe=lang==='he'
  buildLibrary(); show('library')
  setTimeout(()=>{
    let count=0
    document.querySelectorAll('.lb-row').forEach(r=>{
      const fid=r.getAttribute('data-fid'), f=FREQS.find(x=>x.id===fid)
      const vis=f&&f.mode===mode; r.style.display=vis?'':'none'; if(vis) count++
    })
    document.querySelectorAll('.lb-grp').forEach(grp=>{
      let next=grp.nextElementSibling, vis=false
      while(next&&!next.classList.contains('lb-grp')){ if(next.classList.contains('lb-row')&&next.style.display!=='none') vis=true; next=next.nextElementSibling }
      grp.style.display=vis?'':'none'
    })
    const modeNames={sleep:{en:'Sleep',he:'שינה'},healing:{en:'Healing',he:'ריפוי'},focus:{en:'Focus',he:'ריכוז'},abundance:{en:'Abundance',he:'שפע'}}
    const mn=modeNames[mode]||{en:mode,he:mode}
    const titleEl=document.getElementById('lib-title'); if(titleEl) titleEl.textContent=(isHe?mn.he:mn.en)+' · '+count+' '+(isHe?'תדרים':'frequencies')
    const si=document.getElementById('lib-si'); if(si) si.value=''
  },60)
}
// ── Visions page navigation + carousel auto-rotation ──
let _visionsTimer = null
let _visionsPaused = false
function showVisions(){
  show('visions')
  try{ track('visions_view', { event_category:'navigation', event_label:'from_home' }) }catch(e){}
  // Apply current language to all visions strings
  try{ translateTipJar() }catch(e){}
  // Wait for screen transition, then set up carousel
  setTimeout(setupVisionsCarousel, 220)
}
function setupVisionsCarousel(){
  const rail = document.getElementById('visions-rail')
  if(!rail) return
  const cards = rail.querySelectorAll('.echo-vision-card')
  const dots  = document.querySelectorAll('.visions-dot')
  if(!cards.length) return
  let activeIdx = 0

  const updateActive = (i) => {
    activeIdx = Math.max(0, Math.min(i, cards.length - 1))
    dots.forEach((d, di) => d.classList.toggle('active', di === activeIdx))
  }
  const scrollToCard = (i, smooth=true) => {
    updateActive(i)
    const card = cards[activeIdx]
    if(!card) return
    rail.scrollTo({ left: card.offsetLeft, behavior: smooth ? 'smooth' : 'auto' })
  }
  // Reset to first card on entry
  scrollToCard(0, false)

  // Detect scroll position → which card is centered
  let scrollTimeout = null
  rail.onscroll = () => {
    clearTimeout(scrollTimeout)
    scrollTimeout = setTimeout(() => {
      const idx = Math.round(rail.scrollLeft / rail.clientWidth)
      if(idx !== activeIdx) updateActive(idx)
    }, 80)
  }

  // Pause auto-rotation on user touch
  const pauseAndResume = () => {
    _visionsPaused = true
    clearTimeout(_visionsTimer)
    _visionsTimer = setTimeout(() => { _visionsPaused = false; tickRotation() }, 4000)
  }
  rail.onpointerdown = pauseAndResume

  // Dot click navigation
  dots.forEach((d, i) => {
    d.onclick = () => { pauseAndResume(); scrollToCard(i) }
  })

  // Auto-rotation
  if(_visionsTimer) clearTimeout(_visionsTimer)
  const tickRotation = () => {
    clearTimeout(_visionsTimer)
    _visionsTimer = setTimeout(() => {
      if(!_visionsPaused && document.getElementById('visions')?.classList.contains('on')){
        scrollToCard((activeIdx + 1) % cards.length)
      }
      tickRotation()
    }, 5000)
  }
  _visionsPaused = false
  tickRotation()
}

function showLibrary(){
  buildLibrary()
  show('library')
  setTimeout(()=>{
    // Show all rows
    document.querySelectorAll('.lb-row').forEach(r=>r.style.display='')
    document.querySelectorAll('.lb-grp').forEach(g=>g.style.display='')
    // Restore group count badges
    document.querySelectorAll('.lb-gc').forEach(el=>el.style.display='')
    const si=document.getElementById('lib-si')
    if(si) si.value=''
    const titleEl=document.getElementById('lib-title')
    if(titleEl) titleEl.textContent=lang==='he'?'ספריה · 21 תדרים':'Library · 21 Frequencies'
    const subEl=document.getElementById('lib-sub')
    if(subEl) subEl.textContent=lang==='he'?'21 תדרים · 3 קטגוריות':'21 frequencies · 3 categories'
    const libBack=document.getElementById('lib-back')
    if(libBack) libBack.textContent=lang==='he'?'← חזרה':'← Back'
    // Reset mood pills to "All"
    activeMood='all'
    document.querySelectorAll('.mood-pill').forEach(p=>{
      const isAll=p.getAttribute('data-mood')==='all'
      p.style.background=isAll?'var(--echo-gold)':'var(--card)'
      p.style.color=isAll?'var(--echo-on-gold)':'var(--t2)'
      p.style.borderColor=isAll?'var(--echo-gold)':'var(--b2)'
      p.style.fontWeight=isAll?'500':'300'
      p.classList.toggle('on',isAll)
    })
  },50)
}

function openMode(mode){
  const isHe=lang==='he'
  const modeInfo={
    sleep:    {en:'Sleep',    he:'שינה',    descEn:'calm your nervous system. prepare for deep rest.',       descHe:'הרגעת מערכת העצבים. הכנה לשינה עמוקה.'},
    healing:  {en:'Healing',  he:'ריפוי',   descEn:'restore and release. let the frequencies do the work.',   descHe:'שחרור והתחדשות. תני לתדרים לעשות את שלהם.'},
    focus:    {en:'Focus',    he:'ריכוז',   descEn:'clear the noise. sharpen your mind.',                     descHe:'נקי את הרעש. חדדי את המיקוד.'},
    abundance:{en:'Abundance',he:'שפע',     descEn:'align your energy. open to receive.',                     descHe:'יישרי את האנרגיה שלך. פתחי לקבל.'},
  }
  buildLibrary()
  show('library')
  setTimeout(()=>{
    // Update mood pills — activate the matching one
    activeMood=mode
    document.querySelectorAll('.mood-pill').forEach(p=>{
      const isActive=p.getAttribute('data-mood')===mode
      p.style.background=isActive?'var(--echo-gold)':'var(--card)'
      p.style.color=isActive?'var(--echo-on-gold)':'var(--t2)'
      p.style.borderColor=isActive?'var(--echo-gold)':'var(--b2)'
      p.style.fontWeight=isActive?'500':'300'
      p.classList.toggle('on',isActive)
    })
    // Filter rows — show only this mode
    let count=0
    document.querySelectorAll('.lb-row').forEach(r=>{
      const fid=r.getAttribute('data-fid')
      const f=FREQS.find(x=>x.id===fid)
      const show=(f&&f.mode===mode)
      r.style.display=show?'':'none'
      if(show) count++
    })
    // Hide group headers with no visible rows
    document.querySelectorAll('.lb-grp').forEach(grp=>{
      let next=grp.nextElementSibling
      let hasVisible=false
      while(next&&!next.classList.contains('lb-grp')){
        if(next.classList.contains('lb-row')&&next.style.display!=='none') hasVisible=true
        next=next.nextElementSibling
      }
      grp.style.display=hasVisible?'':'none'
    })
    // Hide the group count badges (the numbers like "5", "12", "4")
    document.querySelectorAll('.lb-gc').forEach(el=>el.style.display='none')
    // Update library header title
    const mi=modeInfo[mode]||{en:mode,he:mode,descEn:'',descHe:''}
    const titleEl=document.getElementById('lib-title')
    if(titleEl) titleEl.textContent=(isHe?mi.he:mi.en)+' · '+count+' '+(isHe?'תדרים':'frequencies')
    // Update sub label
    const subEl=document.getElementById('lib-sub')
    if(subEl) subEl.textContent=isHe?mi.descHe:mi.descEn
    // Clear search
    const si=document.getElementById('lib-si')
    if(si) si.value=''
    // Update back button text
    const libBack=document.getElementById('lib-back')
    if(libBack) libBack.textContent=isHe?'← מצבים':'← modes'
  },60)
}
// FIX 4 — stop audio when leaving player
function leavePlayer(){ if(playing) doStop(); show('home') }
function show(id){
  const prev=document.querySelector('.scr.on')
  const next=document.getElementById(id)
  if(!next){ console.warn('show: screen not found:', id); return }
  if(prev===next) return
  if(prev){ prev.classList.remove('on'); prev.style.display='none' }
  next.style.display='flex'
  requestAnimationFrame(()=>{ next.classList.add('on') })
  document.body.dir=lang==='he'?'rtl':'ltr'
  // Reset scroll on any new screen
  next.scrollTop = 0
  if(id==='history') setTimeout(buildHistory,50)
}
function openPlayer(fid){
  const idx=FREQS.findIndex(f=>f.id===fid)
  if(idx>=0){
    if(playing) doStop()
    curIdx=idx
    const f=FREQS[idx]
    track('frequency_opened', { event_category:'funnel', event_label:fid, freq_hz:f.hz, freq_mode:f.mode, freq_type:f.type||'tone' })
  }
  show('player')  // Show immediately — UI responds at once
  requestAnimationFrame(()=>requestAnimationFrame(()=>{ renderPlayer() })) // Double rAF: paint first, then render
}
function nextFreq(){ if(playing) doStop(); curIdx=(curIdx+1)%FREQS.length; renderPlayer();  }
function prevFreq(){ if(playing) doStop(); curIdx=(curIdx-1+FREQS.length)%FREQS.length; renderPlayer();  }

function renderPlayer(){
  const f=FREQS[curIdx],t=f[lang]||f.en
  const _s=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v}
  _s('pl-hz',f.hz); _s('pl-num',f.num+'·'+f.cat); _s('pl-name',t.name)
  _s('pl-sub',(t.sub||'').toUpperCase()); _s('pl-hz-panel',f.hz); _s('pl-name-panel',t.name)
  // Per-frequency background — supports image & MP4
  const _bgMap={
    'hz432':'https://cdn.midjourney.com/video/05623642-dfbb-41d8-8ea8-83fb01e863c7/3.mp4',
    'hz528':'https://cdn.midjourney.com/video/2d8c5d8b-fbb9-4d51-830d-22137dc5a1ef/0.mp4',
    // When Cloudinary ready, replace URL above with:
    // 'hz432':'https://res.cloudinary.com/YOUR/video/upload/bg_432.mp4',
  }
  const _bgSrc=_bgMap[f.id]||f.img||'img_player.jpg'
  const _isVid=_bgSrc.includes('.mp4')||_bgSrc.includes('.webm')
  const _imgEl=document.getElementById('pl-bg-img')
  const _vidEl=document.getElementById('pl-bg-video')
  if(_isVid&&_vidEl){
    if(_imgEl) _imgEl.style.display='none'
    _vidEl.style.display='block'
    if(_vidEl.getAttribute('data-src')!==_bgSrc){
      _vidEl.setAttribute('data-src',_bgSrc)
      _vidEl.src=_bgSrc; _vidEl.load(); _vidEl.play().catch(()=>{})
    }
  } else {
    if(_vidEl){ _vidEl.style.display='none'; try{_vidEl.pause()}catch(e){} }
    if(_imgEl){
      _imgEl.style.display='block'
      _imgEl.src=_bgSrc
      _imgEl.style.objectPosition='center 30%'
      _imgEl.style.objectFit='cover'
      _imgEl.classList.add('ken-burns')
    }
  }
  const typeEl=document.getElementById('pl-type')
  if(typeEl) typeEl.textContent=f.type==='binaural'?'🎧 Binaural':'🔊 Pure Tone'

  // Show/hide ear detail panel
  const earDetail=document.getElementById('pl-ear-detail')
  if(earDetail){
    if(f.type==='binaural'){
      earDetail.style.display='block'
      const waveNames={Gamma:'Gamma · focus & cognition',Alpha:'Alpha · relaxation & creativity',Theta:'Theta · deep meditation',Beta:'Beta · active focus',Delta:'Delta · deep sleep'}
      const el=document.getElementById('pl-ear-l');    if(el) el.textContent=f.cL
      const er=document.getElementById('pl-ear-r');    if(er) er.textContent=f.cR
      const eb=document.getElementById('pl-ear-beat'); if(eb) eb.textContent=f.beat+' Hz'
      const ew=document.getElementById('pl-ear-wave'); if(ew) ew.textContent=f.wave+' wave'
      const es=document.getElementById('pl-ear-state'); if(es) es.textContent=waveNames[f.wave]||f.wave
    } else {
      earDetail.style.display='none'
    }
  }
  const audioTxt=document.getElementById('pl-audio-txt')
  if(audioTxt){
    const isHe2=lang==='he'
    audioTxt.textContent=f.type==='binaural'
      ?f.cL+'Hz (L) · '+f.cR+'Hz (R) · Δ'+f.beat+'Hz · '+(isHe2?'נדרשות אוזניות':'Headphones required')
      :f.hz+' Hz · '+(isHe2?'ללא אוזניות':'No headphones needed')
  }
  const tagEl=document.getElementById('pl-tagline')
  if(tagEl) tagEl.textContent=t.tag||''
  renderTab()
  const bsEl=document.getElementById('bs-txt')
  if(bsEl) bsEl.innerHTML=BRAIN[0][lang]||BRAIN[0].en
  const bsFill=document.getElementById('bs-fill'); if(bsFill) bsFill.style.width='0%'
  _s('bs-time','0:00')
  const elRow=document.getElementById('el-row'); if(elRow) elRow.style.display='none'
  updatePlayBtn()
}

function setTab(i,el){ activeTab=i; document.querySelectorAll('.pl-tab').forEach(t=>t.classList.remove('on')); el.classList.add('on'); renderTab() }
function renderTab(){
  const f=FREQS[curIdx],t=f[lang]||f.en
  const el=document.getElementById('pl-txt')
  if(!el) return
  const isHe=lang==='he'
  if(activeTab===0) el.innerHTML=t.desc||''
  else if(activeTab===1){
    el.innerHTML='<em style="font-size:10px;color:var(--t4)">'+(isHe?'מקורות:':'Sources:')+'</em> '+(t.res||'')+' <em style="font-size:10px;color:var(--t4)">· '+(isHe?'echo.11 אינה מכשיר רפואי':'echo.11 is not a medical device')+'</em>'
  }
  else if(activeTab===2) el.textContent=t.ideal||''
  else if(activeTab===3) el.textContent=t.feel||(isHe?'האזיני ותרגישי.':'listen and notice.')
  const recEl=document.getElementById('pl-recommended')
  if(recEl) recEl.textContent=t.rec||(isHe?'מומלץ: 20–60 דקות':'Recommended: 20–60 min')
  const tagEl=document.getElementById('pl-tagline')
  if(tagEl) tagEl.textContent=t.tag||''
}

function selTimer(el,s){ document.querySelectorAll('.pl-timer').forEach(t=>t.classList.remove('on')); el.classList.add('on'); selTimerSec=s }
function handleVol(v){ volume=Number(v); document.getElementById('vol-n').textContent=v; if(playing) audioVol(FREQS[curIdx].id,volume) }
// FIX 3 — no blue on stop button
function updatePlayBtn(){
  const f=FREQS[curIdx], btn=document.getElementById('play-btn')
  // Show headphone notice for binaural freqs
  const hpNote=document.getElementById('hp-notice')
  if(hpNote) hpNote.style.display=(f&&f.type==='binaural'&&!playing)?'flex':'none'
  if(playing){
    btn.textContent=lang==='he'?`◼  עצור · ${f.hz} Hz`:`◼  Stop · ${f.hz} Hz`
    btn.className='pl-play stop-mode'
  } else {
    btn.textContent=lang==='he'?`► הפעל · ${f.hz} Hz`:`► Play · ${f.hz} Hz`
    btn.className='pl-play'
  }
}
function toggleLearnMore(){
  const panel=document.getElementById('learn-more-panel')
  const toggle=document.getElementById('learn-more-toggle')
  const lbl=document.getElementById('learn-more-lbl')
  const isHe=lang==='he'
  if(!panel) return
  const hidden=panel.style.display==='none'||panel.style.display===''
  panel.style.display=hidden?'block':'none'
  if(toggle) toggle.textContent=hidden?'▾':'▸'
  if(lbl) lbl.textContent=hidden?(isHe?'על התדר הזה':'about this frequency'):(isHe?'סגור':'close')
}
function toggleBrainState(){
  const card=document.getElementById('brain-state-card')
  const toggle=document.getElementById('bs-toggle')
  if(!card) return
  const hidden=card.style.display==='none'||card.style.display===''
  card.style.display=hidden?'block':'none'
  if(toggle) toggle.textContent=hidden?'▾':'▸'
}
function doStop(){
  const f=FREQS[curIdx]; audioStopId(f.id); playing=false; clearInterval(elapsedIv); releaseWakeLock(); const _pw=document.getElementById('pl-prog-wrap'); if(_pw) _pw.style.display='none'
  // Streak/history requires >=60s; saveSession itself enforces this floor
  if(elapsed>=60) saveSession(f.id, elapsed)
  elapsed=0
  document.getElementById('el-row').style.display='none'
  if('mediaSession' in navigator) navigator.mediaSession.playbackState='paused'
  updatePlayBtn()
}
function showHpToast(){
  const f=FREQS[curIdx]
  if(!f||f.type!=='binaural') return
  const t=document.getElementById('hp-toast')
  const msg=document.getElementById('hp-toast-msg')
  const sw=document.getElementById('hp-toast-switch')
  const isHe=lang==='he'
  if(msg) msg.textContent=isHe?'לחוויה מלאה, השתמש/י באוזניות':'for the full effect, use headphones'
  if(sw) sw.textContent=isHe?'עברו ל-528 Hz ←':'switch to 528 Hz →'
  if(t){ t.style.display='block'; clearTimeout(window._hpToastTimer); window._hpToastTimer=setTimeout(hideHpToast,6000) }
}
function hideHpToast(){
  const t=document.getElementById('hp-toast'); if(t) t.style.display='none'
}
async function togglePlay(){
  const f=FREQS[curIdx]
  if(playing){ doStop(); return }
  try{
    if(!audioCtx||audioCtx.state==='closed') audioCtx=new(window.AudioContext||window.webkitAudioContext)()
    if(audioCtx.state==='suspended') await audioCtx.resume()
  }catch(e){}
  await audioPlay(f); playing=true; audioVol(f.id,volume); elapsed=0; await requestWakeLock()
  track('audio_started', { event_category:'audio', event_label:f.id, freq_hz:f.hz, freq_mode:f.mode, freq_type:f.type||'tone' })
  // Headphone nudge for binaural
  if(f.type==='binaural'){
    const _ht=document.getElementById('hp-toast')
    if(_ht){ _ht.style.display='block'; setTimeout(()=>_ht.style.display='none',5000) }
  }

  // Show iOS screen lock notice once
  const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)
  if(isIOS && !sessionStorage.getItem('lockNotice')){
    sessionStorage.setItem('lockNotice','1')
    const notice=document.getElementById('lock-notice')
    if(notice){ notice.style.display='flex'; setTimeout(()=>notice.style.display='none',5000) }
  }

  clearInterval(elapsedIv)
  elapsedIv=setInterval(()=>{
    elapsed++
    // Funnel milestones — fire once per audio session
    if(elapsed === 30){
      const _f=FREQS[curIdx]
      track('audio_30s', { event_category:'audio', event_label:_f?.id, freq_hz:_f?.hz })
    } else if(elapsed === 60){
      const _f=FREQS[curIdx]
      track('audio_60s', { event_category:'audio', event_label:_f?.id, freq_hz:_f?.hz })
      // Gentle tip nudge — only once per browser, only for users who reached a real session
      try{
        if(!localStorage.getItem('echo11_tip_nudged')){
          localStorage.setItem('echo11_tip_nudged','1')
          showTipNudgeToast()
        }
      }catch(e){}
    } else if(elapsed === 300){
      const _f=FREQS[curIdx]
      track('audio_5min', { event_category:'audio', event_label:_f?.id, freq_hz:_f?.hz })
    }
    const ts=`${Math.floor(elapsed/60)}:${String(elapsed%60).padStart(2,'0')}`
    let timerDisplay=ts
    if(selTimerSec>0){
      const rem=Math.max(0,selTimerSec-elapsed)
      const remStr=`${Math.floor(rem/60)}:${String(rem%60).padStart(2,'0')}`
      timerDisplay=`${ts} / ${Math.floor(selTimerSec/60)}:${String(selTimerSec%60).padStart(2,'0')} · ${remStr} left`
    }
    const todayBar=document.getElementById('today-bar')
    if(todayBar){
      const sessions=loadSessions()
      const todaySecs=(sessions[getTodayKey()]?.total||0)+elapsed
      todayBar.style.height=Math.min(98,Math.max(5,Math.round(todaySecs/6)))+'%'
    }
    document.getElementById('bs-fill').style.width=Math.min(100,(elapsed/(selTimerSec||1200))*100)+'%'
    document.getElementById('bs-time').textContent=ts
    const s=[...BRAIN].reverse().find(b=>elapsed>=b.t); if(s) document.getElementById('bs-txt').innerHTML=s[lang]
    const er=document.getElementById('el-row'); er.style.display='flex'
    document.getElementById('el-txt').textContent=`${lang==='he'?'מאזינים':'Listening'} · ${timerDisplay}`
    if(selTimerSec>0 && elapsed>=selTimerSec){
      const _fid=FREQS[curIdx]?.id
      const _secs=elapsed
      doStop()
      if(_secs>=60) setTimeout(()=>showComplete(_fid,_secs), 400)
    }
  },1000)
  updatePlayBtn()
}

// Library
function filterLib(q){ renderLibRows(q.trim()===''?FREQS:FREQS.filter(f=>{const t=f[lang]||f.en;return `${f.hz} ${t.name} ${t.sub}`.toLowerCase().includes(q.toLowerCase())})) }
function buildLibrary(){ document.getElementById('lib-si').value=''; renderLibRows(FREQS) }

// ── Mood filter pills ────────────────────────────────────────
let activeMood = 'all'
function filterByMood(mood, btn){
  activeMood = mood
  // Update pill visual state — use brand gold for active
  document.querySelectorAll('.mood-pill').forEach(p=>{
    const isActive = p.getAttribute('data-mood') === mood
    p.style.background = isActive ? 'var(--echo-gold)' : 'var(--card)'
    p.style.color = isActive ? 'var(--echo-on-gold)' : 'var(--t2)'
    p.style.borderColor = isActive ? 'var(--echo-gold)' : 'var(--b2)'
    p.style.fontWeight = isActive ? '500' : '300'
    p.classList.toggle('on', isActive)
  })
  // Filter library rows
  if(mood === 'all'){
    renderLibRows(FREQS)
  } else {
    const filtered = FREQS.filter(f => f.mode === mood)
    renderLibRows(filtered)
  }
  // Clear search
  const si = document.getElementById('lib-si')
  if(si) si.value = ''
}
function renderLibRows(list){
  // Group: binaural first, then solfeggio, then echo11
  const groups = [
    {
      key:'binaural',
      label:{en:'🎧 Binaural Beats',he:'🎧 תדרים בינאורליים'},
      note:{en:'Headphones required · two-channel brain entrainment',he:'נדרשות אוזניות · סנכרון מוחי דו-ערוצי'},
      items: list.filter(f=>f.type==='binaural')
    },
    {
      key:'solfeggio',
      label:{en:'◯ Solfeggio & Tonal',he:'◯ סולפג׳יו ותדרים טונליים'},
      note:{en:'No headphones needed · works on speakers too',he:'ללא אוזניות · עובד גם ברמקולים'},
      items: list.filter(f=>f.type==='solfeggio')
    },
    {
      key:'echo11',
      label:{en:'∥ echo.11 Originals',he:'∥ echo.11 מקוריים'},
      note:{en:'Unique echo.11 blends · binaural + solfeggio',he:'שילובים ייחודיים · בינאורלי + סולפג׳יו'},
      items: list.filter(f=>f.cat==='echo11')
    }
  ];

  let html='';
  groups.forEach(group=>{
    if(!group.items.length) return;
    html+=`
      <div style="padding:16px 16px 6px;border-top:.5px solid var(--b1);margin-top:4px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
          <span style="font-family:'DM Sans',sans-serif;font-size:10px;letter-spacing:.18em;color:var(--t2);font-weight:400">${group.label[lang]||group.label.en}</span>
          <span style="font-family:'DM Sans',sans-serif;font-size:9px;color:var(--t4)">${group.items.length}</span>
        </div>
        <div style="font-family:'DM Sans',sans-serif;font-size:10px;color:var(--t4);letter-spacing:.06em">${group.note[lang]||group.note.en}</div>
      </div>`;
    group.items.forEach(f=>{
      const t=f[lang]||f.en;
      const isP=!!audioNodes[f.id];
      const hpTag = f.type==='binaural'
        ? `<span style="font-size:8px;letter-spacing:.1em;color:var(--t3);border:.5px solid var(--b2);border-radius:10px;padding:2px 7px">🎧 headphones</span>`
        : `<span style="font-size:8px;letter-spacing:.1em;color:var(--t4)">🔊 speakers ok</span>`;
      html+=`<button class="lb-row" data-fid="${f.id}" onclick="openPlayer('${f.id}')">
        <div style="position:absolute;left:0;top:0;bottom:0;width:2px;background:var(--t1);opacity:0;transition:opacity .2s;border-radius:0 1px 1px 0" class="ra"></div>
        <div class="lb-hc"><span class="lb-hv" style="font-size:18px">${f.hz}</span><span class="lb-hu">Hz</span></div>
        <div class="lb-mid">
          <div class="lb-nm" style="font-size:14px;margin-bottom:3px">${t.name}</div>
          <div style="font-family:'DM Sans',sans-serif;font-size:10px;color:var(--t3);margin-bottom:5px">${t.sub}</div>
          ${hpTag}
        </div>
        <div class="lb-r">${isP?'<div class="pl-dot"></div>':''}<span class="lb-arr">›</span></div>
      </button>`;
    });
  });

  document.getElementById('lib-rows').innerHTML=html;
  document.querySelectorAll('.lb-row').forEach(r=>{
    r.addEventListener('mouseenter',()=>{const a=r.querySelector('.ra');if(a)a.style.opacity='1'})
    r.addEventListener('mouseleave',()=>{const a=r.querySelector('.ra');if(a)a.style.opacity='0'})
  })
}

// ═══════════════════════════════════
// CONSCIOUSNESS JOURNEY
// ═══════════════════════════════════
const HAWKINS = [
  {score:0,   name:'Shame',      nameHe:'בושה',        color:'#374151'},
  {score:20,  name:'Guilt',      nameHe:'אשמה',        color:'#4b5563'},
  {score:30,  name:'Apathy',     nameHe:'אדישות',      color:'#6b7280'},
  {score:50,  name:'Grief',      nameHe:'אבל',         color:'#78716c'},
  {score:75,  name:'Fear',       nameHe:'פחד',         color:'#92400e'},
  {score:100, name:'Desire',     nameHe:'תשוקה',       color:'#b45309'},
  {score:125, name:'Anger',      nameHe:'כעס',         color:'#c2410c'},
  {score:150, name:'Pride',      nameHe:'גאווה',       color:'#b45309'},
  {score:200, name:'Courage ✦',  nameHe:'אומץ ✦',     color:'var(--echo-gold)'},
  {score:250, name:'Neutrality', nameHe:'ניטרליות',    color:'#a3a3a3'},
  {score:310, name:'Willingness',nameHe:'נכונות',      color:'#d1d5db'},
  {score:350, name:'Acceptance', nameHe:'קבלה',        color:'#e5e7eb'},
  {score:400, name:'Reason',     nameHe:'שכל',         color:'#f3f4f6'},
  {score:500, name:'Love',       nameHe:'אהבה',        color:'#fde68a'},
  {score:540, name:'Joy',        nameHe:'שמחה',        color:'#fef3c7'},
  {score:600, name:'Peace',      nameHe:'שלום',        color:'#ffffff'},
  {score:700, name:'Enlightenment',nameHe:'הארה',      color:'#ffffff'},
];

function getConsciousnessData(){
  const sessions = loadSessions();
  const keys = Object.keys(sessions).sort();
  let totalDays = 0, streak = 0, lastDate = null;
  const today = getTodayKey();

  // Count days with 20+ min listening
  keys.forEach(k => {
    const mins = Math.round((sessions[k].total||0)/60);
    if(mins >= 20){
      totalDays++;
      // check streak
      if(!lastDate){
        streak = 1;
      } else {
        const prev = new Date(lastDate.replace(/-/g,'/'));
        const curr = new Date(k.replace(/-/g,'/'));
        const diff = (curr - prev) / (1000*60*60*24);
        if(diff <= 1) streak++;
        else streak = 1;
      }
      lastDate = k;
    }
  });

  // Score: each qualifying day = +20 points (maps toward Courage at day 10 = 200)
  const score = Math.min(700, totalDays * 20);
  const level = HAWKINS.slice().reverse().find(h => score >= h.score) || HAWKINS[0];
  const pct = Math.min(100, (score / 700) * 100);

  return { score, level, pct, totalDays, streak };
}

function renderConsciousnessCard(){
  const { score, level, pct, totalDays, streak } = getConsciousnessData();

  const scoreEl = document.getElementById('cs-score');
  const nameEl  = document.getElementById('cs-level-name');
  const fillEl  = document.getElementById('cs-fill');
  const dayEl   = document.getElementById('cs-day-label');
  const msgEl   = document.getElementById('cs-message');
  const dotsEl  = document.getElementById('cs-dots');
  const markerEl= document.getElementById('cs-marker');

  if(scoreEl) scoreEl.textContent = score;
  if(nameEl)  nameEl.textContent  = lang==='he' ? level.nameHe : level.name;
  if(fillEl)  fillEl.style.width  = pct + '%';
  if(dayEl)   dayEl.textContent   = `day ${totalDays} / 30`;

  // Marker position
  if(markerEl){
    const courage200pct = (200/700*100).toFixed(1);
    markerEl.style.cssText = `
      position:absolute;top:-18px;
      left:${courage200pct}%;
      transform:translateX(-50%);
      font-family:'DM Sans',sans-serif;
      font-size:8px;letter-spacing:.1em;
      color:var(--echo-gold);white-space:nowrap;
    `;
    if(fillEl) fillEl.style.background = score >= 200
      ? 'linear-gradient(to right,#6b7280,var(--echo-gold),#fde68a)'
      : 'linear-gradient(to right,#6b7280,#9ca3af,var(--echo-gold))';
  }

  // Message
  if(msgEl){
    const daysLeft = Math.max(0, 30 - totalDays);
    if(totalDays === 0)
      msgEl.textContent = lang==='he'
        ? '20 דקות ביום · 30 יום · שינוי אמיתי. תתחיל היום.'
        : '20 min/day · 30 days · real change. Start today.';
    else if(score >= 200)
      msgEl.textContent = lang==='he'
        ? `✦ הגעת לתדר האומץ! ${daysLeft} ימים נותרו לסיום המסע.`
        : `✦ You reached the Courage frequency! ${daysLeft} days remaining.`;
    else
      msgEl.textContent = lang==='he'
        ? `${daysLeft} ימים לתדר ה-200 — האומץ. ${streak} ימי רצף.`
        : `${10 - Math.min(10, totalDays)} days to Courage (200). ${streak}-day streak.`;
  }

  // Dots — 30 days
  if(dotsEl){
    const sessions = loadSessions();
    let html = '';
    for(let i=0; i<30; i++){
      const d = new Date(); d.setDate(d.getDate() - (29-i));
      const k = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
      const mins = Math.round(((sessions[k]||{}).total||0)/60);
      const done = mins >= 20;
      const today2 = i === 29;
      html += `<div style="width:10px;height:10px;border-radius:2px;
        background:${done ? 'var(--echo-gold)' : 'var(--b1)'};
        border:${today2 ? '.5px solid var(--t3)' : 'none'};
        flex-shrink:0;transition:background .3s"></div>`;
    }
    dotsEl.innerHTML = html;
  }
}

// ═══════════════════════════════════
// BINAURAL STRIP
// ═══════════════════════════════════
function renderBinauralStrip(){
  const strip = document.getElementById('binaural-strip');
  if(!strip) return;
  const binaurals = FREQS.filter(f => f.type === 'binaural');
  strip.innerHTML = binaurals.map(f => {
    const t = f[lang] || f.en;
    return `<button onclick="openPlayer('${f.id}')" class="echo-binaural-card">
      <div class="echo-binaural-hz"><span class="echo-binaural-num">${f.hz}</span><span class="echo-binaural-unit">Hz</span></div>
      <div class="echo-binaural-name">${t.name}</div>
      <div class="echo-binaural-wave">${f.wave} wave</div>
    </button>`;
  }).join('');
}

// ═══════════════════════════════════
// PROTOCOL SCREEN
// ═══════════════════════════════════
function showProtocol(){
  const el = document.getElementById('protocol');
  const splash = document.getElementById('splash');
  if(!el) return;
  track('protocol_started', { event_category: 'funnel' }, { once: true })
  if(splash) splash.style.display = 'none';
  el.classList.add('on');
  requestAnimationFrame(()=>{ el.classList.add('visible'); });

  // Binaural wave animations
  function drawPrWave(canvasId, freq, color, amp){
    const cv = document.getElementById(canvasId);
    if(!cv) return;
    const ctx = cv.getContext('2d');
    cv.width = (cv.offsetWidth||200) * (window.devicePixelRatio||1);
    cv.height = (canvasId==='prWaveResult'?36:28) * (window.devicePixelRatio||1);
    ctx.scale(window.devicePixelRatio||1, window.devicePixelRatio||1);
    const w = cv.offsetWidth||200, h = canvasId==='prWaveResult'?18:14;
    let phase = 0;
    function frame(){
      ctx.clearRect(0,0,w,canvasId==='prWaveResult'?36:28);
      ctx.beginPath();
      for(let x=0;x<=w;x++){
        const y = h + Math.sin((x/w)*Math.PI*freq + phase) * amp;
        x===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      phase += 0.06;
      requestAnimationFrame(frame);
    }
    frame();
  }
  setTimeout(()=>{
    drawPrWave('prWaveL', 4, 'rgba(255,255,255,0.35)', 8);
    drawPrWave('prWaveR', 5, 'rgba(255,255,255,0.35)', 8);
    drawPrWave('prWaveResult', 1.5, 'rgba(180,200,255,0.6)', 12);
  }, 300);

  // Build nav dots
  const sections = el.querySelectorAll('.pr-section');
  const dotsEl = document.getElementById('pr-dots');
  if(dotsEl){
    dotsEl.innerHTML = '';
    sections.forEach((_,i)=>{
      const btn = document.createElement('button');
      btn.className = 'pr-dot';
      btn.addEventListener('click',()=>{
        sections[i].scrollIntoView({behavior:'smooth'});
      });
      dotsEl.appendChild(btn);
    });
  }

  // IntersectionObserver for section activation
  const dots = el.querySelectorAll('.pr-dot');
  const progEl = document.getElementById('pr-prog');
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('pr-active');
        const idx = parseInt(entry.target.getAttribute('data-pr')||'0');
        dots.forEach(d=>d.classList.remove('active'));
        if(dots[idx]) dots[idx].classList.add('active');
      }
    });
  },{threshold:0.4});

  sections.forEach(s=>observer.observe(s));

  // Parallax on scroll
  let ticking = false;
  el.addEventListener('scroll',()=>{
    if(!ticking){
      requestAnimationFrame(()=>{
        const scrollY = el.scrollTop;
        const winH = el.clientHeight;
        const docH = el.scrollHeight - winH;
        if(progEl) progEl.style.width = Math.min(100, scrollY/docH*100)+'%';
        sections.forEach(sec=>{
          const bg = sec.querySelector('.pr-bg');
          if(!bg) return;
          const rect = sec.getBoundingClientRect();
          const progress = -(rect.top) / (rect.height + winH);
          bg.style.transform = `translate3d(0,${progress*90}px,0)`;
        });
        ticking = false;
      });
      ticking = true;
    }
  },{passive:true});

  // Activate first section
  setTimeout(()=>{ if(sections[0]) sections[0].classList.add('pr-active'); }, 200);
}

function enterFromProtocol(){
  track('protocol_completed', { event_category: 'funnel', method: 'cta' })
  const el = document.getElementById('protocol');
  if(el){ el.style.transition='opacity .6s ease'; el.style.opacity='0'; }
  setTimeout(()=>{
    if(el) el.classList.remove('on');
    _doEnterApp();
  }, 650);
}

function skipProtocol(){
  track('protocol_skipped', { event_category: 'funnel' })
  const el = document.getElementById('protocol');
  if(el){ el.style.transition='opacity .4s ease'; el.style.opacity='0'; }
  setTimeout(()=>{
    if(el) el.classList.remove('on');
    _doEnterApp();
  }, 420);
}

async function _doEnterApp(){
  // Resume AudioContext
  try{
    if(!audioCtx||audioCtx.state==='closed')
      audioCtx=new(window.AudioContext||window.webkitAudioContext)();
    if(audioCtx.state==='suspended') await audioCtx.resume();
  }catch(e){}
  track('app_enter', { event_category:'funnel', source:'protocol' })
  const splash = document.getElementById('splash');
  if(splash){ splash.style.transition='opacity .4s'; splash.style.opacity='0'; }
  setTimeout(()=>{
    if(splash) splash.style.display='none';
    try{ renderStreak(); }catch(e){}
    showHome();
    setTimeout(showOnboarding, 800);
  }, 420);
}

// Theme / Lang
function toggleDark(){
  dark=!dark; document.body.classList.toggle('dark',dark)
  // Header icon button (new design) — swap moon/sun SVG
  const headerBtn=document.getElementById('dark-h')
  if(headerBtn){
    const use=headerBtn.querySelector('use')
    if(use) use.setAttribute('href', dark ? '#i-moon' : '#i-sun')
    headerBtn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme')
  }
  // Legacy text buttons (player page, settings modal)
  const txt=dark?'◑ Light':'◐ Dark'
  ;['dark-p','settings-dark-btn'].forEach(id=>{const e=document.getElementById(id);if(e)e.textContent=txt})
}
let baseFontSize=16
// Restore saved font size
try{
  const saved=localStorage.getItem('echo11_font')
  if(saved){ baseFontSize=parseInt(saved)||16 }
}catch(e){}
function changeFontSize(d){
  baseFontSize=Math.max(13,Math.min(22,baseFontSize+d))
  // Scale the entire page using root font-size
  // This affects all rem + em units AND sets a base for px scaling
  const scale=baseFontSize/16 // 16 = default
  document.documentElement.style.fontSize=baseFontSize+'px'
  // Also update body for px-based text
  document.body.style.fontSize=baseFontSize+'px'
  // Apply zoom-style scaling to all text via CSS variable
  document.documentElement.style.setProperty('--base-font',baseFontSize+'px')
  document.documentElement.style.setProperty('--font-scale',scale.toString())
  // Force-update key text elements that use px directly
  const px=(size)=>Math.round(size*scale)+'px'
  document.querySelectorAll('p,span,div,button,a,label,input').forEach(el=>{
    const cs=window.getComputedStyle(el)
    const fs=parseFloat(cs.fontSize)
    if(fs>0 && fs<30){
      el.style.fontSize=Math.round(fs*((baseFontSize)/16))+'px'
    }
  })
  try{localStorage.setItem('echo11_font',baseFontSize)}catch(e){}
}

const STR={
  en:{'sp-sub':'frequencies','sp-desc':'your nervous system is listening.\nfelt in seconds. backed by science.','sp-hp-m':'Headphones required','sp-hp-s':'BINAURAL BEATS · STEREO SEPARATION','sp-btn':'enter echo.11 →','sp-btn-hp':'enter the frequency','sp-btn-no-hp':'start with 528 Hz →','hm-tag':'tune your mind','lang-h':'עב','lang-p':'עב','today-lbl':"Today's Frequency",'today-changes-lbl':'changes daily','today-name':'The Universe · Deep Sleep · Release','today-cta':'Tap to listen →','modes-lbl':'Choose a mode','m-sleep':'Sleep','m-sleepc':'4 frequencies','m-heal':'Healing','m-healc':'4 frequencies','m-focus':'Focus','m-focusc':'4 frequencies','m-abund':'Abundance','m-abundc':'4 frequencies','lib-link':'← Full Library · 21 Frequencies','pl-back':'← Back','bs-what':"What's happening",'bs-lbl':'Brain State','vol-lbl':'Vol','prog-lbl':'Your progress','sk-lbl':'day streak','sk-sub':'Most played: 432 Hz','lib-back':'← Back','lib-title':'Library · 21 Frequencies','lib-si':'Search frequencies...','timer-lbl':'Session duration','lock-txt':'Keep screen on for continuous audio','hero-sub':'22 frequencies · not music · real science · CIA gateway protocol','bin-lbl':'🎧 Binaural Beats · CIA Protocol','bin-foot':'Headphones required · inspired by declassified CIA Gateway Experience (1983) & Monroe Institute research','quick-lbl':'quick relief','quick-desc':'feeling anxious? 3 minutes of calm.','foot-a11y-lnk':'Accessibility','foot-privacy-lnk':'Privacy','foot-terms-lnk':'Terms','foot-protocol-lnk':'Protocol','foot-copy':'echo.11 © 2026','streak-cta-lbl':'view history →','home-tip-nudge-txt':'If echo.11 brought you calm — say thanks'},
  he:{'sp-sub':'תדרים','sp-desc':'כווני את מערכת העצבים שלך.\nנחווה תוך שניות. מבוסס מדע.','sp-hp-m':'חובה להשתמש באוזניות','sp-hp-s':'BINAURAL BEATS · הפרדה סטריאו','sp-btn':'כנסי לאפליקציה ←','sp-btn-hp':'כניסה לתדר','sp-btn-no-hp':'התחילי עם 528 Hz ←','hm-tag':'כווני את מוחך','lang-h':'EN','lang-p':'EN','today-lbl':'התדר של היום','today-changes-lbl':'מתחלף יומי','today-name':'היקום · שינה עמוקה · שחרור','today-cta':'לחצי להאזנה ←','modes-lbl':'בחרי מצב','m-sleep':'שינה','m-sleepc':'2 תדרים','m-heal':'ריפוי','m-healc':'8 תדרים','m-focus':'ריכוז','m-focusc':'7 תדרים','m-abund':'שפע','m-abundc':'4 תדרים','lib-link':'← ספריה מלאה · 21 תדרים','pl-back':'← חזרה','bs-what':'מה קורה עכשיו','bs-lbl':'מצב המוח','vol-lbl':'עוצמה','prog-lbl':'ההתקדמות שלך','sk-lbl':'ימים רצופים','sk-sub':'הכי מאוזן: 432 Hz','lib-back':'← חזרה','lib-title':'ספריה · 21 תדרים','lib-si':'חיפוש תדרים...','timer-lbl':'משך הסשן','lock-txt':'השאירי את המסך דלוק להמשך האזנה','hero-sub':'22 תדרים · לא מוזיקה · מדע אמיתי · פרוטוקול CIA Gateway','bin-lbl':'🎧 ביינוראל ביטס · פרוטוקול CIA','bin-foot':'נדרשות אוזניות · בהשראת CIA Gateway Experience (1983) ומחקר מכון Monroe','quick-lbl':'הקלה מהירה','quick-desc':'מרגישה חרדה? שלוש דקות של רוגע.','foot-a11y-lnk':'נגישות','foot-privacy-lnk':'פרטיות','foot-terms-lnk':'תנאים','foot-protocol-lnk':'פרוטוקול','foot-copy':'echo.11 © 2026','streak-cta-lbl':'צפו בהיסטוריה ←','home-tip-nudge-txt':'אם echo.11 הרגיע אותך — אפשר להגיד תודה'},
}
function setLang(l){
  if(lang===l) return
  lang=l; document.body.dir=lang==='he'?'rtl':'ltr'
  Object.entries(STR[lang]).forEach(([id,v])=>{ const e=document.getElementById(id); if(!e) return; e.tagName==='INPUT'?e.placeholder=v:e.textContent=v })
  document.querySelectorAll('.pl-tab').forEach((t,i)=>{ t.textContent=lang==='he'?['מה זה?','מחקר','מתאים ל','תחושה'][i]:['What is it?','Research','Ideal for','How it feels'][i] })
  document.querySelectorAll('.pl-timer').forEach((t,i)=>{ t.textContent=lang==='he'?['3 דק','8 דק','20 דק','60 דק','∞'][i]:['3 min','8 min','20 min','60 min','∞'][i] })
  renderPlayer(); buildLibrary()
  // Re-render profile if visible
  try{ if(document.getElementById('profile')?.classList.contains('on')) renderProfile() }catch(e){}
  // Update visions/tip-jar strings even when not on profile
  try{ translateTipJar() }catch(e){}
  // Update Library CTA on home
  const isHe=lang==='he'
  const lcLbl=document.getElementById('lib-cta-lbl')
  if(lcLbl) lcLbl.textContent=isHe?'הספרייה המלאה':'Explore the Library'
  const lcTitle=document.getElementById('lib-cta-title')
  if(lcTitle) lcTitle.textContent=isHe?'21 תדרים. 4 מצבים.':'21 frequencies. 4 moods.'
  const lcSub=document.getElementById('lib-cta-sub')
  if(lcSub) lcSub.textContent=isHe?'שינה · ריפוי · ריכוז · שפע':'Sleep · Healing · Focus · Abundance'
  // Update mood pills
  const moodMap={all:{en:'All',he:'הכל'},sleep:{en:'◯ Sleep',he:'◯ שינה'},healing:{en:'∿ Healing',he:'∿ ריפוי'},focus:{en:'□ Focus',he:'□ ריכוז'},abundance:{en:'◇ Abundance',he:'◇ שפע'}}
  document.querySelectorAll('.mood-pill').forEach(p=>{
    const m=p.getAttribute('data-mood')
    const t=moodMap[m]; if(t) p.textContent=isHe?t.he:t.en
  })
  // Update all lang toggle buttons text
  const isHeL=lang==='he'
    // Update all lang pill buttons — active state
  document.querySelectorAll('.lang-pill').forEach(b=>{
    const isEnBtn=b.textContent.trim()==='EN'
    const active=isHeL?!isEnBtn:isEnBtn
    b.style.background=active?'rgba(201,180,152,.15)':'transparent'
    b.style.color=active?'var(--t1)':'var(--t4)'
    b.style.fontWeight=active?'500':'300'
  })
}

// Splash canvas

const BRAIN_COMPLETE={
  gamma:{en:"Your brain ran 40 Hz synchronization — the same rhythm MIT's Picower Institute (Nature, 2016) found enhances memory and clears cognitive fog.",he:"המוח שלך רץ על סינכרון 40 Hz — אותו קצב שמכון Picower מצא שמשפר זיכרון ומנקה ערפל קוגניטיבי."},
  alpha:{en:"Alpha waves at 8–12 Hz washed through your cortex — the bridge to subconscious flow that José Silva identified.",he:"גלי אלפא 8–12 Hz שטפו את קליפת המוח — הגשר לזרימה תת-מודעת שחוזה סילבה זיהה."},
  theta:{en:"Deep Theta 4–8 Hz — your nervous system shifted toward the edge of sleep, where emotional processing and healing happen.",he:"תטא עמוקה 4–8 Hz — מערכת העצבים שלך עברה לגבול השינה, שם מתרחש עיבוד רגשי וריפוי."},
  delta:{en:"Delta below 4 Hz — the deepest sleep state. Cellular repair, immune strengthening, growth hormone release.",he:"דלתא מתחת ל-4 Hz — מצב השינה העמוק ביותר. תיקון תאי, חיזוק חיסוני, שחרור הורמון גדילה."},
  solfeggio:{en:"Solfeggio frequencies work through resonance — exposing your cells to mathematically precise harmonic patterns from an ancient scale.",he:"תדרי הסולפג'יו עובדים דרך רזוננס — חשיפת התאים לדפוסים הרמוניים המדויקים מסולם עתיק."},
  echo11:{en:"The echo.11 original frequency. Where mathematics meets sound healing. Your system tuned to its own signal.",he:"התדר המקורי של echo.11. שם מתמטיקה פוגשת ריפוי קולי. המערכת שלך כוּונה לאות שלה עצמה."},
}
function getBrainComplete(f){
  if(!f) return BRAIN_COMPLETE.solfeggio
  if(f.wave==='Gamma') return BRAIN_COMPLETE.gamma
  if(f.wave==='Alpha') return BRAIN_COMPLETE.alpha
  if(f.wave==='Theta') return BRAIN_COMPLETE.theta
  if(f.wave==='Delta') return BRAIN_COMPLETE.delta
  if(f.cat==='echo11') return BRAIN_COMPLETE.echo11
  return BRAIN_COMPLETE.solfeggio
}
function setPlayerState(state){
  // Minimal: just update bg opacity
  const bg=document.getElementById('pl-bg-img')
  if(bg) bg.style.opacity=state==='playing'?'0.7':'1'
}
function replaySession(){ show('player') }
function showComplete(freqId,listenedSecs){
  const _f = FREQS.find(x=>x.id===freqId)
  track('audio_complete', { event_category:'audio', event_label:freqId, freq_hz:_f?.hz, freq_mode:_f?.mode, value:Math.round(listenedSecs/60), seconds:listenedSecs })
  const f=FREQS.find(x=>x.id===freqId)||FREQS[curIdx]
  const t=f?f[lang]||f.en:{}
  const isHe=lang==='he', mins=Math.max(1,Math.round(listenedSecs/60))
  const sessions=loadSessions(), streak=calcStreak(sessions)
  const totalMins=Math.round(Object.values(sessions).reduce((s,d)=>s+(d.total||0),0)/60)
  const el=id=>document.getElementById(id)
  const hl=[[streak>=7,isHe?`${streak} ימים. את התדר.`:`${streak} days. you are the frequency.`],[mins>=20,isHe?`${mins} דקות של כוונון.`:`${mins} minutes. your system shifted.`],[mins>=3,isHe?'סשן הושלם. הגוף שלך יודע.':'session complete. your body knows.'],[true,isHe?'האזנת. זה מספיק.':'you listened. that is enough.']].find(([c])=>c)[1]
  if(el('comp-headline')) el('comp-headline').textContent=hl
  if(el('comp-freq-lbl')) el('comp-freq-lbl').textContent=(f?.hz||'')+' Hz · '+(t.name||'')
  if(el('comp-stats')) el('comp-stats').innerHTML=[[mins,isHe?'דקות':'minutes'],[streak,isHe?'ימים רצופים':'day streak'],[totalMins,isHe?'סה"כ':'total min']].map(([v,l])=>`<div style="background:var(--bg2);border-radius:10px;padding:10px 8px;text-align:center"><div style="font-family:'DM Sans',sans-serif;font-size:9px;letter-spacing:.16em;color:var(--t3);text-transform:uppercase;margin-bottom:4px">${l}</div><div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:28px;font-weight:200;color:var(--t1);line-height:1">${v}</div></div>`).join('')
  const bd=getBrainComplete(f)
  if(el('comp-brain-lbl')) el('comp-brain-lbl').textContent=isHe?'מה קרה':'what happened'
  if(el('comp-brain-txt')) el('comp-brain-txt').textContent=isHe?bd.he:bd.en
  const dw=Math.min(streak,7), stage=SHAPE_STAGES[dw]||SHAPE_STAGES[0]
  const compCv=el('comp-shape-cv')
  if(compCv){const ctx=compCv.getContext('2d');drawWeeklyShape(ctx,dw,80)}
  if(el('comp-shape-name')) el('comp-shape-name').textContent=isHe?stage.nameHe:stage.name
  if(el('comp-shape-desc')) el('comp-shape-desc').textContent=isHe?stage.descHe:stage.desc
  if(el('comp-replay')) el('comp-replay').textContent=isHe?`▶ שמע שוב · ${f?.hz||''} Hz`:`▶ listen again · ${f?.hz||''} Hz`
  if(el('comp-home')) el('comp-home').textContent=isHe?'← חזרה לבית':'← back to home'
  if(el('comp-back')) el('comp-back').textContent=isHe?'← חזרה':'← Back'
  show('complete')
  try{ renderStreak() }catch(e){}
}

;(function(){
  const cv=document.getElementById('splashCv'),ctx=cv.getContext('2d')
  const stars=Array.from({length:160},()=>({x:Math.random()*2-1,y:Math.random()*2-1,z:Math.random(),speed:.0006+Math.random()*.0009,size:Math.random()*1.2}))
  let lZ=0,t=0
  function resize(){ cv.width=cv.offsetWidth||400; cv.height=cv.offsetHeight||700 }
  resize(); new ResizeObserver(resize).observe(cv)
  function frame(){
    const W=cv.width,H=cv.height,cx=W/2,cy=H*.32
    ctx.clearRect(0,0,W,H)
    const dk=document.body.classList.contains('dark'),sc=dk?'235,233,225':'20,20,16'
    stars.forEach(s=>{
      s.z+=s.speed; if(s.z>1){s.z=.01;s.x=Math.random()*2-1;s.y=Math.random()*2-1}
      const p=1/(1-s.z*.9),px=cx+s.x*W*.5*p,py=cy+s.y*H*.38*p
      if(px<0||px>W||py<0||py>H) return
      const r=Math.max(.2,s.size*s.z*1.2),a=s.z*.7
      ctx.beginPath();ctx.arc(px,py,r,0,Math.PI*2);ctx.fillStyle=`rgba(${sc},${a})`;ctx.fill()
    })
    lZ=Math.min(1,lZ+.002)
    const sR=lZ<.1?.5:lZ*5,gR=sR*7
    ;[gR*3,gR*2,gR,sR*2.5,sR].forEach((r,i)=>{
      const a=[.015,.03,.07,.13,.7][i]*lZ
      const g=ctx.createRadialGradient(cx,cy,0,cx,cy,r)
      g.addColorStop(0,dk?`rgba(255,255,252,${a})`:`rgba(40,38,30,${a*.35})`); g.addColorStop(1,'rgba(0,0,0,0)')
      ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fillStyle=g;ctx.fill()
    })
    if(lZ>.4){const ra=(lZ-.4)/.6*.1;[60,110,180,260].forEach((r,i)=>{ctx.beginPath();ctx.arc(cx,cy,r+Math.sin(t*.015+i)*3,0,Math.PI*2);ctx.strokeStyle=`rgba(200,196,184,${ra*(1-i*.2)})`;ctx.lineWidth=.4;ctx.stroke()})}
    t++;requestAnimationFrame(frame)
  }
  frame()
})()

// Player canvas
