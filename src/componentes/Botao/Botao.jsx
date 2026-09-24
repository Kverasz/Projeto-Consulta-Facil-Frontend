import './Botao.css'

function Botao({ texto, tipo = 'button', aoClicar }) {
  return (
    <button type={tipo} className="botao" onClick={aoClicar}>
      {texto}
    </button>
  )
}

export default Botao
