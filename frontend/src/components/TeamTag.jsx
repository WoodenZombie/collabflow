/**
 * TeamTag - Displays a team name as a tag/chip
 * 
 * Props:
 * - name: string (team name)
 */

function TeamTag({ name }) {
    const tagStyle = {
      display: 'inline-block',
      padding: '4px 12px',
      fontSize: '14px',
      color: '#666666',
      backgroundColor: 'transparent',
      borderRadius: '4px'
    };
  
    return (
      <span style={tagStyle}>
        {name}
      </span>
    );
  }
  
  export default TeamTag;