import './BarraNavegacao.css'

// Lista dos itens do menu.
const itens = [
  { id: 'inicio', rotulo: 'Início', icone: '🏠' },
  { id: 'agendamentos', rotulo: 'Agendamentos', icone: '📅' },
  { id: 'historico', rotulo: 'Histórico', icone: '⏱️' },
  { id: 'perfil', rotulo: 'Perfil', icone: '👤' },
]

function BarraNavegacao({
  itemAtivo,
  aoIrParaInicio,
  aoIrParaAgendamentos,
}) {
  function aoClicarItem(id) {
    if (id === 'inicio' && aoIrParaInicio) {
      aoIrParaInicio()
    }

    if (id === 'agendamentos' && aoIrParaAgendamentos) {
      aoIrParaAgendamentos()
    }
  }

  return (
    <nav className="barra-navegacao">
      {itens.map((item) => {
        const ativo = item.id === itemAtivo
        const classes = ativo
          ? 'barra-navegacao-item barra-navegacao-item-ativo'
          : 'barra-navegacao-item'

        return (
          <button
            type="button"
            key={item.id}
            className={classes}
            onClick={() => aoClicarItem(item.id)}
          >
            <span className="barra-navegacao-icone">{item.icone}</span>
            <span className="barra-navegacao-rotulo">{item.rotulo}</span>
          </button>
        )
      })}
    </nav>
  )
}

export default BarraNavegacao