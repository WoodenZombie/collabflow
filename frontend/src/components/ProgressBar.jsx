/**
 * ProgressBar - Displays progress count for each category
 * Clickable button that cycles project status: Pending → In-Process → Complete → Pending
 * 
 * Props:
 * - count: number (count of tasks in this category)
 * - label: string (category name: "In Progress", "Pending", "Completed")
 * - color: string (color theme: "purple", "orange", "green")
 * - onClick: function (callback when ProgressBar is clicked)
 * 
 * Data binding: Project.Progress (bar component showing states)
 */
function ProgressBar({ count, label, color, onClick }) {
    return (
      <div onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
        <div>
          <span>{count}</span>
        </div>
        <span>{label}</span>
      </div>
    );
  }
  
  export default ProgressBar;