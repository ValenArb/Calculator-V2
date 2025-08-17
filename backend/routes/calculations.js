import express from 'express';
import { query, execute } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get calculation data for a project
router.get('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    let result = await query(`
      SELECT calculation_data, calculation_count, updated_at
      FROM projects 
      WHERE id = ? AND owner_id = ?
    `, [projectId, userId]);

    // If project doesn't exist in SQLite3, create a stub entry
    if (result.rows.length === 0) {
      console.log(`Creating project stub in SQLite3 for project: ${projectId}`);
      
      try {
        await execute(`
          INSERT INTO projects (
            id, name, owner_id, calculation_data, calculation_count
          ) VALUES (?, ?, ?, ?, ?)
        `, [
          projectId,
          'Project (from Firestore)', // Placeholder name
          userId,
          JSON.stringify({}),
          0
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
          'project_stub_created',
          'Project stub created in SQLite3 for calculation data'
        ]);

        // Query again to get the created project
        result = await query(`
          SELECT calculation_data, calculation_count, updated_at
          FROM projects 
          WHERE id = ? AND owner_id = ?
        `, [projectId, userId]);

      } catch (insertError) {
        console.error('Error creating project stub:', insertError);
        return res.status(500).json({ error: 'Failed to initialize project for calculations' });
      }
    }

    // Parse JSON calculation data
    const project = result.rows[0];
    let calculationData = {};
    
    if (project.calculation_data) {
      try {
        calculationData = JSON.parse(project.calculation_data);
      } catch (e) {
        calculationData = {};
      }
    }

    // Return only FAT protocols
    res.json({
      protocolosPorTablero: calculationData.protocolosPorTablero || {},
      calculation_count: project.calculation_count || 0,
      updated_at: project.updated_at
    });
  } catch (error) {
    console.error('Error fetching calculations:', error);
    res.status(500).json({ error: 'Failed to fetch calculations' });
  }
});

// Save calculation data for a project (FAT protocols only)
router.put('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId, calculationData } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Check if project exists and user owns it
    let existingProject = await query(`
      SELECT calculation_data FROM projects WHERE id = ? AND owner_id = ?
    `, [projectId, userId]);

    // If project doesn't exist in SQLite3, create a stub entry
    if (existingProject.rows.length === 0) {
      console.log(`Creating project stub in SQLite3 for saving calculations: ${projectId}`);
      
      try {
        await execute(`
          INSERT INTO projects (
            id, name, owner_id, calculation_data, calculation_count
          ) VALUES (?, ?, ?, ?, ?)
        `, [
          projectId,
          'Project (from Firestore)', // Placeholder name
          userId,
          JSON.stringify({}),
          0
        ]);

        // Query again to get the created project
        existingProject = await query(`
          SELECT calculation_data FROM projects WHERE id = ? AND owner_id = ?
        `, [projectId, userId]);

      } catch (insertError) {
        console.error('Error creating project stub for save:', insertError);
        return res.status(500).json({ error: 'Failed to initialize project for calculations' });
      }
    }

    // Get existing calculation data
    let currentCalculationData = {};
    if (existingProject.rows[0].calculation_data) {
      try {
        currentCalculationData = JSON.parse(existingProject.rows[0].calculation_data);
      } catch (e) {
        currentCalculationData = {};
      }
    }

    // Update only the FAT protocols, keep any other data (but we've removed it from the count)
    const updatedCalculationData = {
      ...currentCalculationData,
      protocolosPorTablero: calculationData.protocolosPorTablero || {}
    };

    // Calculate count based on FAT protocols only
    const count = Object.keys(calculationData.protocolosPorTablero || {}).length;

    // Update the project
    await execute(`
      UPDATE projects 
      SET calculation_data = ?, calculation_count = ?, updated_at = datetime('now')
      WHERE id = ? AND owner_id = ?
    `, [
      JSON.stringify(updatedCalculationData),
      count,
      projectId,
      userId
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
      'calculations_updated',
      'Calculation data (FAT protocols) updated'
    ]);

    res.json({
      message: 'Calculations updated successfully',
      calculation_count: count
    });
  } catch (error) {
    console.error('Error saving calculations:', error);
    res.status(500).json({ error: 'Failed to save calculations' });
  }
});

// Delete calculation data for a project
router.delete('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Check if project exists and user owns it
    const existingProject = await query(`
      SELECT id FROM projects WHERE id = ? AND owner_id = ?
    `, [projectId, userId]);

    if (existingProject.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found or access denied' });
    }

    // Clear calculation data
    await execute(`
      UPDATE projects 
      SET calculation_data = '{}', calculation_count = 0, updated_at = datetime('now')
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
      'calculations_deleted',
      'All calculation data deleted'
    ]);

    res.json({ message: 'Calculations deleted successfully' });
  } catch (error) {
    console.error('Error deleting calculations:', error);
    res.status(500).json({ error: 'Failed to delete calculations' });
  }
});

// Get calculation statistics for a user
router.get('/stats', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const result = await query(`
      SELECT 
        COUNT(*) as total_projects,
        SUM(calculation_count) as total_calculations,
        AVG(calculation_count) as avg_calculations_per_project
      FROM projects 
      WHERE owner_id = ? AND calculation_count > 0
    `, [userId]);

    const stats = result.rows[0];
    
    res.json({
      total_projects: parseInt(stats.total_projects) || 0,
      total_calculations: parseInt(stats.total_calculations) || 0,
      avg_calculations_per_project: parseFloat(stats.avg_calculations_per_project) || 0
    });
  } catch (error) {
    console.error('Error fetching calculation stats:', error);
    res.status(500).json({ error: 'Failed to fetch calculation statistics' });
  }
});

export default router;