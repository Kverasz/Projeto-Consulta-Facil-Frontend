import { useCallback, useEffect, useMemo, useState } from 'react'
import BotaoVoltar from '../../componentes/BotaoVoltar/BotaoVoltar'
import BarraNavegacao from '../../componentes/BarraNavegacao/BarraNavegacao'
import { itensNavegacaoProfissional } from '../../componentes/BarraNavegacao/itensProfissional'
import MenuLateral from '../../componentes/MenuLateral/MenuLateral'
import FolhaConfirmacao from '../../componentes/FolhaConfirmacao/FolhaConfirmacao'
import AvisoToast from '../../componentes/AvisoToast/AvisoToast'
import { carregarPainelProfissional, dataDeHoje } from '../../servicos/profissional'
import { aplicarAlteracao, excluirBloco, montarBlocos, planejarAlteracao } from '../../servicos/disponibilidade'
import { dataLonga } from '../../servicos/datas'
import FormularioDisponibilidade from './FormularioDisponibilidade'
import './Horarios.css'

const FORMULARIO_NOVO = { data: null, inicio: '08:00', fim: '12:00' }

function Horarios({ usuario, aoNavegar }) {
  const hoje = dataDeHoje()
  const [menuAberto, setMenuAberto] = useState(false)
  const [painel, setPainel] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  // formulario: null (fechado) ou { bloco?: bloco sendo editado, chave: para abrir limpo }
  const [formulario, setFormulario] = useState(null)
  const [formularioVisivel, setFormularioVisivel] = useState(false)
  const [erroFormulario, setErroFormulario] = useState('')
  const [blocoParaExcluir, setBlocoParaExcluir] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [aviso, setAviso] = useState(null)

  const carregar = useCallback(async (silencioso = false) => {
    if (!silencioso) setCarregando(true)
    setErro('')
    try {
      setPainel(await carregarPainelProfissional(usuario))
    } catch (e) {
      setErro(e.message || 'Não foi possível carregar seus horários.')
    } finally {
      setCarregando(false)
    }
  }, [usuario])

  useEffect(() => {
    carregar()
  }, [carregar])

  // O aviso some sozinho
  useEffect(() => {
    if (!aviso) return
    const tempo = setTimeout(() => setAviso(null), 4000)
    return () => clearTimeout(tempo)
  }, [aviso])

  const blocosPorData = useMemo(() => {
    if (!painel) return []
    const grupos = []
    montarBlocos(painel.disponibilidades, hoje).forEach((bloco) => {
      const ultimo = grupos[grupos.length - 1]
      if (ultimo && ultimo.data === bloco.data) ultimo.blocos.push(bloco)
      else grupos.push({ data: bloco.data, blocos: [bloco] })
    })
    return grupos
  }, [painel, hoje])

  function abrirFormulario(bloco) {
    setErroFormulario('')
    setFormulario({ bloco, chave: Date.now() })
    setFormularioVisivel(true)
  }

  function fecharFormulario() {
    setFormularioVisivel(false) // a janela desce; o conteúdo só é trocado na próxima abertura
  }

  async function salvar(valores) {
    if (valores.fim <= valores.inicio) {
      setErroFormulario('O horário de fim precisa ser depois do início.')
      return
    }

    const bloco = formulario.bloco
    const plano = planejarAlteracao(painel.disponibilidades, valores, bloco)
    if (plano.criar.length === 0 && plano.excluir.length === 0) {
      setErroFormulario(bloco ? 'Nenhuma alteração foi feita.' : 'Esses horários já estão cadastrados.')
      return
    }

    setErroFormulario('')
    setEnviando(true)
    const falhas = await aplicarAlteracao(plano, painel.profissional.id, usuario.token)
    await carregar(true)
    setEnviando(false)
    fecharFormulario()

    setAviso(
      falhas > 0
        ? { tipo: 'erro', titulo: 'Salvo só em parte', texto: `${falhas} horário(s) não puderam ser salvos. Confira a lista.` }
        : { tipo: 'sucesso', titulo: bloco ? 'Horário atualizado' : 'Horário adicionado', texto: 'Sua disponibilidade foi salva.' }
    )
  }

  async function excluir() {
    setEnviando(true)
    const falhas = await excluirBloco(blocoParaExcluir, usuario.token)
    await carregar(true)
    setEnviando(false)
    setBlocoParaExcluir(null)

    setAviso(
      falhas > 0
        ? { tipo: 'erro', titulo: 'Não foi possível excluir tudo', texto: `${falhas} horário(s) continuam na lista.` }
        : { tipo: 'sucesso', titulo: 'Horário excluído', texto: 'O horário foi removido da sua agenda.' }
    )
  }

  const bloco = formulario?.bloco
  const valoresIniciais = bloco
    ? { data: bloco.data, inicio: bloco.horaInicio, fim: bloco.horaFim }
    : { ...FORMULARIO_NOVO, data: hoje }

  return (
    <div className="pagina-fundo">
      <AvisoToast aviso={aviso} aoFechar={() => setAviso(null)} />

      <MenuLateral
        itens={itensNavegacaoProfissional}
        aberto={menuAberto}
        aoFechar={() => setMenuAberto(false)}
        itemAtivo="horarios"
        aoSelecionar={aoNavegar}
      />

      <div className="horarios">
        <header className="horarios-topo">
          <BotaoVoltar aoClicar={() => aoNavegar('inicio')} />
          <h1 className="horarios-titulo">Disponibilidade</h1>
          <button type="button" className="horarios-menu" onClick={() => setMenuAberto(true)} aria-label="Abrir menu">☰</button>
          <button type="button" className="horarios-adicionar" onClick={() => abrirFormulario(undefined)} disabled={!painel}>
            + Adicionar
          </button>
        </header>

        <div className="horarios-rolagem">
          <div className="horarios-conteudo">
            {carregando && <p className="horarios-vazio">Carregando seus horários...</p>}

            {erro && (
              <div className="horarios-erro">
                <p>{erro}</p>
                <button type="button" className="horarios-link" onClick={() => carregar()}>Tentar de novo</button>
              </div>
            )}

            {painel && !carregando && !erro && blocosPorData.length === 0 && (
              <p className="horarios-vazio">Você ainda não tem horários disponíveis. Toque em "+ Adicionar" para cadastrar.</p>
            )}

            {painel && !erro && blocosPorData.map((grupo) => (
              <section key={grupo.data} className="horarios-grupo">
                <h2 className="horarios-grupo-titulo">{dataLonga(grupo.data)}</h2>
                <ul className="horarios-lista">
                  {grupo.blocos.map((b) => (
                    <li key={b.chave} className="horarios-bloco">
                      <div className="horarios-bloco-info">
                        <p className="horarios-bloco-horas">{b.horaInicio} — {b.horaFim}</p>
                        {painel.profissional.clinica && (
                          <p className="horarios-bloco-clinica">🏥 {painel.profissional.clinica}</p>
                        )}
                      </div>
                      <button type="button" className="horarios-acao horarios-acao-editar" onClick={() => abrirFormulario(b)}>
                        Editar
                      </button>
                      <button type="button" className="horarios-acao horarios-acao-excluir" onClick={() => setBlocoParaExcluir(b)}>
                        Excluir
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>

        <div className="horarios-rodape">
          <BarraNavegacao itens={itensNavegacaoProfissional} itemAtivo="horarios" aoSelecionar={aoNavegar} />
        </div>
      </div>

      {painel && formulario && (
        <FormularioDisponibilidade
          key={formulario.chave}
          aberta={formularioVisivel}
          titulo={bloco ? 'Editar horário' : 'Adicionar disponibilidade'}
          inicial={valoresIniciais}
          hoje={hoje}
          clinica={painel.profissional.clinica}
          enviando={enviando}
          erro={erroFormulario}
          aoCancelar={fecharFormulario}
          aoSalvar={salvar}
        />
      )}

      <FolhaConfirmacao
        aberta={blocoParaExcluir !== null}
        titulo="Excluir disponibilidade?"
        texto="Este horário será removido da sua agenda. Consultas já agendadas não serão afetadas."
        rotuloConfirmar="Excluir"
        perigo
        enviando={enviando}
        aoCancelar={() => setBlocoParaExcluir(null)}
        aoConfirmar={excluir}
      />
    </div>
  )
}

export default Horarios
