import { useEffect } from 'react'
import BotaoVoltar from '../BotaoVoltar/BotaoVoltar'
import './PainelNotificacoes.css'

// Aba que abre do lado direito. "notificacoes" já vem com o campo "lida" (true/false).
function PainelNotificacoes({ aberto, aoFechar, notificacoes, aoLer, aoLerTodas }) {
  const naoLidas = notificacoes.filter((n) => !n.lida)
  const anteriores = notificacoes.filter((n) => n.lida)

  // Esc fecha o painel
  useEffect(() => {
    if (!aberto) return
    function aoApertar(evento) {
      if (evento.key === 'Escape') aoFechar()
    }
    window.addEventListener('keydown', aoApertar)
    return () => window.removeEventListener('keydown', aoApertar)
  }, [aberto, aoFechar])

  function renderizar(notificacao) {
    const classes = notificacao.lida ? 'notificacao' : 'notificacao notificacao-nao-lida'
    return (
      <li key={notificacao.id}>
        <button type="button" className={classes} onClick={() => aoLer(notificacao.id)}>
          <span className="notificacao-icone">{notificacao.icone}</span>
          <span className="notificacao-texto">
            <span className="notificacao-titulo">{notificacao.titulo}</span>
            <span className="notificacao-descricao">{notificacao.texto}</span>
            {notificacao.quando && <span className="notificacao-quando">{notificacao.quando}</span>}
          </span>
          {!notificacao.lida && <span className="notificacao-ponto" aria-label="Não lida" />}
        </button>
      </li>
    )
  }

  return (
    <>
      <div
        className={aberto ? 'painel-notif-fundo painel-notif-fundo-visivel' : 'painel-notif-fundo'}
        onClick={aoFechar}
      />

      <aside
        className={aberto ? 'painel-notif painel-notif-aberto' : 'painel-notif'}
        role="dialog"
        aria-label="Notificações"
        aria-hidden={!aberto}
      >
        <header className="painel-notif-topo">
          <BotaoVoltar aoClicar={aoFechar} />
          <h2 className="painel-notif-titulo">Notificações</h2>
          {naoLidas.length > 0 && (
            <button type="button" className="painel-notif-ler-todas" onClick={aoLerTodas}>
              Marcar todas como lidas
            </button>
          )}
        </header>

        <div className="painel-notif-corpo">
          {notificacoes.length === 0 && (
            <p className="painel-notif-vazio">Você não tem notificações.</p>
          )}

          {naoLidas.length > 0 && (
            <section>
              <h3 className="painel-notif-secao">
                Não lidas <span className="painel-notif-contador">{naoLidas.length}</span>
              </h3>
              <ul className="painel-notif-lista">{naoLidas.map(renderizar)}</ul>
            </section>
          )}

          {anteriores.length > 0 && (
            <section>
              <h3 className="painel-notif-secao">Anteriores</h3>
              <ul className="painel-notif-lista">{anteriores.map(renderizar)}</ul>
            </section>
          )}
        </div>
      </aside>
    </>
  )
}

export default PainelNotificacoes
