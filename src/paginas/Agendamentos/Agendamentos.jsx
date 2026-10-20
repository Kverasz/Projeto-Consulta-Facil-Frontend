import CartaoAtendimento from '../../componentes/CartaoAtendimento/CartaoAtendimento'
import BarraNavegacao from '../../componentes/BarraNavegacao/BarraNavegacao'
import './Agendamentos.css'

function Agendamentos({
  consultas,
  aoIrParaInicio,
  aoVerDetalhes,
}) {
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
        />
      </div>
    </div>
  )
}

export default Agendamentos