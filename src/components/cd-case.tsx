'use client'

import { RoundedBox, Html } from '@react-three/drei'

/* ----------------------------------------------------------------------------
   CDCase — a 3D jewel case labeled "MOHAMED IRFAN RESUME" sitting on the desk.
   Clickable via an HTML overlay button (same pattern as the power button —
   more reliable than 3D raycast clicks when OrbitControls is active).

   Click behavior is context-dependent (handled by the parent):
     - On desktop  → inserts the CD → Word document opens
     - On document → closes the document → back to desktop
---------------------------------------------------------------------------- */

export function CDCase({ onInsert }: { onInsert: () => void }) {
  return (
    <group position={[-3.2, -2.45, 2.4]} rotation={[0, 0.35, 0]}>
      {/* Jewel case body — clear/translucent */}
      <RoundedBox args={[1.4, 1.5, 0.12]} radius={0.02} smoothness={3} castShadow receiveShadow>
        <meshStandardMaterial color="#e8e8f0" roughness={0.15} metalness={0.05} transparent opacity={0.55} />
      </RoundedBox>

      {/* Front cover insert — the label background */}
      <mesh position={[0, 0.05, 0.07]}>
        <planeGeometry args={[1.2, 1.1]} />
        <meshStandardMaterial color="#1a2a5a" roughness={0.7} />
      </mesh>

      {/* Spine of the case (left edge) */}
      <mesh position={[-0.7, 0, 0]}>
        <boxGeometry args={[0.04, 1.5, 0.12]} />
        <meshStandardMaterial color="#1a2a5a" roughness={0.7} />
      </mesh>

      {/* ---- The CD disc itself, sitting in the open case ---- */}
      <group position={[0.05, 0.0, 0.075]} rotation={[0, 0, 0]}>
        {/* Disc body — silver, slightly reflective */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.6, 0.6, 0.012, 48]} />
          <meshStandardMaterial color="#d9dde3" roughness={0.22} metalness={0.85} />
        </mesh>
        {/* Iridescent data-ring tint overlay */}
        <mesh position={[0, 0, 0.008]}>
          <ringGeometry args={[0.18, 0.58, 48]} />
          <meshStandardMaterial
            color="#bfe3ff"
            roughness={0.15}
            metalness={0.9}
            transparent
            opacity={0.35}
            side={2}
          />
        </mesh>
        {/* Center hub ring */}
        <mesh position={[0, 0, 0.009]}>
          <ringGeometry args={[0.1, 0.18, 32]} />
          <meshStandardMaterial color="#9aa0a8" roughness={0.4} metalness={0.6} side={2} />
        </mesh>
        {/* Center hole */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.002]}>
          <cylinderGeometry args={[0.1, 0.1, 0.02, 32]} />
          <meshStandardMaterial color="#1a2a5a" roughness={0.7} />
        </mesh>

        {/* Disc label text (printed on the disc face) */}
        <Html position={[0, 0, 0.02]} center distanceFactor={2.2} pointerEvents="none">
          <div
            style={{
              width: '150px',
              textAlign: 'center',
              color: '#1a2a5a',
              fontFamily: '"Courier New", monospace',
              pointerEvents: 'none',
              userSelect: 'none',
              lineHeight: '1.15',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '0.5px' }}>MOHAMED</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '0.5px' }}>IRFAN</div>
            <div style={{ height: '26px' }} />
            <div style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px' }}>RESUME</div>
          </div>
        </Html>
      </group>

      {/* Click button — covers the whole case front, captures the click */}
      <Html position={[0, 0.05, 0.1]} center distanceFactor={2.2}>
        <button
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            onInsert()
          }}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label="Click CD — insert / eject"
          title="Click to insert / eject the CD"
          style={{
            width: '180px',
            height: '190px',
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
            e.currentTarget.style.boxShadow = '0 0 24px 6px rgba(255, 176, 0, 0.5)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'none'
          }}
        />
      </Html>
    </group>
  )
}
