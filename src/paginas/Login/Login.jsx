import { useState } from 'react'
import BotaoVoltar from '../../componentes/BotaoVoltar/BotaoVoltar'
import CampoTexto from '../../componentes/CampoTexto/CampoTexto'
import Botao from '../../componentes/Botao/Botao'
import './Login.css'

function Login({ aoIrParaCadastro, aoEsqueciSenha }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  async function realizarLogin(evento) {
    evento.preventDefault()
    // Lógica de login futura
    console.log('Login:', email, senha)
  }

  return (
    <div className="login">
      <div className="login-topo">
        <div className="botao-voltar-container">
          <BotaoVoltar aoClicar={() => window.history.back()} />
        </div>
        <h1 className="login-topo-titulo">Entrar</h1>
      </div>

      <div className="login-boas-vindas">
        <h2>Bem-vindo de volta</h2>
        <p>Entre com seus dados para continuar</p>
      </div>

      <form className="login-form" onSubmit={realizarLogin}>
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

        <Botao texto="Entrar" tipo="submit" />

        <div className="login-cadastro">
          <p>Não tem uma conta?</p>
          <button type="button" onClick={aoIrParaCadastro}>Cadastrar</button>
        </div>
      </form>
    </div>
  )
}

export default Login