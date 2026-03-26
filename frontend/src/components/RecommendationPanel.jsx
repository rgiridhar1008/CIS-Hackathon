function RecommendationPanel({ selectedAppName, recommendations }) {
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Recommendation Engine</p>
          <h2>Smart recommendations</h2>
        </div>
      </div>

      {selectedAppName ? (
        <p className="panel-copy">
          Showing top related applications for <strong>{selectedAppName}</strong>.
        </p>
      ) : (
        <p className="panel-copy">Pick an application card and click Recommend.</p>
      )}

      <div className="recommendation-list">
        {recommendations.length ? (
          recommendations.map((app) => (
            <article className="recommendation-card" key={app.app_id}>
              <span className="recommendation-kicker">{app.category}</span>
              <h3>{app.name}</h3>
              <p>Usage score: {app.usage_count}</p>
            </article>
          ))
        ) : (
          <div className="empty-state">No recommendations yet.</div>
        )}
      </div>
    </section>
  );
}

export default RecommendationPanel;
