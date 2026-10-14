import BotaoVoltar from '../../componentes/BotaoVoltar/BotaoVoltar'
import './SelecaoPerfil.css'

function SelecaoPerfil({ aoVoltar, aoSelecionarPaciente, aoSelecionarMedico, aoIrParaLogin }) {
  return (
    <div className="selecao-perfil">
      <div className="selecao-topo">
        <BotaoVoltar aoClicar={aoVoltar} />
        <h1>Criar conta</h1>
      </div>

      <div className="selecao-titulo">
        <h2>Qual é o seu perfil?</h2>
        <p>Selecione o tipo de conta que deseja criar.</p>
      </div>

      <div className="perfis-lista">
        <div className="cartao-perfil" onClick={aoSelecionarPaciente}>
          <div className="icone-perfil paciente">👤</div>
          <div className="info-perfil">
            <h3>Paciente</h3>
            <p>Agende consultas e acompanhe seu histórico de saúde.</p>
          </div>
          <span className="seta">&gt;</span>
        </div>

        <div className="cartao-perfil" onClick={aoSelecionarMedico}>
          <div className="icone-perfil medico">🩺</div>
          <div className="info-perfil">
            <h3>Profissional de Saúde</h3>
            <p>Gerencie sua agenda, consultas e disponibilidade.</p>
          </div>
          <span className="seta">&gt;</span>
        </div>

        <div className="cartao-perfil desativado">
          <div className="icone-perfil admin">⚙️</div>
          <div className="info-perfil">
            <h3>Administrador</h3>
            <p>Gerencie clínicas, profissionais e especialidades.</p>
          </div>
          <span className="seta">&gt;</span>
        </div>
      </div>

      <div className="rodape-login-link">
        <p>Já tenho uma conta <button type="button" onClick={aoIrParaLogin}>Entrar</button></p>
      </div>
    </div>
  )
}

export default SelecaoPerfil