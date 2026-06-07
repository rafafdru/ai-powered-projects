import { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import Login from './components/Login';
import Jogos from './components/Jogos';
import Ranking from './components/Ranking';
import Admin from './components/Admin';
import MataMata from './components/MataMata';
import Classificacao from './components/Classificacao';
import Configuracoes from './components/Configuracoes';
import { grupos } from './dados';
import { jogos } from './dados';
import { iniciarNotificacoes } from './notificacoes';

// ─── Chaves do localStorage ───────────────────────────────────────────────────
const LS_CONTAS = 'copa26_contas';
const LS_CONTA_ATIVA = 'copa26_conta_ativa';

// ─── Pontuação ────────────────────────────────────────────────────────────────
function calcularPontos(palpites, resultados) {
  let pontos = 0;
  Object.keys(resultados).forEach((jogoId) => {
    const r = resultados[jogoId];
    const p = palpites[jogoId];
    if (!p) return;
    if (p.g1 === r.g1 && p.g2 === r.g2) { pontos += 3; return; }
    const vrenc = r.g1 > r.g2 ? 1 : r.g1 < r.g2 ? -1 : 0;
    const prenc = p.g1 > p.g2 ? 1 : p.g1 < p.g2 ? -1 : 0;
    if (vrenc === prenc) pontos += 1;
  });
  return pontos;
}

// ─── Ícones da nav ────────────────────────────────────────────────────────────
const IconPalpites = ({ ativo }) => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <rect x="3" y="3" width="7" height="7" rx="1.5" stroke={ativo ? '#C9A84C' : 'rgba(255,255,255,0.3)'} strokeWidth="1.5" />
    <rect x="12" y="3" width="7" height="7" rx="1.5" stroke={ativo ? '#C9A84C' : 'rgba(255,255,255,0.3)'} strokeWidth="1.5" />
    <rect x="3" y="12" width="7" height="7" rx="1.5" stroke={ativo ? '#C9A84C' : 'rgba(255,255,255,0.3)'} strokeWidth="1.5" />
    <rect x="12" y="12" width="7" height="7" rx="1.5" stroke={ativo ? '#C9A84C' : 'rgba(255,255,255,0.3)'} strokeWidth="1.5" />
  </svg>
);

const IconGrupos = ({ ativo }) => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <line x1="3" y1="6" x2="19" y2="6" stroke={ativo ? '#C9A84C' : 'rgba(255,255,255,0.3)'} strokeWidth="1.5" strokeLinecap="round" />
    <line x1="3" y1="11" x2="15" y2="11" stroke={ativo ? '#C9A84C' : 'rgba(255,255,255,0.3)'} strokeWidth="1.5" strokeLinecap="round" />
    <line x1="3" y1="16" x2="10" y2="16" stroke={ativo ? '#C9A84C' : 'rgba(255,255,255,0.3)'} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconMataMata = ({ ativo }) => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <polyline points="3,5 11,14 19,5" stroke={ativo ? '#C9A84C' : 'rgba(255,255,255,0.3)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="11" y1="14" x2="11" y2="19" stroke={ativo ? '#C9A84C' : 'rgba(255,255,255,0.3)'} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconRanking = ({ ativo }) => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path d="M11 3 L13.5 8.5 L19.5 9.2 L15 13.5 L16.2 19.5 L11 16.5 L5.8 19.5 L7 13.5 L2.5 9.2 L8.5 8.5 Z"
      stroke={ativo ? '#C9A84C' : 'rgba(255,255,255,0.3)'} strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

// Engrenagem — stroke 1.5px, sem fill, mesmo padrão dos demais
const IconConfig = ({ ativo }) => {
  const cor = ativo ? '#C9A84C' : 'rgba(255,255,255,0.3)';
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="3" stroke={cor} strokeWidth="1.5" />
      <path
        d="M11 2.5v2M11 17.5v2M2.5 11h2M17.5 11h2M4.93 4.93l1.41 1.41M15.66 15.66l1.41 1.41M4.93 17.07l1.41-1.41M15.66 6.34l1.41-1.41"
        stroke={cor} strokeWidth="1.5" strokeLinecap="round"
      />
    </svg>
  );
};

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  // contas: [{ apelido, codigo }]
  const [contas, setContas] = useState([]);
  const [contaAtiva, setContaAtiva] = useState(null); // índice no array contas
  const [modoAdmin, setModoAdmin] = useState(false);

  const [palpites, setPalpites] = useState({});
  const [palpitesMataMata, setPalpitesMataMata] = useState({});
  const [resultados, setResultados] = useState({});
  const [jogosMataMata, setJogosMataMata] = useState({});
  const [faseAtiva, setFaseAtiva] = useState([]);
  const [participantes, setParticipantes] = useState([]);
  const [tela, setTela] = useState('jogos');
  const [statusNotif, setStatusNotif] = useState(() => {
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission; // 'default' | 'granted' | 'denied'
  });

  // ── Restaurar sessão do localStorage ────────────────────────────────────────
  useEffect(() => {
    try {
      const contasSalvas = JSON.parse(localStorage.getItem(LS_CONTAS) || '[]');
      const ativaSalva = parseInt(localStorage.getItem(LS_CONTA_ATIVA) ?? '-1', 10);
      if (contasSalvas.length > 0 && ativaSalva >= 0 && ativaSalva < contasSalvas.length) {
        setContas(contasSalvas);
        setContaAtiva(ativaSalva);
      }
    } catch {
      // localStorage corrompido — começa do zero
    }
  }, []);

  // ── Persistir sempre que contas ou ativa mudarem ────────────────────────────
  useEffect(() => {
    if (contas.length === 0) return;
    localStorage.setItem(LS_CONTAS, JSON.stringify(contas));
    localStorage.setItem(LS_CONTA_ATIVA, String(contaAtiva));
  }, [contas, contaAtiva]);

  // ── Usuário atual derivado ───────────────────────────────────────────────────
  const usuario = contaAtiva !== null && contas[contaAtiva] ? contas[contaAtiva] : null;

  // ── Carregar dados do Firestore ao trocar conta ou tela ─────────────────────
  useEffect(() => {
    if (!usuario) return;

    const carregar = async () => {
      // palpites fase de grupos
      const ref = doc(db, 'palpites', `${usuario.codigo}_${usuario.apelido}`);
      const snap = await getDoc(ref);
      setPalpites(snap.exists() ? snap.data() : {});

      // palpites mata-mata
      const mmRef = doc(db, 'palpitesMataMata', `${usuario.codigo}_${usuario.apelido}`);
      const mmSnap = await getDoc(mmRef);
      setPalpitesMataMata(mmSnap.exists() ? mmSnap.data() : {});

      // resultados globais
      const resSnap = await getDoc(doc(db, 'resultados', 'global'));
      const resultadosAtuais = resSnap.exists() ? resSnap.data() : {};
      setResultados(resultadosAtuais);

      // jogos mata-mata
      const mmJogosSnap = await getDoc(doc(db, 'jogosMataMata', 'global'));
      setJogosMataMata(mmJogosSnap.exists() ? mmJogosSnap.data() : {});

      // fase ativa
      const faseSnap = await getDoc(doc(db, 'config', 'global'));
      setFaseAtiva(faseSnap.exists() ? (faseSnap.data().faseAtiva || []) : []);

      // ranking — fase de grupos + mata-mata
      const [colGrupos, colMM] = await Promise.all([
        getDocs(collection(db, 'palpites')),
        getDocs(collection(db, 'palpitesMataMata')),
      ]);

      const prefixo = usuario.codigo + '_';
      const pontosMap = {};

      colGrupos.forEach((d) => {
        const id = d.id;
        if (!id.startsWith(prefixo)) return;
        const apelido = id.slice(prefixo.length);
        if (!apelido) return;
        pontosMap[apelido] = (pontosMap[apelido] ?? 0) + calcularPontos(d.data(), resultadosAtuais);
      });

      colMM.forEach((d) => {
        const id = d.id;
        if (!id.startsWith(prefixo)) return;
        const apelido = id.slice(prefixo.length);
        if (!apelido) return;
        pontosMap[apelido] = (pontosMap[apelido] ?? 0) + calcularPontos(d.data(), resultadosAtuais);
      });

      const lista = Object.entries(pontosMap).map(([apelido, pontos]) => ({ apelido, pontos }));
      setParticipantes(lista);
    };

    carregar();
  }, [usuario, tela]);

  // ── Ref para garantir que notificações só são agendadas uma vez por sessão ──
  const notifAgendadasRef = { current: false };

  // ── Agendar notificações sempre que o usuário logado mudar ───────────────────
  // Combina jogos da fase de grupos (dados.js) com jogos do mata-mata
  // (datas hardcoded, as mesmas usadas no MataMata.jsx)
  useEffect(() => {
    if (!usuario) return;

    const JOGOS_MM_DATAS = [
      // Round of 32 — 16 jogos
      ...Array.from({ length: 16 }, (_, i) => ({ id: `r32_${i + 1}`, data: '2026-06-28', hora: '16:00', time1: `R32 Jogo ${i + 1}`, time2: '' })),
      // Oitavas — 8 jogos
      ...Array.from({ length: 8 },  (_, i) => ({ id: `r16_${i + 1}`, data: '2026-07-04', hora: '14:00', time1: `Oitavas Jogo ${i + 1}`, time2: '' })),
      // Quartas — 4 jogos
      ...Array.from({ length: 4 },  (_, i) => ({ id: `qf_${i + 1}`,  data: '2026-07-09', hora: '18:00', time1: `Quartas Jogo ${i + 1}`, time2: '' })),
      // Semifinais — 2 jogos
      ...Array.from({ length: 2 },  (_, i) => ({ id: `sf_${i + 1}`,  data: '2026-07-14', hora: '18:00', time1: `Semifinal ${i + 1}`,    time2: '' })),
      // 3º lugar
      { id: 'third_1', data: '2026-07-18', hora: '18:00', time1: '3º Lugar', time2: '' },
      // Final
      { id: 'final_1', data: '2026-07-19', hora: '16:00', time1: 'Final',    time2: '' },
    ];

    // Enriquece os jogos do mata-mata com os nomes reais se o admin já os cadastrou
    const jogosMMEnriquecidos = JOGOS_MM_DATAS.map((j) => {
      const dadosFirestore = jogosMataMata[j.id];
      return dadosFirestore
        ? { ...j, time1: dadosFirestore.time1 || j.time1, time2: dadosFirestore.time2 || j.time2 }
        : j;
    });

    const todosOsJogos = [...jogos, ...jogosMMEnriquecidos];

    if (!notifAgendadasRef.current) {
      notifAgendadasRef.current = true;
      iniciarNotificacoes(todosOsJogos).then((resultado) => {
        setStatusNotif(resultado === 'granted' ? 'granted' : resultado);
      });
    }
  }, [usuario]); // roda ao logar e ao trocar de conta — não depende de `jogosMataMata` para não criar loop

  // ── window.__adminMode (console) ─────────────────────────────────────────────
  useEffect(() => {
    window.__adminMode = () => setModoAdmin(true);
    return () => { delete window.__adminMode; };
  }, []);

  // ── Handlers de palpites ─────────────────────────────────────────────────────
  async function handleSalvar(jogoId, palpite) {
    const novosPalpites = { ...palpites, [jogoId]: palpite };
    setPalpites(novosPalpites);
    await setDoc(doc(db, 'palpites', `${usuario.codigo}_${usuario.apelido}`), novosPalpites);
  }

  async function handleSalvarMataMata(jogoId, palpite) {
    const novos = { ...palpitesMataMata, [jogoId]: palpite };
    setPalpitesMataMata(novos);
    await setDoc(doc(db, 'palpitesMataMata', `${usuario.codigo}_${usuario.apelido}`), novos);
  }

  // ── Handlers de conta ────────────────────────────────────────────────────────

  function handleEntrar(apelido, codigo) {
    // admin nunca persiste
    if (codigo === '__ADMIN__') {
      setModoAdmin(true);
      return;
    }
    const novasContas = [...contas, { apelido, codigo }];
    const novoIndice = novasContas.length - 1;
    setContas(novasContas);
    setContaAtiva(novoIndice);
    setTela('jogos');
  }

  function handleAdicionarConta(apelido, codigo) {
    // admin nunca persiste — aciona direto o modo admin
    if (codigo === '__ADMIN__') {
      setModoAdmin(true);
      return;
    }
    // checar duplicata (por segurança, o modal já checa)
    const jaExiste = contas.some((c) => c.apelido === apelido && c.codigo === codigo);
    if (jaExiste) return;
    const novasContas = [...contas, { apelido, codigo }];
    const novoIndice = novasContas.length - 1;
    setContas(novasContas);
    setContaAtiva(novoIndice);
    setTela('jogos');
  }

  function handleTrocarConta(indice) {
    setContaAtiva(indice);
    setPalpites({});
    setPalpitesMataMata({});
    setParticipantes([]);
    setTela('jogos');
  }

  function handleRemoverConta(indice) {
    const novasContas = contas.filter((_, i) => i !== indice);
    if (novasContas.length === 0) {
      // sem mais contas — vai para o login
      setContas([]);
      setContaAtiva(null);
      setModoAdmin(false);
      localStorage.removeItem(LS_CONTAS);
      localStorage.removeItem(LS_CONTA_ATIVA);
      setPalpites({});
      setPalpitesMataMata({});
      setParticipantes([]);
      return;
    }
    // ajustar índice ativo
    let novoAtivo = contaAtiva;
    if (indice === contaAtiva) {
      novoAtivo = 0;
    } else if (indice < contaAtiva) {
      novoAtivo = contaAtiva - 1;
    }
    setContas(novasContas);
    setContaAtiva(novoAtivo);
    setPalpites({});
    setPalpitesMataMata({});
    setParticipantes([]);
    setTela('jogos');
  }

  // ── Render: Admin ─────────────────────────────────────────────────────────────
  if (modoAdmin) {
    return (
      <>
        <Admin />
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=Barlow:wght@400;500;600&display=swap');
          * { box-sizing: border-box; }
          body { margin: 0; background: #000; }
        `}</style>
      </>
    );
  }

  // ── Render: Login ─────────────────────────────────────────────────────────────
  if (!usuario) {
    return (
      <Login onEntrar={handleEntrar} />
    );
  }

  // ── Render: App principal ──────────────────────────────────────────────────────
  const navItems = [
    { id: 'jogos',         label: 'PALPITES', Icon: IconPalpites },
    { id: 'classificacao', label: 'TABELA',   Icon: IconGrupos   },
    { id: 'matamata',      label: 'MATA-MATA',Icon: IconMataMata  },
    { id: 'ranking',       label: 'RANKING',  Icon: IconRanking  },
    { id: 'config',        label: 'CONFIG',   Icon: IconConfig   },
  ];

  return (
    <div style={{ background: '#000', minHeight: '100vh', overflowX: 'hidden', width: '100%' }}>
      {tela === 'jogos' && (
        <Jogos usuario={usuario} palpites={palpites} onSalvar={handleSalvar} resultados={resultados} />
      )}
      {tela === 'matamata' && (
        <MataMata
          jogosMataMata={jogosMataMata} palpites={palpitesMataMata}
          onSalvar={handleSalvarMataMata} faseAtiva={faseAtiva} resultados={resultados}
        />
      )}
      {tela === 'classificacao' && (
        <Classificacao grupos={grupos} jogos={jogos} resultados={resultados} />
      )}
      {tela === 'ranking' && (
        <Ranking participantes={participantes} usuarioAtual={usuario.apelido} />
      )}
      {tela === 'config' && (
        <Configuracoes
          contas={contas}
          contaAtiva={contaAtiva}
          onTrocarConta={handleTrocarConta}
          onAdicionarConta={handleAdicionarConta}
          onRemoverConta={handleRemoverConta}
          onLogout={handleRemoverConta}
          statusNotif={statusNotif}
          onAtivarNotificacoes={async () => {
            const resultado = await iniciarNotificacoes([...jogos]);
            setStatusNotif(resultado === 'granted' ? 'granted' : resultado);
          }}
        />
      )}

      {/* Nav bottom */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(0,0,0,0.97)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', padding: '10px 0 16px',
        zIndex: 100, backdropFilter: 'blur(24px)',
      }}>
        {navItems.map(({ id, label, Icon }) => {
          const ativo = tela === id;
          return (
            <button key={id} onClick={() => setTela(id)} style={{
              flex: 1, background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '4px', padding: 0, position: 'relative',
            }}>
              {ativo && (
                <div style={{
                  position: 'absolute', top: '-10px', left: '50%',
                  transform: 'translateX(-50%)',
                  width: '28px', height: '2px',
                  borderRadius: '0 0 2px 2px', background: '#C9A84C',
                }} />
              )}
              <Icon ativo={ativo} />
              <span style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '8px', fontWeight: 700, letterSpacing: '1.5px',
                color: ativo ? '#C9A84C' : 'rgba(255,255,255,0.22)',
                transition: 'color 0.2s',
              }}>{label}</span>
            </button>
          );
        })}
      </nav>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=Barlow:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #000; }
      `}</style>
    </div>
  );
}

export default App;