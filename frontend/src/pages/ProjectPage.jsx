import { useState } from 'react';
import ProjectCard from '../components/projects/ProjectCard';
import FilterTabs from '../components/projects/FilterTabs';
import ProjectHeader from '../components/projects/ProjectHeader';


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
