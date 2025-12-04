import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import TasksPage from "./pages/TasksPage";
import TeamDetailsPage from "./pages/TeamDetailsPage";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/tasks/:projectId" element={<TasksPage />} />
      <Route path="/projects/:projectId/teams/:teamId" element={<TeamDetailsPage />} />
    </Routes>
  );
}

export default App;
