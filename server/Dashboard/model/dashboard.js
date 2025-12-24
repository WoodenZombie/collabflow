// server/Dashboard/model/dashboard.js

const db = require('../../db/db');

class DashboardModel {
  async getProjectsSummaryForUser(userId, filters = {}) {
    try {
      const { tags = [], status = null, search = null } = filters;

      // 1. Fetch user projects + total task count
      let query = db('projects as p')
        .select(
          'p.id as project_id',
          'p.name as project_title',
          'p.description as project_description',
          'p.status as project_status',
          db.raw('COUNT(t.id) as task_count')
        )
        .leftJoin('tasks as t', 'p.id', 't.project_id')
        .innerJoin('team_memberships as tm', 'p.team_id', 'tm.team_id')
        .where('tm.user_id', userId);

      if (tags.length > 0) {
        query = query
          .join('project_tags as pt', 'p.id', 'pt.project_id')
          .join('tags as tag', 'pt.tag_id', 'tag.id')
          .whereIn('tag.name', tags);
      }
      if (status) query = query.where('p.status', status);
      if (search) query = query.where('p.name', 'like', `%${search}%`);

      query = query.groupBy('p.id').orderBy('p.created_at', 'desc');
      const projects = await query;

      const projectIds = projects.map(p => p.project_id);

      // 2. Task statistics
      let taskStats = [];
      if (projectIds.length > 0) {
        taskStats = await db('tasks as t')
          .leftJoin('statuses as s', 't.status_id', 's.id')
          .select(
            't.project_id',
            db.raw('SUM(CASE WHEN s.name IN ("waiting", "pending") THEN 1 ELSE 0 END) as waiting'),
            db.raw('SUM(CASE WHEN s.name = "inprogress" THEN 1 ELSE 0 END) as in_progress'),
            db.raw('SUM(CASE WHEN s.name IN ("done", "completed") THEN 1 ELSE 0 END) as done')
          )
          .whereIn('t.project_id', projectIds)
          .groupBy('t.project_id');
      }

    
      const statsMap = taskStats.reduce((acc, row) => {
        acc[row.project_id] = {
          waiting: Number(row.waiting) || 0,
          inProgress: Number(row.in_progress) || 0,
          done: Number(row.done) || 0
        };
        return acc;
      }, {});

    
      const result = projects.map(p => ({
        id: p.project_id,
        title: p.project_title,
        description: p.project_description || null,
        status: p.project_status || 'active',
        totalTasks: Number(p.task_count) || 0,
        taskSummary: statsMap[p.project_id] || { waiting: 0, inProgress: 0, done: 0 }
      }));

      return {
        dashboardTitle: "My projects",
        projects: result
      };

    } catch (error) {
      console.error("Dashboard error:", error);
      throw error;
    }
  }
}

module.exports = new DashboardModel();