'use client'

import { resume } from '@/lib/resume-data'

/**
 * This component is rendered into an offscreen HTML texture and mapped onto
 * the CRT monitor screen. Everything here is laid out for a 1024x768 screen
 * texture so it should fit inside the 4:3 monitor aspect ratio.
 *
 * Colors and fonts are tuned for the retro CRT phosphor look (amber on black,
 * monospace, sharp pixel-ish edges).
 */
export function ResumeScreen({ powered }: { powered: boolean }) {
  return (
    <div
      style={{
        width: '1024px',
        height: '768px',
        background: '#000000',
        color: '#ffb000',
        fontFamily: '"VT323", "Courier New", monospace',
        fontSize: '18px',
        lineHeight: '1.35',
        padding: '32px 44px',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
        // Slight inner glow to mimic phosphor
        boxShadow: 'inset 0 0 80px rgba(255, 176, 0, 0.18)',
        opacity: powered ? 1 : 0,
        transition: 'opacity 0.3s linear',
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '8px',
          borderBottom: '1px solid rgba(255, 176, 0, 0.4)',
          marginBottom: '18px',
        }}
      >
        <span style={{ letterSpacing: '0.1em' }}>/home/alex/portfolio.txt</span>
        <span style={{ opacity: 0.7 }}>— MAIN —</span>
      </div>

      {/* Name + title */}
      <div style={{ marginBottom: '4px', fontSize: '36px', letterSpacing: '0.05em' }}>
        {resume.name}
      </div>
      <div style={{ fontSize: '20px', opacity: 0.85, marginBottom: '6px' }}>
        {'> '}
        {resume.title}
      </div>
      <div style={{ opacity: 0.6, marginBottom: '14px' }}>{'// '}{resume.tagline}</div>

      {/* Contact line */}
      <div
        style={{
          fontSize: '14px',
          opacity: 0.7,
          marginBottom: '16px',
          display: 'flex',
          gap: '18px',
          flexWrap: 'wrap',
        }}
      >
        <span>MAIL: {resume.contact.email}</span>
        <span>LOC: {resume.contact.location}</span>
        <span>WEB: {resume.contact.github}</span>
      </div>

      {/* Summary */}
      <Section title="SUMMARY">
        <div style={{ maxWidth: '92%' }}>{resume.summary}</div>
      </Section>

      {/* Skills */}
      <Section title="STACK">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 12px' }}>
          {resume.skills.map((s) => (
            <span key={s} style={{ border: '1px solid rgba(255,176,0,0.3)', padding: '1px 8px' }}>
              {s}
            </span>
          ))}
        </div>
      </Section>

      {/* Experience */}
      <Section title="EXPERIENCE">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {resume.experience.map((exp) => (
            <div key={exp.company}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>
                  <span style={{ opacity: 0.7 }}>[{exp.period}]</span> {exp.role} @{' '}
                  <span style={{ fontWeight: 'bold' }}>{exp.company}</span>
                </span>
              </div>
              <ul style={{ margin: '4px 0 0 16px', padding: 0, listStyle: 'none' }}>
                {exp.highlights.map((h, i) => (
                  <li key={i} style={{ opacity: 0.85 }}>
                    - {h}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* Projects */}
      <Section title="PROJECTS">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {resume.projects.map((p) => (
            <div key={p.name}>
              <span style={{ fontWeight: 'bold' }}>{p.name}</span>
              <span style={{ opacity: 0.6 }}> [{p.year}] ({p.stack})</span>
              <div style={{ opacity: 0.8, paddingLeft: '12px' }}>— {p.description}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Education */}
      <Section title="EDUCATION">
        <div>
          <span style={{ fontWeight: 'bold' }}>{resume.education.degree}</span>
          <span style={{ opacity: 0.7 }}>
            {' '}
            — {resume.education.school} [{resume.education.period}]
          </span>
        </div>
      </Section>

      {/* Cursor blink at the bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: '18px',
          left: '44px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '16px',
          opacity: 0.8,
        }}
      >
        <span>$ ready_</span>
        <span
          style={{
            display: 'inline-block',
            width: '10px',
            height: '16px',
            background: '#ffb000',
            animation: 'crtblink 1s steps(2, start) infinite',
          }}
        />
      </div>

      <style>{`
        @keyframes crtblink { to { visibility: hidden; } }
      `}</style>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <div
        style={{
          fontSize: '14px',
          letterSpacing: '0.15em',
          opacity: 0.7,
          marginBottom: '4px',
        }}
      >
        ── {title} ──────────────────────────────────────────────
      </div>
      <div style={{ fontSize: '16px', opacity: 0.95 }}>{children}</div>
    </div>
  )
}
