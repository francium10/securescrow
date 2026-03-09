import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

/* ═══════════════════════════════════════════════════
   REAL CRYPTO — Web Crypto API
═══════════════════════════════════════════════════ */
const toB64 = buf => {
    const b = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
    let s = ''; b.forEach(x => s += String.fromCharCode(x)); return btoa(s)
}
const frB64 = b64 => {
    const s = atob(b64), u = new Uint8Array(s.length)
    for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u
}
const armor = (t, b64) => `-----BEGIN PGP ${t}-----\n\n${(b64.match(/.{1,64}/g) || []).join('\n')}\n\n-----END PGP ${t}-----`
const dearmor = s => s.replace(/-----[^\n-]+-----/g, '').replace(/\s/g, '')

async function genKeyPair() {
    const [e, s] = await Promise.all([
        crypto.subtle.generateKey({ name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['encrypt', 'decrypt']),
        crypto.subtle.generateKey({ name: 'RSA-PSS', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']),
    ])
    const [ePub, ePriv, sPub, sPriv] = await Promise.all([
        crypto.subtle.exportKey('spki', e.publicKey), crypto.subtle.exportKey('pkcs8', e.privateKey),
        crypto.subtle.exportKey('spki', s.publicKey), crypto.subtle.exportKey('pkcs8', s.privateKey),
    ])
    return { ePub: toB64(ePub), ePriv: toB64(ePriv), sPub: toB64(sPub), sPriv: toB64(sPriv) }
}

async function encMsg(pubB64, plain) {
    const aes = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt'])
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const enc = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aes, new TextEncoder().encode(plain)))
    const raw = await crypto.subtle.exportKey('raw', aes)
    const rsa = await crypto.subtle.importKey('spki', frB64(pubB64), { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['encrypt'])
    const wk = new Uint8Array(await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, rsa, raw))
    const out = new Uint8Array(16 + wk.length + enc.length)
    out.set(iv)
    out[12] = (wk.length >> 24) & 255; out[13] = (wk.length >> 16) & 255
    out[14] = (wk.length >> 8) & 255; out[15] = wk.length & 255
    out.set(wk, 16); out.set(enc, 16 + wk.length)
    return toB64(out)
}

async function decMsg(privB64, cipherB64) {
    const d = frB64(cipherB64)
    const iv = d.slice(0, 12)
    const kl = ((d[12] << 24) | (d[13] << 16) | (d[14] << 8) | d[15]) >>> 0
    const wk = d.slice(16, 16 + kl), enc = d.slice(16 + kl)
    const rsa = await crypto.subtle.importKey('pkcs8', frB64(privB64), { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['decrypt'])
    const raw = await crypto.subtle.decrypt({ name: 'RSA-OAEP' }, rsa, wk)
    const aes = await crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['decrypt'])
    return new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, aes, enc))
}

async function signDoc(privB64, msg) {
    const k = await crypto.subtle.importKey('pkcs8', frB64(privB64), { name: 'RSA-PSS', hash: 'SHA-256' }, false, ['sign'])
    return toB64(await crypto.subtle.sign({ name: 'RSA-PSS', saltLength: 32 }, k, new TextEncoder().encode(msg)))
}

async function verifyDoc(pubB64, msg, sigB64) {
    const k = await crypto.subtle.importKey('spki', frB64(pubB64), { name: 'RSA-PSS', hash: 'SHA-256' }, false, ['verify'])
    return crypto.subtle.verify({ name: 'RSA-PSS', saltLength: 32 }, k, frB64(sigB64), new TextEncoder().encode(msg))
}

/* ═══════════════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════════════ */
const C = {
    bg: '#050814', bg2: '#070d1f', bg3: '#0d1a3a',
    p: '#00ffc8', b: '#0080ff', w: '#ff8800', d: '#ff4466', v: '#a78bfa',
    border: 'rgba(255,255,255,0.07)', ba: 'rgba(0,255,200,0.2)', muted: 'rgba(255,255,255,0.4)',
}

/* ── UI Atoms ── */
const Tag = ({ c = C.p, t }) => (
    <span style={{
        background: `${c}20`, color: c, border: `1px solid ${c}35`, borderRadius: 6,
        padding: '2px 8px', fontSize: 10, fontWeight: 700, flexShrink: 0, letterSpacing: '0.3px'
    }}>{t}</span>
)

const Btn = ({ children, onClick, loading, col = C.p, sm, disabled }) => (
    <button onClick={onClick} disabled={loading || disabled}
        style={{
            background: `${col}18`, border: `1px solid ${col}45`, color: col, borderRadius: 8,
            padding: sm ? '6px 12px' : '9px 18px', fontSize: sm ? 11 : 13, fontWeight: 700, cursor: 'pointer',
            opacity: (loading || disabled) ? .45 : 1, whiteSpace: 'nowrap', transition: 'opacity .2s'
        }}>
        {loading ? '⏳ Processing…' : children}
    </button>
)

const Area = ({ value, onChange, placeholder, rows = 4, mono }) => (
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        style={{
            width: '100%', background: C.bg3, border: `1px solid ${C.ba}`, color: '#fff', borderRadius: 8,
            padding: '10px 12px', fontSize: mono ? 11 : 13, fontFamily: mono ? 'monospace' : 'inherit',
            outline: 'none', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box'
        }} />
)

const Lbl = ({ t }) => (
    <div style={{ color: C.muted, fontSize: 11, fontWeight: 700, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t}</div>
)

const MonoBox = ({ children, col = C.p }) => (
    <pre style={{
        background: C.bg, border: `1px solid ${col}30`, borderRadius: 8, padding: 12, color: col,
        fontSize: 10, fontFamily: 'monospace', overflowX: 'auto', whiteSpace: 'pre-wrap',
        wordBreak: 'break-all', maxHeight: 150, overflowY: 'auto', margin: 0, lineHeight: 1.5
    }}>{children}</pre>
)

const Card = ({ children, s = {} }) => (
    <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, ...s }}>{children}</div>
)

const Err = ({ t }) => t ? <p style={{ color: C.d, fontSize: 12, marginTop: 8, marginBottom: 0 }}>⚠ {t}</p> : null
const Ok = ({ t }) => t ? <p style={{ color: C.p, fontSize: 12, marginTop: 8, marginBottom: 0 }}>✅ {t}</p> : null
const Sp = ({ h = 12 }) => <div style={{ height: h }} />

const SectionHdr = ({ icon, title, tags = [] }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <span style={{ fontWeight: 700, fontSize: 15 }}>{title}</span>
        {tags.map((t, i) => <Tag key={i} c={t.c || C.p} t={t.t} />)}
    </div>
)

/* ── Tab 1: Generate Keys ── */
function GenKeys() {
    const [keys, setKeys] = useState(null)
    const [busy, setBusy] = useState(false)

    const run = async () => {
        setBusy(true)
        try { setKeys(await genKeyPair()) }
        catch (e) { alert('Key generation failed: ' + e.message) }
        setBusy(false)
    }

    const copy = t => { try { navigator.clipboard.writeText(t) } catch { } }

    const KEY_DEFS = keys ? [
        { label: 'Encryption Public Key', b64: keys.ePub, col: C.p, note: 'SAFE TO SHARE', icon: '🔓', armorType: 'PUBLIC KEY BLOCK', desc: 'Share with anyone who needs to send you an encrypted wire instruction.' },
        { label: 'Encryption Private Key', b64: keys.ePriv, col: C.d, note: 'KEEP SECRET', icon: '🔐', armorType: 'PRIVATE KEY BLOCK', desc: 'Never share. Used to decrypt messages sent to you.' },
        { label: 'Signing Public Key', b64: keys.sPub, col: C.b, note: 'SAFE TO SHARE', icon: '✅', armorType: 'PUBLIC KEY BLOCK', desc: 'Share with anyone who needs to verify your document signatures.' },
        { label: 'Signing Private Key', b64: keys.sPriv, col: C.w, note: 'KEEP SECRET', icon: '✍️', armorType: 'PRIVATE KEY BLOCK', desc: 'Used to sign wire instructions. Never share.' },
    ] : []

    return (
        <div>
            <div style={{ background: `${C.p}08`, border: `1px solid ${C.ba}`, borderRadius: 10, padding: 14, marginBottom: 18 }}>
                <p style={{ margin: 0, color: C.muted, fontSize: 13, lineHeight: 1.7 }}>
                    Generates a real <strong style={{ color: '#fff' }}>RSA-2048 key pair</strong> using the browser's native Web Crypto API.
                    Two pairs: one for <span style={{ color: C.p }}>encryption (RSA-OAEP + AES-256-GCM hybrid)</span> and one for <span style={{ color: C.b }}>digital signatures (RSA-PSS)</span>.
                </p>
            </div>
            <Btn onClick={run} loading={busy}>⚡ Generate RSA-2048 PGP Key Pair</Btn>
            {keys && (
                <div style={{ marginTop: 22, display: 'grid', gap: 14 }}>
                    {KEY_DEFS.map(({ label, b64, col, note, icon, armorType, desc }) => (
                        <div key={label} style={{ background: `${col}07`, border: `1px solid ${col}22`, borderRadius: 10, padding: 14 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: 16 }}>{icon}</span>
                                    <span style={{ fontWeight: 700, color: col, fontSize: 13 }}>{label}</span>
                                    <Tag c={col} t={note} />
                                </div>
                                <Btn sm col={col} onClick={() => copy(armor(armorType, b64))}>📋 Copy</Btn>
                            </div>
                            <p style={{ color: C.muted, fontSize: 12, margin: '0 0 8px', lineHeight: 1.5 }}>{desc}</p>
                            <MonoBox col={col}>{armor(armorType, b64)}</MonoBox>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

/* ── Tab 2: Encrypt / Decrypt ── */
function EncDec() {
    const [pub, setPub] = useState('')
    const [priv, setPriv] = useState('')
    const [plain, setPlain] = useState('WIRE TRANSFER INSTRUCTION\n\nProperty: 123 Oak Street, Miami FL 33101\nAmount: $485,000.00\nReceiving Bank: Chase Bank NA\nAccount No: ****4521\nRouting No: ****0021\n\nAuthorized by: Sarah Johnson, Escrow Officer\nDate: 2025-03-07 | Ref: TXN-2025-001')
    const [cipher, setCipher] = useState('')
    const [decrypted, setDecrypted] = useState('')
    const [eL, setEL] = useState(false); const [dL, setDL] = useState(false)
    const [eErr, setEErr] = useState(''); const [dErr, setDErr] = useState('')

    const doEnc = async () => {
        setEErr(''); setEL(true); setDecrypted('')
        try { setCipher(armor('MESSAGE', await encMsg(dearmor(pub), plain))) }
        catch { setEErr('Encryption failed. Paste the Encryption Public Key from Step 1.') }
        setEL(false)
    }
    const doDec = async () => {
        setDErr(''); setDL(true)
        try { setDecrypted(await decMsg(dearmor(priv), dearmor(cipher))) }
        catch { setDErr('Decryption failed. Make sure you pasted the matching Encryption Private Key.') }
        setDL(false)
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <Card>
                <SectionHdr icon="🔒" title="Encrypt Message" tags={[{ t: 'RSA-OAEP' }, { c: C.b, t: 'AES-256-GCM' }, { c: C.v, t: 'HYBRID' }]} />
                <Lbl t="Recipient's Encryption Public Key (from Step 1)" />
                <Area value={pub} onChange={setPub} placeholder="-----BEGIN PGP PUBLIC KEY BLOCK-----..." rows={3} mono />
                <Sp /><Lbl t="Plaintext Wire Instruction" />
                <Area value={plain} onChange={setPlain} rows={7} />
                <Sp /><Btn onClick={doEnc} loading={eL}>🔐 Encrypt →</Btn>
                <Err t={eErr} />
                {cipher && <><Sp /><Lbl t="Encrypted Ciphertext" /><MonoBox>{cipher}</MonoBox><Ok t="Encrypted. Only the private key holder can decrypt this." /></>}
            </Card>
            <Card>
                <SectionHdr icon="🔓" title="Decrypt Message" tags={[{ c: C.d, t: 'PRIVATE KEY REQUIRED' }]} />
                <Lbl t="Your Encryption Private Key (from Step 1)" />
                <Area value={priv} onChange={setPriv} placeholder="-----BEGIN PGP PRIVATE KEY BLOCK-----..." rows={3} mono />
                <Sp /><Lbl t="Ciphertext (auto-filled or paste)" />
                <Area value={cipher} onChange={setCipher} placeholder="-----BEGIN PGP MESSAGE-----..." rows={7} mono />
                <Sp /><Btn onClick={doDec} loading={dL} col={C.b}>🔓 Decrypt →</Btn>
                <Err t={dErr} />
                {decrypted && <><Sp /><Lbl t="Decrypted Plaintext" />
                    <div style={{ background: 'rgba(0,255,200,0.06)', border: `1px solid ${C.ba}`, borderRadius: 8, padding: 12, fontSize: 13, whiteSpace: 'pre-wrap', lineHeight: 1.7, fontFamily: 'monospace', color: '#fff' }}>{decrypted}</div>
                    <Ok t="Decryption successful — AES-GCM tag verified." /></>}
            </Card>
        </div>
    )
}

/* ── Tab 3: Sign / Verify ── */
function SignVerify() {
    const [sPriv, setSPriv] = useState('')
    const [vPub, setVPub] = useState('')
    const [doc, setDoc] = useState('I hereby authorize the wire transfer of $485,000.00 to Chase Bank account ****4521, routing ****0021, for the purchase of 123 Oak Street, Miami FL 33101.\n\nThis instruction was independently verified by phone call on 2025-03-07 at 14:32 EST.\n\nSignatory: Sarah Johnson | License: RE-FL-2024-9021\nTransaction Ref: TXN-2025-001')
    const [sig, setSig] = useState('')
    const [verRes, setVerRes] = useState(null)
    const [sL, setSL] = useState(false); const [vL, setVL] = useState(false)
    const [sErr, setSErr] = useState(''); const [vErr, setVErr] = useState('')

    const doSign = async () => {
        setSErr(''); setSL(true); setVerRes(null)
        try { setSig(armor('SIGNATURE', await signDoc(dearmor(sPriv), doc))) }
        catch { setSErr('Signing failed. Paste the RSA-PSS Signing Private Key from Step 1.') }
        setSL(false)
    }
    const doVerify = async () => {
        setVErr(''); setVL(true); setVerRes(null)
        try { setVerRes(await verifyDoc(dearmor(vPub), doc, dearmor(sig))) }
        catch { setVErr('Verification error. Ensure matching keys and exact document text.') }
        setVL(false)
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <Card>
                <SectionHdr icon="✍️" title="Sign Document" tags={[{ c: C.w, t: 'RSA-PSS' }, { c: C.v, t: 'SHA-256' }]} />
                <Lbl t="Your Private Signing Key (from Step 1)" />
                <Area value={sPriv} onChange={setSPriv} placeholder="-----BEGIN PGP PRIVATE KEY BLOCK-----..." rows={3} mono />
                <Sp /><Lbl t="Wire Instruction / Document to Sign" />
                <Area value={doc} onChange={setDoc} rows={8} />
                <Sp /><Btn onClick={doSign} loading={sL} col={C.w}>✍️ Sign Document →</Btn>
                <Err t={sErr} />
                {sig && <><Sp /><Lbl t="Digital Signature (RSA-PSS)" /><MonoBox col={C.w}>{sig}</MonoBox>
                    <p style={{ color: C.w, fontSize: 12, marginTop: 8, marginBottom: 0 }}>✅ Signed. Any modification will invalidate this signature.</p></>}
            </Card>
            <Card>
                <SectionHdr icon="🔍" title="Verify Signature" tags={[{ c: C.b, t: 'PUBLIC KEY' }, { c: C.p, t: 'TAMPER DETECTION' }]} />
                <Lbl t="Signer's Signing Public Key (from Step 1)" />
                <Area value={vPub} onChange={setVPub} placeholder="-----BEGIN PGP PUBLIC KEY BLOCK-----..." rows={3} mono />
                <Sp /><Lbl t="Document (must match signed text exactly)" />
                <Area value={doc} onChange={setDoc} rows={8} />
                <Sp h={6} /><Lbl t="Signature (auto-filled or paste)" />
                <Area value={sig} onChange={setSig} rows={2} mono />
                <Sp /><Btn onClick={doVerify} loading={vL} col={C.b}>🔍 Verify Signature →</Btn>
                <Err t={vErr} />
                {verRes !== null && (
                    <div style={{
                        marginTop: 12, background: verRes ? 'rgba(0,255,200,0.07)' : 'rgba(255,68,102,0.07)',
                        border: `1px solid ${verRes ? C.p : C.d}40`, borderRadius: 10, padding: 14
                    }}>
                        <div style={{ fontWeight: 800, fontSize: 15, color: verRes ? C.p : C.d, marginBottom: 6 }}>
                            {verRes ? '✅ VALID — Document Authentic & Unmodified' : '❌ INVALID — Signature Mismatch!'}
                        </div>
                        <p style={{ color: C.muted, fontSize: 12, margin: 0, lineHeight: 1.7 }}>
                            {verRes
                                ? 'This wire instruction was signed by the verified keyholder and has not been altered since signing.'
                                : 'Document was modified after signing or wrong key used. DO NOT process this wire transfer.'}
                        </p>
                    </div>
                )}
            </Card>
        </div>
    )
}

/* ── PGP Suite Tabs ── */
const PGP_TABS = [
    { id: 'gen', label: '⚡ Step 1 — Generate Keys' },
    { id: 'enc', label: '🔒 Step 2 — Encrypt / Decrypt' },
    { id: 'sign', label: '✍️ Step 3 — Sign / Verify' },
]

/* ═══════════════════════════════════════════════════
   PAGE EXPORT
═══════════════════════════════════════════════════ */
export default function PGPPage() {
    const nav = useNavigate()
    const [sub, setSub] = useState('gen')

    return (
        <div style={{ fontFamily: '-apple-system,BlinkMacSystemFont,sans-serif', minHeight: '100vh', background: C.bg, color: '#fff' }}>
            {/* Navbar */}
            <nav style={{
                background: 'rgba(7,13,31,0.95)', borderBottom: `1px solid ${C.ba}`, padding: '0 24px',
                display: 'flex', alignItems: 'center', gap: 16, height: 60, position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)'
            }}>
                <div style={{
                    width: 28, height: 28, background: 'linear-gradient(135deg,#00ffc8,#0080ff)', borderRadius: 7,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14
                }}>🔒</div>
                <span style={{ fontWeight: 800, fontSize: 16 }}>Secure<span style={{ color: C.p }}>Escrow</span></span>
                <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
                <span style={{ color: C.p, fontWeight: 700 }}>🔐 PGP Encryption Suite</span>
                <div style={{ flex: 1 }} />
                <button onClick={() => nav('/dashboard')}
                    style={{
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.6)', borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: 'pointer', fontWeight: 600
                    }}>
                    ← Back to Dashboard
                </button>
            </nav>

            <div style={{ maxWidth: 1300, margin: '0 auto', padding: '24px 24px 60px' }}>
                {/* Info banner */}
                <div style={{ background: `${C.p}08`, border: `1px solid ${C.ba}`, borderRadius: 10, padding: 14, marginBottom: 20 }}>
                    <p style={{ margin: 0, color: C.muted, fontSize: 13, lineHeight: 1.7 }}>
                        The PGP Encryption Suite uses the browser's native <strong style={{ color: '#fff' }}>Web Crypto API</strong> with real
                        <strong style={{ color: C.p }}> RSA-2048</strong> key pairs. Use Step 1 to generate keys, Step 2 to encrypt/decrypt wire instructions,
                        and Step 3 to sign and verify authorization documents.
                    </p>
                </div>

                {/* Sub-tabs */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
                    {PGP_TABS.map(t => (
                        <button key={t.id} onClick={() => setSub(t.id)} style={{
                            background: sub === t.id ? `${C.p}15` : 'transparent',
                            border: `1px solid ${sub === t.id ? C.p : 'rgba(255,255,255,0.07)'}`,
                            color: sub === t.id ? C.p : 'rgba(255,255,255,0.4)',
                            borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all .2s',
                        }}>{t.label}</button>
                    ))}
                </div>

                {sub === 'gen' && <GenKeys />}
                {sub === 'enc' && <EncDec />}
                {sub === 'sign' && <SignVerify />}
            </div>
        </div>
    )
}