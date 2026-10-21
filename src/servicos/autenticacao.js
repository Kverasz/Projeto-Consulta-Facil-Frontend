// Serviço de autenticação, baseado na documentação da API (/api-docs):
//   POST /auth/login    corpo: { email, senha }, único para PACIENTE, PROFISSIONAL e ADMIN.
//                       Erros: 400, 401 (credenciais inválidas), 403 (usuário inativo), 500.
//   GET  /auth/perfil   dados do usuário autenticado (Bearer JWT).
// A documentação não descreve o corpo da resposta do login. Por isso o código procura o token e o
// perfil em nomes comuns e, se o perfil não vier no login, consulta /auth/perfil.
// Se o back-end usar outros nomes de campo, ajuste só este arquivo.

export const URL_API = 'https://back-end-pi-ihs1.onrender.com'

export const PERFIS = {
  PACIENTE: 'paciente',
  PROFISSIONAL: 'profissional',
  ADMIN: 'admin'
}

// Aceita variações comuns de nome/valor vindas do back-end
function normalizarPerfil(valor) {
  const texto = String(valor || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

  if (texto.includes('pacient')) return PERFIS.PACIENTE
  if (texto.includes('profission') || texto.includes('medic')) return PERFIS.PROFISSIONAL
  if (texto.includes('admin')) return PERFIS.ADMIN
  return null
}

async function lerJson(resposta) {
  try {
    return await resposta.json()
  } catch {
    return {}
  }
}

export async function realizarLogin(email, senha) {
  let resposta
  try {
    resposta = await fetch(`${URL_API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    })
  } catch {
    throw new Error('Não foi possível conectar ao servidor.')
  }

  if (resposta.status === 400) throw new Error('Informe e-mail e senha.')
  if (resposta.status === 401) throw new Error('E-mail ou senha incorretos.')
  if (resposta.status === 403) throw new Error('Esta conta está inativa.')
  if (!resposta.ok) throw new Error('Erro ao entrar. Tente novamente em instantes.')

  const dados = await lerJson(resposta)
  const token = dados.token ?? dados.accessToken ?? dados.access_token ?? dados.jwt ?? null
  const usuarioLogin = dados.usuario ?? dados.user ?? dados
  let perfil = normalizarPerfil(
  usuarioLogin.perfil ??
  usuarioLogin.tipo ??
  usuarioLogin.role ??
  dados.perfil ??
  dados.tipo ??
  dados.role
)
  let usuario = usuarioLogin

  // Perfil não veio na resposta do login: pergunta ao back-end quem é o usuário
  if (!perfil && token) {
    try {
      const respostaPerfil = await fetch(`${URL_API}/auth/perfil`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (respostaPerfil.ok) {
        const dadosPerfil = await lerJson(respostaPerfil)
        usuario = dadosPerfil.usuario ?? dadosPerfil
        perfil = normalizarPerfil(usuario.perfil ?? dadosPerfil.perfil ?? dadosPerfil.tipo ?? dadosPerfil.role)
      }
    } catch {
      // cai no erro abaixo
    }
  }

  if (!perfil) {
    throw new Error('Não foi possível identificar o tipo da sua conta.')
  }

  return { ...usuario, perfil, token }
}
