'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'
import { prefersReduced } from '@/lib/gsap'
import { whenRevealed } from '@/lib/curtain'

interface Props {
  /** 0..1 scroll progress of the pinned section (written by the parent timeline) */
  progress: RefObject<number>
  className?: string
}

/** keyframe: [progress, x, y] with x/y in NDC (-1..1, y up) */
type Key = [number, number, number]
interface BallCfg {
  keys: Key[]
  /** visible progress window */
  show: [number, number]
  size: number
  phase: number
  /** branded hero ball (level seam at rest) vs small random-orientation ball */
  hero: boolean
}

// one dominant ball drifting left -> top-right -> centre-left -> centre-right, a second large one joins near the end
const CONFIG: BallCfg[] = [
  {
    keys: [[0, -0.66, -0.2], [0.16, -0.58, 0.02], [0.36, 0.56, 0.5], [0.56, -0.36, 0.0], [0.76, 0.36, -0.1], [0.86, 0.42, -0.04], [0.96, 0.95, 1.7]],
    show: [0, 0.965],
    size: 0.78,
    phase: 0,
    hero: true,
  },
  {
    keys: [[0.68, -0.12, 1.7], [0.8, -0.3, 0.78], [0.88, -0.36, 0.7], [0.96, -0.7, 1.8]],
    show: [0.68, 0.965],
    size: 0.62,
    phase: 2.1,
    hero: true,
  },
]

const BALLS: BallCfg[] = [
  { keys: [[0.08, -0.9, 1.6], [0.2, -0.7, 0.4], [0.4, -0.1, -0.45], [0.6, 0.62, 0.3], [0.8, 0.15, -0.5], [0.96, 0.1, -1.8]], show: [0.08, 0.965], size: 0.3, phase: 0.7, hero: false },
  { keys: [[0.3, 0.9, 1.7], [0.42, 0.82, 0.7], [0.6, 0.6, -0.55], [0.78, -0.75, 0.5], [0.96, -0.95, -1.7]], show: [0.3, 0.965], size: 0.26, phase: 2.4, hero: false },
  { keys: [[0.55, -0.95, -1.7], [0.68, -0.62, -0.5], [0.82, 0.72, 0.55], [0.96, 0.95, 1.8]], show: [0.55, 0.965], size: 0.28, phase: 4.1, hero: false },
]

type Idle = (cb: () => void, opts?: { timeout: number }) => number
const idle = (cb: () => void) => {
  const ric = (window as unknown as { requestIdleCallback?: Idle }).requestIdleCallback
  if (ric) ric(cb, { timeout: 1000 })
  else window.setTimeout(cb, 1)
}

const SEAM_AMP = 0.12
const SEAM_SLOPE = (SEAM_AMP * 4 * Math.PI * 1024) / 2048

function drawBrandedBall(fontFamily: string, ink: string) {
  const W = 2048
  const H = 1024
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const g = c.getContext('2d')!
  g.fillStyle = '#d9f24a'
  g.fillRect(0, 0, W, H)

  for (let i = 0; i < 1400; i++) {
    const r = 40 + Math.random() * 160
    const x = Math.random() * W
    const y = Math.random() * H
    const grad = g.createRadialGradient(x, y, 0, x, y, r)
    const tint = Math.random() < 0.5 ? '255,255,150' : '130,160,10'
    grad.addColorStop(0, `rgba(${tint},0.05)`)
    grad.addColorStop(1, `rgba(${tint},0)`)
    g.fillStyle = grad
    g.fillRect(x - r, y - r, r * 2, r * 2)
  }
  for (let i = 0; i < 26000; i++) {
    const x = Math.random() * W
    const y = Math.random() * H
    const len = 2 + Math.random() * 6
    const a = Math.random() * Math.PI
    g.strokeStyle = Math.random() < 0.5 ? 'rgba(255,255,190,0.16)' : 'rgba(110,140,0,0.15)'
    g.lineWidth = 1 + Math.random()
    g.beginPath()
    g.moveTo(x, y)
    g.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len)
    g.stroke()
  }

  const A = H * SEAM_AMP
  const yAt = (x: number) => H / 2 + A * Math.sin((x / W) * Math.PI * 4)
  const slopeAt = (x: number) => A * ((Math.PI * 4) / W) * Math.cos((x / W) * Math.PI * 4)

  g.lineCap = 'round'
  g.lineJoin = 'round'
  const seam = (width: number, style: string) => {
    g.strokeStyle = style
    g.lineWidth = width
    g.beginPath()
    for (let x = -8; x <= W + 8; x += 8) {
      if (x === -8) g.moveTo(x, yAt(x))
      else g.lineTo(x, yAt(x))
    }
    g.stroke()
  }
  seam(66, 'rgba(95,120,0,0.28)')
  seam(40, '#f7f5ea')
  seam(34, '#ffffff')

  const stretch = g as CanvasRenderingContext2D & { fontStretch?: string }
  const line = (text: string, size: number, weight: number, tracking: number, offset: number, xc: number) => {
    g.font = `${weight} ${size}px ${fontFamily}`
    if ('fontStretch' in stretch) stretch.fontStretch = 'condensed'
    g.fillStyle = ink
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    const chars = [...text]
    const widths = chars.map((ch) => g.measureText(ch).width + size * tracking)
    const total = widths.reduce((a, b) => a + b, 0)
    let x = xc - (total / 2) / Math.sqrt(1 + slopeAt(xc) ** 2)
    chars.forEach((ch, i) => {
      const dx = widths[i] / Math.sqrt(1 + slopeAt(x) ** 2)
      const mid = x + dx / 2
      const th = Math.atan(slopeAt(mid))
      g.save()
      g.translate(mid + Math.sin(th) * offset, yAt(mid) - Math.cos(th) * offset)
      g.rotate(th)
      g.fillText(ch, 0, 0)
      g.restore()
      x += dx
    })
  }
  for (const xc of [W * 0.25, W * 0.75]) {
    line('COUNTRY CLUB', 98, 800, 0.06, -96, xc)
    line('PORT DE PLAISANCE · ST. MAARTEN', 34, 700, 0.14, 84, xc)
  }
  return c
}

/** Catmull-Rom (non-uniform) hermite through keyframes, axis 1 or 2 */
function sample(keys: Key[], p: number, axis: 1 | 2) {
  const n = keys.length
  if (p <= keys[0][0]) return keys[0][axis]
  if (p >= keys[n - 1][0]) return keys[n - 1][axis]
  let i = 0
  while (i < n - 2 && p > keys[i + 1][0]) i++
  const k0 = keys[Math.max(0, i - 1)]
  const k1 = keys[i]
  const k2 = keys[i + 1]
  const k3 = keys[Math.min(n - 1, i + 2)]
  const h = k2[0] - k1[0]
  const m1 = ((k2[axis] - k0[axis]) / (k2[0] - k0[0] || 1)) * h
  const m2 = ((k3[axis] - k1[axis]) / (k3[0] - k1[0] || 1)) * h
  const t = (p - k1[0]) / h
  const t2 = t * t
  const t3 = t2 * t
  return (2 * t3 - 3 * t2 + 1) * k1[axis] + (t3 - 2 * t2 + t) * m1 + (-2 * t3 + 3 * t2) * k2[axis] + (t3 - t2) * m2
}

/** Branded rolling tennis balls (Three.js), scrubbed by the parent's scroll progress. CSS fallback without WebGL, on phones and under reduced motion. */
export default function Balls3D({ progress, className = '' }: Props) {
  const wrap = useRef<HTMLDivElement>(null)
  const [fallback, setFallback] = useState(false)

  useEffect(() => {
    // purely decorative: phones get the static CSS balls instead of three.js + a WebGL context
    if (prefersReduced() || window.innerWidth < 744) {
      setFallback(true)
      return
    }
    let disposed = false
    let cleanup = () => {}

    const init = async () => {
      const THREE = await import('three')
      const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js')
      const el = wrap.current
      if (disposed || !el) return

      const small = window.innerWidth < 743
      let renderer: InstanceType<typeof THREE.WebGLRenderer>
      try {
        renderer = new THREE.WebGLRenderer({ antialias: !small, alpha: true, powerPreference: 'high-performance' })
      } catch {
        setFallback(true)
        return
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.NeutralToneMapping
      renderer.toneMappingExposure = 1
      renderer.setClearColor(0x000000, 0)
      renderer.domElement.setAttribute('aria-hidden', 'true')
      el.appendChild(renderer.domElement)

      const scene = new THREE.Scene()
      const pmrem = new THREE.PMREMGenerator(renderer)
      const room = new RoomEnvironment()
      const envRT = pmrem.fromScene(room, 0.04)
      scene.environment = envRT.texture
      const disposable = room as unknown as { dispose?: () => void }
      disposable.dispose?.()

      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
      camera.position.set(0, 0, 12)
      const key = new THREE.DirectionalLight(0xfff6df, 1.6)
      key.position.set(4, 6, 8)
      const rim = new THREE.DirectionalLight(0x10afc1, 0.9)
      rim.position.set(-6, -2, -4)
      scene.add(key, rim, new THREE.AmbientLight(0xffffff, 0.3))

      await document.fonts?.ready
      // the branded texture is a long canvas job: give it its own idle slot
      await new Promise<void>((r) => idle(r))
      if (disposed) {
        envRT.dispose()
        pmrem.dispose()
        renderer.dispose()
        renderer.domElement.remove()
        return
      }
      const css = getComputedStyle(document.documentElement)
      const fam = css.getPropertyValue('--font-display').trim() || 'Impact, sans-serif'
      const ink = css.getPropertyValue('--dark').trim() || '#06141a'

      const ballGeo = new THREE.SphereGeometry(1, small ? 32 : 64, small ? 24 : 48)
      const ballTex = new THREE.CanvasTexture(drawBrandedBall(fam, ink))
      ballTex.colorSpace = THREE.SRGBColorSpace
      ballTex.wrapS = THREE.RepeatWrapping
      ballTex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy())
      const ballMat = new THREE.MeshPhysicalMaterial({
        map: ballTex,
        roughness: 0.9,
        metalness: 0,
        sheen: 0.45,
        sheenRoughness: 0.75,
        sheenColor: new THREE.Color(0xe6ff4d),
        envMapIntensity: 0.5,
      })

      const baseTilt = Math.atan(SEAM_SLOPE)
      const cfgs = [...CONFIG.slice(0, small ? 1 : CONFIG.length), ...BALLS.slice(0, small ? 2 : BALLS.length)]
      const balls = cfgs.map((cfg) => {
        const holder = new THREE.Group()
        const align = new THREE.Group()
        const scaler = new THREE.Group()
        const counter = new THREE.Group()
        const mesh = new THREE.Mesh(ballGeo, ballMat)
        if (cfg.hero) mesh.quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), baseTilt)
        else mesh.quaternion.setFromEuler(new THREE.Euler(cfg.phase, cfg.phase * 1.7, cfg.phase * 0.6))
        counter.add(mesh)
        scaler.add(counter)
        align.add(scaler)
        holder.add(align)
        holder.visible = false
        scene.add(holder)
        return { holder, align, scaler, counter, mesh, cfg, px: 0, py: 0, had: false, stretch: 0, dir: 0, ox: 0, oy: 0, bx: 0, by: 0, br: 0, k: 1, tx: 0, ty: 0 }
      })

      const FOV = 32
      const CAM_Z = 12
      let halfH = 1
      let halfW = 1
      let radius = 1
      const resize = () => {
        const w = el.clientWidth || 1
        const h = el.clientHeight || 1
        renderer.setSize(w, h, false)
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        halfH = CAM_Z * Math.tan((FOV * Math.PI) / 360)
        halfW = halfH * camera.aspect
        radius = halfW * (small ? 0.22 : 0.15)
      }
      resize()
      const ro = new ResizeObserver(resize)
      ro.observe(el)

      let running = false
      let raf = 0
      let p = progress.current ?? 0
      let last = 0
      const axis = new THREE.Vector3()
      const dq = new THREE.Quaternion()
      const MAX_SQUASH = 0.06
      const damp = (rate: number, dt: number) => 1 - Math.exp(-rate * dt)
      const frame = (now: number) => {
        raf = 0
        if (!running) return
        const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60
        last = now
        const t = now / 1000
        p += ((progress.current ?? 0) - p) * damp(7, dt)
        const vis: typeof balls = []
        for (const b of balls) {
          const { holder, cfg } = b
          const on = p >= cfg.show[0] && p <= cfg.show[1]
          holder.visible = on
          if (!on) {
            b.had = false
            b.stretch = 0
            b.ox = 0
            b.oy = 0
            continue
          }
          const bz = cfg.hero ? 0 : 0.4
          const k = CAM_Z / (CAM_Z - bz)
          b.bx = sample(cfg.keys, p, 1) * halfW
          b.by = sample(cfg.keys, p, 2) * halfH
          b.br = radius * cfg.size
          b.k = k
          b.tx = b.bx * k
          b.ty = b.by * k
          vis.push(b)
        }
        for (let it = 0; it < 3; it++) {
          for (let i = 0; i < vis.length; i++) {
            for (let j = i + 1; j < vis.length; j++) {
              const A = vis[i]
              const B = vis[j]
              const ra = A.br * A.k
              const rb = B.br * B.k
              let dx = B.tx - A.tx
              let dy = B.ty - A.ty
              let d = Math.hypot(dx, dy)
              const need = (ra + rb) * 1.12
              if (d >= need) continue
              if (d < 1e-4) {
                dx = 0
                dy = 1
                d = 1
              }
              const push = need - d
              const ma = ra * ra
              const mb = rb * rb
              const sa = mb / (ma + mb)
              const sb = ma / (ma + mb)
              const nx = dx / d
              const ny = dy / d
              A.tx -= nx * push * sa
              A.ty -= ny * push * sa
              B.tx += nx * push * sb
              B.ty += ny * push * sb
            }
          }
          for (const b of vis) {
            const sr = b.br * b.k
            const limX = Math.max(halfW * b.k - sr * 0.3, Math.abs(b.bx * b.k))
            const limY = Math.max(halfH * b.k - sr * 0.3, Math.abs(b.by * b.k))
            b.tx = Math.max(-limX, Math.min(limX, b.tx))
            b.ty = Math.max(-limY, Math.min(limY, b.ty))
          }
        }
        const pushK = damp(9, dt)
        for (const b of vis) {
          b.ox += (b.tx / b.k - b.bx - b.ox) * pushK
          b.oy += (b.ty / b.k - b.by - b.oy) * pushK
        }
        for (const b of vis) {
          const { holder, align, scaler, counter, mesh, cfg } = b
          const x = b.bx
          const y = b.by
          const r = b.br
          holder.position.set(x + b.ox, y + b.oy + Math.sin(t * 0.9 + cfg.phase) * r * 0.03, cfg.hero ? 0 : 0.4)
          holder.scale.setScalar(r)

          let target = 0
          if (b.had) {
            const vx = x - b.px
            const vy = y - b.py
            const dist = Math.hypot(vx, vy)
            if (dist > 1e-6) {
              axis.set(-vy, vx, 0).normalize()
              dq.setFromAxisAngle(axis, dist / r)
              mesh.quaternion.premultiply(dq)
              const speed = dist / r / dt
              if (speed > 0.8) {
                let d = Math.atan2(vy, vx) - b.dir
                d = Math.atan2(Math.sin(d), Math.cos(d))
                if (d > Math.PI / 2) d -= Math.PI
                else if (d < -Math.PI / 2) d += Math.PI
                b.dir += d * damp(6, dt)
              }
              target = Math.min(MAX_SQUASH, speed * 0.01)
            }
          }
          b.stretch += (target - b.stretch) * damp(5, dt)
          align.rotation.z = b.dir
          counter.rotation.z = -b.dir
          scaler.scale.set(1 + b.stretch, 1 - b.stretch * 0.5, 1 - b.stretch * 0.5)
          b.px = x
          b.py = y
          b.had = true
        }
        renderer.render(scene, camera)
        raf = requestAnimationFrame(frame)
      }
      const io = new IntersectionObserver(([e]) => {
        running = e.isIntersecting
        if (running && !raf) raf = requestAnimationFrame(frame)
      })
      io.observe(el)

      cleanup = () => {
        running = false
        if (raf) cancelAnimationFrame(raf)
        io.disconnect()
        ro.disconnect()
        ballGeo.dispose()
        ballMat.dispose()
        ballTex.dispose()
        envRT.dispose()
        pmrem.dispose()
        renderer.dispose()
        renderer.forceContextLoss()
        renderer.domElement.remove()
      }
      if (disposed) cleanup()
    }

    // near the section -> after the preloader / curtain -> idle, then three.js
    const start = () => {
      whenRevealed().then(() => {
        if (disposed) return
        idle(() => {
          if (disposed) return
          init().catch(() => {
            if (!disposed) setFallback(true)
          })
        })
      })
    }

    const host = wrap.current
    let gate: IntersectionObserver | null = null
    if (host && 'IntersectionObserver' in window) {
      gate = new IntersectionObserver(
        ([e]) => {
          if (!e.isIntersecting) return
          gate?.disconnect()
          gate = null
          start()
        },
        { rootMargin: '150% 0px' },
      )
      gate.observe(host)
    } else {
      start()
    }

    return () => {
      disposed = true
      gate?.disconnect()
      cleanup()
    }
  }, [progress])

  return (
    <div ref={wrap} className={`balls ${className}`} aria-hidden="true">
      {fallback && (
        <div className="balls__fallback">
          <span className="ball-css ball-css--hero ball-css--a" />
          <span className="ball-css ball-css--hero ball-css--b" />
          <span className="ball-css ball-css--c" />
          <span className="ball-css ball-css--d" />
        </div>
      )}
    </div>
  )
}
