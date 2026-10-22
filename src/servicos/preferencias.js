// Preferências de acessibilidade e lembretes do paciente.
//
// A API não guarda preferências, então ficam salvas neste aparelho (localStorage) e valem também
// antes do login, para quem precisa de letras maiores já na tela de entrada.
//   fonteMaior     -> html[data-fonte="grande"]    (global.css aumenta o tamanho base do texto)
//   altoContraste  -> html[data-contraste="alto"]  (global.css troca as cores)
//   lembreteDias   -> usado nas notificações: avisa quando a consulta está a esse número de dias

const CHAVE = 'consultaFacil:preferencias'

export const PREFERENCIAS_PADRAO = { fonteMaior: false, altoContraste: false, lembreteDias: 1 }

export function lerPreferencias() {
  try {
    const salvas = JSON.parse(localStorage.getItem(CHAVE) || '{}')
    return {
      fonteMaior: salvas.fonteMaior === true,
      altoContraste: salvas.altoContraste === true,
      lembreteDias: [1, 2, 7].includes(Number(salvas.lembreteDias)) ? Number(salvas.lembreteDias) : 1,
    }
  } catch {
    return { ...PREFERENCIAS_PADRAO }
  }
}

export function aplicarPreferencias(preferencias) {
  const raiz = document.documentElement
  if (preferencias.fonteMaior) raiz.setAttribute('data-fonte', 'grande')
  else raiz.removeAttribute('data-fonte')

  if (preferencias.altoContraste) raiz.setAttribute('data-contraste', 'alto')
  else raiz.removeAttribute('data-contraste')
}

// Aplica na hora e guarda. Devolve false se o navegador não permitir guardar (a mudança vale só nesta visita).
export function salvarPreferencias(preferencias) {
  aplicarPreferencias(preferencias)
  try {
    localStorage.setItem(CHAVE, JSON.stringify(preferencias))
    return true
  } catch {
    return false
  }
}
