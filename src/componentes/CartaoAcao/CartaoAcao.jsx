import './CartaoAcao.css'

function CartaoAcao({ icone, titulo, descricao, destaque, aoClicar }) {
  // "destaque" deixa o cartão com fundo azul (usado na ação principal)
  const classes = destaque ? 'cartao-acao cartao-acao-destaque' : 'cartao-acao'

  return (
    <button type="button" className={classes} onClick={aoClicar}>
      <span className="cartao-acao-icone">{icone}</span>

      <span className="cartao-acao-texto">
        <span className="cartao-acao-titulo">{titulo}</span>
        <span className="cartao-acao-descricao">{descricao}</span>
      </span>

      <span className="cartao-acao-seta">›</span>
    </button>
  )
}

export default CartaoAcao
