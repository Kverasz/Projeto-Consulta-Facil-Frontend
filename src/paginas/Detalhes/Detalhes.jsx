import { useState } from 'react'
import BotaoVoltar from '../../componentes/BotaoVoltar/BotaoVoltar'
import Botao from '../../componentes/Botao/Botao'
import LinhaInfo from '../../componentes/LinhaInfo/LinhaInfo'
import './Detalhes.css'

function Detalhes({ consulta, aoVoltar, aoReagendar, aoCancelar }) {
  // Controla se a caixa "Cancelar agendamento?" está aparecendo ou não.
  const [confirmando, setConfirmando] = useState(false)

  return (
    <main className="detalhes">
      <header className="detalhes-topo">
        <BotaoVoltar aoClicar={aoVoltar} />
        <h1 className="detalhes-titulo">Detalhes</h1>
      </header>

      <div className="detalhes-confirmacao">
        <span className="detalhes-confirmacao-icone">✓</span>
        <div>
          <p className="detalhes-confirmacao-titulo">Consulta confirmada</p>
          <p className="detalhes-confirmacao-codigo">Código: {consulta.codigo}</p>
        </div>
      </div>

      <section className="detalhes-lista">
        <LinhaInfo icone="🦴" rotulo="Especialidade" valor={consulta.especialidade} />
        <LinhaInfo icone="👨‍⚕️" rotulo="Profissional" valor={consulta.nome} />
        <LinhaInfo icone="🪪" rotulo="CRM" valor={consulta.crm} />
        <LinhaInfo icone="🏥" rotulo="Clínica" valor={consulta.clinica} />
        <LinhaInfo icone="📍" rotulo="Endereço" valor={consulta.endereco} />
        <LinhaInfo icone="📅" rotulo="Data" valor={consulta.dataCompleta} />
        <LinhaInfo icone="⏰" rotulo="Horário" valor={consulta.hora} />
      </section>

      <div className="detalhes-acoes">
        <Botao texto="Reagendar" aoClicar={aoReagendar} />

        {!confirmando && (
          <button
            type="button"
            className="detalhes-cancelar"
            onClick={() => setConfirmando(true)}
          >
            Cancelar agendamento
          </button>
        )}

        {confirmando && (
          <div className="detalhes-confirmar">
            <p className="detalhes-confirmar-titulo">Cancelar agendamento?</p>
            <p className="detalhes-confirmar-texto">Esta ação não pode ser desfeita.</p>

            <div className="detalhes-confirmar-botoes">
              <button
                type="button"
                className="detalhes-confirmar-nao"
                onClick={() => setConfirmando(false)}
              >
                Não cancelar
              </button>
              <button
                type="button"
                className="detalhes-confirmar-sim"
                onClick={aoCancelar}
              >
                Sim, cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default Detalhes
