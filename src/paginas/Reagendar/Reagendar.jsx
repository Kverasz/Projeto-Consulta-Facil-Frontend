import { useState } from 'react'
import BotaoVoltar from '../../componentes/BotaoVoltar/BotaoVoltar'
import './Reagendar.css'

const diasDaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril',
  'Maio', 'Junho', 'Julho', 'Agosto',
  'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function Reagendar({ consulta, aoVoltar, aoVerHorarios }) {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const [mesAtual, setMesAtual] = useState(
    new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  )

  const [diaEscolhido, setDiaEscolhido] = useState(null)

  const ano = mesAtual.getFullYear()
  const mes = mesAtual.getMonth()

  const primeiroDiaSemana = new Date(ano, mes, 1).getDay()
  const quantidadeDias = new Date(ano, mes + 1, 0).getDate()

  const diasCalendario = [
    ...Array(primeiroDiaSemana).fill(null),
    ...Array.from({ length: quantidadeDias }, (_, i) => i + 1),
  ]

  const semanasDoMes = []

  for (let i = 0; i < diasCalendario.length; i += 7) {
    semanasDoMes.push(diasCalendario.slice(i, i + 7))
  }

  const mesAnteriorBloqueado =
    ano === hoje.getFullYear() && mes === hoje.getMonth()

  function mudarMes(direcao) {
    setMesAtual(new Date(ano, mes + direcao, 1))
    setDiaEscolhido(null)
  }

  function confirmarData() {
    if (!diaEscolhido) return

    const dataSelecionada = new Date(ano, mes, diaEscolhido)

    if (aoVerHorarios) {
      aoVerHorarios(dataSelecionada)
    }
  }

  return (
    <main className="reagendar">
      <header className="reagendar-topo">
        <BotaoVoltar aoClicar={aoVoltar} />
        <h1 className="reagendar-profissional">{consulta.nome}</h1>
      </header>

      <h2 className="reagendar-titulo">Escolha a data</h2>

      <div className="reagendar-navegacao-mes">
        <button
          type="button"
          onClick={() => mudarMes(-1)}
          disabled={mesAnteriorBloqueado}
          aria-label="Mês anterior"
        >
          ‹
        </button>

        <p className="reagendar-subtitulo">
          {meses[mes]} de {ano}
        </p>

        <button
          type="button"
          onClick={() => mudarMes(1)}
          aria-label="Próximo mês"
        >
          ›
        </button>
      </div>

      <table className="reagendar-calendario">
        <thead>
          <tr>
            {diasDaSemana.map((dia) => (
              <th key={dia}>{dia}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {semanasDoMes.map((semana, indice) => (
            <tr key={indice}>
              {semana.map((dia, posicao) => {
                if (dia === null) {
                  return <td key={posicao} />
                }

                const dataDia = new Date(ano, mes, dia)
                const indisponivel = dataDia < hoje
                const selecionado = dia === diaEscolhido

                let classes = 'reagendar-dia'

                if (indisponivel) {
                  classes += ' reagendar-dia-indisponivel'
                }

                if (selecionado) {
                  classes += ' reagendar-dia-selecionado'
                }

                return (
                  <td key={posicao}>
                    <button
                      type="button"
                      className={classes}
                      disabled={indisponivel}
                      aria-pressed={selecionado}
                      onClick={() => setDiaEscolhido(dia)}
                    >
                      {dia}
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <button
        type="button"
        className="reagendar-botao"
        disabled={!diaEscolhido}
        onClick={confirmarData}
      >
        Ver horários disponíveis
      </button>
    </main>
  )
}

export default Reagendar