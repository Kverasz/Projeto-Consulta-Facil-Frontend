import './FolhaConfirmacao.css'

// Janela de confirmação que sobe de baixo. "perigo" deixa o botão principal vermelho.
function FolhaConfirmacao({ aberta, titulo, texto, rotuloConfirmar, perigo, enviando, aoConfirmar, aoCancelar }) {
  return (
    <>
      <div
        className={aberta ? 'folha-fundo folha-fundo-visivel' : 'folha-fundo'}
        onClick={enviando ? undefined : aoCancelar}
      />

      <div
        className={aberta ? 'folha folha-aberta' : 'folha'}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        aria-hidden={!aberta}
      >
        <span className="folha-alca" />
        <h2 className="folha-titulo">{titulo}</h2>
        <p className="folha-texto">{texto}</p>

        <button
          type="button"
          className={perigo ? 'folha-botao folha-botao-perigo' : 'folha-botao folha-botao-principal'}
          onClick={aoConfirmar}
          disabled={enviando}
        >
          {enviando ? 'Aguarde...' : rotuloConfirmar}
        </button>
        <button type="button" className="folha-botao folha-botao-secundario" onClick={aoCancelar} disabled={enviando}>
          Cancelar
        </button>
      </div>
    </>
  )
}

export default FolhaConfirmacao
