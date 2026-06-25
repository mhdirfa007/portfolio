'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, RoundedBox, Html, useProgress } from '@react-three/drei'
import { useEffect, useRef, useState, Suspense } from 'react'
import * as THREE from 'three'
import { ComputerScreen, ScreenState } from './computer-screen'
import { CDCase } from './cd-case'
import { inputState, mousePosState, type PressState } from '@/lib/input-state'

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
  onPowerToggle,
  onLogin,
  onCloseDocument,
}: {
  powered: boolean
  screenState: ScreenState
  onPowerToggle: () => void
  onLogin: () => void
  onCloseDocument: () => void
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
        distanceFactor={1.55}
        wrapperClass="crt-screen-wrapper"
        style={{
          width: '1024px',
          height: '768px',
          pointerEvents: screenState === 'login' || screenState === 'document' ? 'auto' : 'none',
          opacity: powered ? 1 : 0,
          transition: 'opacity 0.3s linear',
        }}
      >
        <ComputerScreen
          state={screenState}
          onLogin={onLogin}
          onCloseDocument={onCloseDocument}
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
const TOWER_X = 3.0
const TOWER_Y = -2.65 + TOWER_HEIGHT / 2 // desk top + half height
const TOWER_Z = 0.4
// Floppy drive slot position (local Y within the tower)
const FLOPPY_DRIVE_LOCAL_Y = 0.55
// World position of the floppy drive slot (where the floppy flies into)
const FLOPPY_DRIVE_WORLD: [number, number, number] = [
  TOWER_X,
  TOWER_Y + FLOPPY_DRIVE_LOCAL_Y,
  TOWER_Z + 1.74, // just in front of the front face
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

      {/* Floppy drive — the slot where the floppy disk gets inserted.
          When floppyInserted is true, show the disk inside the slot. */}
      <mesh position={[0, FLOPPY_DRIVE_LOCAL_Y, 1.51]}>
        <boxGeometry args={[1.0, 0.28, 0.04]} />
        <meshStandardMaterial color="#9c9787" roughness={0.5} />
      </mesh>
      {/* Floppy drive slot opening (dark rectangle) */}
      <mesh position={[-0.2, FLOPPY_DRIVE_LOCAL_Y, 1.53]}>
        <boxGeometry args={[0.5, 0.04, 0.02]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* When a floppy is inserted, show the disk face in the slot */}
      {floppyInserted && (
        <mesh position={[-0.2, FLOPPY_DRIVE_LOCAL_Y + 0.05, 1.54]}>
          <boxGeometry args={[0.48, 0.18, 0.01]} />
          <meshStandardMaterial color="#222244" roughness={0.6} />
        </mesh>
      )}
      {/* Floppy eject button */}
      <mesh position={[0.4, FLOPPY_DRIVE_LOCAL_Y - 0.1, 1.53]}>
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
   Floppy disk — sits on the desk next to the tower.
   When clicked, animates flying into the tower's floppy drive slot.
   After insertion, the disk stays in the drive (visible in the slot).
---------------------------------------------------------------------------- */

function FloppyDisk({
  inserted,
  onInsert,
}: {
  inserted: boolean
  onInsert: () => void
}) {
  const meshRef = useRef<THREE.Group>(null)
  // The resting position on the desk — to the LEFT of the mouse, in front of
  // the tower, clearly visible. Mouse is at (2.6, -2.55, 2.6), tower at (3.0, ..., 0.4).
  // Place floppy at x=1.8 so it's between the keyboard and the mouse.
  // y=-2.6 puts it just above the desk top (desk top at y=-2.65).
  const deskPos: [number, number, number] = [1.8, -2.58, 2.8]
  // The inserted position (inside the floppy drive slot)
  const insertedPos = FLOPPY_DRIVE_WORLD

  useFrame(() => {
    if (!meshRef.current) return
    const goal = inserted ? insertedPos : deskPos
    // Lerp toward the goal position for smooth animation
    meshRef.current.position.x += (goal[0] - meshRef.current.position.x) * 0.12
    meshRef.current.position.y += (goal[1] - meshRef.current.position.y) * 0.12
    meshRef.current.position.z += (goal[2] - meshRef.current.position.z) * 0.12
    // Rotate to face the drive when inserted
    const targetRotY = inserted ? 0 : 0.3
    meshRef.current.rotation.y += (targetRotY - meshRef.current.rotation.y) * 0.12
  })

  return (
    <group ref={meshRef} position={deskPos}>
      {/* Floppy disk body — classic 3.5" floppy, lying flat on the desk.
          Made larger (1.0 × 1.0) so it's clearly visible. */}
      <RoundedBox args={[1.0, 0.08, 1.0]} radius={0.03} smoothness={3} castShadow>
        <meshStandardMaterial color="#1a1a3a" roughness={0.6} metalness={0.1} />
      </RoundedBox>

      {/* Top label area */}
      <mesh position={[0, 0.05, 0]}>
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

      {/* Metal shutter (the sliding metal piece at the top) */}
      <mesh position={[0, 0.05, -0.3]}>
        <boxGeometry args={[0.6, 0.02, 0.25]} />
        <meshStandardMaterial color="#aaa" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Click button — covers the floppy, captures clicks.
          Only active when NOT inserted. */}
      {!inserted && (
        <Html position={[0, 0.06, 0]} center distanceFactor={2.5}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              onInsert()
            }}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Insert floppy disk"
            title="Click to insert the floppy disk"
            style={{
              width: '100px',
              height: '100px',
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
              e.currentTarget.style.boxShadow = '0 0 20px 4px rgba(255, 176, 0, 0.5)'
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
   Desk surface
---------------------------------------------------------------------------- */

function DeskSurface() {
  return (
    <group>
      {/* Desk top — raised so it's visible alongside the monitor stand */}
      <mesh position={[0, -2.85, 0]} receiveShadow>
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
   Lighting
---------------------------------------------------------------------------- */

function Lighting() {
  return (
    <>
      <ambientLight intensity={0.35} color="#fff6e0" />
      {/* Warm key light from above-front */}
      <directionalLight
        position={[5, 8, 6]}
        intensity={1.2}
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
      <pointLight position={[-6, 2, -4]} intensity={30} color="#5577ff" distance={20} decay={2} />
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
  onPowerToggle,
  onLogin,
  onInsertCD,
  onCloseDocument,
  onInsertFloppy,
  onMouseClick,
}: {
  powered: boolean
  screenState: ScreenState
  floppyInserted: boolean
  onPowerToggle: () => void
  onLogin: () => void
  onInsertCD: () => void
  onCloseDocument: () => void
  onInsertFloppy: () => void
  onMouseClick: () => void
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
        <Lighting />

        <group position={[0, 0, 0]}>
          <CRTMonitor
            powered={powered}
            screenState={screenState}
            onPowerToggle={onPowerToggle}
            onLogin={onLogin}
            onCloseDocument={onCloseDocument}
          />
          <DesktopTower floppyInserted={floppyInserted} />
          <DeskSurface />
          <Keyboard />
          <RetroMouse onMouseClick={onMouseClick} />
          <CDCase onInsert={onInsertCD} />
          <FloppyDisk inserted={floppyInserted} onInsert={onInsertFloppy} />
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
