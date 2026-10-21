
import './Cabecalho.css'

function Cabecalho({
  nome,
  titulo,
  aoAbrirMenu,
  aoAbrirNotificacoes,
}) {
  return (
    <header className="cabecalho">
      <div className="cabecalho-topo">
        <div className="cabecalho-topo-esquerda">

          {aoAbrirMenu && (

          <button
            type="button"
            className="cabecalho-sino"
            aria-label="Abrir notificações"
            onClick={aoAbrirNotificacoes}
          >
            🔔
          </button>

          )}

          <p className="cabecalho-saudacao">
            Olá, {nome} 👋
          </p>
        </div>

        <button
          type="button"
          className="cabecalho-sino"
          aria-label="Abrir notificações"
          onClick={() => {
            aoAbrirNotificacoes?.()
          }}
        >
          🔔
        </button>
      </div>

      <h1 className="cabecalho-titulo">{titulo}</h1>
    </header>
  )
}

export default Cabecalho
