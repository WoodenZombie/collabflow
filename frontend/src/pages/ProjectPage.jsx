import { useState } from 'react';
import ProjectCard from '../components/ProjectCard';
import FilterTabs from '../components/FilterTabs';
import ProjectHeader from '../components/ProjectHeader';
import ProgressBar from '../components/ProgressBar';

/**
 * ProjectsPage - Main page for displaying projects
 * Displays all projects grouped by status (In Progress, Pending, Completed)
 * 
 * Data structure expected:
 * {
 *   projects: [
 *     {
 *       id: string,
 *       name: string,
 *       description: string,
 *       priority: string,
 *       participants: Array,
 *       pending: number,
 *       inProgress: number,
 *       done: number,
 *       currentStatus: 'pending' | 'inProgress' | 'completed'
 *     }
 *   ]
 * }
 */
function ProjectsPage() {
  const [activeFilter, setActiveFilter] = useState('byTotalTasks');

  // Mock data or fake data - will be replaced with backend data
  // This structure matches Project.Name, Project.Pending, Project.Done, Project.Progress
  const [projects, setProjects] = useState([
    {
      id: '1',
      name: 'Landing page for Azunyan senpai',
      description: 'Lorem ipsum dolor sit amet, libre unst consectetur adispicing elit.',
      priority: 'Not that important',
      participants: [],
      pending: 5,
      inProgress: 25,
      done: 10,
      currentStatus: 'inProgress' // 'pending' | 'inProgress' | 'completed'
    },
    {
      id: '2',
      name: 'User flow confirmation for finance app',
      description: 'Lorem ipsum dolor sit amet, libre unst consectetur adispicing elit.',
      priority: 'Important',
      participants: [],
      pending: 8,
      inProgress: 12,
      done: 5,
      currentStatus: 'pending'
    },
    {
      id: '3',
      name: 'UI/UX Design in the age of AI',
      description: 'Lorem ipsum dolor sit amet, libre unst consectetur adispicing elit.',
      priority: 'High Priority',
      participants: [],
      pending: 2,
      inProgress: 8,
      done: 2,
      currentStatus: 'completed'
    }
  ]);

  /**
   * Cycle through status: Pending → In-Process → Complete → Pending
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
   * Handle status change when clicking on ProgressBar
   */
  const handleStatusChange = (projectId) => {
    setProjects(prevProjects => 
      prevProjects.map(project => 
        project.id === projectId
          ? { ...project, currentStatus: cycleStatus(project.currentStatus) }
          : project
      )
    );
  };

  // Group projects by current status
  const getProjectsByStatus = () => {
    const inProgressProjects = projects.filter(p => p.currentStatus === 'inProgress');
    const pendingProjects = projects.filter(p => p.currentStatus === 'pending');
    const completedProjects = projects.filter(p => p.currentStatus === 'completed');
    
    return {
      inProgress: inProgressProjects,
      pending: pendingProjects,
      completed: completedProjects
    };
  };

  const projectsByStatus = getProjectsByStatus();

  // Calculate total counts for progress bars
  const totalPending = projects.filter(p => p.currentStatus === 'pending').length;
  const totalInProgress = projects.filter(p => p.currentStatus === 'inProgress').length;
  const totalDone = projects.filter(p => p.currentStatus === 'completed').length;

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    // Filter logic will be implemented based on selected filter
  };

  return (
    <div>
      <ProjectHeader 
        onCreateTask={() => {}}
        onCreateAppointment={() => {}}
        onCreateTeam={() => {}}
      />
      
      <FilterTabs 
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
      />

      {/* In Progress Section */}
      {projectsByStatus.inProgress.length > 0 && (
        <section>
          <ProgressBar 
            count={totalInProgress}
            label="In Progress"
            color="purple"
            onClick={() => {
              // Change status of all projects in this section
              projectsByStatus.inProgress.forEach(project => {
                handleStatusChange(project.id);
              });
            }}
          />
          {projectsByStatus.inProgress.map(project => (
            <ProjectCard 
              key={project.id}
              project={project}
              onStatusChange={() => handleStatusChange(project.id)}
            />
          ))}
        </section>
      )}

      {/* Pending Section */}
      {projectsByStatus.pending.length > 0 && (
        <section>
          <ProgressBar 
            count={totalPending}
            label="Pending"
            color="orange"
            onClick={() => {
              // Change status of all projects in this section
              projectsByStatus.pending.forEach(project => {
                handleStatusChange(project.id);
              });
            }}
          />
          {projectsByStatus.pending.map(project => (
            <ProjectCard 
              key={project.id}
              project={project}
              onStatusChange={() => handleStatusChange(project.id)}
            />
          ))}
        </section>
      )}

      {/* Completed Section */}
      {projectsByStatus.completed.length > 0 && (
        <section>
          <ProgressBar 
            count={totalDone}
            label="Completed"
            color="green"
            onClick={() => {
              // Change status of all projects in this section
              projectsByStatus.completed.forEach(project => {
                handleStatusChange(project.id);
              });
            }}
          />
          {projectsByStatus.completed.map(project => (
            <ProjectCard 
              key={project.id}
              project={project}
              onStatusChange={() => handleStatusChange(project.id)}
            />
          ))}
        </section>
      )}
    </div>
  );
}

export default ProjectsPage;