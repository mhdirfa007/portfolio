'use client'

import { resume } from '@/lib/resume-data'

/* ----------------------------------------------------------------------------
   HeldPaper — a full-screen close-up shown after the resume is "printed".
   The freshly printed sheet is held up by two cartoon hands at the bottom;
   scroll the sheet to read the entire resume. Click ✕ (or the backdrop) to
   return to the 3D scene.
---------------------------------------------------------------------------- */

export function HeldPaper({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        // Above drei's <Html> layer (which sits near z-index 16.7M), so the
        // CRT screen content can't bleed through this close-up.
        zIndex: 2147483000,
        background: 'radial-gradient(ellipse at 50% 40%, rgba(20,16,10,0.92) 0%, rgba(6,6,8,0.97) 80%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        animation: 'paperFadeIn 0.5s ease both',
      }}
    >
      <style>{`
        @keyframes paperFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes paperRise { from { transform: translateY(40px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        .held-sheet::-webkit-scrollbar { width: 10px; }
        .held-sheet::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.3); border-radius: 5px; }
      `}</style>

      {/* Top bar: title + close */}
      <div
        style={{
          width: '100%',
          maxWidth: '760px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px 8px',
          color: '#f3c969',
          fontFamily: 'monospace',
          letterSpacing: '0.15em',
          fontSize: '12px',
          textTransform: 'uppercase',
        }}
      >
        <span>🖨 Printed · Mohamed_Irfan_Resume</span>
        <button
          onClick={onClose}
          aria-label="Close printed resume"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(243,201,105,0.5)',
            color: '#f3c969',
            padding: '4px 12px',
            fontSize: '12px',
            cursor: 'pointer',
            borderRadius: '4px',
            fontFamily: 'monospace',
            letterSpacing: '0.1em',
          }}
        >
          ✕ CLOSE
        </button>
      </div>

      {/* Scrollable held sheet */}
      <div
        className="held-sheet"
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '760px',
          overflowY: 'scroll',
          padding: '8px 20px 220px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          animation: 'paperRise 0.6s ease both',
        }}
      >
        <ResumePage />
      </div>

      {/* Cartoon hands gripping the bottom of the sheet (fixed, don't scroll) */}
      <CartoonHand side="left" />
      <CartoonHand side="right" />

      {/* Hint */}
      <div
        style={{
          position: 'absolute',
          bottom: '14px',
          left: 0,
          right: 0,
          textAlign: 'center',
          color: 'rgba(243,201,105,0.7)',
          fontFamily: 'monospace',
          fontSize: '11px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          pointerEvents: 'none',
          zIndex: 62,
        }}
      >
        Scroll to read the whole résumé · ✕ to close
      </div>
    </div>
  )
}

/* The printed résumé page content (full résumé). */
function ResumePage() {
  const r = resume
  return (
    <div
      style={{
        background: 'white',
        width: '100%',
        maxWidth: '620px',
        height: 'fit-content',
        padding: '40px 48px',
        color: '#1a1a1a',
        fontFamily: '"Calibri", "Segoe UI", Arial, sans-serif',
        fontSize: '13px',
        lineHeight: 1.5,
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        borderRadius: '2px',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', borderBottom: '3px solid #2a5aa8', paddingBottom: '12px', marginBottom: '16px' }}>
        <div style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '1px' }}>{r.name}</div>
        <div style={{ fontSize: '14px', color: '#555', marginTop: '2px' }}>{r.title}</div>
        <div style={{ fontSize: '11px', color: '#666', marginTop: '6px' }}>
          {r.contact.email} · {r.contact.phone} · {r.contact.location}
        </div>
        <div style={{ fontSize: '11px', color: '#666' }}>
          {r.contact.github} · {r.contact.linkedin}
        </div>
      </div>

      <Section title="Objective">
        <p style={{ margin: 0 }}>{r.summary}</p>
      </Section>

      <Section title="Education">
        <div>
          <strong>{r.education.degree}</strong> — {r.education.school}
          <br />
          <span style={{ color: '#555' }}>
            {r.education.period} | {r.education.detail}
          </span>
        </div>
      </Section>

      <Section title="Skills">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <SkillRow label="Languages" items={r.skills.languages} />
            <SkillRow label="Frameworks" items={r.skills.frameworks} />
            <SkillRow label="Tools" items={r.skills.tools} />
            <SkillRow label="Databases" items={r.skills.databases} />
          </tbody>
        </table>
      </Section>

      <Section title="Experience">
        {r.experience.map((exp) => (
          <div key={exp.company} style={{ marginBottom: '8px' }}>
            <div style={{ fontWeight: 600 }}>
              {exp.role} — {exp.company}
              <span style={{ color: '#666', float: 'right', fontWeight: 400 }}>{exp.period}</span>
            </div>
            <ul style={{ margin: '4px 0 0 18px', padding: 0 }}>
              {exp.highlights.map((h, i) => (
                <li key={i} style={{ marginBottom: '3px' }}>
                  {h}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Section>

      <Section title="Projects">
        {r.projects.map((p) => (
          <div key={p.name} style={{ marginBottom: '8px' }}>
            <div style={{ fontWeight: 600 }}>
              {p.name}
              <span style={{ color: '#666', fontWeight: 400 }}> ({p.year}) — {p.stack}</span>
            </div>
            <div style={{ color: '#333' }}>{p.description}</div>
          </div>
        ))}
      </Section>

      <Section title="Certifications">
        <ul style={{ margin: '0 0 0 18px', padding: 0 }}>
          {r.certifications.map((c, i) => (
            <li key={i} style={{ marginBottom: '2px' }}>
              {c.name} <span style={{ color: '#666' }}>({c.expiry})</span>
            </li>
          ))}
        </ul>
      </Section>

      <div style={{ display: 'flex', gap: '24px' }}>
        <div style={{ flex: 1 }}>
          <Section title="Achievements">
            <ul style={{ margin: '0 0 0 18px', padding: 0 }}>
              {r.achievements.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </Section>
        </div>
        <div style={{ flex: 1 }}>
          <Section title="Leadership">
            <ul style={{ margin: '0 0 0 18px', padding: 0 }}>
              {r.leadership.map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
          </Section>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <div
        style={{
          fontSize: '13px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          color: '#2a5aa8',
          borderBottom: '1px solid #ccc',
          paddingBottom: '3px',
          marginBottom: '6px',
        }}
      >
        {title}
      </div>
      {children}
    </div>
  )
}

function SkillRow({ label, items }: { label: string; items: string[] }) {
  return (
    <tr>
      <td style={{ fontWeight: 600, width: '110px', verticalAlign: 'top', paddingRight: '8px', paddingBottom: '2px' }}>
        {label}
      </td>
      <td style={{ paddingBottom: '2px' }}>{items.join(', ')}</td>
    </tr>
  )
}

/* A stylized cartoon hand gripping the bottom of the held sheet. */
function CartoonHand({ side }: { side: 'left' | 'right' }) {
  const isLeft = side === 'left'
  const skin = '#e8b48c'
  const skinShadow = '#d89a72'
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        [isLeft ? 'left' : 'right']: 'max(4%, calc(50% - 360px))',
        width: '150px',
        height: '210px',
        zIndex: 61,
        pointerEvents: 'none',
        transform: isLeft ? 'rotate(-6deg)' : 'rotate(6deg) scaleX(-1)',
        transformOrigin: 'bottom center',
      }}
    >
      {/* Fingers gripping over the top edge of the hand */}
      <div style={{ position: 'absolute', top: '6px', left: '18px', display: 'flex', gap: '7px' }}>
        {[34, 44, 42, 32].map((h, i) => (
          <div
            key={i}
            style={{
              width: '20px',
              height: `${h}px`,
              background: `linear-gradient(180deg, ${skin} 60%, ${skinShadow} 100%)`,
              borderRadius: '10px 10px 8px 8px',
              boxShadow: 'inset -2px 0 3px rgba(0,0,0,0.12)',
            }}
          />
        ))}
      </div>
      {/* Thumb */}
      <div
        style={{
          position: 'absolute',
          top: '42px',
          right: '6px',
          width: '26px',
          height: '52px',
          background: `linear-gradient(180deg, ${skin}, ${skinShadow})`,
          borderRadius: '14px',
          transform: 'rotate(28deg)',
        }}
      />
      {/* Back of hand / palm */}
      <div
        style={{
          position: 'absolute',
          top: '34px',
          left: '10px',
          width: '120px',
          height: '92px',
          background: `linear-gradient(180deg, ${skin}, ${skinShadow})`,
          borderRadius: '26px',
          boxShadow: '0 6px 18px rgba(0,0,0,0.4)',
        }}
      />
      {/* Dark sweater sleeve */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: '16px',
          width: '108px',
          height: '110px',
          background: 'linear-gradient(180deg, #222228 0%, #15151a 100%)',
          borderRadius: '40px 40px 8px 8px',
        }}
      />
    </div>
  )
}
