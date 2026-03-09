import { useNavigate } from 'react-router-dom'

export default function WirePolicyPage() {
    const nav = useNavigate()
    return (
        <div style={{ fontFamily: '-apple-system,sans-serif', minHeight: '100vh', background: '#050814', color: '#fff' }}>
            <nav style={{
                background: 'rgba(7,13,31,0.95)', borderBottom: '1px solid rgba(0,128,255,0.1)',
                padding: '0 24px', display: 'flex', alignItems: 'center', gap: 16, height: 60,
                position: 'sticky', top: 0, zIndex: 50
            }}>
                <div style={{
                    width: 28, height: 28, background: 'linear-gradient(135deg,#00ffc8,#0080ff)',
                    borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14
                }}>🔒</div>
                <span style={{ fontWeight: 800, fontSize: 16 }}>Secure<span style={{ color: '#00ffc8' }}>Escrow</span></span>
                <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
                <span style={{ color: '#0080ff', fontWeight: 700 }}>📋 Wire Transfer Verification Policy</span>
                <div style={{ flex: 1 }} />
                <button onClick={() => nav('/dashboard')}
                    style={{
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.6)', borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: 'pointer'
                    }}>
                    ← Back to Dashboard
                </button>
            </nav>
            <div style={{ maxWidth: 1300, margin: '0 auto', padding: 24 }}>
                {/* Copy the WirePolicy component from the interactive demo artifact into this file */}
                <div style={{
                    background: 'rgba(0,128,255,0.05)', border: '1px solid rgba(0,128,255,0.2)',
                    borderRadius: 14, padding: 32, textAlign: 'center'
                }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                    <p style={{ color: 'rgba(255,255,255,0.6)' }}>
                        Copy the <strong style={{ color: '#0080ff' }}>WirePolicy component</strong> from the interactive demo artifact into this file.
                    </p>
                </div>
            </div>
        </div>
    )
}