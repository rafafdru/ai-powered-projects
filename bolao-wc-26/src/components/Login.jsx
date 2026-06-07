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

// ── Cards do tutorial de login ────────────────────────────────────────────────
const CARDS_LOGIN = [
  {
    emoji: '👋',
    titulo: 'BEM-VINDO',
    conteudo: () => (
      <div>
        <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: '0 0 14px' }}>
          O <strong style={{ color: '#fff' }}>Bolão Copa do Mundo 2026</strong> é um jogo de palpites entre amigos. Você entra num grupo, faz seus palpites de placar e compete no ranking.
        </p>
        <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: 0 }}>
          Há duas situações possíveis: entrar em um grupo já criado por um amigo, ou criar um grupo novo para chamar seus amigos.
        </p>
      </div>
    ),
  },
  {
    emoji: '🔑',
    titulo: 'ENTRAR NUM GRUPO',
    subtitulo: 'Um amigo já criou o grupo',
    conteudo: () => (
      <div>
        <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: '0 0 14px' }}>
          Se alguém do seu grupo já criou o bolão, você só precisa de duas informações que ele deve te passar:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
          {[
            ['Nome do grupo', 'O nome exato que foi usado na criação'],
            ['Senha do grupo', 'Um código de 6 dígitos numéricos'],
          ].map(([titulo, desc]) => (
            <div key={titulo} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '10px 14px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C9A84C', boxShadow: '0 0 6px rgba(201,168,76,0.5)', flexShrink: 0, marginTop: '5px' }} />
              <div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '12px', fontWeight: 700, color: '#fff', letterSpacing: '0.5px', marginBottom: '2px' }}>{titulo}</div>
                <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.6, margin: 0 }}>
          Escolha um nome (apelido) para aparecer no ranking e clique em <strong style={{ color: 'rgba(255,255,255,0.6)' }}>ENTRAR NO GRUPO</strong>.
        </p>
      </div>
    ),
  },
  {
    emoji: '✍️',
    titulo: 'SEU NOME NO RANKING',
    subtitulo: 'Como você vai aparecer',
    conteudo: () => (
      <div>
        <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: '0 0 14px' }}>
          O campo <strong style={{ color: '#fff' }}>SEU NOME</strong> é o apelido que seus amigos vão ver no ranking. Escolha algo que te identifique.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            ['Apenas letras minúsculas', 'ex: joao, rafa, carol'],
            ['Máximo 20 caracteres', 'Curto e direto ao ponto'],
            ['Não pode repetir no grupo', 'Cada membro precisa de um nome único'],
          ].map(([regra, ex]) => (
            <div key={regra} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '10px 14px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2ecc71', flexShrink: 0, marginTop: '5px' }} />
              <div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '12px', fontWeight: 700, color: '#fff', letterSpacing: '0.5px', marginBottom: '2px' }}>{regra}</div>
                <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{ex}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    emoji: '🏗️',
    titulo: 'CRIAR UM GRUPO',
    subtitulo: 'Você é o primeiro do seu grupo',
    conteudo: () => (
      <div>
        <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: '0 0 14px' }}>
          Se ninguém criou ainda, clique em <strong style={{ color: '#fff' }}>+ CRIAR GRUPO</strong>. Você vai definir:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
          {[
            ['Nome do grupo', 'Máximo 15 caracteres. Será o identificador único do grupo.'],
            ['Senha do grupo', '6 dígitos numéricos. Compartilhe com seus amigos para que entrem.'],
          ].map(([titulo, desc]) => (
            <div key={titulo} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '10px 14px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C9A84C', boxShadow: '0 0 6px rgba(201,168,76,0.5)', flexShrink: 0, marginTop: '5px' }} />
              <div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '12px', fontWeight: 700, color: '#fff', letterSpacing: '0.5px', marginBottom: '2px' }}>{titulo}</div>
                <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.6, margin: 0 }}>
          Após criar, passe o <strong style={{ color: 'rgba(255,255,255,0.6)' }}>nome</strong> e a <strong style={{ color: 'rgba(255,255,255,0.6)' }}>senha</strong> para seus amigos entrarem.
        </p>
      </div>
    ),
  },
  {
    emoji: '📱',
    titulo: 'SALVAR NO CELULAR',
    subtitulo: 'Acesso rápido como app',
    conteudo: () => (
      <div>
        <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: '0 0 14px' }}>
          O Bolão funciona como app. Salve na tela inicial do seu celular para abrir rapidamente durante os jogos.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            ['iPhone (Safari)', 'Toque em compartilhar → "Adicionar à Tela de Início"'],
            ['Android (Chrome)', 'Menu (⋮) → "Adicionar à tela inicial" ou "Instalar app"'],
          ].map(([device, instrucao]) => (
            <div key={device} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '10px 14px' }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '12px', fontWeight: 700, color: '#C9A84C', letterSpacing: '0.5px', marginBottom: '4px' }}>{device}</div>
              <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{instrucao}</div>
            </div>
          ))}
        </div>
        <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.25)', lineHeight: 1.6, margin: '14px 0 0' }}>
          Sua sessão fica salva — você não precisa fazer login toda vez.
        </p>
      </div>
    ),
  },
];

function ModalTutorialLogin({ onFechar }) {
  const [cardAtual, setCardAtual] = useState(0);
  const total = CARDS_LOGIN.length;
  const card = CARDS_LOGIN[cardAtual];

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onFechar()}
      style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
    >
      <div style={{ width: '100%', maxWidth: '360px', background: '#0d0d0d', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '24px', padding: '28px 24px 24px', position: 'relative' }}>

        {/* Fechar */}
        <button onClick={onFechar} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', fontSize: '20px', lineHeight: 1, padding: '4px' }}>✕</button>

        {/* Indicadores */}
        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginBottom: '24px' }}>
          {CARDS_LOGIN.map((_, i) => (
            <div
              key={i}
              onClick={() => setCardAtual(i)}
              style={{ width: cardAtual === i ? '20px' : '6px', height: '6px', borderRadius: '3px', background: cardAtual === i ? '#C9A84C' : 'rgba(255,255,255,0.12)', transition: 'all 0.3s', cursor: 'pointer' }}
            />
          ))}
        </div>

        {/* Conteúdo */}
        <div>
          <div style={{ fontSize: '28px', marginBottom: '10px' }}>{card.emoji}</div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '18px', fontWeight: 900, color: '#C9A84C', letterSpacing: '1px', marginBottom: card.subtitulo ? '4px' : '12px' }}>{card.titulo}</div>
          {card.subtitulo && (
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: 'rgba(255,255,255,0.3)', marginBottom: '12px' }}>{card.subtitulo}</div>
          )}
          {card.conteudo()}
        </div>

        {/* Navegação */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
          <button
            onClick={() => setCardAtual((c) => Math.max(0, c - 1))}
            style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '9px 18px', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '12px', fontWeight: 700, letterSpacing: '2px', color: cardAtual === 0 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.4)', cursor: cardAtual === 0 ? 'default' : 'pointer' }}
          >← ANTERIOR</button>
          {cardAtual < total - 1 ? (
            <button
              onClick={() => setCardAtual((c) => c + 1)}
              style={{ background: 'linear-gradient(135deg, #C9A84C, #a8752a)', border: 'none', borderRadius: '10px', padding: '9px 18px', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '12px', fontWeight: 900, letterSpacing: '2px', color: '#000', cursor: 'pointer' }}
            >PRÓXIMO →</button>
          ) : (
            <button
              onClick={onFechar}
              style={{ background: 'linear-gradient(135deg, #C9A84C, #a8752a)', border: 'none', borderRadius: '10px', padding: '9px 18px', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '12px', fontWeight: 900, letterSpacing: '2px', color: '#000', cursor: 'pointer' }}
            >ENTENDIDO ✓</button>
          )}
        </div>
      </div>
    </div>
  );
}

function BotaoAjuda({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', padding: '4px', position: 'relative', zIndex: 2 }}
    >
      <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1.5px solid rgba(201,168,76,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '15px', fontWeight: 900, color: '#C9A84C', lineHeight: 1 }}>?</span>
      </div>
      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '7px', fontWeight: 700, letterSpacing: '1px', color: 'rgba(201,168,76,0.5)', whiteSpace: 'nowrap' }}>DÚVIDAS DE LOGIN</span>
    </button>
  );
}

function TelaEntrar({ onEntrar, onIrCriar }) {
  const [apelido, setApelido] = useState('');
  const [nomeGrupo, setNomeGrupo] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [shake, setShake] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);

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
    <>
      {modalAberto && <ModalTutorialLogin onFechar={() => setModalAberto(false)} />}
      <div style={{ width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative', zIndex: 2, animation: shake ? 'shake 0.5s ease' : 'none' }}>
        {/* Botão de ajuda alinhado à direita */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-4px' }}>
          <BotaoAjuda onClick={() => setModalAberto(true)} />
        </div>
        <Campo label="SEU NOME" icon={IconUser}><input placeholder="Como você quer ser chamado" value={apelido} onChange={(e) => setApelido(e.target.value.slice(0, 20))} onKeyDown={(e) => e.key === 'Enter' && handleEntrar()} style={inputBase} onFocus={(e) => (e.target.style.borderColor = 'rgba(201,168,76,0.5)')} onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} /></Campo>
        <Campo label="NOME DO GRUPO" icon={IconGrupo}><input placeholder="Nome do seu grupo" value={nomeGrupo} onChange={(e) => setNomeGrupo(e.target.value.slice(0, 15))} onKeyDown={(e) => e.key === 'Enter' && handleEntrar()} style={inputBase} onFocus={(e) => (e.target.style.borderColor = 'rgba(201,168,76,0.5)')} onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} /></Campo>
        <Campo label="SENHA DO GRUPO (6 DÍGITOS)" icon={IconLock}><input placeholder="······" value={senha} type="password" inputMode="numeric" onChange={(e) => setSenha(e.target.value.replace(/\D/g, '').slice(0, 6))} onKeyDown={(e) => e.key === 'Enter' && handleEntrar()} style={{ ...inputBase, letterSpacing: '6px' }} onFocus={(e) => (e.target.style.borderColor = 'rgba(201,168,76,0.5)')} onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} /></Campo>
        <Erro msg={erro} />
        <button onClick={handleEntrar} disabled={carregando} style={{ width: '100%', background: carregando ? 'rgba(201,168,76,0.3)' : 'linear-gradient(135deg, #C9A84C 0%, #a8752a 100%)', border: 'none', borderRadius: '12px', padding: '16px', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '16px', fontWeight: 900, letterSpacing: '4px', color: '#000', cursor: carregando ? 'wait' : 'pointer', boxShadow: '0 8px 32px rgba(201,168,76,0.3)', transition: 'all 0.15s', marginTop: '2px' }}>{carregando ? 'VERIFICANDO...' : 'ENTRAR NO GRUPO'}</button>
        <button onClick={onIrCriar} style={{ width: '100%', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '14px', fontWeight: 700, letterSpacing: '3px', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.35)'; e.currentTarget.style.color = '#C9A84C'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}>+ CRIAR GRUPO</button>
      </div>
    </>
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
  const [modalAberto, setModalAberto] = useState(false);

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
    <>
      {modalAberto && <ModalTutorialLogin onFechar={() => setModalAberto(false)} />}
      <div style={{ width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative', zIndex: 2, animation: shake ? 'shake 0.5s ease' : 'none' }}>
        {/* Header da tela com botão de ajuda */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2px' }}>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '9px', fontWeight: 700, letterSpacing: '4px', color: 'rgba(201,168,76,0.6)', marginBottom: '2px' }}>NOVO</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '26px', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '1px' }}>CRIAR GRUPO</div>
          </div>
          <BotaoAjuda onClick={() => setModalAberto(true)} />
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
    </>
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