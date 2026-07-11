import { useState, useEffect } from 'react';

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

const FASES = [
  {
    id: 'r32',
    nome: 'ROUND OF 32',
    jogos: Array.from({ length: 16 }, (_, i) => ({
      id: `r32_${i + 1}`,
      data: '2026-06-28',
      hora: '16:00',
    })),
  },
  {
    id: 'r16',
    nome: 'OITAVAS DE FINAL',
    jogos: [
      { id: 'r16_1', data: '2026-07-04', hora: '14:00' },
      { id: 'r16_2', data: '2026-07-04', hora: '18:00' },
      { id: 'r16_3', data: '2026-07-05', hora: '17:00' },
      { id: 'r16_4', data: '2026-07-05', hora: '22:00' },
      { id: 'r16_5', data: '2026-07-06', hora: '16:00' },
      { id: 'r16_6', data: '2026-07-06', hora: '22:00' },
      { id: 'r16_7', data: '2026-07-07', hora: '13:00' },
      { id: 'r16_8', data: '2026-07-07', hora: '17:00' },
    ],
  },
  {
    id: 'qf',
    nome: 'QUARTAS DE FINAL',
    jogos: [
      { id: 'qf_1', data: '2026-07-09', hora: '17:10' },
      { id: 'qf_2', data: '2026-07-10', hora: '16:00' },
      { id: 'qf_3', data: '2026-07-11', hora: '21:00' },
      { id: 'qf_4', data: '2026-07-11', hora: '22:00' },
    ],
  },
  {
    id: 'sf',
    nome: 'SEMIFINAIS',
    jogos: [
      { id: 'sf_1', data: '2026-07-14', hora: '16:00' },
      { id: 'sf_2', data: '2026-07-15', hora: '16:00' },
    ],
  },
  {
    id: 'third',
    nome: '3º LUGAR',
    jogos: [{ id: 'third_1', data: '2026-07-18', hora: '18:00' }],
  },
  {
    id: 'final',
    nome: 'FINAL',
    jogos: [{ id: 'final_1', data: '2026-07-19', hora: '16:00' }],
  },
];

const MESES = [
  'JAN',
  'FEV',
  'MAR',
  'ABR',
  'MAI',
  'JUN',
  'JUL',
  'AGO',
  'SET',
  'OUT',
  'NOV',
  'DEZ',
];

function formatarData(data) {
  const [, mes, dia] = data.split('-');
  const semana = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
  const d = new Date(`${data}T12:00:00`);
  return `${semana[d.getDay()]} ${dia}/${MESES[parseInt(mes) - 1]}`;
}

function isBloqueado(data, hora) {
  const dataHora = new Date(`${data}T${hora}:00`);
  return new Date() >= new Date(dataHora.getTime() - 5 * 60 * 1000);
}

function useCountdown(data, hora) {
  const [countdown, setCountdown] = useState('');
  useEffect(() => {
    function calc() {
      const alvo = new Date(`${data}T${hora}:00`).getTime() - 5 * 60 * 1000;
      const diff = alvo - Date.now();
      if (diff <= 0) {
        setCountdown('');
        return;
      }
      const totalMin = Math.floor(diff / 60000);
      const h = Math.floor(totalMin / 60);
      const m = totalMin % 60;
      if (h >= 24) {
        const dias = Math.floor(h / 24);
        const hRest = h % 24;
        setCountdown(`${dias}D ${hRest}H ${String(m).padStart(2, '0')}M`);
      } else {
        setCountdown(
          `${String(h).padStart(2, '0')}H ${String(m).padStart(2, '0')}M`
        );
      }
    }
    calc();
    const t = setInterval(calc, 30000);
    return () => clearInterval(t);
  }, [data, hora]);
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
    exato: {
      label: 'PLACAR EXATO',
      pts: '+3 PTS',
      cor: '#2ecc71',
      bgCor: 'rgba(46,204,113,0.08)',
      borderCor: 'rgba(46,204,113,0.2)',
    },
    parcial: {
      label: 'RESULTADO CERTO',
      pts: '+1 PT',
      cor: '#C9A84C',
      bgCor: 'rgba(201,168,76,0.08)',
      borderCor: 'rgba(201,168,76,0.2)',
    },
    errado: {
      label: 'ERRADO',
      pts: null,
      cor: 'rgba(229,57,53,0.7)',
      bgCor: 'rgba(229,57,53,0.05)',
      borderCor: 'rgba(229,57,53,0.15)',
    },
  }[feedback];
  return (
    <div
      style={{
        margin: '0 14px 14px',
        borderRadius: '10px',
        padding: '9px 14px',
        background: config.bgCor,
        border: `1px solid ${config.borderCor}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '2px',
          color: config.cor,
        }}
      >
        {config.label}
      </div>
      {config.pts && (
        <div
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: '13px',
            fontWeight: 900,
            color: config.cor,
            letterSpacing: '1px',
          }}
        >
          {config.pts}
        </div>
      )}
    </div>
  );
}

function CardMM({
  jogo,
  dadosJogo,
  palpite,
  jaFoiSalvo,
  salvando,
  foiSalvoAgora,
  onSalvar,
  onChange,
  numero,
  resultado,
}) {
  const bloqueado = isBloqueado(jogo.data, jogo.hora);
  const countdown = useCountdown(jogo.data, jogo.hora);
  const temPalpite = palpite && palpite.g1 !== '' && palpite.g2 !== '';
  const salvo = jaFoiSalvo || foiSalvoAgora;
  const flag1 = getFlag(dadosJogo?.time1);
  const flag2 = getFlag(dadosJogo?.time2);
  const feedback = calcularFeedback(palpite, resultado);
  const temResultado = resultado && resultado.g1 !== '' && resultado.g2 !== '';

  return (
    <div
      style={{
        margin: '0 14px 10px',
        borderRadius: '16px',
        overflow: 'hidden',
        background: bloqueado
          ? 'rgba(255,255,255,0.02)'
          : 'rgba(255,255,255,0.03)',
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
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px 8px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          gap: '8px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0,
          }}
        >
          {!bloqueado && countdown ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: '#2ecc71',
                  boxShadow: '0 0 6px #2ecc71',
                  flexShrink: 0,
                }}
              />
              <div>
                <div
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: '8px',
                    fontWeight: 700,
                    letterSpacing: '2px',
                    color: 'rgba(46,204,113,0.7)',
                  }}
                >
                  FECHA EM
                </div>
                <div
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: '18px',
                    fontWeight: 900,
                    color: '#2ecc71',
                    lineHeight: 1,
                    letterSpacing: '1px',
                  }}
                >
                  {countdown}
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '2px',
                color: 'rgba(255,255,255,0.2)',
              }}
            >
              {bloqueado ? 'ENCERRADO' : `JOGO ${numero}`}
            </div>
          )}
        </div>

        {temResultado && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              flex: 1,
            }}
          >
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '8px',
                fontWeight: 700,
                letterSpacing: '2px',
                color: 'rgba(255,255,255,0.3)',
              }}
            >
              PLACAR REAL
            </div>
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '16px',
                fontWeight: 900,
                color: 'rgba(255,255,255,0.75)',
                letterSpacing: '3px',
                lineHeight: 1,
              }}
            >
              {resultado.g1} × {resultado.g2}
            </div>
          </div>
        )}

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '10px',
              color: 'rgba(255,255,255,0.3)',
              letterSpacing: '0.5px',
            }}
          >
            {formatarData(jogo.data)} · {jogo.hora}
          </div>
        </div>
      </div>

      {/* Times + placar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '16px 14px 14px',
          gap: '8px',
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '6px',
          }}
        >
          {flag1 ? (
            <img
              src={flag1}
              alt={dadosJogo.time1}
              style={{
                width: '40px',
                height: '28px',
                objectFit: 'cover',
                borderRadius: '4px',
                opacity: bloqueado ? 0.5 : 1,
                boxShadow: bloqueado ? 'none' : '0 2px 8px rgba(0,0,0,0.4)',
              }}
            />
          ) : (
            <div
              style={{
                width: '40px',
                height: '28px',
                borderRadius: '4px',
                background: 'rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '12px', opacity: 0.3 }}>?</span>
            </div>
          )}
          <div
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '14px',
              fontWeight: 700,
              color: bloqueado
                ? 'rgba(255,255,255,0.3)'
                : dadosJogo?.time1
                ? '#fff'
                : 'rgba(255,255,255,0.2)',
              letterSpacing: '0.5px',
              lineHeight: 1,
            }}
          >
            {dadosJogo?.time1 ? dadosJogo.time1.toUpperCase() : '???'}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexShrink: 0,
          }}
        >
          {bloqueado ? (
            <>
              <div style={scoreLockedStyle}>{palpite?.g1 ?? '—'}</div>
              <div style={scoreSepStyle}>×</div>
              <div style={scoreLockedStyle}>{palpite?.g2 ?? '—'}</div>
            </>
          ) : (
            <>
              <input
                style={scoreInputStyle}
                value={palpite?.g1 ?? ''}
                onChange={(e) => onChange('g1', e.target.value)}
                maxLength={2}
                inputMode="numeric"
              />
              <div style={scoreSepStyle}>×</div>
              <input
                style={scoreInputStyle}
                value={palpite?.g2 ?? ''}
                onChange={(e) => onChange('g2', e.target.value)}
                maxLength={2}
                inputMode="numeric"
              />
            </>
          )}
        </div>

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '6px',
          }}
        >
          {flag2 ? (
            <img
              src={flag2}
              alt={dadosJogo.time2}
              style={{
                width: '40px',
                height: '28px',
                objectFit: 'cover',
                borderRadius: '4px',
                opacity: bloqueado ? 0.5 : 1,
                boxShadow: bloqueado ? 'none' : '0 2px 8px rgba(0,0,0,0.4)',
              }}
            />
          ) : (
            <div
              style={{
                width: '40px',
                height: '28px',
                borderRadius: '4px',
                background: 'rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '12px', opacity: 0.3 }}>?</span>
            </div>
          )}
          <div
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '14px',
              fontWeight: 700,
              color: bloqueado
                ? 'rgba(255,255,255,0.3)'
                : dadosJogo?.time2
                ? '#fff'
                : 'rgba(255,255,255,0.2)',
              letterSpacing: '0.5px',
              lineHeight: 1,
              textAlign: 'right',
            }}
          >
            {dadosJogo?.time2 ? dadosJogo.time2.toUpperCase() : '???'}
          </div>
        </div>
      </div>

      {bloqueado && feedback && <FeedbackBar feedback={feedback} />}

      {!bloqueado && (
        <div style={{ padding: '0 14px 14px' }}>
          <button
            onClick={salvo ? undefined : onSalvar}
            style={{
              width: '100%',
              borderRadius: '10px',
              padding: '11px',
              border: 'none',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '13px',
              fontWeight: 900,
              letterSpacing: '3px',
              cursor: salvo ? 'default' : 'pointer',
              transition: 'all 0.25s',
              background: salvo
                ? 'rgba(46,204,113,0.08)'
                : salvando
                ? 'rgba(201,168,76,0.08)'
                : temPalpite
                ? 'linear-gradient(135deg, #C9A84C 0%, #a8752a 100%)'
                : 'rgba(201,168,76,0.08)',
              color: salvo
                ? '#2ecc71'
                : salvando
                ? '#C9A84C'
                : temPalpite
                ? '#000'
                : 'rgba(201,168,76,0.4)',
              boxShadow:
                !salvo && !salvando && temPalpite
                  ? '0 4px 20px rgba(201,168,76,0.25)'
                  : 'none',
            }}
          >
            {salvo
              ? '✓  PALPITE SALVO'
              : salvando
              ? 'SALVANDO...'
              : 'SALVAR PALPITE'}
          </button>
        </div>
      )}
    </div>
  );
}

const scoreInputStyle = {
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
};
const scoreLockedStyle = {
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
};
const scoreSepStyle = {
  color: 'rgba(255,255,255,0.15)',
  fontSize: '14px',
  fontWeight: 700,
  fontFamily: "'Barlow Condensed', sans-serif",
};

export default function MataMata({
  jogosMataMata,
  palpites,
  onSalvar,
  faseAtiva,
  resultados,
}) {
  const [editando, setEditando] = useState({});
  const [salvandoId, setSalvandoId] = useState(null);
  const [savedIds, setSavedIds] = useState({});

  function handleChange(jogoId, campo, valor) {
    const num = valor.replace(/\D/g, '').slice(0, 2);
    setEditando((prev) => ({
      ...prev,
      [jogoId]: { ...prev[jogoId], [campo]: num },
    }));
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
    setEditando((prev) => {
      const n = { ...prev };
      delete n[jogoId];
      return n;
    });
  }

  return (
    <div
      style={{
        background: '#000',
        minHeight: '100vh',
        fontFamily: "'Barlow', sans-serif",
        paddingBottom: '80px',
      }}
    >
      <div
        style={{
          background: 'rgba(0,0,0,0.97)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '16px 16px 14px',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backdropFilter: 'blur(20px)',
        }}
      >
        <div
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: '9px',
            fontWeight: 700,
            letterSpacing: '5px',
            color: '#C9A84C',
            opacity: 0.7,
            marginBottom: '1px',
          }}
        >
          FASES ELIMINATÓRIAS
        </div>
        <div
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: '32px',
            fontWeight: 900,
            color: '#fff',
            lineHeight: 1,
            letterSpacing: '1px',
          }}
        >
          MATA-MATA
        </div>
        <div
          style={{
            fontSize: '10px',
            color: 'rgba(255,255,255,0.25)',
            marginTop: '3px',
          }}
        >
          Horário de Brasília
        </div>
      </div>

      {FASES.map((fase) => {
        const liberada = faseAtiva.includes(fase.id);
        return (
          <div key={fase.id}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '18px 14px 10px',
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: '1px',
                  background: 'rgba(255,255,255,0.05)',
                }}
              />
              <div
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '3px',
                  color: liberada
                    ? 'rgba(201,168,76,0.7)'
                    : 'rgba(255,255,255,0.15)',
                }}
              >
                {fase.nome}
              </div>
              <div
                style={{
                  flex: 1,
                  height: '1px',
                  background: 'rgba(255,255,255,0.05)',
                }}
              />
            </div>

            {!liberada ? (
              <div
                style={{
                  margin: '0 14px 10px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.04)',
                  background: 'rgba(255,255,255,0.01)',
                  padding: '28px',
                  textAlign: 'center',
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ opacity: 0.2, marginBottom: '8px' }}
                >
                  <rect
                    x="3"
                    y="11"
                    width="18"
                    height="11"
                    rx="2"
                    stroke="#fff"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M7 11V7a5 5 0 0110 0v4"
                    stroke="#fff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <div
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '2px',
                    color: 'rgba(255,255,255,0.15)',
                  }}
                >
                  AGUARDANDO FASE ANTERIOR
                </div>
              </div>
            ) : (
              fase.jogos.map((jogo, i) => (
                <CardMM
                  key={jogo.id}
                  jogo={jogo}
                  dadosJogo={jogosMataMata[jogo.id]}
                  palpite={getPalpite(jogo.id)}
                  jaFoiSalvo={
                    !!palpites[jogo.id] && editando[jogo.id] === undefined
                  }
                  salvando={salvandoId === jogo.id}
                  foiSalvoAgora={savedIds[jogo.id]}
                  onSalvar={() => salvar(jogo.id)}
                  onChange={(campo, valor) =>
                    handleChange(jogo.id, campo, valor)
                  }
                  numero={i + 1}
                  resultado={resultados?.[jogo.id] || null}
                />
              ))
            )}
          </div>
        );
      })}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=Barlow:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
