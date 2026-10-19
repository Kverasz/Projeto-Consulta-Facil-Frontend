import { useCallback, useEffect, useState } from 'react'
import BotaoVoltar from '../../componentes/BotaoVoltar/BotaoVoltar'
import BarraNavegacao from '../../componentes/BarraNavegacao/BarraNavegacao'
import { itensNavegacaoProfissional } from '../../componentes/BarraNavegacao/itensProfissional'
import MenuLateral from '../../componentes/MenuLateral/MenuLateral'
import { carregarPainelProfissional, dataDeHoje } from '../../servicos/profissional'
import { datasComAgenda } from '../../servicos/agenda'
import { diaDaSemanaCurto, segundaDaSemana, somarDias } from '../../servicos/datas'
import ListaDoDia from './ListaDoDia'
import CalendarioMes from './CalendarioMes'
import './Agenda.css'

const visoes = [
  { id: 'dia', rotulo: 'Dia' },
  { id: 'semana', rotulo: 'Semana' },
  { id: 'mes', rotulo: 'Mês' },
]

// Seg a Sex da semana; sábado e domingo entram só se tiverem agenda ou forem o dia escolhido
function diasDaSemana(data, comAgenda) {
  const segunda = segundaDaSemana(data)
  return [0, 1, 2, 3, 4, 5, 6]
    .map((n) => somarDias(segunda, n))
    .filter((dia, indice) => indice < 5 || dia === data || comAgenda.has(dia))
}

// filtroInicial / aoMudarFiltro: guardam a aba e o dia escolhidos, para voltar igual dos detalhes
function Agenda({ usuario, filtroInicial, aoMudarFiltro, aoNavegar, aoVerDetalhes }) {
  const hoje = dataDeHoje()
  const [visao, setVisao] = useState(filtroInicial?.visao ?? 'dia')
  const [data, setData] = useState(filtroInicial?.data ?? hoje)
  const [menuAberto, setMenuAberto] = useState(false)
  const [painel, setPainel] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro('')
    try {
      setPainel(await carregarPainelProfissional(usuario))
    } catch (e) {
      setErro(e.message || 'Não foi possível carregar sua agenda.')
    } finally {
      setCarregando(false)
    }
  }, [usuario])

  useEffect(() => {
    carregar()
  }, [carregar])

  useEffect(() => {
    aoMudarFiltro({ visao, data })
  }, [visao, data, aoMudarFiltro])

  const abrirConsulta = (consulta) => aoVerDetalhes(consulta, painel.profissional)

  return (
    <div className="pagina-fundo">
      <MenuLateral
        itens={itensNavegacaoProfissional}
        aberto={menuAberto}
        aoFechar={() => setMenuAberto(false)}
        itemAtivo="agenda"
        aoSelecionar={aoNavegar}
      />

      <div className="agenda">
        <header className="agenda-topo">
          <div className="agenda-topo-linha">
            <BotaoVoltar aoClicar={() => aoNavegar('inicio')} />
            <h1 className="agenda-titulo">Minha Agenda</h1>
            <button type="button" className="agenda-menu" onClick={() => setMenuAberto(true)} aria-label="Abrir menu">☰</button>
          </div>

          <div className="agenda-abas" role="tablist">
            {visoes.map((opcao) => (
              <button
                key={opcao.id}
                type="button"
                role="tab"
                aria-selected={visao === opcao.id}
                className={visao === opcao.id ? 'agenda-aba agenda-aba-ativa' : 'agenda-aba'}
                onClick={() => setVisao(opcao.id)}
              >
                {opcao.rotulo}
              </button>
            ))}
          </div>
        </header>

        <div className="agenda-rolagem">
          <div className="agenda-conteudo">
            {carregando && <p className="agenda-vazio">Carregando sua agenda...</p>}

            {erro && (
              <div className="agenda-erro">
                <p>{erro}</p>
                <button type="button" className="agenda-link" onClick={carregar}>Tentar de novo</button>
              </div>
            )}

            {painel && !carregando && !erro && (
              <>
                {visao === 'semana' && (
                  <div className="agenda-semana">
                    {diasDaSemana(data, datasComAgenda(painel)).map((dia) => (
                      <button
                        key={dia}
                        type="button"
                        className={dia === data ? 'agenda-semana-dia agenda-semana-dia-ativo' : 'agenda-semana-dia'}
                        onClick={() => setData(dia)}
                      >
                        <span>{diaDaSemanaCurto(dia)}</span>
                        <strong>{Number(dia.slice(8))}</strong>
                      </button>
                    ))}
                  </div>
                )}

                {visao !== 'mes' && (
                  <ListaDoDia
                    painel={painel}
                    data={data}
                    mostrarData={visao === 'dia'}
                    aoAbrirConsulta={abrirConsulta}
                  />
                )}

                {visao === 'mes' && (
                  <CalendarioMes
                    painel={painel}
                    hoje={hoje}
                    data={data}
                    aoEscolherData={setData}
                    aoAbrirConsulta={abrirConsulta}
                  />
                )}
              </>
            )}
          </div>
        </div>

        <div className="agenda-rodape">
          <BarraNavegacao itens={itensNavegacaoProfissional} itemAtivo="agenda" aoSelecionar={aoNavegar} />
        </div>
      </div>
    </div>
  )
}

export default Agenda
