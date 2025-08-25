import express from 'express';
import { query, execute } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get protocolos de ensayos for a project
router.get('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Get project with protocol data
    let result = await query(`
      SELECT protocolos_ensayos, protocolo_count, updated_at, owner_id
      FROM projects 
      WHERE id = ?
    `, [projectId]);

    // If project doesn't exist, return empty protocols
    if (result.rows.length === 0) {
      return res.json({
        protocolosPorTablero: {},
        protocolo_count: 0,
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

    // Parse protocol data
    let protocolData = {};
    if (project.protocolos_ensayos) {
      try {
        protocolData = JSON.parse(project.protocolos_ensayos);
      } catch (e) {
        console.error('Error parsing protocolos_ensayos:', e);
        protocolData = {};
      }
    }

    res.json({
      protocolosPorTablero: protocolData,
      protocolo_count: project.protocolo_count || 0,
      updated_at: project.updated_at
    });

  } catch (error) {
    console.error('Error fetching protocols:', error);
    res.status(500).json({ error: 'Failed to fetch protocols' });
  }
});

// Save protocolos de ensayos for a project
router.put('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId, protocolosPorTablero } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    if (!protocolosPorTablero) {
      return res.status(400).json({ error: 'protocolosPorTablero is required' });
    }

    // Check if project exists
    let existingProject = await query(`
      SELECT id, owner_id FROM projects WHERE id = ?
    `, [projectId]);

    // If project doesn't exist, create it
    if (existingProject.rows.length === 0) {
      console.log(`Creating new project ${projectId} for protocols`);
      
      await execute(`
        INSERT INTO projects (
          id, name, owner_id, protocolos_ensayos, protocolo_count
        ) VALUES (?, ?, ?, ?, ?)
      `, [
        projectId,
        'New Project',
        userId,
        JSON.stringify(protocolosPorTablero),
        Object.keys(protocolosPorTablero).length
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
        'Project created with protocols'
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

      // Calculate protocol count
      const protocolCount = Object.keys(protocolosPorTablero).length;

      // Update project with protocol data
      await execute(`
        UPDATE projects 
        SET 
          protocolos_ensayos = ?,
          protocolo_count = ?,
          owner_id = ?,
          updated_at = datetime('now')
        WHERE id = ?
      `, [
        JSON.stringify(protocolosPorTablero),
        protocolCount,
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
        'protocols_updated',
        `Protocols updated: ${protocolCount} protocols`
      ]);
    }

    res.json({
      message: 'Protocols updated successfully',
      protocolo_count: Object.keys(protocolosPorTablero).length
    });

  } catch (error) {
    console.error('Error saving protocols:', error);
    res.status(500).json({ error: 'Failed to save protocols' });
  }
});

// Delete all protocols for a project
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

    // Clear protocol data
    await execute(`
      UPDATE projects 
      SET 
        protocolos_ensayos = '{}',
        protocolo_count = 0,
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
      'protocols_deleted',
      'All protocols deleted'
    ]);

    res.json({ message: 'Protocols deleted successfully' });

  } catch (error) {
    console.error('Error deleting protocols:', error);
    res.status(500).json({ error: 'Failed to delete protocols' });
  }
});

export default router;