function PlansTab({ isStudent, planForm, setPlanForm, createPlan, plans }) {
  return (
    <section className="grid2">
      {isStudent && (
        <form className="card form" onSubmit={createPlan}>
          <h3>Create Wellness Plan</h3>
          <input placeholder="Plan title" value={planForm.title} onChange={(e) => setPlanForm({ ...planForm, title: e.target.value })} required />
          <input placeholder="Category" value={planForm.category} onChange={(e) => setPlanForm({ ...planForm, category: e.target.value })} required />
          <input type="number" placeholder="Target value" value={planForm.targetValue} onChange={(e) => setPlanForm({ ...planForm, targetValue: Number(e.target.value) })} required />
          <input placeholder="Unit" value={planForm.unit} onChange={(e) => setPlanForm({ ...planForm, unit: e.target.value })} required />
          <label>Start date</label>
          <input type="date" value={planForm.startDate} onChange={(e) => setPlanForm({ ...planForm, startDate: e.target.value })} required />
          <label>End date</label>
          <input type="date" value={planForm.endDate} onChange={(e) => setPlanForm({ ...planForm, endDate: e.target.value })} required />
          <button type="submit" className="primary-btn">Save plan</button>
        </form>
      )}
      <div className="card">
        <h3>Plans</h3>
        {!plans.length ? (
          <p className="empty">No wellness plans yet. Create one to begin tracking.</p>
        ) : (
          <ul className="list">
            {plans.map((plan) => (
              <li key={plan.id} className="list-item">
                <div>
                  <strong>{plan.title}</strong>
                  <p className="muted">{plan.category}</p>
                </div>
                <span className="pill">Target: {plan.target_value} {plan.unit}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default PlansTab;
