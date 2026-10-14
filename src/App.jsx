<<<<<<< HEAD
import Inicio from './paginas/Inicio/Inicio'

function App() {
  // Por enquanto o App mostra direto a tela de Início.
  // Quando tivermos mais telas, é aqui que vamos trocar entre elas.
  return <Inicio />
}

export default App
=======
import { useState } from 'react'
import BoasVindas from './paginas/BoasVindas/BoasVindas'
import SelecaoPerfil from './paginas/SelecaoPerfil/SelecaoPerfil'
import CadastroPaciente from './paginas/Cadastro/Paciente/CadastroPaciente'
import CadastroMedico from './paginas/Cadastro/Medico/CadastroMedico'
import Login from './paginas/Login/Login'
import EsqueciSenha from './paginas/EsqueciSenha/EsqueciSenha'
import EmailEnviado from './paginas/EsqueciSenha/EmailEnviado'

function App() {
  const [telaAtual, setTelaAtual] = useState('boas-vindas')
  const [emailRecuperacao, setEmailRecuperacao] = useState('')

  if (telaAtual === 'boas-vindas') {
    return (
      <BoasVindas 
        aoComecar={() => setTelaAtual('selecao-perfil')} 
        aoIrParaLogin={() => setTelaAtual('login')} 
      />
    )
  }

  if (telaAtual === 'selecao-perfil') {
    return (
      <SelecaoPerfil 
        aoVoltar={() => setTelaAtual('boas-vindas')}
        aoSelecionarPaciente={() => setTelaAtual('cadastro-paciente')}
        aoSelecionarMedico={() => setTelaAtual('cadastro-medico')}
        aoIrParaLogin={() => setTelaAtual('login')}
      />
    )
  }

  if (telaAtual === 'cadastro-paciente') {
    return <CadastroPaciente aoVoltar={() => setTelaAtual('selecao-perfil')} aoIrParaLogin={() => setTelaAtual('login')} />
  }

  if (telaAtual === 'cadastro-medico') {
    return <CadastroMedico aoVoltar={() => setTelaAtual('selecao-perfil')} aoIrParaLogin={() => setTelaAtual('login')} />
  }

  if (telaAtual === 'login') {
    return (
      <Login 
        aoIrParaCadastro={() => setTelaAtual('selecao-perfil')} 
        aoEsqueciSenha={() => setTelaAtual('esqueci-senha')} 
      />
    )
  }

  if (telaAtual === 'esqueci-senha') {
    return (
      <EsqueciSenha 
        aoVoltar={() => setTelaAtual('login')} 
        aoEnviarSucesso={(email) => {
          setEmailRecuperacao(email)
          setTelaAtual('email-enviado')
        }} 
      />
    )
  }

  if (telaAtual === 'email-enviado') {
    return (
      <EmailEnviado 
        email={emailRecuperacao} 
        aoVoltarLogin={() => setTelaAtual('login')} 
      />
    )
  }

  return null
}

export default App
>>>>>>> 67ba2d69406735d8df7b8882aa36a78782ca899d
