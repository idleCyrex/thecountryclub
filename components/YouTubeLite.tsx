'use client'

import { useState } from 'react'

/** Lite YouTube embed: thumbnail + play button, the iframe (nocookie) loads only on click. */
export default function YouTubeLite({ id, title }: { id: string; title: string }) {
  const [on, setOn] = useState(false)
  return (
    <div className="yt">
      {on ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button className="yt__btn" onClick={() => setOn(true)} aria-label={`Play ${title}`}>
          <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" decoding="async" />
          <span className="yt__play" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="28" height="28">
              <path d="M8 5v14l11-7z" fill="currentColor" />
            </svg>
          </span>
          <span className="display yt__title">{title}</span>
        </button>
      )}
    </div>
  )
}
