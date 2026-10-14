import Botao from '../../componentes/Botao/Botao'
import './BoasVindas.css'

function BoasVindas({ aoComecar, aoIrParaLogin }) {
  return (
    <div className="boas-vindas-container">
      <div className="boas-vindas-conteudo">
        <h1>Cuide do seu próximo passo.</h1>
        <p>Encontre o atendimento que você precisa de forma simples e segura.</p>
      </div>

      <div className="boas-vindas-botoes">
        <Botao texto="Começar" aoClicar={aoComecar} />
        <button type="button" className="botao-secundario" onClick={aoIrParaLogin}>
          Já tenho uma conta
        </button>
      </div>
    </div>
  )
}

export default BoasVindas