// Formatação e validação de campos de formulário

// "81991111111" -> "(81) 99111-1111" (vai formatando enquanto a pessoa digita)
export function formatarTelefone(valor) {
  const n = String(valor ?? '').replace(/\D/g, '').slice(0, 11)
  if (n.length <= 2) return n
  if (n.length <= 6) return `(${n.slice(0, 2)}) ${n.slice(2)}`
  if (n.length <= 10) return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`
  return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`
}

export function telefoneValido(valor) {
  const digitos = String(valor ?? '').replace(/\D/g, '')
  return digitos.length === 10 || digitos.length === 11
}

export function emailValido(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(valor ?? '').trim())
}

// "12345678900" -> "123.456.789-00" (vai formatando enquanto a pessoa digita)
export function formatarCpf(valor) {
  const n = String(valor ?? '').replace(/\D/g, '').slice(0, 11)
  return n
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2')
}

export function cpfValido(valor) {
  return String(valor ?? '').replace(/\D/g, '').length === 11
}
