const statToneClass = {
	blue: 'rfid-stat-card-blue',
	green: 'rfid-stat-card-green',
	amber: 'rfid-stat-card-amber',
	cyan: 'rfid-stat-card-cyan',
}

function RfidCardStats({ loading, stats }) {
	return (
		<section className="rfid-stats-grid" aria-label="Thống kê thẻ xe">
			{stats.map((stat) => (
				<article className={`rfid-stat-card ${statToneClass[stat.tone]}`} key={stat.label}>
					<span className="rfid-stat-icon">{stat.icon}</span>
					<div>
						<p>{stat.label}</p>
						{loading ? <span className="rfid-stat-skeleton" /> : <strong>{stat.value}</strong>}
					</div>
				</article>
			))}
		</section>
	)
}

export default RfidCardStats
