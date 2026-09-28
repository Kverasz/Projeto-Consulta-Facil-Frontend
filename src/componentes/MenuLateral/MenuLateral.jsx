import './MenuLateral.css'

// Mesma lista de itens que a barra de baixo usava.
const itens = [
  { id: 'inicio', rotulo: 'Início', icone: '🏠' },
  { id: 'agendamentos', rotulo: 'Agendamentos', icone: '📅' },
  { id: 'historico', rotulo: 'Histórico', icone: '⏱️' },
  { id: 'perfil', rotulo: 'Perfil', icone: '👤' },
]

function MenuLateral({ aberto, aoFechar, itemAtivo }) {
  // Continua no DOM mesmo fechado, só muda a classe.
  // Isso é o que permite o efeito de deslizar suavemente.
  const classeFundo = aberto ? 'menu-lateral-fundo menu-lateral-fundo-visivel' : 'menu-lateral-fundo'
  const classePainel = aberto ? 'menu-lateral menu-lateral-aberto' : 'menu-lateral'

  return (
    <>
      <div className={classeFundo} onClick={aoFechar} />

      <nav className={classePainel}>
        <div className="menu-lateral-topo">
          <span className="menu-lateral-titulo">Menu</span>
          <button
            type="button"
            className="menu-lateral-fechar"
            onClick={aoFechar}
            aria-label="Fechar menu"
          >
            ✕
          </button>
        </div>

        <ul className="menu-lateral-lista">
          {itens.map((item) => {
            const ativo = item.id === itemAtivo
            const classeItem = ativo
              ? 'menu-lateral-item menu-lateral-item-ativo'
              : 'menu-lateral-item'

            return (
              <li key={item.id}>
                <button type="button" className={classeItem}>
                  <span className="menu-lateral-icone">{item.icone}</span>
                  {item.rotulo}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}

export default MenuLateral
