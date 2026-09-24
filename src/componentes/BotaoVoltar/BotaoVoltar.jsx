import './BotaoVoltar.css'

function BotaoVoltar({ aoClicar }) {
  return (
    <button
      type="button"
      className="botao-voltar"
      onClick={aoClicar}
      aria-label="Voltar"
    >
      {/* Setinha desenhada com SVG */}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M15 5l-7 7 7 7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

export default BotaoVoltar
