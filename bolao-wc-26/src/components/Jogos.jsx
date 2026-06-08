import { useState, useEffect } from 'react';
import { jogos, grupos } from '../dados';

const FLAGS = {
  México: 'mx', 'Coreia do Sul': 'kr', 'África do Sul': 'za', Tchéquia: 'cz',
  Canadá: 'ca', Suíça: 'ch', Catar: 'qa', 'Bósnia-Herzegovina': 'ba',
  Brasil: 'br', Marrocos: 'ma', Escócia: 'gb-sct', Haiti: 'ht', EUA: 'us',
  Paraguai: 'py', Austrália: 'au', Turquia: 'tr', Alemanha: 'de', Equador: 'ec',
  'Costa do Marfim': 'ci', Curaçao: 'cw', Holanda: 'nl', Japão: 'jp',
  Tunísia: 'tn', Suécia: 'se', Bélgica: 'be', Irã: 'ir', Egito: 'eg',
  'Nova Zelândia': 'nz', Espanha: 'es', Uruguai: 'uy', 'Arábia Saudita': 'sa',
  'Cabo Verde': 'cv', França: 'fr', Senegal: 'sn', Noruega: 'no', Iraque: 'iq',
  Argentina: 'ar', Áustria: 'at', Argélia: 'dz', Jordânia: 'jo', Portugal: 'pt',
  Colômbia: 'co', Uzbequistão: 'uz', 'RD Congo': 'cd', Inglaterra: 'gb-eng',
  Croácia: 'hr', Panamá: 'pa', Gana: 'gh',
};

function getFlag(time) {
  const code = FLAGS[time];
  return code ? `https://flagcdn.com/w80/${code}.png` : null;
}

const MESES = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];
function formatarData(data) {
  const [, mes, dia] = data.split('-');
  const semana = ['DOM','SEG','TER','QUA','QUI','SEX','SÁB'];
  const d = new Date(`${data}T12:00:00`);
  return `${semana[d.getDay()]} ${dia}/${MESES[parseInt(mes)-1]}`;
}

function isBloqueado(jogo) {
  const dataHora = new Date(`${jogo.data}T${jogo.hora}:00`);
  return new Date() >= new Date(dataHora.getTime() - 5 * 60 * 1000);
}

function useCountdown(jogo) {
  const [countdown, setCountdown] = useState('');
  useEffect(() => {
    function calc() {
      const alvo = new Date(`${jogo.data}T${jogo.hora}:00`).getTime() - 5 * 60 * 1000;
      const diff = alvo - Date.now();
      if (diff <= 0) { setCountdown(''); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      if (h >= 24) {
        const dias = Math.floor(h / 24);
        setCountdown(`${dias}D ${h % 24}H`);
      } else {
        setCountdown(`${String(h).padStart(2,'0')}H ${String(m).padStart(2,'0')}M`);
      }
    }
    calc();
    const t = setInterval(calc, 30000);
    return () => clearInterval(t);
  }, [jogo]);
  return countdown;
}

function CardJogo({ jogo, palpite, salvando, foiSalvo, onSalvar, onChange }) {
  const bloqueado = isBloqueado(jogo);
  const countdown = useCountdown(jogo);
  const temPalpite = palpite && palpite.g1 !== '' && palpite.g2 !== '';

  return (
    <div style={{
      margin: '0 14px 10px',
      borderRadius: '16px',
      overflow: 'hidden',
      background: bloqueado ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.03)',
      border: foiSalvo
        ? '1px solid rgba(46,204,113,0.3)'
        : bloqueado
        ? '1px solid rgba(255,255,255,0.05)'
        : '1px solid rgba(201,168,76,0.15)',
      transition: 'border-color 0.4s',
    }}>

      {/* Card top bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px 8px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {!bloqueado && countdown && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <div style={{
                width: '5px', height: '5px', borderRadius: '50%',
                background: '#2ecc71',
                boxShadow: '0 0 6px #2ecc71',
                flexShrink: 0,
              }} />
              <div>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '8px',
                  fontWeight: 700,
                  letterSpacing: '2px',
                  color: 'rgba(46,204,113,0.7)',
                }}>FECHA EM</div>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '18px',
                  fontWeight: 900,
                  color: '#2ecc71',
                  lineHeight: 1,
                  letterSpacing: '1px',
                }}>{countdown}</div>
              </div>
            </div>
          )}
          {bloqueado && (
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '2px',
              color: 'rgba(255,255,255,0.2)',
            }}>ENCERRADO</div>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: '9px',
            fontWeight: 700,
            letterSpacing: '2px',
            color: 'rgba(201,168,76,0.6)',
          }}>GRUPO {jogo.grupo}</div>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: '10px',
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.5px',
          }}>{formatarData(jogo.data)} · {jogo.hora}</div>
        </div>
      </div>

      {/* Match body */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '16px 14px 14px',
        gap: '8px',
      }}>
        {/* Time 1 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
          {getFlag(jogo.time1) && (
            <img
              src={getFlag(jogo.time1)}
              alt={jogo.time1}
              style={{
                width: '40px',
                height: '28px',
                objectFit: 'cover',
                borderRadius: '4px',
                opacity: bloqueado ? 0.5 : 1,
                boxShadow: bloqueado ? 'none' : '0 2px 8px rgba(0,0,0,0.4)',
              }}
            />
          )}
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: '14px',
            fontWeight: 700,
            color: bloqueado ? 'rgba(255,255,255,0.3)' : '#fff',
            letterSpacing: '0.5px',
            lineHeight: 1,
          }}>{jogo.time1.toUpperCase()}</div>
        </div>

        {/* Placar central */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {bloqueado ? (
            <>
              <div style={styles.scoreLocked}>{palpite?.g1 ?? '—'}</div>
              <div style={styles.scoreSep}>×</div>
              <div style={styles.scoreLocked}>{palpite?.g2 ?? '—'}</div>
            </>
          ) : (
            <>
              <input
                style={styles.scoreInput}
                value={palpite?.g1 ?? ''}
                onChange={e => onChange('g1', e.target.value)}
                maxLength={2}
                inputMode="numeric"
              />
              <div style={styles.scoreSep}>×</div>
              <input
                style={styles.scoreInput}
                value={palpite?.g2 ?? ''}
                onChange={e => onChange('g2', e.target.value)}
                maxLength={2}
                inputMode="numeric"
              />
            </>
          )}
        </div>

        {/* Time 2 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          {getFlag(jogo.time2) && (
            <img
              src={getFlag(jogo.time2)}
              alt={jogo.time2}
              style={{
                width: '40px',
                height: '28px',
                objectFit: 'cover',
                borderRadius: '4px',
                opacity: bloqueado ? 0.5 : 1,
                boxShadow: bloqueado ? 'none' : '0 2px 8px rgba(0,0,0,0.4)',
              }}
            />
          )}
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: '14px',
            fontWeight: 700,
            color: bloqueado ? 'rgba(255,255,255,0.3)' : '#fff',
            letterSpacing: '0.5px',
            lineHeight: 1,
            textAlign: 'right',
          }}>{jogo.time2.toUpperCase()}</div>
        </div>
      </div>

      {/* Save button */}
      {!bloqueado && (
        <div style={{ padding: '0 14px 14px' }}>
          <button
            onClick={onSalvar}
            style={{
              width: '100%',
              borderRadius: '10px',
              padding: '11px',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '13px',
              fontWeight: 900,
              letterSpacing: '3px',
              cursor: 'pointer',
              transition: 'all 0.25s',
              border: 'none',
              background: foiSalvo
                ? 'rgba(46,204,113,0.08)'
                : salvando
                ? 'rgba(201,168,76,0.08)'
                : temPalpite
                ? 'linear-gradient(135deg, #C9A84C 0%, #a8752a 100%)'
                : 'rgba(201,168,76,0.08)',
              color: foiSalvo ? '#2ecc71' : salvando ? '#C9A84C' : temPalpite ? '#000' : 'rgba(201,168,76,0.4)',
              boxShadow: (!foiSalvo && !salvando && temPalpite) ? '0 4px 20px rgba(201,168,76,0.25)' : 'none',
            }}
          >
            {foiSalvo ? '✓  PALPITE SALVO' : salvando ? 'SALVANDO...' : 'SALVAR PALPITE'}
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  scoreInput: {
    background: 'rgba(201,168,76,0.07)',
    border: '1px solid rgba(201,168,76,0.3)',
    borderRadius: '10px',
    width: '40px',
    height: '40px',
    color: '#C9A84C',
    fontSize: '20px',
    fontWeight: 900,
    textAlign: 'center',
    outline: 'none',
    fontFamily: "'Barlow Condensed', sans-serif",
  },
  scoreLocked: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '10px',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(201,168,76,0.4)',
    fontSize: '18px',
    fontWeight: 900,
    fontFamily: "'Barlow Condensed', sans-serif",
  },
  scoreSep: {
    color: 'rgba(255,255,255,0.15)',
    fontSize: '14px',
    fontWeight: 700,
    fontFamily: "'Barlow Condensed', sans-serif",
  },
};

export default function Jogos({ usuario, palpites, onSalvar }) {
  const [editando, setEditando] = useState({});
  const [salvandoId, setSalvandoId] = useState(null);
  const [savedIds, setSavedIds] = useState({});

  function handleChange(jogoId, campo, valor) {
    const num = valor.replace(/\D/g, '').slice(0, 2);
    setEditando(prev => ({ ...prev, [jogoId]: { ...prev[jogoId], [campo]: num } }));
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
    setSavedIds(prev => ({ ...prev, [jogoId]: true }));
    setEditando(prev => { const n = { ...prev }; delete n[jogoId]; return n; });
    setTimeout(() => setSavedIds(prev => ({ ...prev, [jogoId]: false })), 2500);
  }

  const totalPalpites = Object.keys(palpites).length;

  return (
    <div style={{ background: '#000', minHeight: '100vh', paddingBottom: '80px' }}>

      {/* Header */}
      <div style={{
        background: 'rgba(0,0,0,0.97)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '16px 16px 14px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: '9px',
          fontWeight: 700,
          letterSpacing: '5px',
          color: '#C9A84C',
          opacity: 0.7,
          marginBottom: '1px',
        }}>FASE DE GRUPOS</div>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: '32px',
          fontWeight: 900,
          color: '#fff',
          lineHeight: 1,
          marginBottom: '8px',
          letterSpacing: '1px',
        }}>PALPITES</div>

        {/* Grupo chip */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '8px',
          padding: '6px 10px',
          cursor: 'pointer',
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="4" r="2.5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2"/>
            <path d="M1.5 12c0-3.04 2.46-5.5 5.5-5.5s5.5 2.46 5.5 5.5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <div>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '8px',
              fontWeight: 700,
              letterSpacing: '2px',
              color: 'rgba(255,255,255,0.35)',
            }}>GRUPO <span style={{ color: '#C9A84C' }}>{usuario.apelido.toUpperCase()}</span></div>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '9px',
              fontWeight: 700,
              letterSpacing: '3px',
              color: 'rgba(255,255,255,0.25)',
            }}>Código: {usuario.codigo}</div>
          </div>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginLeft: '2px' }}>
            <path d="M3.5 2l3 3-3 3" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Jogos por grupo */}
      {Object.keys(grupos).map(letra => {
        const jogosGrupo = jogos.filter(j => j.grupo === letra);
        return (
          <div key={letra}>
            {/* Separador de grupo */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '18px 14px 10px',
            }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '3px',
                color: 'rgba(201,168,76,0.55)',
              }}>GRUPO {letra}</div>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
            </div>

            {jogosGrupo.map(jogo => (
              <CardJogo
                key={jogo.id}
                jogo={jogo}
                palpite={getPalpite(jogo.id)}
                salvando={salvandoId === jogo.id}
                foiSalvo={savedIds[jogo.id]}
                onSalvar={() => salvar(jogo.id)}
                onChange={(campo, valor) => handleChange(jogo.id, campo, valor)}
              />
            ))}
          </div>
        );
      })}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=Barlow:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
      `}</style>
    </div>
  );
}
