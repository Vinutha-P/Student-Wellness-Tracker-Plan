function LogsTab({ isStudent, logForm, setLogForm, createLog, plans, logs }) {
  return (
    <section className="grid2">
      {isStudent && (
        <form className="card form" onSubmit={createLog}>
          <h3>Add Daily Wellness Log</h3>
          <select value={logForm.planId} onChange={(e) => setLogForm({ ...logForm, planId: Number(e.target.value) })} required>
            <option value="">Select plan</option>
            {plans.map((plan) => (
              <option value={plan.id} key={plan.id}>
                {plan.title}
              </option>
            ))}
          </select>
          <label>Date</label>
          <input type="date" value={logForm.logDate} onChange={(e) => setLogForm({ ...logForm, logDate: e.target.value })} required />
          <label>Mood score (1-5)</label>
          <input type="number" min="1" max="5" value={logForm.moodScore} onChange={(e) => setLogForm({ ...logForm, moodScore: Number(e.target.value) })} />
          <label>Sleep hours</label>
          <input type="number" value={logForm.sleepHours} onChange={(e) => setLogForm({ ...logForm, sleepHours: Number(e.target.value) })} />
          <label>Water liters</label>
          <input type="number" value={logForm.waterLiters} onChange={(e) => setLogForm({ ...logForm, waterLiters: Number(e.target.value) })} />
          <label>Exercise minutes</label>
          <input type="number" value={logForm.exerciseMinutes} onChange={(e) => setLogForm({ ...logForm, exerciseMinutes: Number(e.target.value) })} />
          <textarea placeholder="Notes" value={logForm.notes} onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })} />
          <button type="submit" className="primary-btn">Add log</button>
        </form>
      )}
      <div className="card">
        <h3>Progress Logs</h3>
        {!logs.length ? (
          <p className="empty">No logs yet. Add your first daily entry.</p>
        ) : (
          <ul className="list">
            {logs.map((log) => (
              <li key={log.id} className="list-item">
                <div>
                  <strong>{log.log_date}</strong>
                  <p className="muted">Mood {log.mood_score} | Sleep {log.sleep_hours}h</p>
                </div>
                <span className="pill">{log.exercise_minutes} min exercise</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default LogsTab;
