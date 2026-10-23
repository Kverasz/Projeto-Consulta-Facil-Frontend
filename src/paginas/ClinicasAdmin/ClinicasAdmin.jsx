import { useCallback, useEffect, useState } from 'react'
import AvisoToast from '../../componentes/AvisoToast/AvisoToast'
import BotaoVoltar from '../../componentes/BotaoVoltar/BotaoVoltar'
import FolhaConfirmacao from '../../componentes/FolhaConfirmacao/FolhaConfirmacao'
import MenuAdmin, { BotaoMenuAdmin } from '../../componentes/MenuAdmin/MenuAdmin'
import {
  alterarStatusClinica,
  carregarClinicasAdmin,
  cnpjValido,
  formatarCnpj,
  salvarClinica,
} from '../../servicos/clinicasAdmin'
import { emailValido, formatarTelefone, telefoneValido } from '../../servicos/formatos'
import './ClinicasAdmin.css'

const FORMULARIO_VAZIO = {
  id: null,
  nome: '',
  cnpj: '',
  endereco: '',
  bairro: '',
  telefone: '',
  email: '',
  horario: '',
  ativo: true,
}

function validar(dados) {
  const erros = {}
  if (dados.nome.trim().length < 3) erros.nome = 'Informe o nome da clínica.'
  if (!cnpjValido(dados.cnpj)) erros.cnpj = 'O CNPJ precisa ter 14 números.'
  if (dados.endereco.trim().length < 3) erros.endereco = 'Informe a rua e o número.'
  if (dados.telefone.trim() && !telefoneValido(dados.telefone)) erros.telefone = 'Informe o telefone com DDD, por exemplo (81) 3333-0000.'
  if (dados.email.trim() && !emailValido(dados.email)) erros.email = 'Informe um e-mail válido.'
  return erros
}

function ClinicasAdmin({ usuario, aoNavegar }) {
  const token = usuario?.token
  const [menuAberto, setMenuAberto] = useState(false)

  const [clinicas, setClinicas] = useState([])
  const [estado, setEstado] = useState('carregando')
  const [aviso, setAviso] = useState(null)

  const [formulario, setFormulario] = useState(null) // null = lista; objeto = cadastro/edição
  const [erros, setErros] = useState({})
  const [erroEnvio, setErroEnvio] = useState('')
  const [salvando, setSalvando] = useState(false)

  const [alvoStatus, setAlvoStatus] = useState(null)
  const [alterando, setAlterando] = useState(false)

  const carregar = useCallback(async () => {
    setEstado('carregando')
    try {
      setClinicas(await carregarClinicasAdmin(token))
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
    window.clearTimeout(mostrar.relogio)
    mostrar.relogio = window.setTimeout(() => setAviso(null), 4000)
  }

  function abrirCadastro() {
    setFormulario({ ...FORMULARIO_VAZIO })
    setErros({})
    setErroEnvio('')
  }

  function abrirEdicao(clinica) {
    setFormulario({
      id: clinica.id,
      nome: clinica.nome,
      cnpj: formatarCnpj(clinica.cnpj),
      endereco: clinica.endereco,
      bairro: clinica.bairro,
      telefone: formatarTelefone(clinica.telefone),
      email: clinica.email,
      horario: clinica.horario,
      ativo: clinica.ativo,
    })
    setErros({})
    setErroEnvio('')
  }

  function fecharFormulario() {
    if (salvando) return
    setFormulario(null)
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

    setSalvando(true)
    setErroEnvio('')
    try {
      await salvarClinica(formulario, token)
      const editando = formulario.id != null
      setFormulario(null)
      await carregar()
      mostrar('sucesso', editando ? 'Clínica atualizada' : 'Clínica cadastrada', `${formulario.nome.trim()} foi salva com sucesso.`)
    } catch (e) {
      setErroEnvio(e.message)
    } finally {
      setSalvando(false)
    }
  }

  async function confirmarStatus() {
    if (!alvoStatus) return
    const novoStatus = !alvoStatus.ativo
    setAlterando(true)
    try {
      await alterarStatusClinica(alvoStatus, novoStatus, token)
      setClinicas(await carregarClinicasAdmin(token))
      mostrar('sucesso', novoStatus ? 'Clínica ativada' : 'Clínica desativada', `${alvoStatus.nome} agora está ${novoStatus ? 'ativa' : 'inativa'}.`)
    } catch (e) {
      mostrar('erro', 'Não foi possível alterar o status', e.message)
    } finally {
      setAlterando(false)
      setAlvoStatus(null)
    }
  }

  // ---------- Formulário (cadastrar / editar) ----------
  if (formulario) {
    const editando = formulario.id != null
    const campo = (rotulo, nome, props = {}) => (
      <label className="clinicas-campo">
        {rotulo}
        <input
          value={formulario[nome]}
          onChange={(e) => alterarCampo(nome, props.formatar ? props.formatar(e.target.value) : e.target.value)}
          aria-invalid={Boolean(erros[nome])}
          {...props.atributos}
        />
        {erros[nome] && <small role="alert">{erros[nome]}</small>}
      </label>
    )

    return (
      <div className="pagina-fundo">
        <div className="clinicas">
          <header className="clinicas-topo">
            <BotaoVoltar aoClicar={fecharFormulario} />
            <h1>{editando ? 'Editar Clínica' : 'Cadastrar Clínica'}</h1>
          </header>

          <form className="clinicas-conteudo clinicas-formulario" onSubmit={enviarFormulario} noValidate>
            {campo('Nome da clínica', 'nome', { atributos: { placeholder: 'Ex: Clínica Boa Saúde', autoComplete: 'off' } })}
            {campo('CNPJ', 'cnpj', {
              formatar: formatarCnpj,
              atributos: { placeholder: '00.000.000/0001-00', inputMode: 'numeric' },
            })}
            {campo('Endereço', 'endereco', { atributos: { placeholder: 'Rua, número' } })}
            {campo('Bairro', 'bairro', { atributos: { placeholder: 'Ex: Boa Viagem' } })}
            {campo('Telefone', 'telefone', {
              formatar: formatarTelefone,
              atributos: { type: 'tel', inputMode: 'tel', placeholder: '(81) 0000-0000' },
            })}
            {campo('E-mail', 'email', { atributos: { type: 'email', placeholder: 'contato@clinica.com' } })}
            {campo('Horário de funcionamento', 'horario', { atributos: { placeholder: 'Ex: 07:00–19:00' } })}

            <label className="clinicas-campo">
              Status
              <select value={formulario.ativo ? 'ativo' : 'inativo'} onChange={(e) => alterarCampo('ativo', e.target.value === 'ativo')}>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </label>

            {erroEnvio && <p className="clinicas-erro-envio" role="alert">{erroEnvio}</p>}

            <button type="submit" className="clinicas-botao-principal" disabled={salvando}>
              {salvando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Salvar clínica'}
            </button>
            <button type="button" className="clinicas-botao-secundario" onClick={fecharFormulario} disabled={salvando}>
              Cancelar
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ---------- Lista ----------
  return (
    <div className="pagina-fundo">
      <AvisoToast aviso={aviso} aoFechar={() => setAviso(null)} />

      <div className="clinicas">
        <header className="clinicas-topo">
          <BotaoVoltar aoClicar={() => aoNavegar('inicio')} />
          <h1>Clínicas</h1>
          <BotaoMenuAdmin aoClicar={() => setMenuAberto(true)} />
        </header>

        <div className="clinicas-conteudo">
          {estado === 'carregando' && <p className="clinicas-estado">Carregando clínicas...</p>}

          {estado === 'erro' && (
            <p className="clinicas-estado" role="alert">
              Não foi possível carregar as clínicas.{' '}
              <button type="button" className="clinicas-link" onClick={carregar}>
                Tentar de novo
              </button>
            </p>
          )}

          {estado === 'ok' && clinicas.length === 0 && (
            <p className="clinicas-estado">Nenhuma clínica cadastrada ainda. Toque no botão + para cadastrar a primeira.</p>
          )}

          <ul className="clinicas-lista">
            {clinicas.map((clinica) => (
              <li className="clinicas-cartao" key={clinica.id}>
                <div className="clinicas-cartao-topo">
                  <h2>{clinica.nome}</h2>
                  <span className={clinica.ativo ? 'clinicas-selo clinicas-selo-ativo' : 'clinicas-selo clinicas-selo-inativo'}>
                    {clinica.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                <p className="clinicas-linha clinicas-linha-suave">
                  <span aria-hidden="true">📍</span>
                  {[clinica.bairro || clinica.endereco, clinica.cnpj && `CNPJ ${formatarCnpj(clinica.cnpj)}`].filter(Boolean).join(' · ')}
                </p>
                {(clinica.telefone || clinica.email) && (
                  <p className="clinicas-linha">
                    <span aria-hidden="true">📞</span>
                    {[clinica.telefone, clinica.email].filter(Boolean).join(' · ')}
                  </p>
                )}
                {clinica.horario && (
                  <p className="clinicas-linha">
                    <span aria-hidden="true">🕒</span>
                    {clinica.horario}
                  </p>
                )}
                {clinica.especialidades.length > 0 && (
                  <p className="clinicas-linha">
                    <span aria-hidden="true">🩺</span>
                    {clinica.especialidades.join(', ')}
                  </p>
                )}

                <div className="clinicas-acoes">
                  <button type="button" className="clinicas-botao-editar" onClick={() => abrirEdicao(clinica)}>
                    Editar
                  </button>
                  <button
                    type="button"
                    className={clinica.ativo ? 'clinicas-botao-desativar' : 'clinicas-botao-ativar'}
                    onClick={() => setAlvoStatus(clinica)}
                  >
                    {clinica.ativo ? 'Desativar' : 'Ativar'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <button type="button" className="clinicas-novo" onClick={abrirCadastro} aria-label="Cadastrar nova clínica">
          +
        </button>

        <MenuAdmin itemAtivo="clinicas" aoNavegar={aoNavegar} menuAberto={menuAberto} aoFecharMenu={() => setMenuAberto(false)} />

        <FolhaConfirmacao
          aberta={Boolean(alvoStatus)}
          titulo={alvoStatus?.ativo ? 'Desativar clínica?' : 'Ativar clínica?'}
          texto={
            alvoStatus?.ativo
              ? `${alvoStatus?.nome} ficará inacessível para os pacientes: não aparecerá no agendamento e as consultas dela não poderão ser reagendadas. Os agendamentos já feitos continuam existindo e podem ser cancelados.`
              : `${alvoStatus?.nome} voltará a aparecer para os pacientes no agendamento.`
          }
          rotuloConfirmar={alvoStatus?.ativo ? 'Desativar' : 'Ativar'}
          perigo={Boolean(alvoStatus?.ativo)}
          enviando={alterando}
          aoConfirmar={confirmarStatus}
          aoCancelar={() => setAlvoStatus(null)}
        />
      </div>
    </div>
  )
}

export default ClinicasAdmin
