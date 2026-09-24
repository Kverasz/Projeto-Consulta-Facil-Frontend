import { useState } from 'react'
import BotaoVoltar from '../../componentes/BotaoVoltar/BotaoVoltar'
import CampoTexto from '../../componentes/CampoTexto/CampoTexto'
import Botao from '../../componentes/Botao/Botao'
import './Login.css'

function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  function entrar(evento) {
    evento.preventDefault() // impede a página de recarregar
    console.log('Login:', email, senha)
    // Aqui depois entra a chamada para o back-end
  }

  return (
    <main className="login">
      <header className="login-topo">
        <BotaoVoltar aoClicar={() => window.history.back()} />
        <h1 className="login-topo-titulo">Entrar</h1>
      </header>

      <section className="login-boas-vindas">
        <h2>Bem-vindo de volta</h2>
        <p>Entre com seus dados para continuar</p>
      </section>

      <form className="login-form" onSubmit={entrar}>
        <CampoTexto
          id="email"
          rotulo="E-mail"
          tipo="email"
          placeholder="seu@email.com"
          valor={email}
          aoMudar={(e) => setEmail(e.target.value)}
        />

        <CampoTexto
          id="senha"
          rotulo="Senha"
          tipo="password"
          placeholder="••••••••"
          valor={senha}
          aoMudar={(e) => setSenha(e.target.value)}
        />

        <button type="button" className="login-esqueci">
          Esqueci minha senha
        </button>

        <Botao texto="Entrar" tipo="submit" />
      </form>

      <p className="login-cadastro">
        Não tenho uma conta <button type="button">Cadastrar</button>
      </p>
    </main>
  )
}

export default Login
