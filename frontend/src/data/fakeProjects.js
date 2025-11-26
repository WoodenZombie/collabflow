/**
 * Extended fake projects data with all fields needed for DeleteProjectForm
 * Includes: id, name/title, startingDate, endingDate, description, teams, users
 */

export const fakeProjectsExtended = [
    {
      id: '1',
      name: 'Project1',
      title: 'Landing page for Azunyan senpai',
      description: 'Lorem ipsum',
      startingDate: '12/12/24',
      endingDate: '12/02/25',
      status: 'inProgress',
      priority: 'Not that important',
      taskCount: 25,
      teams: ['Frontend', 'Backend', 'QA'],
      users: [
        { id: '1', name: 'Alice', initial: 'A' },
        { id: '2', name: 'Charlie', initial: 'C' }
      ]
    },
    {
      id: '2',
      name: 'Project2',
      title: 'User flow confirmation for finance app',
      description: 'Lorem ipsum dolor sit amet, libre unst consectetur adispicing elit.',
      startingDate: '01/15/25',
      endingDate: '03/30/25',
      status: 'pending',
      priority: 'Important',
      taskCount: 8,
      teams: ['Frontend', 'Design'],
      users: [
        { id: '3', name: 'Bob', initial: 'B' },
        { id: '4', name: 'David', initial: 'D' }
      ]
    },
    {
      id: '3',
      name: 'Project3',
      title: 'UI/UX Design in the age of AI',
      description: 'Lorem ipsum dolor sit amet, libre unst consectetur adispicing elit.',
      startingDate: '11/01/24',
      endingDate: '01/15/25',
      status: 'completed',
      priority: 'High Priority',
      taskCount: 2,
      teams: ['Design', 'QA'],
      users: [
        { id: '5', name: 'Eve', initial: 'E' }
      ]
    },
    {
      id: '4',
      name: 'Project4',
      title: 'Mobile app redesign',
      description: 'Complete redesign of the mobile application interface.',
      startingDate: '02/01/25',
      endingDate: '04/30/25',
      status: 'pending',
      priority: 'Important',
      taskCount: 12,
      teams: ['Frontend', 'Backend', 'Mobile'],
      users: [
        { id: '6', name: 'Frank', initial: 'F' },
        { id: '7', name: 'Grace', initial: 'G' }
      ]
    },
    {
      id: '5',
      name: 'Project5',
      title: 'API integration for payment system',
      description: 'Integrate third-party payment API into the application.',
      startingDate: '01/10/25',
      endingDate: '02/28/25',
      status: 'inProgress',
      priority: 'High Priority',
      taskCount: 18,
      teams: ['Backend', 'QA'],
      users: [
        { id: '8', name: 'Henry', initial: 'H' }
      ]
    },
    {
      id: '6',
      name: 'Project6',
      title: 'Database optimization',
      description: 'Optimize database queries and improve performance.',
      startingDate: '12/01/24',
      endingDate: '12/31/24',
      status: 'completed',
      priority: 'Not that important',
      taskCount: 5,
      teams: ['Backend'],
      users: [
        { id: '9', name: 'Ivy', initial: 'I' },
        { id: '10', name: 'Jack', initial: 'J' }
      ]
    }
  ];