-- Calculator V2 Seed Data
-- Initial data for project templates and sample projects

-- System project templates
INSERT INTO project_templates (name, description, project_type, template_data, is_system_template) VALUES 
(
    'Casa Residencial Básica',
    'Plantilla para proyectos residenciales estándar con cálculos básicos de instalación eléctrica',
    'residential',
    '{
        "circuits": [
            {"name": "Iluminación general", "type": "lighting", "voltage": 220, "load": 1200},
            {"name": "Tomacorrientes", "type": "outlets", "voltage": 220, "load": 2000},
            {"name": "Cocina", "type": "kitchen", "voltage": 220, "load": 3500},
            {"name": "Aire acondicionado", "type": "hvac", "voltage": 220, "load": 2500}
        ],
        "calculations": {
            "dpms": {"diversityFactor": 0.8, "simultaneityFactor": 0.75},
            "thermal": {"ambientTemp": 30, "installationMethod": "conduit"},
            "voltageDropLimit": 3.0
        }
    }',
    true
),
(
    'Edificio Comercial',
    'Plantilla para edificios comerciales con sistemas trifásicos y cargas especiales',
    'commercial', 
    '{
        "circuits": [
            {"name": "Iluminación oficinas", "type": "lighting", "voltage": 380, "phases": 3, "load": 5000},
            {"name": "Tomacorrientes generales", "type": "outlets", "voltage": 220, "load": 8000},
            {"name": "Sistemas informáticos", "type": "it", "voltage": 220, "load": 4000},
            {"name": "Ascensores", "type": "elevator", "voltage": 380, "phases": 3, "load": 15000},
            {"name": "HVAC", "type": "hvac", "voltage": 380, "phases": 3, "load": 25000}
        ],
        "calculations": {
            "dpms": {"diversityFactor": 0.7, "simultaneityFactor": 0.65},
            "thermal": {"ambientTemp": 25, "installationMethod": "cable_tray"},
            "voltageDropLimit": 2.5
        }
    }',
    true
),
(
    'Instalación Industrial',
    'Plantilla para instalaciones industriales con motores y cargas de alta potencia',
    'industrial',
    '{
        "circuits": [
            {"name": "Iluminación nave", "type": "lighting", "voltage": 380, "phases": 3, "load": 8000},
            {"name": "Motores principales", "type": "motors", "voltage": 380, "phases": 3, "load": 75000},
            {"name": "Sistemas auxiliares", "type": "auxiliary", "voltage": 220, "load": 12000},
            {"name": "Soldadura", "type": "welding", "voltage": 380, "phases": 3, "load": 30000},
            {"name": "Compresores", "type": "compressors", "voltage": 380, "phases": 3, "load": 45000}
        ],
        "calculations": {
            "dpms": {"diversityFactor": 0.6, "simultaneityFactor": 0.55},
            "thermal": {"ambientTemp": 35, "installationMethod": "underground"},
            "voltageDropLimit": 2.0,
            "shortCircuit": {"systemType": "TN-S", "faultLevel": "high"}
        }
    }',
    true
);

-- Sample activity types for reference
-- These will be inserted automatically when projects are created/modified
-- Just keeping this as documentation of activity types:
--
-- ACTIVITY TYPES:
-- - 'project_created'
-- - 'project_updated' 
-- - 'calculation_added'
-- - 'calculation_updated'
-- - 'calculation_deleted'
-- - 'project_status_changed'
-- - 'project_exported'
-- - 'project_imported'