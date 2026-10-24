import { useState } from 'react'
import BotaoVoltar from '../../componentes/BotaoVoltar/BotaoVoltar'
import CampoTexto from '../../componentes/CampoTexto/CampoTexto'
import Botao from '../../componentes/Botao/Botao'
import Logo from '../../componentes/Logo/Logo'
import { realizarLogin } from '../../servicos/autenticacao'
import './Login.css'

function Login({ aoVoltar, aoIrParaCadastro, aoEsqueciSenha, aoLoginSucesso }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function enviarLogin(evento) {
    evento.preventDefault()
    setErro('')
    setCarregando(true)

    try {
      const usuario = await realizarLogin(email, senha)
      aoLoginSucesso(usuario)
    } catch (e) {
      setErro(e.message)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="login">
      <div className="login-topo">
        <div className="botao-voltar-container">
          <BotaoVoltar aoClicar={aoVoltar} />
        </div>
        <h1 className="login-topo-titulo">Entrar</h1>
      </div>

      <div className="login-boas-vindas">
        <Logo tamanho={72} className="login-logo" />
        <h2>Bem-vindo de volta</h2>
        <p>Entre com seus dados para continuar</p>
      </div>

      <form className="login-form" onSubmit={enviarLogin}>
        <CampoTexto 
          rotulo="E-mail" 
          tipo="email" 
          placeholder="seu@email.com"
          valor={email} 
          aoMudar={(e) => setEmail(e.target.value)} 
        />
        <CampoTexto 
          rotulo="Senha" 
          tipo="password" 
          placeholder="Mínimo 8 caracteres"
          valor={senha} 
          aoMudar={(e) => setSenha(e.target.value)} 
        />

        <button 
          type="button" 
          className="login-esqueci" 
          onClick={aoEsqueciSenha}
        >
          Esqueci minha senha
        </button>

        {erro && <p className="login-erro" role="alert">{erro}</p>}

        <Botao texto={carregando ? 'Entrando...' : 'Entrar'} tipo="submit" />

        <div className="login-cadastro">
          <p>Não tem uma conta?</p>
          <button type="button" onClick={aoIrParaCadastro}>Cadastrar</button>
        </div>
      </form>
    </div>
  )
}

export default Login