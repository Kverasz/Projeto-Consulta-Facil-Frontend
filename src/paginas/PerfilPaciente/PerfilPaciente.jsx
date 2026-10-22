import { useEffect, useMemo, useState } from 'react'
import BarraNavegacao from '../../componentes/BarraNavegacao/BarraNavegacao'
import { alterarSenha, carregarPaciente, salvarPaciente } from '../../servicos/paciente'
import { emailValido, formatarTelefone, telefoneValido } from '../../servicos/formatos'
import { gerarNotificacoesPaciente, lerNotificacoesLidas, salvarNotificacoesLidas } from '../../servicos/notificacoesPaciente'
import { lerPreferencias, salvarPreferencias } from '../../servicos/preferencias'
import './PerfilPaciente.css'

const itensPerfil = [
  { id: 'dados', icone: '✏️', titulo: 'Editar dados pessoais' },
  { id: 'privacidade', icone: '🔒', titulo: 'Privacidade e segurança' },
  { id: 'acessibilidade', icone: '♿', titulo: 'Acessibilidade' },
  { id: 'notificacoes', icone: '🔔', titulo: 'Notificações' },
  { id: 'configuracoes', icone: '⚙️', titulo: 'Configurações' },
  { id: 'ajuda', icone: '❓', titulo: 'Ajuda e instruções' },
]

const instrucoes = [
  {
    titulo: 'Agendar uma consulta',
    passos: [
      'Na tela Início, toque em "Já sei o que preciso" para escolher a especialidade, ou em "Preciso de atendimento" para responder à pré-triagem.',
      'Escolha a clínica e o profissional.',
      'Escolha uma data e um horário livres.',
      'Revise os dados e confirme o agendamento.',
    ],
  },
  {
    titulo: 'Ver, reagendar ou cancelar um agendamento',
    passos: [
      'Abra Agendamentos no menu inferior.',
      'Toque na consulta que deseja consultar.',
      'Confira os detalhes ou use as opções Reagendar e Cancelar agendamento.',
    ],
  },
  {
    titulo: 'Usar a pré-triagem por áudio',
    passos: [
      'Na pré-triagem, escolha Falar sobre o que estou sentindo.',
      'Toque no microfone e fale perto do aparelho.',
      'Escreva um resumo do relato para continuar.',
    ],
  },
]

function PerfilPaciente({
  usuario,
  paciente,
  consultas = [],
  aoAtualizarPaciente,
  aoIrParaInicio,
  aoIrParaAgendamentos,
  aoIrParaHistorico,
  aoSair,
  abrirNotificacoesInicialmente = false,
  aoVoltarNotificacoes,
}) {
  const [painel, setPainel] = useState(null)
  const [paginaNotificacoes, setPaginaNotificacoes] = useState(abrirNotificacoesInicialmente)
  const [mensagem, setMensagem] = useState('')
  const [preferencias, setPreferencias] = useState(lerPreferencias)
  const [lidas, setLidas] = useState(() => lerNotificacoesLidas(paciente?.id ?? usuario?.idPaciente))

  const [dados, setDados] = useState({
    nome: usuario?.nome ?? usuario?.name ?? usuario?.nomeCompleto ?? '',
    email: usuario?.email ?? '',
    telefone: formatarTelefone(usuario?.telefone ?? ''),
    dataNascimento: usuario?.dataNascimento ?? '',
  })
  const [errosDados, setErrosDados] = useState({})
  const [salvandoDados, setSalvandoDados] = useState(false)
  const [erroDados, setErroDados] = useState('')

  const [senhas, setSenhas] = useState({ atual: '', nova: '', confirmar: '' })
  const [mostrarSenhas, setMostrarSenhas] = useState(false)
  const [erroSenha, setErroSenha] = useState('')
  const [salvandoSenha, setSalvandoSenha] = useState(false)

  const idPaciente = paciente?.id ?? usuario?.idPaciente

  // Se o cadastro não chegou junto com o login, tenta buscar de novo ao abrir o perfil
  useEffect(() => {
    if (paciente || !idPaciente || !usuario?.token) return
    let ativo = true
    carregarPaciente(idPaciente, usuario.token)
      .then((carregado) => ativo && aoAtualizarPaciente?.(carregado))
      .catch(() => {})
    return () => { ativo = false }
  }, [paciente, idPaciente, usuario?.token, aoAtualizarPaciente])

  // Mantém o perfil em dia quando o cadastro chega ou muda
  useEffect(() => {
    setDados({
      nome: usuario?.nome ?? usuario?.name ?? usuario?.nomeCompleto ?? '',
      email: usuario?.email ?? '',
      telefone: formatarTelefone(usuario?.telefone ?? ''),
      dataNascimento: usuario?.dataNascimento ?? '',
    })
  }, [usuario?.nome, usuario?.name, usuario?.nomeCompleto, usuario?.email, usuario?.telefone, usuario?.dataNascimento])

  useEffect(() => {
    setLidas(lerNotificacoesLidas(idPaciente))
  }, [idPaciente])

  const notificacoes = useMemo(
    () => gerarNotificacoesPaciente(consultas, preferencias.lembreteDias).map((n) => ({ ...n, lida: lidas.has(n.id) })),
    [consultas, preferencias.lembreteDias, lidas]
  )
  const naoLidas = notificacoes.filter((n) => !n.lida)
  const anteriores = notificacoes.filter((n) => n.lida)

  function marcarComoLidas(ids) {
    const novas = new Set([...lidas, ...ids])
    setLidas(novas)
    salvarNotificacoesLidas(idPaciente, novas)
  }

  const iniciais = (dados.nome || 'Paciente')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toUpperCase()

  function abrirPainel(id) {
    setMensagem('')
    setErrosDados({})
    setErroDados('')
    setErroSenha('')
    if (id === 'notificacoes') {
      setPaginaNotificacoes(true)
    } else {
      setPainel(id)
    }
  }

  function fecharPainel() {
    setPainel(null)
    setSenhas({ atual: '', nova: '', confirmar: '' })
    setMostrarSenhas(false)
  }

  function alterarDado(campo, valor) {
    setDados((anterior) => ({ ...anterior, [campo]: valor }))
  }

  async function salvarDados(evento) {
    evento.preventDefault()

    const erros = {}
    if (dados.nome.trim().length < 3) erros.nome = 'Informe seu nome completo.'
    if (!emailValido(dados.email)) erros.email = 'Informe um e-mail válido.'
    if (dados.telefone.trim() && !telefoneValido(dados.telefone)) {
      erros.telefone = 'Informe o telefone com DDD, por exemplo (81) 99999-0000.'
    }
    if (dados.dataNascimento && dados.dataNascimento > new Date().toISOString().slice(0, 10)) {
      erros.dataNascimento = 'A data de nascimento não pode estar no futuro.'
    }
    setErrosDados(erros)
    if (Object.keys(erros).length > 0) return

    if (!paciente) {
      setErroDados('Seu cadastro ainda não foi carregado. Tente de novo em instantes.')
      return
    }

    const novos = {
      nome: dados.nome.trim(),
      email: dados.email.trim(),
      telefone: dados.telefone.trim(),
      dataNascimento: dados.dataNascimento,
    }

    setSalvandoDados(true)
    setErroDados('')
    try {
      await salvarPaciente(paciente, novos, usuario.token)
      aoAtualizarPaciente?.({ ...paciente, ...novos, cadastro: { ...paciente.cadastro, nome: novos.nome, email: novos.email, telefone: novos.telefone } })
      fecharPainel()
      setMensagem('Dados atualizados com sucesso.')
    } catch (e) {
      setErroDados(e.message)
    } finally {
      setSalvandoDados(false)
    }
  }

  async function trocarSenha(evento) {
    evento.preventDefault()
    setErroSenha('')

    if (!senhas.atual) return setErroSenha('Informe a senha atual.')
    if (senhas.nova.length < 8) return setErroSenha('A nova senha precisa ter pelo menos 8 caracteres.')
    if (senhas.nova === senhas.atual) return setErroSenha('A nova senha precisa ser diferente da atual.')
    if (senhas.nova !== senhas.confirmar) return setErroSenha('A confirmação não é igual à nova senha.')
    if (!paciente) return setErroSenha('Seu cadastro ainda não foi carregado. Tente de novo em instantes.')

    setSalvandoSenha(true)
    try {
      await alterarSenha(paciente, senhas.atual, senhas.nova, usuario.token)
      fecharPainel()
      setMensagem('Senha alterada com sucesso.')
    } catch (e) {
      setErroSenha(e.message)
    } finally {
      setSalvandoSenha(false)
    }
  }

  function alterarPreferencia(campo, valor) {
    const novas = { ...preferencias, [campo]: valor }
    setPreferencias(novas)
    // Aplica na hora (o efeito aparece na própria tela) e guarda neste aparelho
    const guardou = salvarPreferencias(novas)
    setMensagem(guardou ? '' : 'Não foi possível guardar a preferência neste navegador. Ela vale só enquanto o app estiver aberto.')
  }

  function navegar(id) {
    if (id === 'inicio') aoIrParaInicio?.()
    if (id === 'agendamentos') aoIrParaAgendamentos?.()
    if (id === 'historico') aoIrParaHistorico?.()
  }

  function renderizarNotificacao(notificacao) {
    return (
      <li key={notificacao.id}>
        <button
          type="button"
          className={notificacao.lida ? 'notificacao' : 'notificacao notificacao-nao-lida'}
          onClick={() => marcarComoLidas([notificacao.id])}
        >
          <span className="notificacao-icone">{notificacao.icone}</span>
          <span className="notificacao-texto">
            <span className="notificacao-titulo">{notificacao.titulo}</span>
            <span className="notificacao-descricao">{notificacao.texto}</span>
          </span>
          {!notificacao.lida && <span className="notificacao-ponto" aria-label="Não lida" />}
        </button>
      </li>
    )
  }

  const tipoCampoSenha = mostrarSenhas ? 'text' : 'password'

  return (
    <div className="pagina-fundo">
      <div className="perfil-paciente">
        {paginaNotificacoes ? (
          <div className="perfil-paciente-conteudo">
            <header className="perfil-notificacoes-cabecalho">
              <button
                type="button"
                onClick={() => {
                  if (abrirNotificacoesInicialmente) {
                    aoVoltarNotificacoes?.()
                  } else {
                    setPaginaNotificacoes(false)
                  }
                }}
                aria-label="Voltar ao perfil"
              >
                ←
              </button>
              <h1>Notificações</h1>
            </header>

            {notificacoes.length === 0 ? (
              <div className="perfil-notificacoes-vazio">
                <span>🔔</span>
                <h2>Nenhuma notificação no momento</h2>
                <p>
                  Avisos sobre suas consultas, como confirmações, cancelamentos e lembretes,
                  aparecerão aqui.
                </p>
              </div>
            ) : (
              <div className="perfil-notificacoes-lista">
                {naoLidas.length > 0 && (
                  <section>
                    <div className="perfil-notificacoes-secao-topo">
                      <h3 className="painel-notif-secao">
                        Não lidas <span className="painel-notif-contador">{naoLidas.length}</span>
                      </h3>
                      <button
                        type="button"
                        className="perfil-notificacoes-ler-todas"
                        onClick={() => marcarComoLidas(notificacoes.map((n) => n.id))}
                      >
                        Marcar todas como lidas
                      </button>
                    </div>
                    <ul className="painel-notif-lista">{naoLidas.map(renderizarNotificacao)}</ul>
                  </section>
                )}

                {anteriores.length > 0 && (
                  <section>
                    <h3 className="painel-notif-secao">Anteriores</h3>
                    <ul className="painel-notif-lista">{anteriores.map(renderizarNotificacao)}</ul>
                  </section>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="perfil-paciente-conteudo">
            <h1 className="perfil-paciente-titulo">Perfil</h1>

            <section className="perfil-paciente-identidade">
              <div className="perfil-paciente-avatar">{iniciais}</div>
              <div className="perfil-paciente-identidade-texto">
                <strong>{dados.nome || 'Paciente'}</strong>
                <span>{dados.email || 'E-mail não informado'}</span>
                <span>{dados.telefone || 'Telefone não informado'}</span>
              </div>
            </section>

            <section className="perfil-paciente-opcoes">
              {itensPerfil.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="perfil-paciente-opcao"
                  onClick={() => abrirPainel(item.id)}
                >
                  <span className="perfil-paciente-opcao-icone">
                    {item.icone}
                  </span>
                  <span>{item.titulo}</span>
                  {item.id === 'notificacoes' && naoLidas.length > 0 && (
                    <span className="painel-notif-contador">{naoLidas.length}</span>
                  )}
                  <span className="perfil-paciente-seta">›</span>
                </button>
              ))}
            </section>

            <button
              type="button"
              className="perfil-paciente-sair"
              onClick={() => abrirPainel('sair')}
            >
              Sair da conta
            </button>

            {mensagem && (
              <p className="perfil-paciente-mensagem" role="status">
                {mensagem}
              </p>
            )}

            <p className="perfil-paciente-versao">
              Consulta Fácil v1.0.0 · Secretaria Municipal de Saúde
            </p>
          </div>
        )}

        <BarraNavegacao
          itemAtivo="perfil"
          aoSelecionar={navegar}
        />

        {painel && (
          <div
            className="perfil-modal-fundo"
            onClick={fecharPainel}
          >
            <section
              className="perfil-modal"
              role="dialog"
              aria-modal="true"
              aria-label={
                itensPerfil.find((item) => item.id === painel)?.titulo ||
                'Sair da conta'
              }
              onClick={(evento) => evento.stopPropagation()}
            >
              <div className="perfil-modal-indicador" />

              <div className="perfil-modal-cabecalho">
                <h2>
                  {painel === 'sair'
                    ? 'Sair da conta?'
                    : itensPerfil.find((item) => item.id === painel)?.titulo}
                </h2>
                <button
                  type="button"
                  className="perfil-modal-fechar"
                  onClick={fecharPainel}
                  aria-label="Fechar"
                >
                  ×
                </button>
              </div>

              {painel === 'dados' && (
                <form onSubmit={salvarDados} className="perfil-modal-formulario" noValidate>
                  <label>
                    Nome completo
                    <input
                      value={dados.nome}
                      onChange={(e) => alterarDado('nome', e.target.value)}
                      autoComplete="name"
                    />
                    {errosDados.nome && <small className="perfil-erro" role="alert">{errosDados.nome}</small>}
                  </label>
                  <label>
                    E-mail
                    <input
                      type="email"
                      value={dados.email}
                      onChange={(e) => alterarDado('email', e.target.value)}
                      autoComplete="email"
                    />
                    {errosDados.email && <small className="perfil-erro" role="alert">{errosDados.email}</small>}
                  </label>
                  <label>
                    Telefone
                    <input
                      type="tel"
                      inputMode="tel"
                      placeholder="(81) 99999-0000"
                      value={dados.telefone}
                      onChange={(e) => alterarDado('telefone', formatarTelefone(e.target.value))}
                      autoComplete="tel"
                    />
                    {errosDados.telefone && <small className="perfil-erro" role="alert">{errosDados.telefone}</small>}
                  </label>
                  <label>
                    Data de nascimento
                    <input
                      type="date"
                      value={dados.dataNascimento}
                      onChange={(e) =>
                        alterarDado('dataNascimento', e.target.value)
                      }
                    />
                    {errosDados.dataNascimento && <small className="perfil-erro" role="alert">{errosDados.dataNascimento}</small>}
                  </label>
                  {erroDados && <p className="perfil-erro" role="alert">{erroDados}</p>}
                  <button className="perfil-botao-primario" type="submit" disabled={salvandoDados}>
                    {salvandoDados ? 'Salvando...' : 'Salvar alterações'}
                  </button>
                </form>
              )}

              {painel === 'privacidade' && (
                <form onSubmit={trocarSenha} className="perfil-modal-formulario" noValidate>
                  <p className="perfil-modal-aviso">
                    Para sua segurança, informe a senha atual antes de escolher uma nova.
                    Nunca compartilhe sua senha com outras pessoas.
                  </p>
                  <label>
                    Senha atual
                    <input
                      type={tipoCampoSenha}
                      value={senhas.atual}
                      onChange={(e) => setSenhas((a) => ({ ...a, atual: e.target.value }))}
                      autoComplete="current-password"
                    />
                  </label>
                  <label>
                    Nova senha
                    <input
                      type={tipoCampoSenha}
                      placeholder="Mínimo 8 caracteres"
                      value={senhas.nova}
                      onChange={(e) => setSenhas((a) => ({ ...a, nova: e.target.value }))}
                      autoComplete="new-password"
                    />
                  </label>
                  <label>
                    Confirmar nova senha
                    <input
                      type={tipoCampoSenha}
                      value={senhas.confirmar}
                      onChange={(e) => setSenhas((a) => ({ ...a, confirmar: e.target.value }))}
                      autoComplete="new-password"
                    />
                  </label>
                  <label className="perfil-preferencia">
                    <span><strong>Mostrar senhas</strong></span>
                    <input
                      type="checkbox"
                      checked={mostrarSenhas}
                      onChange={(e) => setMostrarSenhas(e.target.checked)}
                    />
                  </label>
                  {erroSenha && <p className="perfil-erro" role="alert">{erroSenha}</p>}
                  <button className="perfil-botao-primario" type="submit" disabled={salvandoSenha}>
                    {salvandoSenha ? 'Alterando...' : 'Alterar minha senha'}
                  </button>
                </form>
              )}

              {painel === 'acessibilidade' && (
                <div className="perfil-modal-formulario">
                  <label className="perfil-preferencia">
                    <span>
                      <strong>Letras maiores</strong>
                      <small>Aumenta o tamanho do texto em todo o aplicativo.</small>
                    </span>
                    <input
                      type="checkbox"
                      checked={preferencias.fonteMaior}
                      onChange={(e) =>
                        alterarPreferencia('fonteMaior', e.target.checked)
                      }
                    />
                  </label>
                  <label className="perfil-preferencia">
                    <span>
                      <strong>Alto contraste</strong>
                      <small>Deixa textos mais escuros e bordas mais visíveis.</small>
                    </span>
                    <input
                      type="checkbox"
                      checked={preferencias.altoContraste}
                      onChange={(e) =>
                        alterarPreferencia('altoContraste', e.target.checked)
                      }
                    />
                  </label>
                  <p className="perfil-modal-aviso">
                    As mudanças valem na hora e ficam salvas neste aparelho.
                  </p>
                  <button
                    type="button"
                    className="perfil-botao-primario"
                    onClick={fecharPainel}
                  >
                    Concluir
                  </button>
                </div>
              )}

              {painel === 'configuracoes' && (
                <div className="perfil-modal-formulario">
                  <label>
                    Lembrete de consulta
                    <select
                      value={String(preferencias.lembreteDias)}
                      onChange={(e) =>
                        alterarPreferencia('lembreteDias', Number(e.target.value))
                      }
                    >
                      <option value="1">1 dia antes</option>
                      <option value="2">2 dias antes</option>
                      <option value="7">7 dias antes</option>
                    </select>
                  </label>
                  <p className="perfil-modal-aviso">
                    O lembrete aparece em Notificações quando sua consulta estiver a esse
                    número de dias (ou menos). A escolha fica salva neste aparelho.
                  </p>
                  <button
                    type="button"
                    className="perfil-botao-primario"
                    onClick={fecharPainel}
                  >
                    Concluir
                  </button>
                </div>
              )}

              {painel === 'ajuda' && (
                <div className="perfil-ajuda">
                  <div className="perfil-ajuda-introducao">
                    <strong>Como usar o Consulta Fácil</strong>
                    <p>
                      Siga os passos abaixo. As instruções ficam
                      sempre disponíveis nesta tela.
                    </p>
                  </div>

                  {instrucoes.map((grupo) => (
                    <section className="perfil-ajuda-grupo" key={grupo.titulo}>
                      <h3>{grupo.titulo}</h3>
                      {grupo.passos.map((passo, indice) => (
                        <div className="perfil-ajuda-passo" key={passo}>
                          <span>{indice + 1}</span>
                          <p>{passo}</p>
                        </div>
                      ))}
                    </section>
                  ))}

                  <div className="perfil-ajuda-seguranca">
                    <strong>Dica de segurança</strong>
                    <p>
                      Nunca compartilhe sua senha. Seus dados são usados
                      somente para organizar e viabilizar seu atendimento.
                    </p>
                  </div>
                </div>
              )}

              {painel === 'sair' && (
                <div className="perfil-modal-formulario perfil-confirmacao">
                  <p>
                    Você precisará entrar novamente para acessar
                    seus agendamentos.
                  </p>
                  <button
                    type="button"
                    className="perfil-botao-perigo"
                    onClick={aoSair}
                  >
                    Sair
                  </button>
                  <button
                    type="button"
                    className="perfil-botao-secundario"
                    onClick={fecharPainel}
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  )
}

export default PerfilPaciente
