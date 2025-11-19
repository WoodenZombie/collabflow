import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import TasksPage from "./pages/TasksPage";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/tasks/:projectId" element={<TasksPage />} />
    </Routes>
  );
}

export default App;
