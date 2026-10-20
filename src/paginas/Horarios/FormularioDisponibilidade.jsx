import { useState } from 'react'
import { opcoesDeHora } from '../../servicos/disponibilidade'
import { dataLonga, paraISO, somarDias } from '../../servicos/datas'

const DIAS_NA_LISTA = 90

// Janela que sobe de baixo para adicionar ou editar um horário.
// "inicial" = { data, inicio, fim }. O pai troca a "key" para o formulário abrir limpo.
function FormularioDisponibilidade({ aberta, titulo, inicial, hoje, clinica, enviando, erro, aoCancelar, aoSalvar }) {
  const [data, setData] = useState(inicial.data)
  const [inicio, setInicio] = useState(inicial.inicio)
  const [fim, setFim] = useState(inicial.fim)

  // Datas de hoje até daqui a 90 dias (mais a data do bloco, se for diferente)
  const datas = Array.from({ length: DIAS_NA_LISTA }, (_, i) => somarDias(hoje, i))
  if (!datas.includes(inicial.data)) datas.unshift(inicial.data)

  function enviar(evento) {
    evento.preventDefault()
    aoSalvar({ data, inicio, fim })
  }

  return (
    <>
      <div
        className={aberta ? 'form-fundo form-fundo-visivel' : 'form-fundo'}
        onClick={enviando ? undefined : aoCancelar}
      />

      <form
        className={aberta ? 'form-folha form-folha-aberta' : 'form-folha'}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        aria-hidden={!aberta}
        onSubmit={enviar}
      >
        <span className="form-alca" />
        <h2 className="form-titulo">{titulo}</h2>

        <label className="form-campo">
          <span>Data</span>
          <select value={data} onChange={(e) => setData(e.target.value)}>
            {datas.map((d) => (
              <option key={d} value={d}>{dataLonga(d)}</option>
            ))}
          </select>
        </label>

        <div className="form-duas-colunas">
          <label className="form-campo">
            <span>Início</span>
            <select value={inicio} onChange={(e) => setInicio(e.target.value)}>
              {opcoesDeHora.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
          </label>
          <label className="form-campo">
            <span>Fim</span>
            <select value={fim} onChange={(e) => setFim(e.target.value)}>
              {opcoesDeHora.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
          </label>
        </div>

        {/* A API não guarda clínica na disponibilidade: ela vem do cadastro do profissional */}
        <label className="form-campo">
          <span>Clínica</span>
          <select value="clinica" disabled>
            <option value="clinica">{clinica || 'Clínica do seu cadastro'}</option>
          </select>
        </label>

        {erro && <p className="form-erro" role="alert">{erro}</p>}

        <div className="form-botoes">
          <button type="button" className="form-botao form-botao-secundario" onClick={aoCancelar} disabled={enviando}>
            Cancelar
          </button>
          <button type="submit" className="form-botao form-botao-principal" disabled={enviando}>
            {enviando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </>
  )
}

export default FormularioDisponibilidade
