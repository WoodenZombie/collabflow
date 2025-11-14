import React, { useState, useEffect } from "react";

const mockProjects = [
  {
    id: 1,
    title: "Projekt A",
    description: "Popis projektu A",
    participants: ["Alice", "Bob"],
    progress: { waiting: 2, inProgress: 3, done: 5 },
  },
  {
    id: 2,
    title: "Projekt B",
    description: "Popis projektu B",
    participants: ["Charlie"],
    progress: { waiting: 1, inProgress: 0, done: 4 },
  },
];

function Dashboard() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    setProjects(mockProjects);
  }, []);

  return (
    <div>
      <h1>Projectsą</h1>
      <div>
        {projects.map((project) => {
          <div key={project.id}>
            <h2>{project.title}</h2>
            <p>{project.description}</p>
          </div>;
        })}
      </div>
    </div>
  );
}

export default Dashboard;
