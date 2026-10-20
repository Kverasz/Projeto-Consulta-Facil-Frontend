import { useCallback, useEffect, useState } from 'react'
import BotaoVoltar from '../../componentes/BotaoVoltar/BotaoVoltar'
import BarraNavegacao from '../../componentes/BarraNavegacao/BarraNavegacao'
import { itensNavegacaoProfissional } from '../../componentes/BarraNavegacao/itensProfissional'
import MenuLateral from '../../componentes/MenuLateral/MenuLateral'
import AvisoToast from '../../componentes/AvisoToast/AvisoToast'
import { carregarPerfil, salvarContato } from '../../servicos/profissional'
import './Perfil.css'

// "Dr. Carlos Mendes" -> "CM"; "Dr. Kennedy" -> "KE"
function iniciais(nome) {
  const palavras = nome
    .replace(/^dra?\.?\s+/i, '')
    .split(/\s+/)
    .filter((p) => p && !['da', 'de', 'do', 'das', 'dos', 'e'].includes(p.toLowerCase()))
  if (palavras.length === 0) return '?'
  if (palavras.length === 1) return palavras[0].slice(0, 2).toUpperCase()
  return (palavras[0][0] + palavras[palavras.length - 1][0]).toUpperCase()
}

function formatarCpf(cpf) {
  const numeros = String(cpf ?? '').replace(/\D/g, '')
  return numeros.length === 11 ? numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : cpf
}

// "81991111111" -> "(81) 99111-1111" (vai formatando enquanto digita)
function formatarTelefone(valor) {
  const n = String(valor ?? '').replace(/\D/g, '').slice(0, 11)
  if (n.length <= 2) return n
  if (n.length <= 6) return `(${n.slice(0, 2)}) ${n.slice(2)}`
  if (n.length <= 10) return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`
  return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`
}

// "CRM-PE" + "24.501" -> "CRM-PE 24.501" (sem repetir o conselho se o registro já o trouxer)
function registroCompleto(registro, conselho) {
  if (!registro) return null
  return conselho && !String(registro).toUpperCase().includes(String(conselho).toUpperCase())
    ? `${conselho} ${registro}`
    : String(registro)
}

function validar(telefone, email) {
  const erros = {}
  const digitos = telefone.replace(/\D/g, '')
  if (digitos.length < 10 || digitos.length > 11) erros.telefone = 'Informe um telefone com DDD, por exemplo (81) 99999-0000.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) erros.email = 'Informe um e-mail válido.'
  return erros
}

function Perfil({ usuario, aoNavegar, aoSair }) {
  const [menuAberto, setMenuAberto] = useState(false)
  const [perfil, setPerfil] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const [editando, setEditando] = useState(false)
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [errosCampos, setErrosCampos] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [aviso, setAviso] = useState(null)

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro('')
    try {
      setPerfil(await carregarPerfil(usuario))
    } catch (e) {
      setErro(e.message || 'Não foi possível carregar seu perfil.')
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

  function comecarEdicao() {
    setTelefone(formatarTelefone(perfil.telefone))
    setEmail(perfil.email)
    setErrosCampos({})
    setEditando(true)
  }

  async function salvar(evento) {
    evento.preventDefault()
    const erros = validar(telefone, email)
    setErrosCampos(erros)
    if (Object.keys(erros).length > 0) return

    // Grava o telefone no mesmo estilo do cadastro: só números, se era assim que estava salvo
    const telefoneFormatado = telefone.trim()
    const telefoneSalvoComMascara = !perfil.telefone || /\D/.test(perfil.telefone)
    const novo = {
      telefone: telefoneSalvoComMascara ? telefoneFormatado : telefoneFormatado.replace(/\D/g, ''),
      email: email.trim()
    }
    if (formatarTelefone(novo.telefone) === formatarTelefone(perfil.telefone) && novo.email === perfil.email) {
      setEditando(false)
      return
    }

    setEnviando(true)
    try {
      await salvarContato(perfil, novo, usuario.token)
      setPerfil({ ...perfil, ...novo, cadastro: { ...perfil.cadastro, ...novo } })
      setEditando(false)
      setAviso({ tipo: 'sucesso', titulo: 'Perfil atualizado', texto: 'Seu telefone e e-mail foram salvos.' })
    } catch (e) {
      setAviso({ tipo: 'erro', titulo: 'Não foi possível salvar', texto: e.message })
    } finally {
      setEnviando(false)
    }
  }

  const registro = perfil ? registroCompleto(perfil.registro, perfil.conselho) : null
  const subtitulo = perfil ? [perfil.especialidade, registro].filter(Boolean).join(' · ') : ''

  const dadosProfissionais = perfil && [
    { icone: '👤', rotulo: 'Nome completo', valor: perfil.nome },
    { icone: '📋', rotulo: 'CPF', valor: formatarCpf(perfil.cpf), trancado: true },
    { icone: '🏅', rotulo: 'Registro profissional', valor: registro, trancado: true },
    { icone: '⚖️', rotulo: 'Conselho', valor: perfil.conselho, trancado: true },
    { icone: '🩺', rotulo: 'Especialidade', valor: perfil.especialidade },
    { icone: '🏥', rotulo: 'Clínica vinculada', valor: perfil.clinica },
  ]

  return (
    <div className="pagina-fundo">
      <AvisoToast aviso={aviso} aoFechar={() => setAviso(null)} />

      <MenuLateral
        itens={itensNavegacaoProfissional}
        aberto={menuAberto}
        aoFechar={() => setMenuAberto(false)}
        itemAtivo="perfil"
        aoSelecionar={aoNavegar}
      />

      <div className="perfil">
        <header className="perfil-topo">
          <BotaoVoltar aoClicar={() => aoNavegar('inicio')} />
          <h1 className="perfil-titulo">Meu Perfil</h1>
          <button type="button" className="perfil-menu" onClick={() => setMenuAberto(true)} aria-label="Abrir menu">☰</button>
          {perfil && !editando && (
            <button type="button" className="perfil-botao-topo perfil-botao-editar" onClick={comecarEdicao}>
              Editar perfil
            </button>
          )}
          {perfil && editando && (
            <button type="button" className="perfil-botao-topo perfil-botao-cancelar" onClick={() => setEditando(false)} disabled={enviando}>
              Cancelar
            </button>
          )}
        </header>

        <div className="perfil-rolagem">
          <div className="perfil-conteudo">
            {carregando && <p className="perfil-vazio">Carregando seu perfil...</p>}

            {erro && (
              <div className="perfil-erro">
                <p>{erro}</p>
                <button type="button" className="perfil-link" onClick={carregar}>Tentar de novo</button>
              </div>
            )}

            {perfil && !carregando && !erro && (
              <form onSubmit={salvar} noValidate>
                <section className="perfil-resumo">
                  <span className="perfil-avatar">{iniciais(perfil.nome)}</span>
                  <div className="perfil-resumo-texto">
                    <p className="perfil-resumo-nome">{perfil.nome}</p>
                    {subtitulo && <p className="perfil-resumo-subtitulo">{subtitulo}</p>}
                    {perfil.ativo !== null && (
                      <p className={perfil.ativo ? 'perfil-situacao perfil-situacao-ativo' : 'perfil-situacao perfil-situacao-inativo'}>
                        ● {perfil.ativo ? 'Ativo' : 'Inativo'}
                      </p>
                    )}
                  </div>
                </section>

                <h2 className="perfil-secao">Dados profissionais</h2>
                <section className="perfil-cartao">
                  {dadosProfissionais.map((linha) => (
                    <div key={linha.rotulo} className="perfil-linha">
                      <span className="perfil-linha-icone">{linha.icone}</span>
                      <div className="perfil-linha-texto">
                        <p className="perfil-linha-rotulo">{linha.rotulo}</p>
                        <p className="perfil-linha-valor">{linha.valor || '—'}</p>
                      </div>
                      {linha.trancado && <span className="perfil-cadeado" title="Não pode ser alterado aqui" aria-label="Campo bloqueado">🔒</span>}
                    </div>
                  ))}
                </section>

                <h2 className="perfil-secao">Contato</h2>
                {!editando ? (
                  <section className="perfil-cartao">
                    <div className="perfil-linha">
                      <span className="perfil-linha-icone">📞</span>
                      <div className="perfil-linha-texto">
                        <p className="perfil-linha-rotulo">Telefone</p>
                        <p className="perfil-linha-valor">{formatarTelefone(perfil.telefone) || '—'}</p>
                      </div>
                    </div>
                    <div className="perfil-linha">
                      <span className="perfil-linha-icone">✉️</span>
                      <div className="perfil-linha-texto">
                        <p className="perfil-linha-rotulo">E-mail</p>
                        <p className="perfil-linha-valor perfil-linha-valor-quebra">{perfil.email || '—'}</p>
                      </div>
                    </div>
                  </section>
                ) : (
                  <div className="perfil-edicao">
                    <label className="perfil-campo">
                      <span>Telefone</span>
                      <input
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="(81) 99999-0000"
                        value={telefone}
                        onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
                        aria-invalid={Boolean(errosCampos.telefone)}
                      />
                      {errosCampos.telefone && <small role="alert">{errosCampos.telefone}</small>}
                    </label>

                    <label className="perfil-campo">
                      <span>E-mail</span>
                      <input
                        type="email"
                        autoComplete="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        aria-invalid={Boolean(errosCampos.email)}
                      />
                      {errosCampos.email && <small role="alert">{errosCampos.email}</small>}
                    </label>

                    <button type="submit" className="perfil-salvar" disabled={enviando}>
                      {enviando ? 'Salvando...' : 'Salvar alterações'}
                    </button>
                  </div>
                )}

                <button type="button" className="perfil-sair" onClick={aoSair}>Sair da conta</button>
              </form>
            )}
          </div>
        </div>

        <div className="perfil-rodape">
          <BarraNavegacao itens={itensNavegacaoProfissional} itemAtivo="perfil" aoSelecionar={aoNavegar} />
        </div>
      </div>
    </div>
  )
}

export default Perfil
