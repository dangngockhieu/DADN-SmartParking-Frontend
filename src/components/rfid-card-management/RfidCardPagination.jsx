function RfidCardPagination({
	currentPage,
	pageSize,
	totalItems,
	totalPages,
	onPageChange,
	onPageSizeChange,
}) {
	const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)
	const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
	const endItem = Math.min(currentPage * pageSize, totalItems)

	return (
		<section className="rfid-pagination" aria-label="Phân trang danh sách thẻ">
			<p>
				Đang xem <strong>{startItem}-{endItem}</strong> trong <strong>{totalItems}</strong> thẻ
			</p>

			<div className="rfid-page-controls">
				{pageNumbers.map((pageNumber) => (
					<button
						className={pageNumber === currentPage ? 'active' : ''}
						key={pageNumber}
						type="button"
						onClick={() => onPageChange(pageNumber)}
					>
						{pageNumber}
					</button>
				))}
			</div>

			<label className="rfid-page-size">
				<span>Dòng / trang</span>
				<select value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))}>
					<option value={6}>6</option>
					<option value={10}>10</option>
					<option value={15}>15</option>
				</select>
			</label>
		</section>
	)
}

export default RfidCardPagination
