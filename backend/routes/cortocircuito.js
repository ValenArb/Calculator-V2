import express from 'express';
import { query, execute } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get cortocircuito calculations for a project
router.get('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Get project with cortocircuito data
    let result = await query(`
      SELECT calculos_cortocircuito, updated_at, owner_id
      FROM projects 
      WHERE id = ?
    `, [projectId]);

    // If project doesn't exist, return empty calculations
    if (result.rows.length === 0) {
      return res.json({
        calculosData: {},
        updated_at: null
      });
    }

    // Check if project belongs to user or is adoptable
    const project = result.rows[0];
    if (project.owner_id !== userId && project.owner_id !== 'unknown') {
      return res.status(403).json({ error: 'Access denied to this project' });
    }

    // If project is adoptable (owner_id = 'unknown'), adopt it
    if (project.owner_id === 'unknown') {
      console.log(`🏠 Adopting orphan project ${projectId} for user ${userId}`);
      await execute(`UPDATE projects SET owner_id = ? WHERE id = ?`, [userId, projectId]);
    }

    // Parse cortocircuito data
    let calculosData = {};
    if (project.calculos_cortocircuito) {
      try {
        calculosData = JSON.parse(project.calculos_cortocircuito);
      } catch (e) {
        console.error('Error parsing calculos_cortocircuito:', e);
        calculosData = {};
      }
    }

    res.json({
      calculosData: calculosData,
      updated_at: project.updated_at
    });

  } catch (error) {
    console.error('Error fetching cortocircuito:', error);
    res.status(500).json({ error: 'Failed to fetch cortocircuito calculations' });
  }
});

// Save cortocircuito calculations for a project
router.put('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId, calculosData } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    if (!calculosData) {
      return res.status(400).json({ error: 'calculosData is required' });
    }

    // Check if project exists
    let existingProject = await query(`
      SELECT id, owner_id FROM projects WHERE id = ?
    `, [projectId]);

    // If project doesn't exist, create it
    if (existingProject.rows.length === 0) {
      console.log(`Creating new project ${projectId} for cortocircuito`);
      
      await execute(`
        INSERT INTO projects (
          id, name, owner_id, calculos_cortocircuito
        ) VALUES (?, ?, ?, ?)
      `, [
        projectId,
        'New Project',
        userId,
        JSON.stringify(calculosData)
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
        'Project created with cortocircuito calculations'
      ]);

    } else {
      // Check access or adopt orphan project
      const project = existingProject.rows[0];
      if (project.owner_id !== userId && project.owner_id !== 'unknown') {
        return res.status(403).json({ error: 'Access denied to this project' });
      }

      // If adoptable, adopt it
      if (project.owner_id === 'unknown') {
        console.log(`🏠 Adopting orphan project ${projectId} for user ${userId}`);
      }

      // Update project with cortocircuito data
      await execute(`
        UPDATE projects 
        SET 
          calculos_cortocircuito = ?,
          owner_id = ?,
          updated_at = datetime('now')
        WHERE id = ?
      `, [
        JSON.stringify(calculosData),
        userId, // Always set to current user (adopts if orphan)
        projectId
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
        'cortocircuito_updated',
        'Cortocircuito calculations updated'
      ]);
    }

    res.json({
      message: 'Cortocircuito calculations updated successfully'
    });

  } catch (error) {
    console.error('Error saving cortocircuito:', error);
    res.status(500).json({ error: 'Failed to save cortocircuito calculations' });
  }
});

// Delete cortocircuito calculations for a project
router.delete('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Check project access
    const existingProject = await query(`
      SELECT id, owner_id FROM projects WHERE id = ? AND owner_id = ?
    `, [projectId, userId]);

    if (existingProject.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found or access denied' });
    }

    // Clear cortocircuito data
    await execute(`
      UPDATE projects 
      SET 
        calculos_cortocircuito = '{}',
        updated_at = datetime('now')
      WHERE id = ? AND owner_id = ?
    `, [projectId, userId]);

    // Log activity
    await execute(`
      INSERT INTO project_activities (
        id, project_id, user_id, activity_type, description
      ) VALUES (?, ?, ?, ?, ?)
    `, [
      uuidv4(),
      projectId,
      userId,
      'cortocircuito_deleted',
      'Cortocircuito calculations deleted'
    ]);

    res.json({ message: 'Cortocircuito calculations deleted successfully' });

  } catch (error) {
    console.error('Error deleting cortocircuito:', error);
    res.status(500).json({ error: 'Failed to delete cortocircuito calculations' });
  }
});

export default router;