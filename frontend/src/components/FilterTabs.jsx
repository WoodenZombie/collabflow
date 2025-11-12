import { useState } from 'react';

/**
 * FilterTabs - Filter buttons for switching views
 * Uses internal state to manage active tab
 * 
 * Tabs:
 * - "teams" - Teams button
 * - "byTotalTasks" - By Total Tasks button (default)
 * - "appointments" - Appointments button
 */
function FilterTabs() {
  const [activeFilter, setActiveFilter] = useState('byTotalTasks');

  const tabsContainerStyle = {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
    borderBottom: '2px solid #e0e0e0',
    paddingBottom: '8px'
  };

  const tabButtonStyle = (isActive) => ({
    padding: '8px 16px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: isActive ? 'bold' : 'normal',
    color: isActive ? '#9370DB' : '#666',
    borderBottom: isActive ? '2px solid #9370DB' : '2px solid transparent',
    marginBottom: '-2px',
    transition: 'color 0.2s, border-color 0.2s'
  });

  return (
    <div style={tabsContainerStyle}>
      <button 
        onClick={() => setActiveFilter('teams')}
        style={tabButtonStyle(activeFilter === 'teams')}
      >
        Teams
      </button>
      
      <button 
        onClick={() => setActiveFilter('byTotalTasks')}
        style={tabButtonStyle(activeFilter === 'byTotalTasks')}
      >
        By Total Tasks
      </button>
      
      <button 
        onClick={() => setActiveFilter('appointments')}
        style={tabButtonStyle(activeFilter === 'appointments')}
      >
        Appointments
      </button>
    </div>
  );
}

export default FilterTabs;