import Botao from '../Botao/Botao'
import './TelaEmConstrucao.css'

// Tela provisória usada enquanto as telas reais de cada perfil não existem.
function TelaEmConstrucao({ titulo, nome, aoSair }) {
  return (
    <div className="em-construcao">
      <h1>{titulo}</h1>
      {nome && <p className="em-construcao-nome">Olá, {nome}</p>}
      <p>Esta área ainda está em construção.</p>
      <Botao texto="Sair" aoClicar={aoSair} />
    </div>
  )
}

export default TelaEmConstrucao
