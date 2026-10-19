import { useCallback, useEffect, useMemo, useState } from 'react'
import BarraNavegacao from '../../componentes/BarraNavegacao/BarraNavegacao'
import { itensNavegacaoProfissional as itensNavegacao } from '../../componentes/BarraNavegacao/itensProfissional'
import MenuLateral from '../../componentes/MenuLateral/MenuLateral'
import PainelNotificacoes from '../../componentes/PainelNotificacoes/PainelNotificacoes'
import { gerarNotificacoes } from '../../servicos/notificacoes'
import { carregarPainelProfissional, dataDeHoje, horaAgora } from '../../servicos/profissional'
import './InicioProfissional.css'

// Como cada situação do agendamento aparece na tela
const situacoes = {
  AGENDADO: { rotulo: 'Aguardando', classe: 'aguardando' },
  CONFIRMADO: { rotulo: 'Confirmada', classe: 'confirmada' },
  REALIZADO: { rotulo: 'Realizada', classe: 'realizada' },
  CANCELADO: { rotulo: 'Cancelada', classe: 'cancelada' },
}

function situacaoDe(status) {
  return situacoes[status] ?? { rotulo: status || 'Sem status', classe: 'realizada' }
}

// "2026-10-20" -> "20 out"
function formatarData(data) {
  const [, mes, dia] = data.split('-')
  const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
  return `${Number(dia)} ${meses[Number(mes) - 1]}`
}

function porDataEHora(a, b) {
  return `${a.data} ${a.hora}`.localeCompare(`${b.data} ${b.hora}`)
}

// "Lida ou não lida" não existe na API: fica salvo neste navegador, separado por profissional.
function chaveLidas(idProfissional) {
  return `consultaFacil:notificacoesLidas:${idProfissional}`
}

function lerLidasSalvas(idProfissional) {
  try {
    return new Set(JSON.parse(localStorage.getItem(chaveLidas(idProfissional)) || '[]'))
  } catch {
    return new Set()
  }
}

function InicioProfissional({ usuario, aoSair, aoVerDetalhes, aoNavegar }) {
  const [menuAberto, setMenuAberto] = useState(false)
  const [notificacoesAbertas, setNotificacoesAbertas] = useState(false)
  const [lidas, setLidas] = useState(new Set())
  const [painel, setPainel] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro('')
    try {
      setPainel(await carregarPainelProfissional(usuario))
    } catch (e) {
      setErro(e.message || 'Não foi possível carregar seus dados.')
    } finally {
      setCarregando(false)
    }
  }, [usuario])

  useEffect(() => {
    carregar()
  }, [carregar])

  const idProfissional = painel?.profissional.id

  useEffect(() => {
    if (idProfissional != null) setLidas(lerLidasSalvas(idProfissional))
  }, [idProfissional])

  const notificacoes = useMemo(() => {
    if (!painel) return []
    return gerarNotificacoes(painel, dataDeHoje(), horaAgora()).map((n) => ({ ...n, lida: lidas.has(n.id) }))
  }, [painel, lidas])

  function marcarComoLidas(ids) {
    const novas = new Set([...lidas, ...ids])
    setLidas(novas)
    try {
      localStorage.setItem(chaveLidas(idProfissional), JSON.stringify([...novas]))
    } catch {
      // sem armazenamento disponível: fica lida só enquanto a tela estiver aberta
    }
  }

  const resumo = useMemo(() => {
    if (!painel) return null

    const hoje = dataDeHoje()
    const agora = horaAgora()
    const ativos = painel.agendamentos.filter((a) => a.status !== 'CANCELADO')

    const agendaHoje = ativos.filter((a) => a.data === hoje).sort(porDataEHora)
    const proxima = ativos
      .filter((a) => a.status !== 'REALIZADO' && `${a.data} ${a.hora}` >= `${hoje} ${agora}`)
      .sort(porDataEHora)[0]

    return {
      agendaHoje,
      proxima,
      consultasHoje: agendaHoje.length,
      aguardando: agendaHoje.filter((a) => a.status === 'AGENDADO').length,
      horariosLivres: painel.disponibilidades.filter((d) => d.data === hoje && d.status === 'DISPONIVEL').length,
    }
  }, [painel])

  if (carregando) {
    return <div className="pagina-fundo"><p className="inicio-prof-mensagem">Carregando seus dados...</p></div>
  }

  if (erro) {
    return (
      <div className="pagina-fundo">
        <div className="inicio-prof-mensagem">
          <p>{erro}</p>
          <button type="button" className="inicio-prof-botao-texto" onClick={carregar}>Tentar de novo</button>
          <button type="button" className="inicio-prof-botao-texto" onClick={aoSair}>Sair</button>
        </div>
      </div>
    )
  }

  const { profissional } = painel
  const subtitulo = [profissional.especialidade, profissional.clinica].filter(Boolean).join(' · ')
  const { proxima, agendaHoje } = resumo
  const situacaoProxima = proxima ? situacaoDe(proxima.status) : null
  const temNaoLidas = notificacoes.some((n) => !n.lida)

  return (
    <div className="pagina-fundo">
      {/* No desktop o rodapé some e este menu abre pelo botão ☰ (igual ao do paciente) */}
      <MenuLateral
        itens={itensNavegacao}
        aberto={menuAberto}
        aoFechar={() => setMenuAberto(false)}
        itemAtivo="inicio"
        aoSelecionar={aoNavegar}
      />

      <PainelNotificacoes
        aberto={notificacoesAbertas}
        aoFechar={() => setNotificacoesAbertas(false)}
        notificacoes={notificacoes}
        aoLer={(id) => marcarComoLidas([id])}
        aoLerTodas={() => marcarComoLidas(notificacoes.map((n) => n.id))}
      />

      <div className="inicio-prof">
        <div className="inicio-prof-rolagem">
          <header className="inicio-prof-topo">
            <div className="inicio-prof-topo-linha">
              <div className="inicio-prof-topo-esquerda">
                <button
                  type="button"
                  className="inicio-prof-menu"
                  onClick={() => setMenuAberto(true)}
                  aria-label="Abrir menu"
                >
                  ☰
                </button>
                <div>
                  <p className="inicio-prof-saudacao">Bem-vindo(a)</p>
                  <h1 className="inicio-prof-nome">{profissional.nome}</h1>
                  {subtitulo && <p className="inicio-prof-subtitulo">{subtitulo}</p>}
                </div>
              </div>
              <div className="inicio-prof-topo-acoes">
                <button
                  type="button"
                  className="inicio-prof-sino"
                  aria-label="Notificações"
                  onClick={() => setNotificacoesAbertas(true)}
                >
                  🔔
                  {temNaoLidas && <span className="inicio-prof-sino-ponto" />}
                </button>
                <button type="button" className="inicio-prof-sair" onClick={aoSair}>Sair</button>
              </div>
            </div>

            <div className="inicio-prof-numeros">
              <div className="inicio-prof-numero">
                <strong>{resumo.consultasHoje}</strong>
                <span>Consultas hoje</span>
              </div>
              <div className="inicio-prof-numero">
                <strong>{resumo.horariosLivres}</strong>
                <span>Horários livres</span>
              </div>
              <div className="inicio-prof-numero">
                <strong>{resumo.aguardando}</strong>
                <span>Aguardando</span>
              </div>
            </div>
          </header>

          <div className="inicio-prof-corpo">
            <section className="inicio-prof-proxima">
              <div className="inicio-prof-proxima-topo">
                <h2 className="inicio-prof-secao-titulo">Próxima consulta</h2>
                {proxima && (
                  <span className={`inicio-prof-status inicio-prof-status-${situacaoProxima.classe}`}>
                    {situacaoProxima.rotulo}
                  </span>
                )}
              </div>

              {proxima ? (
                <>
                  <div className="inicio-prof-proxima-info">
                    <span className="inicio-prof-avatar">🧑</span>
                    <div>
                      <p className="inicio-prof-proxima-nome">{proxima.pacienteNome}</p>
                      {(proxima.especialidade || profissional.especialidade) && (
                        <p className="inicio-prof-proxima-especialidade">
                          {proxima.especialidade || profissional.especialidade}
                        </p>
                      )}
                      <p className="inicio-prof-proxima-quando">
                        <span>⏰ {proxima.hora}</span>
                        {proxima.data !== dataDeHoje() && <span>📅 {formatarData(proxima.data)}</span>}
                        {profissional.clinica && <span>🏥 {profissional.clinica}</span>}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="inicio-prof-detalhes"
                    onClick={() => aoVerDetalhes(proxima, profissional)}
                  >
                    Ver detalhes
                  </button>
                </>
              ) : (
                <p className="inicio-prof-vazio">Você não tem consultas futuras agendadas.</p>
              )}
            </section>

            <section className="inicio-prof-agenda">
              <div className="inicio-prof-agenda-topo">
                <h2 className="inicio-prof-secao-titulo">Agenda de hoje</h2>
                <button type="button" className="inicio-prof-link" onClick={() => aoNavegar('agenda')}>
                  Ver agenda completa →
                </button>
              </div>

              {agendaHoje.length === 0 ? (
                <p className="inicio-prof-vazio">Nenhuma consulta para hoje.</p>
              ) : (
                <ul className="inicio-prof-lista">
                  {agendaHoje.map((consulta) => {
                    const situacao = situacaoDe(consulta.status)
                    return (
                      <li key={consulta.id}>
                        <button
                          type="button"
                          className="inicio-prof-item"
                          onClick={() => aoVerDetalhes(consulta, profissional)}
                        >
                          <span className={`inicio-prof-ponto inicio-prof-ponto-${situacao.classe}`} />
                          <span className="inicio-prof-hora">{consulta.hora}</span>
                          <span className="inicio-prof-paciente">{consulta.pacienteNome}</span>
                          <span className={`inicio-prof-status inicio-prof-status-${situacao.classe}`}>
                            {situacao.rotulo}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          </div>
        </div>

        <div className="inicio-prof-rodape">
          <BarraNavegacao itens={itensNavegacao} itemAtivo="inicio" aoSelecionar={aoNavegar} />
        </div>
      </div>
    </div>
  )
}

export default InicioProfissional
