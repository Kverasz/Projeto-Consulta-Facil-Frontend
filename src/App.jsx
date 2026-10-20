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

import Detalhes from './paginas/Detalhes/Detalhes'
import Reagendar from './paginas/Reagendar/Reagendar'
import HorariosDisponiveis from './paginas/HorariosDisponiveis/HorariosDisponiveis'

import { PERFIS } from './servicos/autenticacao'

const consultasIniciais = [
  {
    icone: '🦴',
    nome: 'Dr. Carlos Mendes',
    especialidade: 'Ortopedia',
    crm: 'CRM-PE 24.501',
    clinica: 'Clínica Boa Saúde',
    endereco: 'Av. Boa Viagem, 1200 - Boa Viagem',
    data: '16 out 2026',
    dataCompleta: '16 de outubro de 2026',
    hora: '09:30',
    status: 'Confirmado',
    codigo: 'SR-2026-04817',
  },
  {
    icone: '❤️',
    nome: 'Dra. Luciana Ferreira',
    especialidade: 'Cardiologia',
    crm: 'CRM-PE 31.208',
    clinica: 'Centro Médico Recife',
    endereco: 'R. Setúbal, 445 - Boa Viagem',
    data: '28 out 2026',
    dataCompleta: '28 de outubro de 2026',
    hora: '14:00',
    status: 'Aguardando',
    codigo: 'SR-2026-04822',
  },
]

function App() {
  const [telaAtual, setTelaAtual] = useState('boas-vindas')
  const [emailRecuperacao, setEmailRecuperacao] = useState('')
  const [usuario, setUsuario] = useState(null)

  const [filtroConsultas, setFiltroConsultas] = useState(null)
  const [consultasPaciente, setConsultasPaciente] = useState(consultasIniciais)
  const [dataReagendamento, setDataReagendamento] = useState(null)

  // Consultas do profissional
  const [consultaAberta, setConsultaAberta] = useState(null)
  const [filtroAgenda, setFiltroAgenda] = useState(null)

  // Consulta selecionada pelo paciente
  const [consultaPaciente, setConsultaPaciente] = useState(null)

  const guardarFiltroAgenda = useCallback(
    (filtro) => setFiltroAgenda(filtro),
    []
  )

function confirmarReagendamento(horario) {
  if (!consultaPaciente || !dataReagendamento || !horario) return

  const dataCurta = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(dataReagendamento).replace('.', '')

  const dataCompleta = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(dataReagendamento)

  const consultaAtualizada = {
    ...consultaPaciente,
    data: dataCurta,
    dataCompleta,
    hora: horario,
    status: 'Confirmado',
  }

  setConsultasPaciente((anteriores) =>
    anteriores.map((consulta) =>
      consulta.codigo === consultaPaciente.codigo
        ? consultaAtualizada
        : consulta
    )
  )

  setConsultaPaciente(consultaAtualizada)
  setDataReagendamento(null)
  setTelaAtual('agendamentos')
}
  function navegarProfissional(id) {
    if (id === 'inicio') {
      setTelaAtual('inicio-profissional')
    }

    if (id === 'agenda') {
      setFiltroAgenda(null)
      setTelaAtual('agenda-profissional')
    }
    if (id === 'horarios') {
      setTelaAtual('horarios-profissional')
    }

    if (id === 'consultas') {
      setFiltroConsultas(null)
      setTelaAtual('consultas-profissional')
    }

    if (id === 'perfil') {
      setTelaAtual('perfil-profissional')
    }
  }

  const guardarFiltroConsultas = useCallback((filtro) => setFiltroConsultas(filtro), [])

  function abrirDetalhes(origem) {
    return (consulta, profissional) => {
      setConsultaAberta({ consulta, profissional, origem })
      setTelaAtual('detalhes-consulta')
    }
  }

  function abrirDetalhesPaciente(consulta) {
    setConsultaPaciente(consulta)
    setTelaAtual('detalhes-agendamento')
  }

  function entrar(dadosUsuario) {
    setUsuario(dadosUsuario)

    if (dadosUsuario.perfil === PERFIS.PROFISSIONAL) {
      setTelaAtual('inicio-profissional')
    } else if (dadosUsuario.perfil === PERFIS.ADMIN) {
      setTelaAtual('inicio-admin')
    } else {
      setTelaAtual('inicio')
    }
  }

  function sair() {
    setUsuario(null)
    setConsultaAberta(null)
    setConsultaPaciente(null)
    setTelaAtual('login')
  }

  // BOAS-VINDAS

  if (telaAtual === 'boas-vindas') {
    return (
      <BoasVindas
        aoComecar={() => setTelaAtual('cadastro-paciente')}
        aoIrParaLogin={() => setTelaAtual('login')}
      />
    )
  }

  // CADASTRO

  if (telaAtual === 'cadastro-paciente') {
    return (
      <CadastroPaciente
        aoVoltar={() => setTelaAtual('boas-vindas')}
        aoIrParaLogin={() => setTelaAtual('login')}
      />
    )
  }

  // LOGIN

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

  // RECUPERAÇÃO DE SENHA

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

  // INÍCIO DO PACIENTE

  if (telaAtual === 'inicio') {
    return (
      <Inicio
        aoIrParaAgendamentos={() => setTelaAtual('agendamentos')}
      />
    )
  }

  // AGENDAMENTOS DO PACIENTE

if (telaAtual === 'agendamentos') {
  return (
    <Agendamentos
      consultas={consultasPaciente}
      aoIrParaInicio={() => setTelaAtual('inicio')}
      aoVerDetalhes={abrirDetalhesPaciente}
    />
  )
}

  // DETALHES DO AGENDAMENTO DO PACIENTE

  if (telaAtual === 'detalhes-agendamento' && consultaPaciente) {
    return (
      <Detalhes
        consulta={consultaPaciente}
        aoVoltar={() => setTelaAtual('agendamentos')}
        aoReagendar={() => setTelaAtual('reagendar')}
        aoCancelar={() => setTelaAtual('agendamentos')}
      />
    )
  }

  // REAGENDAMENTO DO PACIENTE

if (telaAtual === 'reagendar' && consultaPaciente) {
  return (
    <Reagendar
      consulta={consultaPaciente}
      aoVoltar={() => setTelaAtual('detalhes-agendamento')}
      aoVerHorarios={(data) => {
        setDataReagendamento(data)
        setTelaAtual('horarios-disponiveis')
      }}
    />
  )
}

  // INÍCIO DO PROFISSIONAL

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
    return (
      <Perfil
        usuario={usuario}
        aoNavegar={navegarProfissional}
        aoSair={sair}
      />
    )
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
    return (
      <Horarios
        usuario={usuario}
        aoNavegar={navegarProfissional}
      />
    )
  }

  // AGENDA DO PROFISSIONAL

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

  // DETALHES DA CONSULTA DO PROFISSIONAL

  if (telaAtual === 'detalhes-consulta' && consultaAberta) {
    return (
      <DetalhesConsulta
        usuario={usuario}
        consulta={consultaAberta.consulta}
        profissional={consultaAberta.profissional}
        aoVoltar={() => setTelaAtual(consultaAberta.origem)}
      />
    )
  }
  if (
  telaAtual === 'horarios-disponiveis' &&
  consultaPaciente &&
  dataReagendamento
) {
  return (
    <HorariosDisponiveis
      consulta={consultaPaciente}
      dataSelecionada={dataReagendamento}
      aoVoltar={() => setTelaAtual('reagendar')}
      aoConfirmar={confirmarReagendamento}
    />
  )
}

  // INÍCIO DO ADMINISTRADOR

  if (telaAtual === 'inicio-admin') {
    return (
      <InicioAdmin
        usuario={usuario}
        aoSair={sair}
      />
    )
  }

  return null
}

export default App