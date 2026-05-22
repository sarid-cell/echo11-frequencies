// ── Accessibility Widget ──────────────────────────────────
let a11yFontLevel = 0  // -2 to +4 steps
let a11yHC = false
let a11yNoAnim = false
let a11yOpen = false

function toggleA11yMenu(){
  a11yOpen = !a11yOpen
  const menu = document.getElementById('a11y-menu')
  const btn  = document.getElementById('a11y-btn')
  menu.classList.toggle('open', a11yOpen)
  btn.setAttribute('aria-expanded', a11yOpen)
  if(a11yOpen) menu.querySelector('.a11y-close').focus()
}
function closeA11yMenu(){
  a11yOpen = false
  document.getElementById('a11y-menu').classList.remove('open')
  document.getElementById('a11y-btn').setAttribute('aria-expanded','false')
  document.getElementById('a11y-btn').focus()
}

function a11yFont(d){
  a11yFontLevel = Math.max(-2, Math.min(4, a11yFontLevel + d))
  const base = 16 + a11yFontLevel * 2
  document.body.style.fontSize = base + 'px'
  document.getElementById('a11y-font-val').textContent = Math.round(base/16*100) + '%'
  // sync with existing baseFontSize if defined
  if(typeof baseFontSize !== 'undefined') baseFontSize = base
}

function a11yContrast(){
  a11yHC = !a11yHC
  document.body.classList.toggle('hc-mode', a11yHC)
  const btn = document.getElementById('a11y-hc-btn')
  btn.textContent = a11yHC ? 'פע' : 'כב'
  btn.classList.toggle('on', a11yHC)
  btn.setAttribute('aria-pressed', a11yHC)
}

function a11yAnim(){
  a11yNoAnim = !a11yNoAnim
  document.body.classList.toggle('no-anim', a11yNoAnim)
  const btn = document.getElementById('a11y-anim-btn')
  btn.textContent = a11yNoAnim ? 'פע' : 'כב'
  btn.classList.toggle('on', a11yNoAnim)
  btn.setAttribute('aria-pressed', a11yNoAnim)
}

function a11yReset(){
  a11yFontLevel = 0
  a11yHC = false
  a11yNoAnim = false
  document.body.style.fontSize = '16px'
  document.body.classList.remove('hc-mode','no-anim')
  document.getElementById('a11y-font-val').textContent = '100%'
  const hcBtn = document.getElementById('a11y-hc-btn')
  hcBtn.textContent = 'כב'; hcBtn.classList.remove('on'); hcBtn.setAttribute('aria-pressed','false')
  const anBtn = document.getElementById('a11y-anim-btn')
  anBtn.textContent = 'כב'; anBtn.classList.remove('on'); anBtn.setAttribute('aria-pressed','false')
  if(typeof baseFontSize !== 'undefined') baseFontSize = 16
}

// Close on outside click
document.addEventListener('click', e => {
  if(a11yOpen && !e.target.closest('#a11y-menu') && !e.target.closest('#a11y-btn'))
    closeA11yMenu()
})

// Close on Escape
document.addEventListener('keydown', e => {
  if(e.key === 'Escape' && a11yOpen) closeA11yMenu()
})

// RTL/LTR sync for menu position
function syncA11yPos(){
  const btn  = document.getElementById('a11y-btn')
  const menu = document.getElementById('a11y-menu')
  if(document.body.dir === 'rtl'){
    btn.style.left='auto';  btn.style.right='20px'
    menu.style.left='auto'; menu.style.right='20px'
  } else {
    btn.style.right='auto'; btn.style.left='20px'
    menu.style.right='auto';menu.style.left='20px'
  }
}
// watch lang toggle
const _origToggleLang = typeof toggleLang==='function' ? toggleLang : null
if(_origToggleLang){
  window.toggleLang = function(){
    _origToggleLang()
    syncA11yPos()
    // translate widget labels
    const isHe = document.body.dir==='rtl'
    document.getElementById('a11y-title').textContent    = isHe?'נגישות':'Accessibility'
    document.getElementById('a11y-lbl-font').textContent  = isHe?'גודל טקסט':'Text size'
    document.getElementById('a11y-lbl-hc').textContent    = isHe?'ניגודיות גבוהה':'High contrast'
    document.getElementById('a11y-lbl-anim').textContent  = isHe?'עצור אנימציות':'Stop animations'
    document.getElementById('a11y-lbl-reset').textContent = isHe?'איפוס':'Reset'
    document.getElementById('a11y-btn').setAttribute('aria-label', isHe?'תפריט נגישות':'Accessibility menu')
  }
}
syncA11yPos()
