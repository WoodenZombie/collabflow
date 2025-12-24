/**
 * DeleteAppointmentModal - Modal form for deleting an appointment
 * Displays appointment data in read-only mode before deletion
 *
 * Props:
 * - appointment: object (appointment to delete)
 * - onClose: function (callback to close modal)
 * - onDelete: function (callback when delete button is clicked, receives appointmentId)
 */
import styles from "../deleteProject/deleteProjectModal.module.css";

function DeleteAppointmentModal({ appointment, onClose, onDelete, onEdit }) {
  if (!appointment) {
    return null;
  }

  const handleDelete = () => {
    // Call onDelete callback with appointment id
    if (onDelete && appointment.id) {
      onDelete(appointment.id);
    }
  };

  // Format date as DD/MM/YY
  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    
    try {
      // Parse date string (could be YYYY-MM-DD or full datetime)
      let date;
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // YYYY-MM-DD format
        const [year, month, day] = dateString.split('-');
        date = new Date(year, month - 1, day);
      } else {
        // Try to parse as full datetime
        date = new Date(dateString);
      }
      
      if (!isNaN(date.getTime())) {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = String(date.getFullYear()).slice(-2);
        return `${day}/${month}/${year}`;
      }
      
      return dateString;
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Delete Appointment</h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Appointment Details */}
        <div className={styles.content}>
          <div className={styles.fieldContainer}>
            <label className={styles.label}>Name</label>
            <div className={styles.value}>{appointment.title || "Untitled Appointment"}</div>
          </div>

          <div className={styles.fieldContainer}>
            <label className={styles.label}>Date</label>
            <div className={styles.value}>{formatDate(appointment.date || appointment.startTime)}</div>
          </div>

          <div className={styles.fieldContainer}>
            <label className={styles.label}>Description</label>
            <div className={styles.value}>{appointment.description || "No description"}</div>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.buttonsRow}>
          <button
            type="button"
            className={styles.editButton}
            onClick={() => onEdit && onEdit(appointment)}
            title="Edit appointment"
          >
            Edit Appointment
          </button>
          <button type="button" className={styles.deleteButton} onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteAppointmentModal;