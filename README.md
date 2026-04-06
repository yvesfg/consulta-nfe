# 📄 Consulta NF-e

Um site moderno e intuitivo para **consultar Notas Fiscais Eletrônicas (NF-e)** usando apenas a chave de acesso. Decodifica informações, gera XML e PDF, e integra-se com a API do Meu Danfe para obter dados reais do SEFAZ.

![React](https://img.shields.io/badge/React-18-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-5-purple?logo=vite)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Funcionalidades

- ✅ **Decodificação de Chave:** Extrai informações da chave de acesso (44 dígitos)
- ✅ **Integração com API:** Busca dados reais do SEFAZ via Meu Danfe
- ✅ **Download de XML:** Salva o XML completo da NF-e
- ✅ **Download de PDF:** Gera e salva o DANFE (Documento Auxiliar)
- ✅ **Verificação no SEFAZ:** Link direto para o portal oficial
- ✅ **Interface Responsiva:** Funciona em desktop, tablet e mobile
- ✅ **Tema Escuro:** Design moderno e agradável aos olhos

---

## 🚀 Quick Start

### Pré-requisitos

- Node.js 16+ instalado
- npm ou yarn

### Instalação

```bash
# Clonar o repositório
git clone https://github.com/yvesfg/consulta-nfe.git
cd consulta-nfe

# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev
```

Acesse `http://localhost:5173` no seu navegador.

---

## 🔑 Configuração da API (Opcional)

Para baixar XMLs e PDFs **reais** da NF-e, configure a API do Meu Danfe:

1. **Crie uma conta** em https://meudanfe.com.br/
2. **Gere uma API Key** na seção "API / Integração"
3. **Configure no projeto:**

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite .env e cole sua API Key
VITE_MEU_DANFE_API_KEY=sua_api_key_aqui
```

4. **Reinicie o servidor** e pronto! 🎉

> **Custo:** R$ 0,03 por consulta nova (buscas repetidas são grátis)

---

## 📖 Como Usar

1. **Insira a chave de acesso** (44 dígitos) da NF-e
2. **Clique em "🔍 Consultar"**
3. **Veja os dados** da nota fiscal
4. **Baixe o XML ou PDF** conforme necessário

---

## 🛠️ Build para Produção

```bash
npm run build
```

Os arquivos compilados estarão em `dist/`.

---

## 📁 Estrutura do Projeto

```
consulta-nfe/
├── src/
│   ├── App.jsx              # Componente principal
│   ├── main.jsx             # Ponto de entrada
│   └── index.css            # Estilos globais (se houver)
├── public/                  # Arquivos estáticos
├── index.html               # HTML principal
├── package.json             # Dependências
├── vite.config.js           # Configuração do Vite
├── .env.example             # Variáveis de ambiente (exemplo)
├── INSTRUCOES.md            # Guia completo de uso
└── README.md                # Este arquivo
```

---

## 🔧 Tecnologias

| Tecnologia | Versão | Descrição |
|-----------|--------|-----------|
| React | 18.2.0 | Biblioteca de UI |
| Vite | 5.0.0 | Bundler e dev server |
| jsPDF | 2.5.1 | Geração de PDFs |
| Axios | 1.6.0 | Cliente HTTP |

---

## 📝 Funcionalidades Detalhadas

### Decodificação de Chave

A chave de acesso é decodificada para extrair:
- Código do UF (estado)
- Ano e mês de emissão
- CNPJ do emitente
- Modelo da NF-e (55 = NF-e, 65 = NFC-e)
- Série e número da nota
- Tipo de emissão (Normal, Contingência, etc.)
- Código e dígito verificador

### Integração com API

Se configurada, a API do Meu Danfe:
- Busca a NF-e no SEFAZ
- Retorna o XML completo
- Gera o PDF (DANFE) oficial
- Armazena em cache para consultas futuras

### Download de Arquivos

- **XML:** Arquivo estruturado com todos os dados da nota
- **PDF:** Documento visual (DANFE) pronto para impressão

---

## 🌐 Deploy

### Vercel (Recomendado)

```bash
npm install -g vercel
vercel
```

### GitHub Pages

```bash
npm run build
# Copiar conteúdo de dist/ para gh-pages branch
```

### Netlify

Conecte seu repositório GitHub ao Netlify e configure:
- **Build command:** `npm run build`
- **Publish directory:** `dist`

---

## 🐛 Troubleshooting

### Erro: "API Key não configurada"

Configure a API Key no arquivo `.env` ou use o botão de configuração no site.

### Erro: "Chave inválida"

Verifique se a chave tem exatamente 44 dígitos e se está correta.

### Erro: "Erro ao consultar NF-e"

A NF-e pode não existir ou estar fora do período de retenção do SEFAZ. Verifique no portal oficial.

---

## 📚 Referências

- [Portal da NF-e - Receita Federal](https://www.nfe.fazenda.gov.br/)
- [Meu Danfe - API v2](https://meudanfe.com.br/documentacao)
- [Documentação Vite](https://vitejs.dev/)
- [Documentação React](https://react.dev/)

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se livre para:

1. Fazer um fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abrir um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

## 👨‍💻 Autor

Desenvolvido com ❤️ para facilitar a consulta de NF-e no Brasil.

**GitHub:** [@yvesfg](https://github.com/yvesfg)

---

## 📞 Suporte

Tem dúvidas? Consulte:

- 📖 [INSTRUCOES.md](./INSTRUCOES.md) - Guia completo
- 🐛 [Issues](https://github.com/yvesfg/consulta-nfe/issues) - Reporte problemas
- 💬 [Discussões](https://github.com/yvesfg/consulta-nfe/discussions) - Pergunte algo

---

**Última atualização:** Abril de 2026

Versão: 2.0.0 (Com integração de API)
