// src/notificacoes.js
// Módulo utilitário de notificações do Copa Amigos 26.
// Chamado pelo App.jsx após login bem-sucedido e a cada abertura do app.

/**
 * Inicializa o sistema de notificações.
 * - Verifica suporte do browser
 * - Pede permissão se ainda não foi concedida
 * - Registra (ou recupera) o Service Worker
 * - Envia a lista de jogos ao SW para agendamento
 *
 * @param {Array} jogos — array completo de jogos (fase de grupos + mata-mata com data/hora)
 * @returns {Promise<'granted'|'denied'|'unsupported'|'error'>}
 */
export async function iniciarNotificacoes(jogos) {
  // 1. Checar suporte
  if (!('serviceWorker' in navigator) || !('Notification' in window)) {
    console.warn('[Notificações] Browser não suporta SW ou Notification API.');
    return 'unsupported';
  }

  // 2. Pedir permissão (só mostra prompt se ainda for 'default')
  let permissao = Notification.permission;
  if (permissao === 'default') {
    permissao = await Notification.requestPermission();
  }
  if (permissao !== 'granted') {
    console.warn('[Notificações] Permissão negada:', permissao);
    return 'denied';
  }

  // 3. Registrar (ou recuperar) o Service Worker
  try {
    const registro = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    // Garantir que o SW está ativo antes de mandar mensagem
    const sw = registro.active || registro.waiting || registro.installing;
    if (!sw) {
      console.warn('[Notificações] SW não encontrado após registro.');
      return 'error';
    }

    // Se o SW ainda está instalando, espera ativar
    await navigator.serviceWorker.ready;

    // 4. Filtrar apenas jogos futuros (ainda não bloqueados)
    // Bloqueio = 5 min antes do jogo. Só envia jogos cujo bloqueio ainda não ocorreu.
    const agora = Date.now();
    const jogosFuturos = jogos.filter((jogo) => {
      if (!jogo.data || !jogo.hora) return false;
      const momentoBloqueio =
        new Date(`${jogo.data}T${jogo.hora}:00`).getTime() - 5 * 60 * 1000;
      return momentoBloqueio > agora;
    });

    if (jogosFuturos.length === 0) {
      console.log('[Notificações] Nenhum jogo futuro para agendar.');
      return 'granted';
    }

    // 5. Enviar ao SW
    const swAtivo = (await navigator.serviceWorker.ready).active;
    swAtivo.postMessage({
      tipo: 'AGENDAR_NOTIFICACOES',
      jogos: jogosFuturos.map((j) => ({
        id: j.id,
        data: j.data,
        hora: j.hora,
        time1: j.time1 || 'Time 1',
        time2: j.time2 || 'Time 2',
      })),
    });

    console.log(`[Notificações] ${jogosFuturos.length} jogos enviados ao SW.`);
    return 'granted';
  } catch (err) {
    console.error('[Notificações] Erro ao registrar SW:', err);
    return 'error';
  }
}

/**
 * Retorna o status atual da permissão de notificação.
 * Útil para exibir o estado na tela de Configurações.
 * @returns {'granted'|'denied'|'default'|'unsupported'}
 */
export function statusNotificacoes() {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}
