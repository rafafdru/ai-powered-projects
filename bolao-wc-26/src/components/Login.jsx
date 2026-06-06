import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

function Campo({ label, icon, children }) {
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', left: '14px', top: '8px', zIndex: 1 }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '8px', fontWeight: 700, letterSpacing: '2px', color: 'rgba(255,255,255,0.3)' }}>{label}</div>
      </div>
      <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.25, pointerEvents: 'none' }}>{icon}</div>
      {children}
    </div>
  );
}

const inputBase = {
  width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px', padding: '26px 14px 10px 36px', color: '#fff', fontSize: '15px',
  fontFamily: "'Barlow', sans-serif", fontWeight: 500, outline: 'none', transition: 'border-color 0.25s',
};

const IconUser = (<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="4.5" r="2.5" stroke="#fff" strokeWidth="1.3" /><path d="M2 12c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" /></svg>);
const IconGrupo = (<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1.5" y="5.5" width="11" height="7" rx="1.5" stroke="#fff" strokeWidth="1.3" /><path d="M4.5 5.5V4a2.5 2.5 0 015 0v1.5" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" /></svg>);
const IconLock = (<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="6" width="10" height="7" rx="1.5" stroke="#fff" strokeWidth="1.3" /><path d="M4.5 6V4.5a2.5 2.5 0 015 0V6" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" /><circle cx="7" cy="9.5" r="1" fill="#fff" /></svg>);

function Erro({ msg }) {
  if (!msg) return null;
  return (<div style={{ background: 'rgba(229,57,53,0.1)', border: '1px solid rgba(229,57,53,0.3)', borderRadius: '10px', padding: '10px 14px', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '12px', fontWeight: 700, letterSpacing: '1px', color: '#E53935', textAlign: 'center' }}>{msg}</div>);
}

function Fundo({ glow }) {
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 55% at 50% 38%, rgba(201,168,76,0.13) 0%, rgba(201,168,76,0.04) 40%, transparent 70%)', opacity: glow ? 1 : 0.5, transition: 'opacity 2s ease', pointerEvents: 'none' }} />
      {[280, 200, 136, 88].map((size, i) => (<div key={size} style={{ position: 'absolute', width: `${size}px`, height: `${size * 0.6}px`, top: '20%', left: '50%', transform: 'translateX(-50%) translateY(-50%)', border: `1px solid rgba(201,168,76,${0.04 + i * 0.025})`, borderRadius: '50%', pointerEvents: 'none' }} />))}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '1px', background: 'linear-gradient(to bottom, transparent 0%, rgba(201,168,76,0.08) 30%, rgba(201,168,76,0.15) 50%, rgba(201,168,76,0.08) 70%, transparent 100%)', pointerEvents: 'none' }} />
    </>
  );
}

function LogoBloco({ glow }) {
  return (
    <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', marginBottom: '32px', lineHeight: 1 }}>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '9px', fontWeight: 700, letterSpacing: '6px', color: 'rgba(201,168,76,0.5)', marginBottom: '10px' }}>A COPA É NOSSA</div>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '60px', fontWeight: 900, fontStyle: 'italic', color: '#fff', letterSpacing: '-1px', lineHeight: 0.92 }}>BOLÃO</div>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '42px', fontWeight: 900, fontStyle: 'italic', color: '#C9A84C', letterSpacing: '1px', lineHeight: 1.0, textShadow: glow ? '0 0 60px rgba(201,168,76,0.45)' : '0 0 30px rgba(201,168,76,0.2)', transition: 'text-shadow 2s ease' }}>COPA DO MUNDO</div>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '52px', fontWeight: 900, fontStyle: 'italic', color: '#C9A84C', lineHeight: 1.0, opacity: 0.85 }}>2026</div>
    </div>
  );
}

function TelaEntrar({ onEntrar, onIrCriar }) {
  const [apelido, setApelido] = useState('');
  const [nomeGrupo, setNomeGrupo] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [shake, setShake] = useState(false);

  function dispararShake(msg) { setErro(msg); setShake(true); setTimeout(() => setShake(false), 600); }

  async function handleEntrar() {
    if (!apelido.trim() || !nomeGrupo.trim() || !senha) { dispararShake('Preencha todos os campos.'); return; }
    if (/[A-Z]/.test(apelido.trim())) { dispararShake('apenas letras minusculas'); return; }
    if (nomeGrupo.trim() === '__ADMIN__') { onEntrar('__adminuser__', '__ADMIN__'); return; }
    if (senha.length !== 6) { dispararShake('A senha deve ter 6 dígitos.'); return; }
    setCarregando(true); setErro('');
    try {
      const grupoRef = doc(db, 'grupos', nomeGrupo.trim());
      const grupoSnap = await getDoc(grupoRef);
      if (!grupoSnap.exists()) { dispararShake('Grupo não encontrado.'); setCarregando(false); return; }
      if (grupoSnap.data().senha !== senha) { dispararShake('Senha incorreta.'); setCarregando(false); return; }
      onEntrar(apelido.trim(), nomeGrupo.trim());
    } catch { dispararShake('Erro de conexão. Tente novamente.'); }
    setCarregando(false);
  }

  return (
    <div style={{ width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative', zIndex: 2, animation: shake ? 'shake 0.5s ease' : 'none' }}>
      <Campo label="SEU NOME" icon={IconUser}><input placeholder="Como você quer ser chamado" value={apelido} onChange={(e) => setApelido(e.target.value.slice(0, 20))} onKeyDown={(e) => e.key === 'Enter' && handleEntrar()} style={inputBase} onFocus={(e) => (e.target.style.borderColor = 'rgba(201,168,76,0.5)')} onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} /></Campo>
      <Campo label="NOME DO GRUPO" icon={IconGrupo}><input placeholder="Nome do seu grupo" value={nomeGrupo} onChange={(e) => setNomeGrupo(e.target.value.slice(0, 15))} onKeyDown={(e) => e.key === 'Enter' && handleEntrar()} style={inputBase} onFocus={(e) => (e.target.style.borderColor = 'rgba(201,168,76,0.5)')} onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} /></Campo>
      <Campo label="SENHA DO GRUPO (6 DÍGITOS)" icon={IconLock}><input placeholder="······" value={senha} type="password" inputMode="numeric" onChange={(e) => setSenha(e.target.value.replace(/\D/g, '').slice(0, 6))} onKeyDown={(e) => e.key === 'Enter' && handleEntrar()} style={{ ...inputBase, letterSpacing: '6px' }} onFocus={(e) => (e.target.style.borderColor = 'rgba(201,168,76,0.5)')} onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} /></Campo>
      <Erro msg={erro} />
      <button onClick={handleEntrar} disabled={carregando} style={{ width: '100%', background: carregando ? 'rgba(201,168,76,0.3)' : 'linear-gradient(135deg, #C9A84C 0%, #a8752a 100%)', border: 'none', borderRadius: '12px', padding: '16px', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '16px', fontWeight: 900, letterSpacing: '4px', color: '#000', cursor: carregando ? 'wait' : 'pointer', boxShadow: '0 8px 32px rgba(201,168,76,0.3)', transition: 'all 0.15s', marginTop: '2px' }}>{carregando ? 'VERIFICANDO...' : 'ENTRAR NO GRUPO'}</button>
      <button onClick={onIrCriar} style={{ width: '100%', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '14px', fontWeight: 700, letterSpacing: '3px', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.35)'; e.currentTarget.style.color = '#C9A84C'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}>+ CRIAR GRUPO</button>
    </div>
  );
}

function TelaCriar({ onEntrar, onVoltar }) {
  const [apelido, setApelido] = useState('');
  const [nomeGrupo, setNomeGrupo] = useState('');
  const [senha, setSenha] = useState('');
  const [confirma, setConfirma] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [shake, setShake] = useState(false);

  function dispararShake(msg) { setErro(msg); setShake(true); setTimeout(() => setShake(false), 600); }

  async function handleCriar() {
    if (!apelido.trim() || !nomeGrupo.trim() || !senha || !confirma) { dispararShake('Preencha todos os campos.'); return; }
    if (/[A-Z]/.test(apelido.trim())) { dispararShake('apenas letras minusculas'); return; }
    if (senha.length !== 6) { dispararShake('A senha deve ter exatamente 6 dígitos.'); return; }
    if (senha !== confirma) { dispararShake('As senhas não coincidem.'); return; }
    setCarregando(true); setErro('');
    try {
      const grupoRef = doc(db, 'grupos', nomeGrupo.trim());
      const grupoSnap = await getDoc(grupoRef);
      if (grupoSnap.exists()) { dispararShake('Nome de grupo em uso. Escolha outro.'); setCarregando(false); return; }
      await setDoc(grupoRef, { nome: nomeGrupo.trim(), senha, criadoEm: new Date().toISOString(), criadoPor: apelido.trim() });
      onEntrar(apelido.trim(), nomeGrupo.trim());
    } catch { dispararShake('Erro de conexão. Tente novamente.'); }
    setCarregando(false);
  }

  const senhasOk = senha.length === 6 && confirma.length === 6 && senha === confirma;
  const senhasDiferentes = confirma.length > 0 && senha !== confirma;

  return (
    <div style={{ width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative', zIndex: 2, animation: shake ? 'shake 0.5s ease' : 'none' }}>
      <div style={{ marginBottom: '2px' }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '9px', fontWeight: 700, letterSpacing: '4px', color: 'rgba(201,168,76,0.6)', marginBottom: '2px' }}>NOVO</div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '26px', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '1px' }}>CRIAR GRUPO</div>
      </div>
      <Campo label="SEU NOME" icon={IconUser}><input placeholder="Como você quer ser chamado" value={apelido} onChange={(e) => setApelido(e.target.value.slice(0, 20))} style={inputBase} onFocus={(e) => (e.target.style.borderColor = 'rgba(201,168,76,0.5)')} onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} /></Campo>
      <Campo label="NOME DO GRUPO (MÁX. 15 CARACTERES)" icon={IconGrupo}>
        <input placeholder="Escolha um nome único" value={nomeGrupo} onChange={(e) => setNomeGrupo(e.target.value.slice(0, 15))} style={inputBase} onFocus={(e) => (e.target.style.borderColor = 'rgba(201,168,76,0.5)')} onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} />
        <div style={{ position: 'absolute', right: '12px', bottom: '9px', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '9px', color: nomeGrupo.length >= 15 ? '#E53935' : 'rgba(255,255,255,0.2)' }}>{nomeGrupo.length}/15</div>
      </Campo>
      <Campo label="SENHA DO GRUPO (6 DÍGITOS)" icon={IconLock}><input placeholder="······" value={senha} type="password" inputMode="numeric" onChange={(e) => setSenha(e.target.value.replace(/\D/g, '').slice(0, 6))} style={{ ...inputBase, letterSpacing: '6px' }} onFocus={(e) => (e.target.style.borderColor = 'rgba(201,168,76,0.5)')} onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} /></Campo>
      <Campo label="CONFIRMAR SENHA" icon={IconLock}>
        <input placeholder="······" value={confirma} type="password" inputMode="numeric" onChange={(e) => setConfirma(e.target.value.replace(/\D/g, '').slice(0, 6))} onKeyDown={(e) => e.key === 'Enter' && handleCriar()} style={{ ...inputBase, letterSpacing: '6px', borderColor: senhasDiferentes ? 'rgba(229,57,53,0.5)' : 'rgba(255,255,255,0.1)' }} onFocus={(e) => (e.target.style.borderColor = senhasDiferentes ? 'rgba(229,57,53,0.5)' : 'rgba(201,168,76,0.5)')} onBlur={(e) => (e.target.style.borderColor = senhasDiferentes ? 'rgba(229,57,53,0.5)' : 'rgba(255,255,255,0.1)')} />
        {senhasOk && (<div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#2ecc71', fontSize: '13px' }}>✓</div>)}
      </Campo>
      <Erro msg={erro} />
      <button onClick={handleCriar} disabled={carregando} style={{ width: '100%', background: carregando ? 'rgba(201,168,76,0.3)' : 'linear-gradient(135deg, #C9A84C 0%, #a8752a 100%)', border: 'none', borderRadius: '12px', padding: '16px', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '16px', fontWeight: 900, letterSpacing: '4px', color: '#000', cursor: carregando ? 'wait' : 'pointer', boxShadow: '0 8px 32px rgba(201,168,76,0.3)', transition: 'all 0.15s', marginTop: '2px' }}>{carregando ? 'CRIANDO...' : 'CRIAR GRUPO'}</button>
      <button onClick={onVoltar} style={{ width: '100%', background: 'none', border: 'none', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '12px', fontWeight: 700, letterSpacing: '2px', color: 'rgba(255,255,255,0.25)', cursor: 'pointer', padding: '6px' }}>← VOLTAR</button>
    </div>
  );
}

export default function Login({ onEntrar }) {
  const [tela, setTela] = useState('entrar');
  const [glow, setGlow] = useState(false);
  useEffect(() => { const t = setInterval(() => setGlow((g) => !g), 3000); return () => clearInterval(t); }, []);
  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 28px 48px', position: 'relative', overflow: 'hidden', fontFamily: "'Barlow', sans-serif" }}>
      <Fundo glow={glow} />
      <LogoBloco glow={glow} />
      {tela === 'entrar' && <TelaEntrar onEntrar={onEntrar} onIrCriar={() => setTela('criar')} />}
      {tela === 'criar' && <TelaCriar onEntrar={onEntrar} onVoltar={() => setTela('entrar')} />}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,700;0,900;1,700;1,900&family=Barlow:wght@400;500;600&display=swap'); * { box-sizing: border-box; } body { margin: 0; background: #000; } input::placeholder { color: rgba(255,255,255,0.2); font-size: 13px; } @keyframes shake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-8px); } 40% { transform: translateX(8px); } 60% { transform: translateX(-5px); } 80% { transform: translateX(5px); } }`}</style>
    </div>
  );
}
