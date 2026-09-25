# 02 - Modelos de Datos y Entidades TypeScript: Fluo

Este documento especifica los tipos y contratos de datos oficiales que rigen el estado global y la base de datos local de Fluo.

---

## 1. Clasificación Principal (Pilares Financieros)

Toda transacción o movimiento financiero se clasifica en uno de los 3 pilares oficiales:

```typescript
export type PillarType = 'income' | 'expense' | 'invest';
```

- **`income`**: Ingresos de cualquier naturaleza (nóminas, dividendos, ventas, rentas).
- **`expense`**: Egresos operativos, fijos o discrecionales (compras, suscripciones, facturas).
- **`invest`**: Asignación de capital hacia activos financieros que generan rendimiento.

---

## 2. Categorías y Marcas Comerciales

### Categoría (`Category`)
```typescript
export interface Category {
  id: string;
  name: string;
  pillar: PillarType;
  icon: string;         // Nombre del icono Lucide (ej. 'Utensils', 'Home', 'Tv', 'Briefcase')
  color: string;        // Hexadecimal o clase CSS
  isDefault?: boolean;
}
```

### Marca Comercial (`Brand`)
Soporta marcas reales (Mercadona, Netflix, DAZN, Carrefour, Repsol, Apple, etc.) para identificar de un vistazo el origen del gasto/ingreso:
```typescript
export interface Brand {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  logoUrl?: string;     // URL opcional o favicon oficial
  brandColor?: string;  // Color representativo de la marca (ej. #E50914 para Netflix)
  isPopular?: boolean;
}
```

---

## 3. Modelo de Transacciones (`Transaction`)

Representa un flujo monetario registrado en una fecha específica:

```typescript
export interface Transaction {
  id: string;
  amount: number;                     // Valor monetario positivo
  pillar: PillarType;                 // 'income' | 'expense' | 'invest'
  categoryId: string;                 // Relación con Category
  brandId?: string;                   // Relación opcional con Brand
  concept: string;                    // Descripción o nota (ej. 'Compra semanal')
  date: string;                       // ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)
  isRecurring?: boolean;              // Indica si proviene de una recurrencia
  recurrenceId?: string;              // Enlace al contrato de recurrencia si aplica
  attachmentUrl?: string;             // Foto de ticket / recibo (opcional)
  createdAt: number;                  // Timestamp
}
```

---

## 4. Módulo de Inversiones y Activos (`InvestmentAsset`)

Soporta las 6 clases de activos exigidas por la especificación de negocio:

```typescript
export type AssetType = 
  | 'stock'           // Acciones individuales (ej. AAPL, NVDA, SAN.MC)
  | 'index_fund'      // Fondos indexados (ej. Vanguard Global Stock Index)
  | 'etf'             // Fondos cotizados en bolsa (ej. Vanguard S&P 500 - VUSA / VWCE)
  | 'crypto'          // Criptomonedas (ej. Bitcoin - BTC, Ethereum - ETH)
  | 'fixed_income'    // Renta fija / Bonos soberanos o corporativos
  | 'deposit';        // Depósitos a plazo fijo o remunerados

export interface InvestmentAsset {
  id: string;
  name: string;                       // Nombre común (ej. 'Vanguard FTSE All-World')
  identifier: string;                 // Ticker (ej. 'VWCE.DE') o ISIN (ej. 'IE00BK5BQT80')
  assetType: AssetType;
  shares: number;                     // Cantidad de títulos / unidades / tokens
  averageBuyPrice: number;            // Precio medio de compra ponderado (PMCP) en divisa base
  currentPrice: number;               // Cotización actual del activo
  currency: 'EUR' | 'USD';
  platform?: string;                  // Broker o entidad (ej. 'Trade Republic', 'MyInvestor', 'Degiro')
  lastUpdated: string;                // Fecha de última cotización
  historicalPrices?: {                // Historial de cotización para mini-sparklines
    date: string;
    price: number;
  }[];
}
```

### Métricas Calculadas para un Activo
- **Capital Invertido**: `shares * averageBuyPrice`
- **Valoración de Mercado**: `shares * currentPrice`
- **Ganancia/Pérdida Neta (P&L)**: `Valoración - Capital Invertido`
- **Rentabilidad Porcentual**: `((currentPrice - averageBuyPrice) / averageBuyPrice) * 100`

---

## 5. Periodicidad y Recurrencias (`RecurrenceRule`)

Permite proyectar cobros y pagos automáticos:

```typescript
export type RecurrenceFrequency = 'weekly' | 'biweekly' | 'monthly' | 'yearly';

export interface RecurrenceRule {
  id: string;
  title: string;                      // Ej. 'Suscripción DAZN', 'Nómina mensual'
  amount: number;
  pillar: PillarType;
  categoryId: string;
  brandId?: string;
  frequency: RecurrenceFrequency;
  startDate: string;                  // Fecha de inicio
  nextDueDate: string;                // Próxima fecha calculada de cargo/abono
  isActive: boolean;
  autoCharge?: boolean;               // Si se auto-registra al llegar la fecha
}
```

---

## 6. Filtros y Resumen Financiero (`FinancialSummary`)

```typescript
export interface FinancialSummary {
  netBalance: number;                 // Ingresos - Gastos + Valoración Activos
  totalIncome: number;                // Suma en el periodo seleccionado
  totalExpense: number;               // Suma en el periodo seleccionado
  totalInvested: number;              // Coste base de adquisión
  portfolioMarketValue: number;       // Valor actual en mercado
  savingsRate: number;                // (Ingresos - Gastos) / Ingresos * 100
  unrealizedPnL: number;              // Plusvalía/Minusvalía latente
}

export type TimeRangeFilter = 'this_month' | 'last_month' | 'last_3_months' | 'this_year' | 'all';
```
