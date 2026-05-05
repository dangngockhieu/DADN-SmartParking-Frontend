function ErrorPage() {
	return (
		<div style={styles.page}>
			<div style={styles.glow} />
			<div style={styles.card}>
				<div style={styles.badge}>System notice</div>
				<div style={styles.code}>404</div>
				<h1 style={styles.title}>Page not available</h1>
				<p style={styles.description}>
					Trang lỗi mockup tạm thời. Hiện tại chưa có logic xử lý, chỉ dùng để xem giao diện tổng quan.
				</p>
				<div style={styles.panel}>
					<div style={styles.panelLabel}>Status</div>
					<div style={styles.panelValue}>Temporary placeholder</div>
				</div>
				<div style={styles.metaRow}>
					<div style={styles.metaItem}>
						<span style={styles.metaLabel}>Module</span>
						<span style={styles.metaValue}>Error Page</span>
					</div>
					<div style={styles.metaItem}>
						<span style={styles.metaLabel}>Mode</span>
						<span style={styles.metaValue}>Mockup only</span>
					</div>
				</div>
			</div>
		</div>
	)
}

const styles = {
	page: {
		minHeight: '100vh',
		display: 'grid',
		placeItems: 'center',
		padding: '24px',
		background:
			'radial-gradient(circle at top, rgba(255, 183, 77, 0.22), transparent 30%), linear-gradient(135deg, #0f172a 0%, #111827 45%, #1f2937 100%)',
		color: '#f9fafb',
	},
	glow: {
		position: 'absolute',
		width: '340px',
		height: '340px',
		borderRadius: '999px',
		background: 'rgba(251, 191, 36, 0.18)',
		filter: 'blur(40px)',
		zIndex: 0,
	},
	card: {
		position: 'relative',
		zIndex: 1,
		width: 'min(100%, 560px)',
		padding: '32px',
		borderRadius: '28px',
		border: '1px solid rgba(255, 255, 255, 0.12)',
		background: 'rgba(15, 23, 42, 0.72)',
		backdropFilter: 'blur(18px)',
		boxShadow: '0 24px 80px rgba(0, 0, 0, 0.35)',
	},
	badge: {
		display: 'inline-flex',
		padding: '8px 12px',
		marginBottom: '20px',
		borderRadius: '999px',
		background: 'rgba(251, 191, 36, 0.14)',
		color: '#fbbf24',
		fontSize: '0.85rem',
		fontWeight: 700,
		letterSpacing: '0.04em',
		textTransform: 'uppercase',
	},
	code: {
		fontSize: 'clamp(4rem, 12vw, 7rem)',
		fontWeight: 900,
		lineHeight: 1,
		letterSpacing: '-0.08em',
		color: '#fff7ed',
	},
	title: {
		margin: '12px 0 10px',
		fontSize: 'clamp(2rem, 5vw, 3.1rem)',
		lineHeight: 1.05,
	},
	description: {
		margin: 0,
		maxWidth: '42ch',
		fontSize: '1rem',
		lineHeight: 1.7,
		color: 'rgba(226, 232, 240, 0.82)',
	},
	panel: {
		marginTop: '24px',
		padding: '16px 18px',
		borderRadius: '18px',
		background: 'rgba(255, 255, 255, 0.05)',
		border: '1px solid rgba(255, 255, 255, 0.08)',
	},
	panelLabel: {
		fontSize: '0.82rem',
		textTransform: 'uppercase',
		letterSpacing: '0.08em',
		color: 'rgba(248, 250, 252, 0.6)',
	},
	panelValue: {
		marginTop: '6px',
		fontSize: '1.05rem',
		fontWeight: 700,
	},
	metaRow: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
		gap: '12px',
		marginTop: '18px',
	},
	metaItem: {
		padding: '14px 16px',
		borderRadius: '16px',
		background: 'rgba(255, 255, 255, 0.04)',
		border: '1px solid rgba(255, 255, 255, 0.08)',
		display: 'grid',
		gap: '4px',
	},
	metaLabel: {
		fontSize: '0.8rem',
		textTransform: 'uppercase',
		letterSpacing: '0.08em',
		color: 'rgba(248, 250, 252, 0.6)',
	},
	metaValue: {
		fontSize: '0.98rem',
		fontWeight: 600,
	},
}

export default ErrorPage
