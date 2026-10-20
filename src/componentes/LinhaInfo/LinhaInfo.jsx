import './LinhaInfo.css'

function LinhaInfo({ icone, rotulo, valor }) {
  return (
    <div className="linha-info">
      <span className="linha-info-icone">{icone}</span>
      <div className="linha-info-texto">
        <p className="linha-info-rotulo">{rotulo}</p>
        <p className="linha-info-valor">{valor}</p>
      </div>
    </div>
  )
}

export default LinhaInfo
