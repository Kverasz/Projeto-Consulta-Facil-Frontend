import { useState } from 'react'
import BotaoVoltar from '../../componentes/BotaoVoltar/BotaoVoltar'
import Botao from '../../componentes/Botao/Botao'
import LinhaInfo from '../../componentes/LinhaInfo/LinhaInfo'
import './Detalhes.css'

// Aviso do topo, de acordo com a situação real do agendamento na API
const avisos = {
  CONFIRMADO: { titulo: 'Consulta confirmada', icone: '✓', classe: '' },
  AGENDADO: { titulo: 'Aguardando confirmação do profissional', icone: '⏳', classe: 'detalhes-confirmacao-aguardando' },
  CANCELADO: { titulo: 'Consulta cancelada', icone: '✕', classe: 'detalhes-confirmacao-cancelada' },
  REALIZADO: { titulo: 'Consulta realizada', icone: '✓', classe: 'detalhes-confirmacao-realizada' },
}

// aoCancelar: cancela na API; se falhar, lança um erro com a mensagem para mostrar aqui.
function Detalhes({ consulta, aoVoltar, aoReagendar, aoCancelar }) {
  // Controla se a caixa "Cancelar agendamento?" está aparecendo ou não.
  const [confirmando, setConfirmando] = useState(false)
  const [cancelando, setCancelando] = useState(false)
  const [erro, setErro] = useState('')

  const aviso = avisos[consulta.statusApi] ?? { titulo: `Consulta ${String(consulta.status || '').toLowerCase()}`, icone: '•', classe: '' }
  // Só dá para reagendar ou cancelar consultas que ainda vão acontecer
  const ativa = consulta.statusApi === 'AGENDADO' || consulta.statusApi === 'CONFIRMADO'

  async function cancelar() {
    setCancelando(true)
    setErro('')
    try {
      await aoCancelar()
    } catch (e) {
      setErro(e.message || 'Não foi possível cancelar. Tente novamente.')
      setCancelando(false)
    }
  }

  return (
    <main className="detalhes">
      <header className="detalhes-topo">
        <BotaoVoltar aoClicar={aoVoltar} />
        <h1 className="detalhes-titulo">Detalhes</h1>
      </header>

      <div className={`detalhes-confirmacao ${aviso.classe}`}>
        <span className="detalhes-confirmacao-icone">{aviso.icone}</span>
        <div>
          <p className="detalhes-confirmacao-titulo">{aviso.titulo}</p>
          <p className="detalhes-confirmacao-codigo">Código: {consulta.codigo}</p>
        </div>
      </div>

      <section className="detalhes-lista">
        <LinhaInfo icone={consulta.icone || '🩺'} rotulo="Especialidade" valor={consulta.especialidade} />
        <LinhaInfo icone="👨‍⚕️" rotulo="Profissional" valor={consulta.nome} />
        {consulta.crm && <LinhaInfo icone="🪪" rotulo="Registro profissional" valor={consulta.crm} />}
        <LinhaInfo icone="🏥" rotulo="Clínica" valor={consulta.clinica || 'Não informada'} />
        <LinhaInfo icone="📍" rotulo="Endereço" valor={consulta.endereco || 'Não informado'} />
        <LinhaInfo icone="📅" rotulo="Data" valor={consulta.dataCompleta} />
        <LinhaInfo icone="⏰" rotulo="Horário" valor={consulta.hora} />
      </section>

      {ativa && (
      <div className="detalhes-acoes">
        {consulta.clinicaAtiva === false || consulta.especialidadeAtiva === false ? (
          <p className="detalhes-erro" role="status">
            {consulta.clinicaAtiva === false ? 'Esta clínica' : 'Esta especialidade'} está indisponível para novos
            agendamentos no momento, por isso não é possível reagendar. Você ainda pode cancelar esta consulta.
          </p>
        ) : (
          <Botao texto="Reagendar" aoClicar={aoReagendar} />
        )}

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
                onClick={() => { setConfirmando(false); setErro('') }}
                disabled={cancelando}
              >
                Não cancelar
              </button>
              <button
                type="button"
                className="detalhes-confirmar-sim"
                onClick={cancelar}
                disabled={cancelando}
              >
                {cancelando ? 'Cancelando...' : 'Sim, cancelar'}
              </button>
            </div>
            {erro && <p className="detalhes-erro" role="alert">{erro}</p>}
          </div>
        )}
      </div>
      )}
    </main>
  )
}

export default Detalhes
