# FinGlobal — Gestão Financeira Multi-Moedas

Aplicativo web de gestão financeira pessoal e internacional com suporte a múltiplas moedas, conversão automática em uma moeda base, gráficos analíticos interativos, sistema de alertas orçamentários por categoria e mapeamento geográfico de despesas via Google Maps Platform.

---

## Principais Funcionalidades

- **Suporte Multi-Moedas & Câmbio**:
  - Gerencie contas e transações em **BRL, USD, EUR, GBP, JPY, CAD, AUD e CHF**.
  - Alterne dinamicamente a **Moeda Base** de consolidação no cabeçalho para recalcular patrimônio, gráficos, metas e alertas instantaneamente.
  - Calculadora de câmbio integrada com tabela de referência de cotações.
- **Sistema de Alertas Orçamentários**:
  - Defina tetos mensais de gastos por categoria (em qualquer moeda) com limiar configurável de aviso preventivo (ex: 80%).
  - **Notificações em tempo real (Toast)** ao registrar uma despesa que atinge ou ultrapassa o limite mensal.
  - **Central de Alertas no Cabeçalho** (ícone de sino com contador de alertas ativos) e banner de destaque na Visão Geral.
  - Painel **Orçamentos & Alertas** com barras de progresso, marcador de limiar e cálculo de valor excedido/restante.
- **Gráficos Analíticos Interativos**:
  - Fluxo de Caixa Mensal (Receitas vs. Despesas vs. Saldo Líquido).
  - Gráfico Donut de Gastos por Categoria com detalhamento percentual.
  - Distribuição Patrimonial por Moeda.
  - Curva de Evolução Acumulada de Despesas.
- **Mapa Geográfico de Despesas (Google Maps Platform)**:
  - Visualização mundial de transações geolocalizadas com `AdvancedMarker` personalizados e janelas informativas (`InfoWindow`).
  - Filtros por moeda, atalhos de cidades e captura de localização via GPS.
- **Extrato Completo, Exportação & Metas**:
  - Busca por texto, filtros por tipo, moeda e categoria, além de exportação de extrato em **CSV**.
  - Acompanhamento de metas financeiras multi-moeda com prazo e barra de progresso.
  - Persistência automática de dados no `localStorage`.

---

## Tecnologias Utilizadas

- **Frontend**: React 19, TypeScript, Vite
- **Estilização**: Tailwind CSS v4, Lucide React (ícones)
- **Mapas & Geolocalização**: `@vis.gl/react-google-maps` (Google Maps JavaScript API, Advanced Markers)
- **Visualização de Dados**: Gráficos SVG responsivos customizados

---

## Estrutura do Projeto

```text
├── index.html
├── metadata.json
├── package.json
├── .env.example
└── src/
    ├── main.tsx                                    # Ponto de entrada e handlers de cota do Google Maps
    ├── App.tsx                                     # Estado global, abas, cálculo de alertas e orquestração
    ├── index.css                                   # Estilos globais (Tailwind CSS)
    ├── types/
    │   └── finance.ts                              # Tipagens (Transaction, Account, Budget, BudgetAlert, Goal)
    ├── services/
    │   └── currencyService.ts                      # Catálogo de moedas, conversão e formatação
    ├── data/
    │   └── mockData.ts                             # Dados iniciais de contas, transações, orçamentos e metas
    └── components/
        ├── budgets/
        │   ├── AlertToastStack.tsx                 # Notificações toast em tempo real
        │   └── BudgetAlertsSection.tsx             # Painel de gestão de orçamentos e alertas ativos
        ├── charts/
        │   ├── CashFlowChart.tsx                   # Gráfico de fluxo de caixa mensal
        │   ├── CategoryDonutChart.tsx              # Gráfico donut de despesas por categoria
        │   ├── CurrencyAllocationChart.tsx         # Distribuição patrimonial por moeda
        │   └── SpendingTrendChart.tsx              # Curva acumulada de gastos
        ├── maps/
        │   └── ExpenseMap.tsx                      # Mapa interativo com Google Maps Platform
        └── modals/
            ├── AccountModal.tsx                    # Cadastro de novas contas/carteiras
            ├── BudgetModal.tsx                     # Criação e edição de limites orçamentários
            ├── CurrencyConverterModal.tsx          # Calculadora de câmbio multi-moeda
            ├── GoalModal.tsx                       # Criação de metas de poupança
            └── TransactionModal.tsx                # Registro de receitas/despesas com geolocalização
```

---

## Configuração e Execução Local

### 1. Pré-requisitos
- Node.js 20+
- npm ou bun

### 2. Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:

```env
VITE_GOOGLE_MAPS_API_KEY="SUA_CHAVE_GOOGLE_MAPS_PLATFORM"
```

### 3. Instalação e Execução

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento (porta 3000)
npm run dev
```

### 4. Verificação de Tipos e Build de Produção

```bash
# Verificar tipagem TypeScript
npm run lint

# Gerar build otimizado em dist/
npm run build
```

---

## Licença

Projeto distribuído sob a licença Apache-2.0.
