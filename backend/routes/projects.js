import express from 'express';
import { query, transaction } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get all projects for a user
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const result = await query(`
      SELECT 
        id,
        name,
        description,
        project_type,
        status,
        client_name,
        client_email,
        location,
        created_at,
        updated_at,
        CASE 
          WHEN calculation_data IS NOT NULL THEN jsonb_array_length(
            COALESCE(calculation_data->'dpms', '[]'::jsonb) + 
            COALESCE(calculation_data->'thermal', '[]'::jsonb) + 
            COALESCE(calculation_data->'voltageDrops', '[]'::jsonb)
          )
          ELSE 0 
        END as calculation_count
      FROM projects 
      WHERE owner_id = $1 
      ORDER BY updated_at DESC
    `, [userId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get a single project by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    const result = await query(`
      SELECT * FROM projects 
      WHERE id = $1 AND owner_id = $2
    `, [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Create a new project
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      userId,
      projectType = 'residential',
      clientName,
      clientEmail,
      clientPhone,
      location,
      calculationData = {},
      metadata = {}
    } = req.body;

    if (!name || !userId) {
      return res.status(400).json({ error: 'Name and userId are required' });
    }

    const result = await transaction(async (client) => {
      // Insert project
      const projectResult = await client.query(`
        INSERT INTO projects (
          id, name, description, owner_id, project_type, 
          client_name, client_email, client_phone, location,
          calculation_data, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `, [
        uuidv4(), name, description, userId, projectType,
        clientName, clientEmail, clientPhone, location,
        JSON.stringify(calculationData), JSON.stringify(metadata)
      ]);

      // Log activity
      await client.query(`
        INSERT INTO project_activities (
          project_id, user_id, activity_type, description
        ) VALUES ($1, $2, $3, $4)
      `, [
        projectResult.rows[0].id,
        userId,
        'project_created',
        `Project "${name}" was created`
      ]);

      return projectResult.rows[0];
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update a project
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      userId,
      projectType,
      status,
      clientName,
      clientEmail,
      clientPhone,
      location,
      calculationData,
      metadata
    } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const result = await transaction(async (client) => {
      // Check if project exists and user owns it
      const existingProject = await client.query(`
        SELECT * FROM projects WHERE id = $1 AND owner_id = $2
      `, [id, userId]);

      if (existingProject.rows.length === 0) {
        throw new Error('Project not found or access denied');
      }

      // Update project
      const updateFields = [];
      const values = [];
      let paramCount = 0;

      if (name !== undefined) {
        updateFields.push(`name = $${++paramCount}`);
        values.push(name);
      }
      if (description !== undefined) {
        updateFields.push(`description = $${++paramCount}`);
        values.push(description);
      }
      if (projectType !== undefined) {
        updateFields.push(`project_type = $${++paramCount}`);
        values.push(projectType);
      }
      if (status !== undefined) {
        updateFields.push(`status = $${++paramCount}`);
        values.push(status);
      }
      if (clientName !== undefined) {
        updateFields.push(`client_name = $${++paramCount}`);
        values.push(clientName);
      }
      if (clientEmail !== undefined) {
        updateFields.push(`client_email = $${++paramCount}`);
        values.push(clientEmail);
      }
      if (clientPhone !== undefined) {
        updateFields.push(`client_phone = $${++paramCount}`);
        values.push(clientPhone);
      }
      if (location !== undefined) {
        updateFields.push(`location = $${++paramCount}`);
        values.push(location);
      }
      if (calculationData !== undefined) {
        updateFields.push(`calculation_data = $${++paramCount}`);
        values.push(JSON.stringify(calculationData));
      }
      if (metadata !== undefined) {
        updateFields.push(`metadata = $${++paramCount}`);
        values.push(JSON.stringify(metadata));
      }

      if (updateFields.length === 0) {
        return existingProject.rows[0];
      }

      values.push(id, userId);
      const projectResult = await client.query(`
        UPDATE projects SET ${updateFields.join(', ')}
        WHERE id = $${paramCount + 1} AND owner_id = $${paramCount + 2}
        RETURNING *
      `, values);

      // Log activity
      await client.query(`
        INSERT INTO project_activities (
          project_id, user_id, activity_type, description
        ) VALUES ($1, $2, $3, $4)
      `, [
        id,
        userId,
        'project_updated',
        `Project "${name || existingProject.rows[0].name}" was updated`
      ]);

      return projectResult.rows[0];
    });

    res.json(result);
  } catch (error) {
    console.error('Error updating project:', error);
    if (error.message === 'Project not found or access denied') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to update project' });
    }
  }
});

// Delete a project
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const result = await query(`
      DELETE FROM projects 
      WHERE id = $1 AND owner_id = $2
      RETURNING name
    `, [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found or access denied' });
    }

    res.json({ 
      message: `Project "${result.rows[0].name}" deleted successfully`,
      id 
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Get recent activity for a project
router.get('/:id/activity', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;
    const limit = parseInt(req.query.limit) || 10;

    // Verify user owns the project
    const projectCheck = await query(`
      SELECT id FROM projects WHERE id = $1 AND owner_id = $2
    `, [id, userId]);

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found or access denied' });
    }

    const result = await query(`
      SELECT * FROM project_activities 
      WHERE project_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `, [id, limit]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching project activity:', error);
    res.status(500).json({ error: 'Failed to fetch project activity' });
  }
});

export default router;