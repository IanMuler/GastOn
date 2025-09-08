# Plan MVP-1: GastOn - Gestión de Gastos Personales

## Visión General

Crear un MVP de gestión de gastos personales con React Native, TanStack Query, Express.js y PostgreSQL, adaptando las mejores prácticas y el diseño visual del proyecto timeTracker para crear una experiencia de usuario optimizada para el registro y análisis de gastos.

## Objetivos del MVP-1

1. **Vista Semanal Principal**: Interfaz tipo agenda para visualizar gastos por día
2. **Gestión Completa**: CRUD de categorías, nombres y gastos
3. **Análisis de Balances**: Dashboard y vista agrupada para análisis financiero
4. **Arquitectura Sólida**: Base escalable con React Native y backend robusto

## Stack Tecnológico

**IMPORTANTE**: Antes de instalar cada tecnología, consultar Context7 MCP para obtener la documentación más actualizada de:
- React Native + TypeScript
- Expo Router (file-based routing)
- TanStack Query (React Query)
- Express.js
- PostgreSQL

### Frontend (React Native con Expo)
- **Framework**: React Native + TypeScript con Expo
- **Navegación**: Expo Router (file-based routing system)
- **Estado/Cache**: TanStack Query para manejo de estado del servidor
- **Estilos**: StyleSheet nativo con sistema de colores consistente

### Backend (Express.js)
- **Framework**: Express.js + TypeScript
- **Base de Datos**: PostgreSQL con queries SQL puros (sin ORM)
- **Validación**: Express-validator
- **CORS**: Para desarrollo con React Native

## Arquitectura del Proyecto

### Estructura de Carpetas

```
GastOn/
├── mobile/                              # React Native App con Expo
│   ├── app/                            # Expo Router - file-based routing
│   │   ├── (tabs)/                     # Grupo de tabs (layout agrupado)
│   │   │   ├── _layout.tsx             # Layout de tabs principales
│   │   │   ├── index.tsx               # Pantalla Weekly (tab principal)
│   │   │   ├── manage.tsx              # Pantalla Manage
│   │   │   └── balances.tsx            # Pantalla Balances
│   │   ├── _layout.tsx                 # Layout raíz de la app
│   │   ├── +not-found.tsx              # Pantalla 404
│   │   └── modal/
│   │       ├── add-expense.tsx         # Modal agregar gasto
│   │       └── edit-expense.tsx        # Modal editar gasto
│   ├── src/
│   │   ├── components/
│   │   │   ├── WeeklyView.tsx          # Vista semanal principal
│   │   │   ├── ExpenseItem.tsx         # Item individual de gasto
│   │   │   ├── AddExpenseModal.tsx     # Modal para agregar/editar gastos
│   │   │   ├── CategoryCard.tsx        # Tarjeta de categoría
│   │   │   ├── BalanceCard.tsx         # Tarjetas de balance
│   │   │   └── common/
│   │   │       ├── Button.tsx          # Botón reutilizable
│   │   │       ├── Input.tsx           # Input personalizado
│   │   │       └── Modal.tsx           # Modal base
│   │   ├── hooks/
│   │   │   ├── useExpenses.ts          # TanStack Query para gastos
│   │   │   ├── useCategories.ts        # TanStack Query para categorías
│   │   │   ├── useNames.ts             # TanStack Query para nombres
│   │   │   └── useBalances.ts          # Hook para cálculos de balances
│   │   ├── services/
│   │   │   ├── api.ts                  # Cliente HTTP base
│   │   │   ├── expenses.ts             # API calls para gastos
│   │   │   ├── categories.ts           # API calls para categorías
│   │   │   └── names.ts                # API calls para nombres
│   │   ├── types/
│   │   │   ├── expense.ts              # Tipos para gastos
│   │   │   ├── category.ts             # Tipos para categorías
│   │   │   └── api.ts                  # Tipos de respuestas API
│   │   ├── utils/
│   │   │   ├── dateUtils.ts            # Utilidades de fechas
│   │   │   ├── formatters.ts           # Formateo de moneda y números
│   │   │   └── constants.ts            # Constantes de la app
│   │   └── styles/
│   │       ├── colors.ts               # Paleta de colores
│   │       ├── spacing.ts              # Sistema de espaciado
│   │       └── typography.ts           # Sistema tipográfico
│   ├── package.json
│   ├── app.json                        # Configuración de Expo
│   ├── expo-env.d.ts                   # Types de Expo
│   └── README.md
├── backend/                             # Express.js API
│   ├── src/
│   │   ├── routes/
│   │   │   ├── expenses.js             # Rutas para gastos
│   │   │   ├── categories.js           # Rutas para categorías
│   │   │   └── names.js                # Rutas para nombres
│   │   ├── controllers/
│   │   │   ├── expenseController.js    # Controlador de gastos
│   │   │   ├── categoryController.js   # Controlador de categorías
│   │   │   └── nameController.js       # Controlador de nombres
│   │   ├── db/
│   │   │   ├── connection.js           # Pool de conexiones PostgreSQL
│   │   │   ├── queries.js              # Queries SQL reutilizables
│   │   │   └── migrations/
│   │   │       └── 001_initial_schema.sql
│   │   ├── middleware/
│   │   │   ├── validation.js           # Middleware de validación
│   │   │   └── errorHandler.js         # Manejo de errores
│   │   ├── utils/
│   │   │   └── responseFormatter.js    # Formateo de respuestas
│   │   └── app.js                      # Configuración Express
│   ├── package.json
│   └── README.md
└── base/
    ├── Proyecto.md                      # Especificaciones originales
    └── Plan_1.md                        # Este documento
```

## Modelo de Datos (PostgreSQL)

### Schema de Base de Datos

```sql
-- Categorías de gastos
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(7) DEFAULT '#6B7280', -- Color hex para UI
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nombres predefinidos de gastos
CREATE TABLE nombres_gastos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL UNIQUE,
    categoria_sugerida_id INTEGER REFERENCES categorias(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Registros de gastos
CREATE TABLE gastos (
    id SERIAL PRIMARY KEY,
    monto DECIMAL(10,2) NOT NULL CHECK (monto > 0),
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    categoria_id INTEGER NOT NULL REFERENCES categorias(id),
    nombre_gasto_id INTEGER NOT NULL REFERENCES nombres_gastos(id),
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX idx_gastos_fecha ON gastos(fecha);
CREATE INDEX idx_gastos_categoria ON gastos(categoria_id);
CREATE INDEX idx_gastos_nombre ON gastos(nombre_gasto_id);
CREATE INDEX idx_gastos_fecha_categoria ON gastos(fecha, categoria_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON categorias
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nombres_gastos_updated_at BEFORE UPDATE ON nombres_gastos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gastos_updated_at BEFORE UPDATE ON gastos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Datos Iniciales

```sql
-- Categorías por defecto
INSERT INTO categorias (nombre, color) VALUES
('Comida', '#EF4444'),
('Transporte', '#3B82F6'),
('Entretenimiento', '#8B5CF6'),
('Salud', '#10B981'),
('Hogar', '#F59E0B'),
('Otros', '#6B7280');

-- Nombres de gastos por defecto
INSERT INTO nombres_gastos (nombre, categoria_sugerida_id) VALUES
('Almuerzo', 1),
('Cena', 1),
('Supermercado', 1),
('Uber', 2),
('Colectivo', 2),
('Combustible', 2),
('Cine', 3),
('Streaming', 3),
('Salidas', 3),
('Farmacia', 4),
('Médico', 4),
('Limpieza', 5),
('Servicios', 5);
```

## Interfaces TypeScript

### Tipos Principales

```typescript
// types/expense.ts
export interface Expense {
  id: number;
  monto: number;
  fecha: string; // YYYY-MM-DD
  categoria_id: number;
  nombre_gasto_id: number;
  descripcion?: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseWithDetails extends Expense {
  categoria: Category;
  nombre_gasto: ExpenseName;
}

// types/category.ts
export interface Category {
  id: number;
  nombre: string;
  color: string;
  created_at: string;
  updated_at: string;
}

// types/expenseName.ts
export interface ExpenseName {
  id: number;
  nombre: string;
  categoria_sugerida_id?: number;
  created_at: string;
  updated_at: string;
}

// types/balance.ts
export interface Balance {
  totalMes: number;
  totalPorCategoria: CategoryBalance[];
  totalPorNombre: NameBalance[];
}

export interface CategoryBalance {
  categoria: Category;
  total: number;
  porcentaje: number;
}

export interface NameBalance {
  nombre: ExpenseName;
  total: number;
  frecuencia: number;
}
```

## API Endpoints

### Gastos

```
GET    /api/expenses?fecha_inicio=YYYY-MM-DD&fecha_fin=YYYY-MM-DD
POST   /api/expenses
PUT    /api/expenses/:id
DELETE /api/expenses/:id
GET    /api/expenses/weekly/:fecha (obtiene semana completa)
```

### Categorías

```
GET    /api/categories
POST   /api/categories
PUT    /api/categories/:id
DELETE /api/categories/:id
```

### Nombres de Gastos

```
GET    /api/names
POST   /api/names
PUT    /api/names/:id
DELETE /api/names/:id
GET    /api/names/by-category/:categoria_id
```

### Balances y Estadísticas

```
GET    /api/balances/dashboard?mes=YYYY-MM
GET    /api/balances/grouped?fecha_inicio=YYYY-MM-DD&fecha_fin=YYYY-MM-DD
```

## Componentes Principales

### 1. WeeklyView (Adaptado de timeTracker)

**Referencia**: `/timeTracker/base/React/weeklyView.md`

```typescript
// Estructura basada en timeTracker pero para gastos
const WeeklyView = () => {
  const [selectedDay, setSelectedDay] = useState(0); // 0 = Lunes
  const { data: expenses } = useWeeklyExpenses(getCurrentWeekDates());
  
  // Organización por día similar al timeTracker
  const expensesByDay = organizeExpensesByDay(expenses);
  
  return (
    <View style={styles.container}>
      <WeekHeader />
      <DayTabs selectedDay={selectedDay} onDaySelect={setSelectedDay} />
      <ExpensesList expenses={expensesByDay[selectedDay]} />
      <FAB onPress={() => setShowModal(true)} />
    </View>
  );
};
```

**Características**:
- Layout de 7 días (Lun-Dom) con tabs superiores
- Gastos agrupados por categoría dentro de cada día
- Colores por categoría consistentes
- Botón flotante + para agregar gastos
- Tap en gasto para editar inline

### 2. ExpenseItem

```typescript
interface ExpenseItemProps {
  expense: ExpenseWithDetails;
  onEdit: (expense: Expense) => void;
  onDelete: (id: number) => void;
}

const ExpenseItem = ({ expense, onEdit, onDelete }: ExpenseItemProps) => {
  return (
    <TouchableOpacity 
      style={[styles.container, { borderLeftColor: expense.categoria.color }]}
      onPress={() => onEdit(expense)}
    >
      <View style={styles.content}>
        <Text style={styles.categoryName}>{expense.categoria.nombre}</Text>
        <Text style={styles.expenseName}>{expense.nombre_gasto.nombre}</Text>
      </View>
      <Text style={styles.amount}>${formatCurrency(expense.monto)}</Text>
    </TouchableOpacity>
  );
};
```

### 3. BalancesScreen

```typescript
const BalancesScreen = () => {
  const [viewMode, setViewMode] = useState<'dashboard' | 'grouped'>('dashboard');
  const { data: balance } = useMonthlyBalance();
  
  return (
    <View style={styles.container}>
      <ToggleSwitch 
        options={['Dashboard', 'Lista Agrupada']} 
        selected={viewMode}
        onSelect={setViewMode}
      />
      {viewMode === 'dashboard' ? (
        <DashboardView balance={balance} />
      ) : (
        <GroupedListView balance={balance} />
      )}
    </View>
  );
};
```

## Sistema de Estilos

### Paleta de Colores (Adaptada de timeTracker)

```typescript
// styles/colors.ts
export const colors = {
  // Colores base
  background: '#F8FAFC',
  surface: '#FFFFFF',
  primary: '#0D80F2',
  secondary: '#49739C',
  text: '#0D141C',
  textSecondary: '#49739C',
  
  // Colores para categorías
  categories: [
    '#EF4444', // Rojo - Comida
    '#3B82F6', // Azul - Transporte  
    '#8B5CF6', // Violeta - Entretenimiento
    '#10B981', // Verde - Salud
    '#F59E0B', // Amarillo - Hogar
    '#6B7280', // Gris - Otros
  ],
  
  // Estados
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  
  // Bordes y separadores
  border: '#E7EDF4',
  divider: '#E5E7EB',
};
```

### Sistema de Espaciado

```typescript
// styles/spacing.ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
```

## TanStack Query Setup

### Query Client Configuration

```typescript
// services/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      cacheTime: 1000 * 60 * 10, // 10 minutos
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
```

### Custom Hooks

```typescript
// hooks/useExpenses.ts
export const useWeeklyExpenses = (weekDates: { start: string; end: string }) => {
  return useQuery({
    queryKey: ['expenses', 'weekly', weekDates.start, weekDates.end],
    queryFn: () => getWeeklyExpenses(weekDates.start, weekDates.end),
    staleTime: 1000 * 60 * 2, // 2 minutos para datos recientes
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['balances'] });
    },
  });
};
```

## Funcionalidades Específicas

### 1. Navegación Semanal

- **Vista por defecto**: Semana actual, día actual seleccionado
- **Navegación**: Tabs horizontales para cada día de la semana
- **Estados**: Días con/sin gastos diferenciados visualmente

### 2. Gestión de Categorías

- **CRUD completo** con validación
- **Sistema de colores** con picker predefinido
- **Actualización en cascada** cuando se edita una categoría
- **Validación de eliminación** si tiene gastos asociados

### 3. Balance Dashboard

- **Tarjetas de resumen**: Total mes, total por categoría, top gastos
- **Gráficos simples**: Barras para categorías, distribución porcentual
- **Período configurable**: Mes actual por defecto, selector de mes

### 4. Lista Agrupada

- **Secciones colapsables** por mes
- **Subsecciones** por categoría dentro de cada mes
- **Detalle expandible** por nombre de gasto
- **Totales** en cada nivel de agrupación

## Desarrollo y Deploy

### Scripts de Desarrollo

```json
// mobile/package.json
{
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "web": "expo start --web",
    "build:android": "expo build:android",
    "build:ios": "expo build:ios",
    "test": "jest",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "type-check": "tsc --noEmit"
  }
}

// backend/package.json
{
  "scripts": {
    "dev": "nodemon src/app.js",
    "start": "node src/app.js",
    "db:migrate": "psql -d gaston_db -f src/db/migrations/001_initial_schema.sql",
    "db:seed": "psql -d gaston_db -f src/db/migrations/002_initial_data.sql"
  }
}
```

### Variables de Entorno

```env
# Backend (.env)
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gaston_db
DB_USER=your_user
DB_PASSWORD=your_password
NODE_ENV=development

# Mobile (.env)
API_BASE_URL=http://localhost:3000/api
```

## Criterios de Éxito MVP-1

### Funcional
- ✅ Registro de gastos con categorías y nombres
- ✅ Vista semanal navegable con gastos por día
- ✅ Balance dashboard con totales por categoría
- ✅ CRUD completo de categorías y nombres
- ✅ Lista agrupada por mes/categoría

### Técnico
- ✅ React Native con Expo funcional en Android/iOS
- ✅ Expo Router configurado correctamente con file-based routing
- ✅ TanStack Query configurado correctamente
- ✅ API Express.js con endpoints CRUD
- ✅ PostgreSQL con queries optimizadas
- ✅ TypeScript sin errores

### UX/UI
- ✅ Navegación fluida entre pantallas
- ✅ Formularios de registro intuitivos
- ✅ Feedback visual en todas las acciones
- ✅ Diseño consistente con sistema de colores
- ✅ Experiencia mobile optimizada

## Roadmap Post-MVP

### Version 1.1
- Filtros y búsqueda en balances
- Exportación de datos (CSV/PDF)
- Gráficos avanzados con bibliotecas como Victory

### Version 1.2
- Presupuestos por categoría
- Alertas de límites de gasto
- Análisis de tendencias mensuales

### Version 2.0
- Sincronización en la nube
- Múltiples usuarios/cuentas
- Integración con bancos (APIs)

---

**Nota Importante**: Antes de comenzar la implementación, consultar Context7 MCP para obtener la documentación actualizada de cada tecnología del stack (React Native, Expo Router, TanStack Query, Express.js, PostgreSQL) para asegurar que se utilicen las mejores prácticas más recientes.

Este plan adapta las mejores prácticas y patrones visuales del proyecto timeTracker para crear una aplicación de gestión de gastos robusta y escalable, manteniendo la simplicidad de uso y la claridad visual que caracteriza al proyecto original.