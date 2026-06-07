import { useState } from 'react';
import { db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { jogos } from '../dados';

const SENHA_ADMIN = 'Romanos12,2';
const DOC_GLOBAL = 'global';

const FASES_MM = [
  { id: 'r32', nome: 'ROUND OF 32', total: 16 },
  { id: 'r16', nome: 'OITAVAS DE FINAL', total: 8 },
  { id: 'qf', nome: 'QUARTAS DE FINAL', total: 4 },
  { id: 'sf', nome: 'SEMIFINAIS', total: 2 },
  { id: 'third', nome: '3º LUGAR', total: 1 },
  { id: 'final', nome: 'FINAL', total: 1 },
];

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
  return `${dia} ${MESES[parseInt(mes) - 1]}`;
}

const gruposUnicos = [...new Set(jogos.map((j) => j.grupo))];

const inputResultStyle = {
  background: 'rgba(229,57,53,0.08)',
  border: '1px solid rgba(229,57,53,0.3)',
  borderRadius: '10px',
  width: '40px',
  height: '40px',
  color: '#E53935',
  fontSize: '20px',
  fontWeight: 900,
  textAlign: 'center',
  outline: 'none',
  fontFamily: "'Barlow Condensed', sans-serif",
};

const inputTimeStyle = {
  flex: 1,
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  padding: '10px',
  color: '#fff',
  fontSize: '12px',
  fontFamily: "'Barlow Condensed', sans-serif",
  outline: 'none',
  letterSpacing: '1px',
};

export default function Admin() {
  const [autenticado, setAutenticado] = useState(false);
  const [senha, setSenha] = useState('');
  const [erroLogin, setErroLogin] = useState('');

  const [aba, setAba] = useState('resultados');
  const [resultados, setResultados] = useState({});
  const [editando, setEditando] = useState({});
  const [salvos, setSalvos] = useState({});
  const [jogosMataMata, setJogosMataMata] = useState({});
  const [faseAtiva, setFaseAtiva] = useState([]);
  const [times, setTimes] = useState({});
  const [salvandoTimes, setSalvandoTimes] = useState({});
  const [placarMM, setPlacarMM] = useState({});
  const [salvosResultMM, setSalvosResultMM] = useState({});
  const [rodadaSelecionada, setRodadaSelecionada] = useState(gruposUnicos[0]);

  async function handleLogin() {
    if (senha !== SENHA_ADMIN) {
      setErroLogin('Senha incorreta.');
      return;
    }
    setErroLogin('');
    try {
      const resSnap = await getDoc(doc(db, 'resultados', DOC_GLOBAL));
      if (resSnap.exists()) setResultados(resSnap.data());

      const mmSnap = await getDoc(doc(db, 'jogosMataMata', DOC_GLOBAL));
      if (mmSnap.exists()) setJogosMataMata(mmSnap.data());

      const faseSnap = await getDoc(doc(db, 'config', DOC_GLOBAL));
      if (faseSnap.exists()) setFaseAtiva(faseSnap.data().faseAtiva || []);

      setAutenticado(true);
    } catch {
      setErroLogin('Erro de conexão. Tente novamente.');
    }
  }

  function handleChange(jogoId, campo, valor) {
    const num = valor.replace(/\D/g, '').slice(0, 2);
    setEditando((prev) => ({
      ...prev,
      [jogoId]: { ...prev[jogoId], [campo]: num },
    }));
  }

  async function handleSalvarResultado(jogoId) {
    const p = editando[jogoId];
    if (
      !p ||
      p.g1 === undefined ||
      p.g2 === undefined ||
      p.g1 === '' ||
      p.g2 === ''
    )
      return alert('Preencha os dois placares!');
    const novos = { ...resultados, [jogoId]: p };
    setResultados(novos);
    await setDoc(doc(db, 'resultados', DOC_GLOBAL), novos);
    setSalvos((prev) => ({ ...prev, [jogoId]: true }));
    setEditando((prev) => {
      const n = { ...prev };
      delete n[jogoId];
      return n;
    });
  }

  async function handleSalvarTimes(jogoId) {
    const t = times[jogoId];
    if (!t?.time1 || !t?.time2) return alert('Preencha os dois times!');
    setSalvandoTimes((prev) => ({ ...prev, [jogoId]: true }));
    const novos = {
      ...jogosMataMata,
      [jogoId]: { time1: t.time1, time2: t.time2 },
    };
    setJogosMataMata(novos);
    await setDoc(doc(db, 'jogosMataMata', DOC_GLOBAL), novos);
    setTimeout(
      () => setSalvandoTimes((prev) => ({ ...prev, [jogoId]: false })),
      2000
    );
  }

  function handleChangePlacarMM(jogoId, campo, valor) {
    const num = valor.replace(/\D/g, '').slice(0, 2);
    setPlacarMM((prev) => ({
      ...prev,
      [jogoId]: { ...prev[jogoId], [campo]: num },
    }));
  }

  async function handleSalvarResultadoMM(jogoId) {
    const p = placarMM[jogoId];
    if (
      !p ||
      p.g1 === undefined ||
      p.g2 === undefined ||
      p.g1 === '' ||
      p.g2 === ''
    )
      return alert('Preencha os dois placares!');
    const novos = { ...resultados, [jogoId]: p };
    setResultados(novos);
    await setDoc(doc(db, 'resultados', DOC_GLOBAL), novos);
    setSalvosResultMM((prev) => ({ ...prev, [jogoId]: true }));
    setPlacarMM((prev) => {
      const n = { ...prev };
      delete n[jogoId];
      return n;
    });
  }

  async function toggleFase(faseId) {
    const nova = faseAtiva.includes(faseId)
      ? faseAtiva.filter((f) => f !== faseId)
      : [...faseAtiva, faseId];
    setFaseAtiva(nova);
    await setDoc(doc(db, 'config', DOC_GLOBAL), { faseAtiva: nova });
  }

  if (!autenticado) {
    return (
      <div
        style={{
          background: '#000',
          minHeight: '100vh',
          fontFamily: "'Barlow', sans-serif",
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(229,57,53,0.1)',
              border: '1px solid rgba(229,57,53,0.3)',
              borderRadius: '6px',
              padding: '5px 14px',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#E53935',
                boxShadow: '0 0 6px #E53935',
              }}
            />
            <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '3px',
                color: '#E53935',
              }}
            >
              ADMIN
            </span>
          </div>
          <div
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '40px',
              fontWeight: 900,
              color: '#fff',
              lineHeight: 1,
              letterSpacing: '1px',
            }}
          >
            PAINEL
            <br />
            RESTRITO
          </div>
        </div>
        <div
          style={{
            width: '100%',
            maxWidth: '300px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <input
            type="password"
            placeholder="Senha admin"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '14px 16px',
              color: '#fff',
              fontSize: '14px',
              fontFamily: "'Barlow', sans-serif",
              outline: 'none',
            }}
            onFocus={(e) =>
              (e.target.style.borderColor = 'rgba(229,57,53,0.5)')
            }
            onBlur={(e) =>
              (e.target.style.borderColor = 'rgba(255,255,255,0.1)')
            }
          />
          {erroLogin ? (
            <div
              style={{
                background: 'rgba(229,57,53,0.1)',
                border: '1px solid rgba(229,57,53,0.3)',
                borderRadius: '10px',
                padding: '10px 14px',
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '1px',
                color: '#E53935',
                textAlign: 'center',
              }}
            >
              {erroLogin}
            </div>
          ) : null}
          <button
            onClick={handleLogin}
            style={{
              background: 'linear-gradient(135deg, #E53935, #c62828)',
              border: 'none',
              borderRadius: '12px',
              padding: '15px',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '16px',
              fontWeight: 900,
              letterSpacing: '3px',
              color: '#fff',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(229,57,53,0.3)',
            }}
          >
            ACESSAR
          </button>
        </div>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=Barlow:wght@400;500;600&display=swap'); * { box-sizing: border-box; }`}</style>
      </div>
    );
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
          borderBottom: '1px solid rgba(229,57,53,0.25)',
          padding: '16px 16px 0',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backdropFilter: 'blur(20px)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '2px',
          }}
        >
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#E53935',
              boxShadow: '0 0 6px #E53935',
            }}
          />
          <div
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '9px',
              fontWeight: 700,
              letterSpacing: '4px',
              color: '#E53935',
              opacity: 0.9,
            }}
          >
            ADMIN · ACESSO RESTRITO
          </div>
        </div>
        <div
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: '32px',
            fontWeight: 900,
            color: '#fff',
            lineHeight: 1,
            marginBottom: '14px',
            letterSpacing: '1px',
          }}
        >
          <span style={{ color: '#E53935' }}>ADMIN</span>{' '}
          <span style={{ fontSize: '22px', color: 'rgba(255,255,255,0.6)' }}>
            RESULTADOS
          </span>
        </div>
        <div style={{ display: 'flex' }}>
          {[
            { id: 'resultados', label: 'RESULTADOS' },
            { id: 'matamata', label: 'MATA-MATA' },
            { id: 'fases', label: 'FASES' },
          ].map((a) => (
            <button
              key={a.id}
              onClick={() => setAba(a.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px 14px',
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '2px',
                color: aba === a.id ? '#E53935' : 'rgba(255,255,255,0.25)',
                borderBottom:
                  aba === a.id ? '2px solid #E53935' : '2px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '14px' }}>
        {/* ABA RESULTADOS */}
        {aba === 'resultados' && (
          <>
            <div style={{ marginBottom: '14px' }}>
              <select
                value={rodadaSelecionada}
                onChange={(e) => setRodadaSelecionada(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  color: '#fff',
                  fontSize: '13px',
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  letterSpacing: '2px',
                  outline: 'none',
                  cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='rgba(255,255,255,0.3)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 14px center',
                }}
              >
                {gruposUnicos.map((g) => (
                  <option key={g} value={g} style={{ background: '#111' }}>
                    GRUPO {g}
                  </option>
                ))}
              </select>
            </div>
            {jogos
              .filter((j) => j.grupo === rodadaSelecionada)
              .map((jogo) => {
                const salvo = resultados[jogo.id];
                const editandoAgora = editando[jogo.id];
                const foiSalvo = salvos[jogo.id];
                const flag1 = getFlag(jogo.time1);
                const flag2 = getFlag(jogo.time2);
                return (
                  <div
                    key={jogo.id}
                    style={{
                      marginBottom: '10px',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: `1px solid ${
                        foiSalvo
                          ? 'rgba(46,204,113,0.3)'
                          : 'rgba(255,255,255,0.06)'
                      }`,
                      background: 'rgba(255,255,255,0.02)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 14px 0',
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontSize: '9px',
                          color: 'rgba(255,255,255,0.25)',
                          letterSpacing: '1px',
                        }}
                      >
                        {formatarData(jogo.data)} · {jogo.hora}
                        <span
                          style={{
                            marginLeft: '6px',
                            color: 'rgba(229,57,53,0.5)',
                          }}
                        >
                          GRUPO {jogo.grupo}
                        </span>
                      </div>
                      {foiSalvo && (
                        <div style={{ fontSize: '9px', color: '#2ecc71' }}>
                          ✓ salvo
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px 14px 10px',
                        gap: '8px',
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                        }}
                      >
                        {flag1 && (
                          <img
                            src={flag1}
                            alt={jogo.time1}
                            style={{
                              width: '36px',
                              height: '25px',
                              objectFit: 'cover',
                              borderRadius: '3px',
                            }}
                          />
                        )}
                        <div
                          style={{
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontSize: '13px',
                            fontWeight: 700,
                            color: '#fff',
                          }}
                        >
                          {jogo.time1.toUpperCase()}
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
                        <input
                          value={editandoAgora?.g1 ?? salvo?.g1 ?? ''}
                          onChange={(e) =>
                            handleChange(jogo.id, 'g1', e.target.value)
                          }
                          maxLength={2}
                          inputMode="numeric"
                          style={inputResultStyle}
                        />
                        <div
                          style={{
                            color: 'rgba(255,255,255,0.15)',
                            fontSize: '14px',
                            fontWeight: 700,
                          }}
                        >
                          ×
                        </div>
                        <input
                          value={editandoAgora?.g2 ?? salvo?.g2 ?? ''}
                          onChange={(e) =>
                            handleChange(jogo.id, 'g2', e.target.value)
                          }
                          maxLength={2}
                          inputMode="numeric"
                          style={inputResultStyle}
                        />
                      </div>
                      <div
                        style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          alignItems: 'flex-end',
                        }}
                      >
                        {flag2 && (
                          <img
                            src={flag2}
                            alt={jogo.time2}
                            style={{
                              width: '36px',
                              height: '25px',
                              objectFit: 'cover',
                              borderRadius: '3px',
                            }}
                          />
                        )}
                        <div
                          style={{
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontSize: '13px',
                            fontWeight: 700,
                            color: '#fff',
                            textAlign: 'right',
                          }}
                        >
                          {jogo.time2.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: '0 12px 12px' }}>
                      <button
                        onClick={() => handleSalvarResultado(jogo.id)}
                        style={{
                          width: '100%',
                          borderRadius: '10px',
                          padding: '10px',
                          cursor: 'pointer',
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontSize: '13px',
                          fontWeight: 900,
                          letterSpacing: '3px',
                          background:
                            foiSalvo && !editandoAgora
                              ? 'rgba(46,204,113,0.08)'
                              : 'linear-gradient(135deg, #E53935, #c62828)',
                          color:
                            foiSalvo && !editandoAgora ? '#2ecc71' : '#fff',
                          border:
                            foiSalvo && !editandoAgora
                              ? '1px solid rgba(46,204,113,0.2)'
                              : 'none',
                          boxShadow:
                            !foiSalvo || editandoAgora
                              ? '0 4px 16px rgba(229,57,53,0.25)'
                              : 'none',
                        }}
                      >
                        {foiSalvo && !editandoAgora
                          ? '✓ RESULTADO SALVO'
                          : 'SALVAR RESULTADO'}
                      </button>
                    </div>
                  </div>
                );
              })}
          </>
        )}

        {/* ABA MATA-MATA */}
        {aba === 'matamata' &&
          FASES_MM.map((fase) => (
            <div key={fase.id}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 2px 8px',
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
                    color: 'rgba(229,57,53,0.6)',
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
              {Array.from({ length: fase.total }, (_, i) => {
                const jogoId = `${fase.id}_${i + 1}`;
                const atual = jogosMataMata[jogoId] || {};
                const foiSalvoTimes = salvandoTimes[jogoId];
                const resultadoAtual = resultados[jogoId];
                const placarEditando = placarMM[jogoId];
                const foiSalvoResult = salvosResultMM[jogoId];
                return (
                  <div
                    key={jogoId}
                    style={{
                      marginBottom: '8px',
                      borderRadius: '14px',
                      border: `1px solid ${
                        foiSalvoResult
                          ? 'rgba(46,204,113,0.25)'
                          : 'rgba(255,255,255,0.06)'
                      }`,
                      background: 'rgba(255,255,255,0.02)',
                      padding: '12px',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: '9px',
                        color: 'rgba(255,255,255,0.2)',
                        letterSpacing: '1px',
                        marginBottom: '10px',
                      }}
                    >
                      JOGO {i + 1}
                    </div>

                    {/* Times */}
                    <div
                      style={{
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'center',
                        marginBottom: '8px',
                      }}
                    >
                      <input
                        placeholder="Time 1"
                        defaultValue={atual.time1 || ''}
                        onChange={(e) =>
                          setTimes((prev) => ({
                            ...prev,
                            [jogoId]: {
                              ...prev[jogoId],
                              time1: e.target.value,
                            },
                          }))
                        }
                        style={inputTimeStyle}
                      />
                      <div
                        style={{
                          color: 'rgba(255,255,255,0.2)',
                          fontSize: '14px',
                          fontWeight: 700,
                        }}
                      >
                        ×
                      </div>
                      <input
                        placeholder="Time 2"
                        defaultValue={atual.time2 || ''}
                        onChange={(e) =>
                          setTimes((prev) => ({
                            ...prev,
                            [jogoId]: {
                              ...prev[jogoId],
                              time2: e.target.value,
                            },
                          }))
                        }
                        style={inputTimeStyle}
                      />
                    </div>
                    <button
                      onClick={() => handleSalvarTimes(jogoId)}
                      style={{
                        width: '100%',
                        borderRadius: '9px',
                        padding: '9px',
                        cursor: 'pointer',
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: '13px',
                        fontWeight: 700,
                        letterSpacing: '2px',
                        background: foiSalvoTimes
                          ? 'rgba(46,204,113,0.08)'
                          : 'linear-gradient(135deg,#E53935,#c62828)',
                        color: foiSalvoTimes ? '#2ecc71' : '#fff',
                        border: foiSalvoTimes
                          ? '1px solid rgba(46,204,113,0.2)'
                          : 'none',
                        marginBottom: '10px',
                      }}
                    >
                      {foiSalvoTimes ? '✓ TIMES SALVOS' : 'SALVAR TIMES'}
                    </button>

                    {/* Divisor */}
                    <div
                      style={{
                        height: '1px',
                        background: 'rgba(255,255,255,0.05)',
                        margin: '2px 0 10px',
                      }}
                    />

                    {/* Resultado */}
                    <div
                      style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: '9px',
                        fontWeight: 700,
                        letterSpacing: '2px',
                        color: 'rgba(229,57,53,0.5)',
                        marginBottom: '8px',
                      }}
                    >
                      RESULTADO
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px',
                      }}
                    >
                      <input
                        value={placarEditando?.g1 ?? resultadoAtual?.g1 ?? ''}
                        onChange={(e) =>
                          handleChangePlacarMM(jogoId, 'g1', e.target.value)
                        }
                        maxLength={2}
                        inputMode="numeric"
                        placeholder="0"
                        style={inputResultStyle}
                      />
                      <div
                        style={{
                          color: 'rgba(255,255,255,0.15)',
                          fontSize: '14px',
                          fontWeight: 700,
                          flex: 1,
                          textAlign: 'center',
                        }}
                      >
                        ×
                      </div>
                      <input
                        value={placarEditando?.g2 ?? resultadoAtual?.g2 ?? ''}
                        onChange={(e) =>
                          handleChangePlacarMM(jogoId, 'g2', e.target.value)
                        }
                        maxLength={2}
                        inputMode="numeric"
                        placeholder="0"
                        style={inputResultStyle}
                      />
                    </div>
                    <button
                      onClick={() => handleSalvarResultadoMM(jogoId)}
                      style={{
                        width: '100%',
                        borderRadius: '9px',
                        padding: '9px',
                        cursor: 'pointer',
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: '13px',
                        fontWeight: 700,
                        letterSpacing: '2px',
                        background:
                          foiSalvoResult && !placarEditando
                            ? 'rgba(46,204,113,0.08)'
                            : 'linear-gradient(135deg,#E53935,#c62828)',
                        color:
                          foiSalvoResult && !placarEditando
                            ? '#2ecc71'
                            : '#fff',
                        border:
                          foiSalvoResult && !placarEditando
                            ? '1px solid rgba(46,204,113,0.2)'
                            : 'none',
                      }}
                    >
                      {foiSalvoResult && !placarEditando
                        ? '✓ RESULTADO SALVO'
                        : 'SALVAR RESULTADO'}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}

        {/* ABA FASES */}
        {aba === 'fases' && (
          <div>
            <div
              style={{
                fontSize: '11px',
                color: 'rgba(255,255,255,0.25)',
                marginBottom: '16px',
                lineHeight: 1.7,
              }}
            >
              Libere cada fase após a anterior estar completa. Os participantes
              só verão os jogos das fases liberadas.
            </div>
            {FASES_MM.map((fase) => (
              <div
                key={fase.id}
                onClick={() => toggleFase(fase.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  marginBottom: '8px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  background: faseAtiva.includes(fase.id)
                    ? 'rgba(46,204,113,0.06)'
                    : 'rgba(255,255,255,0.02)',
                  border: faseAtiva.includes(fase.id)
                    ? '1px solid rgba(46,204,113,0.25)'
                    : '1px solid rgba(255,255,255,0.05)',
                  transition: 'all 0.3s',
                }}
              >
                <div
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: '14px',
                    fontWeight: 700,
                    letterSpacing: '2px',
                    color: faseAtiva.includes(fase.id)
                      ? '#fff'
                      : 'rgba(255,255,255,0.3)',
                  }}
                >
                  {fase.nome}
                </div>
                <div
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '2px',
                    color: faseAtiva.includes(fase.id)
                      ? '#2ecc71'
                      : 'rgba(255,255,255,0.2)',
                  }}
                >
                  {faseAtiva.includes(fase.id) ? '✓ LIBERADA' : 'BLOQUEADA'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=Barlow:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        select option { background: #111; color: #fff; }
      `}</style>
    </div>
  );
}
