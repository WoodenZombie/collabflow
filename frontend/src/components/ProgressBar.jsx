/**
 * ProgressBar - Displays progress count for each category
 * 
 * Props:
 * - count: number (count of tasks in this category)
 * - label: string (category name: "In Progress", "Pending", "Completed")
 * - color: string (color theme: "purple", "orange", "green")
 * 
 * Data binding: Project.Progress (bar component showing states)
 */

function ProgressBar({ count, label, color }) {
  return (
    <div>
      <div>
        <span>{count}</span>
      </div>
      <span>{label}</span>
    </div>
  );
}

export default ProgressBar;