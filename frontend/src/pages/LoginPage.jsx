import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'

const inp = { width: '100%', marginBottom: 14 }
const btn = (bg = 'linear-gradient(135deg,#00ffc8,#0080ff)', color = '#050814') => ({
    width: '100%', padding: '13px', borderRadius: 10, border: 'none', fontWeight: 700,
    fontSize: 15, background: bg, color, marginTop: 4, transition: 'opacity .2s',
})

export default function LoginPage() {
    const { login } = useAuth()
    const nav = useNavigate()
    const [step, setStep] = useState(1)   // 1=credentials, 2=mfa
    const [email, setEmail] = useState('')
    const [pass, setPass] = useState('')
    const [code, setCode] = useState('')
    const [err, setErr] = useState('')
    const [loading, setLoad] = useState(false)

    const step1 = async e => {
        e.preventDefault(); setErr(''); setLoad(true)
        try {
            await api.post('/auth/login', { email, password: pass })
            setStep(2)
        } catch (ex) { setErr(ex.response?.data?.message || 'Login failed') }
        setLoad(false)
    }

    const step2 = async e => {
        e.preventDefault(); setErr(''); setLoad(true)
        try {
            const { data } = await api.post('/auth/verify-mfa', { email, code })
            login(data.token, data.user)
            nav('/dashboard')
        } catch (ex) { setErr(ex.response?.data?.message || 'Invalid code') }
        setLoad(false)
    }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#050814', padding: 16
        }}>
            {/* grid bg */}
            <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(0,255,200,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,200,0.03) 1px,transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', top: '20%', left: '5%', width: 350, height: 350, background: 'radial-gradient(circle,rgba(0,128,255,0.1) 0%,transparent 70%)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', background: 'rgba(7,13,31,0.95)', border: '1px solid rgba(0,255,200,0.15)', borderRadius: 20, padding: '40px 36px', width: '100%', maxWidth: 420, backdropFilter: 'blur(12px)' }}>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
                    <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#00ffc8,#0080ff)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🔒</div>
                    <span style={{ fontWeight: 800, fontSize: 20 }}>Secure<span style={{ color: '#00ffc8' }}>Escrow</span></span>
                </div>

                {step === 1 ? (
                    <form onSubmit={step1}>
                        <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 6 }}>Welcome back</h2>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 28 }}>Sign in to your secure dashboard</p>
                        <div style={inp}><input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required /></div>
                        <div style={inp}><input type="password" placeholder="Password" value={pass} onChange={e => setPass(e.target.value)} required /></div>
                        {err && <p style={{ color: '#ff4466', fontSize: 13, marginBottom: 12 }}>{err}</p>}
                        <button style={btn()} disabled={loading}>{loading ? 'Sending code…' : 'Continue →'}</button>
                    </form>
                ) : (
                    <form onSubmit={step2}>
                        <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 6 }}>Check your email</h2>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 28 }}>
                            A 6-digit code was sent to <strong style={{ color: '#00ffc8' }}>{email}</strong>
                        </p>
                        <div style={{ ...inp, marginBottom: 20 }}>
                            <input type="text" placeholder="000000" value={code} onChange={e => setCode(e.target.value)} maxLength={6} style={{ textAlign: 'center', fontSize: 28, fontWeight: 800, letterSpacing: 10 }} required />
                        </div>
                        {err && <p style={{ color: '#ff4466', fontSize: 13, marginBottom: 12 }}>{err}</p>}
                        <button style={btn()} disabled={loading}>{loading ? 'Verifying…' : '🔐 Verify & Sign In'}</button>
                        <button type="button" style={btn('transparent', 'rgba(255,255,255,0.5)')} onClick={() => { setStep(1); setCode(''); setErr('') }}>← Back</button>
                    </form>
                )}
            </div>
        </div>
    )
}