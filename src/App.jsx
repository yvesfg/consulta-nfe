import { useState } from "react"
import jsPDF from "jspdf"

// ── Mapeamento de UFs e Estados ────────────────────────────────
const UF = {
  "11":"RO","12":"AC","13":"AM","14":"RR","15":"PA","16":"AP","17":"TO",
  "21":"MA","22":"PI","23":"CE","24":"RN","25":"PB","26":"PE","27":"AL",
  "28":"SE","29":"BA","31":"MG","32":"ES","33":"RJ","35":"SP","41":"PR",
  "42":"SC","43":"RS","50":"MS","51":"MT","52":"GO","53":"DF","91":"AN"
}
const ESTADOS = {
  "11":"Rondônia","12":"Acre","13":"Amazonas","14":"Roraima","15":"Pará",
  "16":"Amapá","17":"Tocantins","21":"Maranhão","22":"Piauí","23":"Ceará",
  "24":"Rio Grande do Norte","25":"Paraíba","26":"Pernambuco","27":"Alagoas",
  "28":"Sergipe","29":"Bahia","31":"Minas Gerais","32":"Espírito Santo",
  "33":"Rio de Janeiro","35":"São Paulo","41":"Paraná","42":"Santa Catarina",
  "43":"Rio Grande do Sul","50":"Mato Grosso do Sul","51":"Mato Grosso",
  "52":"Goiás","53":"Distrito Federal","91":"Ambiente Nacional"
}
const TIPO_EMIS = {
  "1":"Normal","2":"Contingência FS","3":"Regime Especial NFF","4":"Contingência DPEC",
  "5":"Contingência FS-DA","6":"Contingência SVC-AN","7":"Contingência SVC-RS","9":"Contingência off-line NFC-e"
}

// ── Decodifica chave NF-e (44 dígitos) ────────────────────────
function decodificarChave(chave) {
  if (chave.length !== 44) return null
  const cUF    = chave.slice(0, 2)
  const aamm   = chave.slice(2, 6)
  const cnpj   = chave.slice(6, 20)
  const mod    = chave.slice(20, 22)
  const serie  = chave.slice(22, 25)
  const nNF    = chave.slice(25, 34)
  const tpEmis = chave.slice(34, 35)
  const cNF    = chave.slice(35, 43)
  const cDV    = chave.slice(43, 44)
  const ano  = "20" + aamm.slice(0, 2)
  const mes  = aamm.slice(2, 4)
  const meses = ["","Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]
  const cnpjFmt = cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
  return {
    uf: UF[cUF] || cUF,
    estado: ESTADOS[cUF] || "Desconhecido",
    emissao: `${meses[parseInt(mes)]}/${ano}`,
    cnpj: cnpjFmt,
    modelo: mod === "55" ? "NF-e (55)" : mod === "65" ? "NFC-e (65)" : `Modelo ${mod}`,
    serie: parseInt(serie, 10).toString(),
    numero: parseInt(nNF, 10).toLocaleString("pt-BR"),
    tipoEmissao: TIPO_EMIS[tpEmis] || tpEmis,
    codigoNF: cNF,
    digitoVerif: cDV,
    ambiente: cUF === "91" ? "Nacional" : "Estadual",
  }
}

// ── Formata CNPJ para exibição no input ──────────────────────
function formatarChave(raw) {
  return (raw.match(/.{1,4}/g) || []).join(" ")
}

// ── URL consulta no portal SEFAZ ─────────────────────────────
function urlSefaz(chave) {
  return `https://www.nfe.fazenda.gov.br/portal/consultaRecaptcha.aspx?tipoConsulta=resumo&tipoConteudo=7PhJ+gAVw2g=&nfe=${chave}`
}

// ── Gera XML dos dados decodificados ─────────────────────────
function gerarXML(dados, chave) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<consultaNFe>
  <chaveAcesso>${chave}</chaveAcesso>
  <uf>${dados.uf}</uf>
  <estado>${dados.estado}</estado>
  <emissao>${dados.emissao}</emissao>
  <cnpjEmitente>${dados.cnpj}</cnpjEmitente>
  <modelo>${dados.modelo}</modelo>
  <serie>${dados.serie}</serie>
  <numeroNFe>${dados.numero}</numeroNFe>
  <tipoEmissao>${dados.tipoEmissao}</tipoEmissao>
  <codigoNF>${dados.codigoNF}</codigoNF>
  <digitoVerificador>${dados.digitoVerif}</digitoVerificador>
  <urlSefaz>${urlSefaz(chave)}</urlSefaz>
  <dataConsulta>${new Date().toISOString()}</dataConsulta>
</consultaNFe>`
}

// ── Download de arquivo ───────────────────────────────────────
function downloadArquivo(conteudo, nome, tipo) {
  const blob = new Blob([conteudo], { type: tipo })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = nome
  a.click()
  URL.revokeObjectURL(url)
}

// ── Consulta API do Meu Danfe ─────────────────────────────────
async function consultarMeuDanfe(chave, apiKey) {
  if (!apiKey) {
    throw new Error("API Key não configurada. Configure a variável de ambiente VITE_MEU_DANFE_API_KEY ou insira manualmente.")
  }

  try {
    // Primeiro, tenta adicionar a chave à base de dados do Meu Danfe
    const addResponse = await fetch("https://api.meudanfe.com.br/v2/fd/add/" + chave, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    })

    if (!addResponse.ok) {
      const errorData = await addResponse.json()
      throw new Error(errorData.message || `Erro ao consultar NF-e: ${addResponse.status}`)
    }

    const addData = await addResponse.json()
    
    // Se a consulta foi bem-sucedida, agora baixa o XML e o PDF
    const xmlResponse = await fetch(`https://api.meudanfe.com.br/v2/fd/get/xml/${chave}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`
      }
    })

    const pdfResponse = await fetch(`https://api.meudanfe.com.br/v2/fd/get/da/${chave}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`
      }
    })

    if (!xmlResponse.ok || !pdfResponse.ok) {
      throw new Error("Erro ao baixar XML ou PDF da NF-e")
    }

    const xmlData = await xmlResponse.json()
    const pdfData = await pdfResponse.json()

    return {
      xml: xmlData.xml || xmlData.conteudo,
      pdf: pdfData.pdf || pdfData.conteudo,
      origem: "API"
    }
  } catch (error) {
    console.error("Erro na consulta à API:", error)
    throw error
  }
}

// ── Componente principal ──────────────────────────────────────
export default function App() {
  const [raw, setRaw]           = useState("")
  const [dados, setDados]       = useState(null)
  const [erro, setErro]         = useState("")
  const [carregando, setCarregando] = useState(false)
  const [apiKey, setApiKey]     = useState(import.meta.env.VITE_MEU_DANFE_API_KEY || "")
  const [xmlReal, setXmlReal]   = useState(null)
  const [pdfReal, setPdfReal]   = useState(null)
  const [showApiConfig, setShowApiConfig] = useState(false)

  const handleBaixarXML = () => {
    if (!dados || !raw) return
    
    // Se temos XML real da API, usa ele; senão gera um básico
    const xml = xmlReal || gerarXML(dados, raw)
    downloadArquivo(xml, `NFe_${raw}.xml`, "application/xml")
  }

  const handleBaixarPDF = () => {
    if (!dados || !raw) return
    
    // Se temos PDF real da API, usa ele; senão gera um básico
    if (pdfReal) {
      // PDF vem em base64 da API
      const byteCharacters = atob(pdfReal)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `NFe_${raw}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } else {
      // Gera PDF básico localmente
      const doc = new jsPDF({ unit: "mm", format: "a4" })
      const W = 210
      const margem = 14
      let y = 0

      // ── Cabeçalho ──────────────────────────────────────────
      doc.setFillColor(30, 41, 59)
      doc.rect(0, 0, W, 22, "F")
      doc.setTextColor(241, 245, 249)
      doc.setFontSize(13)
      doc.setFont("helvetica", "bold")
      doc.text("CONSULTA NF-e", margem, 10)
      doc.setFontSize(8)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(148, 163, 184)
      doc.text("Dados decodificados da chave de acesso", margem, 16)
      y = 32

      // ── Chave de acesso ────────────────────────────────────
      doc.setFontSize(7)
      doc.setTextColor(100, 116, 139)
      doc.setFont("helvetica", "bold")
      doc.text("CHAVE DE ACESSO", margem, y)
      y += 4
      doc.setFillColor(15, 23, 42)
      doc.roundedRect(margem, y, W - margem * 2, 8, 2, 2, "F")
      doc.setFont("courier", "normal")
      doc.setTextColor(226, 232, 240)
      doc.setFontSize(8)
      doc.text(formatarChave(raw), margem + 3, y + 5.5)
      y += 16

      // ── Campos ─────────────────────────────────────────────
      const campos = [
        ["UF Emitente",    `${dados.uf} — ${dados.estado}`],
        ["Emissão",        dados.emissao],
        ["CNPJ Emitente",  dados.cnpj],
        ["Modelo",         dados.modelo],
        ["Série",          dados.serie],
        ["Número NF-e",    dados.numero],
        ["Tipo de Emissão",dados.tipoEmissao],
        ["Código NF / DV", `${dados.codigoNF} / ${dados.digitoVerif}`]
      ]

      doc.setFontSize(7)
      doc.setTextColor(100, 116, 139)
      doc.setFont("helvetica", "bold")

      campos.forEach(([label, valor], idx) => {
        if (idx % 2 === 0 && idx > 0) y += 10
        const x = idx % 2 === 0 ? margem : W / 2 + 2
        doc.text(label, x, y)
        doc.setFont("helvetica", "normal")
        doc.setTextColor(226, 232, 240)
        doc.setFontSize(9)
        doc.text(valor, x, y + 4)
        doc.setFont("helvetica", "bold")
        doc.setTextColor(100, 116, 139)
        doc.setFontSize(7)
      })

      y += 14
      doc.setTextColor(148, 163, 184)
      doc.setFontSize(8)
      doc.text(`Consultado em: ${new Date().toLocaleString("pt-BR")}`, margem, y)

      doc.save(`NFe_${raw}.pdf`)
    }
  }

  const handleChange = (e) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 44)
    setRaw(v)
    setErro("")
    setDados(null)
    setXmlReal(null)
    setPdfReal(null)
  }

  const consultar = async (e) => {
    e.preventDefault()
    if (raw.length !== 44) {
      setErro("A chave deve ter exatamente 44 dígitos.")
      return
    }

    setCarregando(true)
    setErro("")

    try {
      const resultado = decodificarChave(raw)
      if (!resultado) {
        setErro("Chave inválida.")
        setCarregando(false)
        return
      }

      setDados(resultado)

      // Tenta consultar a API se houver chave configurada
      if (apiKey) {
        try {
          const apiResult = await consultarMeuDanfe(raw, apiKey)
          setXmlReal(apiResult.xml)
          setPdfReal(apiResult.pdf)
        } catch (apiError) {
          console.warn("Consulta à API falhou, usando dados decodificados:", apiError.message)
          // Continua com os dados decodificados
        }
      }
    } catch (error) {
      setErro(error.message || "Erro ao processar a chave.")
    } finally {
      setCarregando(false)
    }
  }

  const limpar = () => {
    setRaw("")
    setDados(null)
    setErro("")
    setXmlReal(null)
    setPdfReal(null)
  }

  const salvarApiKey = () => {
    if (!apiKey.trim()) {
      setErro("Insira uma API Key válida.")
      return
    }
    setShowApiConfig(false)
    setErro("")
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.headerIcon}>📄</div>
          <div>
            <div style={s.headerTitle}>Consulta NF-e</div>
            <div style={s.headerSub}>Decodifica informações da chave de acesso</div>
          </div>
        </div>

        {/* Botão de Configuração de API */}
        <div style={{ marginBottom: 16, textAlign: "right" }}>
          <button
            type="button"
            onClick={() => setShowApiConfig(!showApiConfig)}
            style={{ ...s.btn, ...s.btnConfig, fontSize: 12, padding: "8px 12px" }}
          >
            ⚙️ {apiKey ? "API Configurada" : "Configurar API"}
          </button>
        </div>

        {/* Painel de Configuração de API */}
        {showApiConfig && (
          <div style={s.apiConfigPanel}>
            <div style={{ marginBottom: 12 }}>
              <label style={s.label}>API Key do Meu Danfe</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Cole sua API Key aqui"
                style={s.input}
              />
              <div style={s.inputMeta}>
                <a href="https://meudanfe.com.br/" target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6" }}>
                  Gerar API Key no Meu Danfe →
                </a>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={salvarApiKey} style={{ ...s.btn, ...s.btnPrimary, flex: 1 }}>
                ✓ Salvar
              </button>
              <button onClick={() => setShowApiConfig(false)} style={{ ...s.btn, ...s.btnSecondary, flex: 1 }}>
                ✕ Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={consultar} style={s.form}>
          <label style={s.label}>Chave de Acesso (44 dígitos)</label>
          <input
            type="text"
            value={formatarChave(raw)}
            onChange={handleChange}
            placeholder="0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 00"
            style={s.input}
            disabled={carregando}
          />
          <div style={s.inputMeta}>{raw.length} / 44 dígitos</div>

          {erro && <div style={s.erroBox}>{erro}</div>}

          <div style={s.btnRow}>
            <button
              type="submit"
              disabled={raw.length !== 44 || carregando}
              style={{
                ...s.btn,
                ...(raw.length === 44 && !carregando ? s.btnPrimary : s.btnDisabled)
              }}
            >
              {carregando ? "⏳ Consultando..." : "🔍 Consultar"}
            </button>
            {raw && (
              <button type="button" onClick={limpar} style={{ ...s.btn, ...s.btnSecondary }}>
                Limpar
              </button>
            )}
          </div>
        </form>

        {/* Resultado */}
        {dados && (
          <div style={s.resultado}>
            <div style={s.resultHeader}>Dados da NF-e</div>
            {xmlReal && <div style={{ ...s.erroBox, background: "rgba(16,185,129,.1)", border: "1px solid rgba(16,185,129,.3)", color: "#86efac", marginBottom: 12 }}>✓ Dados obtidos da API do Meu Danfe</div>}
            <div style={s.grid}>
              <Campo label="UF Emitente" valor={`${dados.uf} — ${dados.estado}`} />
              <Campo label="Emissão" valor={dados.emissao} />
              <Campo label="CNPJ Emitente" valor={dados.cnpj} mono />
              <Campo label="Modelo" valor={dados.modelo} />
              <Campo label="Série" valor={dados.serie} />
              <Campo label="Número NF-e" valor={dados.numero} />
              <Campo label="Tipo de Emissão" valor={dados.tipoEmissao} />
              <Campo label="Código NF / DV" valor={`${dados.codigoNF} / ${dados.digitoVerif}`} mono />
            </div>
            <div style={s.chaveFull}>
              <div style={s.chaveLabel}>Chave completa</div>
              <div style={s.chaveVal}>{formatarChave(raw)}</div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }} className="no-print">
              <button onClick={handleBaixarXML} style={{ ...s.btn, ...s.btnXml }}>
                📋 Baixar XML
              </button>
              <button onClick={handleBaixarPDF} style={{ ...s.btn, ...s.btnPdf }}>
                📄 Baixar PDF
              </button>
              <a
                href={urlSefaz(raw)}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...s.btn, ...s.btnSefaz, display: "inline-flex", textDecoration: "none" }}
              >
                🌐 Verificar no SEFAZ
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Campo({ label, valor, mono }) {
  return (
    <div style={s.campo}>
      <div style={s.campoLabel}>{label}</div>
      <div style={{ ...s.campoValor, ...(mono ? { fontFamily: "monospace", fontSize: 13 } : {}) }}>{valor}</div>
    </div>
  )
}

// ── Estilos ───────────────────────────────────────────────────
const s = {
  page: {
    minHeight: "100vh",
    background: "#0f172a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    fontFamily: "'Inter','Segoe UI',system-ui,sans-serif"
  },
  card: {
    width: "100%",
    maxWidth: 560,
    background: "#1e293b",
    borderRadius: 14,
    border: "1px solid #334155",
    padding: "32px 28px",
    boxShadow: "0 24px 64px rgba(0,0,0,.5)"
  },
  header: { display: "flex", alignItems: "center", gap: 14, marginBottom: 28 },
  headerIcon: { fontSize: 32 },
  headerTitle: { fontSize: 20, fontWeight: 700, color: "#f1f5f9" },
  headerSub: { fontSize: 12, color: "#64748b", marginTop: 2 },
  form: { display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 },
  input: {
    background: "#0f172a",
    border: "1.5px solid #334155",
    borderRadius: 8,
    padding: "12px 14px",
    color: "#f1f5f9",
    fontSize: 14,
    fontFamily: "monospace",
    letterSpacing: 2,
    outline: "none",
    width: "100%",
    boxSizing: "border-box"
  },
  inputMeta: { fontSize: 11, color: "#64748b", textAlign: "right", marginTop: 2 },
  erroBox: {
    background: "rgba(239,68,68,.1)",
    border: "1px solid rgba(239,68,68,.3)",
    borderRadius: 7,
    padding: "10px 14px",
    color: "#fca5a5",
    fontSize: 13
  },
  btnRow: { display: "flex", gap: 10, marginTop: 8 },
  btn: {
    padding: "11px 20px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: 6
  },
  btnPrimary: { background: "#3b82f6", color: "#fff" },
  btnDisabled: { background: "#1e3a5f", color: "#475569", cursor: "not-allowed" },
  btnSecondary: { background: "#1e293b", color: "#94a3b8", border: "1px solid #334155" },
  btnConfig: { background: "#6366f1", color: "#fff" },
  btnSefaz: { background: "#059669", color: "#fff" },
  btnXml: { background: "#7c3aed", color: "#fff" },
  btnPdf: { background: "#b45309", color: "#fff" },
  resultado: { marginTop: 24, borderTop: "1px solid #334155", paddingTop: 24 },
  resultHeader: { fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  campo: { background: "#0f172a", borderRadius: 8, padding: "10px 14px" },
  campoLabel: { fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 },
  campoValor: { fontSize: 14, color: "#e2e8f0", fontWeight: 500 },
  chaveFull: { marginTop: 12, background: "#0f172a", borderRadius: 8, padding: "10px 14px" },
  chaveLabel: { fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 },
  chaveVal: { fontSize: 12, color: "#94a3b8", fontFamily: "monospace", wordBreak: "break-all", lineHeight: 1.8 },
  apiConfigPanel: {
    background: "#0f172a",
    border: "1px solid #334155",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16
  }
}
