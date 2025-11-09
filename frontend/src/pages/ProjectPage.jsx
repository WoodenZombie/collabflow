import { useState } from 'react';
import ProjectCard from '../components/ProjectCard';
import FilterTabs from '../components/FilterTabs';
import ProjectHeader from '../components/ProjectHeader';
import ProgressBar from '../components/ProgressBar';
import DeleteProjectForm from '../components/DeleteProjectForm';
import CreateProjectForm from '../components/CreateProjectForm';
import { fakeProjectsExtended } from '../../data/fakeProjects';

/**
 * ProjectPage - Main page for displaying projects grouped by status
 * Handles status cycling: Pending → In Progress → Completed → Pending
 */
function ProjectPage() {
  const [projects, setProjects] = useState(fakeProjectsExtended);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
   * Handle opening delete modal
   */
  const handleOpenDeleteModal = () => {
    // Find the first completed project to show in modal
    const firstCompletedProject = projects.find(p => p.status === 'completed');
    if (firstCompletedProject) {
      setSelectedProject(firstCompletedProject);
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
    // Modal will close automatically via onClose callback
  };

  /**
   * Handle opening create modal
   */
  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  /**
   * Handle closing create modal
   */
  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  /**
   * Handle project creation
   */
  const handleCreateProject = (newProject) => {
    setProjects(prevProjects => [...prevProjects, newProject]);
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

  // Check if there is at least one completed project
  const hasCompleted = projects.some(p => p.status === 'completed');

  // Page container style
  const pageContainerStyle = {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    paddingBottom: hasCompleted ? '90px' : '20px' // Extra space for delete button when visible
  };

  // Delete button style - fixed at bottom, full-width, no container background
  const deleteButtonStyle = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    padding: '14px 20px',
    backgroundColor: '#FF4D4D',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '0',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    zIndex: 100
  };

  return (
    <>
      <div style={pageContainerStyle}>
        <ProjectHeader onCreateProject={handleOpenCreateModal} />
        
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

      {/* Delete Button - Fixed at bottom, only visible if there is at least one completed project */}
      {hasCompleted && (
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
      )}

      {/* Create Project Modal */}
      {isCreateModalOpen && (
        <CreateProjectForm
          onClose={handleCloseCreateModal}
          onCreate={handleCreateProject}
        />
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