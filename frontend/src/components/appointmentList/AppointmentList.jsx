import styles from "./appointmentList.module.css";

/**
 * AppointmentList - Component to display list of appointments
 *
 * Props:
 * - appointments: array (list of appointment objects)
 * - onDelete: function (callback when delete button is clicked with appointmentId)
 * - isLoading: boolean (optional, shows loading state)
 */
function AppointmentList({ appointments, onDelete, isLoading = false }) {
  if (isLoading) {
    return (
      <div className={styles.emptyState}>
        <p>Loading appointments...</p>
      </div>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No appointments scheduled</p>
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    
    try {
      // If dateString is in YYYY-MM-DD format, parse it
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateString.split('-');
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString("en-US", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      }
      
      // Try to parse as full datetime
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("en-US", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      }
      
      return dateString;
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return "";
    
    // If timeString is in HH:mm format, return as is
    if (timeString.match(/^\d{2}:\d{2}$/)) {
      return timeString;
    }
    
    // Try to parse as Date and extract time
    try {
      const date = new Date(timeString);
      if (!isNaN(date.getTime())) {
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${hours}:${minutes}`;
      }
    } catch (error) {
      console.error("Error formatting time:", error);
    }
    
    return timeString;
  };

  return (
    <div className={styles.appointmentList}>
      {appointments.map((appointment) => (
        <div key={appointment.id} className={styles.appointmentItem}>
          <div className={styles.appointmentInfo}>
            <div className={styles.appointmentDate}>
              {formatDate(appointment.date || appointment.startTime)}
            </div>
            {appointment.time && (
              <div className={styles.appointmentTime}>
                {formatTime(appointment.time)}
              </div>
            )}
            {appointment.duration && (
              <div className={styles.appointmentDuration}>
                Duration: {appointment.duration} minutes
              </div>
            )}
            {appointment.location && (
              <div className={styles.appointmentLocation}>
                Location: {appointment.location}
              </div>
            )}
            {appointment.title && (
              <div className={styles.appointmentTitle}>{appointment.title}</div>
            )}
            {appointment.description && (
              <div className={styles.appointmentDescription}>
                {appointment.description}
              </div>
            )}
          </div>
          <button
            className={styles.deleteButton}
            onClick={() => onDelete(appointment.id)}
            title="Delete appointment"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default AppointmentList;
