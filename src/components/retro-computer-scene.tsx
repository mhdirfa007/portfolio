'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, RoundedBox, Html, useProgress } from '@react-three/drei'
import { useEffect, useRef, useState, Suspense } from 'react'
import * as THREE from 'three'
import { ComputerScreen, ScreenState } from './computer-screen'
import { Hands } from './hands'
import { inputState, mousePosState, triggerMouseClick, type PressState } from '@/lib/input-state'

/* ----------------------------------------------------------------------------
   CRT Monitor
   - Body: RoundedBox (cream/beige plastic)
   - Front bezel: darker inset
   - Screen surface: dark plane (acts as the "frame" around the HTML content)
   - Screen content: drei <Html transform> rendering the live React DOM
     (boot screen → Windows 7 login → desktop → Word document)
   - Power button, knobs, brand badge, stand
---------------------------------------------------------------------------- */

function CRTMonitor({
  powered,
  screenState,
  floppyInserted,
  onPowerToggle,
  onLogin,
  onCloseDocument,
  onPrint,
  onOpenResume,
}: {
  powered: boolean
  screenState: ScreenState
  floppyInserted: boolean
  onPowerToggle: () => void
  onLogin: () => void
  onCloseDocument: () => void
  onPrint: () => void
  onOpenResume: () => void
}) {
  // Boot-up power-on animation (emissive flash → settle)
  const screenFaceMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const glassRef = useRef<THREE.MeshBasicMaterial>(null)
  const bootAnim = useRef(0)

  useFrame((_, delta) => {
    if (!screenFaceMatRef.current) return
    if (powered) {
      bootAnim.current = Math.min(1, bootAnim.current + delta * 1.4)
      const t = bootAnim.current
      // A bright phosphor flash that fades into the steady content glow
      const flash = Math.max(0, 1 - t * 2.6)
      const base = 0.15 + t * 0.25
      screenFaceMatRef.current.emissiveIntensity = base + flash * 2.2
      if (glassRef.current) glassRef.current.opacity = 0.04 - flash * 0.03
    } else {
      bootAnim.current = 0
      screenFaceMatRef.current.emissiveIntensity = 0
      if (glassRef.current) glassRef.current.opacity = 0.04
    }
  })

  return (
    <group>
      {/* ---------- Monitor body ---------- */}
      <RoundedBox args={[4.4, 3.6, 3.4]} radius={0.18} smoothness={6} castShadow receiveShadow>
        <meshStandardMaterial color="#d8d2c2" roughness={0.65} metalness={0.05} />
      </RoundedBox>

      {/* Front bezel inset (darker grey) */}
      <mesh position={[0, 0.05, 1.701]} castShadow>
        <boxGeometry args={[3.85, 3.05, 0.04]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.4} metalness={0.2} />
      </mesh>

      {/* Inner bezel (very dark) */}
      <mesh position={[0, 0.1, 1.715]}>
        <boxGeometry args={[3.55, 2.75, 0.03]} />
        <meshStandardMaterial color="#0c0c0c" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Dark screen surface (backing behind the HTML content) */}
      <mesh position={[0, 0.1, 1.725]}>
        <planeGeometry args={[3.4, 2.6]} />
        <meshStandardMaterial
          ref={screenFaceMatRef}
          color="#000000"
          emissive={powered ? '#ffb000' : '#000000'}
          emissiveIntensity={0}
          roughness={0.25}
          metalness={0}
          toneMapped={false}
        />
      </mesh>

      {/* ---------- Live screen content rendered as DOM in 3D space ---------- */}
      {/* drei <Html transform> renders the multi-state UI (boot/login/desktop/
          document) natively in 3D space. distanceFactor tuned so the
          1024×768 content fits exactly inside the 3.4×2.6 CRT screen frame.
          pointerEvents: 'auto' only on states that need interaction (login
          for the password field, document for the close button). Other states
          use 'none' so the wrapper doesn't block clicks on the CD case etc. */}
      <Html
        transform
        occlude={false}
        position={[0, 0.1, 1.74]}
        distanceFactor={1.5}
        wrapperClass="crt-screen-wrapper"
        style={{
          width: '1024px',
          height: '768px',
          pointerEvents:
            screenState === 'login' || screenState === 'document' || screenState === 'desktop'
              ? 'auto'
              : 'none',
          opacity: powered ? 1 : 0,
          transition: 'opacity 0.3s linear',
        }}
      >
        <ComputerScreen
          state={screenState}
          floppyInserted={floppyInserted}
          onLogin={onLogin}
          onCloseDocument={onCloseDocument}
          onPrint={onPrint}
          onOpenResume={onOpenResume}
        />
      </Html>

      {/* Curved glass reflection overlay (subtle highlight) */}
      <mesh position={[0, 0.1, 1.76]}>
        <planeGeometry args={[3.4, 2.6]} />
        <meshBasicMaterial
          ref={glassRef}
          color="#88ccff"
          transparent
          opacity={0.04}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      {/* Brand badge */}
      <mesh position={[0, -1.55, 1.72]}>
        <planeGeometry args={[0.5, 0.08]} />
        <meshStandardMaterial color="#666" roughness={0.6} />
      </mesh>

      {/* Power button (bottom-right) — clickable to toggle the monitor on/off.
          Visual: 3D meshes. Click handling: a 2D HTML <button> overlay
          positioned over the 3D button (more reliable than 3D raycast clicks
          across browsers, especially when OrbitControls is active). */}
      <group position={[1.55, -1.45, 1.78]}>
        {/* Power button housing (recessed ring around the button) */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.04]}>
          <cylinderGeometry args={[0.13, 0.13, 0.04, 24]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.5} metalness={0.3} />
        </mesh>
        {/* Button body (the part you press) */}
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.06, 24]} />
          <meshStandardMaterial color="#999" roughness={0.35} metalness={0.6} />
        </mesh>
        {/* Glowing LED ring around the button — shows power state */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
          <ringGeometry args={[0.085, 0.1, 24]} />
          <meshBasicMaterial
            color={powered ? '#33ff66' : '#330000'}
            transparent
            opacity={powered ? 0.95 : 0.3}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
        {/* Inner power LED dot */}
        <mesh position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.02, 24]} />
          <meshStandardMaterial
            color={powered ? '#33ff66' : '#441111'}
            emissive={powered ? '#33ff66' : '#220000'}
            emissiveIntensity={powered ? 2.5 : 0.1}
            toneMapped={false}
          />
        </mesh>
        {/* 2D HTML overlay button — positioned at the 3D button location and
            scales with the scene. pointerEvents: auto so it's actually
            clickable. Stops propagation so OrbitControls doesn't also rotate. */}
        <Html position={[0, 0.04, 0.06]} center distanceFactor={2.5}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              onPowerToggle()
            }}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label={powered ? 'Turn monitor off' : 'Turn monitor on'}
            style={{
              width: '60px',
              height: '60px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              margin: 0,
              outline: 'none',
              // Visual hint on hover: subtle ring
              borderRadius: '50%',
              transition: 'box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 20px 4px rgba(51, 255, 102, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none'
            }}
          />
        </Html>
      </group>

      {/* Monitor adjustment knobs (bottom-left) */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[-1.4 + i * 0.32, -1.45, 1.72]} castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.06, 20]} />
          <meshStandardMaterial color="#444" roughness={0.5} metalness={0.3} />
        </mesh>
      ))}

      {/* Monitor stand/neck */}
      <mesh position={[0, -2.1, 1.4]} castShadow>
        <boxGeometry args={[1.2, 0.4, 1.0]} />
        <meshStandardMaterial color="#c8c2b2" roughness={0.7} />
      </mesh>
      {/* Stand base */}
      <mesh position={[0, -2.45, 1.0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.0, 1.1, 0.18, 24]} />
        <meshStandardMaterial color="#b8b2a2" roughness={0.75} />
      </mesh>
    </group>
  )
}

/* ----------------------------------------------------------------------------
   Desktop tower (matching beige boxy computer case)
   Now properly sits ON the desk surface.
   Also exposes the floppy drive slot position so the FloppyDisk component
   can animate into it.
---------------------------------------------------------------------------- */

// Height of the tower — used by both DesktopTower and FloppyDisk to compute
// the floppy drive slot position in world space.
const TOWER_HEIGHT = 3.2
const TOWER_X = 3.7
const TOWER_Y = -2.65 + TOWER_HEIGHT / 2 // desk top + half height
const TOWER_Z = 0.4
// Floppy drive slot position (local within the tower group)
const FLOPPY_DRIVE_LOCAL_Y = 0.55
const FLOPPY_DRIVE_LOCAL_X = -0.2
// World position of the floppy drive slot face — must match the slot mesh
// drawn inside DesktopTower (local x=-0.2, y=0.55, front face z≈1.54).
const FLOPPY_DRIVE_WORLD: [number, number, number] = [
  TOWER_X + FLOPPY_DRIVE_LOCAL_X,
  TOWER_Y + FLOPPY_DRIVE_LOCAL_Y,
  TOWER_Z + 1.5, // flush at the front face of the drive bay
]

function DesktopTower({ floppyInserted }: { floppyInserted: boolean }) {
  return (
    <group position={[TOWER_X, TOWER_Y, TOWER_Z]}>
      {/* Main case */}
      <RoundedBox args={[1.8, TOWER_HEIGHT, 3.0]} radius={0.08} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial color="#d4cebc" roughness={0.7} metalness={0.05} />
      </RoundedBox>

      {/* CD-ROM drive bay */}
      <mesh position={[0, 1.1, 1.51]}>
        <boxGeometry args={[1.5, 0.3, 0.04]} />
        <meshStandardMaterial color="#9c9787" roughness={0.5} />
      </mesh>
      {/* CD tray line */}
      <mesh position={[0, 1.15, 1.53]}>
        <boxGeometry args={[1.4, 0.04, 0.02]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      {/* CD eject button */}
      <mesh position={[0.65, 1.05, 1.53]}>
        <boxGeometry args={[0.08, 0.04, 0.02]} />
        <meshStandardMaterial color="#666" />
      </mesh>

      {/* Floppy drive — the slot where the floppy disk gets inserted. */}
      <mesh position={[0, FLOPPY_DRIVE_LOCAL_Y, 1.51]}>
        <boxGeometry args={[1.0, 0.28, 0.04]} />
        <meshStandardMaterial color="#9c9787" roughness={0.5} />
      </mesh>
      {/* Floppy drive slot opening (dark rectangle) */}
      <mesh position={[-0.2, FLOPPY_DRIVE_LOCAL_Y, 1.535]}>
        <boxGeometry args={[0.52, 0.055, 0.02]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.5} />
      </mesh>
      {/* When a floppy is inserted, show the dark disk face flush in the slot */}
      {floppyInserted && (
        <mesh position={[-0.2, FLOPPY_DRIVE_LOCAL_Y + 0.04, 1.545]}>
          <boxGeometry args={[0.50, 0.20, 0.015]} />
          <meshStandardMaterial color="#222244" roughness={0.55} />
        </mesh>
      )}
      {/* Drive activity LED — glows amber when disk is inserted */}
      <mesh position={[0.35, FLOPPY_DRIVE_LOCAL_Y - 0.07, 1.535]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.02, 14]} />
        <meshStandardMaterial
          color={floppyInserted ? '#ffaa00' : '#442200'}
          emissive={floppyInserted ? '#ffaa00' : '#000'}
          emissiveIntensity={floppyInserted ? 2.0 : 0}
          toneMapped={false}
        />
      </mesh>
      {/* Eject button */}
      <mesh position={[0.4, FLOPPY_DRIVE_LOCAL_Y - 0.1, 1.535]}>
        <boxGeometry args={[0.06, 0.03, 0.02]} />
        <meshStandardMaterial color="#666" />
      </mesh>

      {/* Power button area */}
      <mesh position={[0, -0.1, 1.51]}>
        <boxGeometry args={[0.5, 0.3, 0.04]} />
        <meshStandardMaterial color="#7a7565" roughness={0.5} />
      </mesh>
      <mesh position={[-0.15, -0.1, 1.54]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.03, 20]} />
        <meshStandardMaterial
          color="#33ff66"
          emissive="#33ff66"
          emissiveIntensity={1.5}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0.15, -0.1, 1.54]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.03, 20]} />
        <meshStandardMaterial
          color="#ffaa33"
          emissive="#ffaa33"
          emissiveIntensity={0.8}
          toneMapped={false}
        />
      </mesh>

      {/* Front I/O panel — USB port + audio jacks (below the power LEDs) */}
      <mesh position={[0, -0.42, 1.51]}>
        <boxGeometry args={[0.5, 0.18, 0.04]} />
        <meshStandardMaterial color="#7a7565" roughness={0.5} />
      </mesh>
      {/* USB port (dark slot) */}
      <mesh position={[-0.13, -0.42, 1.54]}>
        <boxGeometry args={[0.16, 0.05, 0.02]} />
        <meshStandardMaterial color="#15151a" roughness={0.6} />
      </mesh>
      {/* Pink mic jack */}
      <mesh position={[0.05, -0.42, 1.54]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.03, 16]} />
        <meshStandardMaterial color="#e86aa0" roughness={0.4} />
      </mesh>
      {/* Green audio jack */}
      <mesh position={[0.16, -0.42, 1.54]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.03, 16]} />
        <meshStandardMaterial color="#7bc043" roughness={0.4} />
      </mesh>

      {/* Brand vent slats */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[0, -0.7 - i * 0.18, 1.51]}>
          <boxGeometry args={[1.4, 0.04, 0.02]} />
          <meshStandardMaterial color="#9c9787" />
        </mesh>
      ))}

      {/* Side ventilation */}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <mesh key={i} position={[0.91, 1.0 - i * 0.3, 0]}>
          <boxGeometry args={[0.02, 0.2, 2.2]} />
          <meshStandardMaterial color="#b8b2a2" />
        </mesh>
      ))}
    </group>
  )
}

/* ----------------------------------------------------------------------------
   Floppy disk — sits on the desk next to the keyboard.
   When clicked, plays a 3-phase animation:
     Phase 1 (0→0.35): lift off the desk + begin rotating upright
     Phase 2 (0.35→0.75): arc across toward the tower front face
     Phase 3 (0.75→1.0): slide straight into the drive slot
   At t=1 the disk is fully inside; the slot in DesktopTower shows the face.
---------------------------------------------------------------------------- */

function FloppyDisk({
  inserted,
  onInsert,
}: {
  inserted: boolean
  onInsert: () => void
}) {
  const meshRef = useRef<THREE.Group>(null)
  const progress = useRef(0)

  // Resting position: on the desk front-left of the keyboard, clearly visible.
  const DESK: [number, number, number] = [-2.3, -2.58, 3.3]
  // Final inserted position: in the slot on the tower front face.
  // The slot faces +Z, so the disk must be upright (rotated 90° around X).
  const SLOT = FLOPPY_DRIVE_WORLD

  useFrame((_, delta) => {
    if (!meshRef.current) return

    const target = inserted ? 1 : 0
    // Smooth approach: fast when far, slow as it settles into the slot.
    const speed = progress.current < 0.7 ? 0.018 : 0.032
    progress.current += (target - progress.current) * (speed + delta * 0.4)
    progress.current = Math.max(0, Math.min(1, progress.current))
    const p = progress.current

    // ---- Position ----
    // Phase 1 (0→0.35): lift up from desk + move slightly toward tower.
    // Phase 2 (0.35→0.75): arc to just in front of the drive slot.
    // Phase 3 (0.75→1.0): slide straight forward (–Z) into the slot.
    let x: number, y: number, z: number

    if (p <= 0.35) {
      const t = p / 0.35
      x = DESK[0] + (SLOT[0] - DESK[0]) * t * 0.2
      y = DESK[1] + t * 1.6           // lift up
      z = DESK[2] + (SLOT[2] - DESK[2]) * t * 0.2
    } else if (p <= 0.75) {
      const t = (p - 0.35) / 0.40
      const ease = t * t * (3 - 2 * t) // smooth-step
      x = DESK[0] + (SLOT[0] - DESK[0]) * (0.2 + ease * 0.8)
      y = (DESK[1] + 1.6) + (SLOT[1] - DESK[1] - 1.6) * ease
      z = DESK[2] + (SLOT[2] - DESK[2]) * (0.2 + ease * 0.8)
    } else {
      const t = (p - 0.75) / 0.25
      const ease = t * t * (3 - 2 * t)
      x = SLOT[0]
      y = SLOT[1]
      z = SLOT[2] + (1 - ease) * 0.55  // slide from 0.55 ahead into the slot
    }

    meshRef.current.position.set(x, y, z)

    // ---- Rotation ----
    // Resting: flat on desk (rotX=0). Inserted: upright to face the slot (rotX = -π/2).
    // Also spin slightly (rotY) while flying for a coin-toss feel.
    const targetRotX = inserted ? -Math.PI / 2 : 0
    const targetRotY = inserted ? 0 : 0.25
    const spinY = p < 0.75 ? Math.sin(p * Math.PI * 1.5) * 0.6 : 0
    meshRef.current.rotation.x += (targetRotX - meshRef.current.rotation.x) * 0.14
    meshRef.current.rotation.y += (targetRotY + spinY - meshRef.current.rotation.y) * 0.14

    // ---- Scale ---- shrink to fit the narrow drive slot as it inserts.
    const targetScale = p > 0.75 ? 1 - ((p - 0.75) / 0.25) * 0.5 : 1
    const s = meshRef.current.scale.x + (targetScale - meshRef.current.scale.x) * 0.2
    meshRef.current.scale.set(s, s, s)

    // Once fully seated, hide the flying disk — the drive's inserted-face mesh
    // (drawn in DesktopTower) takes over so it reads as "received by the tray".
    meshRef.current.visible = !(inserted && p > 0.97)
  })

  return (
    <group ref={meshRef} position={DESK}>
      {/* Floppy disk body */}
      <RoundedBox args={[1.0, 0.08, 1.0]} radius={0.03} smoothness={3} castShadow>
        <meshStandardMaterial color="#1a1a3a" roughness={0.6} metalness={0.1} />
      </RoundedBox>

      {/* Top label area */}
      <mesh position={[0, 0.045, 0]}>
        <boxGeometry args={[0.85, 0.01, 0.6]} />
        <meshStandardMaterial color="#f0f0e0" roughness={0.8} />
      </mesh>

      {/* Label text */}
      <Html position={[0, 0.06, 0]} center distanceFactor={2.5} pointerEvents="none">
        <div
          style={{
            width: '100px',
            textAlign: 'center',
            color: '#1a1a3a',
            fontFamily: '"Courier New", monospace',
            fontSize: '10px',
            pointerEvents: 'none',
            userSelect: 'none',
            lineHeight: '1.3',
          }}
        >
          <div style={{ fontWeight: 'bold', fontSize: '12px' }}>💾 RESUME</div>
          <div style={{ fontSize: '8px', opacity: 0.7 }}>MOHAMED IRFAN</div>
        </div>
      </Html>

      {/* Metal shutter */}
      <mesh position={[0, 0.045, -0.3]}>
        <boxGeometry args={[0.6, 0.02, 0.25]} />
        <meshStandardMaterial color="#aaa" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Click button — visible only when not yet inserted */}
      {!inserted && (
        <Html position={[0, 0.06, 0]} center distanceFactor={2.5}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              onInsert()
            }}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Insert floppy disk into CPU"
            title="Click to insert the floppy disk"
            style={{
              width: '110px',
              height: '110px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              margin: 0,
              outline: 'none',
              borderRadius: '6px',
              transition: 'box-shadow 0.2s',
              pointerEvents: 'auto',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 22px 5px rgba(255,176,0,0.55)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none'
            }}
          />
        </Html>
      )}
    </group>
  )
}

/* ----------------------------------------------------------------------------
   Digital desk clock — a small LCD clock on the desk showing the live system
   time (updates every second), styled like a glowing red 7-segment display.
---------------------------------------------------------------------------- */

function formatClock(): string {
  const d = new Date()
  let h = d.getHours()
  const m = d.getMinutes().toString().padStart(2, '0')
  const s = d.getSeconds().toString().padStart(2, '0')
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${h.toString().padStart(2, '0')}:${m}:${s} ${ampm}`
}

function DigitalClock() {
  const [time, setTime] = useState('12:00:00 AM')

  useEffect(() => {
    setTime(formatClock())
    const id = setInterval(() => setTime(formatClock()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <group position={[-3.25, -2.4, 2.9]} rotation={[-0.12, 0.3, 0]}>
      {/* Clock body */}
      <RoundedBox args={[1.1, 0.55, 0.4]} radius={0.05} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial color="#101014" roughness={0.6} metalness={0.2} />
      </RoundedBox>
      {/* Recessed display panel */}
      <mesh position={[0, 0.03, 0.205]}>
        <planeGeometry args={[0.92, 0.34]} />
        <meshStandardMaterial
          color="#220404"
          emissive="#330000"
          emissiveIntensity={0.6}
          roughness={0.3}
          toneMapped={false}
        />
      </mesh>

      {/* Live time readout */}
      <Html transform position={[0, 0.03, 0.215]} distanceFactor={1.5} pointerEvents="none">
        <div
          style={{
            width: '270px',
            textAlign: 'center',
            fontFamily: '"Courier New", monospace',
            fontWeight: 700,
            fontSize: '46px',
            letterSpacing: '2px',
            color: '#ff3b30',
            textShadow: '0 0 6px rgba(255,59,48,0.9), 0 0 14px rgba(255,59,48,0.5)',
            userSelect: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {time}
        </div>
      </Html>

      {/* Little feet */}
      <mesh position={[-0.35, -0.3, 0.08]} castShadow>
        <boxGeometry args={[0.12, 0.08, 0.12]} />
        <meshStandardMaterial color="#0a0a0c" roughness={0.7} />
      </mesh>
      <mesh position={[0.35, -0.3, 0.08]} castShadow>
        <boxGeometry args={[0.12, 0.08, 0.12]} />
        <meshStandardMaterial color="#0a0a0c" roughness={0.7} />
      </mesh>

      {/* Brand dot / alarm LED */}
      <mesh position={[0.42, -0.12, 0.205]}>
        <circleGeometry args={[0.02, 12]} />
        <meshStandardMaterial color="#33ff66" emissive="#33ff66" emissiveIntensity={1.5} toneMapped={false} />
      </mesh>
    </group>
  )
}

/* ----------------------------------------------------------------------------
   Desk surface
---------------------------------------------------------------------------- */

function DeskSurface() {
  // Four legs at the visible corners so the desk reads as grounded, not floating.
  const legPositions: [number, number, number][] = [
    [-5.5, -4.6, 4.2],
    [5.5, -4.6, 4.2],
    [-5.5, -4.6, -3.2],
    [5.5, -4.6, -3.2],
  ]
  return (
    <group>
      {/* Desk top — raised so it's visible alongside the monitor stand */}
      <mesh position={[0, -2.85, 0]} receiveShadow castShadow>
        <boxGeometry args={[20, 0.4, 12]} />
        <meshStandardMaterial color="#2a1f15" roughness={0.85} metalness={0.05} />
      </mesh>
      {/* Subtle desk reflection overlay */}
      <mesh position={[0, -2.63, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 12]} />
        <meshBasicMaterial
          color="#553311"
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* ---- Desk legs (so the table isn't floating) ---- */}
      {legPositions.map((p, i) => (
        <mesh key={i} position={p} castShadow receiveShadow>
          <boxGeometry args={[0.55, 3.4, 0.55]} />
          <meshStandardMaterial color="#241a10" roughness={0.9} metalness={0.03} />
        </mesh>
      ))}
      {/* Floor to ground the legs visually + catch a soft shadow */}
      <mesh position={[0, -6.35, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 30]} />
        <meshStandardMaterial color="#120d08" roughness={1} metalness={0} />
      </mesh>
    </group>
  )
}

/* ----------------------------------------------------------------------------
   Retro keyboard — beige, matches the monitor + tower.
   Each key is a separate <Key> component that watches the shared inputState
   and animates (dips down) when its corresponding physical key is pressed.
---------------------------------------------------------------------------- */

function Keyboard() {
  // Same layout as the 3D keyboard in input-state.ts (kept in sync)
  const keyRows = [
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'BSP'],
    ['TAB', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
    ['CAP', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'ENT', ''],
    ['SHF', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'SHF', '', ''],
    ['CTL', 'WIN', 'ALT', 'SPC', 'SPC', 'SPC', 'SPC', 'SPC', 'SPC', 'ALT', 'WIN', 'MNU', 'CTL', ''],
  ]

  return (
    <group position={[0, -2.55, 2.6]}>
      {/* Keyboard base — slightly tilted toward the user */}
      <group rotation={[-0.08, 0, 0]}>
        <RoundedBox args={[4.6, 0.25, 1.5]} radius={0.04} smoothness={3} castShadow receiveShadow>
          <meshStandardMaterial color="#d4cebc" roughness={0.7} metalness={0.05} />
        </RoundedBox>

        {/* Riser feet at the back */}
        <mesh position={[-1.9, 0.18, -0.65]} castShadow>
          <boxGeometry args={[0.4, 0.18, 0.12]} />
          <meshStandardMaterial color="#aaa49a" />
        </mesh>
        <mesh position={[1.9, 0.18, -0.65]} castShadow>
          <boxGeometry args={[0.4, 0.18, 0.12]} />
          <meshStandardMaterial color="#aaa49a" />
        </mesh>

        {/* Keys */}
        <group position={[0, 0.14, 0]}>
          {keyRows.map((row, rIdx) =>
            row.map((k, cIdx) => {
              if (k === '') return null
              // Special widths
              const isSpace = k === 'SPC'
              const isWide = ['BSP', 'TAB', 'CAP', 'ENT', 'SHF', 'CTL', 'WIN', 'ALT', 'MNU'].includes(k)
              const w = isSpace ? 0.32 : isWide ? 0.32 : 0.22
              const h = 0.18
              const gap = 0.04
              // Calculate X position based on cumulative width
              let x = 0
              for (let i = 0; i < cIdx; i++) {
                const pk = row[i]
                if (pk === '') continue
                const pw = pk === 'SPC' ? 0.32 : ['BSP', 'TAB', 'CAP', 'ENT', 'SHF', 'CTL', 'WIN', 'ALT', 'MNU'].includes(pk) ? 0.32 : 0.22
                x += pw + gap
              }
              // Center the row
              const rowWidth = row.filter(k => k !== '').reduce((acc, k) => acc + (k === 'SPC' ? 0.32 : ['BSP', 'TAB', 'CAP', 'ENT', 'SHF', 'CTL', 'WIN', 'ALT', 'MNU'].includes(k) ? 0.32 : 0.22) + gap, 0) - gap
              x -= rowWidth / 2
              const z = -0.55 + rIdx * 0.27
              return (
                <Key
                  key={`${rIdx}-${cIdx}`}
                  keyId={k}
                  position={[x + w / 2, 0, z]}
                  width={w}
                  height={h}
                  // For SPC (spacebar), only the first SPC instance responds to
                  // presses — otherwise all 6 spacebar segments would dip together.
                  // We pass row/col so each Key can decide if it's the "active" one.
                  row={rIdx}
                  col={cIdx}
                />
              )
            })
          )}
        </group>

        {/* Brand badge */}
        <mesh position={[0, 0.13, 0.65]}>
          <planeGeometry args={[0.5, 0.06]} />
          <meshStandardMaterial color="#888" roughness={0.6} />
        </mesh>
      </group>
    </group>
  )
}

/* Single key — watches inputState and dips down when its physical key is
   pressed. The dip is a short ~150ms animation driven by useFrame. */
function Key({
  keyId,
  position,
  width,
  height,
  row,
  col,
}: {
  keyId: string
  position: [number, number, number]
  width: number
  height: number
  row: number
  col: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const baseY = position[1]

  useFrame(() => {
    if (!meshRef.current) return
    const press: PressState = inputState.current
    if (!press.keyId) {
      meshRef.current.position.y = baseY
      return
    }
    // Check if this key is the one that was pressed.
    // For SPC (spacebar), only the FIRST SPC instance (row 4, col 3) animates.
    const isMyKey = press.keyId.toLowerCase() === keyId.toLowerCase()
    const isMySpaceInstance = keyId === 'SPC' && row === 4 && col === 3
    const isPressed = isMyKey && (keyId !== 'SPC' || isMySpaceInstance)

    if (!isPressed) {
      meshRef.current.position.y = baseY
      return
    }

    // Animate: dip down by 0.04 for 150ms, then return.
    const elapsed = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - press.timestamp
    const duration = 150
    if (elapsed > duration) {
      meshRef.current.position.y = baseY
      return
    }
    // Half-sine curve: starts at 0, dips to -0.04 at midpoint, returns to 0
    const t = elapsed / duration
    const dip = Math.sin(t * Math.PI) * 0.04
    meshRef.current.position.y = baseY - dip
  })

  return (
    <mesh ref={meshRef} position={position} castShadow>
      <boxGeometry args={[width, 0.1, height]} />
      <meshStandardMaterial color="#f0ebde" roughness={0.55} />
    </mesh>
  )
}

/* ----------------------------------------------------------------------------
   Retro ball mouse + mousepad — CLICKABLE for system navigation.
   The 3D mouse FOLLOWS the user's real cursor movement (within the bounds of
   the mousepad) and has a click animation (presses down when clicked).
   Clicking the 3D mouse is the primary navigation tool for the system:
     - On desktop  → click to insert CD → Word document opens
     - On document → click to close → back to desktop
     - On other states → no-op
---------------------------------------------------------------------------- */

function RetroMouse({ onMouseClick }: { onMouseClick: () => void }) {
  // Mousepad center (static — does NOT move with cursor)
  const padX = 2.6
  const padY = -2.55
  const padZ = 2.6
  // Mousepad bounds — the mouse body can move within this radius on the pad
  const padRadius = 0.55
  // Click animation state
  const [clickAnim, setClickAnim] = useState(0)
  // Refs: mouseGroupRef = the moving mouse (follows cursor), mouseBodyRef = inner press-down group
  const mouseGroupRef = useRef<THREE.Group>(null)
  const mouseBodyRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (!mouseGroupRef.current) return
    // Read the shared cursor state and translate it to a position on the mousepad.
    // The cursor is normalized to -1..1 in both axes (set up in page.tsx).
    const cursor = mousePosState.current
    if (cursor.active) {
      // Map cursor x (-1..1) → mousepad x offset
      const targetX = padX + cursor.x * padRadius
      // Map cursor y (-1..1) → mousepad z offset
      // (cursor y is flipped in page.tsx: +y = up = -z on the pad)
      const targetZ = padZ - cursor.y * padRadius * 0.75
      // Smooth lerp toward the target position
      mouseGroupRef.current.position.x += (targetX - mouseGroupRef.current.position.x) * 0.18
      mouseGroupRef.current.position.z += (targetZ - mouseGroupRef.current.position.z) * 0.18
      // Slight tilt based on movement direction (gives a "swipe" feel)
      const dx = mouseGroupRef.current.position.x - padX
      const dz = mouseGroupRef.current.position.z - padZ
      mouseGroupRef.current.rotation.z = -dx * 0.25
      mouseGroupRef.current.rotation.x = dz * 0.25
    } else {
      // Cursor inactive — return to center
      mouseGroupRef.current.position.x += (padX - mouseGroupRef.current.position.x) * 0.1
      mouseGroupRef.current.position.z += (padZ - mouseGroupRef.current.position.z) * 0.1
      mouseGroupRef.current.rotation.z += (0 - mouseGroupRef.current.rotation.z) * 0.1
      mouseGroupRef.current.rotation.x += (0 - mouseGroupRef.current.rotation.x) * 0.1
    }

    // Click animation — press the mouse body down briefly
    if (mouseBodyRef.current) {
      const targetY = -clickAnim * 0.05
      mouseBodyRef.current.position.y += (targetY - mouseBodyRef.current.position.y) * 0.4
    }
  })

  // Decay the click animation via a separate effect (avoids setState in useFrame loop)
  useEffect(() => {
    if (clickAnim <= 0) return
    const t = setTimeout(() => setClickAnim((c) => Math.max(0, c - 0.12)), 16)
    return () => clearTimeout(t)
  }, [clickAnim])

  const handleClick = () => {
    setClickAnim(1) // trigger the press-down animation
    triggerMouseClick() // pulse the shared signal so the cartoon hand presses
    onMouseClick()
  }

  return (
    <>
      {/* ---- Mousepad (STATIC — does not move with cursor) ---- */}
      <group position={[padX, padY, padZ]}>
        <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[1.8, 1.5]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.95} />
        </mesh>
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.86, 0.9, 32]} />
          <meshBasicMaterial color="#332211" side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* ---- Mouse cord: a curved wire running from the mouse back to the
          tower (so it reads as a wired mouse). Static tube on the desk. ---- */}
      <mesh castShadow>
        <tubeGeometry
          args={[
            new THREE.CatmullRomCurve3([
              new THREE.Vector3(padX - 0.1, padY + 0.12, padZ - 0.35),
              new THREE.Vector3(padX + 0.35, padY + 0.04, padZ - 0.9),
              new THREE.Vector3(padX + 0.7, padY + 0.02, padZ - 1.6),
              new THREE.Vector3(TOWER_X - 0.55, padY + 0.05, TOWER_Z + 1.7),
              new THREE.Vector3(TOWER_X - 0.3, padY + 0.25, TOWER_Z + 1.5),
            ]),
            40,
            0.035,
            8,
            false,
          ]}
        />
        <meshStandardMaterial color="#3a3a3a" roughness={0.7} />
      </mesh>

      {/* ---- Mouse body (MOVES with cursor + presses down on click) ---- */}
      <group ref={mouseGroupRef} position={[padX, padY, padZ]} rotation={[0, -0.2, 0]}>
        {/* Inner group for the press-down click animation */}
        <group ref={mouseBodyRef}>
          {/* Mouse body — egg shape (squashed sphere) */}
          <mesh position={[0, 0.18, 0]} scale={[0.6, 0.85, 1.0]} castShadow>
            <sphereGeometry args={[0.45, 24, 24]} />
            <meshStandardMaterial color="#e8e2d2" roughness={0.5} metalness={0.05} />
          </mesh>

          {/* Button split line (groove down the middle) */}
          <mesh position={[0, 0.42, 0.15]} rotation={[0.3, 0, 0]}>
            <boxGeometry args={[0.015, 0.01, 0.5]} />
            <meshStandardMaterial color="#999" />
          </mesh>

          {/* Left + right button highlights */}
          <mesh position={[-0.15, 0.42, 0.18]} rotation={[0.3, 0, 0]}>
            <boxGeometry args={[0.25, 0.005, 0.4]} />
            <meshStandardMaterial color="#f4eedf" roughness={0.45} />
          </mesh>
          <mesh position={[0.15, 0.42, 0.18]} rotation={[0.3, 0, 0]}>
            <boxGeometry args={[0.25, 0.005, 0.4]} />
            <meshStandardMaterial color="#f4eedf" roughness={0.45} />
          </mesh>

          {/* Mouse ball (visible from below front — peek through cutout) */}
          <mesh position={[0, 0.08, 0.15]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color="#aa3322" roughness={0.3} metalness={0.1} />
          </mesh>

          {/* Cord — going from back of mouse toward tower */}
          <mesh position={[-0.05, 0.3, -0.4]} rotation={[0.3, 0, 0.2]} castShadow>
            <cylinderGeometry args={[0.025, 0.025, 0.6, 12]} />
            <meshStandardMaterial color="#666" roughness={0.7} />
          </mesh>
          <mesh position={[-0.3, 0.2, -0.7]} rotation={[1.2, 0, 0.5]} castShadow>
            <cylinderGeometry args={[0.025, 0.025, 0.5, 12]} />
            <meshStandardMaterial color="#666" roughness={0.7} />
          </mesh>
        </group>

        {/* Clickable HTML overlay button covering the mouse body.
            Positioned in the moving group so it follows the mouse. */}
        <Html position={[0, 0.3, 0.15]} center distanceFactor={2.5}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              handleClick()
            }}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Click mouse — navigate system"
            title="Click to navigate the system"
            style={{
              width: '90px',
              height: '90px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              margin: 0,
              outline: 'none',
              borderRadius: '50%',
              transition: 'box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 24px 6px rgba(255, 176, 0, 0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none'
            }}
          />
        </Html>
      </group>
    </>
  )
}


/* ----------------------------------------------------------------------------
   Inkjet printer — sits on the desk to the left, mirroring the tower.
   When `printing` is true, a sheet of paper rises out of the top output slot
   and tilts forward (the resume being dispensed).
---------------------------------------------------------------------------- */

function Printer({ printing }: { printing: boolean }) {
  const paperRef = useRef<THREE.Group>(null)
  const progress = useRef(0)

  useFrame(() => {
    if (!paperRef.current) return
    const goal = printing ? 1 : 0
    progress.current += (goal - progress.current) * 0.06
    const p = progress.current
    // Paper rises from inside the printer (y 0 → 1.1) and eases forward (z).
    paperRef.current.position.y = 0.35 + p * 1.25
    paperRef.current.position.z = 0.2 + p * 0.35
    paperRef.current.rotation.x = -0.15 - p * 0.25
    // Scale the visible sheet up a touch as it emerges
    const s = 0.6 + p * 0.4
    paperRef.current.scale.set(1, s, 1)
  })

  return (
    <group position={[-3.7, -2.65, 0.7]}>
      {/* Printer base body */}
      <RoundedBox args={[2.2, 0.9, 1.9]} radius={0.1} smoothness={4} position={[0, 0.45, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#d8d2c2" roughness={0.7} metalness={0.05} />
      </RoundedBox>
      {/* Sloped top with the paper output slot */}
      <mesh position={[0, 0.92, -0.1]} rotation={[-0.25, 0, 0]} castShadow>
        <boxGeometry args={[2.0, 0.1, 1.2]} />
        <meshStandardMaterial color="#cfc9b8" roughness={0.7} />
      </mesh>
      {/* Output slot (dark) */}
      <mesh position={[0, 0.98, 0.45]}>
        <boxGeometry args={[1.7, 0.04, 0.12]} />
        <meshStandardMaterial color="#15151a" roughness={0.6} />
      </mesh>
      {/* Control panel + power LED */}
      <mesh position={[0.7, 0.46, 0.96]}>
        <boxGeometry args={[0.5, 0.18, 0.02]} />
        <meshStandardMaterial color="#7a7565" roughness={0.5} />
      </mesh>
      <mesh position={[0.6, 0.46, 0.98]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.02, 16]} />
        <meshStandardMaterial
          color={printing ? '#33ff66' : '#1f7a3a'}
          emissive={printing ? '#33ff66' : '#0a2a14'}
          emissiveIntensity={printing ? 2.2 : 0.3}
          toneMapped={false}
        />
      </mesh>
      {/* Front paper tray lip */}
      <mesh position={[0, 0.12, 1.0]} rotation={[0.5, 0, 0]}>
        <boxGeometry args={[1.8, 0.06, 0.5]} />
        <meshStandardMaterial color="#c8c2b2" roughness={0.7} />
      </mesh>

      {/* ---- The dispensing paper sheet ---- */}
      <group ref={paperRef} position={[0, 0.35, 0.2]}>
        <mesh position={[0, 0.6, 0]} castShadow>
          <planeGeometry args={[1.5, 1.9]} />
          <meshStandardMaterial color="#fdfdfa" roughness={0.85} side={THREE.DoubleSide} />
        </mesh>
        {/* Faint printed lines hint */}
        {printing &&
          [0, 1, 2, 3, 4].map((i) => (
            <mesh key={i} position={[0, 1.1 - i * 0.22, 0.001]}>
              <planeGeometry args={[1.1, 0.025]} />
              <meshBasicMaterial color="#b8b8c0" />
            </mesh>
          ))}
      </group>
    </group>
  )
}

/* ----------------------------------------------------------------------------
   Hanging ceiling light — a bulb on a cord above the desk with a pull string.
   Click the string (or bulb) to toggle the light on/off. When on, the bulb
   glows and a warm point light illuminates the whole scene.
---------------------------------------------------------------------------- */

function HangingLight({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  const stringRef = useRef<THREE.Group>(null)
  const tug = useRef(0)
  const filamentRef = useRef<THREE.MeshStandardMaterial>(null)
  const glassRef = useRef<THREE.MeshStandardMaterial>(null)

  const handlePull = () => {
    tug.current = 1 // trigger the pull animation
    onToggle()
  }

  useFrame((_, delta) => {
    // Decay the tug + animate the pull string downward then back.
    tug.current = Math.max(0, tug.current - delta * 3)
    if (stringRef.current) {
      const pull = Math.sin(tug.current * Math.PI) * 0.18
      stringRef.current.position.y = -0.55 - pull
      stringRef.current.scale.y = 1 + pull * 1.6
    }
    // Bulb glow lerp
    if (filamentRef.current) {
      const target = on ? 3.5 : 0.0
      filamentRef.current.emissiveIntensity += (target - filamentRef.current.emissiveIntensity) * 0.2
    }
    if (glassRef.current) {
      const target = on ? 1.4 : 0.0
      glassRef.current.emissiveIntensity += (target - glassRef.current.emissiveIntensity) * 0.2
    }
  })

  // Bulb hangs above and slightly in front of the monitor.
  const BULB: [number, number, number] = [-0.4, 3.7, 1.2]

  return (
    <group position={BULB}>
      {/* Cord going up out of frame */}
      <mesh position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 3.2, 8]} />
        <meshStandardMaterial color="#222" roughness={0.8} />
      </mesh>

      {/* Lamp socket / fixture */}
      <mesh position={[0, 0.18, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.16, 0.3, 16]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.5} metalness={0.6} />
      </mesh>

      {/* Glass bulb */}
      <mesh position={[0, -0.05, 0]} castShadow>
        <sphereGeometry args={[0.26, 24, 24]} />
        <meshStandardMaterial
          ref={glassRef}
          color={on ? '#fff3c0' : '#cfcabd'}
          emissive="#ffcf66"
          emissiveIntensity={0}
          roughness={0.15}
          metalness={0.1}
          transparent
          opacity={0.85}
          toneMapped={false}
        />
      </mesh>
      {/* Filament core (bright when on) */}
      <mesh position={[0, -0.05, 0]}>
        <sphereGeometry args={[0.11, 16, 16]} />
        <meshStandardMaterial
          ref={filamentRef}
          color="#fff0b0"
          emissive="#ffd060"
          emissiveIntensity={0}
          toneMapped={false}
        />
      </mesh>

      {/* The warm light it casts (only meaningful when on; intensity tied to glow) */}
      <pointLight
        position={[0, -0.2, 0]}
        color="#ffdf9e"
        intensity={on ? 65 : 0}
        distance={22}
        decay={2}
        castShadow
      />

      {/* ---- Pull string hanging below the bulb ---- */}
      <group ref={stringRef} position={[0.16, -0.55, 0]}>
        {/* string */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.7, 6]} />
          <meshStandardMaterial color="#d8d2b8" roughness={0.9} />
        </mesh>
        {/* bead handle at the end */}
        <mesh position={[0, -0.4, 0]} castShadow>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial color="#c9a23a" roughness={0.5} metalness={0.3} />
        </mesh>
        {/* Clickable overlay on the bead */}
        <Html position={[0, -0.4, 0]} center distanceFactor={3}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              handlePull()
            }}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Pull the light string"
            title="Pull to turn the light on/off"
            style={{
              width: '46px',
              height: '70px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              margin: 0,
              outline: 'none',
              borderRadius: '8px',
              transition: 'box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 18px 4px rgba(255,207,102,0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none'
            }}
          />
        </Html>
      </group>
    </group>
  )
}

/* ----------------------------------------------------------------------------
   Lighting
---------------------------------------------------------------------------- */

function Lighting({ lightOn }: { lightOn: boolean }) {
  return (
    <>
      <ambientLight intensity={lightOn ? 0.35 : 0.12} color="#fff6e0" />
      {/* Warm key light from above-front */}
      <directionalLight
        position={[5, 8, 6]}
        intensity={lightOn ? 1.2 : 0.45}
        color="#fff1d0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.1}
        shadow-camera-far={30}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      {/* Cool fill light from the side */}
      <pointLight position={[-6, 2, -4]} intensity={lightOn ? 30 : 14} color="#5577ff" distance={20} decay={2} />
      {/* Amber rim light from behind, gives the CRT that glow */}
      <pointLight position={[0, 1, -5]} intensity={15} color="#ff9b00" distance={12} decay={2} />
    </>
  )
}

/* ----------------------------------------------------------------------------
   Loader
---------------------------------------------------------------------------- */

function SceneLoader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="font-mono text-xs text-amber-400">LOADING... {progress.toFixed(0)}%</div>
    </Html>
  )
}

/* ----------------------------------------------------------------------------
   Main exported scene
---------------------------------------------------------------------------- */

export default function RetroComputerScene({
  powered,
  screenState,
  floppyInserted,
  printing,
  lightOn,
  onPowerToggle,
  onLogin,
  onCloseDocument,
  onInsertFloppy,
  onMouseClick,
  onPrint,
  onToggleLight,
  onOpenResume,
}: {
  powered: boolean
  screenState: ScreenState
  floppyInserted: boolean
  printing: boolean
  lightOn: boolean
  onPowerToggle: () => void
  onLogin: () => void
  onCloseDocument: () => void
  onInsertFloppy: () => void
  onMouseClick: () => void
  onPrint: () => void
  onToggleLight: () => void
  onOpenResume: () => void
}) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 0.4, 9.5], fov: 42, near: 0.1, far: 100 }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
      }}
      dpr={[1, 2]}
      style={{ background: 'transparent' }}
    >
      <Suspense fallback={<SceneLoader />}>
        <Lighting lightOn={lightOn} />

        <group position={[0, 0, 0]}>
          <HangingLight on={lightOn} onToggle={onToggleLight} />
          <CRTMonitor
            powered={powered}
            screenState={screenState}
            floppyInserted={floppyInserted}
            onPowerToggle={onPowerToggle}
            onLogin={onLogin}
            onCloseDocument={onCloseDocument}
            onPrint={onPrint}
            onOpenResume={onOpenResume}
          />
          <DesktopTower floppyInserted={floppyInserted} />
          <Printer printing={printing} />
          <DeskSurface />
          <DigitalClock />
          <Keyboard />
          <RetroMouse onMouseClick={onMouseClick} />
          <FloppyDisk inserted={floppyInserted} onInsert={onInsertFloppy} />
          <Hands />
        </group>

        <OrbitControls
          enablePan={false}
          minDistance={4.5}
          maxDistance={16}
          minPolarAngle={Math.PI * 0.18}
          maxPolarAngle={Math.PI * 0.72}
          minAzimuthAngle={-Math.PI * 0.6}
          maxAzimuthAngle={Math.PI * 0.6}
          enableDamping
          dampingFactor={0.08}
          target={[0, -0.4, 0]}
        />
      </Suspense>
    </Canvas>
  )
}
