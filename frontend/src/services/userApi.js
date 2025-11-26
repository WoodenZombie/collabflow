const MOCK_USERS = [
  { 
    id: "1", 
    name: "Jakub Novák", 
    email: "jakub.novak@example.cz" 
  },
  { 
    id: "2", 
    name: "Jan Dvořák", 
    email: "jan.dvorak@example.cz" 
  },
  { 
    id: "3", 
    name: "Petr Svoboda", 
    email: "petr.svoboda@example.cz" 
  },
];

export const getAllUsers = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...MOCK_USERS]);
    }, 300);
  });
};
