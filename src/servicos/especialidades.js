// Especialidades cadastradas pelo administrador. Rotas do back end (Bearer JWT):
//   GET  /especialidades        -> [{ id_especialidade, nome, descricao, ativo }]
//   POST /especialidades        corpo { nome, descricao, ativo }  (nome obrigatório, até 100 caracteres;
//                               409 "Especialidade já cadastrada" se o nome já existe)
//   PUT  /especialidades/{id}   corpo { nome, descricao, ativo }  (409 se outro registro já tem o nome)
//   DELETE /especialidades/{id} 409 se houver clínica, profissional ou recomendação vinculados
//                               (o app não exclui: desativa, que é o que esconde a especialidade do paciente)
// Texto vazio em "descricao" é gravado como nulo pelo servidor.

import { URL_API } from './autenticacao'
import { comoLista, enviar } from './profissional'

export const TAMANHO_MAXIMO_NOME = 100

export function lerEspecialidade(item) {
  return {
    id: item.id_especialidade ?? item.id,
    nome: String(item.nome ?? '').trim(),
    descricao: item.descricao ?? '',
    ativo: item.ativo !== false && item.ativo !== 0 && item.ativo !== 'false',
  }
}

// Lista completa (ativas e inativas). Falhas de rede, de sessão ou do servidor são lançadas.
export async function carregarEspecialidades(token) {
  let resposta
  try {
    resposta = await fetch(`${URL_API}/especialidades`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
  } catch {
    throw new Error('Não foi possível conectar ao servidor.')
  }
  if (!resposta.ok) throw new Error('Não foi possível carregar as especialidades.')

  const dados = await resposta.json().catch(() => [])
  if (import.meta.env.DEV) console.debug('[API] /especialidades', dados)
  return comoLista(dados)
    .map(lerEspecialidade)
    .filter((e) => e.id != null && e.nome)
}

// Mapa id -> { id, nome, ativo } para quem só precisa dos nomes (telas do paciente e do profissional).
// Se a consulta falhar, o mapa fica vazio e cada tela usa o nome que veio no próprio profissional.
export async function mapaDeEspecialidades(token) {
  try {
    const lista = await carregarEspecialidades(token)
    return new Map(lista.map((e) => [String(e.id), e]))
  } catch {
    return new Map()
  }
}

// 400 e 409 mostram a mensagem do próprio servidor (ver enviar em profissional.js)
const MENSAGENS = {
  400: 'Confira os dados informados. Algum campo está inválido.',
  401: 'Sua sessão expirou. Entre novamente.',
  403: 'Sua conta não tem permissão para alterar especialidades.',
  404: 'Essa especialidade não existe mais. Atualize a lista.',
  409: 'Já existe uma especialidade com esse nome.',
}

// dados: { id?, nome, descricao, ativo }
export function salvarEspecialidade(dados, token) {
  const editando = dados.id != null
  return enviar(
    editando ? `/especialidades/${dados.id}` : '/especialidades',
    editando ? 'PUT' : 'POST',
    { nome: dados.nome.trim(), descricao: dados.descricao.trim(), ativo: Boolean(dados.ativo) },
    token,
    editando ? 'Não foi possível salvar as alterações.' : 'Não foi possível cadastrar a especialidade.',
    MENSAGENS
  )
}
