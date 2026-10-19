import './MenuLateral.css'

// Itens padrão do menu (paciente). Outras telas podem passar a própria lista pela prop "itens".
const itensPadrao = [
  { id: 'inicio', rotulo: 'Início', icone: '🏠' },
  { id: 'agendamentos', rotulo: 'Agendamentos', icone: '📅' },
  { id: 'historico', rotulo: 'Histórico', icone: '⏱️' },
  { id: 'perfil', rotulo: 'Perfil', icone: '👤' },
]

function MenuLateral({
  itens = itensPadrao,
  aberto,
  aoFechar,
  itemAtivo,
  aoIrParaInicio,
  aoIrParaAgendamentos,
  aoSelecionar,
}) {
  const classeFundo = aberto
    ? 'menu-lateral-fundo menu-lateral-fundo-visivel'
    : 'menu-lateral-fundo'

  const classePainel = aberto
    ? 'menu-lateral menu-lateral-aberto'
    : 'menu-lateral'

  function aoClicarItem(id) {
    aoFechar()

    if (aoSelecionar) {
      aoSelecionar(id)
    }

    if (id === 'inicio' && aoIrParaInicio) {
      aoIrParaInicio()
    }

    if (id === 'agendamentos' && aoIrParaAgendamentos) {
      aoIrParaAgendamentos()
    }
  }

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
                <button
                  type="button"
                  className={classeItem}
                  onClick={() => aoClicarItem(item.id)}
                >
                  <span className="menu-lateral-icone">
                    {item.icone}
                  </span>

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
