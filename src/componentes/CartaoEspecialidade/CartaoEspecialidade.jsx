import './CartaoEspecialidade.css'

function CartaoEspecialidade({ icone, nome, aoClicar }) {
  return (
    <button type="button" className="cartao-especialidade" onClick={aoClicar}>
      <span className="cartao-especialidade-icone">{icone}</span>
      <span className="cartao-especialidade-nome">{nome}</span>
    </button>
  )
}

export default CartaoEspecialidade
