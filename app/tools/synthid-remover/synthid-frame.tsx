'use client'

import { useEffect, useState } from 'react'

export default function SynthidFrame() {
  const [height, setHeight] = useState(1700)
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      if (event.source !== document.querySelector<HTMLIFrameElement>('#synthid-frame')?.contentWindow) return
      const data = event.data
      if (data?.type !== 'ai-ranko-synthid-height') return
      const size = Number(data.height)
      if (Number.isFinite(size) && size > 500 && size < 15000) setHeight(Math.ceil(size))
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])
  return (
    <iframe
      id="synthid-frame"
      title="Ai Ranko SynthID image processing tool"
      src="/synthid-image-tool/index.html"
      style={{ display: 'block', width: '100%', height, border: 0 }}
      loading="eager"
      allow="clipboard-read"
    />
  )
}
