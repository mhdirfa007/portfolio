'use client'

import { RoundedBox, Html } from '@react-three/drei'

/* ----------------------------------------------------------------------------
   CDCase — a 3D jewel case labeled "MOHAMED IRFAN RESUME" sitting on the desk.
   This is DECORATION ONLY — not directly clickable. The user must use the
   3D mouse to interact with the desktop (insert CD / close document), per
   the user's request: "the desktop should be accessed by the given mouse only".
---------------------------------------------------------------------------- */

export function CDCase() {
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

      {/* Label text — non-interactive, just visual */}
      <Html position={[0, 0.05, 0.08]} center distanceFactor={2.2} pointerEvents="none">
        <div
          style={{
            width: '200px',
            textAlign: 'center',
            color: '#ffb000',
            fontFamily: '"Courier New", monospace',
            padding: '8px',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '4px' }}>📂 PORTFOLIO CD-ROM</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', lineHeight: '1.2', letterSpacing: '0.5px' }}>
            MOHAMED IRFAN
          </div>
          <div style={{ fontSize: '9px', opacity: 0.8, marginTop: '4px' }}>RESUME</div>
          <div style={{ fontSize: '8px', opacity: 0.5, marginTop: '6px' }}>─ use the mouse to insert ─</div>
        </div>
      </Html>
    </group>
  )
}
