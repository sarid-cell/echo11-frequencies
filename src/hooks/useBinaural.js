import { useRef, useCallback } from 'react'

export function useBinaural() {
  const ctxRef   = useRef(null)
  const nodesRef = useRef({})

  const getCtx = useCallback(() => {
    if (!ctxRef.current || ctxRef.current.state === 'closed')
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume()
    return ctxRef.current
  }, [])

  const stop = useCallback((id) => {
    const n = nodesRef.current[id]; if (!n) return
    try {
      const ctx = getCtx()
      n.gain.gain.setValueAtTime(n.gain.gain.value, ctx.currentTime)
      n.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.4)
      setTimeout(() => {
        try { n.osc?.stop(); n.oscL?.stop(); n.oscR?.stop() } catch(e) {}
        try { n.gain.disconnect() } catch(e) {}
        delete nodesRef.current[id]
      }, 1500)
    } catch(e) { delete nodesRef.current[id] }
  }, [getCtx])

  const play = useCallback((freq) => {
    if (nodesRef.current[freq.id]) stop(freq.id)
    const ctx = getCtx()
    try {
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 2)
      gain.connect(ctx.destination)

      if (freq.type === 'binaural') {
        const merger = ctx.createChannelMerger(2); merger.connect(gain)
        const oscL = ctx.createOscillator(); const panL = ctx.createStereoPanner()
        oscL.type = 'sine'; oscL.frequency.value = freq.cL; panL.pan.value = -1
        oscL.connect(panL); panL.connect(merger, 0, 0); oscL.start()
        const oscR = ctx.createOscillator(); const panR = ctx.createStereoPanner()
        oscR.type = 'sine'; oscR.frequency.value = freq.cR; panR.pan.value = 1
        oscR.connect(panR); panR.connect(merger, 0, 1); oscR.start()
        nodesRef.current[freq.id] = { oscL, oscR, gain }
      } else {
        const osc = ctx.createOscillator()
        osc.type = 'sine'; osc.frequency.value = freq.cL
        osc.connect(gain); osc.start()
        nodesRef.current[freq.id] = { osc, gain }
      }
    } catch(e) { console.error('Audio error:', e) }
  }, [getCtx, stop])

  const stopAll = useCallback(() => {
    Object.keys(nodesRef.current).forEach(stop)
  }, [stop])

  const setVol = useCallback((id, vol) => {
    const n = nodesRef.current[id]; if (!n) return
    try { getCtx(); n.gain.gain.setTargetAtTime((vol/100)*0.3, getCtx().currentTime, 0.1) } catch(e) {}
  }, [getCtx])

  return { play, stop, stopAll, setVol }
}
