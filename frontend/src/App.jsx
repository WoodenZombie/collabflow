import { Routes, Route } from "react-router-dom";
import TasksPage from "./pages/TasksPage";
import Dashboard from "./pages/Dashboard";
import "./App.css";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tasks/:projectId" element={<TasksPage />} />
      </Routes>
    </div>
  );
}

export default App;
