import { useState } from 'react'
import BotaoVoltar from '../../componentes/BotaoVoltar/BotaoVoltar'
import CampoTexto from '../../componentes/CampoTexto/CampoTexto'
import Botao from '../../componentes/Botao/Botao'
import './Login.css'

<<<<<<< HEAD
function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  function entrar(evento) {
    evento.preventDefault()
    console.log('Login:', email, senha)
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
=======
function Login({ aoIrParaCadastro }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  async function entrar(evento) {
    evento.preventDefault()

    const dadosLogin = {
      email: email,
      senha: senha
    }

    try {
      const resposta = await fetch('https://back-end-pi-ihs1.onrender.com/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosLogin)
      })

      if (resposta.ok) {
        const resultado = await resposta.json()
        alert('Login efetuado com sucesso!')
        console.log('Dados do utilizador:', resultado)
      } else {
        alert('E-mail ou palavra-passe incorretos.')
      }
    } catch (erro) {
      console.error('Erro na requisição:', erro)
      alert('Não foi possível conectar ao servidor.')
    }
  }

  return (
    <div className="login">
      <div className="login-topo">
        <BotaoVoltar aoClicar={() => window.history.back()} />
        <h1 className="login-topo-titulo">Entrar</h1>
      </div>

      <div className="login-boas-vindas">
        <h2>Bem-vindo de volta</h2>
        <p>Entre com seus dados para continuar</p>
      </div>

      <form className="login-form" onSubmit={entrar}>
        <CampoTexto 
          rotulo="E-mail" 
          tipo="email" 
          valor={email} 
          aoMudar={(e) => setEmail(e.target.value)} 
        />
        <CampoTexto 
          rotulo="Senha" 
          tipo="password" 
          valor={senha} 
          aoMudar={(e) => setSenha(e.target.value)} 
        />

        <button type="button" className="login-esqueci">Esqueci minha senha</button>
>>>>>>> 67ba2d69406735d8df7b8882aa36a78782ca899d

        <Botao texto="Entrar" tipo="submit" />
      </form>

<<<<<<< HEAD
      <p className="login-cadastro">
        Não tenho uma conta <button type="button">Cadastrar</button>
      </p>
    </main>
  )
}

export default Login
=======
      <div className="login-cadastro">
        <p>Não tem uma conta?</p>
        <button type="button" onClick={aoIrParaCadastro}>Cadastrar</button>
      </div>
    </div>
  )
}

export default Login
>>>>>>> 67ba2d69406735d8df7b8882aa36a78782ca899d
