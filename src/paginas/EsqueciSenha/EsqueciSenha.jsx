import { useState } from 'react'
import BotaoVoltar from '../../componentes/BotaoVoltar/BotaoVoltar'
import CampoTexto from '../../componentes/CampoTexto/CampoTexto'
import Botao from '../../componentes/Botao/Botao'
import './EsqueciSenha.css'

function EsqueciSenha({ aoVoltar, aoEnviarSucesso }) {
  const [email, setEmail] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function realizarEnvio(evento) {
    evento.preventDefault()
    setErro('')

    if (!email.trim()) {
      setErro('Informe o e-mail cadastrado.')
      return
    }

    setEnviando(true)
    try {
      const resposta = await fetch('https://back-end-pi-ihs1.onrender.com/recuperar-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      if (!resposta.ok) {
        setErro(
          resposta.status === 404
            ? 'A recuperação de senha por e-mail ainda não está disponível. Procure a unidade de saúde para redefinir seu acesso.'
            : 'Não foi possível enviar o link agora. Tente novamente em instantes.'
        )
        return
      }

      aoEnviarSucesso?.(email.trim())
    } catch {
      setErro('Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.')
    } finally {
      setEnviando(false)
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

        {erro && <p className="esqueci-erro" role="alert">{erro}</p>}

        <div className="esqueci-botoes">
          <Botao texto={enviando ? 'Enviando...' : 'Enviar link de recuperação'} tipo="submit" />
          
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