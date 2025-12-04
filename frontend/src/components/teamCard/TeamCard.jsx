import styles from '../taskCard/taskCard.module.css';
import UserAvatar from '../userAvatar/UserAvatar';

function TeamCard({ team, allUsers, onEdit, onDelete, onOpenDetails }) {
  const members = team.members
    .map(id => allUsers.find(u => u.id === id))
    .filter(Boolean);

  const handleOpenDetails = () => {
    if (onOpenDetails) onOpenDetails(team);
  };

  return (
    <div className={styles.cardStyle} style={{borderRadius: '10px'}} onClick={handleOpenDetails}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
        <h3 className={styles.title}>{team.name}</h3>
      </div>
      
      <p className={styles.description}>{team.description}</p>
      
      <div style={{ marginTop: '15px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
        {members.map(user => (
          <UserAvatar key={user.id} initial={user.initial} name={user.name} />
        ))}
      </div>
    </div>
  );
}

export default TeamCard;