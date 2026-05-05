function RfidCardToolbar({
	keyword,
	status,
	onKeywordChange,
	onStatusChange,
	onAddClick,
}) {
	return (
		<section className="rfid-toolbar" aria-label="Công cụ quản lý thẻ">
			<label className="rfid-search-field">
				<span className="material-icons">search</span>
				<input
					aria-label="Tìm theo biển số, mã thẻ hoặc email"
					type="search"
					placeholder="Tìm theo biển số / mã thẻ / email"
					value={keyword}
					onChange={(event) => onKeywordChange(event.target.value)}
				/>
			</label>

			<label className="rfid-filter-field">
				<span>Trạng thái</span>
				<select value={status} onChange={(event) => onStatusChange(event.target.value)}>
					<option value="ALL">Tất cả</option>
					<option value="REGISTERED">Đã đăng ký</option>
					<option value="GUEST">Chưa đăng ký</option>
					<option value="ACTIVE">Đang hoạt động</option>
					<option value="INACTIVE">Chưa kích hoạt</option>
				</select>
			</label>

			<button className="rfid-primary-btn" type="button" onClick={onAddClick}>
				<span className="material-icons">add</span>
				<span>Thêm thẻ mới</span>
			</button>
		</section>
	)
}

export default RfidCardToolbar
