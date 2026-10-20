import { useCallback, useEffect, useState } from 'react'
import BotaoVoltar from '../../componentes/BotaoVoltar/BotaoVoltar'
import BarraNavegacao from '../../componentes/BarraNavegacao/BarraNavegacao'
import { itensNavegacaoProfissional } from '../../componentes/BarraNavegacao/itensProfissional'
import MenuLateral from '../../componentes/MenuLateral/MenuLateral'
import { carregarPainelProfissional, dataDeHoje } from '../../servicos/profissional'
import { consultasDoFiltro, filtrosConsultas, situacaoDe } from '../../servicos/agenda'
import { rotuloDia } from '../../servicos/datas'
import './Consultas.css'

// "Hoje", "Amanhã" ou "14 out" (com o ano, se não for o atual)
function rotuloData(data, hoje) {
  if (!data) return '—'
  const rotulo = rotuloDia(data, hoje)
  const texto = rotulo.charAt(0).toUpperCase() + rotulo.slice(1)
  return data.slice(0, 4) !== hoje.slice(0, 4) && rotulo !== 'hoje' && rotulo !== 'amanhã'
    ? `${texto} ${data.slice(0, 4)}`
    : texto
}

// filtroInicial / aoMudarFiltro: guardam o filtro escolhido, para voltar igual dos detalhes
function Consultas({ usuario, filtroInicial, aoMudarFiltro, aoNavegar, aoVerDetalhes }) {
  const hoje = dataDeHoje()
  const [filtro, setFiltro] = useState(filtroInicial ?? 'hoje')
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
      setErro(e.message || 'Não foi possível carregar suas consultas.')
    } finally {
      setCarregando(false)
    }
  }, [usuario])

  useEffect(() => {
    carregar()
  }, [carregar])

  useEffect(() => {
    aoMudarFiltro(filtro)
  }, [filtro, aoMudarFiltro])

  const consultas = painel ? consultasDoFiltro(painel, filtro, hoje) : []
  const textoVazio = filtrosConsultas.find((f) => f.id === filtro).vazio

  return (
    <div className="pagina-fundo">
      <MenuLateral
        itens={itensNavegacaoProfissional}
        aberto={menuAberto}
        aoFechar={() => setMenuAberto(false)}
        itemAtivo="consultas"
        aoSelecionar={aoNavegar}
      />

      <div className="consultas">
        <header className="consultas-topo">
          <div className="consultas-topo-linha">
            <BotaoVoltar aoClicar={() => aoNavegar('inicio')} />
            <h1 className="consultas-titulo">Consultas</h1>
            <button type="button" className="consultas-menu" onClick={() => setMenuAberto(true)} aria-label="Abrir menu">☰</button>
          </div>

          <div className="consultas-filtros" role="tablist">
            {filtrosConsultas.map((opcao) => (
              <button
                key={opcao.id}
                type="button"
                role="tab"
                aria-selected={filtro === opcao.id}
                className={filtro === opcao.id ? 'consultas-filtro consultas-filtro-ativo' : 'consultas-filtro'}
                onClick={() => setFiltro(opcao.id)}
              >
                {opcao.rotulo}
              </button>
            ))}
          </div>
        </header>

        <div className="consultas-rolagem">
          <div className="consultas-conteudo">
            {carregando && <p className="consultas-vazio">Carregando suas consultas...</p>}

            {erro && (
              <div className="consultas-erro">
                <p>{erro}</p>
                <button type="button" className="consultas-link" onClick={carregar}>Tentar de novo</button>
              </div>
            )}

            {painel && !carregando && !erro && consultas.length === 0 && (
              <p className="consultas-vazio">{textoVazio}</p>
            )}

            {painel && !carregando && !erro && (
              <ul className="consultas-lista">
                {consultas.map((consulta) => {
                  const situacao = situacaoDe(consulta.status)
                  const especialidade = consulta.especialidade || painel.profissional.especialidade
                  const clinica = consulta.clinica || painel.profissional.clinica
                  return (
                    <li key={consulta.id}>
                      <button
                        type="button"
                        className="consultas-cartao"
                        onClick={() => aoVerDetalhes(consulta, painel.profissional)}
                      >
                        <span className="consultas-avatar">🧑</span>
                        <span className="consultas-cartao-corpo">
                          <span className="consultas-cartao-topo">
                            <span className="consultas-nome">{consulta.pacienteNome}</span>
                            <span className={`consultas-status consultas-status-${situacao.classe}`}>{situacao.rotulo}</span>
                          </span>
                          {especialidade && <span className="consultas-especialidade">{especialidade}</span>}
                          <span className="consultas-detalhes">
                            <span>📅 {rotuloData(consulta.data, hoje)}</span>
                            <span>⏰ {consulta.hora || '—'}</span>
                            {clinica && <span className="consultas-clinica">🏥 {clinica}</span>}
                          </span>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="consultas-rodape">
          <BarraNavegacao itens={itensNavegacaoProfissional} itemAtivo="consultas" aoSelecionar={aoNavegar} />
        </div>
      </div>
    </div>
  )
}

export default Consultas
