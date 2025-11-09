import { useState } from 'react';
import ProjectCard from '../components/ProjectCard';
import FilterTabs from '../components/FilterTabs';
import ProjectHeader from '../components/ProjectHeader';
import ProgressBar from '../components/ProgressBar';
import { fakeProjects } from '../data/fakeProjects';

/**
 * ProjectPage - Main page for displaying projects grouped by status
 * Handles status cycling: Pending → In Progress → Completed → Pending
 */
function ProjectPage() {
  const [projects, setProjects] = useState(fakeProjects);

  /**
   * Cycle through status: Pending → In-Progress → Complete → Pending
   */
  const cycleStatus = (currentStatus) => {
    const statusCycle = {
      'pending': 'inProgress',
      'inProgress': 'completed',
      'completed': 'pending'
    };
    return statusCycle[currentStatus] || 'pending';
  };

  /**
   * Handle status change when clicking on ProjectCard
   */
  const handleStatusChange = (projectId) => {
    setProjects(prevProjects => 
      prevProjects.map(project => 
        project.id === projectId
          ? { ...project, status: cycleStatus(project.status) }
          : project
      )
    );
  };

  /**
   * Group projects by status
   */
  const getProjectsByStatus = () => {
    const inProgressProjects = projects.filter(p => p.status === 'inProgress');
    const pendingProjects = projects.filter(p => p.status === 'pending');
    const completedProjects = projects.filter(p => p.status === 'completed');
    
    return {
      inProgress: inProgressProjects,
      pending: pendingProjects,
      completed: completedProjects
    };
  };

  const projectsByStatus = getProjectsByStatus();

  // Calculate total counts for progress bars
  const totalPending = projectsByStatus.pending.length;
  const totalInProgress = projectsByStatus.inProgress.length;
  const totalDone = projectsByStatus.completed.length;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <ProjectHeader />
      
      <FilterTabs />

      {/* In Progress Section */}
      {projectsByStatus.inProgress.length > 0 && (
        <section style={{ marginBottom: '30px' }}>
          <ProgressBar 
            count={totalInProgress}
            label="In Progress"
            color="purple"
          />
          {projectsByStatus.inProgress.map(project => (
            <ProjectCard 
              key={project.id}
              title={project.title}
              description={project.description}
              priorityLabel={project.priority}
              status={project.status}
              taskCount={project.taskCount}
              onStatusChange={() => handleStatusChange(project.id)}
            />
          ))}
        </section>
      )}

      {/* Pending Section */}
      {projectsByStatus.pending.length > 0 && (
        <section style={{ marginBottom: '30px' }}>
          <ProgressBar 
            count={totalPending}
            label="Pending"
            color="yellow"
          />
          {projectsByStatus.pending.map(project => (
            <ProjectCard 
              key={project.id}
              title={project.title}
              description={project.description}
              priorityLabel={project.priority}
              status={project.status}
              taskCount={project.taskCount}
              onStatusChange={() => handleStatusChange(project.id)}
            />
          ))}
        </section>
      )}

      {/* Completed Section */}
      {projectsByStatus.completed.length > 0 && (
        <section style={{ marginBottom: '30px' }}>
          <ProgressBar 
            count={totalDone}
            label="Completed"
            color="green"
          />
          {projectsByStatus.completed.map(project => (
            <ProjectCard 
              key={project.id}
              title={project.title}
              description={project.description}
              priorityLabel={project.priority}
              status={project.status}
              taskCount={project.taskCount}
              onStatusChange={() => handleStatusChange(project.id)}
            />
          ))}
        </section>
      )}
    </div>
  );
}

export default ProjectPage;