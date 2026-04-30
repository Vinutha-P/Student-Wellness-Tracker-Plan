function SlotsTab({ isCounselor, isAdmin, slotForm, setSlotForm, createSlot, slots }) {
  return (
    <section className="grid2">
      {(isCounselor || isAdmin) && (
        <form className="card form" onSubmit={createSlot}>
          <h3>Create Counseling Slot</h3>
          <input type="date" value={slotForm.slotDate} onChange={(e) => setSlotForm({ ...slotForm, slotDate: e.target.value })} required />
          <input type="time" value={slotForm.startTime} onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })} required />
          <input type="time" value={slotForm.endTime} onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })} required />
          <select value={slotForm.mode} onChange={(e) => setSlotForm({ ...slotForm, mode: e.target.value })}>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
          <button type="submit" className="primary-btn">Add slot</button>
        </form>
      )}
      <div className="card">
        <h3>Available Slots</h3>
        {!slots.length ? (
          <p className="empty">No slots available yet.</p>
        ) : (
          <ul className="list">
            {slots.map((slot) => (
              <li key={slot.id} className="list-item">
                <div>
                  <strong>#{slot.id} - {slot.slot_date}</strong>
                  <p className="muted">{slot.start_time} - {slot.end_time}</p>
                </div>
                <span className="pill">{slot.mode}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default SlotsTab;
