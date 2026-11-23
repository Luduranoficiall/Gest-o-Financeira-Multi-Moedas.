# FinGlobal — Gestão Financeira Multi-Moedas

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Lucide React](https://img.shields.io/badge/Lucide_React-Icons-F56565?style=flat-square)
![License](https://img.shields.io/badge/License-Apache_2.0-10B981?style=flat-square)

**FinGlobal** é uma aplicação web moderna de gestão financeira pessoal e internacional desenvolvida para consolidar patrimônio, receitas, despesas, orçamentos e metas em múltiplas moedas. Com conversão automática para uma moeda base selecionável, gráficos analíticos interativos, sistema de alertas orçamentários em tempo real e mapeamento geográfico de compras via Google Maps Platform, o FinGlobal oferece controle financeiro completo em uma interface escura, responsiva e intuitiva.

---

## Sumário

- [Principais Funcionalidades](#principais-funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Execução](#instalação-e-execução)
- [Configuração de Variáveis de Ambiente](#configuração-de-variáveis-de-ambiente)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Persistência de Dados](#persistência-de-dados)
- [Licença](#licença)

---

## Principais Funcionalidades

### Gestão Multi-Moedas e Câmbio
- **8 Moedas Suportadas**: Real Brasileiro (`BRL`), Dólar Americano (`USD`), Euro (`EUR`), Libra Esterlina (`GBP`), Iene Japonês (`JPY`), Dólar Canadense (`CAD`), Dólar Australiano (`AUD`) e Franco Suíço (`CHF`).
- **Consolidação Dinâmica por Moeda Base**: altere a moeda principal no cabeçalho para recalcular automaticamente o patrimônio líquido, gráficos, metas, extratos e limites orçamentários.
- **Carteiras e Contas Globais**: gerencie contas correntes, investimentos, contas digitais internacionais (ex.: Wise, Nomad, Revolut), espécie e criptoativos em suas moedas nativas.
- **Calculadora de Câmbio**: conversor instantâneo entre quaisquer pares de moedas acompanhado de tabela de cotações de referência.

### Sistema de Alertas Orçamentários
- **Limites Mensais por Categoria**: defina tetos de gasto em qualquer moeda com limiar configurável de aviso preventivo (entre `50%` e `95%`, padrão `80%`).
- **Notificações em Tempo Real (Toast)**: alerta imediato ao registrar uma despesa que faça a categoria atingir a zona de atenção ou ultrapassar `100%` do orçamento mensal.
- **Central de Alertas no Cabeçalho**: sino de notificações com contador dinâmico de categorias em alerta e acesso rápido ao painel de revisão.
- **Painel de Orçamentos & Alertas**: visualização clara com barras de progresso, marcador visual do limiar de aviso e cálculo do valor restante ou excedido.

### Gráficos Analíticos Interativos
- **Fluxo de Caixa Mensal**: comparativo visual entre receitas, despesas e saldo líquido ao longo dos meses com detalhamento ao passar o mouse.
- **Gastos por Categoria (Donut)**: distribuição percentual das despesas com seleção interativa por categoria.
- **Distribuição Patrimonial por Moeda**: visão segmentada da alocação do patrimônio entre divisas.
- **Evolução Acumulada de Despesas**: curva diária acumulada para acompanhar o ritmo de gastos no período.

### Mapa Geográfico de Despesas (Google Maps Platform)
- **Visualização Mundial**: mapa interativo com marcadores avançados (`AdvancedMarker`) exibindo a bandeira e o valor na moeda original da transação.
- **Detalhes por Estabelecimento**: janelas informativas (`InfoWindow`) com endereço, valor original, equivalente na moeda base e atalho para adicionar novos gastos no mesmo local.
- **Navegação Rápida & GPS**: atalhos por cidade, filtro por moeda e botão para centralizar na localização atual do dispositivo.

### Extrato, Filtros, Exportação e Metas
- **Extrato Inteligente**: busca por texto (título, notas ou cidade) e filtros combinados por tipo, moeda e categoria.
- **Exportação em CSV**: gere e baixe relatórios filtrados em formato `.csv` com valores originais e convertidos.
- **Metas de Poupança**: crie e acompanhe objetivos financeiros em qualquer moeda com prazo e barra de progresso.

---

## Tecnologias Utilizadas

| Tecnologia | Finalidade |
| :--- | :--- |
| **[React 19](https://react.dev/)** | Biblioteca principal para construção da interface reativa e modular |
| **[TypeScript](https://www.typescriptlang.org/)** | Tipagem estática para maior segurança e manutenibilidade do código |
| **[Vite](https://vite.dev/)** | Bundler e servidor de desenvolvimento de alta performance |
| **[Tailwind CSS v4](https://tailwindcss.com/)** | Estilização utilitária responsiva com tema escuro moderno |
| **[Lucide React](https://lucide.dev/)** | Conjunto consistente de ícones vetoriais |
| **[@vis.gl/react-google-maps](https://visgl.github.io/react-google-maps/)** | Integração oficial React com a Google Maps JavaScript API e Advanced Markers |

---

## Estrutura do Projeto

```text
.
├── .env.example
├── index.html
├── metadata.json
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── main.tsx                                    # Ponto de entrada da aplicação e listener de cota de mapas
    ├── App.tsx                                     # Estado global, navegação por abas e cálculo de alertas
    ├── index.css                                   # Importação global do Tailwind CSS
    ├── types/
    │   └── finance.ts                              # Interfaces TypeScript (Transaction, Account, Budget, Goal, Alerts)
    ├── services/
    │   └── currencyService.ts                      # Catálogo de moedas, conversão cambial e formatação
    ├── data/
    │   └── mockData.ts                             # Conjunto inicial de contas, transações, orçamentos e metas
    └── components/
        ├── budgets/
        │   ├── AlertToastStack.tsx                 # Pilha de notificações toast em tempo real
        │   └── BudgetAlertsSection.tsx             # Gestão de orçamentos mensais e alertas ativos
        ├── charts/
        │   ├── CashFlowChart.tsx                   # Gráfico comparativo de fluxo de caixa mensal
        │   ├── CategoryDonutChart.tsx              # Gráfico donut de despesas por categoria
        │   ├── CurrencyAllocationChart.tsx         # Alocação patrimonial por moeda
        │   └── SpendingTrendChart.tsx              # Gráfico de área de evolução acumulada de gastos
        ├── maps/
        │   └── ExpenseMap.tsx                      # Mapa interativo com Google Maps Platform
        └── modals/
            ├── AccountModal.tsx                    # Criação de contas e carteiras multi-moeda
            ├── BudgetModal.tsx                     # Criação e edição de limites orçamentários
            ├── CurrencyConverterModal.tsx          # Calculadora de câmbio entre moedas
            ├── GoalModal.tsx                       # Criação de metas de poupança
            └── TransactionModal.tsx                # Registro de receitas/despesas com geolocalização
```

---

## Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

- **Node.js** `20.x` ou superior
- **npm** `10.x` ou superior (ou **Bun** / **pnpm** equivalente)
- Uma chave de API da **Google Maps Platform** (para habilitar a visualização do Mapa de Gastos)

---

## Instalação e Execução

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/finglobal.git
   cd finglobal
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente** (veja a seção [Configuração de Variáveis de Ambiente](#configuração-de-variáveis-de-ambiente)):
   ```bash
   cp .env.example .env
   ```

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

5. **Acesse no navegador:**
   Abra [http://localhost:3000](http://localhost:3000).

---

## Configuração de Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto utilizando o arquivo `.env.example` como modelo. No Vite, variáveis expostas ao cliente devem obrigatoriamente começar com o prefixo `VITE_`.

```env
# Chave da Google Maps Platform utilizada pelo componente ExpenseMap
VITE_GOOGLE_MAPS_API_KEY="SUA_CHAVE_GOOGLE_MAPS_API_KEY"
```

### Tabela de Variáveis

| Variável | Obrigatória | Descrição |
| :--- | :---: | :--- |
| `VITE_GOOGLE_MAPS_API_KEY` | Sim (para o Mapa) | Chave de API da Google Maps Platform para renderizar o mapa interativo e os marcadores avançados na aba **Mapa de Gastos**. |

### Como obter e proteger sua chave do Google Maps

1. Acesse o [Google Cloud Console — Credenciais](https://console.cloud.google.com/google/maps-apis/credentials?utm_campaign=gmp_mcp_codeassist_v1_aistudio) e crie ou selecione um projeto.
2. Habilite a **Maps JavaScript API** no projeto.
3. Gere uma nova chave de API e cole-a em `VITE_GOOGLE_MAPS_API_KEY` no seu arquivo `.env`.
4. **Segurança recomendada**: restrinja a chave por **Referenciadores HTTP** (ex.: `http://localhost:3000/*` em desenvolvimento e `https://seu-dominio.com/*` em produção) e limite-a apenas às APIs utilizadas, conforme o [guia de restrição de chaves](https://docs.cloud.google.com/api-keys/docs/add-restrictions-api-keys?utm_campaign=gmp_mcp_codeassist_v1_aistudio).
5. **Importante**: nunca envie o arquivo `.env` com credenciais reais para o repositório Git (o arquivo `.gitignore` já protege arquivos locais de ambiente).

---

## Scripts Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor de desenvolvimento Vite na porta `3000` (`--host=0.0.0.0`). |
| `npm run build` | Compila a aplicação otimizada para produção na pasta `dist/`. |
| `npm run preview` | Serve localmente o build gerado em `dist/` para inspeção pré-deploy. |
| `npm run lint` | Executa a verificação de tipos TypeScript (`tsc --noEmit`). |
| `npm run clean` | Remove os artefatos de build (`dist/`). |

---

## Persistência de Dados

Os dados de contas, transações, orçamentos, metas, moeda base e cotações são armazenados automaticamente no `localStorage` do navegador sob o prefixo `finglobal_*`, garantindo que suas alterações permaneçam salvas entre recarregamentos da página sem necessidade de configuração de banco de dados.

---

## Licença

Este projeto está licenciado sob a licença **Apache 2.0**. Consulte [LICENSE](https://www.apache.org/licenses/LICENSE-2.0) para mais detalhes.
