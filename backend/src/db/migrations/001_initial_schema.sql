-- GastOn Database Schema
-- Migration: 001_initial_schema.sql
-- Description: Create initial tables for categories, expense names, and expenses

-- Enable UUID extension if needed in the future
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================
-- CATEGORIES TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(7) NOT NULL DEFAULT '#6B7280', -- Hex color for UI
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT categorias_nombre_not_empty CHECK (LENGTH(TRIM(nombre)) > 0),
    CONSTRAINT categorias_color_hex_format CHECK (color ~ '^#[0-9A-Fa-f]{6}$')
);

-- ==============================================
-- EXPENSE NAMES TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS nombres_gastos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL UNIQUE,
    categoria_sugerida_id INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT nombres_gastos_nombre_not_empty CHECK (LENGTH(TRIM(nombre)) > 0)
);

-- ==============================================
-- EXPENSES TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS gastos (
    id SERIAL PRIMARY KEY,
    monto DECIMAL(10,2) NOT NULL,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    categoria_id INTEGER NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
    nombre_gasto_id INTEGER NOT NULL REFERENCES nombres_gastos(id) ON DELETE RESTRICT,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT gastos_monto_positive CHECK (monto > 0),
    CONSTRAINT gastos_fecha_not_future CHECK (fecha <= CURRENT_DATE + INTERVAL '1 day') -- Allow same day with timezone differences
);

-- ==============================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ==============================================

-- Indexes for categorias table
CREATE INDEX IF NOT EXISTS idx_categorias_nombre ON categorias(nombre);

-- Indexes for nombres_gastos table  
CREATE INDEX IF NOT EXISTS idx_nombres_gastos_nombre ON nombres_gastos(nombre);
CREATE INDEX IF NOT EXISTS idx_nombres_gastos_categoria ON nombres_gastos(categoria_sugerida_id);

-- Indexes for gastos table (most frequently queried)
CREATE INDEX IF NOT EXISTS idx_gastos_fecha ON gastos(fecha);
CREATE INDEX IF NOT EXISTS idx_gastos_categoria ON gastos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_gastos_nombre ON gastos(nombre_gasto_id);
CREATE INDEX IF NOT EXISTS idx_gastos_created_at ON gastos(created_at);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_gastos_fecha_categoria ON gastos(fecha, categoria_id);
CREATE INDEX IF NOT EXISTS idx_gastos_fecha_desc ON gastos(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_gastos_week_lookup ON gastos(fecha) WHERE fecha >= CURRENT_DATE - INTERVAL '7 days';

-- ==============================================
-- TRIGGERS FOR AUTOMATIC UPDATED_AT
-- ==============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for each table
DROP TRIGGER IF EXISTS update_categorias_updated_at ON categorias;
CREATE TRIGGER update_categorias_updated_at 
    BEFORE UPDATE ON categorias
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_nombres_gastos_updated_at ON nombres_gastos;
CREATE TRIGGER update_nombres_gastos_updated_at 
    BEFORE UPDATE ON nombres_gastos
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_gastos_updated_at ON gastos;
CREATE TRIGGER update_gastos_updated_at 
    BEFORE UPDATE ON gastos
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- USEFUL VIEWS FOR COMMON QUERIES
-- ==============================================

-- View for expenses with full details (joins all related data)
CREATE OR REPLACE VIEW gastos_detallados AS
SELECT 
    g.id,
    g.monto,
    g.fecha,
    g.descripcion,
    g.created_at,
    g.updated_at,
    c.id as categoria_id,
    c.nombre as categoria_nombre,
    c.color as categoria_color,
    ng.id as nombre_gasto_id,
    ng.nombre as nombre_gasto
FROM gastos g
JOIN categorias c ON g.categoria_id = c.id
JOIN nombres_gastos ng ON g.nombre_gasto_id = ng.id;

-- View for weekly expense summaries
CREATE OR REPLACE VIEW gastos_semanales AS
SELECT 
    DATE_TRUNC('week', fecha) as semana_inicio,
    DATE_TRUNC('week', fecha) + INTERVAL '6 days' as semana_fin,
    COUNT(*) as total_gastos,
    SUM(monto) as total_monto,
    AVG(monto) as promedio_monto
FROM gastos 
GROUP BY DATE_TRUNC('week', fecha)
ORDER BY semana_inicio DESC;

-- ==============================================
-- COMMENTS FOR DOCUMENTATION
-- ==============================================

COMMENT ON TABLE categorias IS 'Expense categories with colors for UI display';
COMMENT ON COLUMN categorias.color IS 'Hex color code for category display (#RRGGBB format)';

COMMENT ON TABLE nombres_gastos IS 'Predefined expense names with optional suggested categories';
COMMENT ON COLUMN nombres_gastos.categoria_sugerida_id IS 'Suggested category for this expense name (nullable)';

COMMENT ON TABLE gastos IS 'Individual expense records';
COMMENT ON COLUMN gastos.monto IS 'Expense amount in Argentine Pesos';
COMMENT ON COLUMN gastos.fecha IS 'Date when the expense occurred';

COMMENT ON VIEW gastos_detallados IS 'Complete expense information with category and name details';
COMMENT ON VIEW gastos_semanales IS 'Weekly expense summaries for reporting';

-- ==============================================
-- INITIAL SCHEMA VALIDATION
-- ==============================================

-- Verify all tables were created
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('categorias', 'nombres_gastos', 'gastos');
    
    IF table_count = 3 THEN
        RAISE NOTICE 'SUCCESS: All tables created successfully';
    ELSE
        RAISE EXCEPTION 'ERROR: Expected 3 tables, found %', table_count;
    END IF;
END $$;