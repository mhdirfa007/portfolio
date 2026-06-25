'use client'

import { useState, useRef, useEffect } from 'react'
import { resume } from '@/lib/resume-data'

/* ============================================================================
   ComputerScreen — multi-state UI rendered on the CRT monitor via drei <Html>
   States:
     'boot'     → brief boot/loading screen
     'login'    → Windows 7-style login with password field
     'desktop'  → simple desktop with hint to insert the CD
     'document' → Word document showing the resume
============================================================================ */

export type ScreenState = 'boot' | 'login' | 'desktop' | 'document'

export function ComputerScreen({
  state,
  onLogin,
  onCloseDocument,
}: {
  state: ScreenState
  onLogin: () => void
  onCloseDocument: () => void
}) {
  if (state === 'boot') return <BootScreen />
  if (state === 'login') return <LoginScreen onLogin={onLogin} />
  if (state === 'desktop') return <DesktopScreen />
  if (state === 'document') return <ResumeDocument onClose={onCloseDocument} />
  return null
}

/* ----------------------------------------------------------------------------
   Boot screen — black with white BIOS-style text, shown briefly on power-on
---------------------------------------------------------------------------- */

function BootScreen() {
  return (
    <div style={screenBase('#000')}>
      <div style={{ color: '#cccccc', fontFamily: 'monospace', fontSize: '14px', padding: '24px' }}>
        <div style={{ marginBottom: '8px' }}>NEKO BIOS v2.4.1 — (C) 2026 NEKO Systems</div>
        <div style={{ marginBottom: '4px' }}>CPU: Intel Pentium III 850MHz</div>
        <div style={{ marginBottom: '4px' }}>Memory Test: 524288K OK</div>
        <div style={{ marginBottom: '4px' }}>Detecting IDE drives...</div>
        <div style={{ marginBottom: '4px' }}>Primary Master: CD-ROM MOHAMED_IRFAN_RESUME</div>
        <div style={{ marginBottom: '16px' }}>Booting from Hard Disk...</div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <span style={{ opacity: 0.7 }}>Starting Windows</span>
          <span className="boot-dots" />
        </div>
      </div>
      <style>{`
        .boot-dots::after {
          content: '...';
          animation: bootFade 1s steps(4, end) infinite;
        }
        @keyframes bootFade {
          0% { content: ''; }
          25% { content: '.'; }
          50% { content: '..'; }
          75% { content: '...'; }
        }
      `}</style>
    </div>
  )
}

/* ----------------------------------------------------------------------------
   Windows 7-style login screen
   - Blue gradient background
   - User avatar (orange flower placeholder)
   - "User" label
   - Password field — any password works, press Enter to log in
   - Windows 7 logo at the bottom
---------------------------------------------------------------------------- */

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('')
  const [shake, setShake] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Autofocus the password field when the login screen appears
    const t = setTimeout(() => inputRef.current?.focus(), 100)
    return () => clearTimeout(t)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Any password works (including empty) — this is a portfolio, not a real auth
    // Add a tiny "shake" feedback so it feels responsive, then log in
    if (password.length === 0) {
      setShake(true)
      setTimeout(() => setShake(false), 400)
      return
    }
    onLogin()
  }

  return (
    <div
      style={{
        ...screenBase('#1d3b8e'),
        background:
          'linear-gradient(180deg, #4a8af0 0%, #2a5fb5 40%, #1d3b8e 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
      }}
    >
      {/* User avatar + name + password field — centered */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          transform: shake ? 'translateX(-8px)' : 'translateX(0)',
          transition: 'transform 0.1s',
        }}
      >
        {/* Avatar — orange flower on light background (Windows 7 default style) */}
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '6px',
            background: 'linear-gradient(135deg, #f5d488 0%, #e8a830 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
            border: '2px solid rgba(255,255,255,0.4)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          🌼
        </div>

        {/* User name */}
        <div style={{ color: '#ffffff', fontSize: '18px', fontWeight: 600, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
          User
        </div>

        {/* Password field + arrow button */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* type="password" shows native masked dots (•) as the user types.
              The input autofocuses when the login screen appears (see the
              useEffect with inputRef.current?.focus() above). */}
          <input
            ref={inputRef}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="off"
            style={{
              width: '180px',
              padding: '6px 10px',
              fontSize: '14px',
              border: '1px solid rgba(255,255,255,0.5)',
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '2px',
              outline: 'none',
              fontFamily: 'Segoe UI, Tahoma, sans-serif',
              letterSpacing: '2px',
              color: '#000',
            }}
          />
          {/* Blue circular arrow button — Windows 7 style */}
          <button
            type="submit"
            aria-label="Log in"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.6)',
              background: 'linear-gradient(180deg, #6ba3f5 0%, #2a5fb5 100%)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              padding: 0,
            }}
          >
            ➜
          </button>
        </form>
        {shake && (
          <div style={{ color: '#ffcccc', fontSize: '12px' }}>Please enter a password (any will do)</div>
        )}
      </div>

      {/* Windows 7 logo at the bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'rgba(255,255,255,0.85)',
          fontSize: '14px',
          fontFamily: 'Segoe UI, Tahoma, sans-serif',
          textShadow: '0 1px 2px rgba(0,0,0,0.4)',
        }}
      >
        <span style={{ fontSize: '18px' }}>🪟</span>
        <span>Windows 7</span>
      </div>

      {/* Hint text */}
      <div
        style={{
          position: 'absolute',
          bottom: '50px',
          color: 'rgba(255,255,255,0.6)',
          fontSize: '11px',
          fontFamily: 'Segoe UI, Tahoma, sans-serif',
        }}
      >
        Type any password and press Enter to log in
      </div>
    </div>
  )
}

/* ----------------------------------------------------------------------------
   Desktop — simple Windows 7 desktop with a hint to insert the CD
---------------------------------------------------------------------------- */

function DesktopScreen() {
  return (
    <div
      style={{
        ...screenBase('#0a5a2a'),
        background:
          'linear-gradient(180deg, #2d8c4e 0%, #1a6e3a 50%, #0a4a20 100%)',
        padding: '30px',
        position: 'relative',
      }}
    >
      {/* Desktop icon: My Computer */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          width: '80px',
        }}
      >
        <div style={{ fontSize: '40px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}>💻</div>
        <div
          style={{
            color: 'white',
            fontSize: '12px',
            textAlign: 'center',
            fontFamily: 'Segoe UI, Tahoma, sans-serif',
            textShadow: '0 1px 2px rgba(0,0,0,0.8)',
          }}
        >
          My Computer
        </div>
      </div>

      {/* Hint to insert CD — centered */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0,0,0,0.6)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '6px',
          padding: '20px 30px',
          color: 'white',
          fontFamily: 'Segoe UI, Tahoma, sans-serif',
          textAlign: 'center',
          maxWidth: '70%',
        }}
      >
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>💿</div>
        <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>
          Welcome, User!
        </div>
        <div style={{ fontSize: '12px', opacity: 0.9 }}>
          Click the CD case on the desk to view the resume
        </div>
      </div>

      {/* Taskbar at the bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '28px',
          background: 'linear-gradient(180deg, rgba(40,80,160,0.95) 0%, rgba(20,40,100,0.95) 100%)',
          borderTop: '1px solid rgba(255,255,255,0.3)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 8px',
          gap: '8px',
        }}
      >
        {/* Start button */}
        <div
          style={{
            background: 'linear-gradient(180deg, #4a9a4a 0%, #2a7a2a 100%)',
            borderRadius: '3px',
            padding: '3px 10px',
            color: 'white',
            fontSize: '11px',
            fontFamily: 'Segoe UI, Tahoma, sans-serif',
            fontWeight: 600,
            border: '1px solid rgba(255,255,255,0.4)',
          }}
        >
          ⊞ Start
        </div>
        <div style={{ color: 'white', fontSize: '11px', fontFamily: 'Segoe UI, Tahoma, sans-serif', opacity: 0.7 }}>
          Desktop
        </div>
      </div>
    </div>
  )
}

/* ----------------------------------------------------------------------------
   Resume document — styled like Microsoft Word with the ribbon toolbar and
   a white document page showing the resume content.
---------------------------------------------------------------------------- */

function ResumeDocument({ onClose }: { onClose: () => void }) {
  // Print / download the resume as a self-contained HTML file.
  // We generate a printable HTML document with all the resume content and
  // trigger an automatic download. The file can be opened in any browser and
  // printed to PDF from there if needed.
  const handlePrint = () => {
    const html = generatePrintableResume()
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'Mohamed_Irfan_Resume.html'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    // Revoke the URL after a short delay to ensure the download starts
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <div
      style={{
        ...screenBase('#d4d0c8'),
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Segoe UI, Tahoma, sans-serif',
      }}
    >
      {/* ---- Word ribbon toolbar (simplified) ---- */}
      <div
        style={{
          background: 'linear-gradient(180deg, #4a7ac8 0%, #2a5aa8 100%)',
          color: 'white',
          padding: '4px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '12px',
          fontWeight: 600,
          borderBottom: '1px solid #1a3a78',
          flexShrink: 0,
        }}
      >
        <span style={{ fontWeight: 700 }}>📄 Word</span>
        <span style={{ opacity: 0.8 }}>| Resume.docx</span>
        {/* Print button — downloads the resume as a printable HTML file */}
        <button
          onClick={handlePrint}
          style={{
            marginLeft: 'auto',
            background: 'linear-gradient(180deg, #5a8ad8 0%, #3a6ab8 100%)',
            border: '1px solid rgba(255,255,255,0.5)',
            color: 'white',
            padding: '3px 12px',
            fontSize: '11px',
            cursor: 'pointer',
            borderRadius: '2px',
            fontWeight: 600,
          }}
          title="Download resume as printable HTML"
        >
          🖨 Print
        </button>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.4)',
            color: 'white',
            padding: '2px 10px',
            fontSize: '11px',
            cursor: 'pointer',
            borderRadius: '2px',
          }}
        >
          ✕ Close
        </button>
      </div>

      {/* ---- Ribbon tabs (Home / Insert / Page Layout) ---- */}
      <div
        style={{
          background: '#e8e4dc',
          padding: '2px 10px',
          display: 'flex',
          gap: '12px',
          fontSize: '11px',
          color: '#333',
          borderBottom: '1px solid #aaa',
          flexShrink: 0,
        }}
      >
        <span style={{ color: '#2a5aa8', borderBottom: '2px solid #2a5aa8', paddingBottom: '2px' }}>Home</span>
        <span style={{ opacity: 0.7 }}>Insert</span>
        <span style={{ opacity: 0.7 }}>Page Layout</span>
        <span style={{ opacity: 0.7 }}>References</span>
      </div>

      {/* ---- Document page (scrollable) ---- */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          background: '#888',
          padding: '10px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            background: 'white',
            width: '100%',
            maxWidth: '520px',
            padding: '20px 24px',
            color: '#000',
            fontFamily: '"Calibri", "Times New Roman", serif',
            fontSize: '11px',
            lineHeight: '1.4',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          }}
        >
          {/* Header — name + contact */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #333', paddingBottom: '8px', marginBottom: '10px' }}>
            <div style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '1px' }}>
              {resume.name}
            </div>
            <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>
              {resume.title}
            </div>
            <div style={{ fontSize: '9px', color: '#666', marginTop: '4px' }}>
              {resume.contact.email} · {resume.contact.phone} · {resume.contact.location}
            </div>
            <div style={{ fontSize: '9px', color: '#666' }}>
              {resume.contact.github} · {resume.contact.linkedin}
            </div>
          </div>

          {/* Objective */}
          <DocSection title="OBJECTIVE">
            <p style={{ margin: 0 }}>{resume.summary}</p>
          </DocSection>

          {/* Education */}
          <DocSection title="EDUCATION">
            <div style={{ marginBottom: '4px' }}>
              <strong>{resume.education.degree}</strong>
              <br />
              <span style={{ color: '#555' }}>{resume.education.school} · {resume.education.period}</span>
              <br />
              <span style={{ color: '#555' }}>{resume.education.detail}</span>
            </div>
          </DocSection>

          {/* Skills */}
          <DocSection title="SKILLS">
            <table style={{ width: '100%', fontSize: '10px', borderCollapse: 'collapse' }}>
              <tbody>
                <tr><td style={{ fontWeight: 600, width: '25%', verticalAlign: 'top', paddingRight: '8px' }}>Languages</td><td>{resume.skills.languages.join(', ')}</td></tr>
                <tr><td style={{ fontWeight: 600, verticalAlign: 'top', paddingRight: '8px' }}>Frameworks</td><td>{resume.skills.frameworks.join(', ')}</td></tr>
                <tr><td style={{ fontWeight: 600, verticalAlign: 'top', paddingRight: '8px' }}>Tools</td><td>{resume.skills.tools.join(', ')}</td></tr>
                <tr><td style={{ fontWeight: 600, verticalAlign: 'top', paddingRight: '8px' }}>Databases</td><td>{resume.skills.databases.join(', ')}</td></tr>
              </tbody>
            </table>
          </DocSection>

          {/* Experience */}
          <DocSection title="EXPERIENCE">
            {resume.experience.map((exp) => (
              <div key={exp.company} style={{ marginBottom: '6px' }}>
                <div>
                  <strong>{exp.role}</strong> — {exp.company}
                  <span style={{ color: '#555', float: 'right' }}>{exp.period}</span>
                </div>
                <ul style={{ margin: '2px 0 0 14px', padding: 0, fontSize: '10px' }}>
                  {exp.highlights.map((h, i) => (
                    <li key={i} style={{ marginBottom: '2px' }}>{h}</li>
                  ))}
                </ul>
              </div>
            ))}
          </DocSection>

          {/* Projects */}
          <DocSection title="PROJECTS">
            {resume.projects.map((p) => (
              <div key={p.name} style={{ marginBottom: '5px' }}>
                <div>
                  <strong>{p.name}</strong>
                  <span style={{ color: '#555' }}> ({p.year}) — {p.stack}</span>
                </div>
                <div style={{ fontSize: '10px', color: '#333' }}>{p.description}</div>
              </div>
            ))}
          </DocSection>

          {/* Certifications */}
          <DocSection title="CERTIFICATIONS">
            <ul style={{ margin: '0 0 0 14px', padding: 0, fontSize: '10px' }}>
              {resume.certifications.map((c, i) => (
                <li key={i} style={{ marginBottom: '1px' }}>
                  {c.name} <span style={{ color: '#666' }}>({c.expiry})</span>
                </li>
              ))}
            </ul>
          </DocSection>

          {/* Achievements + Leadership side by side */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <DocSection title="ACHIEVEMENTS">
                <ul style={{ margin: '0 0 0 14px', padding: 0, fontSize: '10px' }}>
                  {resume.achievements.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </DocSection>
            </div>
            <div style={{ flex: 1 }}>
              <DocSection title="LEADERSHIP">
                <ul style={{ margin: '0 0 0 14px', padding: 0, fontSize: '10px' }}>
                  {resume.leadership.map((l, i) => (
                    <li key={i}>{l}</li>
                  ))}
                </ul>
              </DocSection>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DocSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '8px' }}>
      <div
        style={{
          fontSize: '11px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          color: '#2a5aa8',
          borderBottom: '1px solid #ccc',
          paddingBottom: '2px',
          marginBottom: '4px',
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: '10px' }}>{children}</div>
    </div>
  )
}

/* ----------------------------------------------------------------------------
   Shared style
---------------------------------------------------------------------------- */

function screenBase(bg: string): React.CSSProperties {
  return {
    width: '1024px',
    height: '768px',
    background: bg,
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'Segoe UI, Tahoma, sans-serif',
  }
}

/* ----------------------------------------------------------------------------
   generatePrintableResume — produces a self-contained, print-ready HTML
   document with the full resume content. When the Print button is clicked,
   this HTML is downloaded as "Mohamed_Irfan_Resume.html". The file opens in
   any browser and can be printed to PDF via Ctrl+P / Cmd+P.
---------------------------------------------------------------------------- */

function generatePrintableResume(): string {
  const r = resume
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${r.name} — Resume</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Calibri', 'Segoe UI', 'Arial', sans-serif;
    color: #1a1a1a;
    background: #f0f0f0;
    padding: 20px;
    line-height: 1.5;
  }
  .page {
    max-width: 800px;
    margin: 0 auto;
    background: white;
    padding: 40px 50px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
  .header {
    text-align: center;
    border-bottom: 3px solid #2a5aa8;
    padding-bottom: 12px;
    margin-bottom: 16px;
  }
  .header h1 { font-size: 28px; letter-spacing: 1px; color: #1a1a1a; }
  .header .title { font-size: 14px; color: #555; margin-top: 2px; }
  .header .contact { font-size: 11px; color: #666; margin-top: 6px; }
  .header .links { font-size: 11px; color: #666; margin-top: 2px; }
  h2 {
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #2a5aa8;
    border-bottom: 1px solid #ccc;
    padding-bottom: 3px;
    margin: 16px 0 8px;
  }
  .summary { font-size: 12px; }
  .skills-table { width: 100%; font-size: 12px; border-collapse: collapse; }
  .skills-table td { padding: 2px 8px 2px 0; vertical-align: top; }
  .skills-table td.label { font-weight: 600; width: 120px; }
  .exp-item, .proj-item { margin-bottom: 8px; font-size: 12px; }
  .exp-item .role-line, .proj-item .name-line { font-weight: 600; }
  .exp-item .period { float: right; color: #666; font-weight: normal; }
  ul { margin: 2px 0 0 16px; font-size: 12px; }
  ul li { margin-bottom: 2px; }
  .edu-line { font-size: 12px; }
  .edu-line .degree { font-weight: 600; }
  .edu-line .detail { color: #555; }
  .two-col { display: flex; gap: 24px; }
  .two-col > div { flex: 1; }
  @media print {
    body { background: white; padding: 0; }
    .page { box-shadow: none; padding: 0; max-width: none; }
  }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <h1>${r.name}</h1>
    <div class="title">${r.title}</div>
    <div class="contact">${r.contact.email} · ${r.contact.phone} · ${r.contact.location}</div>
    <div class="links">${r.contact.github} · ${r.contact.linkedin}</div>
  </div>

  <h2>Objective</h2>
  <div class="summary">${r.summary}</div>

  <h2>Education</h2>
  <div class="edu-line">
    <span class="degree">${r.education.degree}</span> — ${r.education.school}
    <span class="detail">[${r.education.period}] | ${r.education.detail}</span>
  </div>

  <h2>Skills</h2>
  <table class="skills-table">
    <tr><td class="label">Languages</td><td>${r.skills.languages.join(', ')}</td></tr>
    <tr><td class="label">Frameworks</td><td>${r.skills.frameworks.join(', ')}</td></tr>
    <tr><td class="label">Tools</td><td>${r.skills.tools.join(', ')}</td></tr>
    <tr><td class="label">Databases</td><td>${r.skills.databases.join(', ')}</td></tr>
  </table>

  <h2>Experience</h2>
  ${r.experience.map(exp => `
  <div class="exp-item">
    <div class="role-line">${exp.role} — ${exp.company}<span class="period">${exp.period}</span></div>
    <ul>${exp.highlights.map(h => `<li>${h}</li>`).join('')}</ul>
  </div>`).join('')}

  <h2>Projects</h2>
  ${r.projects.map(p => `
  <div class="proj-item">
    <div class="name-line">${p.name} <span style="font-weight:normal;color:#666">(${p.year}) — ${p.stack}</span></div>
    <div style="color:#333">${p.description}</div>
  </div>`).join('')}

  <h2>Certifications</h2>
  <ul>${r.certifications.map(c => `<li>${c.name} <span style="color:#666">(${c.expiry})</span></li>`).join('')}</ul>

  <div class="two-col">
    <div>
      <h2>Achievements</h2>
      <ul>${r.achievements.map(a => `<li>${a}</li>`).join('')}</ul>
    </div>
    <div>
      <h2>Leadership</h2>
      <ul>${r.leadership.map(l => `<li>${l}</li>`).join('')}</ul>
    </div>
  </div>
</div>
</body>
</html>`
}
