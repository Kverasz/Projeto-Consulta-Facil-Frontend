// Clínicas no painel do administrador. Rotas (Bearer JWT), conforme /api-docs:
//   GET  /clinicas            lista
//   POST /clinicas            obrigatórios: nome, cnpj, endereco. Opcionais: telefone, email, horario_funcionamento, ativo
//   PUT  /clinicas/{id}       atualiza (o corpo não está documentado, então enviamos o cadastro completo)
//
// Pontos em que o desenho da tela e a API não coincidem:
//   - Não existe campo "bairro": ele é guardado dentro do endereço, como "Rua, número - Bairro".
//   - Não existe campo "especialidades" na clínica: as da tela são as dos profissionais daquela clínica
//     (GET /profissionais) e só podem ser vistas, não editadas aqui.
//   - Ativar/desativar é um PUT com "ativo". Depois dele a lista é buscada de novo e só confirmamos
//     o sucesso se o servidor realmente mudou o status.
//   - O CNPJ é enviado só com números (o exemplo do Swagger é numérico) e mostrado com máscara.

import { buscar, comoLista, enviar } from './profissional'
import { formatarTelefone } from './formatos'

const SEPARADOR_BAIRRO = ' - '

export function somenteDigitos(valor) {
  return String(valor ?? '').replace(/\D/g, '')
}

// "12345678000190" -> "12.345.678/0001-90" (vai formatando enquanto a pessoa digita)
export function formatarCnpj(valor) {
  const n = somenteDigitos(valor).slice(0, 14)
  return n
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

export function cnpjValido(valor) {
  return somenteDigitos(valor).length === 14
}

function separarEndereco(endereco) {
  const texto = String(endereco ?? '')
  const posicao = texto.lastIndexOf(SEPARADOR_BAIRRO)
  if (posicao === -1) return { rua: texto, bairro: '' }
  return { rua: texto.slice(0, posicao), bairro: texto.slice(posicao + SEPARADOR_BAIRRO.length) }
}

export function juntarEndereco(rua, bairro) {
  const r = rua.trim()
  const b = bairro.trim()
  return b ? `${r}${SEPARADOR_BAIRRO}${b}` : r
}

function nomeEspecialidade(profissional) {
  return (
    profissional.especialidade_nome ??
    profissional.nome_especialidade ??
    (typeof profissional.especialidade === 'string' ? profissional.especialidade : profissional.especialidade?.nome) ??
    null
  )
}

export function lerClinicaAdmin(item, profissionais = []) {
  const id = item.id_clinica ?? item.id
  const { rua, bairro } = separarEndereco(item.endereco)
  const especialidades = [
    ...new Set(
      profissionais
        .filter((p) => String(p.id_clinica ?? p.clinica?.id_clinica) === String(id))
        .map(nomeEspecialidade)
        .filter(Boolean)
    ),
  ]

  return {
    id,
    nome: item.nome ?? '',
    cnpj: somenteDigitos(item.cnpj),
    endereco: rua,
    bairro,
    telefone: item.telefone ?? '',
    email: item.email ?? '',
    horario: item.horario_funcionamento ?? '',
    ativo: item.ativo !== false && item.ativo !== 0 && item.ativo !== 'false',
    especialidades,
    bruto: item,
  }
}

export async function carregarClinicasAdmin(token) {
  const clinicas = comoLista(await buscar('/clinicas', token))
  let profissionais = []
  try {
    profissionais = comoLista(await buscar('/profissionais', token))
  } catch {
    // sem as especialidades, a lista continua funcionando
  }
  return clinicas
    .map((item) => lerClinicaAdmin(item, profissionais))
    .filter((c) => c.id != null)
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
}

const MENSAGENS = {
  400: 'Confira os dados informados. Algum campo está inválido.',
  401: 'Sua sessão expirou. Entre novamente.',
  403: 'Sua conta não tem permissão para alterar clínicas.',
  404: 'Essa clínica não existe mais. Atualize a lista.',
  409: 'Já existe uma clínica com esse CNPJ.',
}

function corpoDaClinica(dados) {
  const corpo = {
    nome: dados.nome.trim(),
    cnpj: somenteDigitos(dados.cnpj),
    endereco: juntarEndereco(dados.endereco, dados.bairro),
    ativo: dados.ativo,
  }
  // Campos opcionais vazios não são enviados (no cadastro) ou são enviados vazios (na edição, para poder limpar)
  if (dados.telefone.trim() || dados.id != null) corpo.telefone = dados.telefone.trim()
  if (dados.email.trim() || dados.id != null) corpo.email = dados.email.trim()
  if (dados.horario.trim() || dados.id != null) corpo.horario_funcionamento = dados.horario.trim()
  return corpo
}

// dados: { id?, nome, cnpj, endereco, bairro, telefone, email, horario, ativo }
export function salvarClinica(dados, token) {
  const editando = dados.id != null
  return enviar(
    editando ? `/clinicas/${dados.id}` : '/clinicas',
    editando ? 'PUT' : 'POST',
    corpoDaClinica(dados),
    token,
    editando ? 'Não foi possível salvar as alterações.' : 'Não foi possível cadastrar a clínica.',
    MENSAGENS
  )
}

// Ativa ou desativa e confere no servidor se o status realmente mudou.
export async function alterarStatusClinica(clinica, ativo, token) {
  await enviar(
    `/clinicas/${clinica.id}`,
    'PUT',
    corpoDaClinica({ ...clinica, endereco: clinica.endereco, ativo }),
    token,
    ativo ? 'Não foi possível ativar a clínica.' : 'Não foi possível desativar a clínica.',
    MENSAGENS
  )

  const atualizada = (await carregarClinicasAdmin(token)).find((c) => String(c.id) === String(clinica.id))
  if (!atualizada || atualizada.ativo !== ativo) {
    throw new Error('O servidor não aplicou a mudança de status. Atualize a lista e tente de novo.')
  }
}

export { formatarTelefone }
