import { useState, useCallback } from 'react'
import { FREQUENCIES, MODES } from './data/frequencies'
import { useBinaural } from './hooks/useBinaural'
import SplashScreen  from './screens/SplashScreen'
import HomeScreen    from './screens/HomeScreen'
import PlayerScreen  from './screens/PlayerScreen'
import LibraryScreen from './screens/LibraryScreen'

// Today's frequency — in real app this rotates daily
const TODAY_FREQ = FREQUENCIES.find(f => f.id === 'hz432')

export default function App() {
  const [screen,     setScreen]     = useState('splash')
  const [lang,       setLang]       = useState('en')
  const [dark,       setDark]       = useState(false)
  const [playingId,  setPlayingId]  = useState(null)
  const [currentFreq,setCurrentFreq]= useState(TODAY_FREQ)
  const [currentIdx, setCurrentIdx] = useState(FREQUENCIES.findIndex(f=>f.id==='hz432'))
  const [volumes,    setVolumes]    = useState(() =>
    Object.fromEntries(FREQUENCIES.map(f => [f.id, 40]))
  )

  const { play, stop, setVol } = useBinaural()

  // Audio unlock on splash exit
  const handleEnter = useCallback(async () => {
    try {
      const c = new (window.AudioContext||window.webkitAudioContext)()
      await c.resume(); c.close()
    } catch(e) {}
    setScreen('home')
  }, [])

  const handlePlay = useCallback((freq) => {
    if (playingId && playingId !== freq.id) stop(playingId)
    play(freq); setPlayingId(freq.id); setVol(freq.id, volumes[freq.id])
  }, [play, stop, playingId, volumes, setVol])

  const handleStop = useCallback((id) => {
    stop(id); setPlayingId(null)
  }, [stop])

  const handleVolume = useCallback((id, vol) => {
    setVolumes(p => ({ ...p, [id]: vol })); setVol(id, vol)
  }, [setVol])

  const openPlayer = useCallback((freq) => {
    const idx = FREQUENCIES.findIndex(f => f.id === freq.id)
    setCurrentFreq(freq); setCurrentIdx(idx); setScreen('player')
  }, [])

  const handleMode = useCallback((mode) => {
    const freq = FREQUENCIES.find(f => f.id === mode.ids[0])
    if (freq) openPlayer(freq)
  }, [openPlayer])

  const handleNext = useCallback(() => {
    const idx = (currentIdx + 1) % FREQUENCIES.length
    setCurrentFreq(FREQUENCIES[idx]); setCurrentIdx(idx)
  }, [currentIdx])

  const handlePrev = useCallback(() => {
    const idx = (currentIdx - 1 + FREQUENCIES.length) % FREQUENCIES.length
    setCurrentFreq(FREQUENCIES[idx]); setCurrentIdx(idx)
  }, [currentIdx])

  const toggleDark = () => {
    const next = !dark; setDark(next)
    document.body.classList.toggle('dark', next)
  }
  const toggleLang = () => setLang(l => l==='en'?'he':'en')

  // Controls bar — shown on all screens except splash
  const Controls = () => (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'flex-end',
      gap:8, padding:'7px 14px',
      borderBottom:'.5px solid var(--b1)',
      background:'var(--bg2)',
    }}>
      <button onClick={toggleLang} style={{
        fontSize:9, letterSpacing:'.14em', color:'var(--t3)',
        background:'var(--card)', border:'.5px solid var(--b2)',
        borderRadius:20, padding:'5px 11px', cursor:'pointer',
        fontFamily:'inherit', transition:'all .2s',
      }}>
        {lang==='en' ? 'עב' : 'EN'}
      </button>
      <button onClick={toggleDark} style={{
        fontSize:9, letterSpacing:'.14em', color:'var(--t3)',
        background:'var(--card)', border:'.5px solid var(--b2)',
        borderRadius:20, padding:'5px 11px', cursor:'pointer',
        fontFamily:'inherit', transition:'all .2s',
      }}>
        {dark ? '◑ Light' : '◐ Dark'}
      </button>
    </div>
  )

  // App header — shown on Home and Library
  const Header = () => (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'14px 18px 10px',
      borderBottom:'.5px solid var(--b1)',
      flexShrink:0,
    }}>
      <div style={{display:'flex', alignItems:'center', gap:10}}>
        <div style={{display:'flex', alignItems:'center', gap:3}}>
          {[1.5,.5,0,.5,1.5].map((w,i) => w===0
            ? <span key={i} style={{display:'block', width:7}}/>
            : <span key={i} style={{display:'block', width:w, height:18, background:'var(--t1)', opacity:w<1?.2:.6}}/>
          )}
        </div>
        <div>
          <div style={{fontSize:14, fontWeight:300, letterSpacing:'.15em', color:'var(--t1)'}}>echo.11</div>
          <div style={{fontSize:8, letterSpacing:'.26em', color:'var(--t4)'}}>tune your mind</div>
        </div>
      </div>
    </div>
  )

  const pageStyle = {
    width:'100%', height:'100%',
    display:'flex', flexDirection:'column',
    background:'var(--bg)',
    direction: lang==='he' ? 'rtl' : 'ltr',
  }

  if (screen === 'splash') {
    return (
      <div style={{...pageStyle, direction:'ltr'}}>
        <SplashScreen onEnter={handleEnter} lang={lang}/>
      </div>
    )
  }

  return (
    <div style={pageStyle}>
      <Header/>
      <Controls/>

      {screen === 'home' && (
        <HomeScreen
          modes={MODES} lang={lang}
          todayFreq={TODAY_FREQ}
          onMode={handleMode}
          onLibrary={() => setScreen('library')}
          onPlayer={() => openPlayer(TODAY_FREQ)}
        />
      )}
      {screen === 'player' && currentFreq && (
        <PlayerScreen
          freq={currentFreq} lang={lang}
          playing={playingId === currentFreq.id}
          volume={volumes[currentFreq.id]}
          onPlay={handlePlay} onStop={handleStop}
          onVolumeChange={handleVolume}
          onBack={() => setScreen('home')}
          onNext={handleNext} onPrev={handlePrev}
        />
      )}
      {screen === 'library' && (
        <LibraryScreen
          frequencies={FREQUENCIES} lang={lang}
          playingId={playingId}
          onSelect={openPlayer}
          onBack={() => setScreen('home')}
        />
      )}
    </div>
  )
}
