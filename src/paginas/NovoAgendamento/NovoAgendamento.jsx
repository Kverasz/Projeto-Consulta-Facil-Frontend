import { useState } from 'react'
import { especialidades, obterClinicas, obterProfissionais, horariosDemonstrativos } from './dadosAgendamento'
import './NovoAgendamento.css'

const nomesMeses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function dataSemHora(data) {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate())
}

function formatarData(data) {
  return `${data.getDate()} de ${nomesMeses[data.getMonth()]} de ${data.getFullYear()}`
}

function gerarCalendario(ano, mes) {
  const primeiroDia = new Date(ano, mes, 1).getDay()
  const quantidadeDias = new Date(ano, mes + 1, 0).getDate()
  return [...Array(primeiroDia).fill(null), ...Array.from({ length: quantidadeDias }, (_, i) => i + 1)]
}

function NovoAgendamento({
  especialidadeInicial = null,
  aoVoltar,
  aoConfirmar,
  aoVerAgendamento,
}) {

const especialidadePreSelecionada = especialidades.find(
  (item) => item.nome === especialidadeInicial
) ?? null

const [etapa, setEtapa] = useState(
  especialidadePreSelecionada ? 'clinicas' : 'especialidades'
)

const [busca, setBusca] = useState('')

const [especialidade, setEspecialidade] = useState(
  especialidadePreSelecionada
)

  const [clinica, setClinica] = useState(null)
  const [profissional, setProfissional] = useState(null)
  const [data, setData] = useState(null)
  const [horario, setHorario] = useState('')
  const [mesVisivel, setMesVisivel] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [consultaCriada, setConsultaCriada] = useState(null)

  const titulos = {
    especialidades: 'Especialidades', clinicas: especialidade?.nome,
    profissionais: clinica?.nome, data: profissional?.nome,
    horarios: data ? `${data.getDate()} de ${nomesMeses[data.getMonth()]}` : 'Horários',
    revisao: 'Revisar agendamento', sucesso: 'Agendamento',
  }

  const etapas = ['especialidades', 'clinicas', 'profissionais', 'data', 'horarios', 'revisao']


function voltar() {
  if (etapa === 'sucesso') {
    return aoVoltar?.()
  }

  if (etapa === 'clinicas' && especialidadeInicial) {
    return aoVoltar?.()
  }

  const indice = etapas.indexOf(etapa)

  if (indice <= 0) {
    return aoVoltar?.()
  }

  setEtapa(etapas[indice - 1])
}


  function escolherEspecialidade(item) {
    setEspecialidade(item)
    setClinica(null)
    setProfissional(null)
    setData(null)
    setHorario('')
    setEtapa('clinicas')
  }

  function escolherClinica(item) {
    setClinica(item)
    setProfissional(null)
    setData(null)
    setHorario('')
    setEtapa('profissionais')
  }

  function escolherProfissional(item) {
    setProfissional(item)
    setData(null)
    setHorario('')
    setMesVisivel(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
    setEtapa('data')
  }

  function alterarMes(direcao) {
    const proximo = new Date(mesVisivel.getFullYear(), mesVisivel.getMonth() + direcao, 1)
    const atual = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const limite = new Date(atual.getFullYear(), atual.getMonth() + 5, 1)
    if (proximo >= atual && proximo <= limite) setMesVisivel(proximo)
  }

  function confirmar() {
    if (!especialidade || !clinica || !profissional || !data || !horario || consultaCriada) return
    const consulta = {
      icone: especialidade.icone,
      nome: profissional.nome,
      especialidade: especialidade.nome,
      crm: profissional.crm,
      clinica: clinica.nome,
      endereco: clinica.endereco,
      data: `${data.getDate()} ${nomesMeses[data.getMonth()].slice(0, 3)} ${data.getFullYear()}`,
      dataCompleta: formatarData(data),
      hora: horario,
      status: 'Confirmado',
      codigo: `DEMO-${Date.now()}`,
      demonstrativo: true,
    }
    setConsultaCriada(consulta)
    aoConfirmar?.(consulta)
    setEtapa('sucesso')
  }

  const especialidadesFiltradas = especialidades.filter((item) =>
    item.nome.toLocaleLowerCase('pt-BR').includes(busca.toLocaleLowerCase('pt-BR').trim())
  )

  const hoje = dataSemHora(new Date())
  const primeiroMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  const ultimoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 5, 1)
  const calendario = gerarCalendario(mesVisivel.getFullYear(), mesVisivel.getMonth())

  // Horários apenas ilustrativos; não representam disponibilidade real.
  const horariosIndisponiveis = new Set(['08:00', '10:00', '11:00', '15:00'])

  return (
    <div className="pagina-fundo">
      <div className="novo-agendamento">
        <header className="novo-agendamento-cabecalho">
          <button type="button" onClick={voltar} aria-label="Voltar">‹</button>
          <strong>{titulos[etapa]}</strong>
          <span />
        </header>

        <main className="novo-agendamento-conteudo">
          {etapa === 'especialidades' && (
            <>
              <h1>Qual atendimento você procura?</h1>
              <input
                className="novo-agendamento-busca"
                placeholder="⌕  Buscar especialidade..."
                aria-label="Buscar especialidade"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
              <div className="novo-agendamento-lista">
                {especialidadesFiltradas.map((item) => (
                  <button className="novo-agendamento-item" key={item.nome} onClick={() => escolherEspecialidade(item)}>
                    <span>{item.icone}</span><span>{item.nome}</span><span className="novo-agendamento-seta">›</span>
                  </button>
                ))}
                {especialidadesFiltradas.length === 0 && <p>Nenhuma especialidade encontrada.</p>}
              </div>
            </>
          )}

          {etapa === 'clinicas' && (
            <>
              <h1>Escolha onde você quer ser atendido</h1>
              <p className="novo-agendamento-subtitulo">3 clínicas demonstrativas na sua região</p>
              <div className="novo-agendamento-clinicas">
                {obterClinicas(especialidade).map((item) => (
                  <article className="novo-agendamento-cartao" key={item.id}>
                    <div className="novo-agendamento-linha"><strong>{item.nome}</strong><small>⭐ {item.nota}</small></div>
                    <p>📍 {item.endereco} · {item.distancia}</p>
                    <p className="novo-agendamento-disponibilidade">{especialidade.nome} &nbsp; ◷ {item.proximoHorario}</p>
                    <button className="novo-agendamento-primario" onClick={() => escolherClinica(item)}>Ver horários</button>
                  </article>
                ))}
              </div>
            </>
          )}

          {etapa === 'profissionais' && (
            <>
              <h1>Escolha o profissional</h1>
              <p className="novo-agendamento-subtitulo">{especialidade.nome} · 3 profissionais demonstrativos</p>
              <div className="novo-agendamento-lista">
                {obterProfissionais(especialidade, clinica).map((item, i) => (
                  <button className="novo-agendamento-profissional" key={item.id} onClick={() => escolherProfissional(item)}>
                    <span className={`novo-agendamento-avatar avatar-${i}`}>{item.iniciais}</span>
                    <span className="novo-agendamento-profissional-info">
                      <strong>{item.nome}</strong>
                      <small>{item.crm}</small>
                      <small>{item.experiencia} anos de experiência</small>
                      <small className="novo-agendamento-disponibilidade">✓ Agenda demonstrativa</small>
                    </span>
                    <span className="novo-agendamento-seta">›</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {etapa === 'data' && (
            <>
              <h1>Escolha a data</h1>
              <p className="novo-agendamento-subtitulo">{nomesMeses[mesVisivel.getMonth()]} de {mesVisivel.getFullYear()}</p>
              <div className="novo-agendamento-calendario">
                <div className="novo-agendamento-meses">
                  <button disabled={mesVisivel <= primeiroMes} onClick={() => alterarMes(-1)} aria-label="Mês anterior">‹</button>
                  <strong>{nomesMeses[mesVisivel.getMonth()]} de {mesVisivel.getFullYear()}</strong>
                  <button disabled={mesVisivel >= ultimoMes} onClick={() => alterarMes(1)} aria-label="Próximo mês">›</button>
                </div>
                <div className="novo-agendamento-grade-dias">
                  {diasSemana.map((dia) => <span className="novo-agendamento-dia-semana" key={dia}>{dia}</span>)}
                  {calendario.map((dia, indice) => {
                    if (dia === null) return <span key={`vazio-${indice}`} />
                    const diaData = new Date(mesVisivel.getFullYear(), mesVisivel.getMonth(), dia)
                    const selecionado = data?.getTime() === diaData.getTime()
                    return (
                      <button key={dia} type="button" disabled={diaData < hoje}
                        className={selecionado ? 'selecionado' : ''}
                        onClick={() => { setData(diaData); setHorario('') }}>
                        {dia}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="novo-agendamento-rodape">
                <button className="novo-agendamento-primario" disabled={!data} onClick={() => setEtapa('horarios')}>Ver horários disponíveis</button>
              </div>
            </>
          )}

          {etapa === 'horarios' && (
            <>
              <h1>Escolha o horário</h1>
              <p className="novo-agendamento-subtitulo">{profissional.nome} · {clinica.nome}</p>
              <div className="novo-agendamento-legenda"><span>🔵 Selecionado</span><span>◯ Disponível</span><span>▫ Indisponível</span></div>
              <div className="novo-agendamento-grade-horarios">
                {horariosDemonstrativos.map((hora) => (
                  <button key={hora} disabled={horariosIndisponiveis.has(hora)}
                    className={horario === hora ? 'selecionado' : ''}
                    onClick={() => setHorario(hora)}>{hora}</button>
                ))}
              </div>
              <div className="novo-agendamento-rodape">
                <button className="novo-agendamento-primario" disabled={!horario} onClick={() => setEtapa('revisao')}>Confirmar horário</button>
              </div>
            </>
          )}

          {etapa === 'revisao' && (
            <>
              <h1>Confira seu agendamento</h1>
              <p className="novo-agendamento-subtitulo">Verifique os dados antes de confirmar.</p>
              <div className="novo-agendamento-resumo">
                {[
                  ['🦴', 'Especialidade', especialidade.nome],
                  ['👨‍⚕️', 'Profissional', profissional.nome],
                  ['🏥', 'Clínica', clinica.nome],
                  ['📍', 'Endereço', clinica.endereco],
                  ['🗓️', 'Data', formatarData(data)],
                  ['⏰', 'Horário', horario],
                ].map(([icone, rotulo, valor]) => (
                  <div className="novo-agendamento-resumo-linha" key={rotulo}>
                    <span>{icone}</span><div><small>{rotulo}</small><strong>{valor}</strong></div>
                  </div>
                ))}
              </div>
              <div className="novo-agendamento-aviso">Este é um agendamento demonstrativo. Nenhuma vaga real será reservada e nenhuma confirmação será enviada por SMS.</div>
              <div className="novo-agendamento-rodape">
                <button className="novo-agendamento-primario" onClick={confirmar}>Confirmar agendamento de demonstração</button>
                <button className="novo-agendamento-secundario" onClick={() => setEtapa('especialidades')}>Alterar dados</button>
              </div>
            </>
          )}

          {etapa === 'sucesso' && consultaCriada && (
            <div className="novo-agendamento-sucesso">
              <div className="novo-agendamento-check">✓</div>
              <h1>Agendamento de demonstração criado!</h1>
              <p>Os dados foram adicionados à sua lista local de agendamentos.</p>
              <div className="novo-agendamento-resumo novo-agendamento-resumo-final">
                {[
                  ['Especialidade', consultaCriada.especialidade],
                  ['Profissional', consultaCriada.nome],
                  ['Clínica', consultaCriada.clinica],
                  ['Data e horário', `${consultaCriada.data} · ${consultaCriada.hora}`],
                ].map(([rotulo, valor]) => <div key={rotulo}><span>{rotulo}</span><strong>{valor}</strong></div>)}
              </div>
              <div className="novo-agendamento-rodape">
                <button className="novo-agendamento-primario" onClick={() => aoVerAgendamento?.(consultaCriada)}>Ver agendamento</button>
                <button className="novo-agendamento-secundario" onClick={aoVoltar}>Voltar ao início</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default NovoAgendamento