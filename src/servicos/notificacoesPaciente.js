// Notificações do paciente. A API não tem rota de notificações, então são montadas a partir das
// consultas dele (que vêm da API):
//   - Consulta confirmada: o profissional confirmou uma consulta futura.
//   - Lembrete de consulta: a consulta acontece em até N dias (N vem de Perfil > Configurações).
//   - Consulta cancelada: cancelamentos de consultas recentes ou futuras.
// "Lida ou não lida" não existe na API: fica salvo neste aparelho, separado por paciente.

import { rotuloDia } from './datas'

function dataHora(consulta) {
  if (!consulta.dataISO || !consulta.hora) return null
  const [ano, mes, dia] = consulta.dataISO.split('-').map(Number)
  const [h, m] = consulta.hora.split(':').map(Number)
  return new Date(ano, mes - 1, dia, h, m)
}

function paraISO(data) {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`
}

export function gerarNotificacoesPaciente(consultas, lembreteDias, agora = new Date()) {
  const hoje = paraISO(agora)
  const limite = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + lembreteDias, 23, 59, 59)
  const semana = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() - 7)
  const lista = []

  consultas.forEach((consulta) => {
    const quando = dataHora(consulta)
    if (!quando) return
    const futura = quando >= agora
    const dia = rotuloDia(consulta.dataISO, hoje)
    const resumo = `${consulta.nome} · ${consulta.especialidade}`

    if (consulta.statusApi === 'CANCELADO') {
      if (quando >= semana) {
        lista.push({
          id: `cancelada-${consulta.id}`,
          ordem: quando.getTime(),
          icone: '❌',
          titulo: 'Consulta cancelada',
          texto: `A consulta com ${resumo} de ${dia} às ${consulta.hora} foi cancelada.`,
        })
      }
      return
    }

    if (!futura || consulta.statusApi === 'REALIZADO') return

    if (quando <= limite) {
      lista.push({
        id: `lembrete-${consulta.id}-${consulta.dataISO}-${consulta.hora}`,
        ordem: quando.getTime(),
        icone: '🔔',
        titulo: 'Lembrete de consulta',
        texto: `Você tem consulta ${dia} às ${consulta.hora}: ${resumo}.`,
      })
    }

    if (consulta.statusApi === 'CONFIRMADO') {
      lista.push({
        id: `confirmada-${consulta.id}-${consulta.dataISO}-${consulta.hora}`,
        ordem: quando.getTime() + 1,
        icone: '✅',
        titulo: 'Consulta confirmada',
        texto: `Sua consulta com ${resumo} foi confirmada para ${dia} às ${consulta.hora}.`,
      })
    }
  })

  return lista.sort((a, b) => a.ordem - b.ordem)
}

function chave(idPaciente) {
  return `consultaFacil:notificacoesLidasPaciente:${idPaciente}`
}

export function lerNotificacoesLidas(idPaciente) {
  try {
    return new Set(JSON.parse(localStorage.getItem(chave(idPaciente)) || '[]'))
  } catch {
    return new Set()
  }
}

export function salvarNotificacoesLidas(idPaciente, ids) {
  try {
    localStorage.setItem(chave(idPaciente), JSON.stringify([...ids]))
  } catch {
    // sem armazenamento: vale só enquanto a tela estiver aberta
  }
}
