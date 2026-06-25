'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { inputState, mouseClickState, type PressState } from '@/lib/input-state'

/* ----------------------------------------------------------------------------
   Cartoon hands — a left hand resting on the keyboard and a right hand draped
   over the mouse, both with dark sweater sleeves coming toward the camera.

   - The LEFT (keyboard) hand reads inputState: on every keypress it dips the
     finger that best matches the pressed key (the only hand on the keys, so it
     handles all of them) and nudges sideways toward the key's column.
   - The RIGHT (mouse) hand reads mouseClickState: on every 3D-mouse click it
     presses its index finger + the whole hand down briefly.
---------------------------------------------------------------------------- */

const SKIN = '#e8b48c'
const SKIN_SHADOW = '#d89a72'
const SLEEVE = '#15151a'
const SLEEVE_CUFF = '#222228'

const PRESS_MS = 160

/* A single cartoon finger: proximal segment + curled tip with a nail.
   Points in the -Z direction (away from the viewer, toward the keys/mouse). */
function Finger({
  fingerRef,
  length = 0.42,
  radius = 0.075,
}: {
  fingerRef?: React.RefObject<THREE.Group | null>
  length?: number
  radius?: number
}) {
  return (
    <group ref={fingerRef}>
      <mesh position={[0, 0, -length * 0.3]} castShadow>
        <capsuleGeometry args={[radius, length * 0.55, 6, 12]} />
        <meshStandardMaterial color={SKIN} roughness={0.6} metalness={0.02} />
      </mesh>
      <group position={[0, -0.02, -length * 0.62]} rotation={[0.35, 0, 0]}>
        <mesh position={[0, 0, -length * 0.2]} castShadow>
          <capsuleGeometry args={[radius * 0.9, length * 0.4, 6, 12]} />
          <meshStandardMaterial color={SKIN} roughness={0.6} metalness={0.02} />
        </mesh>
        <mesh position={[0, radius * 0.7, -length * 0.4]} rotation={[0.3, 0, 0]}>
          <boxGeometry args={[radius * 1.1, 0.01, radius * 1.3]} />
          <meshStandardMaterial color="#f3d2b8" roughness={0.5} />
        </mesh>
      </group>
    </group>
  )
}

type HandProps = {
  side: 'left' | 'right'
  position: [number, number, number]
  rotation?: [number, number, number]
  /** 'keyboard' reacts to typing, 'mouse' reacts to clicks. */
  mode: 'keyboard' | 'mouse'
}

function Hand({ side, position, rotation = [0, 0, 0], mode }: HandProps) {
  const mirror = side === 'left' ? 1 : -1
  const groupRef = useRef<THREE.Group>(null)
  // Fingers ordered [index, middle, ring, pinky] from the thumb side outward.
  const f0 = useRef<THREE.Group>(null)
  const f1 = useRef<THREE.Group>(null)
  const f2 = useRef<THREE.Group>(null)
  const f3 = useRef<THREE.Group>(null)
  const fingerRefs = [f0, f1, f2, f3]

  const baseY = position[1]
  const baseX = position[0]

  useFrame(() => {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now()

    if (mode === 'keyboard') {
      const press: PressState = inputState.current
      const elapsed = now - press.timestamp
      const typing = press.keyId !== null && elapsed < PRESS_MS
      // This hand only handles keys in its half of the keyboard:
      //   left hand  → fingerId 0-3, right hand → fingerId 4-7.
      const fid = press.fingerId
      const mine =
        typing && fid !== null && (side === 'left' ? fid <= 3 : fid >= 4)
      const t = mine ? Math.max(0, Math.min(1, elapsed / PRESS_MS)) : 0
      const dip = mine ? Math.sin(t * Math.PI) : 0

      // Map this hand's key to a visual finger [index,middle,ring,pinky].
      let activeSlot = -1
      if (mine && fid !== null) {
        activeSlot = side === 'left' ? 3 - fid : fid - 4
      }

      fingerRefs.forEach((ref, idx) => {
        if (!ref.current) return
        const target = idx === activeSlot ? dip * 0.55 : 0
        ref.current.rotation.x += (target - ref.current.rotation.x) * 0.5
      })

      // Slide the whole hand slightly toward the pressed key's column + dip.
      if (groupRef.current) {
        let colOffset = 0
        if (mine && fid !== null) {
          colOffset = side === 'left' ? (fid - 1.5) * 0.16 : (fid - 5.5) * 0.16
        }
        const targetX = baseX + colOffset
        const targetY = baseY - dip * 0.06
        groupRef.current.position.x += (targetX - groupRef.current.position.x) * 0.18
        groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.3
      }
    } else {
      // Mouse hand — press index finger + whole hand down on click.
      const click = mouseClickState.current
      const elapsed = now - click.timestamp
      const clicking = click.timestamp > 0 && elapsed < PRESS_MS
      const t = clicking ? Math.max(0, Math.min(1, elapsed / PRESS_MS)) : 0
      const dip = clicking ? Math.sin(t * Math.PI) : 0

      fingerRefs.forEach((ref, idx) => {
        if (!ref.current) return
        // index + middle press on a click
        const target = idx <= 1 ? dip * 0.6 : 0
        ref.current.rotation.x += (target - ref.current.rotation.x) * 0.5
      })
      if (groupRef.current) {
        const targetY = baseY - dip * 0.05
        groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.4
      }
    }
  })

  // Finger fan-out + lengths: index(0) middle(1) ring(2) pinky(3).
  const fingerX = [0.21, 0.07, -0.07, -0.21].map((x) => x * mirror)
  const fingerLen = [0.46, 0.5, 0.44, 0.34]

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Palm / back of hand */}
      <RoundedBox args={[0.58, 0.2, 0.6]} radius={0.09} smoothness={4} castShadow>
        <meshStandardMaterial color={SKIN} roughness={0.62} metalness={0.02} />
      </RoundedBox>
      <mesh position={[0, 0.08, -0.26]}>
        <boxGeometry args={[0.5, 0.04, 0.12]} />
        <meshStandardMaterial color={SKIN_SHADOW} roughness={0.7} />
      </mesh>

      {/* Fingers (front edge, pointing -Z) */}
      <group position={[0, 0.02, -0.28]}>
        {fingerRefs.map((ref, i) => (
          <group key={i} position={[fingerX[i], 0, 0]}>
            <Finger fingerRef={ref} length={fingerLen[i]} />
          </group>
        ))}
      </group>

      {/* Thumb */}
      <group position={[0.3 * mirror, 0.0, 0.02]} rotation={[0.2, -0.7 * mirror, 0.5 * mirror]}>
        <mesh position={[0, 0, -0.16]} castShadow>
          <capsuleGeometry args={[0.085, 0.26, 6, 12]} />
          <meshStandardMaterial color={SKIN} roughness={0.6} />
        </mesh>
      </group>

      {/* Wrist */}
      <mesh position={[0, -0.02, 0.36]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.24, 0.35, 16]} />
        <meshStandardMaterial color={SKIN} roughness={0.62} />
      </mesh>

      {/* Dark sweater sleeve */}
      <group position={[0, -0.12, 0.85]} rotation={[0.55, 0, 0]}>
        <mesh position={[0, 0, -0.2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.28, 0.3, 0.18, 18]} />
          <meshStandardMaterial color={SLEEVE_CUFF} roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.1, 0.5]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.42, 1.4, 18]} />
          <meshStandardMaterial color={SLEEVE} roughness={0.95} />
        </mesh>
      </group>
    </group>
  )
}

export function Hands() {
  return (
    <group>
      {/* Both hands rest on the keyboard. The left hand handles the left half
          of the keys, the right hand the right half — they type together. */}
      <Hand side="left" position={[-1.05, -2.18, 3.05]} rotation={[0.18, 0.1, 0]} mode="keyboard" />
      <Hand side="right" position={[1.05, -2.18, 3.05]} rotation={[0.18, -0.1, 0]} mode="keyboard" />
    </group>
  )
}
