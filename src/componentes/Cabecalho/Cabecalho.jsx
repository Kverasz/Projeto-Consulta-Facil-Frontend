import './Cabecalho.css'

function Cabecalho({ nome, titulo, aoAbrirMenu }) {
  return (
    <header className="cabecalho">
      <div className="cabecalho-topo">
        <div className="cabecalho-topo-esquerda">
          <button
            type="button"
            className="cabecalho-menu"
            onClick={aoAbrirMenu}
            aria-label="Abrir menu"
          >
            ☰
          </button>
          <p className="cabecalho-saudacao">Olá, {nome} 👋</p>
        </div>

        <button type="button" className="cabecalho-sino" aria-label="Notificações">
          🔔
        </button>
      </div>
      <h1 className="cabecalho-titulo">{titulo}</h1>
    </header>
  )
}

export default Cabecalho
