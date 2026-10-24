import imagemLogo from '../../assets/logo.png'
import './Logo.css'

// Logo do Consulta Fácil. "tamanho" é a largura em px (a imagem é quadrada).
// decorativa: quando o nome do app já aparece em texto ao lado, o leitor de tela não precisa repeti-lo.
function Logo({ tamanho = 48, decorativa = false, className = '' }) {
  return (
    <img
      className={['logo', className].filter(Boolean).join(' ')}
      src={imagemLogo}
      width={tamanho}
      height={tamanho}
      alt={decorativa ? '' : 'Consulta Fácil'}
      aria-hidden={decorativa ? 'true' : undefined}
      draggable="false"
    />
  )
}

export default Logo
