import express from 'express';
import { query, execute, transaction } from '../config/database.js';
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
        client_phone,
        location,
        calculation_count,
        created_at,
        updated_at
      FROM projects 
      WHERE owner_id = ? 
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
      WHERE id = ? AND owner_id = ?
    `, [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Parse JSON fields
    const project = result.rows[0];
    if (project.calculation_data) {
      try {
        project.calculation_data = JSON.parse(project.calculation_data);
      } catch (e) {
        project.calculation_data = {};
      }
    }
    if (project.metadata) {
      try {
        project.metadata = JSON.parse(project.metadata);
      } catch (e) {
        project.metadata = {};
      }
    }

    res.json(project);
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

    const projectId = uuidv4();
      
    // Insert project
    await execute(`
      INSERT INTO projects (
        id, name, description, owner_id, project_type, 
        client_name, client_email, client_phone, location,
        calculation_data, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      projectId, name, description, userId, projectType,
      clientName, clientEmail, clientPhone, location,
      JSON.stringify(calculationData), JSON.stringify(metadata)
    ]);

    // Log activity
    await execute(`
      INSERT INTO project_activities (
        id, project_id, user_id, activity_type, description
      ) VALUES (?, ?, ?, ?, ?)
    `, [
      uuidv4(),
      projectId,
      userId,
      'project_created',
      `Project "${name}" was created`
    ]);

    // Get the created project
    const result = await query('SELECT * FROM projects WHERE id = ?', [projectId]);
    const createdProject = result.rows[0];
    res.status(201).json(createdProject);
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

    // Check if project exists and user owns it
    const existingProject = await query(`
      SELECT * FROM projects WHERE id = ? AND owner_id = ?
    `, [id, userId]);

    if (existingProject.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found or access denied' });
    }

      // Build dynamic update query
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
      if (projectType !== undefined) {
        updateFields.push('project_type = ?');
        values.push(projectType);
      }
      if (status !== undefined) {
        updateFields.push('status = ?');
        values.push(status);
      }
      if (clientName !== undefined) {
        updateFields.push('client_name = ?');
        values.push(clientName);
      }
      if (clientEmail !== undefined) {
        updateFields.push('client_email = ?');
        values.push(clientEmail);
      }
      if (clientPhone !== undefined) {
        updateFields.push('client_phone = ?');
        values.push(clientPhone);
      }
      if (location !== undefined) {
        updateFields.push('location = ?');
        values.push(location);
      }
      if (calculationData !== undefined) {
        updateFields.push('calculation_data = ?');
        values.push(JSON.stringify(calculationData));
        
        // Update calculation count based on data
        let count = 0;
        if (calculationData.dpms) count += calculationData.dpms.length;
        if (calculationData.thermal) count += calculationData.thermal.length;
        if (calculationData.voltageDrops) count += calculationData.voltageDrops.length;
        if (calculationData.shortCircuit) count += calculationData.shortCircuit.length;
        if (calculationData.loadsByPanel) count += calculationData.loadsByPanel.length;
        
        updateFields.push('calculation_count = ?');
        values.push(count);
      }
      if (metadata !== undefined) {
        updateFields.push('metadata = ?');
        values.push(JSON.stringify(metadata));
      }

      if (updateFields.length === 0) {
        return existingProject.rows[0];
      }

    // Add WHERE clause parameters
    values.push(id, userId);
    
    await execute(`
      UPDATE projects SET ${updateFields.join(', ')}
      WHERE id = ? AND owner_id = ?
    `, values);

    // Log activity
    await execute(`
      INSERT INTO project_activities (
        id, project_id, user_id, activity_type, description
      ) VALUES (?, ?, ?, ?, ?)
    `, [
      uuidv4(),
      id,
      userId,
      'project_updated',
      `Project "${name || existingProject.rows[0].name}" was updated`
    ]);

    // Get updated project
    const updatedProject = await query('SELECT * FROM projects WHERE id = ?', [id]);
    const result = updatedProject.rows[0];
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

    // First get the project name
    const projectResult = await query(`
      SELECT name FROM projects 
      WHERE id = ? AND owner_id = ?
    `, [id, userId]);

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found or access denied' });
    }

    const projectName = projectResult.rows[0].name;

    // Delete the project (activities will be deleted by cascade)
    const deleteResult = await execute(`
      DELETE FROM projects 
      WHERE id = ? AND owner_id = ?
    `, [id, userId]);

    if (deleteResult.changes === 0) {
      return res.status(404).json({ error: 'Project not found or access denied' });
    }

    res.json({ 
      message: `Project "${projectName}" deleted successfully`,
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
      SELECT id FROM projects WHERE id = ? AND owner_id = ?
    `, [id, userId]);

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found or access denied' });
    }

    const result = await query(`
      SELECT * FROM project_activities 
      WHERE project_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `, [id, limit]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching project activity:', error);
    res.status(500).json({ error: 'Failed to fetch project activity' });
  }
});

export default router;