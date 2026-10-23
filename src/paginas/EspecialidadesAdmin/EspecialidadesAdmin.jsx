import { useCallback, useEffect, useRef, useState } from 'react'
import AvisoToast from '../../componentes/AvisoToast/AvisoToast'
import BotaoVoltar from '../../componentes/BotaoVoltar/BotaoVoltar'
import MenuAdmin, { BotaoMenuAdmin } from '../../componentes/MenuAdmin/MenuAdmin'
import { TAMANHO_MAXIMO_NOME, carregarEspecialidades, salvarEspecialidade } from '../../servicos/especialidades'
import '../ClinicasAdmin/ClinicasAdmin.css'
import './EspecialidadesAdmin.css'

const FORMULARIO_VAZIO = { id: null, nome: '', descricao: '', ativo: true }

// Ativas primeiro, cada grupo em ordem alfabética
function ordenar(lista) {
  return [...lista].sort((a, b) => Number(b.ativo) - Number(a.ativo) || a.nome.localeCompare(b.nome, 'pt-BR'))
}

function EspecialidadesAdmin({ usuario, aoNavegar }) {
  const token = usuario?.token
  const [menuAberto, setMenuAberto] = useState(false)

  const [lista, setLista] = useState([])
  const [estado, setEstado] = useState('carregando')
  const [aviso, setAviso] = useState(null)
  const relogio = useRef(null)

  const [formulario, setFormulario] = useState(null)
  const [erros, setErros] = useState({})
  const [erroEnvio, setErroEnvio] = useState('')
  const [salvando, setSalvando] = useState(false)

  const carregar = useCallback(async () => {
    setEstado('carregando')
    try {
      setLista(ordenar(await carregarEspecialidades(token)))
      setEstado('ok')
    } catch {
      setEstado('erro')
    }
  }, [token])

  useEffect(() => {
    carregar()
  }, [carregar])

  function mostrar(tipo, titulo, texto) {
    setAviso({ tipo, titulo, texto })
    window.clearTimeout(relogio.current)
    relogio.current = window.setTimeout(() => setAviso(null), 4500)
  }

  function abrirCadastro() {
    setFormulario({ ...FORMULARIO_VAZIO })
    setErros({})
    setErroEnvio('')
  }

  function abrirEdicao(item) {
    setFormulario({ id: item.id, nome: item.nome, descricao: item.descricao, ativo: item.ativo })
    setErros({})
    setErroEnvio('')
  }

  function alterarCampo(campo, valor) {
    setFormulario((f) => ({ ...f, [campo]: valor }))
    if (erros[campo]) setErros((e) => ({ ...e, [campo]: undefined }))
  }

  async function enviarFormulario(evento) {
    evento.preventDefault()
    const encontrados = {}
    if (formulario.nome.trim().length < 2) encontrados.nome = 'Informe o nome da especialidade.'
    const repetido = lista.some(
      (e) => e.id !== formulario.id && e.nome.toLowerCase() === formulario.nome.trim().toLowerCase()
    )
    if (repetido) encontrados.nome = 'Já existe uma especialidade com esse nome.'
    setErros(encontrados)
    if (Object.keys(encontrados).length > 0) return

    const editando = formulario.id != null
    const original = lista.find((e) => e.id === formulario.id)

    setSalvando(true)
    setErroEnvio('')
    try {
      await salvarEspecialidade(formulario, token)
      const atualizada = await carregarEspecialidades(token)
      setLista(ordenar(atualizada))
      setFormulario(null)

      // Só dizemos que o status mudou se o servidor realmente aplicou
      if (editando && original && original.ativo !== formulario.ativo) {
        const atual = atualizada.find((e) => e.id === formulario.id)
        if (!atual || atual.ativo !== formulario.ativo) {
          mostrar('erro', 'Dados salvos, mas o status não mudou', 'O servidor não aplicou a mudança de Ativo/Inativo.')
          return
        }
      }
      mostrar('sucesso', editando ? 'Especialidade atualizada' : 'Especialidade cadastrada', `${formulario.nome.trim()} foi salva com sucesso.`)
    } catch (e) {
      setErroEnvio(e.message)
    } finally {
      setSalvando(false)
    }
  }

  if (formulario) {
    const editando = formulario.id != null
    return (
      <div className="pagina-fundo">
        <div className="clinicas">
          <header className="clinicas-topo">
            <BotaoVoltar aoClicar={() => !salvando && setFormulario(null)} />
            <h1>{editando ? 'Editar Especialidade' : 'Cadastrar Especialidade'}</h1>
          </header>

          <form className="clinicas-conteudo clinicas-formulario" onSubmit={enviarFormulario} noValidate>
            <label className="clinicas-campo">
              Nome da especialidade
              <input
                value={formulario.nome}
                placeholder="Ex: Reumatologia"
                autoComplete="off"
                maxLength={TAMANHO_MAXIMO_NOME}
                aria-invalid={Boolean(erros.nome)}
                onChange={(e) => alterarCampo('nome', e.target.value)}
              />
              {erros.nome && <small role="alert">{erros.nome}</small>}
            </label>

            <label className="clinicas-campo">
              Descrição
              <textarea
                className="especialidades-descricao"
                rows={3}
                value={formulario.descricao}
                placeholder="Breve descrição da especialidade..."
                onChange={(e) => alterarCampo('descricao', e.target.value)}
              />
            </label>

            <label className="clinicas-campo">
              Status
              <select value={formulario.ativo ? 'ativo' : 'inativo'} onChange={(e) => alterarCampo('ativo', e.target.value === 'ativo')}>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
              {!formulario.ativo && (
                <small className="equipe-dica">
                  Especialidade inativa não aparece para escolha no cadastro de profissionais nem no agendamento dos pacientes.
                </small>
              )}
            </label>

            {erroEnvio && <p className="clinicas-erro-envio" role="alert">{erroEnvio}</p>}

            <button type="submit" className="clinicas-botao-principal" disabled={salvando}>
              {salvando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Salvar especialidade'}
            </button>
            <button type="button" className="clinicas-botao-secundario" onClick={() => setFormulario(null)} disabled={salvando}>
              Cancelar
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="pagina-fundo">
      <AvisoToast aviso={aviso} aoFechar={() => setAviso(null)} />

      <div className="clinicas">
        <header className="clinicas-topo">
          <BotaoVoltar aoClicar={() => aoNavegar('inicio')} />
          <h1>Especialidades</h1>
          <BotaoMenuAdmin aoClicar={() => setMenuAberto(true)} />
        </header>

        <div className="clinicas-conteudo">
          {estado === 'carregando' && <p className="clinicas-estado">Carregando especialidades...</p>}
          {estado === 'erro' && (
            <p className="clinicas-estado" role="alert">
              Não foi possível carregar as especialidades.{' '}
              <button type="button" className="clinicas-link" onClick={carregar}>Tentar de novo</button>
            </p>
          )}
          {estado === 'ok' && lista.length === 0 && (
            <p className="clinicas-estado">
              Nenhuma especialidade cadastrada ainda. Toque no botão + para cadastrar a primeira.
            </p>
          )}

          <ul className="clinicas-lista">
            {lista.map((item) => (
              <li className="clinicas-cartao especialidades-cartao" key={item.id}>
                <div className="especialidades-texto">
                  <div className="especialidades-titulo">
                    <h2>{item.nome}</h2>
                    <span className={item.ativo ? 'clinicas-selo clinicas-selo-ativo' : 'clinicas-selo clinicas-selo-inativo'}>
                      {item.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  {item.descricao && <p>{item.descricao}</p>}
                </div>
                <button type="button" className="especialidades-editar" onClick={() => abrirEdicao(item)}>
                  Editar
                </button>
              </li>
            ))}
          </ul>
        </div>

        <button type="button" className="clinicas-novo" onClick={abrirCadastro} aria-label="Cadastrar nova especialidade">+</button>
        <MenuAdmin itemAtivo="especialidades" aoNavegar={aoNavegar} menuAberto={menuAberto} aoFecharMenu={() => setMenuAberto(false)} />
      </div>
    </div>
  )
}

export default EspecialidadesAdmin
