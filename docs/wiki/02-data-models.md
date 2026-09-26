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
  concept: string;                    // Descripción o nota (ej. 'Compra semanal')
  date: string;                       // ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)
  isRecurring?: boolean;              // Indica si proviene de una recurrencia
  isRecurringGenerated?: boolean;     // Generada automáticamente por el motor de recurrencias
  recurrenceId?: string;              // Enlace al ID de la regla padre si aplica
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

### Servicio de Cotizaciones en Vivo (`priceFeedService.ts`)
Simula una API de mercado financiero en tiempo real con latencia de red estocástica (250-450ms) y oscilaciones brownianas:

```typescript
export interface QuoteResult {
  identifier: string;
  name?: string;
  price: number;
  change24h: number;
  currency: 'EUR' | 'USD';
  lastUpdated: string;
}

export function fetchLiveQuote(identifier: string): Promise<QuoteResult>;
export function batchUpdateQuotes(identifiers: string[]): Promise<Record<string, QuoteResult>>;
```

### Métricas Calculadas para un Activo
- **Capital Invertido**: `shares * averageBuyPrice`
- **Valoración de Mercado**: `shares * currentPrice`
- **Ganancia/Pérdida Neta (P&L)**: `Valoración - Capital Invertido`
- **Rentabilidad Porcentual**: `((currentPrice - averageBuyPrice) / averageBuyPrice) * 100`

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
