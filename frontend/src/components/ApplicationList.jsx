function ApplicationList({ applications, onEdit, onDelete, onRecommend }) {
  const normalizeDependencies = (dependencies) => {
    if (Array.isArray(dependencies)) {
      return dependencies;
    }

    if (typeof dependencies === "string") {
      return dependencies
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [];
  };

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Application Inventory</p>
          <h2>Application list</h2>
        </div>
        <span className="count-badge">{applications.length} items</span>
      </div>

      <div className="application-grid">
        {applications.length ? (
          applications.map((app) => {
            const dependencies = normalizeDependencies(app.dependencies);

            return (
            <article className="app-card" key={app.app_id}>
              <div className="app-card-top">
                <div>
                  <h3>{app.name}</h3>
                  <p>
                    {app.category} • v{app.version}
                  </p>
                </div>
                <span
                  className={`status-chip ${app.status === "pending" ? "pending" : "active"}`}
                >
                  {app.status || "active"}
                </span>
              </div>

              <div className="metrics-row">
                <div>
                  <span>Usage</span>
                  <strong>{app.usage_count}</strong>
                </div>
                <div>
                  <span>Created</span>
                  <strong>
                    {app.created_at ? new Date(app.created_at).toLocaleDateString() : "-"}
                  </strong>
                </div>
              </div>

              <div className="tag-row">
                {dependencies.length ? (
                  dependencies.map((dependency) => (
                    <span className="tag" key={`${app.app_id}-${dependency}`}>
                      {dependency}
                    </span>
                  ))
                ) : (
                  <span className="tag tag-muted">No dependencies</span>
                )}
              </div>

              <div className="card-actions">
                <button className="button button-secondary" onClick={() => onEdit(app)}>
                  Edit
                </button>
                <button
                  className="button button-secondary"
                  onClick={() => onRecommend(app.app_id)}
                >
                  Recommend
                </button>
                <button className="button button-danger" onClick={() => onDelete(app.app_id)}>
                  Delete
                </button>
              </div>
            </article>
            );
          })
        ) : (
          <div className="empty-state">No applications match the current search or filter.</div>
        )}
      </div>
    </section>
  );
}

export default ApplicationList;
