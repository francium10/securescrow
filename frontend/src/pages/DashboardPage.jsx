import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'

/* ── tiny helpers ─────────────────────────── */
const ago = d => {
    const s = Math.floor((Date.now() - new Date(d)) / 1000)
    if (s < 60) return `${s}s ago`
    if (s < 3600) return `${Math.floor(s / 60)}m ago`
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`
    return `${Math.floor(s / 86400)}d ago`
}

const badge = (text, color) => (
    <span style={{
        background: `${color}22`, color, border: `1px solid ${color}44`, borderRadius: 6,
        padding: '2px 8px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase'
    }}>
        {text}
    </span>
)

const SEV = { critical: '#ff2244', high: '#ff4466', medium: '#ff8800', low: '#ffcc00' }
const STA = { pending: '#ff8800', verified: '#00ffc8', flagged: '#ff4466', completed: '#00ffc8', rejected: '#ff2244' }
const CAT = { auth: '#0080ff', transaction: '#00ffc8', document: '#a78bfa', alert: '#ff4466', system: '#888' }

/* ── stat card ────────────────────────────── */
function Stat({ label, value, accent = '#00ffc8', warn }) {
    return (
        <div style={{
            background: 'rgba(255,255,255,0.02)', border: `1px solid ${warn ? 'rgba(255,68,102,0.3)' : 'rgba(255,255,255,0.06)'}`,
            borderRadius: 14, padding: '20px 22px', flex: 1, minWidth: 120
        }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: warn ? '#ff4466' : accent, lineHeight: 1 }}>{value}</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 5 }}>{label}</div>
        </div>
    )
}

/* ── panel wrapper ────────────────────────── */
function Panel({ title, icon, children, accent = '#00ffc8' }) {
    return (
        <div style={{
            background: 'rgba(7,13,31,0.8)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column'
        }}>
            <div style={{
                padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', gap: 10
            }}>
                <span style={{ fontSize: 18 }}>{icon}</span>
                <span style={{ fontWeight: 700, fontSize: 15, color: accent }}>{title}</span>
            </div>
            <div style={{ padding: '14px 0', flex: 1, overflowY: 'auto', maxHeight: 380 }}>{children}</div>
        </div>
    )
}

/* ── row ──────────────────────────────────── */
function Row({ children }) {
    return <div style={{
        padding: '10px 22px', borderBottom: '1px solid rgba(255,255,255,0.03)',
        display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 13
    }}>{children}</div>
}

/* ── main ─────────────────────────────────── */
export default function DashboardPage() {
    const { user, logout } = useAuth()
    const nav = useNavigate()
    const [data, setData] = useState(null)
    const [err, setErr] = useState('')
    const [busy, setBusy] = useState({})

    const load = useCallback(async () => {
        try {
            const { data: d } = await api.get('/dashboard/summary')
            setData(d)
        } catch { setErr('Failed to load dashboard. Check your connection.') }
    }, [])

    useEffect(() => { load() }, [load])

    const verify = async id => {
        setBusy(b => ({ ...b, [id + 'v']: true }))
        await api.patch(`/transactions/${id}/verify`, { method: 'phone' })
        await load()
        setBusy(b => ({ ...b, [id + 'v']: false }))
    }
    const flag = async id => {
        setBusy(b => ({ ...b, [id + 'f']: true }))
        await api.patch(`/transactions/${id}/flag`, { reason: 'Flagged from dashboard' })
        await load()
        setBusy(b => ({ ...b, [id + 'f']: false }))
    }
    const resolve = async id => {
        setBusy(b => ({ ...b, [id + 'r']: true }))
        await api.patch(`/alerts/${id}/resolve`)
        await load()
        setBusy(b => ({ ...b, [id + 'r']: false }))
    }
    const doLogout = async () => { await api.post('/auth/logout').catch(() => { }); logout(); nav('/login') }

    if (err) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#ff4466' }}>{err}</div>
    if (!data) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16 }}>
            <div style={{ width: 40, height: 40, border: '3px solid rgba(0,255,200,0.2)', borderTopColor: '#00ffc8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Loading SecureEscrow…</p>
        </div>
    )

    const { stats, recentAlerts, recentTransactions, recentDocuments, recentActivity } = data

    return (
        <div style={{ minHeight: '100vh', background: '#050814' }}>

            {/* ── Navbar ── */}
            <nav style={{
                background: 'rgba(7,13,31,0.95)', borderBottom: '1px solid rgba(0,255,200,0.08)',
                padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                height: 60, position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 30, height: 30, background: 'linear-gradient(135deg,#00ffc8,#0080ff)', borderRadius: 7,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14
                    }}>🔒</div>
                    <span style={{ fontWeight: 800, fontSize: 17 }}>Secure<span style={{ color: '#00ffc8' }}>Escrow</span></span>
                    {stats.criticalAlerts > 0 && (
                        <span style={{ background: '#ff2244', color: '#fff', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700, marginLeft: 8 }}>
                            {stats.criticalAlerts} CRITICAL
                        </span>
                    )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button onClick={load} style={{ background: 'rgba(0,255,200,0.08)', border: '1px solid rgba(0,255,200,0.2)', color: '#00ffc8', borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 600 }}>↻ Refresh</button>
                    <button
                        onClick={() => nav('/pgp')}
                        style={{
                            background: 'rgba(0,255,200,0.08)', border: '1px solid rgba(0,255,200,0.2)',
                            color: '#00ffc8', borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 600
                        }}>
                        🔐 PGP Suite
                    </button>
                    <button
                        onClick={() => nav('/wire-policy')}
                        style={{
                            background: 'rgba(0,128,255,0.08)', border: '1px solid rgba(0,128,255,0.2)',
                            color: '#0080ff', borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 600
                        }}>
                        📋 Wire Policy
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                            width: 30, height: 30, background: 'linear-gradient(135deg,#0080ff,#00ffc8)', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12
                        }}>
                            {user?.name?.[0]}
                        </div>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>{user?.name}</div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'capitalize' }}>{user?.role}</div>
                        </div>
                    </div>
                    <button onClick={doLogout} style={{ background: 'rgba(255,68,102,0.1)', border: '1px solid rgba(255,68,102,0.2)', color: '#ff4466', borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 600 }}>Sign out</button>
                </div>
            </nav>

            <div style={{ padding: '28px 24px', maxWidth: 1400, margin: '0 auto' }}>

                {/* ── Stats Row ── */}
                <div style={{ display: 'flex', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
                    <Stat label="Total Transactions" value={stats.totalTransactions} accent="#00ffc8" />
                    <Stat label="Pending Verification" value={stats.pendingTransactions} accent="#ff8800" warn={stats.pendingTransactions > 0} />
                    <Stat label="Flagged Transactions" value={stats.flaggedTransactions} accent="#ff4466" warn={stats.flaggedTransactions > 0} />
                    <Stat label="Open Alerts" value={stats.openAlerts} accent="#ff8800" warn={stats.openAlerts > 0} />
                    <Stat label="Critical Alerts" value={stats.criticalAlerts} accent="#ff2244" warn={stats.criticalAlerts > 0} />
                    <Stat label="Total Documents" value={stats.totalDocuments} accent="#a78bfa" />
                </div>

                {/* ── 2-col grid (top) ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

                    {/* Alerts */}
                    <Panel title="BEC Threat Alerts" icon="⚠️" accent="#ff4466">
                        {recentAlerts.length === 0
                            ? <p style={{ padding: '16px 22px', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>No active alerts 🎉</p>
                            : recentAlerts.map(a => (
                                <Row key={a._id}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.title}</div>
                                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, lineHeight: 1.5, marginBottom: 6 }}>{a.description.slice(0, 90)}…</div>
                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                            {badge(a.severity, SEV[a.severity])}
                                            {badge(a.status, a.status === 'open' ? '#ff8800' : '#0080ff')}
                                            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, alignSelf: 'center' }}>{ago(a.createdAt)}</span>
                                        </div>
                                    </div>
                                    {a.status !== 'resolved' && (
                                        <button onClick={() => resolve(a._id)} disabled={busy[a._id + 'r']}
                                            style={{
                                                background: 'rgba(0,255,200,0.08)', border: '1px solid rgba(0,255,200,0.2)', color: '#00ffc8',
                                                borderRadius: 7, padding: '5px 11px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0
                                            }}>
                                            {busy[a._id + 'r'] ? '…' : '✓ Resolve'}
                                        </button>
                                    )}
                                </Row>
                            ))
                        }
                    </Panel>

                    {/* Wire Transfers */}
                    <Panel title="Wire Transfer Verification" icon="💸" accent="#00ffc8">
                        {recentTransactions.map(tx => (
                            <Row key={tx._id}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                                        <span style={{ fontWeight: 700, color: '#00ffc8', fontSize: 12 }}>{tx.transactionId}</span>
                                        {badge(tx.status, STA[tx.status] || '#888')}
                                        <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>{ago(tx.createdAt)}</span>
                                    </div>
                                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{tx.property}</div>
                                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                                        ${tx.amount.toLocaleString()} · Risk: <span style={{ color: tx.riskScore > 70 ? '#ff4466' : tx.riskScore > 40 ? '#ff8800' : '#00ffc8' }}>{tx.riskScore}/100</span>
                                    </div>
                                </div>
                                {tx.status === 'pending' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flexShrink: 0 }}>
                                        <button onClick={() => verify(tx._id)} disabled={busy[tx._id + 'v']}
                                            style={{ background: 'rgba(0,255,200,0.1)', border: '1px solid rgba(0,255,200,0.25)', color: '#00ffc8', borderRadius: 7, padding: '4px 10px', fontSize: 11, fontWeight: 700 }}>
                                            {busy[tx._id + 'v'] ? '…' : '✓ Verify'}
                                        </button>
                                        <button onClick={() => flag(tx._id)} disabled={busy[tx._id + 'f']}
                                            style={{ background: 'rgba(255,68,102,0.1)', border: '1px solid rgba(255,68,102,0.25)', color: '#ff4466', borderRadius: 7, padding: '4px 10px', fontSize: 11, fontWeight: 700 }}>
                                            {busy[tx._id + 'f'] ? '…' : '⚑ Flag'}
                                        </button>
                                    </div>
                                )}
                            </Row>
                        ))}
                    </Panel>
                </div>

                {/* ── 2-col grid (bottom) ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

                    {/* Documents */}
                    <Panel title="Document Exchange Activity" icon="📁" accent="#a78bfa">
                        {recentDocuments.map(doc => (
                            <Row key={doc._id}>
                                <span style={{ fontSize: 20 }}>{doc.type === 'wire_instruction' ? '📋' : doc.type === 'contract' ? '📄' : doc.type === 'deed' ? '🏠' : '🗂️'}</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.name}</div>
                                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 }}>
                                        Uploaded by {doc.uploadedBy?.name || '—'} · {ago(doc.createdAt)}
                                    </div>
                                    <div style={{ display: 'flex', gap: 6, marginTop: 5 }}>
                                        {badge(doc.status, doc.status === 'flagged' ? '#ff4466' : doc.status === 'active' ? '#00ffc8' : '#888')}
                                        {doc.encrypted && badge('🔒 PGP', '#a78bfa')}
                                        {doc.transaction && <span style={{ color: '#0080ff', fontSize: 11 }}>{doc.transaction.transactionId}</span>}
                                    </div>
                                </div>
                            </Row>
                        ))}
                    </Panel>

                    {/* Activity Log */}
                    <Panel title="Team Activity Log" icon="👥" accent="#0080ff">
                        {recentActivity.map(log => (
                            <Row key={log._id}>
                                <div style={{
                                    width: 28, height: 28, background: 'linear-gradient(135deg,#0080ff,#00ffc8)', borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11, flexShrink: 0
                                }}>
                                    {log.user?.name?.[0] || '?'}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{log.user?.name || 'Unknown'}</div>
                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, lineHeight: 1.5 }}>{log.action}</div>
                                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                                        {badge(log.category, CAT[log.category] || '#888')}
                                        <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>{ago(log.createdAt)}</span>
                                    </div>
                                </div>
                            </Row>
                        ))}
                    </Panel>
                </div>
            </div>
        </div>
    )
}