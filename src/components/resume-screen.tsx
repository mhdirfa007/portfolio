'use client'

import { resume } from '@/lib/resume-data'

/**
 * This component is rendered into 3D space via drei <Html transform> and
 * mapped onto the CRT monitor screen. Laid out for a 1024x768 (4:3) screen.
 * Tuned for the retro CRT phosphor look (amber on black, monospace).
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
        fontSize: '16px',
        lineHeight: '1.2',
        padding: '20px 32px 32px',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
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
          paddingBottom: '4px',
          borderBottom: '1px solid rgba(255, 176, 0, 0.4)',
          marginBottom: '8px',
          fontSize: '13px',
        }}
      >
        <span style={{ letterSpacing: '0.1em' }}>/home/irfan/resume.txt</span>
        <span style={{ opacity: 0.7 }}>— MAIN —</span>
      </div>

      {/* Name + title */}
      <div style={{ marginBottom: '2px', fontSize: '28px', letterSpacing: '0.05em' }}>
        {resume.name}
      </div>
      <div style={{ fontSize: '17px', opacity: 0.85, marginBottom: '2px' }}>
        {'> '}
        {resume.title}
      </div>
      <div style={{ opacity: 0.6, marginBottom: '8px', fontSize: '14px' }}>{'// '}{resume.tagline}</div>

      {/* Contact line */}
      <div
        style={{
          fontSize: '12px',
          opacity: 0.75,
          marginBottom: '4px',
          display: 'flex',
          gap: '6px 14px',
          flexWrap: 'wrap',
        }}
      >
        <span>MAIL: {resume.contact.email}</span>
        <span>TEL: {resume.contact.phone}</span>
      </div>
      <div
        style={{
          fontSize: '12px',
          opacity: 0.7,
          marginBottom: '10px',
          display: 'flex',
          gap: '6px 14px',
          flexWrap: 'wrap',
        }}
      >
        <span>LOC: {resume.contact.location}</span>
        <span>GIT: {resume.contact.github}</span>
        <span>IN: {resume.contact.linkedin}</span>
      </div>

      {/* Objective */}
      <Section title="OBJECTIVE">
        <div style={{ maxWidth: '94%', fontSize: '14px' }}>{resume.summary}</div>
      </Section>

      {/* Skills (categorized) */}
      <Section title="SKILLS">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          <SkillRow label="LANG" items={resume.skills.languages} />
          <SkillRow label="FWK" items={resume.skills.frameworks} />
          <SkillRow label="TOOLS" items={resume.skills.tools} />
          <SkillRow label="DB" items={resume.skills.databases} />
        </div>
      </Section>

      {/* Experience */}
      <Section title="EXPERIENCE">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {resume.experience.map((exp) => (
            <div key={exp.company}>
              <div>
                <span style={{ opacity: 0.7 }}>[{exp.period}]</span> {exp.role} @{' '}
                <span style={{ fontWeight: 'bold' }}>{exp.company}</span>
              </div>
              <ul style={{ margin: '1px 0 0 14px', padding: 0, listStyle: 'none' }}>
                {exp.highlights.map((h, i) => (
                  <li key={i} style={{ opacity: 0.85, fontSize: '12px', lineHeight: '1.25' }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {resume.projects.map((p) => (
            <div key={p.name}>
              <span style={{ fontWeight: 'bold' }}>{p.name}</span>
              <span style={{ opacity: 0.6 }}> [{p.year}] ({p.stack})</span>
              <div style={{ opacity: 0.85, paddingLeft: '12px', fontSize: '12px', lineHeight: '1.25' }}>
                — {p.description}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Education */}
      <Section title="EDUCATION">
        <div>
          <span style={{ fontWeight: 'bold' }}>{resume.education.degree}</span>
          <span style={{ opacity: 0.7 }}> — {resume.education.school} [{resume.education.period}]</span>
          <span style={{ opacity: 0.9 }}> | {resume.education.detail}</span>
        </div>
      </Section>

      {/* Certifications */}
      <Section title="CERTIFICATIONS">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', fontSize: '11px', lineHeight: '1.2' }}>
          {resume.certifications.map((c, i) => (
            <div key={i}>
              - {c.name} <span style={{ opacity: 0.6 }}>({c.expiry})</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Achievements + Leadership side by side */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '4px' }}>
        <div style={{ flex: 1 }}>
          <SectionTitle title="ACHIEVEMENTS" />
          <ul style={{ margin: '1px 0 0 12px', padding: 0, listStyle: 'none', fontSize: '11px', lineHeight: '1.2' }}>
            {resume.achievements.map((a, i) => (
              <li key={i} style={{ opacity: 0.85 }}>
                - {a}
              </li>
            ))}
          </ul>
        </div>
        <div style={{ flex: 1 }}>
          <SectionTitle title="LEADERSHIP" />
          <ul style={{ margin: '1px 0 0 12px', padding: 0, listStyle: 'none', fontSize: '11px', lineHeight: '1.2' }}>
            {resume.leadership.map((l, i) => (
              <li key={i} style={{ opacity: 0.85 }}>
                - {l}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Cursor blink at the bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          left: '32px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          opacity: 0.8,
        }}
      >
        <span>$ ready_</span>
        <span
          style={{
            display: 'inline-block',
            width: '8px',
            height: '13px',
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

function SkillRow({ label, items }: { label: string; items: string[] }) {
  return (
    <div style={{ display: 'flex', gap: '8px', fontSize: '12px', lineHeight: '1.25' }}>
      <span style={{ opacity: 0.6, minWidth: '46px' }}>{label}:</span>
      <span style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 6px' }}>
        {items.map((s, i) => (
          <span key={s}>
            {s}
            {i < items.length - 1 ? <span style={{ opacity: 0.4 }}>,</span> : null}
          </span>
        ))}
      </span>
    </div>
  )
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div
      style={{
        fontSize: '12px',
        letterSpacing: '0.15em',
        opacity: 0.7,
        marginBottom: '1px',
      }}
    >
      ── {title} ──────────────────────────
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '6px' }}>
      <SectionTitle title={title} />
      <div style={{ fontSize: '13px', opacity: 0.95 }}>{children}</div>
    </div>
  )
}
