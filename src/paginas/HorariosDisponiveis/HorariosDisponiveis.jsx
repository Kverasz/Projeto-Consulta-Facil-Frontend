import { useState } from 'react'
import BotaoVoltar from '../../componentes/BotaoVoltar/BotaoVoltar'
import './HorariosDisponiveis.css'

// Horários fictícios para testar o fluxo.
// Futuramente serão obtidos da API.
const horarios = {
  manha: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30'],
  tarde: ['13:00', '13:30', '14:00', '14:30', '15:00', '15:30'],
}

function HorariosDisponiveis({
  consulta,
  dataSelecionada,
  aoVoltar,
  aoConfirmar,
}) {
  const [horarioSelecionado, setHorarioSelecionado] = useState(null)

  const dataFormatada = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(dataSelecionada)

  function renderizarHorarios(lista) {
    return (
      <div className="horarios-grade">
        {lista.map((horario) => (
          <button
            type="button"
            key={horario}
            className={
              horarioSelecionado === horario
                ? 'horario-opcao horario-opcao-selecionado'
                : 'horario-opcao'
            }
            aria-pressed={horarioSelecionado === horario}
            onClick={() => setHorarioSelecionado(horario)}
          >
            {horario}
          </button>
        ))}
      </div>
    )
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

      <p className="horarios-aviso">
        Horários de demonstração, sujeitos à confirmação.
      </p>

      <section className="horarios-secao">
        <h2>Manhã</h2>
        {renderizarHorarios(horarios.manha)}
      </section>

      <section className="horarios-secao">
        <h2>Tarde</h2>
        {renderizarHorarios(horarios.tarde)}
      </section>

      <button
        type="button"
        className="horarios-confirmar"
        disabled={!horarioSelecionado}
        onClick={() => aoConfirmar(horarioSelecionado)}
      >
        Confirmar reagendamento
      </button>
    </main>
  )
}

export default HorariosDisponiveis