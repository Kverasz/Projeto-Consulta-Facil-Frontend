import CartaoAtendimento from '../../componentes/CartaoAtendimento/CartaoAtendimento'
import BarraNavegacao from '../../componentes/BarraNavegacao/BarraNavegacao'
import { obterDataHoraConsulta } from '../../servicos/datasConsultas'
import './Agendamentos.css'

function Agendamentos({
  consultas = [],
  estadoConsultas = 'ok',
  erroConsultas = '',
  aoTentarNovamente,
  aoIrParaInicio,
  aoIrParaHistorico,
  aoIrParaPerfil,
  aoVerDetalhes,
}) {
  // Mais próximas primeiro
  const ordenadas = [...consultas].sort(
    (a, b) => (obterDataHoraConsulta(a)?.getTime() ?? 0) - (obterDataHoraConsulta(b)?.getTime() ?? 0)
  )

  return (
    <div className="pagina-fundo">
      <div className="agendamentos">
        <div className="agendamentos-conteudo">
          <header className="agendamentos-cabecalho">
            <h1>Meus agendamentos</h1>
            <p>Próximas consultas</p>
          </header>

          <section className="agendamentos-lista">
            {estadoConsultas === 'carregando' && <p>Carregando seus agendamentos...</p>}

            {estadoConsultas === 'erro' && (
              <p role="alert">
                {erroConsultas || 'Não foi possível carregar seus agendamentos.'}{' '}
                <button type="button" className="agendamentos-tentar-novamente" onClick={aoTentarNovamente}>
                  Tentar de novo
                </button>
              </p>
            )}

            {estadoConsultas === 'ok' && ordenadas.length === 0 && (
              <p>Você não possui consultas agendadas.</p>
            )}

            {estadoConsultas === 'ok' && ordenadas.map((consulta) => (
              <CartaoAtendimento
                key={consulta.codigo}
                {...consulta}
                aoClicar={() => aoVerDetalhes(consulta)}
              />
            ))}
          </section>
        </div>

        <BarraNavegacao
          itemAtivo="agendamentos"
          aoIrParaInicio={aoIrParaInicio}
          aoSelecionar={(id) => {
            if (id === 'historico') aoIrParaHistorico?.()
            if (id === 'perfil') aoIrParaPerfil?.()
  }}
/>
      </div>
    </div>
  )
}

export default Agendamentos