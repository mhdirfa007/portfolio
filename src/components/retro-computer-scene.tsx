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
      {/* We use drei <Html transform> to render the resume DOM natively. It's
          positioned just in front of the screen surface, scaled to fit, and
          hidden when the monitor is "off". pointerEvents: none so it doesn't
          interfere with OrbitControls when user drags over the screen. */}
      <Html
        transform
        occlude={false}
        position={[0, 0.1, 1.74]}
        distanceFactor={1.4}
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

      {/* Power button (bottom-right) */}
      <group
        position={[1.55, -1.45, 1.72]}
        onClick={(e) => {
          e.stopPropagation()
          onPowerToggle()
        }}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.06, 24]} />
          <meshStandardMaterial color="#888" roughness={0.4} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.02, 24]} />
          <meshStandardMaterial
            color={powered ? '#33ff66' : '#332222'}
            emissive={powered ? '#33ff66' : '#000000'}
            emissiveIntensity={powered ? 2 : 0}
            toneMapped={false}
          />
        </mesh>
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
      {/* Desk top */}
      <mesh position={[0, -4.85, 0]} receiveShadow>
        <boxGeometry args={[20, 0.4, 12]} />
        <meshStandardMaterial color="#2a1f15" roughness={0.85} metalness={0.05} />
      </mesh>
      {/* Subtle desk reflection overlay */}
      <mesh position={[0, -4.63, 0]} rotation={[-Math.PI / 2, 0, 0]}>
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
   Camera rig — zoom in slightly when powered on (cinematic)
---------------------------------------------------------------------------- */

function CameraController({ powered }: { powered: boolean }) {
  const { camera } = useThree()
  const idlePos = useMemo(() => new THREE.Vector3(0, 0, 11), [])
  const focusPos = useMemo(() => new THREE.Vector3(0, 0.1, 7.5), [])

  useFrame((_, delta) => {
    const goal = powered ? focusPos : idlePos
    camera.position.lerp(goal, delta * 0.6)
    camera.lookAt(0, 0, 0)
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
