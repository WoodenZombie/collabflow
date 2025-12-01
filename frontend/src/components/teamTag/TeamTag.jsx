/**
 * TeamTag - Displays a team name as a tag/chip
 * 
 * Props:
 * - name: string (team name)
 */
import styles from './teamTag.module.css'
function TeamTag({ name }) {
  
    return (
      <span className={styles.tagStyle}>
        {name}
      </span>
    );
  }
  
  export default TeamTag;