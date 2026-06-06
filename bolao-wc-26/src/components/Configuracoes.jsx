import { useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// ─── Ícones inline ────────────────────────────────────────────────────────────

const IconUser = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="4.5" r="2.5" stroke="#fff" strokeWidth="1.3" />
    <path d="M2 12c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);
const IconGrupo = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="1.5" y="5.5" width="11" height="7" rx="1.5" stroke="#fff" strokeWidth="1.3" />
    <path d="M4.5 5.5V4a2.5 2.5 0 015 0v1.5" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);
const IconLock = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="2" y="6" width="10" height="7" rx="1.5" stroke="#fff" strokeWidth="1.3" />
    <path d="M4.5 6V4.5a2.5 2.5 0 015 0V6" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
    <circle cx="7" cy="9.5" r="1" fill="#fff" />
  </svg>
);

// ─── Sub-componentes de formulário ────────────────────────────────────────────

function Campo({ label, icon, children }) {
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', left: '14px', top: '8px', zIndex: 1 }}>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: '8px', fontWeight: 700, letterSpacing: '2px',
          color: 'rgba(255,255,255,0.3)',
        }}>{label}</div>
      </div>
      <div style={{
        position: 'absolute', left: '14px', top: '50%',
        transform: 'translateY(-50%)', opacity: 0.25, pointerEvents: 'none',
      }}>{icon}</div>
      {children}
    </div>
  );
}

const inputBase = {
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  padding: '26px 14px 10px 36px',
  color: '#fff',
  fontSize: '15px',
  fontFamily: "'Barlow', sans-serif",
  fontWeight: 500,
  outline: 'none',
  transition: 'border-color 0.25s',
};

function Erro({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      background: 'rgba(229,57,53,0.1)', border: '1px solid rgba(229,57,53,0.3)',
      borderRadius: '10px', padding: '10px 14px',
      fontFamily: "'Barlow Condensed', sans-serif",
      fontSize: '12px', fontWeight: 700, letterSpacing: '1px',
      color: '#E53935', textAlign: 'center',
    }}>{msg}</div>
  );
}

// ─── Modal de adicionar conta (Entrar ou Criar) ───────────────────────────────

function ModalAdicionarConta({ onAdicionado, onFechar, contasExistentes }) {
  const [subtela, setSubtela] = useState('entrar');
  // entrar
  const [apelido, setApelido] = useState('');
  const [nomeGrupo, setNomeGrupo] = useState('');
  const [senha, setSenha] = useState('');
  // criar
  const [apelidoCriar, setApelidoCriar] = useState('');
  const [nomeGrupoCriar, setNomeGrupoCriar] = useState('');
  const [senhaCriar, setSenhaCriar] = useState('');
  const [confirma, setConfirma] = useState('');

  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [shake, setShake] = useState(false);

  function dispararShake(msg) {
    setErro(msg);
    setShake(true);
    setTimeout(() => setShake(false), 600);
  }

  async function handleEntrar() {
    if (!apelido.trim() || !nomeGrupo.trim() || !senha) {
      dispararShake('Preencha todos os campos.'); return;
    }
    if (/[A-Z]/.test(apelido.trim())) {
      dispararShake('apenas letras minusculas'); return;
    }
    if (nomeGrupo.trim() === '__ADMIN__') {
      onAdicionado('__adminuser__', '__ADMIN__');
      return;
    }
    if (senha.length !== 6) {
      dispararShake('A senha deve ter 6 dígitos.'); return;
    }
    // impede duplicata
    const jaExiste = contasExistentes.some(
      (c) => c.apelido === apelido.trim() && c.codigo === nomeGrupo.trim()
    );
    if (jaExiste) {
      dispararShake('Essa conta já está adicionada.'); return;
    }
    setCarregando(true); setErro('');
    try {
      const grupoRef = doc(db, 'grupos', nomeGrupo.trim());
      const grupoSnap = await getDoc(grupoRef);
      if (!grupoSnap.exists()) { dispararShake('Grupo não encontrado.'); setCarregando(false); return; }
      if (grupoSnap.data().senha !== senha) { dispararShake('Senha incorreta.'); setCarregando(false); return; }
      onAdicionado(apelido.trim(), nomeGrupo.trim());
    } catch {
      dispararShake('Erro de conexão. Tente novamente.');
    }
    setCarregando(false);
  }

  async function handleCriar() {
    if (!apelidoCriar.trim() || !nomeGrupoCriar.trim() || !senhaCriar || !confirma) {
      dispararShake('Preencha todos os campos.'); return;
    }
    if (/[A-Z]/.test(apelidoCriar.trim())) {
      dispararShake('apenas letras minusculas'); return;
    }
    if (senhaCriar.length !== 6) {
      dispararShake('A senha deve ter exatamente 6 dígitos.'); return;
    }
    if (senhaCriar !== confirma) {
      dispararShake('As senhas não coincidem.'); return;
    }
    const jaExiste = contasExistentes.some(
      (c) => c.apelido === apelidoCriar.trim() && c.codigo === nomeGrupoCriar.trim()
    );
    if (jaExiste) {
      dispararShake('Essa conta já está adicionada.'); return;
    }
    setCarregando(true); setErro('');
    try {
      const grupoRef = doc(db, 'grupos', nomeGrupoCriar.trim());
      const grupoSnap = await getDoc(grupoRef);
      if (grupoSnap.exists()) { dispararShake('Nome de grupo em uso. Escolha outro.'); setCarregando(false); return; }
      await setDoc(grupoRef, {
        nome: nomeGrupoCriar.trim(), senha: senhaCriar,
        criadoEm: new Date().toISOString(), criadoPor: apelidoCriar.trim(),
      });
      onAdicionado(apelidoCriar.trim(), nomeGrupoCriar.trim());
    } catch {
      dispararShake('Erro de conexão. Tente novamente.');
    }
    setCarregando(false);
  }

  const senhasOk = senhaCriar.length === 6 && confirma.length === 6 && senhaCriar === confirma;
  const senhasDiferentes = confirma.length > 0 && senhaCriar !== confirma;

  return (
    /* overlay */
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }} onClick={(e) => e.target === e.currentTarget && onFechar()}>
      <div style={{
        width: '100%', maxWidth: '480px',
        background: '#0a0a0a',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '24px 24px 0 0',
        padding: '24px 20px 40px',
        animation: 'slideUp 0.3s ease',
      }}>
        {/* handle */}
        <div style={{
          width: '36px', height: '4px', borderRadius: '2px',
          background: 'rgba(255,255,255,0.12)', margin: '0 auto 20px',
        }} />

        {/* título */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: '9px', fontWeight: 700, letterSpacing: '4px',
            color: 'rgba(201,168,76,0.6)', marginBottom: '2px',
          }}>CONTA</div>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: '26px', fontWeight: 900, color: '#fff', lineHeight: 1,
          }}>ADICIONAR GRUPO</div>
        </div>

        {/* abas entrar / criar */}
        <div style={{ display: 'flex', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {[{ id: 'entrar', label: 'ENTRAR' }, { id: 'criar', label: 'CRIAR GRUPO' }].map((a) => (
            <button key={a.id} onClick={() => { setSubtela(a.id); setErro(''); }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '8px 14px',
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '11px', fontWeight: 700, letterSpacing: '2px',
                color: subtela === a.id ? '#C9A84C' : 'rgba(255,255,255,0.25)',
                borderBottom: subtela === a.id ? '2px solid #C9A84C' : '2px solid transparent',
                transition: 'all 0.2s',
              }}>{a.label}</button>
          ))}
        </div>

        <div style={{ animation: shake ? 'shake 0.5s ease' : 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {subtela === 'entrar' ? (
            <>
              <Campo label="SEU NOME" icon={IconUser}>
                <input placeholder="Como você quer ser chamado" value={apelido}
                  onChange={(e) => setApelido(e.target.value.slice(0, 20))}
                  onKeyDown={(e) => e.key === 'Enter' && handleEntrar()}
                  style={inputBase}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(201,168,76,0.5)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} />
              </Campo>
              <Campo label="NOME DO GRUPO" icon={IconGrupo}>
                <input placeholder="Nome do seu grupo" value={nomeGrupo}
                  onChange={(e) => setNomeGrupo(e.target.value.slice(0, 15))}
                  onKeyDown={(e) => e.key === 'Enter' && handleEntrar()}
                  style={inputBase}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(201,168,76,0.5)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} />
              </Campo>
              <Campo label="SENHA DO GRUPO (6 DÍGITOS)" icon={IconLock}>
                <input placeholder="······" value={senha} type="password" inputMode="numeric"
                  onChange={(e) => setSenha(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyDown={(e) => e.key === 'Enter' && handleEntrar()}
                  style={{ ...inputBase, letterSpacing: '6px' }}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(201,168,76,0.5)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} />
              </Campo>
              <Erro msg={erro} />
              <button onClick={handleEntrar} disabled={carregando} style={{
                width: '100%',
                background: carregando ? 'rgba(201,168,76,0.3)' : 'linear-gradient(135deg, #C9A84C 0%, #a8752a 100%)',
                border: 'none', borderRadius: '12px', padding: '16px',
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '16px', fontWeight: 900, letterSpacing: '4px',
                color: '#000', cursor: carregando ? 'wait' : 'pointer',
                boxShadow: '0 8px 32px rgba(201,168,76,0.3)', transition: 'all 0.15s', marginTop: '2px',
              }}>{carregando ? 'VERIFICANDO...' : 'ENTRAR NO GRUPO'}</button>
            </>
          ) : (
            <>
              <Campo label="SEU NOME" icon={IconUser}>
                <input placeholder="Como você quer ser chamado" value={apelidoCriar}
                  onChange={(e) => setApelidoCriar(e.target.value.slice(0, 20))}
                  style={inputBase}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(201,168,76,0.5)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} />
              </Campo>
              <Campo label="NOME DO GRUPO (MÁX. 15 CARACTERES)" icon={IconGrupo}>
                <input placeholder="Escolha um nome único" value={nomeGrupoCriar}
                  onChange={(e) => setNomeGrupoCriar(e.target.value.slice(0, 15))}
                  style={inputBase}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(201,168,76,0.5)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} />
                <div style={{
                  position: 'absolute', right: '12px', bottom: '9px',
                  fontFamily: "'Barlow Condensed', sans-serif", fontSize: '9px',
                  color: nomeGrupoCriar.length >= 15 ? '#E53935' : 'rgba(255,255,255,0.2)',
                }}>{nomeGrupoCriar.length}/15</div>
              </Campo>
              <Campo label="SENHA DO GRUPO (6 DÍGITOS)" icon={IconLock}>
                <input placeholder="······" value={senhaCriar} type="password" inputMode="numeric"
                  onChange={(e) => setSenhaCriar(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  style={{ ...inputBase, letterSpacing: '6px' }}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(201,168,76,0.5)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} />
              </Campo>
              <Campo label="CONFIRMAR SENHA" icon={IconLock}>
                <input placeholder="······" value={confirma} type="password" inputMode="numeric"
                  onChange={(e) => setConfirma(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyDown={(e) => e.key === 'Enter' && handleCriar()}
                  style={{
                    ...inputBase, letterSpacing: '6px',
                    borderColor: senhasDiferentes ? 'rgba(229,57,53,0.5)' : 'rgba(255,255,255,0.1)',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = senhasDiferentes ? 'rgba(229,57,53,0.5)' : 'rgba(201,168,76,0.5)')}
                  onBlur={(e) => (e.target.style.borderColor = senhasDiferentes ? 'rgba(229,57,53,0.5)' : 'rgba(255,255,255,0.1)')} />
                {senhasOk && (
                  <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#2ecc71', fontSize: '13px' }}>✓</div>
                )}
              </Campo>
              <Erro msg={erro} />
              <button onClick={handleCriar} disabled={carregando} style={{
                width: '100%',
                background: carregando ? 'rgba(201,168,76,0.3)' : 'linear-gradient(135deg, #C9A84C 0%, #a8752a 100%)',
                border: 'none', borderRadius: '12px', padding: '16px',
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '16px', fontWeight: 900, letterSpacing: '4px',
                color: '#000', cursor: carregando ? 'wait' : 'pointer',
                boxShadow: '0 8px 32px rgba(201,168,76,0.3)', transition: 'all 0.15s', marginTop: '2px',
              }}>{carregando ? 'CRIANDO...' : 'CRIAR GRUPO'}</button>
            </>
          )}
          <button onClick={onFechar} style={{
            width: '100%', background: 'none', border: 'none',
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: '12px', fontWeight: 700, letterSpacing: '2px',
            color: 'rgba(255,255,255,0.25)', cursor: 'pointer', padding: '6px',
          }}>CANCELAR</button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal de confirmação genérico ────────────────────────────────────────────

function ModalConfirmar({ titulo, descricao, labelConfirmar, corConfirmar = '#E53935', onConfirmar, onCancelar }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }} onClick={(e) => e.target === e.currentTarget && onCancelar()}>
      <div style={{
        width: '100%', maxWidth: '320px',
        background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px', padding: '28px 20px 20px',
        animation: 'fadeIn 0.2s ease',
      }}>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: '18px', fontWeight: 900, color: '#fff',
          letterSpacing: '1px', marginBottom: '10px',
        }}>{titulo}</div>
        <div style={{
          fontSize: '13px', color: 'rgba(255,255,255,0.4)',
          fontFamily: "'Barlow', sans-serif", lineHeight: 1.6, marginBottom: '24px',
        }}>{descricao}</div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onCancelar} style={{
            flex: 1, background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
            padding: '12px', fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: '13px', fontWeight: 700, letterSpacing: '2px',
            color: 'rgba(255,255,255,0.35)', cursor: 'pointer',
          }}>CANCELAR</button>
          <button onClick={onConfirmar} style={{
            flex: 1,
            background: corConfirmar === '#E53935'
              ? 'rgba(229,57,53,0.12)' : 'rgba(201,168,76,0.12)',
            border: `1px solid ${corConfirmar === '#E53935' ? 'rgba(229,57,53,0.3)' : 'rgba(201,168,76,0.3)'}`,
            borderRadius: '10px', padding: '12px',
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: '13px', fontWeight: 900, letterSpacing: '2px',
            color: corConfirmar, cursor: 'pointer',
          }}>{labelConfirmar}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function Configuracoes({ contas, contaAtiva, onTrocarConta, onAdicionarConta, onRemoverConta, onLogout, statusNotif, onAtivarNotificacoes }) {
  const [modalAdicionando, setModalAdicionando] = useState(false);
  const [confirmando, setConfirmando] = useState(null); // { tipo: 'sair'|'deslogar', conta }

  function handleAdicionado(apelido, codigo) {
    setModalAdicionando(false);
    onAdicionarConta(apelido, codigo);
  }

  function handleConfirmar() {
    if (!confirmando) return;
    if (confirmando.tipo === 'deslogar') {
      onRemoverConta(confirmando.conta);
    } else if (confirmando.tipo === 'sair') {
      onRemoverConta(confirmando.conta);
    }
    setConfirmando(null);
  }

  const contaAtivaObj = contas[contaAtiva];
  const outrasContas = contas.filter((_, i) => i !== contaAtiva);

  return (
    <div style={{ background: '#000', minHeight: '100vh', fontFamily: "'Barlow', sans-serif", paddingBottom: '100px' }}>

      {/* Header */}
      <div style={{
        background: 'rgba(0,0,0,0.97)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '16px 16px 14px',
        position: 'sticky', top: 0, zIndex: 10,
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: '9px', fontWeight: 700, letterSpacing: '5px',
          color: '#C9A84C', opacity: 0.7, marginBottom: '1px',
        }}>BOLÃO COPA DO MUNDO 2026</div>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: '32px', fontWeight: 900, color: '#fff',
          lineHeight: 1, letterSpacing: '1px',
        }}>CONFIGURAÇÕES</div>
      </div>

      <div style={{ padding: '16px 14px 0' }}>

        {/* ── Conta ativa ─────────────────────────────────────────────────── */}
        <SectionLabel>CONTA ATIVA</SectionLabel>
        <div style={{
          borderRadius: '16px', overflow: 'hidden',
          border: '1px solid rgba(201,168,76,0.2)',
          background: 'rgba(201,168,76,0.04)', marginBottom: '8px',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            padding: '16px',
          }}>
            {/* avatar */}
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #C9A84C, #a8752a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '20px', fontWeight: 900, color: '#000', flexShrink: 0,
            }}>{contaAtivaObj?.apelido?.[0]?.toUpperCase() ?? '?'}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '16px', fontWeight: 900, color: '#C9A84C',
                letterSpacing: '0.5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{contaAtivaObj?.apelido?.toUpperCase()}</div>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '11px', fontWeight: 700,
                color: 'rgba(255,255,255,0.35)', letterSpacing: '1px',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{contaAtivaObj?.codigo?.toUpperCase()}</div>
            </div>
            <div style={{
              background: 'rgba(201,168,76,0.12)',
              border: '1px solid rgba(201,168,76,0.25)',
              borderRadius: '6px', padding: '4px 10px',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '9px', fontWeight: 700, letterSpacing: '2px', color: '#C9A84C',
            }}>ATIVA</div>
          </div>

          {/* ações da conta ativa */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <BotaoAcao
              label="DESLOGAR DESTA CONTA"
              descricao="Você precisará fazer login novamente para acessar."
              cor="rgba(255,255,255,0.3)"
              corBg="rgba(255,255,255,0.04)"
              corBorder="rgba(255,255,255,0.08)"
              onClick={() => setConfirmando({ tipo: 'deslogar', conta: contaAtiva })}
            />
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.04)', margin: '0 16px' }} />
            <BotaoAcao
              label="SAIR DO GRUPO DEFINITIVAMENTE"
              descricao="Remove esta conta do aplicativo."
              cor="#E53935"
              corBg="rgba(229,57,53,0.04)"
              corBorder="transparent"
              onClick={() => setConfirmando({ tipo: 'sair', conta: contaAtiva })}
            />
          </div>
        </div>

        {/* ── Outras contas ────────────────────────────────────────────────── */}
        {outrasContas.length > 0 && (
          <>
            <SectionLabel style={{ marginTop: '24px' }}>OUTRAS CONTAS</SectionLabel>
            <div style={{
              borderRadius: '16px', overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.07)',
              background: 'rgba(255,255,255,0.02)', marginBottom: '8px',
            }}>
              {contas.map((conta, i) => {
                if (i === contaAtiva) return null;
                return (
                  <div key={`${conta.apelido}_${conta.codigo}`}>
                    {i > 0 && i !== contaAtiva && (
                      <div style={{ height: '1px', background: 'rgba(255,255,255,0.04)', margin: '0 14px' }} />
                    )}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '14px 16px', cursor: 'pointer',
                    }}
                      onClick={() => onTrocarConta(i)}
                    >
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: '16px', fontWeight: 900,
                        color: 'rgba(255,255,255,0.5)', flexShrink: 0,
                      }}>{conta.apelido?.[0]?.toUpperCase() ?? '?'}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontSize: '14px', fontWeight: 900, color: '#fff',
                          letterSpacing: '0.5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>{conta.apelido?.toUpperCase()}</div>
                        <div style={{
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontSize: '10px', fontWeight: 700,
                          color: 'rgba(255,255,255,0.25)', letterSpacing: '1px',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>{conta.codigo?.toUpperCase()}</div>
                      </div>
                      {/* seta */}
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, opacity: 0.3 }}>
                        <path d="M6 4l4 4-4 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── Adicionar conta ──────────────────────────────────────────────── */}
        <div style={{ marginTop: outrasContas.length > 0 ? '8px' : '24px' }}>
          <button onClick={() => setModalAdicionando(true)} style={{
            width: '100%',
            background: 'rgba(201,168,76,0.06)',
            border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: '14px', padding: '15px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            cursor: 'pointer',
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <line x1="8" y1="2" x2="8" y2="14" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="2" y1="8" x2="14" y2="8" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '13px', fontWeight: 700, letterSpacing: '3px', color: '#C9A84C',
            }}>ADICIONAR CONTA</span>
          </button>
        </div>

        {/* ── Notificações ─────────────────────────────────────────────────── */}
        <div style={{ marginTop: '24px' }}>
          <SectionLabel>NOTIFICAÇÕES</SectionLabel>
          <div style={{
            borderRadius: '16px', overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.07)',
            background: 'rgba(255,255,255,0.02)',
          }}>
            <div style={{ padding: '16px' }}>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '13px', fontWeight: 700, color: '#fff',
                letterSpacing: '0.5px', marginBottom: '4px',
              }}>ALERTAS DE PALPITE</div>
              <div style={{
                fontFamily: "'Barlow', sans-serif",
                fontSize: '12px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.6,
                marginBottom: '14px',
              }}>
                Receba alertas 10 min e 5 min antes de cada palpite fechar.
              </div>

              {/* Status atual */}
              {statusNotif === 'unsupported' && (
                <div style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px', padding: '10px 14px',
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '11px', fontWeight: 700, letterSpacing: '2px',
                  color: 'rgba(255,255,255,0.25)',
                }}>DISPOSITIVO NÃO SUPORTA NOTIFICAÇÕES</div>
              )}

              {statusNotif === 'denied' && (
                <div style={{
                  background: 'rgba(229,57,53,0.08)',
                  border: '1px solid rgba(229,57,53,0.2)',
                  borderRadius: '10px', padding: '10px 14px',
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '11px', fontWeight: 700, letterSpacing: '1px',
                  color: 'rgba(229,57,53,0.8)',
                }}>
                  BLOQUEADAS — Ative nas configurações do navegador e recarregue o app.
                </div>
              )}

              {statusNotif === 'granted' && (
                <div style={{
                  background: 'rgba(46,204,113,0.08)',
                  border: '1px solid rgba(46,204,113,0.2)',
                  borderRadius: '10px', padding: '10px 14px',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <div style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: '#2ecc71', boxShadow: '0 0 6px #2ecc71', flexShrink: 0,
                  }} />
                  <div style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: '#2ecc71',
                  }}>ATIVAS E AGENDADAS</div>
                </div>
              )}

              {(statusNotif === 'default' || statusNotif === 'error') && (
                <button onClick={onAtivarNotificacoes} style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #C9A84C 0%, #a8752a 100%)',
                  border: 'none', borderRadius: '10px', padding: '12px',
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '13px', fontWeight: 900, letterSpacing: '3px',
                  color: '#000', cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(201,168,76,0.25)',
                }}>ATIVAR NOTIFICAÇÕES</button>
              )}
            </div>

            {/* Nota iOS */}
            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.04)',
              padding: '10px 16px',
              fontFamily: "'Barlow', sans-serif",
              fontSize: '11px', color: 'rgba(255,255,255,0.18)', lineHeight: 1.6,
            }}>
              No iPhone, adicione o app à tela inicial para receber notificações.
            </div>
          </div>
        </div>

        {/* ── Sobre ────────────────────────────────────────────────────────── */}
        <div style={{
          marginTop: '32px', padding: '0 4px',
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: '10px', fontWeight: 700,
          letterSpacing: '1px', color: 'rgba(255,255,255,0.12)',
          textAlign: 'center', lineHeight: 1.8,
        }}>
          BOLÃO COPA DO MUNDO 2026 · FIFA WORLD CUP™
        </div>
      </div>

      {/* Modais */}
      {modalAdicionando && (
        <ModalAdicionarConta
          onAdicionado={handleAdicionado}
          onFechar={() => setModalAdicionando(false)}
          contasExistentes={contas}
        />
      )}

      {confirmando !== null && (
        <ModalConfirmar
          titulo={confirmando.tipo === 'sair' ? 'SAIR DO GRUPO?' : 'DESLOGAR?'}
          descricao={
            confirmando.tipo === 'sair'
              ? 'Você será removido deste grupo no app. Para voltar, precisará fazer login novamente.'
              : 'Você será deslogado desta conta. Para voltar, precisará fazer login novamente.'
          }
          labelConfirmar={confirmando.tipo === 'sair' ? 'SAIR' : 'DESLOGAR'}
          corConfirmar="#E53935"
          onConfirmar={handleConfirmar}
          onCancelar={() => setConfirmando(null)}
        />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=Barlow:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}

// ─── Helpers visuais ──────────────────────────────────────────────────────────

function SectionLabel({ children, style }) {
  return (
    <div style={{
      fontFamily: "'Barlow Condensed', sans-serif",
      fontSize: '9px', fontWeight: 700, letterSpacing: '3px',
      color: 'rgba(255,255,255,0.25)', marginBottom: '8px',
      paddingLeft: '2px', ...style,
    }}>{children}</div>
  );
}

function BotaoAcao({ label, descricao, cor, corBg, corBorder, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', background: corBg,
      border: 'none', borderBottom: `1px solid ${corBorder}`,
      padding: '14px 16px', cursor: 'pointer', textAlign: 'left',
      display: 'flex', flexDirection: 'column', gap: '2px',
    }}>
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: '12px', fontWeight: 700, letterSpacing: '2px', color: cor,
      }}>{label}</div>
      <div style={{
        fontFamily: "'Barlow', sans-serif",
        fontSize: '11px', color: 'rgba(255,255,255,0.2)',
      }}>{descricao}</div>
    </button>
  );
}
