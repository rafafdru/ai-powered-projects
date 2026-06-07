// public/sw.js
// Service Worker do Copa Amigos 26
// Responsável por agendar e disparar notificações de palpites.

const TIMERS = [];

function limparTimers() {
  TIMERS.forEach((id) => clearTimeout(id));
  TIMERS.length = 0;
}

function formatarJogos(jogos) {
  if (jogos.length === 1) return jogos[0];
  if (jogos.length === 2) return `${jogos[0]} e ${jogos[1]}`;
  return `${jogos.slice(0, -1).join(', ')} e ${jogos[jogos.length - 1]}`;
}

function agendarNotificacoes(jogos) {
  limparTimers();

  const agora = Date.now();

  const grupos10 = {};
  const grupos0  = {};

  jogos.forEach((jogo) => {
    const dataHoraJogo   = new Date(`${jogo.data}T${jogo.hora}:00`).getTime();
    const momentoBloqueio = dataHoraJogo - 5  * 60 * 1000;
    const alvo10          = momentoBloqueio - 10 * 60 * 1000;
    const alvo0           = momentoBloqueio;

    const nome = `${jogo.time1} × ${jogo.time2}`;

    // Só agenda se o alvo ainda está no futuro com pelo menos 3 segundos de margem
    // Isso evita disparar notificações de jogos cujo horário já passou
    if (alvo10 > agora + 3000) {
      const chave = String(alvo10);
      if (!grupos10[chave]) grupos10[chave] = { alvo: alvo10, jogos: [] };
      grupos10[chave].jogos.push(nome);
    }

    if (alvo0 > agora + 3000) {
      const chave = String(alvo0);
      if (!grupos0[chave]) grupos0[chave] = { alvo: alvo0, jogos: [] };
      grupos0[chave].jogos.push(nome);
    }
  });

  // Agendar 10 min antes do bloqueio
  Object.values(grupos10).forEach(({ alvo, jogos: listaNomes }) => {
    const delta = alvo - Date.now();
    // Dupla checagem: se delta ficou negativo entre o forEach e agora, ignora
    if (delta <= 0) return;
    const id = setTimeout(() => {
      // Tripla checagem no momento do disparo
      if (Date.now() < alvo - 30000) return; // disparou cedo demais (SW reiniciado)
      const titulo = `${listaNomes.length} a bloquear!! 10 minutos pro seu palpite! 👀`;
      self.registration.showNotification(titulo, {
        body: formatarJogos(listaNomes),
        icon: '/icons/icon-192.png',
        badge: '/icons/badge-72.png',
        tag: `copa26-10-${alvo}`,
        renotify: false,
        vibrate: [200, 100, 200],
        data: { url: '/' },
      });
    }, delta);
    TIMERS.push(id);
  });

  // Agendar no momento do bloqueio (5 min antes do jogo)
  Object.values(grupos0).forEach(({ alvo, jogos: listaNomes }) => {
    const delta = alvo - Date.now();
    if (delta <= 0) return;
    const id = setTimeout(() => {
      if (Date.now() < alvo - 30000) return;
      const titulo = 'Vai ficar sem dar palpite, jogador? Corre, faltam 5 minutos! 💨🏆';
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
    `[SW] Agendado: ${Object.keys(grupos10).length} de 10min, ${Object.keys(grupos0).length} de bloqueio.`
  );
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const client = clients.find((c) => c.url.includes(self.location.origin));
      if (client) return client.focus();
      return self.clients.openWindow(url);
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.tipo === 'AGENDAR_NOTIFICACOES') {
    agendarNotificacoes(event.data.jogos);
  }
});

self.addEventListener('install',  () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});