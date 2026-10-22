import { useCallback, useEffect, useMemo, useState } from 'react'

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
import Historico from './paginas/Historico/Historico'
import PerfilPaciente from './paginas/PerfilPaciente/PerfilPaciente'
import PreTriagem from './paginas/PreTriagem/PreTriagem'
import NovoAgendamento from './paginas/NovoAgendamento/NovoAgendamento'

import { obterDataHoraConsulta, obterStatusConsulta } from './servicos/datasConsultas'
import { PERFIS } from './servicos/autenticacao'
import { carregarCatalogo, criarAgendamento, especialidadesDoCatalogo } from './servicos/catalogo'
import {
  cancelarAgendamento,
  carregarConsultasPaciente,
  carregarPaciente,
  descobrirIdPaciente,
  reagendarConsulta,
} from './servicos/paciente'
import { dataDeHoje, horaAgora } from './servicos/profissional'

function App() {
  const [telaAtual, setTelaAtual] = useState('boas-vindas')
  const [emailRecuperacao, setEmailRecuperacao] = useState('')
  const [usuario, setUsuario] = useState(null)

  const [filtroConsultas, setFiltroConsultas] = useState(null)
  const [especialidadeInicial, setEspecialidadeInicial] = useState(null)

  // Consultas do profissional
  const [consultaAberta, setConsultaAberta] = useState(null)
  const [filtroAgenda, setFiltroAgenda] = useState(null)

  // Paciente: tudo vem da API
  const [paciente, setPaciente] = useState(null)
  const [catalogo, setCatalogo] = useState(null)
  const [consultasPaciente, setConsultasPaciente] = useState([])
  const [estadoConsultas, setEstadoConsultas] = useState('carregando')
  const [erroConsultas, setErroConsultas] = useState('')
  const [consultaPaciente, setConsultaPaciente] = useState(null)
  const [dataReagendamento, setDataReagendamento] = useState(null)
  const [horariosReagendamento, setHorariosReagendamento] = useState([])

  const guardarFiltroAgenda = useCallback((filtro) => setFiltroAgenda(filtro), [])
  const guardarFiltroConsultas = useCallback((filtro) => setFiltroConsultas(filtro), [])

  const ehPaciente = usuario && usuario.perfil !== PERFIS.PROFISSIONAL && usuario.perfil !== PERFIS.ADMIN
  const token = usuario?.token

  // Carrega cadastro, catálogo e consultas do paciente logado
  const carregarSessao = useCallback(async (u) => {
    setEstadoConsultas('carregando')
    setErroConsultas('')
    try {
      const id = await descobrirIdPaciente(u)
      const [cadastro, cat] = await Promise.all([
        carregarPaciente(id, u.token).catch(() => null),
        carregarCatalogo(u.token),
      ])
      setPaciente(cadastro ?? { id, cadastro: null, nome: '', email: '', telefone: '', dataNascimento: '' })
      setCatalogo(cat)
      setConsultasPaciente(await carregarConsultasPaciente(id, u.token, cat))
      setEstadoConsultas('ok')
      return id
    } catch (e) {
      setErroConsultas(e.message)
      setEstadoConsultas('erro')
      return null
    }
  }, [])

  const recarregarConsultas = useCallback(async () => {
    if (!usuario || !paciente) return []
    const lista = await carregarConsultasPaciente(paciente.id, usuario.token, catalogo ?? undefined)
    setConsultasPaciente(lista)
    return lista
  }, [usuario, paciente, catalogo])

  useEffect(() => {
    if (ehPaciente && !paciente && estadoConsultas !== 'erro') carregarSessao(usuario)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ehPaciente])

  // Usuário que as telas veem: login + cadastro vindo da API
  const usuarioPaciente = useMemo(() => {
    if (!usuario) return usuario
    if (!paciente) return usuario
    return {
      ...usuario,
      idPaciente: paciente.id,
      nome: paciente.nome || usuario.nome,
      email: paciente.email || usuario.email,
      telefone: paciente.telefone || usuario.telefone,
      dataNascimento: paciente.dataNascimento || usuario.dataNascimento,
    }
  }, [usuario, paciente])

  const especialidades = useMemo(
    () => (catalogo ? especialidadesDoCatalogo(catalogo, dataDeHoje(), horaAgora()) : []),
    [catalogo]
  )

  const agora = new Date()

  const consultasAgendadas = consultasPaciente.filter((consulta) => {
    const status = obterStatusConsulta(consulta)
    const data = obterDataHoraConsulta(consulta)
    return status !== 'cancelado' && status !== 'realizado' && data !== null && data >= agora
  })

  const consultasHistorico = consultasPaciente.filter((consulta) => {
    const status = obterStatusConsulta(consulta)
    const data = obterDataHoraConsulta(consulta)
    return status === 'cancelado' || status === 'realizado' || (data !== null && data < agora)
  })

  async function confirmarReagendamento(horario) {
    if (!consultaPaciente || !horario) return
    await reagendarConsulta(consultaPaciente, horario.id, paciente.id, token)
    await recarregarConsultas()
    setConsultaPaciente(null)
    setDataReagendamento(null)
    setTelaAtual('agendamentos')
  }

  async function cancelarConsultaPaciente() {
    if (!consultaPaciente) return
    await cancelarAgendamento(consultaPaciente.id, token)
    await recarregarConsultas()
    setConsultaPaciente(null)
    setTelaAtual('historico')
  }

  // Agenda na API e devolve a consulta criada (ou null se a lista ainda não a trouxe)
  async function agendarNovaConsulta({ idProfissional, idDisponibilidade }) {
    await criarAgendamento({ idPaciente: paciente.id, idProfissional, idDisponibilidade }, token)
    const lista = await recarregarConsultas()
    return (
      lista.find(
        (c) =>
          String(c.idDisponibilidade) === String(idDisponibilidade) &&
          String(c.idProfissional) === String(idProfissional) &&
          c.statusApi !== 'CANCELADO'
      ) ?? null
    )
  }

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
    setPaciente(null)
    setCatalogo(null)
    setConsultasPaciente([])
    setEstadoConsultas('carregando')
    setErroConsultas('')
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
    setPaciente(null)
    setCatalogo(null)
    setConsultasPaciente([])
    setConsultaAberta(null)
    setConsultaPaciente(null)
    setTelaAtual('login')
  }

  const tentarNovamente = () => usuario && carregarSessao(usuario)

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
        usuario={usuarioPaciente}
        consultas={consultasAgendadas}
        especialidades={especialidades}
        estadoConsultas={estadoConsultas}
        erroConsultas={erroConsultas}
        aoTentarNovamente={tentarNovamente}
        aoIrParaAgendamentos={() => setTelaAtual('agendamentos')}
        aoIrParaHistorico={() => setTelaAtual('historico')}
        aoVerDetalhes={abrirDetalhesPaciente}
        aoIrParaPerfil={() => setTelaAtual('perfil-paciente')}
        aoPrecisoAtendimento={() => setTelaAtual('pre-triagem')}
        aoAbrirNotificacoes={() => setTelaAtual('notificacoes')}
        aoJaSeiOQuePreciso={() => {
          setEspecialidadeInicial(null)
          setTelaAtual('novo-agendamento')
        }}
        aoSelecionarEspecialidade={(especialidade) => {
          setEspecialidadeInicial(especialidade)
          setTelaAtual('novo-agendamento')
        }}
      />
    )
  }

  // NOVO AGENDAMENTO DO PACIENTE

  if (telaAtual === 'novo-agendamento') {
    return (
      <NovoAgendamento
        usuario={usuarioPaciente}
        especialidadeInicial={especialidadeInicial}
        aoVoltar={() => setTelaAtual('inicio')}
        aoAgendar={agendarNovaConsulta}
        aoVerAgendamento={abrirDetalhesPaciente}
        aoVerAgendamentos={() => setTelaAtual('agendamentos')}
      />
    )
  }

  // PRÉ-TRIAGEM DO PACIENTE

  if (telaAtual === 'pre-triagem') {
    return (
      <PreTriagem
        aoVoltar={() => setTelaAtual('inicio')}
        aoAgendar={() => {
          setEspecialidadeInicial(null)
          setTelaAtual('novo-agendamento')
        }}
      />
    )
  }

  // AGENDAMENTOS DO PACIENTE

  if (telaAtual === 'agendamentos') {
    return (
      <Agendamentos
        consultas={consultasAgendadas}
        estadoConsultas={estadoConsultas}
        erroConsultas={erroConsultas}
        aoTentarNovamente={tentarNovamente}
        aoIrParaInicio={() => setTelaAtual('inicio')}
        aoIrParaHistorico={() => setTelaAtual('historico')}
        aoVerDetalhes={abrirDetalhesPaciente}
        aoIrParaPerfil={() => setTelaAtual('perfil-paciente')}
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
        aoCancelar={cancelarConsultaPaciente}
      />
    )
  }

  // REAGENDAMENTO DO PACIENTE

  if (telaAtual === 'reagendar' && consultaPaciente) {
    return (
      <Reagendar
        usuario={usuarioPaciente}
        consulta={consultaPaciente}
        aoVoltar={() => setTelaAtual('detalhes-agendamento')}
        aoVerHorarios={(data, horarios) => {
          setDataReagendamento(data)
          setHorariosReagendamento(horarios ?? [])
          setTelaAtual('horarios-disponiveis')
        }}
      />
    )
  }

  if (telaAtual === 'horarios-disponiveis' && consultaPaciente && dataReagendamento) {
    return (
      <HorariosDisponiveis
        consulta={consultaPaciente}
        dataSelecionada={dataReagendamento}
        horarios={horariosReagendamento}
        aoVoltar={() => setTelaAtual('reagendar')}
        aoConfirmar={confirmarReagendamento}
      />
    )
  }

  // HISTÓRICO DO PACIENTE

  if (telaAtual === 'historico') {
    return (
      <Historico
        consultas={consultasHistorico}
        estadoConsultas={estadoConsultas}
        erroConsultas={erroConsultas}
        aoTentarNovamente={tentarNovamente}
        aoIrParaInicio={() => setTelaAtual('inicio')}
        aoIrParaAgendamentos={() => setTelaAtual('agendamentos')}
        aoIrParaPerfil={() => setTelaAtual('perfil-paciente')}
      />
    )
  }

  // NOTIFICAÇÕES E PERFIL DO PACIENTE

  if (telaAtual === 'notificacoes' || telaAtual === 'perfil-paciente') {
    return (
      <PerfilPaciente
        usuario={usuarioPaciente}
        paciente={paciente}
        consultas={consultasPaciente}
        aoAtualizarPaciente={setPaciente}
        abrirNotificacoesInicialmente={telaAtual === 'notificacoes'}
        aoVoltarNotificacoes={() => setTelaAtual('inicio')}
        aoIrParaInicio={() => setTelaAtual('inicio')}
        aoIrParaAgendamentos={() => setTelaAtual('agendamentos')}
        aoIrParaHistorico={() => setTelaAtual('historico')}
        aoSair={sair}
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

  // INÍCIO DO ADMINISTRADOR

  if (telaAtual === 'inicio-admin') {
    return <InicioAdmin usuario={usuario} aoSair={sair} />
  }

  return null
}

export default App
