import { useState } from 'react'
import Cabecalho from '../../componentes/Cabecalho/Cabecalho'
import CartaoAcao from '../../componentes/CartaoAcao/CartaoAcao'
import CartaoAtendimento from '../../componentes/CartaoAtendimento/CartaoAtendimento'
import CartaoEspecialidade from '../../componentes/CartaoEspecialidade/CartaoEspecialidade'
import MenuLateral from '../../componentes/MenuLateral/MenuLateral'
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

function Inicio({ usuario, consultas = [], aoIrParaAgendamentos, aoVerDetalhes }) {
  const [menuAberto, setMenuAberto] = useState(false)

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
      <MenuLateral
        aberto={menuAberto}
        aoFechar={() => setMenuAberto(false)}
        itemAtivo="inicio"
       aoIrParaAgendamentos={aoIrParaAgendamentos}
      />

      <div className="inicio">
        <div className="inicio-conteudo">
          <Cabecalho
            nome={primeiroNome}
            titulo="Como podemos ajudar você hoje?"
            aoAbrirMenu={() => setMenuAberto(true)}
          />

          <section className="inicio-acoes">
            {acoes.map((acao) => (
              <CartaoAcao
                key={acao.titulo}
                icone={acao.icone}
                titulo={acao.titulo}
                descricao={acao.descricao}
                destaque={acao.destaque}
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
                <CartaoEspecialidade
                  key={especialidade.nome}
                  icone={especialidade.icone}
                  nome={especialidade.nome}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Inicio
