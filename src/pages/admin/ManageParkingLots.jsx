import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	FaArrowLeft,
	FaEdit,
	FaEye,
	FaPlus,
	FaRedo,
	FaRulerCombined,
	FaSignInAlt,
	FaSignOutAlt,
	FaToolbox,
} from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import { toast } from 'react-toastify';
import {
	changeParkingSlotDevice,
	createGate,
	createParkingLot,
	createParkingSlot,
	getParkingLotById,
	getParkingLotGates,
	getParkingLots,
	updateGate,
	updateParkingLot,
	updateParkingSlotStatus,
} from '../../services/adminService';
import '../../styles/admin-management.css';

const SLOT_STATUS_OPTIONS = ['AVAILABLE', 'OCCUPIED', 'MAINTAIN'];
const GATE_TYPE_OPTIONS = ['ENTRY', 'EXIT'];

const getStoredUser = () => {
	try {
		const rawUser = localStorage.getItem('user_info');
		return rawUser ? JSON.parse(rawUser) : null;
	} catch {
		return null;
	}
};

const emptyLotForm = { name: '', location: '' };
const emptySlotForm = { name: '', device_mac: '', port_number: '' };
const emptyGateForm = { name: '', type: 'ENTRY', mac_address: '' };

function statusLabel(status) {
	if (status === 'AVAILABLE') return 'Trống';
	if (status === 'OCCUPIED') return 'Đã có xe';
	if (status === 'MAINTAIN') return 'Bảo trì';
	return status || '---';
}

function ManageParkingLots() {
	const navigate = useNavigate();
	const currentUser = useMemo(getStoredUser, []);
	const [lots, setLots] = useState([]);
	const [selectedLotId, setSelectedLotId] = useState(null);
	const [lotDetail, setLotDetail] = useState(null);
	const [gates, setGates] = useState([]);
	const [loadingLots, setLoadingLots] = useState(false);
	const [loadingDetail, setLoadingDetail] = useState(false);
	const [loadingGates, setLoadingGates] = useState(false);
	const [showCreateLotModal, setShowCreateLotModal] = useState(false);
	const [showEditLotModal, setShowEditLotModal] = useState(false);
	const [showCreateSlotModal, setShowCreateSlotModal] = useState(false);
	const [showCreateGateModal, setShowCreateGateModal] = useState(false);
	const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
	const [showUpdateDeviceModal, setShowUpdateDeviceModal] = useState(false);
	const [showUpdateGateModal, setShowUpdateGateModal] = useState(false);
	const [selectedSlot, setSelectedSlot] = useState(null);
	const [selectedGate, setSelectedGate] = useState(null);
	const [lotForm, setLotForm] = useState(emptyLotForm);
	const [slotForm, setSlotForm] = useState(emptySlotForm);
	const [gateForm, setGateForm] = useState(emptyGateForm);
	const [statusValue, setStatusValue] = useState('AVAILABLE');
	const [deviceForm, setDeviceForm] = useState(emptySlotForm);
	const [gateUpdateForm, setGateUpdateForm] = useState({ mac_address: '' });
	const [busy, setBusy] = useState(false);

	const currentLot = useMemo(
		() => lots.find((lot) => lot.id === selectedLotId) || null,
		[lots, selectedLotId],
	);

	const stats = useMemo(() => {
		const source = lotDetail?.stats || { total: 0, available: 0, occupied: 0, maintain: 0 };
		return source;
	}, [lotDetail]);

	const loadLots = async (preferredLotId = null) => {
		setLoadingLots(true);
		try {
			const response = await getParkingLots();
			if (response?.data?.success) {
				const list = response?.data?.data || [];
				setLots(list);
				const nextId = preferredLotId ?? selectedLotId ?? list?.[0]?.id ?? null;
				setSelectedLotId(nextId);
			} else {
				setLots([]);
				setSelectedLotId(null);
				toast.error(response?.data?.message || 'Không tải được danh sách bãi đỗ');
			}
		} catch (error) {
			setLots([]);
			setSelectedLotId(null);
			toast.error(error?.response?.data?.message || 'Không tải được danh sách bãi đỗ');
		} finally {
			setLoadingLots(false);
		}
	};

	const loadLotDetail = async (lotId) => {
		if (!lotId) return;
		setLoadingDetail(true);
		setLoadingGates(true);
		try {
			const [detailResponse, gatesResponse] = await Promise.all([
				getParkingLotById(lotId),
				getParkingLotGates(lotId),
			]);

			if (detailResponse?.data?.success) {
				setLotDetail(detailResponse?.data?.data || null);
			} else {
				setLotDetail(null);
			}

			if (gatesResponse?.data?.success) {
				setGates(gatesResponse?.data?.data || []);
			} else {
				setGates([]);
			}
		} catch (error) {
			setLotDetail(null);
			setGates([]);
			toast.error(error?.response?.data?.message || 'Không tải được chi tiết bãi đỗ');
		} finally {
			setLoadingDetail(false);
			setLoadingGates(false);
		}
	};

	useEffect(() => {
		void loadLots();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (selectedLotId) {
			void loadLotDetail(selectedLotId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedLotId]);

	const refreshAll = async () => {
		await loadLots(selectedLotId);
		if (selectedLotId) {
			await loadLotDetail(selectedLotId);
		}
	};

	const openCreateLot = () => {
		setLotForm(emptyLotForm);
		setShowCreateLotModal(true);
	};

	const openEditLot = () => {
		if (!currentLot) return;
		setLotForm({
			name: currentLot.name || '',
			location: currentLot.location || '',
		});
		setShowEditLotModal(true);
	};

	const handleSubmitLot = async (event, isEdit = false) => {
		event.preventDefault();
		if (!lotForm.name.trim()) {
			toast.error('Vui lòng nhập tên bãi đỗ');
			return;
		}
		setBusy(true);
		try {
			const response = isEdit
				? await updateParkingLot(selectedLotId, {
					name: lotForm.name.trim(),
					location: lotForm.location.trim(),
				})
				: await createParkingLot({
					name: lotForm.name.trim(),
					location: lotForm.location.trim(),
				});

			if (response?.data?.success) {
				toast.success(response?.data?.message || 'Cập nhật bãi đỗ thành công');
				setShowCreateLotModal(false);
				setShowEditLotModal(false);
				setLotForm(emptyLotForm);
				await loadLots(selectedLotId);
				return;
			}

			toast.error(response?.data?.message || 'Không thể lưu bãi đỗ');
		} catch (error) {
			toast.error(error?.response?.data?.message || 'Không thể lưu bãi đỗ');
		} finally {
			setBusy(false);
		}
	};

	const handleSubmitSlot = async (event) => {
		event.preventDefault();
		if (!selectedLotId) {
			toast.error('Vui lòng chọn bãi đỗ trước');
			return;
		}
		if (!slotForm.name.trim() || !slotForm.device_mac.trim() || !slotForm.port_number.trim()) {
			toast.error('Vui lòng nhập đầy đủ thông tin vị trí đỗ');
			return;
		}
		setBusy(true);
		try {
			const response = await createParkingSlot({
				name: slotForm.name.trim(),
				lot_id: selectedLotId,
				device_mac: slotForm.device_mac.trim(),
				port_number: Number(slotForm.port_number),
			});
			if (response?.data?.success) {
				toast.success(response?.data?.message || 'Tạo vị trí đỗ thành công');
				setShowCreateSlotModal(false);
				setSlotForm(emptySlotForm);
				await loadLotDetail(selectedLotId);
				return;
			}
			toast.error(response?.data?.message || 'Không thể tạo vị trí đỗ');
		} catch (error) {
			toast.error(error?.response?.data?.message || 'Không thể tạo vị trí đỗ');
		} finally {
			setBusy(false);
		}
	};

	const handleSubmitGate = async (event) => {
		event.preventDefault();
		if (!selectedLotId) {
			toast.error('Vui lòng chọn bãi đỗ trước');
			return;
		}
		if (!gateForm.name.trim() || !gateForm.mac_address.trim()) {
			toast.error('Vui lòng nhập đầy đủ thông tin cổng');
			return;
		}
		setBusy(true);
		try {
			const response = await createGate({
				name: gateForm.name.trim(),
				type: gateForm.type,
				mac_address: gateForm.mac_address.trim(),
				lot_id: selectedLotId,
			});
			if (response?.data?.success) {
				toast.success(response?.data?.message || 'Tạo cổng thành công');
				setShowCreateGateModal(false);
				setGateForm(emptyGateForm);
				await loadLotDetail(selectedLotId);
				return;
			}
			toast.error(response?.data?.message || 'Không thể tạo cổng');
		} catch (error) {
			toast.error(error?.response?.data?.message || 'Không thể tạo cổng');
		} finally {
			setBusy(false);
		}
	};

	const openSlotStatusModal = (slot) => {
		setSelectedSlot(slot);
		setStatusValue(slot.status || 'AVAILABLE');
		setShowUpdateStatusModal(true);
	};

	const openSlotDeviceModal = (slot) => {
		setSelectedSlot(slot);
		setDeviceForm({
			name: slot.name || '',
			device_mac: slot.device_mac || '',
			port_number: String(slot.port_number ?? ''),
		});
		setShowUpdateDeviceModal(true);
	};

	const openGateModal = (gate) => {
		setSelectedGate(gate);
		setGateUpdateForm({ mac_address: gate.mac_address || '' });
		setShowUpdateGateModal(true);
	};

	const handleUpdateSlotStatus = async (event) => {
		event.preventDefault();
		if (!selectedSlot) return;
		setBusy(true);
		try {
			const response = await updateParkingSlotStatus(selectedSlot.id, { status: statusValue });
			if (response?.data?.success) {
				toast.success(response?.data?.message || 'Cập nhật trạng thái vị trí đỗ thành công');
				setShowUpdateStatusModal(false);
				await loadLotDetail(selectedLotId);
				return;
			}
			toast.error(response?.data?.message || 'Không thể cập nhật trạng thái');
		} catch (error) {
			toast.error(error?.response?.data?.message || 'Không thể cập nhật trạng thái');
		} finally {
			setBusy(false);
		}
	};

	const handleUpdateSlotDevice = async (event) => {
		event.preventDefault();
		if (!selectedSlot) return;
		if (!deviceForm.device_mac.trim() || !deviceForm.port_number.trim()) {
			toast.error('Vui lòng nhập MAC và port mới');
			return;
		}
		setBusy(true);
		try {
			const response = await changeParkingSlotDevice(selectedSlot.id, {
				device_mac: deviceForm.device_mac.trim(),
				port_number: Number(deviceForm.port_number),
			});
			if (response?.data?.success) {
				toast.success(response?.data?.message || 'Cập nhật thiết bị vị trí đỗ thành công');
				setShowUpdateDeviceModal(false);
				await loadLotDetail(selectedLotId);
				return;
			}
			toast.error(response?.data?.message || 'Không thể cập nhật thiết bị vị trí đỗ');
		} catch (error) {
			toast.error(error?.response?.data?.message || 'Không thể cập nhật thiết bị vị trí đỗ');
		} finally {
			setBusy(false);
		}
	};

	const handleUpdateGate = async (event) => {
		event.preventDefault();
		if (!selectedGate) return;
		if (!gateUpdateForm.mac_address.trim()) {
			toast.error('Vui lòng nhập MAC mới');
			return;
		}
		setBusy(true);
		try {
			const response = await updateGate(selectedGate.id, {
				mac_address: gateUpdateForm.mac_address.trim(),
			});
			if (response?.data?.success) {
				toast.success(response?.data?.message || 'Cập nhật cổng thành công');
				setShowUpdateGateModal(false);
				await loadLotDetail(selectedLotId);
				return;
			}
			toast.error(response?.data?.message || 'Không thể cập nhật cổng');
		} catch (error) {
			toast.error(error?.response?.data?.message || 'Không thể cập nhật cổng');
		} finally {
			setBusy(false);
		}
	};

	return (
		<main className="admin-management-page admin-lot-page">
			<header className="admin-management-header">
				<button className="admin-back-btn" type="button" onClick={() => navigate('/map')}>
					<FaArrowLeft />
					Quay lại bản đồ
				</button>
				<div>
					<p className="admin-eyebrow">Admin tools</p>
					<h1>Quản lý bãi đỗ xe</h1>
					<p className="admin-subtitle">Quản lý bãi đỗ, vị trí đỗ và cổng theo từng khu vực.</p>
				</div>
				<div className="admin-profile-chip">
					<FaToolbox />
					<span>{[currentUser?.first_name, currentUser?.last_name].filter(Boolean).join(' ') || currentUser?.email || 'Quản trị viên'}</span>
				</div>
			</header>

			<section className="admin-toolbar">
				<div className="admin-toolbar-actions">
					<button type="button" className="admin-secondary-btn" onClick={() => refreshAll()} disabled={loadingLots || loadingDetail}>
						<FaRedo /> Làm mới
					</button>
					<button type="button" className="admin-primary-btn" onClick={openCreateLot}>
						<FaPlus /> Tạo bãi đỗ
					</button>
				</div>
			</section>

			<section className="admin-lot-layout">
				<aside className="admin-side-panel">
					<div className="admin-side-panel-header">
						<h2>Danh sách bãi</h2>
						<span>{lots.length}</span>
					</div>
					{loadingLots ? (
						<div className="admin-empty-state">Đang tải danh sách bãi đỗ...</div>
					) : lots.length ? (
						<div className="admin-lot-list">
							{lots.map((lot) => (
								<button
									key={lot.id}
									type="button"
									className={`admin-lot-card ${lot.id === selectedLotId ? 'active' : ''}`}
									onClick={() => setSelectedLotId(lot.id)}
								>
									<strong>{lot.name}</strong>
									<span>{lot.location || 'Chưa có vị trí'}</span>
								</button>
							))}
						</div>
					) : (
						<div className="admin-empty-state">Chưa có bãi đỗ nào.</div>
					)}
				</aside>

				<section className="admin-detail-panel">
					{currentLot ? (
						<>
							<div className="admin-detail-header">
								<div>
									<p className="admin-eyebrow">Bãi đang chọn</p>
									<h2>{currentLot.name}</h2>
									<span>{currentLot.location || 'Chưa có vị trí'}</span>
								</div>
								<div className="admin-toolbar-actions">
									<button type="button" className="admin-outline-btn" onClick={openEditLot}>
										<FaEdit /> Sửa bãi
									</button>
									<button type="button" className="admin-primary-btn" onClick={() => setShowCreateSlotModal(true)}>
										<FaPlus /> Thêm vị trí
									</button>
									<button type="button" className="admin-primary-btn" onClick={() => setShowCreateGateModal(true)}>
										<FaPlus /> Thêm cổng
									</button>
								</div>
							</div>

							<div className="admin-stat-grid">
								<div className="admin-stat-card"><span>Tổng vị trí</span><strong>{stats.total || 0}</strong></div>
								<div className="admin-stat-card"><span>Trống</span><strong>{stats.available || 0}</strong></div>
								<div className="admin-stat-card"><span>Đã đỗ</span><strong>{stats.occupied || 0}</strong></div>
								<div className="admin-stat-card"><span>Bảo trì</span><strong>{stats.maintain || 0}</strong></div>
							</div>

							<div className="admin-data-section">
								<div className="admin-section-title">
									<h3>Vị trí đỗ</h3>
									<FaRulerCombined />
								</div>
								{loadingDetail ? (
									<div className="admin-empty-state">Đang tải chi tiết bãi đỗ...</div>
								) : (lotDetail?.slots || []).length ? (
									<div className="admin-table-wrap">
										<table className="admin-table">
											<thead>
												<tr>
													<th>ID</th>
													<th>Tên</th>
													<th>Trạng thái</th>
													<th>Thiết bị</th>
													<th>Port</th>
													<th>Thao tác</th>
												</tr>
											</thead>
											<tbody>
												{lotDetail.slots.map((slot) => (
													<tr key={slot.id}>
														<td>{slot.id}</td>
														<td>{slot.name}</td>
														<td><span className={`admin-status admin-status--${String(slot.status || '').toLowerCase()}`}>{statusLabel(slot.status)}</span></td>
														<td>{slot.device_mac || '---'}</td>
														<td>{slot.port_number ?? '---'}</td>
														<td>
															<div className="admin-row-actions">
																<button type="button" className="admin-icon-btn" onClick={() => openSlotStatusModal(slot)} title="Đổi trạng thái"><FaEye /></button>
																<button type="button" className="admin-outline-btn" onClick={() => openSlotDeviceModal(slot)}><FaEdit /> Thiết bị</button>
															</div>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								) : (
									<div className="admin-empty-state">Bãi đỗ này chưa có vị trí nào.</div>
								)}
							</div>

							<div className="admin-data-section">
								<div className="admin-section-title">
									<h3>Cổng</h3>
									<FaSignInAlt />
									<FaSignOutAlt />
								</div>
								{loadingGates ? (
									<div className="admin-empty-state">Đang tải danh sách cổng...</div>
								) : gates.length ? (
									<div className="admin-table-wrap">
										<table className="admin-table">
											<thead>
												<tr>
													<th>ID</th>
													<th>Tên</th>
													<th>Loại</th>
													<th>MAC</th>
													<th>Thao tác</th>
												</tr>
											</thead>
											<tbody>
												{gates.map((gate) => (
													<tr key={gate.id}>
														<td>{gate.id}</td>
														<td>{gate.name}</td>
														<td>{gate.type}</td>
														<td>{gate.mac_address}</td>
														<td>
															<button type="button" className="admin-outline-btn" onClick={() => openGateModal(gate)}><FaEdit /> Cập nhật</button>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								) : (
									<div className="admin-empty-state">Chưa có cổng nào trong bãi này.</div>
								)}
							</div>
						</>
					) : (
						<div className="admin-empty-state">Chọn một bãi đỗ để xem chi tiết.</div>
					)}
				</section>
			</section>

			{showCreateLotModal && (
				<ModalShell title="Tạo bãi đỗ mới" onClose={() => setShowCreateLotModal(false)}>
					<form className="admin-modal-body" onSubmit={(event) => handleSubmitLot(event, false)}>
						<input className="admin-input" placeholder="Tên bãi đỗ" value={lotForm.name} onChange={(event) => setLotForm((prev) => ({ ...prev, name: event.target.value }))} />
						<input className="admin-input" placeholder="Vị trí" value={lotForm.location} onChange={(event) => setLotForm((prev) => ({ ...prev, location: event.target.value }))} />
						<div className="admin-modal-actions">
							<button type="button" className="admin-secondary-btn" onClick={() => setShowCreateLotModal(false)}>Hủy</button>
							<button type="submit" className="admin-primary-btn" disabled={busy}>{busy ? 'Đang lưu...' : 'Tạo bãi'}</button>
						</div>
					</form>
				</ModalShell>
			)}

			{showEditLotModal && (
				<ModalShell title={`Cập nhật bãi đỗ: ${currentLot?.name || ''}`} onClose={() => setShowEditLotModal(false)}>
					<form className="admin-modal-body" onSubmit={(event) => handleSubmitLot(event, true)}>
						<input className="admin-input" placeholder="Tên bãi đỗ" value={lotForm.name} onChange={(event) => setLotForm((prev) => ({ ...prev, name: event.target.value }))} />
						<input className="admin-input" placeholder="Vị trí" value={lotForm.location} onChange={(event) => setLotForm((prev) => ({ ...prev, location: event.target.value }))} />
						<div className="admin-modal-actions">
							<button type="button" className="admin-secondary-btn" onClick={() => setShowEditLotModal(false)}>Hủy</button>
							<button type="submit" className="admin-primary-btn" disabled={busy}>{busy ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
						</div>
					</form>
				</ModalShell>
			)}

			{showCreateSlotModal && (
				<ModalShell title="Thêm vị trí đỗ" onClose={() => setShowCreateSlotModal(false)}>
					<form className="admin-modal-body" onSubmit={handleSubmitSlot}>
						<input className="admin-input" placeholder="Tên vị trí" value={slotForm.name} onChange={(event) => setSlotForm((prev) => ({ ...prev, name: event.target.value }))} />
						<input className="admin-input" placeholder="MAC thiết bị" value={slotForm.device_mac} onChange={(event) => setSlotForm((prev) => ({ ...prev, device_mac: event.target.value }))} />
						<input className="admin-input" type="number" placeholder="Port" value={slotForm.port_number} onChange={(event) => setSlotForm((prev) => ({ ...prev, port_number: event.target.value }))} />
						<div className="admin-modal-actions">
							<button type="button" className="admin-secondary-btn" onClick={() => setShowCreateSlotModal(false)}>Hủy</button>
							<button type="submit" className="admin-primary-btn" disabled={busy}>{busy ? 'Đang tạo...' : 'Tạo vị trí'}</button>
						</div>
					</form>
				</ModalShell>
			)}

			{showCreateGateModal && (
				<ModalShell title="Thêm cổng" onClose={() => setShowCreateGateModal(false)}>
					<form className="admin-modal-body" onSubmit={handleSubmitGate}>
						<input className="admin-input" placeholder="Tên cổng" value={gateForm.name} onChange={(event) => setGateForm((prev) => ({ ...prev, name: event.target.value }))} />
						<select className="admin-input" value={gateForm.type} onChange={(event) => setGateForm((prev) => ({ ...prev, type: event.target.value }))}>
							{GATE_TYPE_OPTIONS.map((type) => <option key={type} value={type}>{type}</option>)}
						</select>
						<input className="admin-input" placeholder="MAC cổng" value={gateForm.mac_address} onChange={(event) => setGateForm((prev) => ({ ...prev, mac_address: event.target.value }))} />
						<div className="admin-modal-actions">
							<button type="button" className="admin-secondary-btn" onClick={() => setShowCreateGateModal(false)}>Hủy</button>
							<button type="submit" className="admin-primary-btn" disabled={busy}>{busy ? 'Đang tạo...' : 'Tạo cổng'}</button>
						</div>
					</form>
				</ModalShell>
			)}

			{showUpdateStatusModal && selectedSlot && (
				<ModalShell title={`Đổi trạng thái: ${selectedSlot.name}`} onClose={() => setShowUpdateStatusModal(false)}>
					<form className="admin-modal-body" onSubmit={handleUpdateSlotStatus}>
						<select className="admin-input" value={statusValue} onChange={(event) => setStatusValue(event.target.value)}>
							{SLOT_STATUS_OPTIONS.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
						</select>
						<div className="admin-modal-actions">
							<button type="button" className="admin-secondary-btn" onClick={() => setShowUpdateStatusModal(false)}>Hủy</button>
							<button type="submit" className="admin-primary-btn" disabled={busy}>{busy ? 'Đang lưu...' : 'Cập nhật'}</button>
						</div>
					</form>
				</ModalShell>
			)}

			{showUpdateDeviceModal && selectedSlot && (
				<ModalShell title={`Đổi thiết bị: ${selectedSlot.name}`} onClose={() => setShowUpdateDeviceModal(false)}>
					<form className="admin-modal-body" onSubmit={handleUpdateSlotDevice}>
						<input className="admin-input" placeholder="MAC thiết bị" value={deviceForm.device_mac} onChange={(event) => setDeviceForm((prev) => ({ ...prev, device_mac: event.target.value }))} />
						<input className="admin-input" type="number" placeholder="Port" value={deviceForm.port_number} onChange={(event) => setDeviceForm((prev) => ({ ...prev, port_number: event.target.value }))} />
						<div className="admin-modal-actions">
							<button type="button" className="admin-secondary-btn" onClick={() => setShowUpdateDeviceModal(false)}>Hủy</button>
							<button type="submit" className="admin-primary-btn" disabled={busy}>{busy ? 'Đang lưu...' : 'Cập nhật'}</button>
						</div>
					</form>
				</ModalShell>
			)}

			{showUpdateGateModal && selectedGate && (
				<ModalShell title={`Cập nhật cổng: ${selectedGate.name}`} onClose={() => setShowUpdateGateModal(false)}>
					<form className="admin-modal-body" onSubmit={handleUpdateGate}>
						<input className="admin-input" placeholder="MAC cổng" value={gateUpdateForm.mac_address} onChange={(event) => setGateUpdateForm({ mac_address: event.target.value })} />
						<div className="admin-modal-actions">
							<button type="button" className="admin-secondary-btn" onClick={() => setShowUpdateGateModal(false)}>Hủy</button>
							<button type="submit" className="admin-primary-btn" disabled={busy}>{busy ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
						</div>
					</form>
				</ModalShell>
			)}
		</main>
	);
}

function ModalShell({ title, onClose, children }) {
	return (
		<div className="admin-modal-overlay" onClick={onClose}>
			<div className="admin-modal admin-modal--wide" onClick={(event) => event.stopPropagation()}>
				<div className="admin-modal-header">
					<h3>{title}</h3>
					<button type="button" className="admin-icon-btn" onClick={onClose}><IoMdClose /></button>
				</div>
				{children}
			</div>
		</div>
	);
}

export default ManageParkingLots;
