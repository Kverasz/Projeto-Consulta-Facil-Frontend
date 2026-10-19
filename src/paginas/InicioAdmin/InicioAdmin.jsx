import TelaEmConstrucao from '../../componentes/TelaEmConstrucao/TelaEmConstrucao'

function InicioAdmin({ usuario, aoSair }) {
  return <TelaEmConstrucao titulo="Área do Administrador" nome={usuario?.nome} aoSair={aoSair} />
}

export default InicioAdmin
