import MenuLateral from '../MenuLateral/MenuLateral'
import './MenuAdmin.css'

// Navegação do administrador, igual à das outras áreas do app:
//   celular e tablet (menos de 1024px): abas fixas embaixo da tela;
//   desktop (1024px ou mais): as abas somem e o botão ☰ do topo abre o menu lateral.
// Cada tela guarda se o menu lateral está aberto e passa menuAberto / aoFecharMenu para cá.
const itens = [
  { id: 'inicio', rotulo: 'Início', icone: '🏠', pronto: true },
  { id: 'clinicas', rotulo: 'Clínicas', icone: '🏥', pronto: true },
  { id: 'equipe', rotulo: 'Equipe', icone: '👥', pronto: true },
  { id: 'especialidades', rotulo: 'Especialid.', icone: '📋', pronto: true },
]

// Botão ☰ do topo. Só aparece no desktop (ver MenuAdmin.css).
export function BotaoMenuAdmin({ aoClicar }) {
  return (
    <button type="button" className="menu-admin-botao" onClick={aoClicar} aria-label="Abrir menu">
      ☰
    </button>
  )
}

const itensLateral = [
  { id: 'inicio', rotulo: 'Início', icone: '🏠' },
  { id: 'clinicas', rotulo: 'Clínicas', icone: '🏥' },
  { id: 'equipe', rotulo: 'Equipe', icone: '👥' },
  { id: 'especialidades', rotulo: 'Especialidades', icone: '📋' },
]

function MenuAdmin({ itemAtivo, aoNavegar, menuAberto = false, aoFecharMenu }) {
  return (
    <>
      <MenuLateral
        itens={itensLateral}
        aberto={menuAberto}
        aoFechar={() => aoFecharMenu?.()}
        itemAtivo={itemAtivo}
        aoSelecionar={(id) => aoNavegar?.(id)}
      />
    <nav className="menu-admin" aria-label="Menu do administrador">
      {itens.map((item) => {
        const ativo = item.id === itemAtivo
        const classes = ['menu-admin-item', ativo && 'menu-admin-item-ativo', !item.pronto && 'menu-admin-item-breve']
          .filter(Boolean)
          .join(' ')

        if (!item.pronto) {
          return (
            <span key={item.id} className={classes} title="Em breve">
              <span aria-hidden="true">{item.icone}</span>
              {item.rotulo}
            </span>
          )
        }

        return (
          <button
            type="button"
            key={item.id}
            className={classes}
            aria-current={ativo ? 'page' : undefined}
            onClick={() => aoNavegar?.(item.id)}
          >
            <span aria-hidden="true">{item.icone}</span>
            {item.rotulo}
          </button>
        )
      })}
    </nav>
    </>
  )
}

export default MenuAdmin
