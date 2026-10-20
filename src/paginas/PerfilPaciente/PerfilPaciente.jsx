
import { useState } from 'react'
import BarraNavegacao from '../../componentes/BarraNavegacao/BarraNavegacao'
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
      'Na tela Início, toque em Agendar consulta.',
      'Responda à pré-triagem com calma.',
      'Escolha clínica, profissional, data e horário.',
      'Revise os dados e confirme o agendamento.',
    ],
  },
  {
    titulo: 'Ver ou cancelar um agendamento',
    passos: [
      'Abra Agendamentos no menu inferior.',
      'Toque na consulta que deseja consultar.',
      'Confira os detalhes ou use a opção de cancelamento.',
    ],
  },
  {
    titulo: 'Usar a pré-triagem por áudio',
    passos: [
      'Na pré-triagem, escolha Responder por áudio.',
      'Toque no microfone e fale perto do aparelho.',
      'Revise o texto identificado antes de continuar.',
    ],
  },
]

function PerfilPaciente({
  usuario,
  aoAtualizarUsuario,
  aoIrParaInicio,
  aoIrParaAgendamentos,
  aoIrParaHistorico,
  aoSair,
}) {
  const [painel, setPainel] = useState(null)
  const [paginaNotificacoes, setPaginaNotificacoes] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [dados, setDados] = useState({
    nome: usuario?.nome ?? usuario?.name ?? usuario?.nomeCompleto ?? '',
    email: usuario?.email ?? '',
    telefone: usuario?.telefone ?? '',
    dataNascimento: usuario?.dataNascimento ?? '',
  })
  const [preferencias, setPreferencias] = useState({
    biometria: false,
    alertaAcesso: true,
    lembrete: '1',
    economiaDados: false,
    fonteMaior: false,
    altoContraste: false,
  })

  const iniciais = (dados.nome || 'Paciente')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toUpperCase()

  function abrirPainel(id) {
    setMensagem('')
    if (id === 'notificacoes') {
      setPaginaNotificacoes(true)
    } else {
      setPainel(id)
    }
  }

  function alterarDado(campo, valor) {
    setDados((anterior) => ({ ...anterior, [campo]: valor }))
  }

  function alterarPreferencia(campo, valor) {
    setPreferencias((anterior) => ({
      ...anterior,
      [campo]: valor,
    }))
  }

  function salvarDados(evento) {
    evento.preventDefault()

    aoAtualizarUsuario?.({
      nome: dados.nome,
      email: dados.email,
      telefone: dados.telefone,
      dataNascimento: dados.dataNascimento,
    })

    setPainel(null)
    setMensagem('Dados atualizados nesta sessão.')
  }

  function salvarPreferencias() {
    setPainel(null)
    setMensagem('Preferências salvas nesta sessão.')
  }

  function navegar(id) {
    if (id === 'inicio') aoIrParaInicio?.()
    if (id === 'agendamentos') aoIrParaAgendamentos?.()
    if (id === 'historico') aoIrParaHistorico?.()
  }

  return (
    <div className="pagina-fundo">
      <div className="perfil-paciente">
        {paginaNotificacoes ? (
          <div className="perfil-paciente-conteudo">
            <header className="perfil-notificacoes-cabecalho">
              <button
                type="button"
                onClick={() => setPaginaNotificacoes(false)}
                aria-label="Voltar ao perfil"
              >
                ←
              </button>
              <h1>Notificações</h1>
            </header>

            <div className="perfil-notificacoes-vazio">
              <span>🔔</span>
              <h2>Nenhuma notificação no momento</h2>
              <p>
                As notificações de consultas aparecerão aqui
                quando estiverem disponíveis.
              </p>
            </div>
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
            onClick={() => setPainel(null)}
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
                  onClick={() => setPainel(null)}
                  aria-label="Fechar"
                >
                  ×
                </button>
              </div>

              {painel === 'dados' && (
                <form onSubmit={salvarDados} className="perfil-modal-formulario">
                  <label>
                    Nome completo
                    <input
                      value={dados.nome}
                      onChange={(e) => alterarDado('nome', e.target.value)}
                      required
                    />
                  </label>
                  <label>
                    E-mail
                    <input
                      type="email"
                      value={dados.email}
                      onChange={(e) => alterarDado('email', e.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Telefone
                    <input
                      type="tel"
                      value={dados.telefone}
                      onChange={(e) => alterarDado('telefone', e.target.value)}
                    />
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
                  </label>
                  <button className="perfil-botao-primario" type="submit">
                    Salvar alterações
                  </button>
                </form>
              )}

              {painel === 'privacidade' && (
                <div className="perfil-modal-formulario">
                  <label className="perfil-preferencia">
                    <span>
                      <strong>Acesso com biometria</strong>
                      <small>
                        Recurso indisponível até a integração
                        com autenticação biométrica.
                      </small>
                    </span>
                    <input type="checkbox" disabled />
                  </label>
                  <label className="perfil-preferencia">
                    <span>
                      <strong>Alertas de novo acesso</strong>
                      <small>
                        Preferência local. O envio de alertas
                        depende do servidor.
                      </small>
                    </span>
                    <input
                      type="checkbox"
                      checked={preferencias.alertaAcesso}
                      onChange={(e) =>
                        alterarPreferencia('alertaAcesso', e.target.checked)
                      }
                    />
                  </label>
                  <button
                    type="button"
                    className="perfil-botao-secundario"
                    onClick={() =>
                      setMensagem('Alteração de senha requer integração com a API.')
                    }
                  >
                    Alterar minha senha
                  </button>
                  <button
                    type="button"
                    className="perfil-botao-primario"
                    onClick={salvarPreferencias}
                  >
                    Salvar preferências
                  </button>
                </div>
              )}

              {painel === 'acessibilidade' && (
                <div className="perfil-modal-formulario">
                  <label className="perfil-preferencia">
                    <span><strong>Aumentar tamanho do texto</strong></span>
                    <input
                      type="checkbox"
                      checked={preferencias.fonteMaior}
                      onChange={(e) =>
                        alterarPreferencia('fonteMaior', e.target.checked)
                      }
                    />
                  </label>
                  <label className="perfil-preferencia">
                    <span><strong>Alto contraste</strong></span>
                    <input
                      type="checkbox"
                      checked={preferencias.altoContraste}
                      onChange={(e) =>
                        alterarPreferencia('altoContraste', e.target.checked)
                      }
                    />
                  </label>
                  <p className="perfil-modal-aviso">
                    Estas preferências serão aplicadas à interface
                    em uma próxima etapa.
                  </p>
                  <button
                    type="button"
                    className="perfil-botao-primario"
                    onClick={salvarPreferencias}
                  >
                    Salvar preferências
                  </button>
                </div>
              )}

              {painel === 'configuracoes' && (
                <div className="perfil-modal-formulario">
                  <label>
                    Lembrete de consulta
                    <select
                      value={preferencias.lembrete}
                      onChange={(e) =>
                        alterarPreferencia('lembrete', e.target.value)
                      }
                    >
                      <option value="1">1 dia antes</option>
                      <option value="2">2 dias antes</option>
                      <option value="7">7 dias antes</option>
                    </select>
                  </label>
                  <label className="perfil-preferencia">
                    <span>
                      <strong>Economia de dados</strong>
                      <small>
                        Preferência local, ainda não aplicada
                        ao consumo de dados.
                      </small>
                    </span>
                    <input
                      type="checkbox"
                      checked={preferencias.economiaDados}
                      onChange={(e) =>
                        alterarPreferencia('economiaDados', e.target.checked)
                      }
                    />
                  </label>
                  <button
                    type="button"
                    className="perfil-botao-primario"
                    onClick={salvarPreferencias}
                  >
                    Salvar configurações
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
                    onClick={() => setPainel(null)}
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
