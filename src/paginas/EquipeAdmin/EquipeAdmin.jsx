import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AvisoToast from '../../componentes/AvisoToast/AvisoToast'
import BotaoVoltar from '../../componentes/BotaoVoltar/BotaoVoltar'
import MenuAdmin, { BotaoMenuAdmin } from '../../componentes/MenuAdmin/MenuAdmin'
import {
  CONSELHOS_COMUNS,
  DIAS_DA_GRADE,
  HORARIOS_DA_GRADE,
  HORIZONTE_DIAS,
  TAMANHO_MINIMO_SENHA,
  aplicarGrade,
  carregarEquipe,
  carregarGrade,
  chaveDaCelula,
  iniciaisDoNome,
  planejarGrade,
  salvarProfissional,
} from '../../servicos/equipeAdmin'
import { cpfValido, emailValido, formatarCpf, formatarTelefone, telefoneValido } from '../../servicos/formatos'
import '../ClinicasAdmin/ClinicasAdmin.css'
import './EquipeAdmin.css'

const FORMULARIO_VAZIO = {
  id: null,
  nome: '',
  cpf: '',
  conselho: 'CRM-PE',
  registro: '',
  especialidade: '', // id escolhido na lista de especialidades ativas
  telefone: '',
  email: '',
  senha: '',
  idClinica: '',
  ativo: true,
}

function validar(f) {
  const erros = {}
  if (f.nome.trim().length < 3) erros.nome = 'Informe o nome completo.'
  if (!cpfValido(f.cpf)) erros.cpf = 'O CPF precisa ter 11 números.'
  if (!f.conselho.trim()) erros.conselho = 'Informe o conselho.'
  if (!f.registro.trim()) erros.registro = 'Informe o número.'
  if (!f.especialidade) erros.especialidade = 'Escolha a especialidade.'
  if (f.telefone.trim() && !telefoneValido(f.telefone)) erros.telefone = 'Informe o telefone com DDD, por exemplo (81) 99999-0000.'
  if (!f.email.trim() || !emailValido(f.email)) erros.email = 'Informe um e-mail válido. Ele será usado para entrar no app.'
  if (f.id == null && f.senha.length < TAMANHO_MINIMO_SENHA) erros.senha = `A senha precisa ter pelo menos ${TAMANHO_MINIMO_SENHA} caracteres.`
  if (f.id != null && f.senha && f.senha.length < TAMANHO_MINIMO_SENHA) erros.senha = `A nova senha precisa ter pelo menos ${TAMANHO_MINIMO_SENHA} caracteres.`
  if (!f.idClinica) erros.idClinica = 'Escolha a clínica.'
  return erros
}

function EquipeAdmin({ usuario, aoNavegar }) {
  const token = usuario?.token
  const [menuAberto, setMenuAberto] = useState(false)

  const [dados, setDados] = useState({ profissionais: [], clinicas: [], especialidades: [] })
  const [estado, setEstado] = useState('carregando')
  const [aviso, setAviso] = useState(null)
  const relogio = useRef(null)

  const [tela, setTela] = useState('lista') // lista | formulario | disponibilidade
  const [formulario, setFormulario] = useState(FORMULARIO_VAZIO)
  const [erros, setErros] = useState({})
  const [erroEnvio, setErroEnvio] = useState('')
  const [salvando, setSalvando] = useState(false)

  // Disponibilidade
  const [idDisponibilidade, setIdDisponibilidade] = useState(null)
  const [grade, setGrade] = useState(null) // { ativas, reservadas, registros }
  const [selecionadas, setSelecionadas] = useState(new Set())
  const [estadoGrade, setEstadoGrade] = useState('carregando')
  const [salvandoGrade, setSalvandoGrade] = useState(false)

  const carregar = useCallback(async () => {
    setEstado('carregando')
    try {
      setDados(await carregarEquipe(token))
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

  // ---------- Formulário ----------

  function abrirCadastro() {
    setFormulario({ ...FORMULARIO_VAZIO })
    setErros({})
    setErroEnvio('')
    setTela('formulario')
  }

  function abrirEdicao(p) {
    setFormulario({
      id: p.id,
      nome: p.nomeCadastro,
      cpf: formatarCpf(p.cpf),
      conselho: p.conselho || 'CRM-PE',
      registro: String(p.registro),
      especialidade: p.idEspecialidade == null ? '' : String(p.idEspecialidade),
      telefone: formatarTelefone(p.telefone),
      email: p.email,
      senha: '',
      idClinica: p.idClinica == null ? '' : String(p.idClinica),
      ativo: p.ativo,
    })
    setErros({})
    setErroEnvio('')
    setTela('formulario')
  }

  function alterarCampo(campo, valor) {
    setFormulario((f) => ({ ...f, [campo]: valor }))
    if (erros[campo]) setErros((e) => ({ ...e, [campo]: undefined }))
  }

  async function enviarFormulario(evento) {
    evento.preventDefault()
    const encontrados = validar(formulario)
    setErros(encontrados)
    if (Object.keys(encontrados).length > 0) return

    const editando = formulario.id != null
    const original = dados.profissionais.find((p) => p.id === formulario.id)

    setSalvando(true)
    setErroEnvio('')
    try {
      await salvarProfissional({ ...formulario, idEspecialidade: formulario.especialidade }, token)
      const novos = await carregarEquipe(token)
      setDados(novos)

      // Só dizemos que o status mudou se o servidor realmente o aplicou
      if (editando && original && original.ativo !== formulario.ativo) {
        const atual = novos.profissionais.find((p) => p.id === formulario.id)
        if (!atual || atual.ativo !== formulario.ativo) {
          setTela('lista')
          mostrar('erro', 'Dados salvos, mas o status não mudou', 'O servidor não aplicou a mudança de Ativo/Inativo.')
          return
        }
      }

      setTela('lista')
      mostrar('sucesso', editando ? 'Profissional atualizado' : 'Profissional cadastrado', `${formulario.nome.trim()} foi salvo com sucesso.`)
    } catch (e) {
      setErroEnvio(e.message)
    } finally {
      setSalvando(false)
    }
  }

  // ---------- Disponibilidade ----------

  const carregarDisponibilidade = useCallback(
    async (id) => {
      setEstadoGrade('carregando')
      try {
        const dadosGrade = await carregarGrade(id, token)
        setGrade(dadosGrade)
        setSelecionadas(new Set(dadosGrade.ativas))
        setEstadoGrade('ok')
      } catch {
        setEstadoGrade('erro')
      }
    },
    [token]
  )

  function abrirDisponibilidade(p) {
    setAviso(null)
    setIdDisponibilidade(p.id)
    setGrade(null)
    setTela('disponibilidade')
    carregarDisponibilidade(p.id)
  }

  function trocarProfissionalDisponibilidade(id) {
    setIdDisponibilidade(Number(id))
    carregarDisponibilidade(Number(id))
  }

  function alternarHorario(dia, hora) {
    const celula = chaveDaCelula(dia, hora)
    setSelecionadas((atual) => {
      const novo = new Set(atual)
      if (novo.has(celula)) novo.delete(celula)
      else novo.add(celula)
      return novo
    })
  }

  const alterado = useMemo(() => {
    if (!grade) return false
    if (grade.ativas.size !== selecionadas.size) return true
    return [...selecionadas].some((c) => !grade.ativas.has(c))
  }, [grade, selecionadas])

  async function salvarDisponibilidade() {
    if (!grade || !alterado) return
    const plano = planejarGrade(grade.registros, grade.ativas, selecionadas)
    setSalvandoGrade(true)
    try {
      const falhas = await aplicarGrade(plano, idDisponibilidade, token)
      await carregarDisponibilidade(idDisponibilidade)
      if (falhas > 0) {
        mostrar('erro', 'Salvo em parte', `${falhas} ${falhas === 1 ? 'horário não pôde ser alterado' : 'horários não puderam ser alterados'}. Horário que já teve consulta marcada não pode ser excluído. Confira a grade.`)
      } else if (plano.mantidasPorReserva > 0) {
        mostrar('sucesso', 'Disponibilidade salva', 'Horários com consulta marcada foram mantidos.')
      } else {
        mostrar('sucesso', 'Disponibilidade salva', 'A agenda do profissional foi atualizada.')
      }
    } catch {
      mostrar('erro', 'Não foi possível salvar', 'Verifique a conexão e tente de novo.')
    } finally {
      setSalvandoGrade(false)
    }
  }

  // ---------- Telas ----------

  if (tela === 'formulario') {
    const editando = formulario.id != null
    const erro = (nome) => erros[nome] && <small role="alert">{erros[nome]}</small>

    return (
      <div className="pagina-fundo">
        <div className="clinicas">
          <header className="clinicas-topo">
            <BotaoVoltar aoClicar={() => !salvando && setTela('lista')} />
            <h1>{editando ? 'Editar Profissional' : 'Cadastrar Profissional'}</h1>
          </header>

          <form className="clinicas-conteudo clinicas-formulario" onSubmit={enviarFormulario} noValidate>
            <label className="clinicas-campo">
              Nome completo
              <input value={formulario.nome} placeholder="Dr. Nome Sobrenome" autoComplete="off" aria-invalid={Boolean(erros.nome)} onChange={(e) => alterarCampo('nome', e.target.value)} />
              {erro('nome')}
            </label>

            <label className="clinicas-campo">
              CPF
              <input value={formulario.cpf} placeholder="000.000.000-00" inputMode="numeric" aria-invalid={Boolean(erros.cpf)} onChange={(e) => alterarCampo('cpf', formatarCpf(e.target.value))} />
              {erro('cpf')}
            </label>

            <div className="equipe-duas-colunas">
              <label className="clinicas-campo">
                Conselho
                <input list="equipe-conselhos" value={formulario.conselho} aria-invalid={Boolean(erros.conselho)} onChange={(e) => alterarCampo('conselho', e.target.value)} />
                <datalist id="equipe-conselhos">
                  {CONSELHOS_COMUNS.map((c) => <option key={c} value={c} />)}
                </datalist>
                {erro('conselho')}
              </label>
              <label className="clinicas-campo">
                Nº do registro
                <input value={formulario.registro} placeholder="00.000" aria-invalid={Boolean(erros.registro)} onChange={(e) => alterarCampo('registro', e.target.value)} />
                {erro('registro')}
              </label>
            </div>

            <label className="clinicas-campo">
              Especialidade
              <select value={formulario.especialidade} aria-invalid={Boolean(erros.especialidade)} onChange={(e) => alterarCampo('especialidade', e.target.value)}>
                <option value="">Selecionar...</option>
                {dados.especialidades
                  .filter((e) => e.ativo !== false || String(e.id) === formulario.especialidade)
                  .map((e) => (
                    <option key={e.id} value={String(e.id)}>{e.nome}{e.ativo === false ? ' (inativa)' : ''}</option>
                  ))}
              </select>
              {dados.especialidades.every((e) => e.ativo === false) && (
                <small className="equipe-dica">Nenhuma especialidade ativa. Cadastre ou ative uma na aba Especialid.</small>
              )}
              {erro('especialidade')}
            </label>

            <label className="clinicas-campo">
              Telefone
              <input type="tel" inputMode="tel" value={formulario.telefone} placeholder="(81) 99999-0000" aria-invalid={Boolean(erros.telefone)} onChange={(e) => alterarCampo('telefone', formatarTelefone(e.target.value))} />
              {erro('telefone')}
            </label>

            <label className="clinicas-campo">
              E-mail
              <input type="email" value={formulario.email} placeholder="profissional@email.com" autoComplete="off" aria-invalid={Boolean(erros.email)} onChange={(e) => alterarCampo('email', e.target.value)} />
              {erro('email')}
            </label>

            <label className="clinicas-campo">
              {editando ? 'Nova senha (opcional)' : 'Senha de acesso'}
              <input type="password" value={formulario.senha} autoComplete="new-password" placeholder={editando ? 'Deixe em branco para manter a atual' : `Mínimo de ${TAMANHO_MINIMO_SENHA} caracteres`} aria-invalid={Boolean(erros.senha)} onChange={(e) => alterarCampo('senha', e.target.value)} />
              {!editando && <small className="equipe-dica">É a senha que o profissional usará, com o e-mail acima, para entrar no app.</small>}
              {erro('senha')}
            </label>

            <label className="clinicas-campo">
              Clínica vinculada
              <select value={formulario.idClinica} aria-invalid={Boolean(erros.idClinica)} onChange={(e) => alterarCampo('idClinica', e.target.value)}>
                <option value="">Selecionar clínica...</option>
                {dados.clinicas
                  .filter((c) => c.ativo || String(c.id) === formulario.idClinica)
                  .map((c) => (
                    <option key={c.id} value={String(c.id)}>{c.nome}{c.ativo ? '' : ' (inativa)'}</option>
                  ))}
              </select>
              {erro('idClinica')}
            </label>

            <label className="clinicas-campo">
              Status
              <select value={formulario.ativo ? 'ativo' : 'inativo'} onChange={(e) => alterarCampo('ativo', e.target.value === 'ativo')}>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
              {!formulario.ativo && (
                <small className="equipe-dica">Profissional inativo não aparece para os pacientes e não consegue entrar no app.</small>
              )}
            </label>

            {erroEnvio && <p className="clinicas-erro-envio" role="alert">{erroEnvio}</p>}

            <button type="submit" className="clinicas-botao-principal" disabled={salvando}>
              {salvando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Salvar profissional'}
            </button>
            <button type="button" className="clinicas-botao-secundario" onClick={() => setTela('lista')} disabled={salvando}>
              Cancelar
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (tela === 'disponibilidade') {
    return (
      <div className="pagina-fundo">
        <AvisoToast aviso={aviso} aoFechar={() => setAviso(null)} />
        <div className="clinicas">
          <header className="clinicas-topo">
            <BotaoVoltar aoClicar={() => !salvandoGrade && setTela('lista')} />
            <h1>Disponibilidade</h1>
          </header>

          <div className="clinicas-conteudo equipe-grade-conteudo">
            <label className="equipe-rotulo-secao" htmlFor="equipe-profissional">Profissional</label>
            <select
              id="equipe-profissional"
              className="equipe-seletor"
              value={idDisponibilidade ?? ''}
              onChange={(e) => trocarProfissionalDisponibilidade(e.target.value)}
              disabled={salvandoGrade}
            >
              {dados.profissionais.map((p) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>

            <div className="equipe-grade-titulo">
              <span className="equipe-rotulo-secao">Horários disponíveis</span>
              <span className="equipe-dica-topo">Toque para ativar/desativar</span>
            </div>
            <p className="equipe-grade-nota">
              Azul = disponível. Vale para as próximas {HORIZONTE_DIAS / 7} semanas. Contorno tracejado = já tem consulta marcada (esse horário não pode ser removido).
            </p>

            {estadoGrade === 'carregando' && <p className="clinicas-estado">Carregando horários...</p>}
            {estadoGrade === 'erro' && (
              <p className="clinicas-estado" role="alert">
                Não foi possível carregar os horários.{' '}
                <button type="button" className="clinicas-link" onClick={() => carregarDisponibilidade(idDisponibilidade)}>Tentar de novo</button>
              </p>
            )}

            {estadoGrade === 'ok' && grade && DIAS_DA_GRADE.map((dia) => (
              <section key={dia.numero} className="equipe-dia" aria-label={dia.rotulo}>
                <h2>{dia.rotulo}</h2>
                <div className="equipe-horas">
                  {HORARIOS_DA_GRADE.map((hora) => {
                    const celula = chaveDaCelula(dia.numero, hora)
                    const ativa = selecionadas.has(celula)
                    const reservada = grade.reservadas.has(celula)
                    return (
                      <button
                        type="button"
                        key={hora}
                        className={['equipe-hora', ativa && 'equipe-hora-ativa', reservada && 'equipe-hora-reservada'].filter(Boolean).join(' ')}
                        aria-pressed={ativa}
                        aria-label={`${dia.rotulo} ${hora}${reservada ? ', com consulta marcada' : ''}`}
                        onClick={() => alternarHorario(dia.numero, hora)}
                        disabled={salvandoGrade}
                      >
                        {hora}
                      </button>
                    )
                  })}
                </div>
              </section>
            ))}

            {estadoGrade === 'ok' && (
              <button type="button" className="clinicas-botao-principal equipe-salvar-grade" onClick={salvarDisponibilidade} disabled={!alterado || salvandoGrade}>
                {salvandoGrade ? 'Salvando...' : 'Salvar disponibilidade'}
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const paletas = ['equipe-avatar-0', 'equipe-avatar-1', 'equipe-avatar-2']

  return (
    <div className="pagina-fundo">
      <AvisoToast aviso={aviso} aoFechar={() => setAviso(null)} />

      <div className="clinicas">
        <header className="clinicas-topo">
          <BotaoVoltar aoClicar={() => aoNavegar('inicio')} />
          <h1>Profissionais</h1>
          <BotaoMenuAdmin aoClicar={() => setMenuAberto(true)} />
        </header>

        <div className="clinicas-conteudo">
          {estado === 'carregando' && <p className="clinicas-estado">Carregando profissionais...</p>}
          {estado === 'erro' && (
            <p className="clinicas-estado" role="alert">
              Não foi possível carregar os profissionais e as especialidades.{' '}
              <button type="button" className="clinicas-link" onClick={carregar}>Tentar de novo</button>
            </p>
          )}
          {estado === 'ok' && dados.profissionais.length === 0 && (
            <p className="clinicas-estado">Nenhum profissional cadastrado ainda. Toque no botão + para cadastrar o primeiro.</p>
          )}

          <ul className="clinicas-lista">
            {dados.profissionais.map((p, i) => (
              <li className="clinicas-cartao" key={p.id}>
                <div className="equipe-cartao-topo">
                  <span className={`equipe-avatar ${paletas[i % 3]}`} aria-hidden="true">{iniciaisDoNome(p.nome)}</span>
                  <div className="equipe-cartao-nome">
                    <h2>{p.nome}</h2>
                    <p>{[p.crm, p.especialidade].filter(Boolean).join(' · ')}</p>
                    {p.clinicaNome && <p>🏥 {p.clinicaNome}</p>}
                  </div>
                  <span className={p.ativo ? 'clinicas-selo clinicas-selo-ativo' : 'clinicas-selo clinicas-selo-inativo'}>
                    {p.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                {(p.telefone || p.email) && (
                  <p className="clinicas-linha">
                    <span aria-hidden="true">📞</span>
                    {[p.telefone, p.email].filter(Boolean).join(' · ')}
                  </p>
                )}
                {p.cpf && <p className="clinicas-linha">CPF {formatarCpf(p.cpf)}</p>}

                <div className="clinicas-acoes">
                  <button type="button" className="clinicas-botao-editar" onClick={() => abrirEdicao(p)}>Editar</button>
                  <button type="button" className="equipe-botao-disponibilidade" onClick={() => abrirDisponibilidade(p)}>Disponibilidade</button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {estado === 'ok' && (
          <button type="button" className="clinicas-novo" onClick={abrirCadastro} aria-label="Cadastrar novo profissional">+</button>
        )}
        <MenuAdmin itemAtivo="equipe" aoNavegar={aoNavegar} menuAberto={menuAberto} aoFecharMenu={() => setMenuAberto(false)} />
      </div>
    </div>
  )
}

export default EquipeAdmin
