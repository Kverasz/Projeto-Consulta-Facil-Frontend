import { useState } from 'react'
import BotaoVoltar from '../../componentes/BotaoVoltar/BotaoVoltar'
import './HorariosDisponiveis.css'

// "horarios": horários livres do profissional naquele dia, vindos da API ({ id, horaInicio }).
// "aoConfirmar(horario)": reagenda na API; se falhar, lança um erro com a mensagem para mostrar aqui.
function HorariosDisponiveis({
  consulta,
  dataSelecionada,
  horarios = [],
  aoVoltar,
  aoConfirmar,
}) {
  const [horarioSelecionado, setHorarioSelecionado] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  const dataFormatada = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(dataSelecionada)

  const periodos = [
    { titulo: 'Manhã', lista: horarios.filter((h) => h.horaInicio < '12:00') },
    { titulo: 'Tarde', lista: horarios.filter((h) => h.horaInicio >= '12:00' && h.horaInicio < '18:00') },
    { titulo: 'Noite', lista: horarios.filter((h) => h.horaInicio >= '18:00') },
  ].filter((periodo) => periodo.lista.length > 0)

  async function confirmar() {
    if (!horarioSelecionado || enviando) return
    setEnviando(true)
    setErro('')
    try {
      await aoConfirmar(horarioSelecionado)
    } catch (e) {
      setErro(e.message || 'Não foi possível reagendar. Tente novamente.')
      setEnviando(false)
    }
  }

  return (
    <main className="horarios-pagina">
      <header className="horarios-topo">
        <BotaoVoltar aoClicar={aoVoltar} />
        <h1>Horários disponíveis</h1>
      </header>

      <div className="horarios-consulta">
        <h2>{consulta.nome}</h2>
        <p>{consulta.especialidade}</p>
        <p>📅 {dataFormatada}</p>
      </div>

      {periodos.map((periodo) => (
        <section className="horarios-secao" key={periodo.titulo}>
          <h2>{periodo.titulo}</h2>
          <div className="horarios-grade">
            {periodo.lista.map((horario) => (
              <button
                type="button"
                key={horario.id}
                className={
                  horarioSelecionado?.id === horario.id
                    ? 'horario-opcao horario-opcao-selecionado'
                    : 'horario-opcao'
                }
                aria-pressed={horarioSelecionado?.id === horario.id}
                onClick={() => { setHorarioSelecionado(horario); setErro('') }}
              >
                {horario.horaInicio}
              </button>
            ))}
          </div>
        </section>
      ))}

      {periodos.length === 0 && (
        <p className="horarios-aviso">Não há horários livres nesse dia. Volte e escolha outra data.</p>
      )}

      {erro && <p className="horarios-aviso horarios-aviso-erro" role="alert">{erro}</p>}

      <button
        type="button"
        className="horarios-confirmar"
        disabled={!horarioSelecionado || enviando}
        onClick={confirmar}
      >
        {enviando ? 'Reagendando...' : 'Confirmar reagendamento'}
      </button>
    </main>
  )
}

export default HorariosDisponiveis
