import { useState } from 'react'
import { celulasDoMes, dataBrasileira, nomeDoMes } from '../../servicos/datas'
import { consultasDoDia, datasComConsulta, situacaoDe } from '../../servicos/agenda'

const LETRAS_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

// Calendário do mês + consultas do dia escolhido.
function CalendarioMes({ painel, hoje, data, aoEscolherData, aoAbrirConsulta }) {
  const [ano, setAno] = useState(Number(data.slice(0, 4)))
  const [mes, setMes] = useState(Number(data.slice(5, 7)) - 1)

  const comConsulta = datasComConsulta(painel)
  const consultas = consultasDoDia(painel, data)

  function mudarMes(passo) {
    const novo = new Date(ano, mes + passo, 1)
    setAno(novo.getFullYear())
    setMes(novo.getMonth())
  }

  function irParaHoje() {
    setAno(Number(hoje.slice(0, 4)))
    setMes(Number(hoje.slice(5, 7)) - 1)
    aoEscolherData(hoje)
  }

  return (
    <>
      <section className="agenda-calendario">
        <div className="agenda-calendario-topo">
          <button type="button" className="agenda-seta" onClick={() => mudarMes(-1)} aria-label="Mês anterior">‹</button>
          <div className="agenda-calendario-titulo">
            <strong>{nomeDoMes(mes)} {ano}</strong>
            <button type="button" className="agenda-hoje" onClick={irParaHoje}>Hoje</button>
          </div>
          <button type="button" className="agenda-seta" onClick={() => mudarMes(1)} aria-label="Próximo mês">›</button>
        </div>

        <div className="agenda-calendario-grade">
          {LETRAS_SEMANA.map((letra, indice) => (
            <span key={indice} className="agenda-calendario-semana">{letra}</span>
          ))}

          {celulasDoMes(ano, mes).map((dia, indice) => {
            if (!dia) return <span key={`v${indice}`} />

            const classes = ['agenda-dia']
            if (dia === data) classes.push('agenda-dia-escolhido')
            if (dia === hoje) classes.push('agenda-dia-hoje')

            return (
              <button key={dia} type="button" className={classes.join(' ')} onClick={() => aoEscolherData(dia)}>
                {Number(dia.slice(8))}
                {comConsulta.has(dia) && <span className="agenda-dia-ponto" />}
              </button>
            )
          })}
        </div>
      </section>

      <h2 className="agenda-secao-titulo">Consultas — {dataBrasileira(data)}</h2>

      {consultas.length === 0 ? (
        <p className="agenda-vazio">Nenhuma consulta neste dia.</p>
      ) : (
        <ul className="agenda-lista">
          {consultas.map((consulta) => {
            const situacao = situacaoDe(consulta.status)
            return (
              <li key={consulta.id}>
                <button type="button" className="agenda-consulta agenda-consulta-compacta" onClick={() => aoAbrirConsulta(consulta)}>
                  <span className={`agenda-barra agenda-barra-${situacao.classe}`} />
                  <span className="agenda-hora agenda-hora-escura">{consulta.hora}</span>
                  <span className="agenda-consulta-nome agenda-consulta-nome-linha">{consulta.pacienteNome}</span>
                  <span className={`agenda-status agenda-status-${situacao.classe}`}>{situacao.rotulo}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}

export default CalendarioMes
