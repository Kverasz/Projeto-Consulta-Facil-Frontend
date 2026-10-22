import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  baixarArquivo,
  calcularPainelAdmin,
  carregarBaseAdmin,
  gerarRelatorioCsv,
  montarAtividades,
  nomeDoRelatorio,
  periodoPadrao,
} from '../../servicos/admin'
import { paraISO } from '../../servicos/datas'
import MenuAdmin, { BotaoMenuAdmin } from '../../componentes/MenuAdmin/MenuAdmin'
import './InicioAdmin.css'

const ROTULOS_FALHAS = {
  clinicas: 'clínicas',
  profissionais: 'profissionais',
  pacientes: 'pacientes',
  administradores: 'administradores',
  agendamentos: 'agendamentos',
  disponibilidades: 'horários',
}

const numero = (valor) => (valor == null ? '—' : valor.toLocaleString('pt-BR'))

function InicioAdmin({ usuario, aoSair, aoNavegar }) {
  const [base, setBase] = useState(null)
  const [estado, setEstado] = useState('carregando')

  const [modalAberto, setModalAberto] = useState(false)
  const [menuAberto, setMenuAberto] = useState(false)
  const [tipoPeriodo, setTipoPeriodo] = useState('mes')
  const [periodo, setPeriodo] = useState(() => periodoPadrao('mes'))
  const [erroRelatorio, setErroRelatorio] = useState('')

  const carregar = useCallback(async () => {
    setEstado('carregando')
    try {
      const dados = await carregarBaseAdmin(usuario)
      setBase(dados)
      // Se nada carregou, o problema é conexão ou sessão, não "painel vazio"
      setEstado(dados.falhas.length === Object.keys(ROTULOS_FALHAS).length ? 'erro' : 'ok')
    } catch {
      setEstado('erro')
    }
  }, [usuario])

  useEffect(() => {
    carregar()
  }, [carregar])

  const painel = useMemo(() => (base ? calcularPainelAdmin(base) : null), [base])
  const atividades = useMemo(() => (base ? montarAtividades(base) : []), [base])

  const nome = base?.nomeAdmin || usuario?.nome || 'Admin'
  const falhas = base?.falhas ?? []
  const semFalhas = estado === 'ok' && falhas.length === 0

  function abrirModal() {
    setTipoPeriodo('mes')
    setPeriodo(periodoPadrao('mes'))
    setErroRelatorio('')
    setModalAberto(true)
  }

  function escolherPeriodo(tipo) {
    setTipoPeriodo(tipo)
    setErroRelatorio('')
    if (tipo !== 'personalizado') setPeriodo(periodoPadrao(tipo))
  }

  function baixarRelatorio() {
    setErroRelatorio('')

    if (!periodo.inicio || !periodo.fim) return setErroRelatorio('Informe a data inicial e a data final.')
    if (periodo.inicio > periodo.fim) return setErroRelatorio('A data inicial não pode ser depois da data final.')
    if (!base || falhas.includes('agendamentos') || falhas.includes('disponibilidades')) {
      return setErroRelatorio('Não foi possível carregar os agendamentos. Atualize a tela e tente de novo.')
    }

    const { csv, total } = gerarRelatorioCsv(base, periodo.inicio, periodo.fim)
    if (total === 0) return setErroRelatorio('Não há agendamentos nesse período.')

    baixarArquivo(nomeDoRelatorio(periodo.inicio, periodo.fim), csv)
    setModalAberto(false)
  }

  const hoje = paraISO(new Date())
  const cartoes = [
    { icone: '🏥', valor: painel?.totais.clinicas, rotulo: 'Clínicas' },
    { icone: '🧑‍⚕️', valor: painel?.totais.profissionais, rotulo: 'Profissionais' },
    { icone: '🩺', valor: painel?.totais.especialidades, rotulo: 'Especialidades' },
    { icone: '👤', valor: painel?.totais.usuarios, rotulo: 'Usuários' },
  ]
  const resumo = [
    { icone: '📅', valor: painel?.resumoHoje.agendamentos, rotulo: 'Agendamentos hoje' },
    { icone: '✅', valor: painel?.resumoHoje.consultas, rotulo: 'Consultas hoje' },
    { icone: '❌', valor: painel?.resumoHoje.cancelamentos, rotulo: 'Cancelamentos' },
  ]

  return (
    <div className="pagina-fundo">
      <div className="admin">
        <header className="admin-topo">
          <div className="admin-marca">
            <span className="admin-logo" aria-hidden="true">+</span>
            <div>
              <strong>Consulta Fácil</strong>
              <span>Painel administrativo</span>
            </div>
          </div>
          <div className="admin-topo-acoes">
            <button type="button" className="admin-sair" onClick={aoSair}>
              Sair
            </button>
            <BotaoMenuAdmin aoClicar={() => setMenuAberto(true)} />
          </div>
        </header>

        <div className="admin-conteudo">
          <section className="admin-boas-vindas">
            <span>Painel administrativo</span>
            <h1>Bem-vindo, {nome}</h1>
            <p>
              {estado === 'carregando' && 'Carregando os dados da plataforma...'}
              {estado === 'erro' && 'Não foi possível carregar os dados da plataforma.'}
              {semFalhas && 'Plataforma operando normalmente ●'}
              {estado === 'ok' && falhas.length > 0 && 'Alguns dados não puderam ser carregados.'}
            </p>
          </section>

          {estado === 'erro' && (
            <p className="admin-aviso" role="alert">
              Verifique sua conexão ou entre novamente.{' '}
              <button type="button" className="admin-tentar" onClick={carregar}>
                Tentar de novo
              </button>
            </p>
          )}

          {estado === 'ok' && falhas.length > 0 && (
            <p className="admin-aviso" role="alert">
              Sem resposta de: {falhas.map((f) => ROTULOS_FALHAS[f]).join(', ')}. Os números relacionados aparecem
              como "—".{' '}
              <button type="button" className="admin-tentar" onClick={carregar}>
                Atualizar
              </button>
            </p>
          )}

          <section className="admin-cartoes" aria-label="Totais da plataforma">
            {cartoes.map((cartao) => (
              <div className="admin-cartao" key={cartao.rotulo}>
                <span className="admin-cartao-icone" aria-hidden="true">{cartao.icone}</span>
                <strong>{estado === 'carregando' ? '...' : numero(cartao.valor)}</strong>
                <span>{cartao.rotulo}</span>
              </div>
            ))}
          </section>

          <section className="admin-bloco" aria-label="Resumo de hoje">
            <h2 className="admin-titulo-secao">Resumo de hoje</h2>
            <div className="admin-resumo">
              {resumo.map((item) => (
                <div className="admin-resumo-item" key={item.rotulo}>
                  <span aria-hidden="true">{item.icone}</span>
                  <strong>{estado === 'carregando' ? '...' : numero(item.valor)}</strong>
                  <span>{item.rotulo}</span>
                </div>
              ))}
            </div>
          </section>

          <button type="button" className="admin-relatorios" onClick={abrirModal} disabled={estado === 'carregando'}>
            <span className="admin-relatorios-icone" aria-hidden="true">📄</span>
            <span className="admin-relatorios-texto">
              <strong>Relatórios</strong>
              <span>Exporte os dados por período</span>
            </span>
            <span className="admin-relatorios-baixar" aria-hidden="true">⬇</span>
          </button>

          <h2 className="admin-titulo-secao admin-titulo-atividade">Atividade recente</h2>
          {estado === 'ok' && atividades.length === 0 && (
            <p className="admin-vazio">Ainda não há atividade registrada na plataforma.</p>
          )}
          <ul className="admin-atividades">
            {atividades.map((item) => (
              <li className="admin-atividade" key={item.chave}>
                <span className="admin-atividade-icone" aria-hidden="true">{item.icone}</span>
                <span className="admin-atividade-texto">
                  <strong>{item.titulo}</strong>
                  <span>{item.detalhe}</span>
                </span>
                {item.tempo && (
                  <span className="admin-atividade-tempo">
                    {item.tempo}
                    <i className={`admin-ponto admin-ponto-${item.cor}`} aria-hidden="true" />
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <MenuAdmin itemAtivo="inicio" aoNavegar={aoNavegar} menuAberto={menuAberto} aoFecharMenu={() => setMenuAberto(false)} />

        {modalAberto && (
          <div className="admin-modal-fundo" onClick={() => setModalAberto(false)}>
            <section
              className="admin-modal"
              role="dialog"
              aria-modal="true"
              aria-label="Baixar relatório"
              onClick={(evento) => evento.stopPropagation()}
            >
              <div className="admin-modal-indicador" />
              <div className="admin-modal-cabecalho">
                <div>
                  <h2>Baixar relatório</h2>
                  <p>Escolha o período dos dados da plataforma.</p>
                </div>
                <button type="button" className="admin-modal-fechar" onClick={() => setModalAberto(false)} aria-label="Fechar">
                  ×
                </button>
              </div>

              <div className="admin-periodos" role="group" aria-label="Período">
                {[
                  { id: '7', rotulo: '7 dias' },
                  { id: 'mes', rotulo: 'Este mês' },
                  { id: 'personalizado', rotulo: 'Personalizado' },
                ].map((opcao) => (
                  <button
                    type="button"
                    key={opcao.id}
                    className={tipoPeriodo === opcao.id ? 'admin-periodo admin-periodo-ativo' : 'admin-periodo'}
                    aria-pressed={tipoPeriodo === opcao.id}
                    onClick={() => escolherPeriodo(opcao.id)}
                  >
                    {opcao.rotulo}
                  </button>
                ))}
              </div>

              <div className="admin-datas">
                <label>
                  Data inicial
                  <input
                    type="date"
                    value={periodo.inicio}
                    max={periodo.fim || undefined}
                    disabled={tipoPeriodo !== 'personalizado'}
                    onChange={(e) => setPeriodo((p) => ({ ...p, inicio: e.target.value }))}
                  />
                </label>
                <label>
                  Data final
                  <input
                    type="date"
                    value={periodo.fim}
                    min={periodo.inicio || undefined}
                    disabled={tipoPeriodo !== 'personalizado'}
                    onChange={(e) => setPeriodo((p) => ({ ...p, fim: e.target.value }))}
                  />
                </label>
              </div>

              <div className="admin-tipo-relatorio">
                <span className="admin-tipo-relatorio-icone" aria-hidden="true">📄</span>
                <span>
                  <strong>Relatório geral da plataforma</strong>
                  <span>Arquivo CSV compatível com Excel e Planilhas</span>
                </span>
              </div>

              {erroRelatorio && <p className="admin-erro" role="alert">{erroRelatorio}</p>}

              <button type="button" className="admin-baixar" onClick={baixarRelatorio}>
                Baixar relatório
              </button>
              <p className="admin-modal-nota">Inclui os agendamentos com data entre {periodo.inicio ? periodo.inicio.split('-').reverse().join('/') : '...'} e {periodo.fim ? periodo.fim.split('-').reverse().join('/') : '...'} (hoje é {hoje.split('-').reverse().join('/')}).</p>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}

export default InicioAdmin
