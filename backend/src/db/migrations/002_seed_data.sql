-- GastOn Database Seed Data
-- Migration: 002_seed_data.sql
-- Description: Insert initial categories and expense names based on frontend mock data

-- ==============================================
-- SEED CATEGORIES (from frontend mock data)
-- ==============================================

INSERT INTO categorias (nombre, color) VALUES
('Comida', '#EF4444'),
('Transporte', '#3B82F6'),
('Entretenimiento', '#8B5CF6'),
('Salud', '#10B981'),
('Hogar', '#F59E0B'),
('Otros', '#6B7280')
ON CONFLICT (nombre) DO UPDATE SET
    color = EXCLUDED.color,
    updated_at = NOW();

-- ==============================================
-- SEED EXPENSE NAMES (from frontend mock data)
-- ==============================================

-- Get category IDs for references
INSERT INTO nombres_gastos (nombre, categoria_sugerida_id) VALUES
('Almuerzo', (SELECT id FROM categorias WHERE nombre = 'Comida')),
('Supermercado', (SELECT id FROM categorias WHERE nombre = 'Comida')),
('Cena', (SELECT id FROM categorias WHERE nombre = 'Comida')),
('Desayuno', (SELECT id FROM categorias WHERE nombre = 'Comida')),
('Cafe', (SELECT id FROM categorias WHERE nombre = 'Comida')),

('Uber', (SELECT id FROM categorias WHERE nombre = 'Transporte')),
('Colectivo', (SELECT id FROM categorias WHERE nombre = 'Transporte')),
('Taxi', (SELECT id FROM categorias WHERE nombre = 'Transporte')),
('Combustible', (SELECT id FROM categorias WHERE nombre = 'Transporte')),
('Estacionamiento', (SELECT id FROM categorias WHERE nombre = 'Transporte')),

('Cine', (SELECT id FROM categorias WHERE nombre = 'Entretenimiento')),
('Teatro', (SELECT id FROM categorias WHERE nombre = 'Entretenimiento')),
('Streaming', (SELECT id FROM categorias WHERE nombre = 'Entretenimiento')),
('Salidas', (SELECT id FROM categorias WHERE nombre = 'Entretenimiento')),
('Libros', (SELECT id FROM categorias WHERE nombre = 'Entretenimiento')),

('Farmacia', (SELECT id FROM categorias WHERE nombre = 'Salud')),
('Medico', (SELECT id FROM categorias WHERE nombre = 'Salud')),
('Dentista', (SELECT id FROM categorias WHERE nombre = 'Salud')),
('Gimnasio', (SELECT id FROM categorias WHERE nombre = 'Salud')),

('Limpieza', (SELECT id FROM categorias WHERE nombre = 'Hogar')),
('Servicios', (SELECT id FROM categorias WHERE nombre = 'Hogar')),
('Supermercado Casa', (SELECT id FROM categorias WHERE nombre = 'Hogar')),
('Reparaciones', (SELECT id FROM categorias WHERE nombre = 'Hogar')),

('Regalos', (SELECT id FROM categorias WHERE nombre = 'Otros')),
('Donaciones', (SELECT id FROM categorias WHERE nombre = 'Otros')),
('Varios', (SELECT id FROM categorias WHERE nombre = 'Otros'))

ON CONFLICT (nombre) DO UPDATE SET
    categoria_sugerida_id = EXCLUDED.categoria_sugerida_id,
    updated_at = NOW();

-- ==============================================
-- VERIFICATION QUERIES
-- ==============================================

-- Verify categories were inserted
DO $$
DECLARE
    category_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO category_count FROM categorias;
    RAISE NOTICE 'Categories inserted: %', category_count;
    
    IF category_count < 6 THEN
        RAISE WARNING 'Expected at least 6 categories, found %', category_count;
    END IF;
END $$;

-- Verify expense names were inserted
DO $$
DECLARE
    expense_name_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO expense_name_count FROM nombres_gastos;
    RAISE NOTICE 'Expense names inserted: %', expense_name_count;
    
    IF expense_name_count < 20 THEN
        RAISE WARNING 'Expected at least 20 expense names, found %', expense_name_count;
    END IF;
END $$;

-- Show summary of inserted data
SELECT 
    'Categories' as table_name,
    COUNT(*) as record_count,
    STRING_AGG(nombre, ', ' ORDER BY nombre) as sample_names
FROM categorias
UNION ALL
SELECT 
    'Expense Names' as table_name,
    COUNT(*) as record_count,
    STRING_AGG(nombre, ', ' ORDER BY nombre LIMIT 10) as sample_names
FROM nombres_gastos;

-- Show categories with their suggested expense names count
SELECT 
    c.nombre as categoria,
    c.color,
    COUNT(ng.id) as nombres_asociados
FROM categorias c
LEFT JOIN nombres_gastos ng ON c.id = ng.categoria_sugerida_id
GROUP BY c.id, c.nombre, c.color
ORDER BY c.nombre;