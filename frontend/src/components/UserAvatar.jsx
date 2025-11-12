/**
 * UserAvatar - Displays a user avatar as a circle with initial
 * 
 * Props:
 * - initial: string (single letter or two letters for user initial)
 * - name: string (user name for accessibility)
 */
function UserAvatar({ initial, name }) {
    const avatarStyle = {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: '#E3F2FD',
      border: '1px solid #BBDEFB',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#1976D2',
      flexShrink: 0
    };
  
    // Get first letter(s) of name if initial not provided
    const displayInitial = initial || (name ? name.charAt(0).toUpperCase() : '?');
  
    return (
      <div
        style={avatarStyle}
        title={name || 'User'}
        aria-label={name ? `User ${name}` : 'User avatar'}
      >
        {displayInitial}
      </div>
    );
  }
  
  export default UserAvatar;