export default function Ranking({ participantes, usuarioAtual }) {
  const ordenados = [...participantes].sort((a, b) => b.pontos - a.pontos);

  function getAvatar(apelido) {
    return apelido ? apelido[0].toUpperCase() : '?';
  }

  const voceIndex = ordenados.findIndex((p) => p.apelido === usuarioAtual);
  const voce = ordenados[voceIndex];

  // "Em risco": participantes logo acima do usuário atual
  const emRisco =
    voceIndex > 0 ? ordenados.slice(Math.max(0, voceIndex - 2), voceIndex) : [];

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
          COPA AMIGOS 26
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
          RANKING
        </div>
      </div>

      {/* Pódio */}
      {ordenados.length >= 3 && (
        <div
          style={{
            background:
              'linear-gradient(180deg, rgba(201,168,76,0.06) 0%, transparent 100%)',
            padding: '28px 16px 0',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: '12px',
          }}
        >
          {/* 2º lugar */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '5px',
              flex: 1,
            }}
          >
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '11px',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.35)',
                letterSpacing: '1px',
              }}
            >
              2º
            </div>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)',
                border: '2px solid rgba(255,255,255,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '22px',
                fontWeight: 900,
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              {getAvatar(ordenados[1]?.apelido)}
            </div>
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '12px',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.5)',
                letterSpacing: '0.5px',
                textAlign: 'center',
                maxWidth: '80px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {ordenados[1]?.apelido?.toUpperCase()}
            </div>
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '13px',
                fontWeight: 900,
                color: 'rgba(255,255,255,0.4)',
              }}
            >
              {ordenados[1]?.pontos}{' '}
              <span style={{ fontSize: '10px', opacity: 0.6 }}>PTS</span>
            </div>
            <div
              style={{
                width: '100%',
                height: '40px',
                background: 'rgba(255,255,255,0.04)',
                borderTop: '2px solid rgba(255,255,255,0.1)',
                borderRadius: '4px 4px 0 0',
              }}
            />
          </div>

          {/* 1º lugar */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '5px',
              flex: 1,
            }}
          >
            {/* Coroa */}
            <svg
              width="24"
              height="20"
              viewBox="0 0 24 20"
              fill="none"
              style={{ marginBottom: '-2px' }}
            >
              <path
                d="M2 16 L5 6 L9 12 L12 4 L15 12 L19 6 L22 16 Z"
                fill="#C9A84C"
                opacity="0.9"
              />
              <rect
                x="2"
                y="16"
                width="20"
                height="3"
                rx="1"
                fill="#C9A84C"
                opacity="0.7"
              />
            </svg>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #C9A84C, #a8752a)',
                border: '2px solid rgba(201,168,76,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '26px',
                fontWeight: 900,
                color: '#000',
                boxShadow: '0 0 24px rgba(201,168,76,0.35)',
              }}
            >
              {getAvatar(ordenados[0]?.apelido)}
            </div>
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '14px',
                fontWeight: 900,
                color: '#C9A84C',
                letterSpacing: '0.5px',
                textAlign: 'center',
                maxWidth: '90px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {ordenados[0]?.apelido?.toUpperCase()}
            </div>
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '16px',
                fontWeight: 900,
                color: '#C9A84C',
              }}
            >
              {ordenados[0]?.pontos}{' '}
              <span style={{ fontSize: '11px', opacity: 0.7 }}>PTS</span>
            </div>
            <div
              style={{
                width: '100%',
                height: '56px',
                background: 'rgba(201,168,76,0.08)',
                borderTop: '2px solid rgba(201,168,76,0.3)',
                borderRadius: '4px 4px 0 0',
              }}
            />
          </div>

          {/* 3º lugar */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '5px',
              flex: 1,
            }}
          >
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '11px',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.2)',
                letterSpacing: '1px',
              }}
            >
              3º
            </div>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.04)',
                border: '2px solid rgba(255,255,255,0.07)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '18px',
                fontWeight: 900,
                color: 'rgba(255,255,255,0.3)',
              }}
            >
              {getAvatar(ordenados[2]?.apelido)}
            </div>
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '11px',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.3)',
                letterSpacing: '0.5px',
                textAlign: 'center',
                maxWidth: '80px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {ordenados[2]?.apelido?.toUpperCase()}
            </div>
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '12px',
                fontWeight: 900,
                color: 'rgba(255,255,255,0.25)',
              }}
            >
              {ordenados[2]?.pontos}{' '}
              <span style={{ fontSize: '10px', opacity: 0.6 }}>PTS</span>
            </div>
            <div
              style={{
                width: '100%',
                height: '28px',
                background: 'rgba(255,255,255,0.03)',
                borderTop: '2px solid rgba(255,255,255,0.07)',
                borderRadius: '4px 4px 0 0',
              }}
            />
          </div>
        </div>
      )}

      {/* Lista */}
      <div style={{ padding: '12px 14px 0' }}>
        {/* Header da lista */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px 8px',
            gap: '10px',
          }}
        >
          <div style={{ width: '28px' }} />
          <div style={{ width: '32px' }} />
          <div
            style={{
              flex: 1,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '8px',
              fontWeight: 700,
              letterSpacing: '2px',
              color: 'rgba(255,255,255,0.2)',
            }}
          >
            JOGADOR
          </div>
          <div
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '8px',
              fontWeight: 700,
              letterSpacing: '2px',
              color: 'rgba(255,255,255,0.2)',
              width: '36px',
              textAlign: 'center',
            }}
          >
            PTS
          </div>
          <div
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '8px',
              fontWeight: 700,
              letterSpacing: '2px',
              color: 'rgba(255,255,255,0.2)',
              width: '28px',
              textAlign: 'center',
            }}
          >
            VAR
          </div>
        </div>

        {ordenados.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 16px',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '13px',
              letterSpacing: '2px',
              color: 'rgba(255,255,255,0.15)',
            }}
          >
            NENHUM PALPITE REGISTRADO
          </div>
        )}

        {ordenados.map((p, i) => {
          const isVoce = p.apelido === usuarioAtual;
          const isLider = i === 0;
          return (
            <div
              key={p.apelido}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                marginBottom: '4px',
                borderRadius: '12px',
                background: isVoce
                  ? 'rgba(201,168,76,0.07)'
                  : 'rgba(255,255,255,0.02)',
                border: isVoce
                  ? '1px solid rgba(201,168,76,0.2)'
                  : '1px solid rgba(255,255,255,0.04)',
              }}
            >
              {/* Posição */}
              <div
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '18px',
                  fontWeight: 900,
                  width: '28px',
                  textAlign: 'center',
                  color: isLider
                    ? '#C9A84C'
                    : i === 1
                    ? 'rgba(255,255,255,0.4)'
                    : i === 2
                    ? 'rgba(180,120,60,0.7)'
                    : 'rgba(255,255,255,0.15)',
                }}
              >
                {i + 1}
              </div>

              {/* Avatar */}
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: isLider
                    ? 'linear-gradient(135deg, #C9A84C, #a8752a)'
                    : isVoce
                    ? 'rgba(201,168,76,0.15)'
                    : 'rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '14px',
                  fontWeight: 900,
                  color: isLider
                    ? '#000'
                    : isVoce
                    ? '#C9A84C'
                    : 'rgba(255,255,255,0.35)',
                  flexShrink: 0,
                }}
              >
                {getAvatar(p.apelido)}
              </div>

              {/* Nome */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: '14px',
                    fontWeight: 700,
                    color: isVoce ? '#C9A84C' : '#fff',
                    letterSpacing: '0.5px',
                  }}
                >
                  {p.apelido.toUpperCase()}
                  {isVoce && (
                    <span
                      style={{
                        marginLeft: '6px',
                        fontSize: '9px',
                        fontWeight: 700,
                        color: 'rgba(201,168,76,0.5)',
                        letterSpacing: '1px',
                      }}
                    >
                      VOCÊ
                    </span>
                  )}
                </div>
              </div>

              {/* Pontos */}
              <div
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '14px',
                  fontWeight: 900,
                  width: '36px',
                  textAlign: 'center',
                  color: isLider
                    ? '#C9A84C'
                    : isVoce
                    ? '#C9A84C'
                    : 'rgba(255,255,255,0.35)',
                }}
              >
                {p.pontos}
              </div>

              {/* Variação — placeholder */}
              <div
                style={{
                  width: '28px',
                  textAlign: 'center',
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.15)',
                }}
              >
                —
              </div>
            </div>
          );
        })}

        {/* Seção Em Risco */}
        {emRisco.length > 0 && (
          <div
            style={{
              marginTop: '16px',
              borderRadius: '14px',
              background: 'rgba(229,57,53,0.05)',
              border: '1px solid rgba(229,57,53,0.15)',
              padding: '14px',
            }}
          >
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '3px',
                color: '#E53935',
                marginBottom: '4px',
              }}
            >
              EM RISCO
            </div>
            <div
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontSize: '11px',
                color: 'rgba(255,255,255,0.3)',
                marginBottom: '12px',
              }}
            >
              Quem pode te ultrapassar
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {emRisco.map((r) => (
                <div
                  key={r.apelido}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'rgba(229,57,53,0.1)',
                      border: '1px solid rgba(229,57,53,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: '16px',
                      fontWeight: 900,
                      color: 'rgba(255,255,255,0.5)',
                    }}
                  >
                    {getAvatar(r.apelido)}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: '9px',
                      fontWeight: 700,
                      color: 'rgba(255,255,255,0.35)',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {r.pontos} PTS
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=Barlow:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
