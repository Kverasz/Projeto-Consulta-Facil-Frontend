<<<<<<< HEAD
import Inicio from './paginas/Inicio/Inicio'

function App() {
  // Por enquanto o App mostra direto a tela de Início.
  // Quando tivermos mais telas, é aqui que vamos trocar entre elas.
  return <Inicio />
}

export default App
=======
import { useState } from 'react'
import Login from './paginas/Login/Login'
import Cadastro from './paginas/Cadastro/Cadastro'

function App() {
  const [telaAtual, setTelaAtual] = useState('login')

  if (telaAtual === 'cadastro') {
    return <Cadastro aoVoltar={() => setTelaAtual('login')} />
  }

  return <Login aoIrParaCadastro={() => setTelaAtual('cadastro')} />
}

export default App
>>>>>>> 67ba2d69406735d8df7b8882aa36a78782ca899d
