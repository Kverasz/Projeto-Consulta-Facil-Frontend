import './CartaoAtendimento.css'

function CartaoAtendimento({
  icone,
  nome,
  especialidade,
  clinica,
  data,
  hora,
  status,
  aoClicar,
}) {
  return (
    <div className="cartao-atendimento">
      <div className="cartao-atendimento-topo">
        <span className="cartao-atendimento-icone">{icone}</span>

        <div className="cartao-atendimento-info">
          <div className="cartao-atendimento-linha-nome">
            <span className="cartao-atendimento-nome">{nome}</span>
            <span className="cartao-atendimento-status">{status}</span>
          </div>

          <p className="cartao-atendimento-especialidade">
            {especialidade} · {clinica}
          </p>
        </div>
      </div>

      <div className="cartao-atendimento-quando">
        <span>📅 {data}</span>
        <span>🕒 {hora}</span>
      </div>

      <button
        type="button"
        className="cartao-atendimento-detalhes"
        onClick={aoClicar}
      >
        Ver detalhes →
      </button>
    </div>
  )
}

export default CartaoAtendimento