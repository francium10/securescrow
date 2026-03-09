import { useNavigate } from 'react-router-dom'

export default function PGPPage() {
    const nav = useNavigate()
    return (
        <div style={{ fontFamily: '-apple-system,sans-serif', minHeight: '100vh', background: '#050814', color: '#fff' }}>
            <nav style={{
                background: 'rgba(7,13,31,0.95)', borderBottom: '1px solid rgba(0,255,200,0.08)',
                padding: '0 24px', display: 'flex', alignItems: 'center', gap: 16, height: 60,
                position: 'sticky', top: 0, zIndex: 50
            }}>
                <div style={{
                    width: 28, height: 28, background: 'linear-gradient(135deg,#00ffc8,#0080ff)',
                    borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14
                }}>🔒</div>
                <span style={{ fontWeight: 800, fontSize: 16 }}>Secure<span style={{ color: '#00ffc8' }}>Escrow</span></span>
                <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
                <span style={{ color: '#00ffc8', fontWeight: 700 }}>🔐 PGP Encryption Suite</span>
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
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 20, lineHeight: 1.7 }}>
                    The PGP Encryption Suite uses the browser's native Web Crypto API to demonstrate real RSA-2048 encryption and signing.
                    Use this to encrypt wire instructions and sign authorization documents.
                </p>
                {/* The interactive demo is in the Claude artifact above.
            In your real app, copy the PGPSuite component code here. */}
                <div style={{
                    background: 'rgba(0,255,200,0.05)', border: '1px solid rgba(0,255,200,0.2)',
                    borderRadius: 14, padding: 32, textAlign: 'center'
                }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🔐</div>
                    <p style={{ color: 'rgba(255,255,255,0.6)' }}>
                        Copy the <strong style={{ color: '#00ffc8' }}>PGPSuite component</strong> from the interactive demo artifact into this file.
                    </p>
                </div>
            </div>
        </div>
    )
}