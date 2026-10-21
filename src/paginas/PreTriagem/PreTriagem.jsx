import { useEffect, useRef, useState } from 'react'
import './PreTriagem.css'

const sintomas = [
  ['🤕', 'Dor'],
  ['🌡️', 'Febre'],
  ['🤧', 'Tosse'],
  ['🥵', 'Cansaço excessivo'],
  ['🔎', 'Alteração na pele'],
  ['🫁', 'Falta de ar'],
  ['💫', 'Tontura / desmaio'],
]

const partesCorpo = [
  ['🧠', 'Cabeça / pescoço'],
  ['🫀', 'Peito / tórax'],
  ['🧍', 'Abdômen'],
  ['🦵', 'Braços / pernas'],
  ['🦴', 'Costas'],
  ['✋', 'Pele (todo o corpo)'],
  ['❓', 'Não tenho certeza'],
]

const duracoes = [
  ['⚡', 'Hoje'],
  ['🗓️', 'Há alguns dias'],
  ['🗓️', 'Há algumas semanas'],
  ['🗓️', 'Há alguns meses'],
  ['❓', 'Não tenho certeza'],
]

const intensidades = [
  ['😌', 'Muito leve'],
  ['🙂', 'Leve'],
  ['😐', 'Moderado'],
  ['😣', 'Intenso'],
  ['😖', 'Muito intenso'],
]

function PreTriagem({ aoVoltar }) {
  const [tela, setTela] = useState('apresentacao')
  const [etapa, setEtapa] = useState(1)
  const [modalidade, setModalidade] = useState('escrito')
  const [respostas, setRespostas] = useState({
    sintomas: [],
    parteCorpo: '',
    duracao: '',
    intensidade: null,
    observacoes: '',
    relatoAudio: '',
  })

  const [confirmarLigacao, setConfirmarLigacao] = useState(false)
  const [estadoGravacao, setEstadoGravacao] = useState('inicial')
  const [segundosGravacao, setSegundosGravacao] = useState(0)
  const [urlAudio, setUrlAudio] = useState('')
  const [erroAudio, setErroAudio] = useState('')

  const gravadorRef = useRef(null)
  const streamRef = useRef(null)
  const partesAudioRef = useRef([])
  const urlAudioRef = useRef('')
  const intervaloRef = useRef(null)
  const gravacaoIdRef = useRef(0)



function liberarMicrofone() {
  if (streamRef.current) {
    streamRef.current.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }
}

function pararContador() {
  if (intervaloRef.current !== null) {
    clearInterval(intervaloRef.current)
    intervaloRef.current = null
  }
}

function limparAudio() {
  if (urlAudioRef.current) {
    URL.revokeObjectURL(urlAudioRef.current)
    urlAudioRef.current = ''
  }

  setUrlAudio('')
}

function formatarTempo(totalSegundos) {
  const minutos = Math.floor(totalSegundos / 60)
  const segundos = totalSegundos % 60

  return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`
}

async function iniciarGravacao() {
  const idGravacao = ++gravacaoIdRef.current

  setErroAudio('')
  setSegundosGravacao(0)
  setEstadoGravacao('solicitando')

  try {
    if (!navigator.mediaDevices?.getUserMedia ||
        typeof MediaRecorder === 'undefined') {
      throw new Error('Este navegador não oferece suporte à gravação de áudio.')
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    })

    if (idGravacao !== gravacaoIdRef.current) {
      stream.getTracks().forEach((track) => track.stop())
      return
    }

    streamRef.current = stream
    partesAudioRef.current = []

    const gravador = new MediaRecorder(stream)
    gravadorRef.current = gravador

    gravador.ondataavailable = (evento) => {
      if (evento.data.size > 0) {
        partesAudioRef.current.push(evento.data)
      }
    }

    gravador.onstop = () => {
      liberarMicrofone()
      pararContador()

      if (idGravacao !== gravacaoIdRef.current) return

      const partes = partesAudioRef.current

      if (partes.length === 0) {
        setErroAudio('Não foi possível salvar a gravação.')
        setEstadoGravacao('inicial')
        return
      }

      const audio = new Blob(partes, {
        type: gravador.mimeType || 'audio/webm',
      })

      limparAudio()

      const novaUrl = URL.createObjectURL(audio)

      urlAudioRef.current = novaUrl
      setUrlAudio(novaUrl)
      setEstadoGravacao('concluida')
    }

    gravador.onerror = () => {
      liberarMicrofone()
      pararContador()
      setErroAudio('Ocorreu um erro durante a gravação.')
      setEstadoGravacao('inicial')
    }

    gravador.start()

    setEstadoGravacao('gravando')

    intervaloRef.current = setInterval(() => {
      setSegundosGravacao((anterior) => anterior + 1)
    }, 1000)
  } catch (erro) {
    liberarMicrofone()
    pararContador()

    if (idGravacao !== gravacaoIdRef.current) return

    setEstadoGravacao('inicial')

    if (erro.name === 'NotAllowedError') {
      setErroAudio(
        'Permissão para usar o microfone negada. Autorize o acesso nas configurações do navegador.'
      )
    } else {
      setErroAudio(
        erro.message || 'Não foi possível acessar o microfone.'
      )
    }
  }
}

function pararGravacao() {
  pararContador()

  if (gravadorRef.current?.state === 'recording') {
    setEstadoGravacao('finalizando')
    gravadorRef.current.stop()
  }
}

function gravarNovamente() {
  ++gravacaoIdRef.current

  if (gravadorRef.current?.state === 'recording') {
    gravadorRef.current.stop()
  }

  liberarMicrofone()
  pararContador()
  limparAudio()

  setSegundosGravacao(0)
  setErroAudio('')
  setEstadoGravacao('inicial')
}

useEffect(() => {
  return () => {
    ++gravacaoIdRef.current

    if (gravadorRef.current?.state === 'recording') {
      gravadorRef.current.stop()
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }

    if (intervaloRef.current !== null) {
      clearInterval(intervaloRef.current)
    }

    if (urlAudioRef.current) {
      URL.revokeObjectURL(urlAudioRef.current)
    }
  }
}, [])

  function atualizar(campo, valor) {
    setRespostas((anterior) => ({
      ...anterior,
      [campo]: valor,
    }))
  }

  function alternarSintoma(sintoma) {
    setRespostas((anterior) => ({
      ...anterior,
      sintomas: anterior.sintomas.includes(sintoma)
        ? anterior.sintomas.filter((item) => item !== sintoma)
        : [...anterior.sintomas, sintoma],
    }))
  }

  function iniciarEscrito() {
    setModalidade('escrito')
    setEtapa(1)
    setTela('perguntas')
  }

  function iniciarAudio() {
    setModalidade('audio')
    setTela('audio')
  }

  function continuarAudio() {
    if (!respostas.relatoAudio.trim()) return
    setEtapa(2)
    setTela('perguntas')
  }

  function podeContinuar() {
    if (etapa === 1) return respostas.sintomas.length > 0
    if (etapa === 2) return Boolean(respostas.parteCorpo)
    if (etapa === 3) return Boolean(respostas.duracao)
    if (etapa === 4) return respostas.intensidade !== null
    return true
  }

  function continuar() {
    if (!podeContinuar()) return

    if (etapa < 5) {
      setEtapa((anterior) => anterior + 1)
    } else {
      setTela('conclusao')
    }
  }

  function voltar() {
    if (confirmarLigacao) {
      setConfirmarLigacao(false)
      return
    }

    if (tela === 'apresentacao') {
      aoVoltar?.()
      return
    }

    if (tela === 'conclusao') {
      setEtapa(5)
      setTela('perguntas')
      return
    }

    if (tela === 'audio') {
    gravarNovamente()
    setTela('apresentacao')
    return
    }

    if (tela === 'perguntas') {
      if (etapa === 1) {
        setTela('apresentacao')
      } else if (etapa === 2 && modalidade === 'audio') {
        setTela('audio')
      } else {
        setEtapa((anterior) => anterior - 1)
      }
    }
  }

  function opcoes(lista, selecionado, aoSelecionar, multiplo = false) {
    return (
      <div className="triagem-opcoes">
        {lista.map(([icone, titulo], indice) => {
          const ativo = multiplo
            ? selecionado.includes(titulo)
            : selecionado === titulo

          return (
            <button
              type="button"
              key={titulo}
              aria-pressed={ativo}
              className={`triagem-opcao ${
                ativo ? 'triagem-opcao-ativa' : ''
              } ${etapa === 4 ? `triagem-intensidade-${indice + 1}` : ''}`}
              onClick={() => aoSelecionar(titulo, indice)}
            >
              <span>{icone}</span>
              <span>{titulo}</span>
              {etapa === 4 && (
                <small>{indice + 1}/5</small>
              )}
              {ativo && <span className="triagem-marcador">✓</span>}
            </button>
          )
        })}
      </div>
    )
  }

  function perguntaAtual() {
    if (etapa === 1) {
      return (
        <>
          <h2>O que você está sentindo?</h2>
          <p>Selecione um ou mais sintomas.</p>
          {opcoes(
            sintomas,
            respostas.sintomas,
            alternarSintoma,
            true
          )}
          <span className="triagem-contador">
            {respostas.sintomas.length} sintomas selecionados
          </span>
        </>
      )
    }

    if (etapa === 2) {
      return (
        <>
          <h2>Em qual parte do corpo você sente o problema?</h2>
          {opcoes(
            partesCorpo,
            respostas.parteCorpo,
            (valor) => atualizar('parteCorpo', valor)
          )}
        </>
      )
    }

    if (etapa === 3) {
      return (
        <>
          <h2>Há quanto tempo você está sentindo isso?</h2>
          {opcoes(
            duracoes,
            respostas.duracao,
            (valor) => atualizar('duracao', valor)
          )}
        </>
      )
    }

    if (etapa === 4) {
      return (
        <>
          <h2>Como você classificaria o desconforto?</h2>
          <p>
            Selecione o nível que melhor descreve o que você sente.
          </p>
          {opcoes(
            intensidades,
            intensidades[respostas.intensidade]?.[1],
            (_, indice) => atualizar('intensidade', indice)
          )}
        </>
      )
    }

    return (
      <>
        <h2>Gostaria de contar mais alguma coisa?</h2>
        <p>Opcional — quanto mais detalhes, melhor.</p>

        <label className="triagem-label" htmlFor="triagem-observacoes">
          Ou escreva
        </label>

        <textarea
          id="triagem-observacoes"
          maxLength={300}
          rows={6}
          placeholder="Ex.: Tenho alergia a remédios, sou gestante..."
          value={respostas.observacoes}
          onChange={(e) => atualizar('observacoes', e.target.value)}
        />

        <span className="triagem-contador">
          {respostas.observacoes.length}/300
        </span>
      </>
    )
  }

  return (
    <div className="pagina-fundo">
      <div className="triagem">
        {tela !== 'conclusao' && (
          <header className="triagem-cabecalho">
            <button
              type="button"
              onClick={voltar}
              aria-label="Voltar"
            >
              ‹
            </button>
            <strong>
              {tela === 'perguntas'
                ? 'Pré-triagem'
                : tela === 'audio'
                  ? 'Falar sobre o que sinto'
                  : ''}
            </strong>
          </header>
        )}

        {tela === 'apresentacao' && (
          <main className="triagem-conteudo triagem-apresentacao">
            <div className="triagem-apresentacao-centro">
              <div className="triagem-ilustracao">🩺</div>
              <h1>Vamos entender o que você precisa</h1>
              <p>
                Responda algumas perguntas para entendermos
                um possível caminho para o seu atendimento.
              </p>

              <div className="triagem-alerta">
                ⚠️ Esta orientação não substitui a avaliação de um
                profissional de saúde. Não fornecemos diagnósticos médicos.
              </div>

              <small>◷ Leva cerca de 2 minutos</small>
            </div>

            <div className="triagem-botoes">
              <button
                className="triagem-botao-principal"
                onClick={iniciarEscrito}
              >
                Responder por escrito
              </button>
              <button
                className="triagem-botao-secundario"
                onClick={iniciarAudio}
              >
                🎙️ Falar sobre o que estou sentindo
              </button>
            </div>
          </main>
        )}

        
{tela === 'audio' && (
  <main className="triagem-conteudo triagem-audio">
    <div className="triagem-audio-centro">
      <div className="triagem-ilustracao">🎙️</div>

      <h2>Falar sobre o que sinto</h2>

      {estadoGravacao === 'inicial' && (
        <>
          <p>
            Conte com suas próprias palavras o que você está
            sentindo. Procure um ambiente silencioso.
          </p>

          <button
            type="button"
            className="triagem-microfone"
            onClick={iniciarGravacao}
            aria-label="Iniciar gravação"
          >
            🎙️
          </button>

          <span className="triagem-instrucao">
            Toque no microfone para começar
          </span>
        </>
      )}

      {estadoGravacao === 'solicitando' && (
        <p>Solicitando acesso ao microfone...</p>
      )}

      {estadoGravacao === 'gravando' && (
        <>
          <p>Estamos gravando seu relato.</p>

          <div className="triagem-tempo-gravacao">
            <span className="triagem-ponto-vermelho" />
            {formatarTempo(segundosGravacao)}
          </div>

          <div className="triagem-ondas" aria-hidden="true">
            {Array.from({ length: 13 }, (_, indice) => (
              <span key={indice} />
            ))}
          </div>

          <button
            type="button"
            className="triagem-parar-gravacao"
            onClick={pararGravacao}
            aria-label="Parar gravação"
          >
            ■
          </button>

          <span className="triagem-instrucao">
            Toque para parar a gravação
          </span>
        </>
      )}

      {estadoGravacao === 'finalizando' && (
        <p>Finalizando a gravação...</p>
      )}

      {estadoGravacao === 'concluida' && (
        <>
          <div className="triagem-audio-sucesso">✓</div>

          <h2>Gravação concluída!</h2>

          <p>
            Seu áudio de {formatarTempo(segundosGravacao)}
            {' '}foi gravado.
          </p>

          <audio
            controls
            src={urlAudio}
            className="triagem-reprodutor"
          >
            Seu navegador não suporta reprodução de áudio.
          </audio>

          <button
            type="button"
            className="triagem-botao-secundario"
            onClick={gravarNovamente}
          >
            🎙️ Gravar novamente
          </button>
        </>
      )}

      {erroAudio && (
        <p className="triagem-erro-audio" role="alert">
          {erroAudio}
        </p>
      )}
    </div>

    <div className="triagem-botoes">
      {estadoGravacao === 'concluida' && (
        <div className="triagem-aviso-transcricao">
          A transcrição automática ainda não está disponível.
          Para continuar, descreva os sintomas por escrito.
        </div>
      )}

      {(estadoGravacao === 'inicial' ||
        estadoGravacao === 'concluida') && (
        <>
          <label
            className="triagem-label"
            htmlFor="triagem-relato-audio"
          >
            Relato por escrito
          </label>

          <textarea
            id="triagem-relato-audio"
            rows={3}
            placeholder="Descreva seus sintomas para continuar..."
            value={respostas.relatoAudio}
            onChange={(e) =>
              atualizar('relatoAudio', e.target.value)
            }
          />

          <button
            type="button"
            className="triagem-botao-principal"
            disabled={!respostas.relatoAudio.trim()}
            onClick={continuarAudio}
          >
            Continuar para a pergunta 2
          </button>
        </>
      )}
    </div>
  </main>
)}


        {tela === 'perguntas' && (
          <main className="triagem-conteudo">
            <div className="triagem-progresso-topo">
              <span>Pergunta {etapa} de 5</span>
              <span>{etapa * 20}%</span>
            </div>

            <div className="triagem-progresso">
              <div style={{ width: `${etapa * 20}%` }} />
            </div>

            <div className="triagem-pergunta">
              {perguntaAtual()}
            </div>

            <div className="triagem-botoes">
              <button
                type="button"
                className="triagem-botao-principal"
                disabled={!podeContinuar()}
                onClick={continuar}
              >
                Continuar
              </button>
            </div>
          </main>
        )}

        {tela === 'conclusao' && (
          <main className="triagem-conteudo triagem-conclusao">
            <div className="triagem-ilustracao">🩺</div>
            <h1>Respostas registradas</h1>
            <p>
              Você concluiu as cinco etapas da pré-triagem.
            </p>

            <div className="triagem-resumo">
              <h2>Resumo das suas respostas</h2>

              <p>
                <strong>Sintomas:</strong>{' '}
                {modalidade === 'audio'
                  ? respostas.relatoAudio
                  : respostas.sintomas.join(', ')}
              </p>

              <p>
                <strong>Parte do corpo:</strong>{' '}
                {respostas.parteCorpo}
              </p>

              <p>
                <strong>Tempo:</strong> {respostas.duracao}
              </p>

              <p>
                <strong>Intensidade:</strong>{' '}
                {respostas.intensidade === null
                  ? 'Não informada'
                  : `${respostas.intensidade + 1}/5`}
              </p>

              {respostas.observacoes && (
                <p>
                  <strong>Observações:</strong>{' '}
                  {respostas.observacoes}
                </p>
              )}
            </div>

            <div className="triagem-alerta">
              Este questionário ainda não possui análise clínica
              automatizada. As respostas não foram enviadas a um
              profissional e não representam um diagnóstico.
            </div>

            <p>
              Se estiver com sintomas graves, como dificuldade
              intensa para respirar, dor forte no peito ou perda
              de consciência, procure atendimento de emergência.
            </p>

            <button
              className="triagem-botao-principal"
              onClick={() => setConfirmarLigacao(true)}
            >
              Emergência — SAMU 192
            </button>

            <button
              className="triagem-botao-secundario"
              onClick={aoVoltar}
            >
              Voltar ao início
            </button>
          </main>
        )}

        {confirmarLigacao && (
          <div className="triagem-modal-fundo">
            <div
              className="triagem-modal"
              role="dialog"
              aria-modal="true"
              aria-label="Confirmar ligação para o SAMU"
            >
              <div className="triagem-ilustracao">📞</div>
              <h2>Você deseja ligar para o SAMU?</h2>
              <p>
                Você será direcionado ao número 192.
                A ligação é gratuita e o serviço funciona 24 horas.
              </p>

              <a
                href="tel:192"
                className="triagem-botao-principal"
              >
                Ligar agora — 192
              </a>

              <button
                className="triagem-botao-secundario"
                onClick={() => setConfirmarLigacao(false)}
              >
                Voltar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PreTriagem
