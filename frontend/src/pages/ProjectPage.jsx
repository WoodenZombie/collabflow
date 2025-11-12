import { useState } from 'react';
import ProjectCard from '../components/projectCard/ProjectCard';
import FilterTabs from '../components/filterTabs/FilterTabs';
import ProjectHeader from '../components/ProjectHeader/ProjectHeader';
import ProgressBar from '../components/progressBar/ProgressBar';
import DeleteProjectForm from '../components/forms/DeleteProjectForm';
import CreateProjectForm from '../components/createProject/CreateProject';
import EditProjectForm from '../components/forms/EditProjectForm';
import { fakeProjectsExtended } from '../../data/fakeProjects';
import styles from './projectPage.module.css'
/**
 * ProjectPage - Main page for displaying projects grouped by status
 * Handles status cycling: Pending → In Progress → Completed → Pending
 */
function ProjectPage() {
  const [projects, setProjects] = useState(fakeProjectsExtended);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);

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
   * Handle opening edit modal
   */
  const handleOpenEditModal = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setProjectToEdit(project);
      setIsEditModalOpen(true);
    }
  };

  /**
   * Handle closing edit modal
   */
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setProjectToEdit(null);
  };

  /**
   * Handle project update
   */
  const handleUpdateProject = (updatedProject) => {
    setProjects(prevProjects => 
      prevProjects.map(project => 
        project.id === updatedProject.id
          ? updatedProject
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

  // Check if there is at least one completed project
  const hasCompleted = projects.some(p => p.status === 'completed');

  // Page container style
  const pageContainerStyle = {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    paddingBottom: hasCompleted ? '90px' : '20px' // Extra space for delete button when visible
  };

  return (
    <>
      <div style={pageContainerStyle}>
        <ProjectHeader onCreateProject={handleOpenCreateModal} />
        
        <FilterTabs />

        <main>
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
                  onEdit={() => handleOpenEditModal(project.id)}
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
                  onEdit={() => handleOpenEditModal(project.id)}
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
                  onEdit={() => handleOpenEditModal(project.id)}
                />
              ))}
            </section>
          )}
        </main>
      </div>

      {/* Delete Button - Fixed at bottom, only visible if there is at least one completed project */}
      {hasCompleted && (
        <button
          className={styles.deleteButtonStyle}
          onClick={handleOpenDeleteModal}
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

      {/* Edit Project Modal */}
      {isEditModalOpen && projectToEdit && (
        <EditProjectForm
          project={projectToEdit}
          onClose={handleCloseEditModal}
          onUpdate={handleUpdateProject}
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