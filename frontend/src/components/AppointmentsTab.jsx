function AppointmentsTab({
  isStudent,
  isCounselor,
  isAdmin,
  appointmentForm,
  setAppointmentForm,
  bookAppointment,
  slots,
  appointments,
  updateAppointmentStatus,
}) {
  return (
    <section className="grid2">
      {isStudent && (
        <form className="card form" onSubmit={bookAppointment}>
          <h3>Book Appointment</h3>
          <select value={appointmentForm.slotId} onChange={(e) => setAppointmentForm({ ...appointmentForm, slotId: Number(e.target.value) })} required>
            <option value="">Select slot</option>
            {slots.map((slot) => (
              <option key={slot.id} value={slot.id}>
                #{slot.id} {slot.slot_date} {slot.start_time}
              </option>
            ))}
          </select>
          <textarea placeholder="Concern details" value={appointmentForm.concern} onChange={(e) => setAppointmentForm({ ...appointmentForm, concern: e.target.value })} required />
          <button type="submit" className="primary-btn">Request appointment</button>
        </form>
      )}
      <div className="card">
        <h3>Appointments</h3>
        {!appointments.length ? (
          <p className="empty">No appointments yet.</p>
        ) : (
          <ul className="list">
            {appointments.map((appointment) => (
              <li key={appointment.id} className="list-item vertical">
                <div className="appointment-head">
                  <strong>#{appointment.id} slot {appointment.slot_id}</strong>
                  <span className={`status status-${appointment.status}`}>{appointment.status}</span>
                </div>
                <p className="muted">{appointment.slot_date} {appointment.start_time} - {appointment.end_time}</p>
                {(isCounselor || isAdmin) && appointment.status === "pending" && (
                  <span className="actions">
                    <button onClick={() => updateAppointmentStatus(appointment.id, "approved")}>Approve</button>
                    <button onClick={() => updateAppointmentStatus(appointment.id, "rejected")}>Reject</button>
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default AppointmentsTab;
