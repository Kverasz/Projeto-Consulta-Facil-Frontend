import { useEffect, useState } from 'react'
import BotaoVoltar from '../../componentes/BotaoVoltar/BotaoVoltar'
import FolhaConfirmacao from '../../componentes/FolhaConfirmacao/FolhaConfirmacao'
import AvisoToast from '../../componentes/AvisoToast/AvisoToast'
import { dataPorExtenso } from '../../servicos/datas'
import {
  buscarStatusAgendamento,
  cancelarAgendamento,
  confirmarAgendamento,
  dataDeHoje
} from '../../servicos/profissional'
import './DetalhesConsulta.css'

// Como cada situação aparece no aviso do topo
const situacoes = {
  CONFIRMADO: { titulo: 'Confirmada', icone: '✓', classe: 'confirmada' },
  AGENDADO: { titulo: 'Aguardando', icone: '○', classe: 'aguardando' },
  REALIZADO: { titulo: 'Realizada', icone: '✓', classe: 'realizada' },
  CANCELADO: { titulo: 'Cancelada', icone: '✕', classe: 'cancelada' },
}

// consulta: um item de painel.agendamentos | profissional: painel.profissional
function DetalhesConsulta({ usuario, consulta, profissional, aoVoltar }) {
  const [status, setStatus] = useState(consulta.status)
  const [folha, setFolha] = useState(null) // 'confirmar', 'cancelar' ou null
  const [enviando, setEnviando] = useState(false)
  const [aviso, setAviso] = useState(null)

  // Mostra já o que veio da lista e confere a situação atual na API
  // (o paciente pode ter cancelado enquanto a lista estava aberta).
  useEffect(() => {
    let ativo = true
    buscarStatusAgendamento(consulta.id, usuario.token)
      .then((atual) => ativo && atual && setStatus(atual))
      .catch(() => {})
    return () => { ativo = false }
  }, [consulta.id, usuario.token])

  // O aviso some sozinho
  useEffect(() => {
    if (!aviso) return
    const tempo = setTimeout(() => setAviso(null), 4000)
    return () => clearTimeout(tempo)
  }, [aviso])

  async function executar(acao, novoStatus, aviso) {
    setEnviando(true)
    try {
      await acao(consulta.id, usuario.token)
      setStatus(novoStatus)
      setAviso({ tipo: 'sucesso', ...aviso })
    } catch (e) {
      setAviso({ tipo: 'erro', titulo: 'Algo deu errado', texto: e.message })
    } finally {
      setEnviando(false)
      setFolha(null)
    }
  }

  const situacao = situacoes[status] ?? { titulo: status || 'Sem status', icone: '○', classe: 'realizada' }
  const podeConfirmar = status === 'AGENDADO'
  const podeCancelar = status === 'AGENDADO' || status === 'CONFIRMADO'
  const especialidade = consulta.especialidade || profissional.especialidade
  const clinica = consulta.clinica || profissional.clinica

  const linhas = [
    { icone: '🩺', rotulo: 'Especialidade', valor: especialidade },
    { icone: '🏥', rotulo: 'Clínica', valor: clinica },
    { icone: '📅', rotulo: 'Data', valor: dataPorExtenso(consulta.data, dataDeHoje()) },
    { icone: '⏰', rotulo: 'Horário', valor: consulta.hora },
  ]

  return (
    <div className="detalhes">
      <AvisoToast aviso={aviso} aoFechar={() => setAviso(null)} />

      <header className="detalhes-topo">
        <div className="detalhes-topo-interno">
          <BotaoVoltar aoClicar={aoVoltar} />
          <h1 className="detalhes-titulo">Detalhes da consulta</h1>
        </div>
      </header>

      <main className="detalhes-conteudo">
        <div className={`detalhes-status detalhes-status-${situacao.classe}`}>
          <span className="detalhes-status-icone">{situacao.icone}</span>
          <div>
            <p className="detalhes-status-titulo">{situacao.titulo}</p>
            <p className="detalhes-status-subtitulo">Status atual da consulta</p>
          </div>
        </div>

        <section className="detalhes-cartao">
          <div className="detalhes-paciente">
            <span className="detalhes-avatar">🧑</span>
            <div>
              <p className="detalhes-paciente-nome">{consulta.pacienteNome}</p>
              <p className="detalhes-paciente-papel">Paciente</p>
            </div>
          </div>

          {linhas.map((linha) => (
            <div key={linha.rotulo} className="detalhes-linha">
              <span className="detalhes-linha-icone">{linha.icone}</span>
              <div>
                <p className="detalhes-linha-rotulo">{linha.rotulo}</p>
                <p className="detalhes-linha-valor">{linha.valor || '—'}</p>
              </div>
            </div>
          ))}
        </section>

        <div className="detalhes-acoes">
          {podeConfirmar && (
            <button type="button" className="detalhes-botao detalhes-botao-principal" onClick={() => setFolha('confirmar')}>
              ✓ Confirmar atendimento
            </button>
          )}
          {podeCancelar && (
            <button type="button" className="detalhes-botao detalhes-botao-secundario" onClick={() => setFolha('cancelar')}>
              Cancelar consulta
            </button>
          )}
        </div>
      </main>

      <FolhaConfirmacao
        aberta={folha === 'confirmar'}
        titulo="Confirmar atendimento?"
        texto={`Confirmar a consulta de ${consulta.pacienteNome} às ${consulta.hora}?`}
        rotuloConfirmar="Confirmar"
        enviando={enviando}
        aoCancelar={() => setFolha(null)}
        aoConfirmar={() =>
          executar(confirmarAgendamento, 'CONFIRMADO', {
            titulo: 'Consulta confirmada!',
            texto: `Atendimento de ${consulta.pacienteNome} confirmado.`
          })
        }
      />

      <FolhaConfirmacao
        aberta={folha === 'cancelar'}
        titulo="Cancelar consulta?"
        texto={`Deseja cancelar a consulta de ${consulta.pacienteNome} às ${consulta.hora}? O paciente será notificado.`}
        rotuloConfirmar="Cancelar consulta"
        perigo
        enviando={enviando}
        aoCancelar={() => setFolha(null)}
        aoConfirmar={() =>
          executar(cancelarAgendamento, 'CANCELADO', {
            titulo: 'Consulta cancelada',
            texto: `A consulta de ${consulta.pacienteNome} foi cancelada.`
          })
        }
      />
    </div>
  )
}

export default DetalhesConsulta
