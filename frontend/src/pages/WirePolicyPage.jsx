import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const C = {
    bg: '#050814', bg2: '#070d1f', bg3: '#0d1a3a',
    p: '#00ffc8', b: '#0080ff', w: '#ff8800', d: '#ff4466', v: '#a78bfa',
    border: 'rgba(255,255,255,0.07)', ba: 'rgba(0,255,200,0.2)', muted: 'rgba(255,255,255,0.4)',
}

const Tag = ({ c = C.p, t }) => (
    <span style={{
        background: `${c}20`, color: c, border: `1px solid ${c}35`, borderRadius: 6,
        padding: '2px 8px', fontSize: 10, fontWeight: 700, flexShrink: 0, letterSpacing: '0.3px'
    }}>{t}</span>
)

/* ═══════════════════════════════════════════════════
   POLICY DOCUMENT
═══════════════════════════════════════════════════ */
const RULES = [
    {
        n: '§1', title: 'No Wire Instructions via Email Alone', sev: 'critical', icon: '📵',
        text: 'Wire transfer instructions received solely by email must never be acted upon. Email is the primary attack vector for BEC fraud. All instructions require independent out-of-band confirmation.'
    },
    {
        n: '§2', title: 'Mandatory Out-of-Band Phone Verification', sev: 'critical', icon: '📞',
        text: 'Before executing any transfer, the responsible agent must call the recipient at a number obtained from a previously verified source — never from the email chain. The call must be logged with timestamp, agent ID, and a verbal confirmation code.'
    },
    {
        n: '§3', title: 'Dual Authorization Required for All Transfers', sev: 'critical', icon: '👥',
        text: 'No single individual may authorize a wire transfer. Two separate authorized officers must independently review and approve all wire details. Self-approval is strictly prohibited.'
    },
    {
        n: '§4', title: 'PGP Digital Signature Mandatory', sev: 'critical', icon: '🔐',
        text: 'All wire instructions must carry a valid PGP digital signature from the authorized signatory verified against their registered public key. Instructions without a valid signature must be rejected.'
    },
    {
        n: '§5', title: '48-Hour Change Freeze Protocol', sev: 'high', icon: '⏰',
        text: 'Any modification to wire instructions within 48 hours of closing automatically triggers a full re-verification cycle. The transfer must be halted. This is the most common window for BEC attackers to insert fraudulent changes.'
    },
    {
        n: '§6', title: 'AI Risk Score Escalation', sev: 'high', icon: '🤖',
        text: 'Transactions scoring above 60/100 on the AI risk model must be escalated to senior management before proceeding. Key risk factors: new wire destination, account changed within 72hrs, email domain mismatch, off-hours submission.'
    },
    {
        n: '§7', title: 'Immutable Audit Trail Requirement', sev: 'medium', icon: '📋',
        text: 'Every action in the verification process must be logged with user ID, IP address, timestamp, and action type. Logs are immutable and retained for 7 years per RESPA/CFPB requirements.'
    },
]
const SEV_C = { critical: '#ff4466', high: '#ff8800', medium: '#ffcc00' }

function PolicyDoc() {
    return (
        <div>
            <div style={{ background: 'rgba(0,128,255,0.06)', border: '1px solid rgba(0,128,255,0.22)', borderRadius: 10, padding: 16, marginBottom: 18 }}>
                <div style={{ fontWeight: 700, color: C.b, marginBottom: 5, fontSize: 14 }}>📋 SecureEscrow Wire Transfer Verification Policy — v1.0</div>
                <div style={{ color: C.muted, fontSize: 12, lineHeight: 1.7 }}>
                    <strong style={{ color: '#fff' }}>Effective:</strong> January 2025 &nbsp;·&nbsp;
                    <strong style={{ color: '#fff' }}>Scope:</strong> All real estate wire transfers &nbsp;·&nbsp;
                    <strong style={{ color: '#fff' }}>Aligned with:</strong> FBI IC3 BEC Guidelines, CFPB RESPA, ALTA Best Practices Pillar 4
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {RULES.map(r => (
                    <div key={r.n} style={{
                        background: C.bg2, borderLeft: `3px solid ${SEV_C[r.sev]}`,
                        borderRadius: '0 10px 10px 0', padding: 14, border: `1px solid ${SEV_C[r.sev]}15`, borderLeftWidth: 3
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 16 }}>{r.icon}</span>
                            <span style={{ color: SEV_C[r.sev], fontWeight: 800, fontSize: 12 }}>{r.n}</span>
                            <span style={{ fontWeight: 700, fontSize: 14 }}>{r.title}</span>
                            <Tag c={SEV_C[r.sev]} t={r.sev.toUpperCase()} />
                        </div>
                        <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.75, margin: 0 }}>{r.text}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

/* ═══════════════════════════════════════════════════
   WORKFLOW SIMULATOR
═══════════════════════════════════════════════════ */
const STEPS = [
    {
        id: 'submit', n: '01', title: 'Initial Submission', icon: '📋', col: C.b,
        action: 'Submit Wire Details',
        detail: 'Agent submits wire transfer details via SecureEscrow portal. System computes AI risk score and checks against flagged accounts.',
        checks: ['Property address confirmed', 'Transfer amount entered', 'Recipient bank & account provided', 'AI risk score computed (< 60 threshold)']
    },
    {
        id: 'phone', n: '02', title: 'Out-of-Band Phone Verification', icon: '📞', col: C.w,
        action: 'Mark Phone Call Completed',
        detail: 'Agent calls the recipient at a number from an independently verified source. Verbally confirms all wire details. NOT the number from the email.',
        checks: ['Called verified phone number (not from email)', 'Verbally confirmed: bank, account, amount', 'Call timestamp and duration logged', 'Agent ID and confirmation code recorded']
    },
    {
        id: 'dual', n: '03', title: 'Second Officer Authorization', icon: '👥', col: C.v,
        action: 'Second Officer Approves',
        detail: 'A separate authorized officer independently reviews all wire details, confirms PGP signature is valid, and provides authorization. No self-approval.',
        checks: ['Second officer reviewed all wire details', 'PGP digital signature verified as valid', 'Dual-control authorization form signed', 'Both officer IDs recorded in audit log']
    },
    {
        id: 'release', n: '04', title: 'Final Compliance & Release', icon: '🚀', col: C.p,
        action: 'Authorize & Release Transfer',
        detail: 'System validates all three prior steps are complete, performs final AI risk check, and releases the wire transfer for processing.',
        checks: ['All 3 prior steps verified ✓', 'PGP signature confirmed valid ✓', 'Final AI risk score below threshold ✓', 'Compliance officer notified ✓']
    },
]

function WireWorkflow() {
    const [done, setDone] = useState([])
    const [active, setActive] = useState(0)
    const [auth, setAuth] = useState(false)

    const complete = i => {
        setDone(p => [...p, STEPS[i].id])
        if (i < STEPS.length - 1) setActive(i + 1)
        else setAuth(true)
    }
    const reset = () => { setDone([]); setActive(0); setAuth(false) }
    const pct = (done.length / STEPS.length) * 100

    return (
        <div>
            <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.75, marginBottom: 16 }}>
                Simulates the mandatory 4-step wire transfer verification workflow. Each step must be completed in order — skipping is not permitted.
            </p>

            {auth && (
                <div style={{
                    background: 'rgba(0,255,200,0.07)', border: `2px solid ${C.p}`, borderRadius: 14,
                    padding: 24, textAlign: 'center', marginBottom: 20
                }}>
                    <div style={{ fontSize: 44, marginBottom: 10 }}>✅</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: C.p, marginBottom: 4 }}>WIRE TRANSFER AUTHORIZED</div>
                    <div style={{ color: C.muted, fontSize: 13, maxWidth: 400, margin: '0 auto' }}>
                        All 4 verification steps completed and logged. Wire transfer cleared for processing. Audit trail saved.
                    </div>
                    <button onClick={reset} style={{
                        marginTop: 16, background: 'transparent', border: `1px solid ${C.ba}`,
                        color: C.p, borderRadius: 8, padding: '8px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer'
                    }}>
                        ↺ Reset Simulation
                    </button>
                </div>
            )}

            {/* Progress bar */}
            <div style={{ background: C.bg3, borderRadius: 100, height: 5, marginBottom: 20, overflow: 'hidden' }}>
                <div style={{
                    background: `linear-gradient(90deg,${C.p},${C.b})`, height: '100%',
                    width: `${pct}%`, transition: 'width .5s ease', borderRadius: 100
                }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <span style={{ color: C.muted, fontSize: 12 }}>Progress: {done.length}/{STEPS.length} steps</span>
                <span style={{ color: pct === 100 ? C.p : C.w, fontWeight: 700, fontSize: 12 }}>
                    {pct === 100 ? '✅ COMPLETE' : `${Math.round(pct)}% Complete`}
                </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {STEPS.map((s, i) => {
                    const isDone = done.includes(s.id)
                    const isActive = i === active && !isDone
                    const isLocked = i > active
                    return (
                        <div key={s.id} style={{
                            background: isDone ? 'rgba(0,255,200,0.04)' : isActive ? C.bg2 : C.bg,
                            border: `1px solid ${isDone ? C.p : isActive ? s.col : C.border}${isDone ? '40' : '20'}`,
                            borderRadius: 12, overflow: 'hidden', opacity: isLocked ? .38 : 1, transition: 'all .3s',
                        }}>
                            <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{
                                    width: 44, height: 44, flexShrink: 0, borderRadius: 10,
                                    background: isDone ? `${C.p}20` : isActive ? `${s.col}20` : 'rgba(255,255,255,0.03)',
                                    border: `2px solid ${isDone ? C.p : isActive ? s.col : 'transparent'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isActive || isDone ? 20 : 16,
                                }}>{isDone ? '✅' : s.icon}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                                        <span style={{ color: isDone ? C.p : isActive ? s.col : C.muted, fontWeight: 800, fontSize: 11 }}>{s.n}</span>
                                        <span style={{ fontWeight: 700, fontSize: 14, color: isDone || isActive ? '#fff' : C.muted }}>{s.title}</span>
                                        {isDone && <Tag c={C.p} t="COMPLETED" />}
                                        {isActive && <Tag c={s.col} t="ACTION REQUIRED" />}
                                        {isLocked && <Tag c={C.muted} t="LOCKED — COMPLETE PRIOR STEP" />}
                                    </div>
                                    <p style={{ color: C.muted, fontSize: 12, margin: 0, lineHeight: 1.55 }}>{s.detail}</p>
                                </div>
                                {isActive && (
                                    <button onClick={() => complete(i)} style={{
                                        background: `${s.col}20`, border: `1px solid ${s.col}50`, color: s.col,
                                        borderRadius: 8, padding: '10px 16px', fontSize: 12, fontWeight: 700,
                                        cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
                                    }}>{s.action} →</button>
                                )}
                            </div>
                            {isActive && (
                                <div style={{ borderTop: `1px solid ${C.border}`, padding: '12px 18px 14px' }}>
                                    <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Checklist for this step:</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {s.checks.map(ch => (
                                            <div key={ch} style={{
                                                background: C.bg3, border: `1px solid ${s.col}20`, borderRadius: 6,
                                                padding: '5px 10px', fontSize: 11, color: C.muted, display: 'flex', alignItems: 'center', gap: 5
                                            }}>
                                                <span style={{ color: s.col, fontWeight: 700 }}>☐</span>{ch}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

/* ═══════════════════════════════════════════════════
   PAGE EXPORT
═══════════════════════════════════════════════════ */
const POLICY_TABS = [
    { id: 'doc', label: '📋 Policy Document' },
    { id: 'sim', label: '🔄 Workflow Simulator' },
]

export default function WirePolicyPage() {
    const nav = useNavigate()
    const [sub, setSub] = useState('doc')

    return (
        <div style={{ fontFamily: '-apple-system,BlinkMacSystemFont,sans-serif', minHeight: '100vh', background: C.bg, color: '#fff' }}>
            {/* Navbar */}
            <nav style={{
                background: 'rgba(7,13,31,0.95)', borderBottom: '1px solid rgba(0,128,255,0.1)', padding: '0 24px',
                display: 'flex', alignItems: 'center', gap: 16, height: 60, position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)'
            }}>
                <div style={{
                    width: 28, height: 28, background: 'linear-gradient(135deg,#00ffc8,#0080ff)', borderRadius: 7,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14
                }}>🔒</div>
                <span style={{ fontWeight: 800, fontSize: 16 }}>Secure<span style={{ color: C.p }}>Escrow</span></span>
                <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
                <span style={{ color: C.b, fontWeight: 700 }}>📋 Wire Transfer Verification Policy</span>
                <div style={{ flex: 1 }} />
                <button onClick={() => nav('/dashboard')}
                    style={{
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.6)', borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: 'pointer', fontWeight: 600
                    }}>
                    ← Back to Dashboard
                </button>
            </nav>

            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 24px 60px' }}>
                <div style={{ background: 'rgba(0,128,255,0.05)', border: '1px solid rgba(0,128,255,0.2)', borderRadius: 10, padding: 14, marginBottom: 20 }}>
                    <p style={{ margin: 0, color: C.muted, fontSize: 13, lineHeight: 1.7 }}>
                        The <strong style={{ color: '#fff' }}>Policy Document</strong> defines the legal and procedural rules every team member must follow.
                        The <strong style={{ color: '#fff' }}>Workflow Simulator</strong> demonstrates the enforced 4-step verification process for every wire transfer.
                    </p>
                </div>

                {/* Sub-tabs */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
                    {POLICY_TABS.map(t => (
                        <button key={t.id} onClick={() => setSub(t.id)} style={{
                            background: sub === t.id ? 'rgba(0,128,255,0.12)' : 'transparent',
                            border: `1px solid ${sub === t.id ? C.b : 'rgba(255,255,255,0.07)'}`,
                            color: sub === t.id ? C.b : 'rgba(255,255,255,0.4)',
                            borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all .2s',
                        }}>{t.label}</button>
                    ))}
                </div>

                {sub === 'doc' && <PolicyDoc />}
                {sub === 'sim' && <WireWorkflow />}
            </div>
        </div>
    )
}