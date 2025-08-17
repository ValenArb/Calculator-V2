import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// Get dashboard statistics for a user
router.get('/dashboard', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Get comprehensive stats in parallel
    const [
      totalProjects,
      projectsByStatus,
      projectsByType,
      recentActivity,
      monthlyStats
    ] = await Promise.all([
      // Total projects count
      query(`
        SELECT COUNT(*) as total FROM projects WHERE owner_id = ?
      `, [userId]),
      
      // Projects by status
      query(`
        SELECT 
          status,
          COUNT(*) as count
        FROM projects 
        WHERE owner_id = ? 
        GROUP BY status
        ORDER BY count DESC
      `, [userId]),
      
      // Projects by type
      query(`
        SELECT 
          project_type,
          COUNT(*) as count
        FROM projects 
        WHERE owner_id = ? 
        GROUP BY project_type
        ORDER BY count DESC
      `, [userId]),
      
      // Recent activity (last 30 days)
      query(`
        SELECT 
          COUNT(*) as activity_count,
          COUNT(DISTINCT project_id) as active_projects
        FROM project_activities pa
        JOIN projects p ON pa.project_id = p.id
        WHERE p.owner_id = ? 
        AND pa.created_at >= datetime('now', '-30 days')
      `, [userId]),
      
      // Monthly project creation stats (last 6 months)
      query(`
        SELECT 
          strftime('%Y-%m-01', created_at) as month,
          COUNT(*) as projects_created
        FROM projects 
        WHERE owner_id = ? 
        AND created_at >= datetime('now', '-6 months')
        GROUP BY strftime('%Y-%m-01', created_at)
        ORDER BY month ASC
      `, [userId])
    ]);

    // Calculate additional metrics
    const statusStats = projectsByStatus.rows.reduce((acc, row) => {
      acc[row.status] = parseInt(row.count);
      return acc;
    }, {});

    const typeStats = projectsByType.rows.reduce((acc, row) => {
      acc[row.project_type] = parseInt(row.count);
      return acc;
    }, {});

    const total = parseInt(totalProjects.rows[0].total);
    const activeProjects = statusStats.active || 0;
    const completedProjects = statusStats.completed || 0;
    const draftProjects = statusStats.draft || 0;

    const stats = {
      overview: {
        totalProjects: total,
        activeProjects,
        completedProjects,
        draftProjects,
        completionRate: total > 0 ? Math.round((completedProjects / total) * 100) : 0
      },
      byStatus: statusStats,
      byType: typeStats,
      activity: {
        last30Days: parseInt(recentActivity.rows[0].activity_count),
        activeProjectsLast30Days: parseInt(recentActivity.rows[0].active_projects)
      },
      monthlyTrend: monthlyStats.rows.map(row => ({
        month: row.month,
        projectsCreated: parseInt(row.projects_created)
      }))
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Get system-wide statistics (for admin purposes)
router.get('/system', async (req, res) => {
  try {
    const [
      totalUsers,
      totalProjects,
      totalTemplates,
      dbSize
    ] = await Promise.all([
      query(`SELECT COUNT(DISTINCT owner_id) as total FROM projects`),
      query(`SELECT COUNT(*) as total FROM projects`),
      query(`SELECT COUNT(*) as total FROM project_templates WHERE is_system_template = true`),
query(`SELECT '0 MB' as size`)
    ]);

    res.json({
      users: parseInt(totalUsers.rows[0].total),
      projects: parseInt(totalProjects.rows[0].total),
      systemTemplates: parseInt(totalTemplates.rows[0].total),
      databaseSize: dbSize.rows[0].size
    });
  } catch (error) {
    console.error('Error fetching system stats:', error);
    res.status(500).json({ error: 'Failed to fetch system statistics' });
  }
});

// Get recent projects for dashboard
router.get('/recent-projects', async (req, res) => {
  try {
    const { userId, limit = 5 } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const result = await query(`
      SELECT 
        id,
        name,
        project_type,
        status,
        updated_at,
        calculation_count
      FROM projects 
      WHERE owner_id = ? 
      ORDER BY updated_at DESC 
      LIMIT ?
    `, [userId, parseInt(limit)]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching recent projects:', error);
    res.status(500).json({ error: 'Failed to fetch recent projects' });
  }
});

export default router;