export const especialidades = [
  ['🏥', 'Clínica Geral'], ['❤️', 'Cardiologia'], ['🔬', 'Dermatologia'],
  ['🦴', 'Ortopedia'], ['🩺', 'Geriatria'], ['🧠', 'Neurologia'],
  ['👁️', 'Oftalmologia'], ['🦷', 'Odontologia'], ['🫁', 'Pneumologia'],
  ['👂', 'Otorrinolaringologia'], ['🦵', 'Reumatologia'],
].map(([icone, nome]) => ({ icone, nome }))

// Dados fictícios exclusivamente para demonstrar o fluxo do protótipo.
const unidades = [
  { id: 'boa-saude', nome: 'Clínica Boa Saúde', endereco: 'Av. Boa Viagem, 1200 - Boa Viagem', distancia: '1,2 km', nota: '4,8' },
  { id: 'ubs-imbiribeira', nome: 'UBS Imbiribeira', endereco: 'Imbiribeira - Recife', distancia: '2,8 km', nota: '4,5' },
  { id: 'centro-medico', nome: 'Centro Médico Recife', endereco: 'R. Setúbal, 445 - Boa Viagem', distancia: '4,1 km', nota: '4,7' },
]

const nomesPorEspecialidade = {
  'Clínica Geral': ['Dra. Marina Oliveira', 'Dr. Felipe Andrade', 'Dra. Renata Souza'],
  Cardiologia: ['Dra. Luciana Ferreira', 'Dr. Rafael Martins', 'Dra. Beatriz Costa'],
  Dermatologia: ['Dra. Camila Rocha', 'Dr. Eduardo Lima', 'Dra. Juliana Alves'],
  Ortopedia: ['Dr. Carlos Mendes', 'Dra. Ana Paula Costa', 'Dr. Roberto Alves'],
  Geriatria: ['Dra. Helena Nogueira', 'Dr. Paulo Ribeiro', 'Dra. Patrícia Melo'],
  Neurologia: ['Dr. André Moreira', 'Dra. Laura Santos', 'Dr. Gustavo Vieira'],
  Oftalmologia: ['Dra. Sofia Almeida', 'Dr. Bruno Castro', 'Dra. Fernanda Dias'],
  Odontologia: ['Dra. Lívia Barbosa', 'Dr. Diego Pereira', 'Dra. Amanda Gomes'],
  Pneumologia: ['Dr. Ricardo Silva', 'Dra. Isabela Torres', 'Dr. Marcelo Lima'],
  Otorrinolaringologia: ['Dra. Tatiana Lopes', 'Dr. Henrique Ramos', 'Dra. Carla Freitas'],
  Reumatologia: ['Dra. Vanessa Monteiro', 'Dr. Daniel Cardoso', 'Dra. Paula Fernandes'],
}

export function obterClinicas(especialidade) {
  return unidades.map((unidade, indice) => ({
    ...unidade,
    especialidade: especialidade.nome,
    proximoHorario: ['Amanhã, 09:30', 'Quinta-feira, 14:00', 'Sexta-feira, 10:30'][indice],
  }))
}

export function obterProfissionais(especialidade, clinica) {
  const nomes = nomesPorEspecialidade[especialidade.nome] || nomesPorEspecialidade['Clínica Geral']
  return nomes.map((nome, indice) => ({
    id: `${clinica.id}-${especialidade.nome}-${indice}`,
    nome,
    crm: especialidade.nome === 'Odontologia' ? `CRO-PE ${12000 + indice * 417}` : `CRM-PE ${24501 + indice * 1677}`,
    experiencia: [12, 8, 20][indice],
    iniciais: nome.replace(/^(Dr\.|Dra\.)\s*/, '').split(' ').slice(0, 2).map(p => p[0]).join(''),
  }))
}

export const horariosDemonstrativos = [
  '07:30', '08:00', '08:30', '09:00', '09:30', '10:00',
  '10:30', '11:00', '14:00', '14:30', '15:00', '15:30',
]
