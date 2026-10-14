import BotaoVoltar from '../../componentes/BotaoVoltar/BotaoVoltar'
import Botao from '../../componentes/Botao/Botao'
import './EmailEnviado.css'

function EmailEnviado({ email, aoVoltarLogin }) {
  return (
    <div className="email-enviado">
      <div className="enviado-topo">
        <div className="botao-voltar-container">
          <BotaoVoltar aoClicar={aoVoltarLogin} />
        </div>
        <h1 className="enviado-topo-titulo">Recuperar acesso</h1>
      </div>

      <div className="enviado-conteudo-central">
        <div className="icone-check-container">
          <div className="icone-check">✓</div>
        </div>

        <div className="enviado-titulo">
          <h2>E-mail enviado!</h2>
          <p>
            Enviamos um link para <span>{email || 'o e-mail informado'}</span>. Verifique sua caixa de entrada e a pasta de spam.
          </p>
        </div>
      </div>

      <div className="enviado-rodape">
        <Botao texto="Voltar ao login" aoClicar={aoVoltarLogin} />
      </div>
    </div>
  )
}

export default EmailEnviado