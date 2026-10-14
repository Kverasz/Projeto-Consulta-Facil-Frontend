import { useState } from 'react'
import BotaoVoltar from '../../componentes/BotaoVoltar/BotaoVoltar'
import CampoTexto from '../../componentes/CampoTexto/CampoTexto'
import Botao from '../../componentes/Botao/Botao'
import './EsqueciSenha.css'

function EsqueciSenha({ aoVoltar, aoEnviarSucesso }) {
  const [email, setEmail] = useState('')

  async function realizarEnvio(evento) {
    evento.preventDefault()

    if (!email) {
      alert('Por favor, informe o seu e-mail cadastrado.')
      return
    }

    try {
      const urlApi = 'https://back-end-pi-ihs1.onrender.com/recuperar-senha' 
      
      const resposta = await fetch(urlApi, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      // passa o email inserido para a tela de confirmação seguinte
      if (aoEnviarSucesso) aoEnviarSucesso(email)

    } catch (erro) {
      console.error('Erro na requisição:', erro)
      // avvança para a tela de sucesso mesmo em simulação para garantir o fluxo visual
      if (aoEnviarSucesso) aoEnviarSucesso(email)
    }
  }

  return (
    <div className="esqueci-senha">
      <div className="esqueci-topo">
        <div className="botao-voltar-container">
          <BotaoVoltar aoClicar={aoVoltar} />
        </div>
        <h1 className="esqueci-topo-titulo">Recuperar acesso</h1>
      </div>

      <div className="esqueci-icone-container">
        <div className="icone-chave">🔑</div>
      </div>

      <div className="esqueci-titulo">
        <h2>Esqueceu sua senha?</h2>
        <p>Informe o e-mail cadastrado e enviaremos um link para criar uma nova senha.</p>
      </div>

      <form className="esqueci-form" onSubmit={realizarEnvio}>
        <CampoTexto 
          rotulo="E-mail" 
          tipo="email" 
          placeholder="seu@email.com"
          valor={email} 
          aoMudar={(e) => setEmail(e.target.value)} 
        />

        <div className="esqueci-botoes">
          <Botao texto="Enviar link de recuperação" tipo="submit" />
          
          <button 
            type="button" 
            className="botao-voltar-login" 
            onClick={aoVoltar}
          >
            Voltar ao login
          </button>
        </div>
      </form>
    </div>
  )
}

export default EsqueciSenha