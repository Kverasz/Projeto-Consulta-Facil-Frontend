
import Cabecalho from '../../componentes/Cabecalho/Cabecalho'
import CartaoAcao from '../../componentes/CartaoAcao/CartaoAcao'
import CartaoAtendimento from '../../componentes/CartaoAtendimento/CartaoAtendimento'
import CartaoEspecialidade from '../../componentes/CartaoEspecialidade/CartaoEspecialidade'
import BarraNavegacao from '../../componentes/BarraNavegacao/BarraNavegacao'
import './Inicio.css'

// Dados de exemplo. Depois isso pode vir de uma API ou do back-end.
const acoes = [
  {
    icone: '🩺',
    titulo: 'Preciso de atendimento',
    descricao: 'Responda algumas perguntas e descubra qual atendimento pode ser mais adequado para você.',
    destaque: true,
  },
  {
    icone: '🔍',
    titulo: 'Já sei o que preciso',
    descricao: 'Encontre uma especialidade, clínica ou profissional.',
    destaque: false,
  },
]

const especialidades = [
  { icone: '❤️', nome: 'Cardiologia' },
  { icone: '🦴', nome: 'Ortopedia' },
  { icone: '👁️', nome: 'Oftalmologia' },
  { icone: '🧠', nome: 'Neurologia' },
  { icone: '🧒', nome: 'Pediatria' },
  { icone: '🔬', nome: 'Dermatologia' },
]

function Inicio({
  usuario,
  consultas = [],
  aoIrParaAgendamentos,
  aoIrParaHistorico,
  aoIrParaPerfil,
  aoAbrirNotificacoes,
  aoPrecisoAtendimento,
  aoJaSeiOQuePreciso,
  aoSelecionarEspecialidade,
  aoVerDetalhes,
}) {

  const nomeCompleto = usuario?.nome ?? usuario?.name ?? usuario?.nomeCompleto ?? ''
  const primeiroNome = nomeCompleto.trim().split(/\s+/)[0] || 'Paciente'

  const consultasFuturas = consultas
    .filter((consulta) => {
      const partes = consulta.dataCompleta?.match(
        /^(\d{1,2}) de ([a-zç]+) de (\d{4})$/i
      )

      if (!partes) return false

      const meses = [
        'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
        'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
      ]

      const mes = meses.indexOf(partes[2].toLowerCase())
      if (mes === -1) return false

      const [horas, minutos] = consulta.hora.split(':').map(Number)
      const dataConsulta = new Date(Number(partes[3]), mes, Number(partes[1]), horas, minutos)

      return dataConsulta >= new Date() && consulta.status !== 'Cancelado'
    })
    .sort((a, b) => {
      const converter = (consulta) => {
        const partes = consulta.dataCompleta.match(/^(\d{1,2}) de ([a-zç]+) de (\d{4})$/i)
        const meses = [
          'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
          'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
        ]
        const [horas, minutos] = consulta.hora.split(':').map(Number)

        return new Date(
          Number(partes[3]),
          meses.indexOf(partes[2].toLowerCase()),
          Number(partes[1]),
          horas,
          minutos
        )
      }

      return converter(a) - converter(b)
    })

  const proximoAtendimento = consultasFuturas[0]

  return (
    <div className="pagina-fundo">
      <div className="inicio">
        <div className="inicio-conteudo">
          
  <Cabecalho
    nome={primeiroNome}
    titulo="Como podemos ajudar você hoje?"
    aoAbrirNotificacoes={aoAbrirNotificacoes}
  />

        <section className="inicio-acoes">
          {acoes.map((acao) => (
            <CartaoAcao
              key={acao.titulo}
              icone={acao.icone}
              titulo={acao.titulo}
              descricao={acao.descricao}
              destaque={acao.destaque}
              aoClicar={
                acao.titulo === 'Preciso de atendimento'
                  ? aoPrecisoAtendimento
                  : acao.titulo === 'Já sei o que preciso'
                    ? aoJaSeiOQuePreciso
                    : undefined
              }
            />
          ))}
        </section>


          <section className="inicio-secao">
            <h2 className="inicio-secao-titulo">Próximo atendimento</h2>

            {proximoAtendimento ? (
              <CartaoAtendimento
                {...proximoAtendimento}
                aoClicar={() => aoVerDetalhes(proximoAtendimento)}
              />
            ) : (
              <p>Você não possui atendimentos futuros agendados.</p>
            )}
          </section>

          <section className="inicio-secao">
            <h2 className="inicio-secao-titulo">Especialidades rápidas</h2>
            <div className="inicio-grade-especialidades">
              {especialidades.map((especialidade) => (
                <div
                  key={especialidade.nome}
                  role="button"
                  tabIndex={0}
                  style={{ cursor: 'pointer' }}
                  onClick={() => aoSelecionarEspecialidade?.(especialidade.nome)}
                  onKeyDown={(evento) => {
                    if (evento.key === 'Enter' || evento.key === ' ') {
                      evento.preventDefault()
                      aoSelecionarEspecialidade?.(especialidade.nome)
                    }
                  }}
  >
    <CartaoEspecialidade
      icone={especialidade.icone}
      nome={especialidade.nome}
    />
  </div>
))}
            </div>
          </section>
        </div>

        <BarraNavegacao
          itemAtivo="inicio"
          aoSelecionar={(id) => {
            if (id === 'agendamentos') aoIrParaAgendamentos?.()
            if (id === 'historico') aoIrParaHistorico?.()
            if (id === 'perfil') aoIrParaPerfil?.()
          }}
        />
      </div>
    </div>
  )
}

export default Inicio
