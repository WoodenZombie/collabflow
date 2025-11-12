/**
 * UserAvatar - Displays a user avatar as a circle with initial
 * 
 * Props:
 * - initial: string (single letter or two letters for user initial)
 * - name: string (user name for accessibility)
 */
import styles from './userAvatar.module.css';
function UserAvatar({ initial, name }) {
    
  
    // Get first letter(s) of name if initial not provided
    const displayInitial = initial || (name ? name.charAt(0).toUpperCase() : '?');
  
    return (
      <div
        className={styles.avatarStyle}
        title={name || 'User'}
        aria-label={name ? `User ${name}` : 'User avatar'}
      >
        {displayInitial}
      </div>
    );
  }
  
  export default UserAvatar;