import { useState } from 'react';
import ProjectCard from '../components/ProjectCard';
import FilterTabs from '../components/FilterTabs';
import ProjectHeader from '../components/ProjectHeader';
import ProgressBar from '../components/ProgressBar';
import DeleteProjectForm from '../components/DeleteProjectForm';
import { fakeProjectsExtended } from '../../data/fakeProjects';

/**
 * ProjectPage - Main page for displaying projects grouped by status
 * Handles status cycling: Pending → In Progress → Completed → Pending
 */
function ProjectPage() {
  const [projects, setProjects] = useState(fakeProjectsExtended);
  const [selectedProject, setSelectedProject] = useState(null);
  const [viewedProject, setViewedProject] = useState(null); // Track which project is currently viewed
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
    
    // Update viewedProject status if it's the same project
    if (viewedProject && viewedProject.id === projectId) {
      const updatedProject = projects.find(p => p.id === projectId);
      if (updatedProject) {
        setViewedProject({ ...updatedProject, status: cycleStatus(updatedProject.status) });
      }
    }
  };

  /**
   * Handle project selection/viewing
   */
  const handleProjectSelect = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setViewedProject(project);
    }
  };

  /**
   * Handle opening delete modal
   */
  const handleOpenDeleteModal = () => {
    if (viewedProject) {
      setSelectedProject(viewedProject);
      setIsDeleteModalOpen(true);
    }
  };

  /**
   * Handle closing delete modal
   */
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedProject(null);
  };

  /**
   * Handle project deletion
   */
  const handleDeleteProject = (projectId) => {
    setProjects(prevProjects => 
      prevProjects.filter(project => project.id !== projectId)
    );
    // Clear viewed project if it was deleted
    if (viewedProject && viewedProject.id === projectId) {
      setViewedProject(null);
    }
    // Modal will close automatically via onClose callback
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

  // Check if viewed project is completed
  const isViewedProjectCompleted = viewedProject?.status === 'completed';

  // Page container style
  const pageContainerStyle = {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    paddingBottom: isViewedProjectCompleted ? '100px' : '20px' // Extra space for delete button
  };

  // Delete button container style (fixed at bottom)
  const deleteButtonContainerStyle = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '20px',
    backgroundColor: '#FFFFFF',
    borderTop: '1px solid #e0e0e0',
    boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
    zIndex: 100
  };

  // Delete button style
  const deleteButtonStyle = {
    width: '100%',
    maxWidth: '500px',
    margin: '0 auto',
    padding: '14px',
    backgroundColor: '#FF4D4D',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    display: 'block'
  };

  return (
    <>
      <div style={pageContainerStyle}>
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
                onSelect={() => handleProjectSelect(project.id)}
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
                onSelect={() => handleProjectSelect(project.id)}
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
                onSelect={() => handleProjectSelect(project.id)}
              />
            ))}
          </section>
        )}
      </div>

      {/* Delete Button - Fixed at bottom, only visible when viewed project is completed */}
      {isViewedProjectCompleted && (
        <div style={deleteButtonContainerStyle}>
          <button
            style={deleteButtonStyle}
            onClick={handleOpenDeleteModal}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#E63946';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FF4D4D';
            }}
          >
            Delete
          </button>
        </div>
      )}

      {/* Delete Project Modal */}
      {isDeleteModalOpen && selectedProject && (
        <DeleteProjectForm
          project={selectedProject}
          onClose={handleCloseDeleteModal}
          onDelete={handleDeleteProject}
        />
      )}
    </>
  );
}

export default ProjectPage;