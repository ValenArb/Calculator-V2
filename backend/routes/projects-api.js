import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, execute } from '../config/database.js';

const router = express.Router();

// Middleware para logging
const logRequest = (req, res, next) => {
  console.log(`📋 ${req.method} ${req.path} - User: ${req.headers['x-user-id'] || 'unknown'}`);
  next();
};

router.use(logRequest);

// GET /api/projects - Obtener todos los proyectos del usuario
router.get('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID required in headers' });
    }

    const result = await query(
      'SELECT * FROM projects WHERE owner_id = ? ORDER BY updated_at DESC',
      [userId]
    );

    // Parse JSON fields
    const projects = result.rows.map(project => ({
      ...project,
      calculation_data: project.calculation_data ? JSON.parse(project.calculation_data) : {},
      metadata: project.metadata ? JSON.parse(project.metadata) : {}
    }));

    res.json({
      success: true,
      projects,
      count: projects.length
    });
  } catch (error) {
    console.error('❌ Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// GET /api/projects/:id - Obtener un proyecto específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({ error: 'User ID required in headers' });
    }

    const result = await query(
      'SELECT * FROM projects WHERE id = ? AND owner_id = ?',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = result.rows[0];
    
    // Parse JSON fields
    project.calculation_data = project.calculation_data ? JSON.parse(project.calculation_data) : {};
    project.metadata = project.metadata ? JSON.parse(project.metadata) : {};

    res.json({
      success: true,
      project
    });
  } catch (error) {
    console.error('❌ Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// POST /api/projects - Crear nuevo proyecto
router.post('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID required in headers' });
    }

    const {
      name,
      description,
      project_type = 'residential',
      status = 'draft',
      client_name,
      client_email,
      client_phone,
      location,
      calculation_data = {},
      metadata = {}
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    const projectId = uuidv4();

    await execute(
      `INSERT INTO projects (
        id, name, description, owner_id, project_type, status,
        client_name, client_email, client_phone, location,
        calculation_data, metadata, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        projectId, name, description, userId, project_type, status,
        client_name, client_email, client_phone, location,
        JSON.stringify(calculation_data), JSON.stringify(metadata)
      ]
    );

    // Crear actividad de creación
    await execute(
      `INSERT INTO project_activities (
        id, project_id, user_id, activity_type, description, created_at
      ) VALUES (?, ?, ?, ?, ?, datetime('now'))`,
      [uuidv4(), projectId, userId, 'created', `Proyecto "${name}" creado`]
    );

    res.status(201).json({
      success: true,
      project: {
        id: projectId,
        name,
        description,
        owner_id: userId,
        project_type,
        status,
        client_name,
        client_email,
        client_phone,
        location,
        calculation_data,
        metadata
      }
    });
  } catch (error) {
    console.error('❌ Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// PUT /api/projects/:id - Actualizar proyecto
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({ error: 'User ID required in headers' });
    }

    // Verificar que el proyecto existe y pertenece al usuario
    const existingResult = await query(
      'SELECT * FROM projects WHERE id = ? AND owner_id = ?',
      [id, userId]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const {
      name,
      description,
      project_type,
      status,
      client_name,
      client_email,
      client_phone,
      location,
      calculation_data,
      metadata,
      tableros
    } = req.body;

    // Construir query dinámicamente
    const updateFields = [];
    const values = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      values.push(name);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      values.push(description);
    }
    if (project_type !== undefined) {
      updateFields.push('project_type = ?');
      values.push(project_type);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      values.push(status);
    }
    if (client_name !== undefined) {
      updateFields.push('client_name = ?');
      values.push(client_name);
    }
    if (client_email !== undefined) {
      updateFields.push('client_email = ?');
      values.push(client_email);
    }
    if (client_phone !== undefined) {
      updateFields.push('client_phone = ?');
      values.push(client_phone);
    }
    if (location !== undefined) {
      updateFields.push('location = ?');
      values.push(location);
    }
    if (calculation_data !== undefined) {
      updateFields.push('calculation_data = ?');
      values.push(JSON.stringify(calculation_data));
    }
    if (metadata !== undefined) {
      updateFields.push('metadata = ?');
      values.push(JSON.stringify(metadata));
    }
    if (tableros !== undefined) {
      // Los tableros se almacenan en metadata
      const currentMetadata = existingResult.rows[0].metadata ? JSON.parse(existingResult.rows[0].metadata) : {};
      const newMetadata = { ...currentMetadata, tableros };
      updateFields.push('metadata = ?');
      values.push(JSON.stringify(newMetadata));
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Agregar updated_at
    updateFields.push('updated_at = datetime(\'now\')');
    values.push(id, userId);

    const updateQuery = `
      UPDATE projects 
      SET ${updateFields.join(', ')} 
      WHERE id = ? AND owner_id = ?
    `;

    await execute(updateQuery, values);

    // Crear actividad de actualización
    await execute(
      `INSERT INTO project_activities (
        id, project_id, user_id, activity_type, description, created_at
      ) VALUES (?, ?, ?, ?, ?, datetime('now'))`,
      [uuidv4(), id, userId, 'updated', 'Proyecto actualizado']
    );

    // Obtener proyecto actualizado
    const updatedResult = await query(
      'SELECT * FROM projects WHERE id = ? AND owner_id = ?',
      [id, userId]
    );

    const project = updatedResult.rows[0];
    project.calculation_data = project.calculation_data ? JSON.parse(project.calculation_data) : {};
    project.metadata = project.metadata ? JSON.parse(project.metadata) : {};

    res.json({
      success: true,
      project
    });
  } catch (error) {
    console.error('❌ Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// DELETE /api/projects/:id - Eliminar proyecto
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({ error: 'User ID required in headers' });
    }

    // Verificar que el proyecto existe y pertenece al usuario
    const existingResult = await query(
      'SELECT name FROM projects WHERE id = ? AND owner_id = ?',
      [id, userId]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const projectName = existingResult.rows[0].name;

    // Eliminar proyecto (las actividades se eliminan por CASCADE)
    await execute(
      'DELETE FROM projects WHERE id = ? AND owner_id = ?',
      [id, userId]
    );

    res.json({
      success: true,
      message: `Project "${projectName}" deleted successfully`
    });
  } catch (error) {
    console.error('❌ Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// GET /api/projects/:id/activities - Obtener actividades del proyecto
router.get('/:id/activities', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({ error: 'User ID required in headers' });
    }

    // Verificar acceso al proyecto
    const projectResult = await query(
      'SELECT id FROM projects WHERE id = ? AND owner_id = ?',
      [id, userId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const activitiesResult = await query(
      'SELECT * FROM project_activities WHERE project_id = ? ORDER BY created_at DESC',
      [id]
    );

    const activities = activitiesResult.rows.map(activity => ({
      ...activity,
      metadata: activity.metadata ? JSON.parse(activity.metadata) : {}
    }));

    res.json({
      success: true,
      activities,
      count: activities.length
    });
  } catch (error) {
    console.error('❌ Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

export default router;