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
 *       done: number
 *     }
 *   ]
 * }
 */
function ProjectsPage() {
  const [activeFilter, setActiveFilter] = useState('byTotalTasks');

  // Mock data or fake data - will be replaced with backend data
  // This structure matches Project.Name, Project.Pending, Project.Done, Project.Progress
  const [projects] = useState([
    {
      id: '1',
      name: 'Landing page for Azunyan senpai',
      description: 'Lorem ipsum dolor sit amet, libre unst consectetur adispicing elit.',
      priority: 'Not that important',
      participants: [],
      pending: 5,
      inProgress: 25,
      done: 10
    },
    {
      id: '2',
      name: 'User flow confirmation for finance app',
      description: 'Lorem ipsum dolor sit amet, libre unst consectetur adispicing elit.',
      priority: 'Important',
      participants: [],
      pending: 8,
      inProgress: 12,
      done: 5
    },
    {
      id: '3',
      name: 'UI/UX Design in the age of AI',
      description: 'Lorem ipsum dolor sit amet, libre unst consectetur adispicing elit.',
      priority: 'High Priority',
      participants: [],
      pending: 2,
      inProgress: 8,
      done: 2
    }
  ]);

  // Group projects by status based on task counts
  const getProjectsByStatus = () => {
    const inProgressProjects = projects.filter(p => p.inProgress > 0);
    const pendingProjects = projects.filter(p => p.pending > 0 && p.inProgress === 0);
    const completedProjects = projects.filter(p => p.done > 0 && p.inProgress === 0 && p.pending === 0);
    
    return {
      inProgress: inProgressProjects,
      pending: pendingProjects,
      completed: completedProjects
    };
  };

  const projectsByStatus = getProjectsByStatus();

  // Calculate total counts for progress bars
  const totalPending = projects.reduce((sum, p) => sum + p.pending, 0);
  const totalInProgress = projects.reduce((sum, p) => sum + p.inProgress, 0);
  const totalDone = projects.reduce((sum, p) => sum + p.done, 0);

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
          />
          {projectsByStatus.inProgress.map(project => (
            <ProjectCard 
              key={project.id}
              project={project}
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
          />
          {projectsByStatus.pending.map(project => (
            <ProjectCard 
              key={project.id}
              project={project}
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
          />
          {projectsByStatus.completed.map(project => (
            <ProjectCard 
              key={project.id}
              project={project}
            />
          ))}
        </section>
      )}
    </div>
  );
}

export default ProjectsPage;