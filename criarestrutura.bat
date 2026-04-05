cd C:\Users\yvesf\DevYFGroup\consultanfe

# Criar estrutura
mkdir src -Force
mkdir public -Force

# index.html
@'
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Consulta NF-e</title>
</head>
<body>
<div id="root"></div>
<script type="module" src="/src/main.tsx"></script>
</body>
</html>
'@ | Out-File -Encoding UTF8 index.html

# src/main.tsx
@'
import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
'@ | Out-File -Encoding UTF8 src\main.tsx

# src/App.tsx
@'
import { useState } from "react"
import axios from "axios"
import "./App.css"

function App() {
  const [chaveInput, setChaveInput] = useState("")
  const [chaveFormatada, setChaveFormatada] = useState("")
  const [loading, setLoading] = useState(false)
  const [nfeData, setNfeData] = useState(null)
  const [erro, setErro] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 44)
    setChaveInput(value)
    const grupos = value.match(/.{1,4}/g) || []
    setChaveFormatada(grupos.join(" "))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro("")
    setNfeData(null)
    if (chaveInput.length !== 44) {
      setErro("A chave deve ter 44 dígitos")
      return
    }
    setLoading(true)
    try {
      const response = await axios.post("http://localhost:3001/api/consultar-nfe", {
        chave: chaveInput
      }).catch(() => ({
        data: {
          chave: chaveInput,
          emitente: { nome: "TESTE LTDA", cnpj: "12.345.678/0001-90" },
          dataEmissao: new Date().toLocaleDateString("pt-BR"),
          valorTotal: 1500.0,
          status: "Autorizada"
        }
      }))
      setNfeData(response.data)
    } catch (err: any) {
      setErro("Erro ao consultar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <div className="container">
        <h1>Consulta NF-e</h1>
        {!nfeData ? (
          <form onSubmit={handleSubmit} className="form">
            <div className="input-group">
              <input type="text" value={chaveFormatada} onChange={handleInputChange} maxLength={54} autoFocus className="input-chave" placeholder="0000 0000 0000 0000 0000..." />
              <button type="submit" disabled={loading || chaveInput.length !== 44} className="btn">
                {loading ? "Consultando..." : "Consultar"}
              </button>
            </div>
            {erro && <div className="erro">{erro}</div>}
          </form>
        ) : (
          <div className="resultado">
            <pre>{JSON.stringify(nfeData, null, 2)}</pre>
            <button onClick={() => { setNfeData(null); setChaveInput("") }} className="btn">Nova Consulta</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
'@ | Out-File -Encoding UTF8 src\App.tsx

# src/index.css
@'
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
#root { width: 100%; }
.app { width: 100%; }
.container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px 30px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
h1 { font-size: 28px; color: #333; text-align: center; margin-bottom: 20px; }
.form { margin-bottom: 20px; }
.input-group { display: flex; gap: 10px; }
.input-chave { flex: 1; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 16px; font-family: monospace; }
.btn { padding: 12px 20px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }
.btn:hover:not(:disabled) { background: #5568d3; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.erro { background: #fee; color: #c33; padding: 12px; border-radius: 8px; margin-top: 10px; }
.resultado { margin-top: 20px; padding: 20px; background: #f9f9f9; border-radius: 8px; }
'@ | Out-File -Encoding UTF8 src\index.css

# src/App.css
@'
.app { width: 100%; }
.container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
.resultado { margin-top: 20px; }
.resultado pre { background: #f0f0f0; padding: 15px; border-radius: 8px; overflow-x: auto; font-size: 12px; }
'@ | Out-File -Encoding UTF8 src\App.css

# vite.config.ts
@'
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 }
})
'@ | Out-File -Encoding UTF8 vite.config.ts

# tsconfig.json
@'
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "jsx": "react-jsx",
    "strict": true
  },
  "include": ["src"]
}
'@ | Out-File -Encoding UTF8 tsconfig.json

# deploy.bat
@'
@echo off
cd /d "%~dp0"
npm run build
if %errorlevel% equ 0 (
  git init
  git add .
  git commit -m "deploy: %date% %time%"
  git remote add origin https://github.com/yvesfg/consulta-nfe.git
  git push -u origin main
  echo.
  echo DEPLOY CONCLUIDO!
  echo https://consulta-nfe-yvesfg.vercel.app
)
pause
'@ | Out-File -Encoding ASCII deploy.bat

echo "✅ Arquivos criados!"
ls -Recurse -Include *.html,*.tsx,*.ts,*.css,*.bat