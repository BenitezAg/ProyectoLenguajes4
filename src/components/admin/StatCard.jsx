export default function StatCard({ label, value, detail, icon }) {
  return (
    <article className="stat-card">
      <span className="stat-icon" aria-hidden="true">{icon}</span>
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      <span className="stat-detail">{detail}</span>
    </article>
  );
}
