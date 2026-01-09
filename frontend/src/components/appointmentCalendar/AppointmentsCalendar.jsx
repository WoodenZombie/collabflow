import { useMemo, useState } from "react";
import styles from "./appointmentCalendar.module.css";

/**
 * AppointmentsCalendar - Month view calendar displaying appointments by date and time
 *
 * Props:
 * - appointments: array of { id, title, description, date: YYYY-MM-DD, time: HH:mm, duration, location }
 * - onDelete: function(appointmentId)
 * - isLoading: boolean
 */
function AppointmentsCalendar({ appointments = [], onDelete, isLoading = false }) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const goPrevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const goNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  const goToday = () => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  const monthLabel = useMemo(() => {
    return currentMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  }, [currentMonth]);

  // Build a 6-week matrix starting on Monday
  const weeks = useMemo(() => {
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    // JS getDay(): 0=Sun..6=Sat; convert to Monday-based index
    const dayOfWeekMondayBased = (d) => (d === 0 ? 6 : d - 1);

    const startOffset = dayOfWeekMondayBased(firstDayOfMonth.getDay());
    const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1 - startOffset);

    const totalCells = 6 * 7; // 6 weeks
    const cells = [];
    for (let i = 0; i < totalCells; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      cells.push(date);
    }
    // Split into weeks of 7 days
    const result = [];
    for (let i = 0; i < cells.length; i += 7) {
      result.push(cells.slice(i, i + 7));
    }
    return result;
  }, [currentMonth]);

  // Group appointments by date (YYYY-MM-DD)
  const appointmentsByDate = useMemo(() => {
    const map = new Map();
    console.debug("AppointmentsCalendar: Processing", appointments.length, "appointments");
    appointments.forEach((a) => {
      if (!a?.date) {
        console.warn("AppointmentsCalendar: Appointment missing date:", a);
        return;
      }
      const key = a.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(a);
    });
    // Sort each day's appointments by time (HH:mm)
    for (const [key, items] of map.entries()) {
      items.sort((x, y) => {
        const xt = (x.time || "00:00").split(":");
        const yt = (y.time || "00:00").split(":");
        const xMinutes = parseInt(xt[0]) * 60 + parseInt(xt[1]);
        const yMinutes = parseInt(yt[0]) * 60 + parseInt(yt[1]);
        return xMinutes - yMinutes;
      });
    }
    console.debug("AppointmentsCalendar: Appointments by date:", Array.from(map.entries()).map(([date, apps]) => `${date}: ${apps.length}`));
    return map;
  }, [appointments]);

  const isSameMonth = (d) => d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();

  if (isLoading) {
    return (
      <div className={styles.emptyState}>
        <p>Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className={styles.calendarContainer}>
      {/* Header */}
      <div className={styles.calendarHeader}>
        <div className={styles.leftActions}>
          <button className={styles.navButton} onClick={goPrevMonth}>&lt;</button>
          <button className={styles.navButton} onClick={goToday}>Today</button>
          <button className={styles.navButton} onClick={goNextMonth}>&gt;</button>
        </div>
        <div className={styles.monthLabel}>{monthLabel}</div>
        <div className={styles.rightSpacer} />
      </div>

      {/* Weekday header (Monday-first) */}
      <div className={styles.weekHeader}>
        {"Mon Tue Wed Thu Fri Sat Sun".split(" ").map((d) => (
          <div key={d} className={styles.weekday}>{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div className={styles.grid}>
        {weeks.map((week, wi) => (
          <div key={wi} className={styles.weekRow}>
            {week.map((date, di) => {
              const yyyy = date.getFullYear();
              const mm = String(date.getMonth() + 1).padStart(2, "0");
              const dd = String(date.getDate()).padStart(2, "0");
              const key = `${yyyy}-${mm}-${dd}`;
              const dayAppointments = appointmentsByDate.get(key) || [];
              const inCurrentMonth = isSameMonth(date);
              return (
                <div key={di} className={`${styles.dayCell} ${inCurrentMonth ? "" : styles.otherMonth}`}> 
                  <div className={styles.dayNumber}>{dd}</div>
                  <div className={styles.appointmentsList}>
                    {dayAppointments.length === 0 ? null : (
                      dayAppointments.map((a) => (
                        <div
                          key={a.id}
                          className={styles.appointmentItem}
                          onClick={() => onDelete && onDelete(a.id)}
                          title="Click to delete or edit"
                        >
                          {a.time && <span className={styles.appointmentTime}>{a.time}</span>}
                          <span className={styles.appointmentTitle}>{a.title || "Untitled"}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AppointmentsCalendar;
