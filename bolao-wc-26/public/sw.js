// public/sw.js
// Service Worker do Copa Amigos 26
// Responsável por agendar e disparar notificações de palpites.

const TIMERS = []; // guarda os IDs dos setTimeout ativos

// Cancela todos os timers ativos antes de reagendar
function limparTimers() {
  TIMERS.forEach((id) => clearTimeout(id));
  TIMERS.length = 0;
}

// Formata lista de times de forma legível
// ex: ['Brasil vs Marrocos', 'Alemanha vs Equador'] → 'Brasil × Marrocos e Alemanha × Equador'
function formatarJogos(jogos) {
  if (jogos.length === 1) return jogos[0];
  if (jogos.length === 2) return `${jogos[0]} e ${jogos[1]}`;
  return `${jogos.slice(0, -1).join(', ')} e ${jogos[jogos.length - 1]}`;
}

function agendarNotificacoes(jogos) {
  limparTimers();

  const agora = Date.now();

  // Agrupar jogos pelo horário de bloqueio (data + hora exata)
  // para poder juntar múltiplos jogos simultâneos numa notificação só
  const grupos10 = {}; // notificação de 10 min antes do bloqueio (15 min antes do jogo)
  const grupos0 = {}; // notificação no momento do bloqueio   (5 min antes do jogo)

  jogos.forEach((jogo) => {
    const dataHoraJogo = new Date(`${jogo.data}T${jogo.hora}:00`).getTime();
    const momentoBloqueio = dataHoraJogo - 5 * 60 * 1000; // -5 min do jogo
    const alvo10 = momentoBloqueio - 10 * 60 * 1000; // -10 min do bloqueio
    const alvo0 = momentoBloqueio; // no bloqueio

    const nome = `${jogo.time1} × ${jogo.time2}`;

    // só agenda o que ainda está no futuro
    if (alvo10 > agora) {
      const chave = String(alvo10);
      if (!grupos10[chave]) grupos10[chave] = { alvo: alvo10, jogos: [] };
      grupos10[chave].jogos.push(nome);
    }

    if (alvo0 > agora) {
      const chave = String(alvo0);
      if (!grupos0[chave]) grupos0[chave] = { alvo: alvo0, jogos: [] };
      grupos0[chave].jogos.push(nome);
    }
  });

  // Agendar notificações de 10 min antes do bloqueio
  Object.values(grupos10).forEach(({ alvo, jogos: listaNomes }) => {
    const delta = alvo - Date.now();
    const id = setTimeout(() => {
      const titulo = `${listaNomes.length} a bloquear!! 10 minutos pro seu palpite! 👀`;
      self.registration.showNotification(titulo, {
        body: formatarJogos(listaNomes),
        icon: '/icons/icon-192.png',
        badge: '/icons/badge-72.png',
        tag: `copa26-10-${alvo}`, // tag agrupa: substitui notif anterior com mesmo tag
        renotify: false,
        vibrate: [200, 100, 200],
        data: { url: '/' },
      });
    }, delta);
    TIMERS.push(id);
  });

  // Agendar notificações de bloqueio iminente (5 min antes do jogo)
  Object.values(grupos0).forEach(({ alvo, jogos: listaNomes }) => {
    const delta = alvo - Date.now();
    const id = setTimeout(() => {
      const titulo =
        'Vai ficar sem dar palpite, jogador? Corre, faltam 5 minutos! 💨🏆';
      self.registration.showNotification(titulo, {
        body: formatarJogos(listaNomes),
        icon: '/icons/icon-192.png',
        badge: '/icons/badge-72.png',
        tag: `copa26-0-${alvo}`,
        renotify: true,
        vibrate: [300, 100, 300, 100, 300],
        data: { url: '/' },
      });
    }, delta);
    TIMERS.push(id);
  });

  console.log(
    `[SW] Notificações agendadas: ${Object.keys(grupos10).length} de 10min, ${
      Object.keys(grupos0).length
    } de bloqueio.`
  );
}

// Ao clicar na notificação, abre (ou foca) o app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        const client = clients.find((c) =>
          c.url.includes(self.location.origin)
        );
        if (client) return client.focus();
        return self.clients.openWindow(url);
      })
  );
});

// Recebe mensagem do app com a lista de jogos e reagenda
self.addEventListener('message', (event) => {
  if (event.data?.tipo === 'AGENDAR_NOTIFICACOES') {
    agendarNotificacoes(event.data.jogos);
  }
});

// Ativação imediata (sem esperar fechar aba)
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
