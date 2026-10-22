import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  buscarHorariosDoProfissional,
  carregarCatalogo,
  especialidadesDoCatalogo,
  horariosLivres,
  mesmaEspecialidade,
  primeiroHorarioLivre,
} from '../../servicos/catalogo'
import { dataCompleta, dataCurta, rotuloProximoHorario } from '../../servicos/datas'
import { dataDeHoje, horaAgora } from '../../servicos/profissional'
import './NovoAgendamento.css'

const nomesMeses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function paraISO(data) {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`
}

function gerarCalendario(ano, mes) {
  const primeiroDia = new Date(ano, mes, 1).getDay()
  const quantidadeDias = new Date(ano, mes + 1, 0).getDate()
  return [...Array(primeiroDia).fill(null), ...Array.from({ length: quantidadeDias }, (_, i) => i + 1)]
}

function iniciais(nome) {
  return nome
    .replace(/^(Dr\.|Dra\.)\s*/, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

// usuario: login do paciente (token) | idPaciente: id do paciente na API
// aoAgendar({ idProfissional, idDisponibilidade }): agenda na API e devolve a consulta criada (ou null)
function NovoAgendamento({
  usuario,
  especialidadeInicial = null,
  aoVoltar,
  aoAgendar,
  aoVerAgendamento,
  aoVerAgendamentos,
}) {
  const [catalogo, setCatalogo] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erroCatalogo, setErroCatalogo] = useState('')

  const [etapa, setEtapa] = useState('especialidades')
  const [busca, setBusca] = useState('')
  const [especialidade, setEspecialidade] = useState(null)
  const [clinica, setClinica] = useState(null)
  const [profissional, setProfissional] = useState(null)
  const [data, setData] = useState(null)
  const [horario, setHorario] = useState(null)
  const [mesVisivel, setMesVisivel] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [enviando, setEnviando] = useState(false)
  const [erroEnvio, setErroEnvio] = useState('')
  const [consultaCriada, setConsultaCriada] = useState(null)
  const [consultaApi, setConsultaApi] = useState(null)
  const [especialidadeAplicada, setEspecialidadeAplicada] = useState(false)

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErroCatalogo('')
    try {
      const dados = await carregarCatalogo(usuario.token)
      if (dados.falhas.includes('profissionais')) {
        throw new Error('Não foi possível carregar os profissionais. Verifique sua conexão e tente de novo.')
      }
      setCatalogo(dados)
    } catch (e) {
      setErroCatalogo(e.message || 'Não foi possível carregar os dados para agendar.')
    } finally {
      setCarregando(false)
    }
  }, [usuario.token])

  useEffect(() => {
    carregar()
  }, [carregar])

  // Veio de um atalho de especialidade na tela inicial: já abre na lista de clínicas
  useEffect(() => {
    if (!catalogo || especialidadeAplicada) return
    setEspecialidadeAplicada(true)
    if (!especialidadeInicial) return
    const encontrada = especialidadesDoCatalogo(catalogo, dataDeHoje(), horaAgora()).find((item) =>
      mesmaEspecialidade(item.nome, especialidadeInicial)
    )
    if (encontrada) {
      setEspecialidade(encontrada)
      setEtapa('clinicas')
    }
  }, [catalogo, especialidadeInicial, especialidadeAplicada])

  const hoje = dataDeHoje()
  const agora = horaAgora()

  const listaEspecialidades = useMemo(
    () => (catalogo ? especialidadesDoCatalogo(catalogo, hoje, agora) : []),
    [catalogo, hoje, agora]
  )

  // Clínicas que têm profissionais da especialidade escolhida
  const clinicasDaEspecialidade = useMemo(() => {
    if (!catalogo || !especialidade) return []
    const profissionais = catalogo.profissionais.filter((p) => mesmaEspecialidade(p.especialidade, especialidade.nome))
    const porClinica = new Map()
    profissionais.forEach((p) => {
      const chave = String(p.idClinica)
      porClinica.set(chave, [...(porClinica.get(chave) ?? []), p])
    })
    return [...porClinica.entries()].map(([chave, lista]) => {
      const cadastro = catalogo.clinicas.find((c) => String(c.id) === chave)
      const primeiro = primeiroHorarioLivre(catalogo.disponibilidades, lista.map((p) => p.id), hoje, agora)
      return {
        id: chave,
        nome: cadastro?.nome ?? lista[0].clinicaNome ?? 'Clínica',
        endereco: cadastro?.endereco ?? '',
        quantidade: lista.length,
        proximoHorario: primeiro ? rotuloProximoHorario(primeiro.data, primeiro.horaInicio, hoje) : '',
      }
    })
  }, [catalogo, especialidade, hoje, agora])

  const profissionaisDaClinica = useMemo(() => {
    if (!catalogo || !especialidade || !clinica) return []
    return catalogo.profissionais
      .filter((p) => mesmaEspecialidade(p.especialidade, especialidade.nome) && String(p.idClinica) === String(clinica.id))
      .map((p) => {
        const livres = horariosLivres(catalogo.disponibilidades, p.id, hoje, agora)
        return { ...p, livres: livres.length, proximo: livres[0] }
      })
  }, [catalogo, especialidade, clinica, hoje, agora])

  const horariosDoProfissional = useMemo(
    () => (catalogo && profissional ? horariosLivres(catalogo.disponibilidades, profissional.id, hoje, agora) : []),
    [catalogo, profissional, hoje, agora]
  )

  const diasComHorario = useMemo(() => new Set(horariosDoProfissional.map((h) => h.data)), [horariosDoProfissional])

  const horariosDoDia = data ? horariosDoProfissional.filter((h) => h.data === paraISO(data)) : []

  const titulos = {
    especialidades: 'Especialidades',
    clinicas: especialidade?.nome,
    profissionais: clinica?.nome,
    data: profissional?.nome,
    horarios: data ? `${data.getDate()} de ${nomesMeses[data.getMonth()]}` : 'Horários',
    revisao: 'Revisar agendamento',
    sucesso: 'Agendamento',
  }

  const etapas = ['especialidades', 'clinicas', 'profissionais', 'data', 'horarios', 'revisao']

  function voltar() {
    if (etapa === 'sucesso') return aoVoltar?.()
    if (etapa === 'clinicas' && especialidadeInicial) return aoVoltar?.()

    const indice = etapas.indexOf(etapa)
    if (indice <= 0) return aoVoltar?.()

    setErroEnvio('')
    setEtapa(etapas[indice - 1])
  }

  function escolherEspecialidade(item) {
    setEspecialidade(item)
    setClinica(null)
    setProfissional(null)
    setData(null)
    setHorario(null)
    setEtapa('clinicas')
  }

  function escolherClinica(item) {
    setClinica(item)
    setProfissional(null)
    setData(null)
    setHorario(null)
    setEtapa('profissionais')
  }

  function escolherProfissional(item) {
    setProfissional(item)
    setData(null)
    setHorario(null)
    setErroEnvio('')
    // Abre o calendário já no mês do primeiro horário livre
    const primeiro = item.proximo?.data
    const base = primeiro ? new Date(`${primeiro}T00:00:00`) : new Date()
    setMesVisivel(new Date(base.getFullYear(), base.getMonth(), 1))
    setEtapa('data')
  }

  function alterarMes(direcao) {
    const proximo = new Date(mesVisivel.getFullYear(), mesVisivel.getMonth() + direcao, 1)
    const atual = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const limite = new Date(atual.getFullYear(), atual.getMonth() + 5, 1)
    if (proximo >= atual && proximo <= limite) setMesVisivel(proximo)
  }

  async function confirmar() {
    if (!especialidade || !clinica || !profissional || !data || !horario || enviando) return

    setEnviando(true)
    setErroEnvio('')
    try {
      // Confere se o horário continua livre antes de reservar
      const atuais = await buscarHorariosDoProfissional(profissional.id, usuario.token)
      const aindaLivre = atuais.some((h) => String(h.id) === String(horario.id) && h.status === 'DISPONIVEL')
      if (!aindaLivre) {
        const erro = new Error('Esse horário acabou de ser reservado por outra pessoa. Escolha outro.')
        erro.horarioPerdido = true
        throw erro
      }

      const criada = await aoAgendar({ idProfissional: profissional.id, idDisponibilidade: horario.id })
      const dataISO = paraISO(data)
      setConsultaApi(criada)
      setConsultaCriada({
        especialidade: especialidade.nome,
        nome: profissional.nome,
        clinica: clinica.nome,
        data: dataCurta(dataISO),
        hora: horario.horaInicio,
      })
      setEtapa('sucesso')
    } catch (e) {
      setErroEnvio(e.message || 'Não foi possível concluir o agendamento.')
      // Horário perdido: atualiza a lista e volta para a escolha de horários
      if (e.horarioPerdido || /reservado|existe mais/i.test(e.message || '')) {
        await carregar()
        setHorario(null)
        setEtapa('horarios')
      }
    } finally {
      setEnviando(false)
    }
  }

  const especialidadesFiltradas = listaEspecialidades.filter((item) =>
    item.nome.toLocaleLowerCase('pt-BR').includes(busca.toLocaleLowerCase('pt-BR').trim())
  )

  const hojeData = new Date(`${hoje}T00:00:00`)
  const primeiroMes = new Date(hojeData.getFullYear(), hojeData.getMonth(), 1)
  const ultimoMes = new Date(hojeData.getFullYear(), hojeData.getMonth() + 5, 1)
  const calendario = gerarCalendario(mesVisivel.getFullYear(), mesVisivel.getMonth())

  const dataISO = data ? paraISO(data) : ''

  return (
    <div className="pagina-fundo">
      <div className="novo-agendamento">
        <header className="novo-agendamento-cabecalho">
          <button type="button" onClick={voltar} aria-label="Voltar">‹</button>
          <strong>{titulos[etapa]}</strong>
          <span />
        </header>

        <main className="novo-agendamento-conteudo">
          {carregando && !catalogo && <p className="novo-agendamento-estado">Carregando clínicas e profissionais...</p>}

          {erroCatalogo && (
            <div className="novo-agendamento-estado novo-agendamento-estado-erro" role="alert">
              <p>{erroCatalogo}</p>
              <button type="button" className="novo-agendamento-secundario" onClick={carregar}>Tentar de novo</button>
            </div>
          )}

          {catalogo && catalogo.falhas.length > 0 && (
            <p className="novo-agendamento-aviso" role="status">
              Alguns dados não carregaram ({catalogo.falhas.join(', ')}). As opções podem estar incompletas.
            </p>
          )}

          {catalogo && etapa === 'especialidades' && (
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
                    <span>{item.icone}</span>
                    <span>{item.nome}</span>
                    <span className="novo-agendamento-seta">›</span>
                  </button>
                ))}
                {especialidadesFiltradas.length === 0 && (
                  <p>{listaEspecialidades.length === 0 ? 'Nenhuma especialidade cadastrada no momento.' : 'Nenhuma especialidade encontrada.'}</p>
                )}
              </div>
            </>
          )}

          {catalogo && etapa === 'clinicas' && especialidade && (
            <>
              <h1>Escolha onde você quer ser atendido</h1>
              <p className="novo-agendamento-subtitulo">
                {clinicasDaEspecialidade.length === 1 ? '1 clínica' : `${clinicasDaEspecialidade.length} clínicas`} com {especialidade.nome}
              </p>
              <div className="novo-agendamento-clinicas">
                {clinicasDaEspecialidade.map((item) => (
                  <article className="novo-agendamento-cartao" key={item.id}>
                    <div className="novo-agendamento-linha"><strong>{item.nome}</strong></div>
                    {item.endereco && <p>📍 {item.endereco}</p>}
                    <p className={item.proximoHorario ? 'novo-agendamento-disponibilidade' : ''}>
                      {especialidade.nome} &nbsp; ◷ {item.proximoHorario || 'Sem horários disponíveis no momento'}
                    </p>
                    <button
                      className="novo-agendamento-primario"
                      disabled={!item.proximoHorario}
                      onClick={() => escolherClinica(item)}
                    >
                      Ver horários
                    </button>
                  </article>
                ))}
                {clinicasDaEspecialidade.length === 0 && <p>Nenhuma clínica atende essa especialidade no momento.</p>}
              </div>
            </>
          )}

          {catalogo && etapa === 'profissionais' && especialidade && clinica && (
            <>
              <h1>Escolha o profissional</h1>
              <p className="novo-agendamento-subtitulo">
                {especialidade.nome} · {profissionaisDaClinica.length === 1 ? '1 profissional' : `${profissionaisDaClinica.length} profissionais`}
              </p>
              <div className="novo-agendamento-lista">
                {profissionaisDaClinica.map((item, i) => (
                  <button
                    className="novo-agendamento-profissional"
                    key={item.id}
                    disabled={item.livres === 0}
                    onClick={() => escolherProfissional(item)}
                  >
                    <span className={`novo-agendamento-avatar avatar-${i % 3}`}>{iniciais(item.nome)}</span>
                    <span className="novo-agendamento-profissional-info">
                      <strong>{item.nome}</strong>
                      {item.crm && <small>{item.crm}</small>}
                      {item.proximo ? (
                        <small className="novo-agendamento-disponibilidade">
                          ✓ Próximo horário: {rotuloProximoHorario(item.proximo.data, item.proximo.horaInicio, hoje)}
                        </small>
                      ) : (
                        <small>Sem horários disponíveis no momento</small>
                      )}
                    </span>
                    <span className="novo-agendamento-seta">›</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {catalogo && etapa === 'data' && profissional && (
            <>
              <h1>Escolha a data</h1>
              <p className="novo-agendamento-subtitulo">{nomesMeses[mesVisivel.getMonth()]} de {mesVisivel.getFullYear()} · só os dias com horário livre podem ser escolhidos</p>
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
                    const diaISO = paraISO(diaData)
                    const selecionado = dataISO === diaISO
                    return (
                      <button
                        key={dia}
                        type="button"
                        disabled={!diasComHorario.has(diaISO)}
                        className={selecionado ? 'selecionado' : ''}
                        onClick={() => { setData(diaData); setHorario(null) }}
                      >
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

          {catalogo && etapa === 'horarios' && profissional && clinica && (
            <>
              <h1>Escolha o horário</h1>
              <p className="novo-agendamento-subtitulo">{profissional.nome} · {clinica.nome}</p>
              <div className="novo-agendamento-legenda"><span>🔵 Selecionado</span><span>◯ Disponível</span></div>
              {erroEnvio && <p className="novo-agendamento-aviso novo-agendamento-aviso-erro" role="alert">{erroEnvio}</p>}
              <div className="novo-agendamento-grade-horarios">
                {horariosDoDia.map((slot) => (
                  <button
                    key={slot.id}
                    className={horario?.id === slot.id ? 'selecionado' : ''}
                    onClick={() => { setHorario(slot); setErroEnvio('') }}
                  >
                    {slot.horaInicio}
                  </button>
                ))}
              </div>
              {horariosDoDia.length === 0 && <p>Não há mais horários livres nesse dia. Volte e escolha outra data.</p>}
              <div className="novo-agendamento-rodape">
                <button className="novo-agendamento-primario" disabled={!horario} onClick={() => setEtapa('revisao')}>Confirmar horário</button>
              </div>
            </>
          )}

          {catalogo && etapa === 'revisao' && especialidade && profissional && clinica && data && horario && (
            <>
              <h1>Confira seu agendamento</h1>
              <p className="novo-agendamento-subtitulo">Verifique os dados antes de confirmar.</p>
              <div className="novo-agendamento-resumo">
                {[
                  [especialidade.icone, 'Especialidade', especialidade.nome],
                  ['👨‍⚕️', 'Profissional', profissional.nome],
                  ['🏥', 'Clínica', clinica.nome],
                  ['📍', 'Endereço', clinica.endereco || 'Não informado'],
                  ['🗓️', 'Data', dataCompleta(dataISO)],
                  ['⏰', 'Horário', horario.horaInicio],
                ].map(([icone, rotulo, valor]) => (
                  <div className="novo-agendamento-resumo-linha" key={rotulo}>
                    <span>{icone}</span><div><small>{rotulo}</small><strong>{valor}</strong></div>
                  </div>
                ))}
              </div>
              <div className="novo-agendamento-aviso">Ao confirmar, o horário é reservado para você e o profissional confirma o atendimento em seguida.</div>
              {erroEnvio && <p className="novo-agendamento-aviso novo-agendamento-aviso-erro" role="alert">{erroEnvio}</p>}
              <div className="novo-agendamento-rodape">
                <button className="novo-agendamento-primario" onClick={confirmar} disabled={enviando}>
                  {enviando ? 'Agendando...' : 'Confirmar agendamento'}
                </button>
                <button className="novo-agendamento-secundario" onClick={() => setEtapa('especialidades')} disabled={enviando}>Alterar dados</button>
              </div>
            </>
          )}

          {etapa === 'sucesso' && consultaCriada && (
            <div className="novo-agendamento-sucesso">
              <div className="novo-agendamento-check">✓</div>
              <h1>Agendamento realizado!</h1>
              <p>Seu horário foi reservado e está aguardando a confirmação do profissional.</p>
              <div className="novo-agendamento-resumo novo-agendamento-resumo-final">
                {[
                  ['Especialidade', consultaCriada.especialidade],
                  ['Profissional', consultaCriada.nome],
                  ['Clínica', consultaCriada.clinica],
                  ['Data e horário', `${consultaCriada.data} · ${consultaCriada.hora}`],
                ].map(([rotulo, valor]) => <div key={rotulo}><span>{rotulo}</span><strong>{valor}</strong></div>)}
              </div>
              <div className="novo-agendamento-rodape">
                <button
                  className="novo-agendamento-primario"
                  onClick={() => (consultaApi ? aoVerAgendamento?.(consultaApi) : aoVerAgendamentos?.())}
                >
                  Ver agendamento
                </button>
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
