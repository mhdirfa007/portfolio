'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, RoundedBox, Html, useProgress } from '@react-three/drei'
import { useEffect, useMemo, useRef, useState, Suspense } from 'react'
import * as THREE from 'three'
import { ResumeScreen } from './resume-screen'

/* ----------------------------------------------------------------------------
   CRT Monitor
   - Body: RoundedBox (cream/beige plastic)
   - Front bezel: darker inset
   - Screen surface: dark plane (acts as the "frame" around the HTML content)
   - Resume content: drei <Html transform> rendering the live React DOM
   - Power button, knobs, brand badge, stand
---------------------------------------------------------------------------- */

function CRTMonitor({ powered, onPowerToggle }: { powered: boolean; onPowerToggle: () => void }) {
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

      {/* ---------- Live resume content rendered as DOM in 3D space ---------- */}
      {/* drei <Html transform> renders the resume DOM natively in 3D space.
          `distanceFactor` controls how big the HTML appears in world units:
          smaller = bigger on screen, larger = smaller. Tuned so the 1024×768
          resume fits exactly inside the 3.4×2.6 dark CRT screen frame.
          Position is in front of the screen surface (z=1.74, screen at z=1.725). */}
      <Html
        transform
        occlude={false}
        position={[0, 0.1, 1.74]}
        distanceFactor={1.55}
        wrapperClass="crt-screen-wrapper"
        style={{
          width: '1024px',
          height: '768px',
          pointerEvents: 'none',
          opacity: powered ? 1 : 0,
          transition: 'opacity 0.3s linear',
        }}
      >
        <ResumeScreen powered={powered} />
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
---------------------------------------------------------------------------- */

function DesktopTower() {
  return (
    <group position={[3.4, -2.55, 0.4]}>
      {/* Main case */}
      <RoundedBox args={[1.8, 4.6, 3.4]} radius={0.08} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial color="#d4cebc" roughness={0.7} metalness={0.05} />
      </RoundedBox>

      {/* CD-ROM drive bay */}
      <mesh position={[0, 1.6, 1.71]}>
        <boxGeometry args={[1.5, 0.35, 0.04]} />
        <meshStandardMaterial color="#9c9787" roughness={0.5} />
      </mesh>
      {/* CD tray line */}
      <mesh position={[0, 1.65, 1.73]}>
        <boxGeometry args={[1.4, 0.04, 0.02]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      {/* CD eject button */}
      <mesh position={[0.65, 1.55, 1.73]}>
        <boxGeometry args={[0.08, 0.04, 0.02]} />
        <meshStandardMaterial color="#666" />
      </mesh>

      {/* Floppy drive */}
      <mesh position={[0, 1.1, 1.71]}>
        <boxGeometry args={[1.0, 0.3, 0.04]} />
        <meshStandardMaterial color="#9c9787" roughness={0.5} />
      </mesh>
      <mesh position={[-0.2, 1.1, 1.73]}>
        <boxGeometry args={[0.5, 0.04, 0.02]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Power button area */}
      <mesh position={[0, 0.5, 1.71]}>
        <boxGeometry args={[0.5, 0.3, 0.04]} />
        <meshStandardMaterial color="#7a7565" roughness={0.5} />
      </mesh>
      <mesh position={[-0.15, 0.5, 1.74]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.03, 20]} />
        <meshStandardMaterial
          color="#33ff66"
          emissive="#33ff66"
          emissiveIntensity={1.5}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0.15, 0.5, 1.74]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.03, 20]} />
        <meshStandardMaterial
          color="#ffaa33"
          emissive="#ffaa33"
          emissiveIntensity={0.8}
          toneMapped={false}
        />
      </mesh>

      {/* Brand vent slats */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh key={i} position={[0, -0.5 - i * 0.18, 1.71]}>
          <boxGeometry args={[1.4, 0.04, 0.02]} />
          <meshStandardMaterial color="#9c9787" />
        </mesh>
      ))}

      {/* Side ventilation */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <mesh key={i} position={[0.91, 1.5 - i * 0.3, 0]}>
          <boxGeometry args={[0.02, 0.2, 2.4]} />
          <meshStandardMaterial color="#b8b2a2" />
        </mesh>
      ))}
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
   Retro keyboard — beige, matches the monitor + tower
---------------------------------------------------------------------------- */

function Keyboard() {
  // Generate a 5-row x 14-col grid of keys for the main block
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
                <mesh
                  key={`${rIdx}-${cIdx}`}
                  position={[x + w / 2, 0, z]}
                  castShadow
                >
                  <boxGeometry args={[w, 0.1, h]} />
                  <meshStandardMaterial color="#f0ebde" roughness={0.55} />
                </mesh>
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

/* ----------------------------------------------------------------------------
   Retro ball mouse + mousepad
---------------------------------------------------------------------------- */

function RetroMouse() {
  return (
    <group position={[2.6, -2.55, 2.6]} rotation={[0, -0.2, 0]}>
      {/* Mousepad */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1.8, 1.5]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.95} />
      </mesh>
      {/* Mousepad edge */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.86, 0.9, 32]} />
        <meshBasicMaterial color="#332211" side={THREE.DoubleSide} />
      </mesh>

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

      {/* Left button highlight */}
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
  )
}

/* ----------------------------------------------------------------------------
   Cartoon hands — POV (first-person) typing on the keyboard.

   Coordinate system reminder:
     +X = right, +Y = up, +Z = toward camera (out of screen)
     -Z = toward the monitor (away from camera)
   So "fingertips pointing forward toward the keyboard" means -Z direction,
   and "palm facing down" means the palm's flat side faces -Y (down).

   Hand anatomy (palm-down, fingers-forward typing pose):
     - Palm: flat box, top at +Y, bottom (palm side) at -Y
     - Fingers: extend in -Z direction (toward monitor), curl down at tips
     - Thumb: on the inner side (left hand: thumb on +X side; right hand: -X)
     - Forearm + sleeve: extends back toward camera (+Z) and down, exiting frame
---------------------------------------------------------------------------- */

function CartoonFinger({
  position,
  rotation = [0, 0, 0],
  length = 0.4,
  radius = 0.07,
  color = '#f5c89a',
}: {
  position: [number, number, number]
  rotation?: [number, number, number]
  length?: number
  radius?: number
  color?: string
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow>
      {/* capsuleGeometry: the cylinder part runs along the Y axis by default.
          To make a finger point in -Z, we rotate it 90° around X. */}
      <capsuleGeometry args={[radius, length, 6, 12]} />
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
  )
}

function CartoonHand({
  side = 'left',
  position,
}: {
  side: 'left' | 'right'
  position: [number, number, number]
}) {
  // For the LEFT hand: s=+1. For the RIGHT hand: s=-1 (mirrored).
  // Thumb goes on the INNER side: left hand thumb on +X (right edge),
  // right hand thumb on -X (left edge).
  const s = side === 'left' ? 1 : -1
  const skinColor = '#f5c89a'
  const sleeveColor = '#5b3924' // warm brown sleeve
  const cuffColor = '#3a2415'

  return (
    <group position={position}>
      {/* ---- Forearm sleeve ----
          Extends back toward the camera (+Z) and downward (-Y), exiting the
          bottom of the frame. The sleeve is a capsule rotated to lie along
          that diagonal. */}
      <mesh
        position={[0, -0.35, 0.55]}
        rotation={[Math.PI / 2 - 0.5, 0, 0]}
        castShadow
      >
        <capsuleGeometry args={[0.22, 0.9, 8, 16]} />
        <meshStandardMaterial color={sleeveColor} roughness={0.85} />
      </mesh>

      {/* ---- Sleeve cuff (where the sleeve meets the wrist) ---- */}
      <mesh position={[0, -0.05, 0.18]} rotation={[Math.PI / 2 - 0.4, 0, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.26, 0.16, 20]} />
        <meshStandardMaterial color={cuffColor} roughness={0.7} />
      </mesh>

      {/* ---- Palm ----
          Flat rounded box. Width along X, thickness along Y (thin), depth
          along Z (palm-to-fingertip direction). Top face (+Y) is the back
          of the hand; bottom face (-Y) is the palm side. */}
      <mesh position={[0, 0.05, -0.05]} castShadow>
        <boxGeometry args={[0.42, 0.16, 0.45]} />
        <meshStandardMaterial color={skinColor} roughness={0.7} />
      </mesh>
      {/* Soft round top (back of hand) */}
      <mesh position={[0, 0.14, -0.05]} castShadow>
        <capsuleGeometry args={[0.13, 0.18, 6, 12]} />
        <meshStandardMaterial color={skinColor} roughness={0.7} />
      </mesh>

      {/* ---- Thumb ----
          On the inner side of the hand (s * +X). Points forward (-Z) and
          slightly inward. Rotated to lie mostly along -Z with a slight
          downward curl. */}
      <CartoonFinger
        position={[s * 0.24, 0.04, 0.05]}
        rotation={[Math.PI / 2 + 0.3, 0, s * -0.4]}
        length={0.18}
        radius={0.06}
        color={skinColor}
      />

      {/* ---- Four fingers ----
          Spread across the front edge of the palm (negative-Z side).
          Each finger has two segments:
            1) Base segment: lies nearly flat, extending in -Z (forward)
            2) Tip segment: curls downward to "press" the keys
          The capsule is rotated +90° around X to point along Z. */}
      {[-0.15, -0.05, 0.05, 0.15].map((xOff, i) => (
        <group key={i} position={[xOff, 0.08, -0.25]}>
          {/* Base segment — extends forward (in -Z) from the knuckle, mostly flat */}
          <CartoonFinger
            position={[0, 0, -0.08]}
            rotation={[Math.PI / 2 + 0.2, 0, 0]}
            length={0.14}
            radius={0.055}
            color={skinColor}
          />
          {/* Tip segment — curls DOWN toward the keys (steeper angle so
              fingertips point mostly downward, pressing the key caps) */}
          <CartoonFinger
            position={[0, -0.08, -0.18]}
            rotation={[Math.PI / 2 + 1.4, 0, 0]}
            length={0.1}
            radius={0.045}
            color={skinColor}
          />
        </group>
      ))}
    </group>
  )
}

function CartoonHandsPOV() {
  return (
    // Position the hands so the fingertips rest ON the home-row keys.
    // Keyboard is at world (0, -2.55, 2.6). Keyboard base top at y ≈ -2.4,
    // key caps add ~0.1, so key tops are at y ≈ -2.3 around z ≈ 2.6.
    // Fingertips need to reach y ≈ -2.3. With the hand's local geometry,
    // fingertips end up at local y ≈ -0.2 below the hand origin. So group
    // y ≈ -2.1 puts fingertips at world y ≈ -2.3 — right on the keys.
    // Hands are offset in X so each palm sits over its half of the keyboard.
    <group position={[0, -2.25, 3.0]}>
      <CartoonHand side="left" position={[-0.55, 0, 0]} />
      <CartoonHand side="right" position={[0.55, 0, 0]} />
    </group>
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
   Camera rig — slightly elevated, looking down toward keyboard for POV feel
---------------------------------------------------------------------------- */

function CameraController({ powered }: { powered: boolean }) {
  const { camera } = useThree()
  // Frame the whole scene: monitor + desk + keyboard + hands
  const idlePos = useMemo(() => new THREE.Vector3(0, 0.8, 11), [])
  const focusPos = useMemo(() => new THREE.Vector3(0, 0.4, 9.5), [])

  useFrame((_, delta) => {
    const goal = powered ? focusPos : idlePos
    camera.position.lerp(goal, delta * 0.6)
    // Look at center of monitor screen (slightly above desk level)
    camera.lookAt(0, -0.4, 0)
  })
  return null
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
  onPowerToggle,
}: {
  powered: boolean
  onPowerToggle: () => void
}) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 0, 11], fov: 42, near: 0.1, far: 100 }}
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
        <CameraController powered={powered} />

        <group position={[0, 0, 0]}>
          <CRTMonitor powered={powered} onPowerToggle={onPowerToggle} />
          <DesktopTower />
          <DeskSurface />
          <Keyboard />
          <RetroMouse />
          <CartoonHandsPOV />
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
          target={[0, 0, 0]}
        />
      </Suspense>
    </Canvas>
  )
}
