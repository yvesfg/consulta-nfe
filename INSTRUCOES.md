# 📄 Consulta NF-e - Guia de Uso e Configuração

## O que é este projeto?

Este é um site para **consultar informações de Notas Fiscais Eletrônicas (NF-e)** usando apenas a **chave de acesso** (44 dígitos). O site pode:

1. **Decodificar** a chave para extrair informações básicas (UF, CNPJ, Data, etc.)
2. **Baixar o XML real** da NF-e (se configurado com API)
3. **Baixar o PDF (DANFE) real** da NF-e (se configurado com API)
4. **Verificar no SEFAZ** (portal oficial do governo)

---

## 🚀 Como Começar

### Passo 1: Clonar o Repositório

```bash
git clone https://github.com/yvesfg/consulta-nfe.git
cd consulta-nfe
```

### Passo 2: Instalar Dependências

```bash
npm install
```

### Passo 3: Rodar em Desenvolvimento

```bash
npm run dev
```

O site estará disponível em `http://localhost:5173`

---

## 🔑 Configurar a API do Meu Danfe (Opcional, mas Recomendado)

### Por que usar a API?

- **Sem API:** O site apenas lê os números da chave e mostra informações básicas. O XML e PDF gerados são "vazios" (apenas com dados decodificados).
- **Com API:** O site busca o **XML e PDF reais** do Governo (SEFAZ), dando acesso ao conteúdo completo da nota (produtos, valores, impostos, etc.).

### Custo

- **Conversão de XML para PDF:** Grátis
- **Busca de NF-e via Chave:** R$ 0,03 (3 centavos) por consulta
- **Buscas repetidas:** Grátis (o Meu Danfe armazena as consultas já feitas)

### Como Gerar sua API Key em 2 Minutos

#### 1. Crie uma Conta no Meu Danfe

- Acesse: https://meudanfe.com.br/
- Clique em **"Área do Cliente"** → **"Cadastrar"**
- Preencha seus dados (email, senha, etc.)
- Confirme seu email

#### 2. Gere sua API Key

- Faça login na **Área do Cliente**
- No menu lateral, vá para **"API / Integração"**
- Clique em **"Gerar Nova API Key"** (ou copie uma existente)
- Você receberá uma chave como: `abc123def456ghi789...`

#### 3. Configure no Projeto

**Opção A: Usando Variável de Ambiente (Recomendado)**

1. Crie um arquivo `.env` na raiz do projeto:

```bash
cp .env.example .env
```

2. Abra o arquivo `.env` e cole sua API Key:

```
VITE_MEU_DANFE_API_KEY=sua_api_key_aqui
```

3. Reinicie o servidor:

```bash
npm run dev
```

**Opção B: Usando a Interface do Site**

1. Rode o site normalmente
2. Clique no botão **"⚙️ Configurar API"** no topo
3. Cole sua API Key no campo
4. Clique em **"✓ Salvar"**

> ⚠️ **Nota:** A API Key inserida via interface é armazenada apenas na sessão do navegador (não persiste após recarregar). Use a Opção A para uma configuração permanente.

---

## 📖 Como Usar o Site

### Passo 1: Inserir a Chave de Acesso

- Cole ou digite a **chave de 44 dígitos** da NF-e
- O site formata automaticamente com espaços
- Você verá um indicador: `X / 44 dígitos`

### Passo 2: Clicar em "🔍 Consultar"

- O site decodifica a chave instantaneamente
- Se você configurou a API, ele busca os dados reais do Governo

### Passo 3: Ver os Resultados

Você verá:
- **UF Emitente** e Estado
- **Data de Emissão**
- **CNPJ do Emitente**
- **Modelo, Série e Número da NF-e**
- **Tipo de Emissão**
- **Chave Completa** (formatada)

### Passo 4: Baixar os Arquivos

- **📋 Baixar XML:** Salva o XML da NF-e
- **📄 Baixar PDF:** Salva o DANFE (Documento Auxiliar da NF-e)
- **🌐 Verificar no SEFAZ:** Abre o portal oficial do governo

---

## 🛠️ Estrutura do Projeto

```
consulta-nfe/
├── src/
│   ├── App.jsx           # Componente principal (React)
│   └── main.jsx          # Ponto de entrada
├── public/               # Arquivos estáticos
├── index.html            # HTML principal
├── package.json          # Dependências
├── vite.config.js        # Configuração do Vite
├── .env.example          # Exemplo de variáveis de ambiente
└── INSTRUCOES.md         # Este arquivo
```

---

## 🔧 Tecnologias Usadas

- **React 18** - Interface do usuário
- **Vite** - Bundler e servidor de desenvolvimento
- **jsPDF** - Geração de PDFs
- **Axios** - Requisições HTTP (opcional, pode ser usado para API)

---

## 📝 Notas Importantes

### Sobre a Decodificação

A chave de acesso da NF-e tem uma estrutura específica:

```
35 2404 12345678901234 55 001 000000001 1 12345678 9
|  |    |             | |  |   |        | |      | |
|  |    |             | |  |   |        | |      | Dígito Verificador
|  |    |             | |  |   |        | |      Código NF
|  |    |             | |  |   |        | Tipo de Emissão
|  |    |             | |  |   |        Número da NF-e
|  |    |             | |  |   Série
|  |    |             | |  Modelo (55=NF-e, 65=NFC-e)
|  |    |             | CNPJ do Emitente
|  |    AAMM (Ano e Mês de Emissão)
|  UF (Código do Estado)
Código do UF (sempre 35 para SP, 31 para MG, etc.)
```

### Sobre a API

- A API do Meu Danfe consulta o **SEFAZ (Secretaria da Fazenda)** para obter os dados reais
- Você **não precisa de Certificado Digital** para usar a API (diferente de outras soluções)
- A API é **segura** e **confiável** (usada por muitas empresas no Brasil)

### Limitações

- **Sem API:** Apenas informações básicas decodificadas
- **Com API:** Custo de R$ 0,03 por consulta nova (buscas repetidas são grátis)
- **Chaves Antigas:** Notas fiscais muito antigas podem não estar mais disponíveis no SEFAZ

---

## 🐛 Troubleshooting

### "API Key não configurada"

**Solução:** Configure a API Key seguindo os passos acima (Opção A ou B).

### "Erro ao consultar NF-e"

**Possíveis causas:**
- API Key inválida ou expirada
- Chave de acesso não existe ou está incorreta
- Nota fiscal muito antiga (fora do período de retenção do SEFAZ)

**Solução:** Verifique a chave de acesso e tente novamente. Se o problema persistir, teste a chave diretamente no site do Meu Danfe.

### "Erro ao baixar XML ou PDF"

**Solução:** Isso pode acontecer se a NF-e não foi encontrada no SEFAZ. Tente verificar a chave no portal oficial: https://www.nfe.fazenda.gov.br/

---

## 📚 Referências

- [Portal da NF-e - Receita Federal](https://www.nfe.fazenda.gov.br/)
- [Meu Danfe - API Documentation](https://meudanfe.com.br/documentacao)
- [Projeto ACBr - Comunidade de Desenvolvimento Fiscal](https://www.projetoacbr.com.br/)

---

## 📞 Suporte

Se tiver dúvidas ou problemas:

1. Verifique este guia (INSTRUCOES.md)
2. Consulte a documentação do Meu Danfe: https://meudanfe.com.br/
3. Abra uma issue no GitHub: https://github.com/yvesfg/consulta-nfe/issues

---

## 📄 Licença

Este projeto é de código aberto. Sinta-se livre para usar, modificar e distribuir.

---

**Última atualização:** Abril de 2026

Desenvolvido com ❤️ para facilitar a consulta de NF-e no Brasil.
