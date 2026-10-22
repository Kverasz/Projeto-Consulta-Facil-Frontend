
import Cabecalho from '../../componentes/Cabecalho/Cabecalho'
import CartaoAcao from '../../componentes/CartaoAcao/CartaoAcao'
import CartaoAtendimento from '../../componentes/CartaoAtendimento/CartaoAtendimento'
import CartaoEspecialidade from '../../componentes/CartaoEspecialidade/CartaoEspecialidade'
import BarraNavegacao from '../../componentes/BarraNavegacao/BarraNavegacao'
import { obterDataHoraConsulta } from '../../servicos/datasConsultas'
import './Inicio.css'

// Textos fixos dos dois atalhos da tela. O resto da tela vem da API.
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

function Inicio({
  usuario,
  consultas = [],
  especialidades = [],
  estadoConsultas = 'ok',
  erroConsultas = '',
  aoTentarNovamente,
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

  // "consultas" já chega só com as que ainda vão acontecer; aqui só pegamos a mais próxima
  const consultasFuturas = [...consultas].sort(
    (a, b) => (obterDataHoraConsulta(a)?.getTime() ?? 0) - (obterDataHoraConsulta(b)?.getTime() ?? 0)
  )

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

            {estadoConsultas === 'carregando' && <p>Carregando seus atendimentos...</p>}

            {estadoConsultas === 'erro' && (
              <p role="alert">
                {erroConsultas || 'Não foi possível carregar seus atendimentos.'}{' '}
                <button type="button" className="inicio-tentar-novamente" onClick={aoTentarNovamente}>
                  Tentar de novo
                </button>
              </p>
            )}

            {estadoConsultas === 'ok' && proximoAtendimento && (
              <CartaoAtendimento
                {...proximoAtendimento}
                aoClicar={() => aoVerDetalhes(proximoAtendimento)}
              />
            )}

            {estadoConsultas === 'ok' && !proximoAtendimento && (
              <p>Você não possui atendimentos futuros agendados.</p>
            )}
          </section>

          {especialidades.length > 0 && (
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
          )}
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
