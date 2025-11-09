/**
 * FilterTabs - Filter buttons for switching views
 * 
 * Props:
 * - activeFilter: string (current active filter)
 * - onFilterChange: function (callback when filter changes)
 * 
 * Filters:
 * - "teams" - Teams button (displays teams in current project)
 * - "byTotalTasks" - By Total Tasks button (displays all tasks in current project)
 * - "appointments" - Appointments button (displays appointments in current project)
 */

function FilterTabs({ activeFilter, onFilterChange }) {
    return (
      <div>
        <button 
          onClick={() => onFilterChange('teams')}
          aria-pressed={activeFilter === 'teams'}
        >
          Teams
        </button>
        
        <button 
          onClick={() => onFilterChange('byTotalTasks')}
          aria-pressed={activeFilter === 'byTotalTasks'}
        >
          By Total Tasks
        </button>
        
        <button 
          onClick={() => onFilterChange('appointments')}
          aria-pressed={activeFilter === 'appointments'}
        >
          Appointments
        </button>
      </div>
    );
  }
  
  export default FilterTabs;