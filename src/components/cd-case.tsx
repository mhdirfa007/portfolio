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

      {/* Single HTML overlay containing BOTH the label text and the click
          button. Using one Html element avoids the label wrapper covering
          the button wrapper (which was blocking clicks). The button is
          positioned absolutely over the label so clicks register on the
          button, while the label text shows through. */}
      <Html position={[0, 0.05, 0.08]} center distanceFactor={2.2}>
        <div
          style={{
            position: 'relative',
            width: '200px',
            height: '180px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '12px',
            boxSizing: 'border-box',
            // The wrapper itself doesn't capture pointer events — only the
            // button inside it does.
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          {/* Label text (non-interactive) */}
          <div
            style={{
              textAlign: 'center',
              color: '#ffb000',
              fontFamily: '"Courier New", monospace',
              pointerEvents: 'none',
            }}
          >
            <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '4px' }}>📂 PORTFOLIO CD-ROM</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', lineHeight: '1.2', letterSpacing: '0.5px' }}>
              MOHAMED IRFAN
            </div>
            <div style={{ fontSize: '9px', opacity: 0.8, marginTop: '4px' }}>RESUME</div>
            <div style={{ fontSize: '8px', opacity: 0.5, marginTop: '6px' }}>─ click to insert ─</div>
          </div>

          {/* Click button — covers the whole label area, captures the click */}
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
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
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
        </div>
      </Html>
    </group>
  )
}
