import { grupos, jogos } from '../dados';

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

function calcularClassificacao(grupo, todosJogos, resultados) {
  const times = {};
  grupo.forEach((time) => {
    times[time] = { time, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0, pts: 0 };
  });
  todosJogos.forEach((jogo) => {
    const r = resultados[jogo.id];
    if (!r) return;
    const g1 = parseInt(r.g1),
      g2 = parseInt(r.g2);
    if (isNaN(g1) || isNaN(g2)) return;
    if (!times[jogo.time1] || !times[jogo.time2]) return;
    times[jogo.time1].j++;
    times[jogo.time2].j++;
    times[jogo.time1].gp += g1;
    times[jogo.time1].gc += g2;
    times[jogo.time2].gp += g2;
    times[jogo.time2].gc += g1;
    times[jogo.time1].sg += g1 - g2;
    times[jogo.time2].sg += g2 - g1;
    if (g1 > g2) {
      times[jogo.time1].v++;
      times[jogo.time1].pts += 3;
      times[jogo.time2].d++;
    } else if (g2 > g1) {
      times[jogo.time2].v++;
      times[jogo.time2].pts += 3;
      times[jogo.time1].d++;
    } else {
      times[jogo.time1].e++;
      times[jogo.time1].pts += 1;
      times[jogo.time2].e++;
      times[jogo.time2].pts += 1;
    }
  });
  return Object.values(times).sort(
    (a, b) => b.pts - a.pts || b.sg - a.sg || b.gp - a.gp
  );
}

export default function Classificacao({ resultados }) {
  return (
    <div
      style={{
        background: '#000',
        minHeight: '100vh',
        fontFamily: "'Barlow', sans-serif",
        paddingBottom: '80px',
      }}
    >
      {/* Header */}
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
          FASE DE GRUPOS
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
          TABELA
        </div>
        <div
          style={{
            fontSize: '10px',
            color: 'rgba(255,255,255,0.25)',
            marginTop: '3px',
          }}
        >
          Classificação em tempo real
        </div>
      </div>

      {/* Grupos */}
      {Object.entries(grupos).map(([letra, times]) => {
        const jogosDoGrupo = jogos.filter((j) => j.grupo === letra);
        const classificacao = calcularClassificacao(
          times,
          jogosDoGrupo,
          resultados
        );
        return (
          <div
            key={letra}
            style={{
              margin: '14px 14px 0',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.07)',
              background: 'rgba(255,255,255,0.02)',
            }}
          >
            {/* Header do grupo */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '11px 14px',
                background: 'rgba(201,168,76,0.05)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <div
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '13px',
                  fontWeight: 900,
                  letterSpacing: '3px',
                  color: '#C9A84C',
                }}
              >
                GRUPO {letra}
              </div>
              <div style={{ display: 'flex', gap: '14px' }}>
                {['J', 'V', 'E', 'D', 'SG', 'PTS'].map((h) => (
                  <div
                    key={h}
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: '9px',
                      fontWeight: 700,
                      color:
                        h === 'PTS'
                          ? 'rgba(201,168,76,0.5)'
                          : 'rgba(255,255,255,0.2)',
                      letterSpacing: '1px',
                      width: h === 'PTS' ? '28px' : '16px',
                      textAlign: 'center',
                    }}
                  >
                    {h}
                  </div>
                ))}
              </div>
            </div>

            {/* Times */}
            {classificacao.map((t, i) => {
              const classificado = i < 2;
              const terceiro = i === 2;
              const flag = getFlag(t.time);
              return (
                <div
                  key={t.time}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '9px 14px',
                    borderBottom:
                      i < 3 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                    background:
                      i === 0 ? 'rgba(201,168,76,0.025)' : 'transparent',
                  }}
                >
                  {/* Barra indicadora */}
                  <div
                    style={{
                      width: '16px',
                      marginRight: '10px',
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: '3px',
                        height: '18px',
                        borderRadius: '2px',
                        background: classificado
                          ? '#C9A84C'
                          : terceiro
                          ? 'rgba(46,204,113,0.45)'
                          : 'rgba(255,255,255,0.08)',
                      }}
                    />
                  </div>

                  {/* Bandeira */}
                  {flag ? (
                    <img
                      src={flag}
                      alt={t.time}
                      style={{
                        width: '24px',
                        height: '17px',
                        objectFit: 'cover',
                        borderRadius: '2px',
                        marginRight: '9px',
                        flexShrink: 0,
                        opacity: classificado ? 1 : 0.5,
                      }}
                    />
                  ) : (
                    <div style={{ width: '24px', marginRight: '9px' }} />
                  )}

                  {/* Nome */}
                  <div
                    style={{
                      flex: 1,
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: '13px',
                      fontWeight: 700,
                      color: classificado ? '#fff' : 'rgba(255,255,255,0.35)',
                      letterSpacing: '0.3px',
                    }}
                  >
                    {t.time.toUpperCase()}
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'flex', gap: '14px' }}>
                    {[t.j, t.v, t.e, t.d, t.sg > 0 ? `+${t.sg}` : t.sg].map(
                      (val, idx) => (
                        <div
                          key={idx}
                          style={{
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontSize: '12px',
                            color: 'rgba(255,255,255,0.25)',
                            width: '16px',
                            textAlign: 'center',
                          }}
                        >
                          {val}
                        </div>
                      )
                    )}
                    <div
                      style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: '14px',
                        fontWeight: 900,
                        color: classificado
                          ? '#C9A84C'
                          : 'rgba(255,255,255,0.2)',
                        width: '28px',
                        textAlign: 'center',
                      }}
                    >
                      {t.pts}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Legenda */}
            <div
              style={{
                display: 'flex',
                gap: '16px',
                padding: '8px 14px',
                borderTop: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <div
                  style={{
                    width: '3px',
                    height: '10px',
                    borderRadius: '2px',
                    background: '#C9A84C',
                  }}
                />
                <span
                  style={{
                    fontSize: '9px',
                    color: 'rgba(255,255,255,0.2)',
                    letterSpacing: '0.5px',
                  }}
                >
                  Classificado
                </span>
              </div>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <div
                  style={{
                    width: '3px',
                    height: '10px',
                    borderRadius: '2px',
                    background: 'rgba(46,204,113,0.45)',
                  }}
                />
                <span
                  style={{
                    fontSize: '9px',
                    color: 'rgba(255,255,255,0.2)',
                    letterSpacing: '0.5px',
                  }}
                >
                  Possível 3º melhor
                </span>
              </div>
            </div>
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
