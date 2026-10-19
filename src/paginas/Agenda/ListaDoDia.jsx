import { montarDia, situacaoDe } from '../../servicos/agenda'
import { dataLonga } from '../../servicos/datas'

// Linha do tempo de um dia: consultas, horários disponíveis e intervalos.
function ListaDoDia({ painel, data, mostrarData, aoAbrirConsulta }) {
  const itens = montarDia(painel, data)
  const { especialidade } = painel.profissional

  return (
    <>
      {mostrarData && <p className="agenda-data-dia">{dataLonga(data)}</p>}

      {itens.length === 0 && <p className="agenda-vazio">Nenhum horário cadastrado para este dia.</p>}

      <ul className="agenda-lista">
        {itens.map((item) => {
          if (item.tipo === 'intervalo') {
            return (
              <li key={item.chave} className="agenda-intervalo">
                <span>{item.hora}</span>
                <span className="agenda-intervalo-linha" />
                <span>Intervalo</span>
              </li>
            )
          }

          if (item.tipo === 'livre') {
            return (
              <li key={item.chave} className="agenda-livre">
                <span className="agenda-hora">{item.hora}</span>
                <span className="agenda-barra agenda-barra-livre" />
                <span className="agenda-livre-texto">Horário disponível</span>
              </li>
            )
          }

          const { consulta } = item
          const situacao = situacaoDe(consulta.status)
          return (
            <li key={item.chave}>
              <button type="button" className="agenda-consulta" onClick={() => aoAbrirConsulta(consulta)}>
                <span className="agenda-hora">{item.hora}</span>
                <span className={`agenda-barra agenda-barra-${situacao.classe}`} />
                <span className="agenda-consulta-info">
                  <span className="agenda-consulta-nome">{consulta.pacienteNome}</span>
                  {(consulta.especialidade || especialidade) && (
                    <span className="agenda-consulta-especialidade">{consulta.especialidade || especialidade}</span>
                  )}
                </span>
                <span className={`agenda-status agenda-status-${situacao.classe}`}>{situacao.rotulo}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </>
  )
}

export default ListaDoDia
