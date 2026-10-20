
const meses = [
  'janeiro', 'fevereiro', 'março', 'abril',
  'maio', 'junho', 'julho', 'agosto',
  'setembro', 'outubro', 'novembro', 'dezembro',
]

export function obterDataConsulta(consulta) {
  if (consulta.dataISO) {
    const data = new Date(`${consulta.dataISO}T00:00:00`)
    return Number.isNaN(data.getTime()) ? null : data
  }

  const texto = consulta.dataCompleta || consulta.data || ''

  const partes = texto.match(
    /^(\d{1,2}) de ([a-zç]+) de (\d{4})$/i
  )

  if (!partes) return null

  const mes = meses.indexOf(partes[2].toLowerCase())
  if (mes === -1) return null

  const data = new Date(Number(partes[3]), mes, Number(partes[1]))

  return Number.isNaN(data.getTime()) ? null : data
}

export function obterDataHoraConsulta(consulta) {
  const data = obterDataConsulta(consulta)
  if (!data) return null

  const [horas, minutos] = (consulta.hora || '00:00')
    .split(':')
    .map(Number)

  data.setHours(horas, minutos, 0, 0)
  return data
}

export function obterStatusConsulta(consulta) {
  return String(consulta.status || '').trim().toLowerCase()
}
