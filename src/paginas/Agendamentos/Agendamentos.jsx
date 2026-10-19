import CartaoAtendimento from '../../componentes/CartaoAtendimento/CartaoAtendimento'
import BarraNavegacao from '../../componentes/BarraNavegacao/BarraNavegacao'
import './Agendamentos.css'

// Dados de exemplo.
// Depois isso pode vir de uma API ou do back-end.
const consultas = [
  {
    icone: '🦴',
    nome: 'Dr. Carlos Mendes',
    especialidade: 'Ortopedia',
    clinica: 'Clínica Boa Saúde',
    data: '16 out 2026',
    hora: '09:30',
    status: 'Confirmado',
  },
  {
    icone: '❤️',
    nome: 'Dra. Luciana Ferreira',
    especialidade: 'Cardiologia',
    clinica: 'Centro Médico Recife',
    data: '28 out 2026',
    hora: '14:00',
    status: 'Aguardando',
  },
]

function Agendamentos({ aoIrParaInicio }) {
  return (
    <div className="pagina-fundo">
      <div className="agendamentos">
        <div className="agendamentos-conteudo">
          <header className="agendamentos-cabecalho">
            <h1>Meus agendamentos</h1>
            <p>Próximas consultas</p>
          </header>

          <section className="agendamentos-lista">
            {consultas.map((consulta) => (
              <CartaoAtendimento
                key={consulta.nome}
                {...consulta}
              />
            ))}
          </section>
        </div>

        <BarraNavegacao
          itemAtivo="agendamentos"
          aoIrParaInicio={aoIrParaInicio}
        />
      </div>
    </div>
  )
}

export default Agendamentos