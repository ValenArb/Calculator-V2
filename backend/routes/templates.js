import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// Get all project templates
router.get('/', async (req, res) => {
  try {
    const { projectType } = req.query;
    
    let queryText = `
      SELECT 
        id,
        name,
        description,
        project_type,
        template_data,
        is_system_template,
        created_at
      FROM project_templates 
    `;
    
    let params = [];
    
    if (projectType) {
      queryText += ' WHERE project_type = $1';
      params.push(projectType);
    }
    
    queryText += ' ORDER BY is_system_template DESC, name ASC';
    
    const result = await query(queryText, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// Get a single template by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(`
      SELECT * FROM project_templates WHERE id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

// Get templates grouped by type for dashboard
router.get('/dashboard/grouped', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        project_type,
        COUNT(*) as template_count,
        json_agg(
          json_build_object(
            'id', id,
            'name', name,
            'description', description,
            'is_system_template', is_system_template
          ) ORDER BY is_system_template DESC, name ASC
        ) as templates
      FROM project_templates 
      GROUP BY project_type
      ORDER BY 
        CASE project_type 
          WHEN 'residential' THEN 1 
          WHEN 'commercial' THEN 2 
          WHEN 'industrial' THEN 3 
          ELSE 4 
        END
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching grouped templates:', error);
    res.status(500).json({ error: 'Failed to fetch grouped templates' });
  }
});

export default router;