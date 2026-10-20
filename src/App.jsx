import { useCallback, useState } from 'react'
import BoasVindas from './paginas/BoasVindas/BoasVindas'
import CadastroPaciente from './paginas/Cadastro/Paciente/CadastroPaciente'
import Login from './paginas/Login/Login'
import EsqueciSenha from './paginas/EsqueciSenha/EsqueciSenha'
import EmailEnviado from './paginas/EsqueciSenha/EmailEnviado'
import Inicio from './paginas/Inicio/Inicio'
import Agendamentos from './paginas/Agendamentos/Agendamentos'
import InicioProfissional from './paginas/InicioProfissional/InicioProfissional'
import Perfil from './paginas/Perfil/Perfil'
import Consultas from './paginas/Consultas/Consultas'
import Horarios from './paginas/Horarios/Horarios'
import Agenda from './paginas/Agenda/Agenda'
import DetalhesConsulta from './paginas/DetalhesConsulta/DetalhesConsulta'
import InicioAdmin from './paginas/InicioAdmin/InicioAdmin'
import { PERFIS } from './servicos/autenticacao'

function App() {
  const [telaAtual, setTelaAtual] = useState('boas-vindas')
  const [emailRecuperacao, setEmailRecuperacao] = useState('')
  const [usuario, setUsuario] = useState(null)
  const [consultaAberta, setConsultaAberta] = useState(null) // { consulta, profissional, origem }
  const [filtroAgenda, setFiltroAgenda] = useState(null) // { visao, data }: lembra a aba e o dia da agenda

  const [filtroConsultas, setFiltroConsultas] = useState(null) // 'hoje', 'proximas'...: lembra o filtro da aba Consultas

  const guardarFiltroAgenda = useCallback((filtro) => setFiltroAgenda(filtro), [])

  // Menu do profissional (rodapé e menu lateral)
  function navegarProfissional(id) {
    if (id === 'inicio') setTelaAtual('inicio-profissional')
    if (id === 'agenda') {
      setFiltroAgenda(null)
      setTelaAtual('agenda-profissional')
    }
    if (id === 'horarios') setTelaAtual('horarios-profissional')
    if (id === 'consultas') {
      setFiltroConsultas(null)
      setTelaAtual('consultas-profissional')
    }
    if (id === 'perfil') setTelaAtual('perfil-profissional')
  }

  const guardarFiltroConsultas = useCallback((filtro) => setFiltroConsultas(filtro), [])

  function abrirDetalhes(origem) {
    return (consulta, profissional) => {
      setConsultaAberta({ consulta, profissional, origem })
      setTelaAtual('detalhes-consulta')
    }
  }

  // Envia o usuário para a tela inicial do perfil dele
  function entrar(dadosUsuario) {
    setUsuario(dadosUsuario)
    if (dadosUsuario.perfil === PERFIS.PROFISSIONAL) setTelaAtual('inicio-profissional')
    else if (dadosUsuario.perfil === PERFIS.ADMIN) setTelaAtual('inicio-admin')
    else setTelaAtual('inicio')
  }

  function sair() {
    setUsuario(null)
    setTelaAtual('login')
  }

  if (telaAtual === 'boas-vindas') {
    return (
      <BoasVindas
        aoComecar={() => setTelaAtual('cadastro-paciente')}
        aoIrParaLogin={() => setTelaAtual('login')}
      />
    )
  }

  if (telaAtual === 'cadastro-paciente') {
    return (
      <CadastroPaciente
        aoVoltar={() => setTelaAtual('boas-vindas')}
        aoIrParaLogin={() => setTelaAtual('login')}
      />
    )
  }

  if (telaAtual === 'login') {
    return (
      <Login
        aoVoltar={() => setTelaAtual('boas-vindas')}
        aoIrParaCadastro={() => setTelaAtual('cadastro-paciente')}
        aoEsqueciSenha={() => setTelaAtual('esqueci-senha')}
        aoLoginSucesso={entrar}
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

  if (telaAtual === 'inicio') {
    return (
      <Inicio
        aoIrParaAgendamentos={() => setTelaAtual('agendamentos')}
      />
    )
  }

  if (telaAtual === 'inicio-profissional') {
    return (
      <InicioProfissional
        usuario={usuario}
        aoSair={sair}
        aoVerDetalhes={abrirDetalhes('inicio-profissional')}
        aoNavegar={navegarProfissional}
      />
    )
  }

  if (telaAtual === 'perfil-profissional') {
    return <Perfil usuario={usuario} aoNavegar={navegarProfissional} aoSair={sair} />
  }

  if (telaAtual === 'consultas-profissional') {
    return (
      <Consultas
        usuario={usuario}
        filtroInicial={filtroConsultas}
        aoMudarFiltro={guardarFiltroConsultas}
        aoNavegar={navegarProfissional}
        aoVerDetalhes={abrirDetalhes('consultas-profissional')}
      />
    )
  }

  if (telaAtual === 'horarios-profissional') {
    return <Horarios usuario={usuario} aoNavegar={navegarProfissional} />
  }

  if (telaAtual === 'agenda-profissional') {
    return (
      <Agenda
        usuario={usuario}
        filtroInicial={filtroAgenda}
        aoMudarFiltro={guardarFiltroAgenda}
        aoNavegar={navegarProfissional}
        aoVerDetalhes={abrirDetalhes('agenda-profissional')}
      />
    )
  }

  if (telaAtual === 'detalhes-consulta') {
    return (
      <DetalhesConsulta
        usuario={usuario}
        consulta={consultaAberta.consulta}
        profissional={consultaAberta.profissional}
        aoVoltar={() => setTelaAtual(consultaAberta.origem)}
      />
    )
  }

  if (telaAtual === 'inicio-admin') {
    return <InicioAdmin usuario={usuario} aoSair={sair} />
  }

  if (telaAtual === 'agendamentos') {
    return (
      <Agendamentos
        aoIrParaInicio={() => setTelaAtual('inicio')}
      />
    )
  }

  return null
}

export default App