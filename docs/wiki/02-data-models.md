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
  icon: string;         // Nombre del icono Lucide (ej. 'Utensils', 'Home', 'Tv', 'Briefcase', 'ArrowDownLeft', 'Laptop', 'Building2', etc.)
  color: string;        // Hexadecimal o clase CSS
  isDefault?: boolean;
}
```

### Catálogo de Categorías por Pilar
- **Ingresos (`income`) - 10 Categorías Semánticas**:
  1. `cat-salary`: Nómina y Salario (`Briefcase`, `#10B981`)
  2. `cat-bizum-transfers`: Bizum y Transferencias (`ArrowDownLeft`, `#059669`)
  3. `cat-dividends`: Dividendos y Rendimientos (`Coins`, `#34D399`)
  4. `cat-freelance`: Freelance y Facturación (`Laptop`, `#10B981`)
  5. `cat-sales`: Ventas y Segunda Mano (`Sparkles`, `#6EE7B7`)
  6. `cat-rental-income`: Alquileres e Inmuebles (`Building2`, `#047857`)
  7. `cat-bank-interest`: Intereses y Cuentas Remuneradas (`Percent`, `#34D399`)
  8. `cat-refunds`: Devoluciones y Reembolsos (`RotateCcw`, `#6EE7B7`)
  9. `cat-gifts-grants`: Premios, Regalos y Becas (`Gift`, `#A7F3D0`)
  10. `cat-other-income`: Otros Ingresos (`Wallet`, `#059669`)
- **Gastos (`expense`) - 7 Categorías**: Supermercado, Suscripciones, Vivienda, Transporte, Ocio, Compras y Salud.
- **Inversiones (`invest`) - 5 Categorías**: Fondos y ETFs, Acciones, Criptoactivos, Renta Fija y Depósitos.

### Marca Comercial (`Brand`)
Soporta marcas reales (Mercadona, Netflix, DAZN, Carrefour, Repsol, Apple, Spotify, Amazon, etc.) para identificar de un vistazo el origen del gasto/ingreso:
```typescript
export interface Brand {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  domain?: string;      // Dominio web raíz para resolución automática de logo (ej. 'mercadona.es')
  logoUrl?: string;     // URL opcional o favicon oficial
  brandColor?: string;  // Color representativo de la marca (ej. #E50914 para Netflix)
  isPopular?: boolean;
}
```

### Catálogo Base Offline (120+ Marcas Oficiales)
El archivo [`categoriesAndBrands.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/src/data/categoriesAndBrands.ts) agrupa más de 120 marcas de consumo recurrente categorizadas con dominios oficiales:

1. **Supermercados & Alimentación**: Mercadona, Carrefour, Lidl, Dia, Alcampo, El Corte Inglés, Hipercor, Costco, Eroski, Consum, Ahorramás, Aldi, Bonpreu, Caprabo, BM, Alimerka, HiperDino.
2. **Suscripciones, Streaming & Software**: Netflix, Spotify, DAZN, Disney+, Max (HBO), YouTube Premium, Apple, Amazon Prime, PlayStation, Xbox, Nintendo, Steam, Epic Games, Twitch, Crunchyroll, Filmin, Audible, OpenAI (ChatGPT), Adobe, Notion, Canva, GitHub.
3. **Restauración, Hostelería & Delivery**: McDonald's, Burger King, KFC, Subway, Domino's, Telepizza, Papa John's, Starbucks, Tim Hortons, Dunkin', Glovo, Just Eat, Uber Eats, Goiko, Foster's Hollywood, VIPS, 100 Montaditos, La Tagliatella, Five Guys, Taco Bell, Popeyes, Rodilla.
4. **Transporte, Movilidad & Aerolíneas**: Repsol, Cepsa, BP, Shell, Galp, Plenoil, Ballenoil, Uber, Cabify, Bolt, FREE NOW, Renfe, Iryo, Ouigo, ALSA, Cooltra, Iberia, Vueling, Ryanair, Air Europa, easyJet, Booking.com, Airbnb.
5. **Moda, Retail & Hogar**: Zara, Pull&Bear, Bershka, Stradivarius, Massimo Dutti, Mango, H&M, Primark, SHEIN, Temu, AliExpress, Nike, Adidas, Puma, Decathlon, JD Sports, IKEA, Leroy Merlin, MediaMarkt, PcComponentes, Fnac, Sephora, Primor, Druni.
6. **Suministros, Vivienda & Telecom**: Iberdrola, Endesa, Naturgy, TotalEnergies, Movistar, Vodafone, Orange, DIGI Mobil, Yoigo, O2, Lowi, Pepephone.
7. **Finanzas, Banca, Brokers & Cripto**: BBVA, Banco Santander, CaixaBank, Bankinter, Banco Sabadell, ING, Openbank, Revolut, N26, Wise, PayPal, Bizum, Vanguard, Trade Republic, MyInvestor, DEGIRO, Interactive Brokers, Scalable Capital, Trading 212, eToro, Indexa Capital, Binance, Coinbase, Kraken, Bit2Me, Bitpanda.
8. **Salud, Cuidado & Fitness**: Basic-Fit, McFit, VivaGym, Altafit, Sanitas, Adeslas, Mapfre.

### Modelo del Motor Global de Marcas (`GlobalBrandSuggestion`)
Definido en [`companySearchService.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/src/services/companySearchService.ts) para representar resultados en vivo de la API de Clearbit (25M+ empresas):

```typescript
export interface GlobalBrandSuggestion {
  name: string;
  domain: string;
  logoUrl?: string;
  suggestedCategoryId: string;
}

export function searchGlobalBrands(query: string, signal?: AbortSignal): Promise<GlobalBrandSuggestion[]>;
export function inferCategoryId(name: string, domain: string): string;
export function createBrandFromSuggestion(suggestion: GlobalBrandSuggestion, fallbackCategoryId?: string): Brand;
```

### Esquema de Resolución de Logos Vectoriales (`brandLogo.ts`)
Para garantizar que cada transacción muestre un logotipo en altísima resolución sin degradarse en pantallas Retina/Super AMOLED y sin marcos blancos indeseados, `src/utils/brandLogo.ts` utiliza una cascada inteligente:

1. **URL Personalizada (`customLogoUrl`)**: Si la marca posee un asset estático local o SVG explícito.
2. **Vector SVG Nativo SimpleIcons**: `https://cdn.simpleicons.org/${slug}` para renderizado directo en curvas matemáticas vectoriales `image/svg+xml`.
3. **CDN Vectorial Secundario (WorldVectorLogo / unavatar.io)**: `https://unavatar.io/${domain}?fallback=false`.
4. **Favicon HD Alta Densidad (Google 128px)**: `https://www.google.com/s2/favicons?domain=${domain}&sz=128`.
5. **Fallback Clearbit**: `https://logo.clearbit.com/${domain}`.
6. **Fallback Semántico (`CategoryIcon`)**: Si ningún CDN responde o el dispositivo se encuentra offline, `BrandAvatar` conmuta limpiamente a [`CategoryIcon.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/common/CategoryIcon.tsx) renderizando el glifo Lucide de su categoría.

### Contrato del Buscador de Marcas (`BrandPicker.tsx`)
```typescript
export interface BrandPickerProps {
  selectedBrandId: string;
  onSelectBrand: (brandId: string, suggestedCategoryId?: string) => void;
  categoryId?: string;
  label?: string;            // Etiqueta superior personalizada (ej. 'Comercio / Marca' o 'Broker / Plataforma')
  placeholder?: string;      // Placeholder del input de búsqueda rápida
}
```
- **Búsqueda Dual (Local + Global en Vivo)**: Filtra en tiempo real el catálogo local y ejecuta en paralelo una búsqueda contra la API global de empresas.
- **Acceso Rápido (Popular Pills)**: Botones interactivos tipo chip con las marcas de mayor frecuencia según la categoría activa.
- **Inferencia Automática de Categoría**: Al pulsar una marca global (ej. "Steam" o "Ryanair"), Fluo pre-asigna la categoría correspondiente sin intervención del usuario.
- **Creación de Marcas Personalizadas**: Botón `+ Crear marca personalizada` para establecimientos locales o no indexados.

### Contrato del Icono de Categoría (`CategoryIcon.tsx`)
```typescript
export interface CategoryIconProps {
  iconName?: string;
  className?: string;
  size?: number;
  color?: string;
}
```
Mapea cadenas de texto de categoría a componentes vectoriales de Lucide React con halo translúcido suave.

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
  sourceId?: string;                  // Relación opcional con SourceAccount (origen de fondos)
  concept: string;                    // Descripción o nota (ej. 'Compra semanal')
  date: string;                       // ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)
  isRecurring?: boolean;              // Indica si proviene de una recurrencia
  isRecurringGenerated?: boolean;     // Generada automáticamente por el motor de recurrencias
  recurrenceId?: string;              // Enlace al ID de la regla padre si aplica
  attachmentUrl?: string;             // Foto de ticket / recibo (opcional)
  createdAt: number;                  // Timestamp
}
```

### Correspondencia con la Tabla SQL `public.transactions` en Supabase

| Campo TypeScript (`Transaction`) | Columna SQL (`public.transactions`) | Tipo PostgreSQL | Restricciones / Mapeo |
| :--- | :--- | :--- | :--- |
| `id` | `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` |
| *(Auth Context)* | `user_id` | `UUID` | `NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE` |
| `pillar` | `type` | `TEXT` | `NOT NULL CHECK (type IN ('income', 'expense'))` |
| `amount` | `amount` | `NUMERIC` | `NOT NULL` |
| `categoryId` | `category` | `TEXT` | `NOT NULL` |
| `brandId` / `concept` | `brand` | `TEXT` | `NULL` (codificación transparente `brandId::concept` o texto) |
| `date` | `date` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()`, Índice `idx_transactions_user_date` |
| `isRecurring` | `is_recurring` | `BOOLEAN` | `DEFAULT FALSE` |
| `recurrenceId` | `recurring_period` | `TEXT` | `CHECK (recurring_period IN ('weekly', 'biweekly', 'monthly', 'yearly'))` |
| `createdAt` | `created_at` | `TIMESTAMPTZ` | `DEFAULT now()` |
| `sourceId` | `source_id` | `TEXT` | `NULL` |

### Operaciones CRUD de Transacciones
- **Alta (`addTransaction`)**: Inserta el registro local en Zustand preservando la fecha seleccionada (`date` en formato ISO 8601 `YYYY-MM-DDTHH:mm:ss.sssZ`), asignando el `sourceId` seleccionado, reordena la colección global cronológicamente en orden descendente e invoca en segundo plano `insertCloudTransaction` en Supabase.
- **Edición (`updateTransaction`)**: Actualiza selectivamente los campos modificados (`amount`, `concept`, `pillar`, `categoryId`, `brandId`, `sourceId`, `date`) en memoria, preserva o reordena cronológicamente y sincroniza vía `updateCloudTransaction(id, updatedFields, userId)`.
- **Baja (`deleteTransaction`)**: Elimina el registro del estado reactivo y envía la petición de borrado a Supabase vía `deleteCloudTransaction`.
- **Ordenación Cronológica Garantizada**: Todas las mutaciones de transacciones aplican `sortTransactionsDesc` para garantizar que movimientos con fechas pasadas o futuras se sitúen exactamente en su posición cronológica correspondiente en el historial, estadísticas y gráficos.

---

## 3.5. Fuentes de Dinero y Cuentas (`SourceAccount`)

Modela los orígenes de dinero independientes (bancos o efectivo) que componen el patrimonio líquido del usuario:

```typescript
export type SourceType = 'bank' | 'cash';

export interface SourceAccount {
  id: string;
  userId?: string;
  name: string;                       // Ej. "Cuenta Nómina", "Ahorro", "Billetera"
  type: SourceType;                   // 'bank' | 'cash'
  institution?: string;               // Ej. "BBVA", "Santander", "Revolut", "Efectivo"
  brandId?: string;                   // Relación opcional con catálogo Brand
  initialBalance?: number;            // Balance inicial de apertura
  orderIndex: number;                 // Orden ordinal para carrusel y selectores (0..N)
  color?: string;                     // Color semántico o hexadecimal
  createdAt: string;                  // ISO 8601
}

export interface SourceBalanceInfo {
  sourceId: string;
  name: string;
  initialBalance: number;
  income: number;
  expense: number;
  investExpense: number;
  netBalance: number;
  transactionCount: number;
}

// Estado de aislamiento de cuenta en el store global:
// activeSourceId: string | null (null = Patrimonio Neto Total / Consolidado)
// setActiveSourceId: (id: string | null) => void;
```

### Correspondencia con la Tabla SQL `public.source_accounts` en Supabase

```sql
CREATE TABLE IF NOT EXISTS public.source_accounts (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('bank', 'cash')),
  institution TEXT,
  brand_id TEXT,
  initial_balance NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
  order_index INTEGER DEFAULT 0 NOT NULL,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_source_accounts_user_order 
  ON public.source_accounts(user_id, order_index ASC);
```

Políticas RLS aplicadas:
- `ENABLE ROW LEVEL SECURITY;`
- Lectura, Inserción, Actualización y Borrado restringidos a `auth.uid() = user_id`.

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
  name: string;                       // Nombre común (ej. 'Vanguard US 500 Stock Index Fund')
  identifier: string;                 // Ticker (ej. 'VWCE.DE') o ISIN (ej. 'IE0032126645')
  ticker?: string;                    // Ticker bursátil explícito (ej. 'AAPL', 'VUSA')
  isin?: string;                      // Código ISIN normalizado (ej. 'IE0032126645')
  quoteTicker?: string;               // Ticker de consulta resuelto (ej. '0P00000SUJ.F' o 'VUSA.AS')
  quote_ticker?: string;              // Alias de persistencia en base de datos
  lastPriceUpdate?: string;           // Timestamp ISO 8601 de última sincronización
  last_price_update?: string;         // Alias de persistencia en base de datos
  currentValue?: number;              // Valor total de mercado (shares * currentPrice)
  pnl?: number;                       // Beneficio / pérdida no realizado en divisa base
  pnlPercentage?: number;             // Rentabilidad no realizada en porcentaje
  assetType: AssetType;
  shares: number;                     // Cantidad de títulos / participaciones (admite decimales)
  averageBuyPrice: number;            // Precio medio de compra ponderado (PMCP) inmutable
  averagePrice?: number;              // Alias de compatibilidad
  currentPrice: number;               // Cotización actual oficial de mercado
  currency: 'EUR' | 'USD';
  platform?: string;                  // Broker o entidad (ej. 'MyInvestor', 'Trade Republic')
  brandId?: string;                   // ID del broker en el catálogo para resolución de logo oficial
  lastUpdated: string;                // Fecha y hora de última cotización amigable
  historicalPrices?: {                // Historial de cotización para mini-sparklines
    date: string;
    price: number;
  }[];
  change24h?: number;                 // Variación porcentual en las últimas 24 horas
  isOfflineCached?: boolean;          // Indica si el dato proviene de la caché offline local
  initialFee?: number;                // Comisiones iniciales de intermediación o compra
  acquisitionDate?: string;           // Fecha de adquisición inicial (YYYY-MM-DD)
}
```

### Correspondencia con la Tabla SQL `public.investments` en Supabase

| Campo TypeScript (`InvestmentAsset`) | Columna SQL (`public.investments`) | Tipo PostgreSQL | Restricciones / Mapeo |
| :--- | :--- | :--- | :--- |
| `id` | `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` |
| *(Auth Context)* | `user_id` | `UUID` | `NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE` |
| `assetType` | `asset_type` | `TEXT` | `NOT NULL` |
| `name` | `name` | `TEXT` | `NOT NULL`, Índice `idx_investments_user_name` |
| `identifier` / `ticker` / `isin` | `symbol_or_isin` o `identifier` | `TEXT` | `NOT NULL`, Soporte dual transparente en inserción y lectura |
| `shares` | `shares` | `NUMERIC` | `NOT NULL` |
| `averageBuyPrice` | `average_buy_price` | `NUMERIC` | `NOT NULL` (Inmutable ante variaciones de mercado) |
| `currency` | `currency` | `TEXT` | `DEFAULT 'EUR'` |
| `platform` | `platform` | `TEXT` | `NULLABLE` |
| `initialFee` | `initial_fee` | `NUMERIC` | `DEFAULT 0` |
| `acquisitionDate` | `acquisition_date` | `TIMESTAMPTZ` | `NULLABLE` |
| `quoteTicker` | `quote_ticker` | `TEXT` | `NULLABLE` (Ticker activo resuelto para fondos/ISIN) |
| `lastPriceUpdate` | `last_price_update` | `TIMESTAMPTZ` | `DEFAULT now()` |
| `currentPrice` | `current_price` | `NUMERIC` | `NULLABLE` |
| *(Metadata)* | `created_at` | `TIMESTAMPTZ` | `DEFAULT now()` |

> **Nota Arquitectónica**: `average_buy_price` nunca se sobreescribe durante las actualizaciones periódicas de mercado. `current_value`, `pnl` y `pnl_percentage` se calculan dinámicamente tanto en cliente como en store, reflejando fielmente la rentabilidad viva de la cartera sin alterar la inversión inicial. La persistencia en `public.investments` implementa inserción adaptativa para soportar tanto instalaciones con columna `identifier` como instalaciones con `symbol_or_isin`.

export function parseInvestmentConcept(concept: string): { name: string; identifier: string };
export function inferAssetTypeFromCategory(categoryId?: string, identifier?: string): AssetType;
export function autoCorrectAssetShares(
  asset: InvestmentAsset,
  referenceMarketPrice?: number
): { asset: InvestmentAsset; wasCorrected: boolean };
export function reconcileAssetsFromTransactions(
  transactions: Transaction[],
  currentAssets?: InvestmentAsset[],
  brands?: { id: string; name: string }[],
  priceLookup?: (identifier: string) => number | undefined
): InvestmentAsset[];
```

### Servicio de Búsqueda y Cotizaciones en Tiempo Real (`marketDataService.ts`)
Gestiona el catálogo de activos financieros, resolución de símbolos y fallback resiliente:

```typescript
export interface MarketAssetItem {
  name: string;
  identifier: string;
  ticker?: string;
  isin?: string;
  assetType: AssetType;
  currency: 'EUR' | 'USD';
  basePrice: number;
  change24h: number;
  benchmarkOrIndex?: string;
  keywords?: string[];
  isCustom?: boolean;
}

export interface MarketQuoteResult {
  identifier: string;
  name: string;
  ticker?: string;
  isin?: string;
  price: number;
  change24h: number;
  currency: 'EUR' | 'USD';
  lastUpdated: string;
  isOfflineCached: boolean;
}

export interface AutocompleteAssetMatch {
  source: 'portfolio' | 'catalog';
  name: string;
  identifier: string;
  ticker?: string;
  isin?: string;
  quoteTicker?: string;
  assetType: AssetType;
  currency: 'EUR' | 'USD';
  currentPrice: number;
  averageBuyPrice?: number;
  platform?: string;
  brandId?: string;
  benchmarkOrIndex?: string;
}

export function searchAssets(query: string): Promise<MarketAssetItem[]>;
export function findMatchingExistingAssets(query: string, portfolioAssets?: InvestmentAsset[]): AutocompleteAssetMatch[];
export function fetchCurrentPrice(identifier: string): Promise<MarketQuoteResult>;
export function batchUpdateMarketQuotes(identifiers: string[]): Promise<Record<string, MarketQuoteResult>>;
export function getQuoteFromCache(identifier: string): MarketQuoteResult | null;
export function clearMarketQuotesCache(): void;
```

### Métricas Calculadas para un Activo y Cartera Global (P&L Dinámico)
- **Capital Invertido**: `(shares * averageBuyPrice) + (initialFee || 0)`
- **Valoración Actual de Mercado**: `shares * currentPrice`
- **Ganancia/Pérdida Neta (P&L)**: `Valoración - Capital Invertido`
- **Rentabilidad Porcentual**: `((currentPrice - averageBuyPrice) / averageBuyPrice) * 100` (o `((Valoración - Invertido) / Invertido) * 100` con comisiones)
- **Patrimonio Total Invertido**: Sumatorio de Capital Invertido de todos los activos en cartera
- **Plusvalía/Minusvalía Total No Realizada**: Sumatorio de P&L de todos los activos en cartera

---

## 5. Periodicidad y Recurrencias (`RecurrenceRule`)

Permite proyectar cobros y pagos automáticos con configuración granular y ejecución en cliente:

```typescript
export type RecurrenceFrequency = 'weekly' | 'biweekly' | 'monthly' | 'yearly';

export interface RecurrenceRule {
  id: string;
  title: string;                      // Ej. 'Suscripción Netflix', 'Nómina mensual'
  amount: number;
  pillar: PillarType;
  categoryId: string;
  brandId?: string;
  frequency: RecurrenceFrequency;
  dayOfWeek?: number;                 // 1 = Lunes, ..., 7 = Domingo (para frecuencia semanal)
  dayOfMonth?: number;                // 1 al 31 (para mensual con ajuste a fin de mes)
  startDate: string;                  // Fecha de inicio (ISO 8601)
  endDate?: string;                   // Fecha de finalización opcional (ISO 8601)
  nextDueDate: string;                // Próxima fecha calculada de cargo/abono
  lastProcessedDate?: string;         // Última fecha en que se generó un cobro automático
  isActive: boolean;
  autoCharge?: boolean;               // Si se auto-registra al llegar la fecha (default: true)
}
```

### Contrato del Motor de Automatización (`recurringEngine.ts`)
```typescript
export interface RecurrenceProcessingResult {
  generatedTransactions: Transaction[];
  updatedRules: RecurrenceRule[];
}

export function getDaysInMonth(year: number, monthZeroIndexed: number): number;
export function computeNextDueDate(currentDueDateStr: string, rule: Pick<RecurrenceRule, 'frequency' | 'dayOfMonth' | 'dayOfWeek'>): string;
export function calculateFirstNextDueDate(baseDate: Date, rule: { frequency: RecurrenceFrequency; dayOfWeek?: number; dayOfMonth?: number; startDate?: string }): string;
export function processDueRecurrences(rules: RecurrenceRule[], existingTransactions: Transaction[], asOfDate?: Date): RecurrenceProcessingResult;
```
- **Ajuste de Fin de Mes (Clamping)**: Si una regla mensual tiene `dayOfMonth: 31`, en meses de 28, 29 o 30 días el motor clampea el cobro al último día disponible de dicho mes para evitar omitir transacciones.
- **Catch-up Idempotente**: Si transcurren periodos sin abrir la app, el motor genera todas las ejecuciones atrasadas (`isRecurringGenerated: true`) evitando duplicados mediante firmas únicas `ruleId_YYYY-MM-DD`.

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

---

## 7. Modelos de Autenticación, Perfil y Bóveda de Seguridad

### Contrato del Contexto de Autenticación (`AuthContextType`)
```typescript
export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isDemoMode: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: AuthError | Error | null; data?: any }>;
  signOut: () => Promise<void>;
  enterDemoMode: () => void;
  exitDemoMode: () => void;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | Error | null }>;
  deleteUserAccount: () => Promise<{ error: Error | null }>;
}
```

### Contrato del Modal de Perfil (`ProfileSettingsModalProps`)
```typescript
export interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignOut: () => void;
}
```

### Bóveda Criptográfica y Estado de Seguridad (`useSecurityLock`)
```typescript
export interface SecurityLockHookResult {
  isLocked: boolean;
  hasPin: boolean;
  isBiometricsAvailable: boolean;
  isBiometricsEnabled: boolean;
  lockoutSecondsRemaining: number;
  lockNow: () => void;
  unlockNow: () => void;
  setupPin: (pin: string) => Promise<boolean>;
  changePin: (currentPin: string, newPin: string) => Promise<{ success: boolean; error?: string }>;
  removePin: () => void;
  verifyCurrentPin: (pin: string) => Promise<boolean>;
  toggleBiometrics: (enable: boolean) => Promise<boolean>;
  unlockWithPin: (pin: string) => Promise<boolean>;
  unlockWithBiometrics: () => Promise<boolean>;
  resetSecurity: () => void;
}

---

## 8. Modelos y Utilidades de Entrada de Inversiones (`investmentValidation.ts`)

Para permitir la entrada flexible de inversiones (por importe desembolsado o por número de títulos) y garantizar la integridad matemática de las posiciones:

### Modos de Entrada (`InvestInputMode`)
```typescript
export type InvestInputMode = 'total' | 'shares';
```
- **`total`**: Entrada principal por importe total en euros/divisa. Las participaciones se calculan automáticamente dividiendo entre el precio de cotización (`total / price`, hasta 6 decimales).
- **`shares`**: Entrada clásica por número de participaciones o títulos. El importe total se calcula multiplicando títulos por precio (`shares * price`, redondeado a 2 decimales).

### Resultado de Validación de Inversión (`InvestmentValidationResult`)
```typescript
export interface InvestmentValidationResult {
  isValid: boolean;
  errors: string[];
  shares: number | null;
  averageBuyPrice: number | null;
  totalInvested: number | null;
  currentPrice: number | null;
}
```

### Funciones Puras de Validación y Aritmética Financiera
- `normalizeDecimalInput(raw: string | null | undefined): string`: Normaliza comas decimales a puntos y descarta espacios en blanco.
- `parsePositiveNumber(raw: string | null | undefined): number | null`: Parsea números finitos estrictamente positivos (> 0).
- `calculateSharesFromTotal(totalAmount: number, unitPrice: number): number | null`: Calcula participaciones a 6 decimales.
- `calculateTotalFromShares(shares: number, unitPrice: number): number | null`: Calcula total invertido a 2 decimales.
- `calculateAverageBuyPrice(totalAmount: number, shares: number): number | null`: Deduce el precio de compra unitario medio a 4 decimales.
- `isValidMarketPrice(price: unknown): price is number`: Validador de tipo para cotizaciones de mercado en tiempo real.
- `validateInvestmentEntry(fields: {...}): InvestmentValidationResult`: Validador integral de formulario antes del commit atómico.

```
