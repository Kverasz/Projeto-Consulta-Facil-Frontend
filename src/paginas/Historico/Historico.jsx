
import { useState } from 'react'
import BarraNavegacao from '../../componentes/BarraNavegacao/BarraNavegacao'
import {
  obterDataConsulta,
  obterDataHoraConsulta,
  obterStatusConsulta,
} from '../../servicos/datasConsultas'
import './Historico.css'

const opcoesPeriodo = [
  { valor: 'todos', rotulo: 'Todo o período' },
  { valor: '30', rotulo: 'Últimos 30 dias' },
  { valor: '90', rotulo: 'Últimos 90 dias' },
  { valor: '365', rotulo: 'Últimos 12 meses' },
]

function formatarData(consulta) {
  const data = obterDataConsulta(consulta)

  if (!data) return 'Data não informada'

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(data).replace('.', '')
}

function Historico({
  consultas = [],
  estadoConsultas = 'ok',
  erroConsultas = '',
  aoTentarNovamente,
  aoIrParaInicio,
  aoIrParaAgendamentos,
  aoIrParaPerfil,
}) {
  const [periodo, setPeriodo] = useState('todos')

  const agora = new Date()

  const consultasFiltradas = consultas
    .filter((consulta) => {
      const data = obterDataConsulta(consulta)
      if (!data) return false

      if (periodo === 'todos') return true

      const limite = new Date()
      limite.setHours(0, 0, 0, 0)
      limite.setDate(limite.getDate() - Number(periodo))

      return data >= limite && data <= agora
    })
    .sort((a, b) => {
      const dataA = obterDataHoraConsulta(a)?.getTime() ?? 0
      const dataB = obterDataHoraConsulta(b)?.getTime() ?? 0
      return dataB - dataA
    })

  function navegar(id) {
    if (id === 'inicio') aoIrParaInicio?.()
    if (id === 'agendamentos') aoIrParaAgendamentos?.()
    if (id === 'perfil') aoIrParaPerfil?.()
  }

  return (
    <div className="pagina-fundo">
      <div className="historico">
        <div className="historico-conteudo">
          <header className="historico-cabecalho">
            <h1>Histórico</h1>
            <p>Consultas anteriores</p>
          </header>

          <div className="historico-filtro">
            <span className="historico-filtro-icone">▣</span>

            <label className="historico-filtro-campos">
              <span>Período selecionado</span>
              <select
                value={periodo}
                onChange={(evento) => setPeriodo(evento.target.value)}
                aria-label="Selecionar período do histórico"
              >
                {opcoesPeriodo.map((opcao) => (
                  <option key={opcao.valor} value={opcao.valor}>
                    {opcao.rotulo}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {estadoConsultas === 'carregando' && <p className="historico-estado">Carregando seu histórico...</p>}

          {estadoConsultas === 'erro' && (
            <p className="historico-estado" role="alert">
              {erroConsultas || 'Não foi possível carregar seu histórico.'}{' '}
              <button type="button" className="historico-tentar-novamente" onClick={aoTentarNovamente}>
                Tentar de novo
              </button>
            </p>
          )}

          {estadoConsultas === 'ok' && (
          <section className="historico-lista">
            {consultasFiltradas.length > 0 ? (
              consultasFiltradas.map((consulta) => {
                const status = obterStatusConsulta(consulta)

                const classeStatus =
                  status === 'cancelado'
                    ? 'historico-status-cancelado'
                    : 'historico-status-realizado'

                const rotuloStatus =
                  status === 'cancelado'
                    ? 'Cancelado'
                    : status === 'realizado'
                      ? 'Realizado'
                      : consulta.status || 'Anterior'

                return (
                  <article
                    className="historico-cartao"
                    key={consulta.codigo}
                  >
                    <div className="historico-cartao-icone">
                      {consulta.icone || '🏥'}
                    </div>

                    <div className="historico-cartao-info">
                      <div className="historico-cartao-topo">
                        <h2>{consulta.especialidade}</h2>

                        <span
                          className={`historico-status ${classeStatus}`}
                        >
                          {rotuloStatus}
                        </span>
                      </div>

                      <p>{consulta.nome}</p>

                      <span className="historico-data">
                        📅 {formatarData(consulta)}
                      </span>
                    </div>
                  </article>
                )
              })
            ) : (
              <div className="historico-vazio">
                <span>📅</span>
                <h2>Nenhuma consulta encontrada</h2>
                <p>
                  Não há consultas registradas no período selecionado.
                </p>
              </div>
            )}
          </section>
          )}
        </div>

        <BarraNavegacao
          itemAtivo="historico"
          aoSelecionar={navegar}
        />
      </div>
    </div>
  )
}

export default Historico
