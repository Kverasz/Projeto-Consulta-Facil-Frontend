import { useState } from 'react'
import BotaoVoltar from '../../componentes/BotaoVoltar/BotaoVoltar'
import CampoTexto from '../../componentes/CampoTexto/CampoTexto'
import Botao from '../../componentes/Botao/Botao'
import './Cadastro.css'

function Cadastro({ aoVoltar }) {
  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [endereco, setEndereco] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')

  async function realizarCadastro(evento) {
    evento.preventDefault()

    if (senha !== confirmarSenha) {
      alert('As senhas não coincidem.')
      return
    }

    // Dados enviados para a API do backend
    const dadosPaciente = {
      nome: nome,
      email: email,
      cpf: cpf,
      senha: senha,
      telefone: telefone,
      data_nascimento: dataNascimento ? new Date(dataNascimento).toISOString() : null,
      endereco: endereco || 'Recife - PE'
    }

    try {
      const urlApi = 'https://back-end-pi-ihs1.onrender.com/pacientes' 
      
      const resposta = await fetch(urlApi, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosPaciente)
      })

      if (resposta.ok) {
        alert('Cadastro realizado com sucesso!')
        if (aoVoltar) aoVoltar()
      } else {
        alert('Erro ao realizar o cadastro. Verifica os dados preenchidos.')
      }
    } catch (erro) {
      console.error('Erro na requisição:', erro)
      alert('Não foi possível conectar ao servidor.')
    }
  }

  return (
    <div className="cadastro">
      <div className="cadastro-topo">
        <div className="botao-voltar-container">
          <BotaoVoltar aoClicar={aoVoltar || (() => window.history.back())} />
        </div>
        <h1 className="cadastro-topo-titulo">Criar conta</h1>
      </div>

      <div className="cadastro-boas-vindas">
        <h2>Bem-vindo!</h2>
        <p>Preencha os dados para criar sua conta</p>
      </div>

      <form className="cadastro-form" onSubmit={realizarCadastro}>
        <CampoTexto 
          rotulo="Nome completo" 
          tipo="text" 
          placeholder="Maria Aparecida Silva"
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
          rotulo="Data de nascimento" 
          tipo="date" 
          valor={dataNascimento} 
          aoMudar={(e) => setDataNascimento(e.target.value)} 
        />
        <CampoTexto 
          rotulo="Telefone / WhatsApp" 
          tipo="tel" 
          placeholder="(81) 99999-0000"
          valor={telefone} 
          aoMudar={(e) => setTelefone(e.target.value)} 
        />
        <CampoTexto 
          rotulo="E-mail" 
          tipo="email" 
          placeholder="seu@email.com"
          valor={email} 
          aoMudar={(e) => setEmail(e.target.value)} 
        />
        <CampoTexto 
          rotulo="Endereço" 
          tipo="text" 
          placeholder="Ex: Rua Exemplo, 123 - Recife"
          valor={endereco} 
          aoMudar={(e) => setEndereco(e.target.value)} 
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

        <Botao texto="Cadastrar" tipo="submit" />
      </form>
    </div>
  )
}

export default Cadastro