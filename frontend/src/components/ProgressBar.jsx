/**
 * ProgressBar - Displays progress count header for each status category
 * 
 * Props:
 * - count: number (count of projects in this category)
 * - label: string (category name: "In Progress", "Pending", "Completed")
 * - color: string (color theme: "purple", "yellow", "green")
 */
function ProgressBar({ count, label, color }) {
    // Color mapping
    const colorMap = {
      'purple': '#9370DB',
      'yellow': '#FFA500',
      'orange': '#FFA500',
      'green': '#32CD32'
    };
  
    const barStyle = {
      backgroundColor: colorMap[color] || '#9370DB',
      borderRadius: '8px',
      padding: '12px 16px',
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      color: '#FFFFFF',
      fontWeight: 'bold'
    };
  
    const countCircleStyle = {
      backgroundColor: '#FFFFFF',
      color: colorMap[color] || '#9370DB',
      borderRadius: '50%',
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: '16px'
    };
  
    return (
      <div style={barStyle}>
        <span style={{ fontSize: '16px' }}>{label}</span>
        <div style={countCircleStyle}>
          {count}
        </div>
      </div>
    );
  }
  
  export default ProgressBar;