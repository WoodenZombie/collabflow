import React, { useState, useEffect } from "react";
import ProjectCard from "../components/projectCard/ProjectCard";

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
      <h1>Projects</h1>
      <div>
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
