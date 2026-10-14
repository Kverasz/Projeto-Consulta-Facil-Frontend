import { useState } from 'react'
import BotaoVoltar from '../../../componentes/BotaoVoltar/BotaoVoltar'
import CampoTexto from '../../../componentes/CampoTexto/CampoTexto'
import Botao from '../../../componentes/Botao/Botao'
import './CadastroMedico.css'

function CadastroMedico({ aoVoltar, aoIrParaLogin }) {
  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [registroProfissional, setRegistroProfissional] = useState('')
  const [conselho, setConselho] = useState('')
  const [especialidade, setEspecialidade] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [clinica, setClinica] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')

  async function realizarCadastro(evento) {
    evento.preventDefault()

    if (senha !== confirmarSenha) {
      alert('As senhas não coincidem.')
      return
    }

    const dadosProfissional = {
      nome: nome,
      cpf: cpf,
      registro_profissional: registroProfissional,
      conselho: conselho,
      telefone: telefone,
      email: email,
      senha: senha,
      id_clinica: Number(clinica) || 1,
      id_especialidade: Number(especialidade) || 1
    }

    try {
      const urlApi = 'https://back-end-pi-ihs1.onrender.com/profissionais' 
      
      const resposta = await fetch(urlApi, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosProfissional)
      })

      if (resposta.ok) {
        alert('Cadastro de profissional realizado com sucesso!')
        if (aoIrParaLogin) aoIrParaLogin()
      } else {
        // Lê a resposta do erro enviada pelo servidor para sabermos o motivo exato
        const erroServidor = await resposta.text()
        console.error('Detalhe do erro do servidor:', erroServidor)
        alert(`Erro ao realizar o cadastro: ${erroServidor || resposta.statusText}`)
      }
    } catch (erro) {
      console.error('Erro na requisição:', erro)
      alert('Não foi possível conectar ao servidor.')
    }
  }

  return (
    <div className="cadastro-medico">
      <div className="cadastro-topo">
        <div className="botao-voltar-container">
          <BotaoVoltar aoClicar={aoVoltar || (() => window.history.back())} />
        </div>
        <h1 className="cadastro-topo-titulo">Cadastro - Profissional de Saúde</h1>
      </div>

      <div className="cadastro-boas-vindas">
        <p>Preencha os dados para criar sua conta.</p>
      </div>

      <form className="cadastro-form" onSubmit={realizarCadastro}>
        <CampoTexto 
          rotulo="Nome completo" 
          tipo="text" 
          placeholder="Dr. Carlos Mendes"
          valor={nome} 
          aoMudar={(e) => setNome(e.target.value)} 
        />
        <CampoTexto 
          rotulo="CPF" 
          tipo="text" 
          placeholder="000.000.000-00"
          valor={cpf} 
          aoMudar={(e) => setCpf(e.target.value)} 
        />
        <CampoTexto 
          rotulo="Nº do registro profissional" 
          tipo="text" 
          placeholder="Ex: CRM-PE 24.501"
          valor={registroProfissional} 
          aoMudar={(e) => setRegistroProfissional(e.target.value)} 
        />
        <CampoTexto 
          rotulo="Conselho" 
          tipo="text" 
          placeholder="Ex: CRM-PE, CRO-PE"
          valor={conselho} 
          aoMudar={(e) => setConselho(e.target.value)} 
        />
        <CampoTexto 
          rotulo="Especialidade" 
          tipo="text" 
          placeholder="Ex: Ortopedia"
          valor={especialidade} 
          aoMudar={(e) => setEspecialidade(e.target.value)} 
        />
        <CampoTexto 
          rotulo="Telefone" 
          tipo="tel" 
          placeholder="(81) 99999-0000"
          valor={telefone} 
          aoMudar={(e) => setTelefone(e.target.value)} 
        />
        <CampoTexto 
          rotulo="E-mail profissional" 
          tipo="email" 
          placeholder="profissional@email.com"
          valor={email} 
          aoMudar={(e) => setEmail(e.target.value)} 
        />
        <CampoTexto 
          rotulo="Clínica vinculada" 
          tipo="text" 
          placeholder="Ex: Clínica Boa Saúde"
          valor={clinica} 
          aoMudar={(e) => setClinica(e.target.value)} 
        />
        <CampoTexto 
          rotulo="Senha" 
          tipo="password" 
          placeholder="Mínimo 8 caracteres"
          valor={senha} 
          aoMudar={(e) => setSenha(e.target.value)} 
        />
        <CampoTexto 
          rotulo="Confirmar senha" 
          tipo="password" 
          placeholder="Repita a senha"
          valor={confirmarSenha} 
          aoMudar={(e) => setConfirmarSenha(e.target.value)} 
        />

        <div className="termo-privacidade">
          <p>Ao criar sua conta, você concorda com os <span>Termos de Uso</span> e a <span>Política de Privacidade</span>.</p>
        </div>

        <Botao texto="Criar conta" tipo="submit" />

        <div className="cadastro-login-link">
          <p>Já tenho uma conta <button type="button" onClick={aoIrParaLogin}>Entrar</button></p>
        </div>
      </form>
    </div>
  )
}

export default CadastroMedico