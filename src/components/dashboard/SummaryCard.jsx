function SummaryCard({ description, label, tone = 'blue', value }) {
  return (
    <article className={`summary-card summary-card-${tone}`}>
      <span className="summary-icon">{tone === 'green' ? 'V' : 'C'}</span>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {description && <p>{description}</p>}
      </div>
    </article>
  );
}

export default SummaryCard;
