import './AvisoToast.css'

// Aviso rápido no topo da tela. tipo: 'sucesso' ou 'erro'
function AvisoToast({ aviso, aoFechar }) {
  if (!aviso) return null

  return (
    <div className="aviso-toast" role="status">
      <span className={`aviso-toast-icone aviso-toast-icone-${aviso.tipo}`}>{aviso.tipo === 'erro' ? '!' : '✓'}</span>
      <div className="aviso-toast-texto">
        <strong>{aviso.titulo}</strong>
        <span>{aviso.texto}</span>
      </div>
      <button type="button" className="aviso-toast-fechar" onClick={aoFechar} aria-label="Fechar aviso">✕</button>
    </div>
  )
}

export default AvisoToast
