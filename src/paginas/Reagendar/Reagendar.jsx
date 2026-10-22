import { useCallback, useEffect, useMemo, useState } from 'react'
import BotaoVoltar from '../../componentes/BotaoVoltar/BotaoVoltar'
import { buscarHorariosDoProfissional, horariosLivres } from '../../servicos/catalogo'
import { dataDeHoje, horaAgora } from '../../servicos/profissional'
import './Reagendar.css'

const diasDaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril',
  'Maio', 'Junho', 'Julho', 'Agosto',
  'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function paraISO(data) {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`
}

// Só os dias em que o MESMO profissional da consulta tem horário livre podem ser escolhidos.
function Reagendar({ usuario, consulta, aoVoltar, aoVerHorarios }) {
  const [disponibilidades, setDisponibilidades] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const [mesAtual, setMesAtual] = useState(
    new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  )

  const [diaEscolhido, setDiaEscolhido] = useState(null)

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro('')
    try {
      setDisponibilidades(await buscarHorariosDoProfissional(consulta.idProfissional, usuario.token))
    } catch {
      setErro('Não foi possível carregar os horários do profissional.')
    } finally {
      setCarregando(false)
    }
  }, [consulta.idProfissional, usuario.token])

  useEffect(() => {
    carregar()
  }, [carregar])

  const livres = useMemo(
    () => horariosLivres(disponibilidades, consulta.idProfissional, dataDeHoje(), horaAgora()),
    [disponibilidades, consulta.idProfissional]
  )
  const diasComHorario = useMemo(() => new Set(livres.map((h) => h.data)), [livres])

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
      aoVerHorarios(dataSelecionada, livres.filter((h) => h.data === paraISO(dataSelecionada)))
    }
  }

  return (
    <main className="reagendar">
      <header className="reagendar-topo">
        <BotaoVoltar aoClicar={aoVoltar} />
        <h1 className="reagendar-profissional">{consulta.nome}</h1>
      </header>

      <h2 className="reagendar-titulo">Escolha a data</h2>

      {carregando && <p className="reagendar-aviso">Carregando horários de {consulta.nome}...</p>}
      {erro && (
        <p className="reagendar-aviso reagendar-aviso-erro" role="alert">
          {erro} <button type="button" onClick={carregar}>Tentar de novo</button>
        </p>
      )}
      {!carregando && !erro && livres.length === 0 && (
        <p className="reagendar-aviso">Este profissional não tem horários livres no momento.</p>
      )}
      {!carregando && !erro && livres.length > 0 && (
        <p className="reagendar-aviso">Só os dias com horário livre podem ser escolhidos.</p>
      )}

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
                const indisponivel = dataDia < hoje || !diasComHorario.has(paraISO(dataDia))
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
        disabled={!diaEscolhido || carregando}
        onClick={confirmarData}
      >
        Ver horários disponíveis
      </button>
    </main>
  )
}

export default Reagendar