import './CampoTexto.css'

function CampoTexto({ id, rotulo, tipo, placeholder, valor, aoMudar }) {
  return (
    <div className="campo-texto">
      <label htmlFor={id}>{rotulo}</label>
      <input
        id={id}
        type={tipo}
        placeholder={placeholder}
        value={valor}
        onChange={aoMudar}
      />
    </div>
  )
}

export default CampoTexto
