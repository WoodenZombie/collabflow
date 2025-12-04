import { useState, useEffect } from 'react';
import UserAvatar from '../userAvatar/UserAvatar';
import styles from '../createProject/createProjectModal.module.css'; 

function TeamForm({ teamToEdit, allUsers, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    members: []
  });

  useEffect(() => {
    if (teamToEdit) {
      setFormData({
        name: teamToEdit.name || '',
        description: teamToEdit.description || '',
        members: teamToEdit.members || []
      });
    }
  }, [teamToEdit]);

  const toggleUser = (userId) => {
    const idNum = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    setFormData(prev => {
      const isSelected = prev.members.includes(idNum);
      return {
        ...prev,
        members: isSelected 
          ? prev.members.filter(id => id !== idNum)
          : [...prev.members, idNum]
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{teamToEdit ? 'Edit Team' : 'Form a Team'}</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className={styles.fieldContainer}>
            <label className={styles.label}>Team Name</label>
            <input 
              className={styles.input} 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="Enter team name"
              required
            />
          </div>

          {/* Description */}
          <div className={styles.fieldContainer}>
            <label className={styles.label}>Description</label>
            <textarea 
              className={styles.textarea}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Description"
            />
          </div>

          {/* Users Selection */}
          <div className={styles.fieldContainer}>
            <label className={styles.label}>Participants</label>
            <div className={styles.tagsContainer}>
              {formData.members.map(id => {
                const user = allUsers.find(u => u.id === id);
                return user ? (
                  <div key={id} className={styles.tag}>
                    <span>{user.name.charAt(0).toUpperCase()}</span>
                    <button type="button" className={styles.removeTagButton} onClick={() => toggleUser(id)}>×</button>
                  </div>
                ) : null;
              })}
              
              <div style={{position: 'relative', display: 'inline-block'}}>
                 <button type="button" className={styles.addUserButton} style={{color: '#8b8b8bff'}}>+</button>
                 <select 
                    style={{position: 'absolute', left:0, top:0, width:'100%', height:'100%', opacity:0, cursor:'pointer'}}
                    onChange={(e) => { toggleUser(e.target.value); e.target.value = ""; }}
                    value=""
                 >
                    <option value="" disabled>Add user</option>
                    {allUsers.filter(u => !formData.members.includes(u.id)).map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                 </select>
              </div>
            </div>
          </div>

          <div className={styles.buttonsRow}>
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={!formData.name.trim()}
            >
              {teamToEdit ? 'Edit Team' : 'Form a Team'}
            </button>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TeamForm;