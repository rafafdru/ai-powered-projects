import { useState, useEffect } from 'react';
import { jogos, grupos } from '../dados';

const FLAGS = {
  México: 'mx',
  'Coreia do Sul': 'kr',
  'África do Sul': 'za',
  Tchéquia: 'cz',
  Canadá: 'ca',
  Suíça: 'ch',
  Catar: 'qa',
  'Bósnia-Herzegovina': 'ba',
  Brasil: 'br',
  Marrocos: 'ma',
  Escócia: 'gb-sct',
  Haiti: 'ht',
  EUA: 'us',
  Paraguai: 'py',
  Austrália: 'au',
  Turquia: 'tr',
  Alemanha: 'de',
  Equador: 'ec',
  'Costa do Marfim': 'ci',
  Curaçao: 'cw',
  Holanda: 'nl',
  Japão: 'jp',
  Tunísia: 'tn',
  Suécia: 'se',
  Bélgica: 'be',
  Irã: 'ir',
  Egito: 'eg',
  'Nova Zelândia': 'nz',
  Espanha: 'es',
  Uruguai: 'uy',
  'Arábia Saudita': 'sa',
  'Cabo Verde': 'cv',
  França: 'fr',
  Senegal: 'sn',
  Noruega: 'no',
  Iraque: 'iq',
  Argentina: 'ar',
  Áustria: 'at',
  Argélia: 'dz',
  Jordânia: 'jo',
  Portugal: 'pt',
  Colômbia: 'co',
  Uzbequistão: 'uz',
  'RD Congo': 'cd',
  Inglaterra: 'gb-eng',
  Croácia: 'hr',
  Panamá: 'pa',
  Gana: 'gh',
};

function getFlag(time) {
  const code = FLAGS[time];
  return code ? `https://flagcdn.com/w80/${code}.png` : null;
}

const MESES = [
  'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN',
  'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ',
];

function formatarData(data) {
  const [, mes, dia] = data.split('-');
  const semana = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
  const d = new Date(`${data}T12:00:00`);
  return `${semana[d.getDay()]} ${dia}/${MESES[parseInt(mes) - 1]}`;
}

function isBloqueado(jogo) {
  const dataHora = new Date(`${jogo.data}T${jogo.hora}:00`);
  return new Date() >= new Date(dataHora.getTime() - 5 * 60 * 1000);
}

function useCountdown(jogo) {
  const [countdown, setCountdown] = useState('');
  useEffect(() => {
    function calc() {
      const alvo =
        new Date(`${jogo.data}T${jogo.hora}:00`).getTime() - 5 * 60 * 1000;
      const diff = alvo - Date.now();
      if (diff <= 0) { setCountdown(''); return; }
      const totalMin = Math.floor(diff / 60000);
      const h = Math.floor(totalMin / 60);
      const m = totalMin % 60;
      if (h >= 24) {
        const dias = Math.floor(h / 24);
        const hRest = h % 24;
        setCountdown(`${dias}D ${hRest}H ${String(m).padStart(2, '0')}M`);
      } else {
        setCountdown(`${String(h).padStart(2, '0')}H ${String(m).padStart(2, '0')}M`);
      }
    }
    calc();
    const t = setInterval(calc, 30000);
    return () => clearInterval(t);
  }, [jogo]);
  return countdown;
}

function calcularFeedback(palpite, resultado) {
  if (!resultado || resultado.g1 === '' || resultado.g2 === '') return null;
  if (!palpite || palpite.g1 === '' || palpite.g2 === '') return null;
  const rg1 = parseInt(resultado.g1);
  const rg2 = parseInt(resultado.g2);
  const pg1 = parseInt(palpite.g1);
  const pg2 = parseInt(palpite.g2);
  if (pg1 === rg1 && pg2 === rg2) return 'exato';
  const vrenc = rg1 > rg2 ? 1 : rg1 < rg2 ? -1 : 0;
  const prenc = pg1 > pg2 ? 1 : pg1 < pg2 ? -1 : 0;
  if (vrenc === prenc) return 'parcial';
  return 'errado';
}

function FeedbackBar({ feedback }) {
  if (!feedback) return null;
  const config = {
    exato: { label: 'PLACAR EXATO', pts: '+3 PTS', cor: '#2ecc71', bgCor: 'rgba(46,204,113,0.08)', borderCor: 'rgba(46,204,113,0.2)' },
    parcial: { label: 'RESULTADO CERTO', pts: '+1 PT', cor: '#C9A84C', bgCor: 'rgba(201,168,76,0.08)', borderCor: 'rgba(201,168,76,0.2)' },
    errado: { label: 'ERRADO', pts: null, cor: 'rgba(229,57,53,0.7)', bgCor: 'rgba(229,57,53,0.05)', borderCor: 'rgba(229,57,53,0.15)' },
  }[feedback];
  return (
    <div style={{ margin: '0 14px 14px', borderRadius: '10px', padding: '9px 14px', background: config.bgCor, border: `1px solid ${config.borderCor}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: config.cor }}>{config.label}</div>
      {config.pts && <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '13px', fontWeight: 900, color: config.cor, letterSpacing: '1px' }}>{config.pts}</div>}
    </div>
  );
}

function CardJogo({ jogo, palpite, jaFoiSalvo, salvando, foiSalvoAgora, onSalvar, onChange, resultado }) {
  const bloqueado = isBloqueado(jogo);
  const countdown = useCountdown(jogo);
  const temPalpite = palpite && palpite.g1 !== '' && palpite.g2 !== '';
  const salvo = jaFoiSalvo || foiSalvoAgora;
  const feedback = calcularFeedback(palpite, resultado);
  const temResultado = resultado && resultado.g1 !== '' && resultado.g2 !== '';

  return (
    <div style={{
      marginBottom: '10px',
      borderRadius: '16px',
      overflow: 'hidden',
      background: bloqueado ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.03)',
      border: foiSalvoAgora
        ? '1px solid rgba(46,204,113,0.3)'
        : feedback === 'exato'
        ? '1px solid rgba(46,204,113,0.2)'
        : feedback === 'parcial'
        ? '1px solid rgba(201,168,76,0.2)'
        : bloqueado
        ? '1px solid rgba(255,255,255,0.05)'
        : '1px solid rgba(201,168,76,0.15)',
      transition: 'border-color 0.4s',
    }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {!bloqueado && countdown ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#2ecc71', boxShadow: '0 0 6px #2ecc71', flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '8px', fontWeight: 700, letterSpacing: '2px', color: 'rgba(46,204,113,0.7)' }}>FECHA EM</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '18px', fontWeight: 900, color: '#2ecc71', lineHeight: 1, letterSpacing: '1px' }}>{countdown}</div>
              </div>
            </div>
          ) : (
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '10px', fontWeight: 700, letterSpacing: '2px', color: 'rgba(255,255,255,0.2)' }}>ENCERRADO</div>
          )}
        </div>

        {temResultado && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', flex: 1 }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '8px', fontWeight: 700, letterSpacing: '2px', color: 'rgba(255,255,255,0.3)' }}>PLACAR REAL</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '16px', fontWeight: 900, color: 'rgba(255,255,255,0.75)', letterSpacing: '3px', lineHeight: 1 }}>{resultado.g1} × {resultado.g2}</div>
          </div>
        )}

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '9px', fontWeight: 700, letterSpacing: '2px', color: 'rgba(201,168,76,0.6)' }}>GRUPO {jogo.grupo}</div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.5px' }}>{formatarData(jogo.data)} · {jogo.hora}</div>
        </div>
      </div>

      {/* Match body */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 14px 14px', gap: '8px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
          {getFlag(jogo.time1) && (
            <img src={getFlag(jogo.time1)} alt={jogo.time1} style={{ width: '40px', height: '28px', objectFit: 'cover', borderRadius: '4px', opacity: bloqueado ? 0.5 : 1, boxShadow: bloqueado ? 'none' : '0 2px 8px rgba(0,0,0,0.4)' }} />
          )}
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '14px', fontWeight: 700, color: bloqueado ? 'rgba(255,255,255,0.3)' : '#fff', letterSpacing: '0.5px', lineHeight: 1 }}>{jogo.time1.toUpperCase()}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {bloqueado ? (
            <>
              <div style={styles.scoreLocked}>{palpite?.g1 ?? '—'}</div>
              <div style={styles.scoreSep}>×</div>
              <div style={styles.scoreLocked}>{palpite?.g2 ?? '—'}</div>
            </>
          ) : (
            <>
              <input style={styles.scoreInput} value={palpite?.g1 ?? ''} onChange={(e) => onChange('g1', e.target.value)} maxLength={2} inputMode="numeric" />
              <div style={styles.scoreSep}>×</div>
              <input style={styles.scoreInput} value={palpite?.g2 ?? ''} onChange={(e) => onChange('g2', e.target.value)} maxLength={2} inputMode="numeric" />
            </>
          )}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          {getFlag(jogo.time2) && (
            <img src={getFlag(jogo.time2)} alt={jogo.time2} style={{ width: '40px', height: '28px', objectFit: 'cover', borderRadius: '4px', opacity: bloqueado ? 0.5 : 1, boxShadow: bloqueado ? 'none' : '0 2px 8px rgba(0,0,0,0.4)' }} />
          )}
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '14px', fontWeight: 700, color: bloqueado ? 'rgba(255,255,255,0.3)' : '#fff', letterSpacing: '0.5px', lineHeight: 1, textAlign: 'right' }}>{jogo.time2.toUpperCase()}</div>
        </div>
      </div>

      {bloqueado && feedback && <FeedbackBar feedback={feedback} />}

      {!bloqueado && (
        <div style={{ padding: '0 14px 14px' }}>
          <button onClick={salvo ? undefined : onSalvar} style={{
            width: '100%', borderRadius: '10px', padding: '11px',
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: '13px', fontWeight: 900, letterSpacing: '3px',
            cursor: salvo ? 'default' : 'pointer', transition: 'all 0.25s', border: 'none',
            background: salvo ? 'rgba(46,204,113,0.08)' : salvando ? 'rgba(201,168,76,0.08)' : temPalpite ? 'linear-gradient(135deg, #C9A84C 0%, #a8752a 100%)' : 'rgba(201,168,76,0.08)',
            color: salvo ? '#2ecc71' : salvando ? '#C9A84C' : temPalpite ? '#000' : 'rgba(201,168,76,0.4)',
            boxShadow: !salvo && !salvando && temPalpite ? '0 4px 20px rgba(201,168,76,0.25)' : 'none',
          }}>
            {salvo ? '✓  PALPITE SALVO' : salvando ? 'SALVANDO...' : 'SALVAR PALPITE'}
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  scoreInput: {
    background: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.3)',
    borderRadius: '10px', width: '40px', height: '40px', color: '#C9A84C',
    fontSize: '20px', fontWeight: 900, textAlign: 'center', outline: 'none',
    fontFamily: "'Barlow Condensed', sans-serif",
  },
  scoreLocked: {
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '10px', width: '40px', height: '40px', display: 'flex',
    alignItems: 'center', justifyContent: 'center', color: 'rgba(201,168,76,0.4)',
    fontSize: '18px', fontWeight: 900, fontFamily: "'Barlow Condensed', sans-serif",
  },
  scoreSep: {
    color: 'rgba(255,255,255,0.15)', fontSize: '14px', fontWeight: 700,
    fontFamily: "'Barlow Condensed', sans-serif",
  },
};

export default function Jogos({ usuario, palpites, onSalvar, resultados }) {
  const [editando, setEditando] = useState({});
  const [salvandoId, setSalvandoId] = useState(null);
  const [savedIds, setSavedIds] = useState({});
  const [modalTutorial, setModalTutorial] = useState(false);
  const [cardAtual, setCardAtual] = useState(0);

  const jogosOrdenados = [...jogos].sort((a, b) => {
    const tA = `${a.data}T${a.hora}`;
    const tB = `${b.data}T${b.hora}`;
    if (tA !== tB) return tA.localeCompare(tB);
    return a.grupo.localeCompare(b.grupo);
  });

  function handleChange(jogoId, campo, valor) {
    const num = valor.replace(/\D/g, '').slice(0, 2);
    setEditando((prev) => ({ ...prev, [jogoId]: { ...prev[jogoId], [campo]: num } }));
    // Reativa o botão salvar quando o usuário começa a editar um palpite já salvo
    setSavedIds((prev) => { const n = { ...prev }; delete n[jogoId]; return n; });
  }

  function getPalpite(jogoId) {
    return editando[jogoId] !== undefined
      ? editando[jogoId]
      : palpites[jogoId] || { g1: '', g2: '' };
  }

  async function salvar(jogoId) {
    const p = editando[jogoId];
    if (!p || p.g1 === '' || p.g2 === '') return;
    setSalvandoId(jogoId);
    await onSalvar(jogoId, p);
    setSalvandoId(null);
    setSavedIds((prev) => ({ ...prev, [jogoId]: true }));
    setEditando((prev) => { const n = { ...prev }; delete n[jogoId]; return n; });
  }

  return (
    <div style={{ background: '#000', minHeight: '100vh', paddingBottom: '80px', maxWidth: '100vw', overflowX: 'hidden' }}>
      <div style={{ background: 'rgba(0,0,0,0.97)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 16px 14px', position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(20px)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '9px', fontWeight: 700, letterSpacing: '5px', color: '#C9A84C', opacity: 0.7, marginBottom: '1px' }}>FASE DE GRUPOS</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '32px', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '1px' }}>PALPITES</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.25)', marginTop: '4px', letterSpacing: '1px' }}>
              {usuario.apelido.toUpperCase()} · {usuario.codigo.toUpperCase()}
            </div>
          </div>
          <button onClick={() => { setModalTutorial(true); setCardAtual(0); }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', padding: '4px', marginTop: '2px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1.5px solid rgba(201,168,76,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '15px', fontWeight: 900, color: '#C9A84C', lineHeight: 1 }}>?</span>
            </div>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '7px', fontWeight: 700, letterSpacing: '1px', color: 'rgba(201,168,76,0.5)' }}>COMO JOGAR</span>
          </button>
        </div>
      </div>

      <div style={{ padding: '14px 14px 0' }}>
        {jogosOrdenados.map((jogo) => (
          <CardJogo
            key={jogo.id}
            jogo={jogo}
            palpite={getPalpite(jogo.id)}
            jaFoiSalvo={!!palpites[jogo.id] && editando[jogo.id] === undefined}
            salvando={salvandoId === jogo.id}
            foiSalvoAgora={savedIds[jogo.id]}
            onSalvar={() => salvar(jogo.id)}
            onChange={(campo, valor) => handleChange(jogo.id, campo, valor)}
            resultado={resultados?.[jogo.id] || null}
          />
        ))}
      </div>


      {/* ── Modal Tutorial ─────────────────────────────────────────────── */}
      {modalTutorial && (
        <div onClick={(e) => e.target === e.currentTarget && setModalTutorial(false)} style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ width: '100%', maxWidth: '360px', background: '#0d0d0d', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '24px', padding: '28px 24px 24px', position: 'relative' }}>

            {/* Fechar */}
            <button onClick={() => setModalTutorial(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', fontSize: '20px', lineHeight: 1, padding: '4px' }}>✕</button>

            {/* Indicador de cards */}
            <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginBottom: '24px' }}>
              {[0,1,2,3,4,5].map((i) => (
                <div key={i} onClick={() => setCardAtual(i)} style={{ width: cardAtual === i ? '20px' : '6px', height: '6px', borderRadius: '3px', background: cardAtual === i ? '#C9A84C' : 'rgba(255,255,255,0.12)', transition: 'all 0.3s', cursor: 'pointer' }} />
              ))}
            </div>

            {/* Card 0 — Como funciona */}
            {cardAtual === 0 && (
              <div>
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>🏆</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '18px', fontWeight: 900, color: '#C9A84C', letterSpacing: '1px', marginBottom: '12px' }}>COMO FUNCIONA</div>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: 0 }}>Você faz palpites de placar para os jogos da Copa.</p>
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[['Placar exato', '3 pontos', '#C9A84C'], ['Resultado certo', '1 ponto', 'rgba(255,255,255,0.5)'], ['Errou', '0 pontos', 'rgba(229,57,53,0.6)']].map(([label, pts, cor]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '10px 14px' }}>
                      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px' }}>{label}</span>
                      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '15px', fontWeight: 900, color: cor }}>{pts}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Card 1 — Prazo */}
            {cardAtual === 1 && (
              <div>
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>⏱</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '18px', fontWeight: 900, color: '#C9A84C', letterSpacing: '1px', marginBottom: '12px' }}>PRAZO PARA PALPITAR</div>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: '0 0 14px' }}>Cada jogo tem um contador regressivo. Quando chegar a zero, o palpite fecha — <strong style={{color:'#fff'}}>5 minutos antes do apito inicial</strong>.</p>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: 0 }}>Depois disso, não dá mais para alterar. Salve seus palpites com antecedência para não perder.</p>
              </div>
            )}

            {/* Card 2 — Notificações */}
            {cardAtual === 2 && (
              <div>
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>🔔</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '18px', fontWeight: 900, color: '#C9A84C', letterSpacing: '1px', marginBottom: '12px' }}>NOTIFICAÇÕES</div>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: '0 0 14px' }}>Ative as notificações em <strong style={{color:'#fff'}}>Configurações</strong> para receber alertas quando um jogo estiver prestes a fechar.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[['10 min antes', 'do fechamento'], ['5 min antes', 'do fechamento']].map(([t, sub]) => (
                    <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '10px 14px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2ecc71', boxShadow: '0 0 6px #2ecc71', flexShrink: 0 }} />
                      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '13px', fontWeight: 700, color: '#fff' }}>{t} <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>{sub}</span></span>
                    </div>
                  ))}
                </div>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.6, margin: '14px 0 0' }}>No iPhone, adicione o app à tela inicial para receber os alertas.</p>
              </div>
            )}

            {/* Card 3 — Fase de grupos */}
            {cardAtual === 3 && (
              <div>
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>📋</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '18px', fontWeight: 900, color: '#C9A84C', letterSpacing: '1px', marginBottom: '12px' }}>FASE DE GRUPOS</div>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: '0 0 14px' }}>São <strong style={{color:'#fff'}}>72 jogos</strong> divididos em <strong style={{color:'#fff'}}>12 grupos</strong> (A a L). Você pode palpitar em todos, mas só pontua nos que salvar antes do fechamento.</p>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: 0 }}>Acompanhe a classificação dos grupos na aba <strong style={{color:'#fff'}}>Tabela</strong>.</p>
              </div>
            )}

            {/* Card 4 — Mata-mata */}
            {cardAtual === 4 && (
              <div>
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>⚔️</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '18px', fontWeight: 900, color: '#C9A84C', letterSpacing: '1px', marginBottom: '12px' }}>MATA-MATA</div>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: '0 0 14px' }}>Após a fase de grupos, os <strong style={{color:'#fff'}}>16avos, oitavas, quartas, semifinais, disputa de terceiro e final</strong> serão liberados para palpite.</p>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: 0 }}>Os times só aparecem quando o confronto for definido. As regras de pontuação são as mesmas.</p>
              </div>
            )}

            {/* Card 5 — FAQ */}
            {cardAtual === 5 && (
              <div>
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>💬</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '18px', fontWeight: 900, color: '#C9A84C', letterSpacing: '1px', marginBottom: '14px' }}>DÚVIDAS FREQUENTES</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    ['Posso mudar meu palpite?', 'Sim, até o jogo fechar.'],
                    ['Posso participar de mais de um grupo?', 'Sim — adicione outra conta em Configurações.'],
                    ['Não vejo meu palpite salvo.', 'Feche e reabra o app.'],
                    ['O ranking não atualizou.', 'Troque de aba e volte.'],
                  ].map(([p, r]) => (
                    <div key={p} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '10px 14px' }}>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '12px', fontWeight: 700, color: '#fff', letterSpacing: '0.3px', marginBottom: '3px' }}>{p}</div>
                      <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{r}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navegação */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
              <button onClick={() => setCardAtual((c) => Math.max(0, c - 1))} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '9px 18px', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '12px', fontWeight: 700, letterSpacing: '2px', color: cardAtual === 0 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.4)', cursor: cardAtual === 0 ? 'default' : 'pointer' }}>← ANTERIOR</button>
              {cardAtual < 5 ? (
                <button onClick={() => setCardAtual((c) => c + 1)} style={{ background: 'linear-gradient(135deg, #C9A84C, #a8752a)', border: 'none', borderRadius: '10px', padding: '9px 18px', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '12px', fontWeight: 900, letterSpacing: '2px', color: '#000', cursor: 'pointer' }}>PRÓXIMO →</button>
              ) : (
                <button onClick={() => setModalTutorial(false)} style={{ background: 'linear-gradient(135deg, #C9A84C, #a8752a)', border: 'none', borderRadius: '10px', padding: '9px 18px', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '12px', fontWeight: 900, letterSpacing: '2px', color: '#000', cursor: 'pointer' }}>ENTENDIDO ✓</button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=Barlow:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
      `}</style>
    </div>
  );
}
