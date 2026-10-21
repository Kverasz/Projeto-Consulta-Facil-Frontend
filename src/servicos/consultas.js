
import { URL_API } from './autenticacao'

export async function buscarAgendamentosPaciente(idPaciente, token) {
  if (!Number.isInteger(Number(idPaciente)) || Number(idPaciente) <= 0) {
    throw new Error('ID do paciente inválido.')
  }

  const resposta = await fetch(
    `${URL_API}/agendamentos/paciente/${encodeURIComponent(idPaciente)}`,
    {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  )

  if (!resposta.ok) {
    if (resposta.status === 401) {
      throw new Error('Sua sessão não está autorizada.')
    }

    if (resposta.status === 404) {
      throw new Error('Paciente não encontrado.')
    }

    throw new Error('Não foi possível carregar os agendamentos.')
  }

  return await resposta.json()
}
