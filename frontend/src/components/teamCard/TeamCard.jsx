import styles from '../taskCard/taskCard.module.css';
import UserAvatar from '../userAvatar/UserAvatar';

function TeamCard({ team, allUsers, onEdit, onDelete, onOpenDetails, isProjectManager = false, onAddUsers }) {
  // Handle team members - can be array of IDs or objects with id/name/email
  const members = (team.members || []).map(member => {
    if (typeof member === 'object' && member.id) {
      // Already an object with user info
      return member;
    }
    // It's an ID, find user from allUsers
    const user = allUsers.find(u => String(u.id) === String(member));
    return user || { id: member, name: String(member), email: '' };
  }).filter(Boolean);

  const handleOpenDetails = () => {
    if (onOpenDetails) onOpenDetails(team);
  };

  const handleAddUsersClick = (e) => {
    e.stopPropagation(); // Prevent opening team details
    if (onAddUsers && isProjectManager) {
      onAddUsers(team.id);
    }
  };

  return (
    <div className={styles.cardStyle} style={{borderRadius: '10px'}} onClick={handleOpenDetails}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px', alignItems: 'center' }}>
        <h3 className={styles.title}>{team.name}</h3>
        {isProjectManager && onAddUsers && (
          <button
            onClick={handleAddUsersClick}
            style={{
              padding: '6px 12px',
              backgroundColor: '#4F46E5',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#4338CA'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#4F46E5'}
            title="Add users to team"
          >
            + Add Users
          </button>
        )}
      </div>
      
      <p className={styles.description}>{team.description}</p>
      
      <div style={{ marginTop: '15px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
        {members.map(user => (
          <UserAvatar 
            key={user.id || user} 
            initial={user.name ? user.name.charAt(0).toUpperCase() : '?'} 
            name={user.name || String(user)} 
          />
        ))}
      </div>
    </div>
  );
}

export default TeamCard;