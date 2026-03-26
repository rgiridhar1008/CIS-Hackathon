import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const pieColors = ["#1e90ff", "#42b883", "#f7b500", "#ff7d54", "#5b6cff"];

function AnalyticsPanel({ analytics }) {
  const mostUsedApps = analytics?.most_used_apps || [];
  const categoryDistribution = analytics?.category_distribution || [];
  const statusBreakdown = analytics?.status_breakdown || [];

  return (
    <section className="analytics-grid">
      <article className="panel metric-panel">
        <p className="eyebrow">Catalog Snapshot</p>
        <h3>{analytics?.total_apps || 0} applications</h3>
        <p>Total usage count: {analytics?.total_usage || 0}</p>
      </article>

      <article className="panel chart-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Analytics</p>
            <h2>Most used apps</h2>
          </div>
        </div>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={mostUsedApps}>
              <XAxis dataKey="name" stroke="#60708f" />
              <YAxis stroke="#60708f" />
              <Tooltip />
              <Bar dataKey="usage_count" radius={[12, 12, 0, 0]} fill="#1e90ff" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="panel chart-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Analytics</p>
            <h2>Category distribution</h2>
          </div>
        </div>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={categoryDistribution}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={4}
              >
                {categoryDistribution.map((entry, index) => (
                  <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="panel chart-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Status</p>
            <h2>Lifecycle overview</h2>
          </div>
        </div>
        <div className="status-stats">
          {statusBreakdown.length ? (
            statusBreakdown.map((item) => (
              <div className="status-stat-card" key={item.name}>
                <span className={`status-dot ${item.name === "pending" ? "pending" : "active"}`} />
                <strong>{item.value}</strong>
                <p>{item.name}</p>
              </div>
            ))
          ) : (
            <div className="empty-state">No analytics data available.</div>
          )}
        </div>
      </article>
    </section>
  );
}

export default AnalyticsPanel;
