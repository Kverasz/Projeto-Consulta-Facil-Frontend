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

const proximoAtendimento = {
  icone: '🦴',
  nome: 'Dr. Carlos Mendes',
  especialidade: 'Ortopedia',
  clinica: 'Clínica Boa Saúde',
  data: '16 out',
  hora: '09:30',
  status: 'Confirmado',
}

const especialidades = [
  { icone: '❤️', nome: 'Cardiologia' },
  { icone: '🦴', nome: 'Ortopedia' },
  { icone: '👁️', nome: 'Oftalmologia' },
  { icone: '🧠', nome: 'Neurologia' },
  { icone: '🧒', nome: 'Pediatria' },
  { icone: '🔬', nome: 'Dermatologia' },
]

function Inicio() {
  const [menuAberto, setMenuAberto] = useState(false)

  return (
    <div className="pagina-fundo">
      <MenuLateral
        aberto={menuAberto}
        aoFechar={() => setMenuAberto(false)}
        itemAtivo="inicio"
      />

      <div className="inicio">
        <div className="inicio-conteudo">
          <Cabecalho
            nome="Maria"
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
            <CartaoAtendimento {...proximoAtendimento} />
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
