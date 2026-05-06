import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaSearch, FaSyncAlt, FaTabletAlt } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import { toast } from 'react-toastify';
import { createIoTDevice, getIoTDevices, getParkingLots, updateIoTDevice } from '../../services/adminService';
import '../../styles/admin-management.css';

const PAGE_SIZE = 10;
const DEVICE_STATUS_OPTIONS = ['ACTIVE', 'INACTIVE', 'ERROR'];

const getStoredUser = () => {
	try {
		const rawUser = localStorage.getItem('user_info');
		return rawUser ? JSON.parse(rawUser) : null;
	} catch {
		return null;
	}
};

const emptyCreateForm = { mac_address: '', device_name: '', lot_id: '' };
const emptyUpdateForm = { device_name: '', status: 'ACTIVE', lot_id: '' };

function ManageDevices() {
	const navigate = useNavigate();
	const currentUser = useMemo(getStoredUser, []);
	const [lots, setLots] = useState([]);
	const [devices, setDevices] = useState([]);
	const [filterLotId, setFilterLotId] = useState('');
	const [filterStatus, setFilterStatus] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const [keyword, setKeyword] = useState('');
	const [loading, setLoading] = useState(false);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showUpdateModal, setShowUpdateModal] = useState(false);
	const [selectedDevice, setSelectedDevice] = useState(null);
	const [createForm, setCreateForm] = useState(emptyCreateForm);
	const [updateForm, setUpdateForm] = useState(emptyUpdateForm);
	const [busy, setBusy] = useState(false);

	const lotNameMap = useMemo(() => {
		return new Map(lots.map((lot) => [lot.id, `${lot.name}${lot.location ? ` - ${lot.location}` : ''}`]));
	}, [lots]);

	const loadLots = async () => {
		try {
			const response = await getParkingLots();
			if (response?.data?.success) {
				setLots(response?.data?.data || []);
			} else {
				setLots([]);
			}
		} catch {
			setLots([]);
		}
	};

	const loadDevices = async (overrides = {}) => {
		setLoading(true);
		try {
			const lotIdValue = overrides.filterLotId ?? filterLotId;
			const statusValue = overrides.filterStatus ?? filterStatus;
			const keywordValue = overrides.keyword ?? keyword;
			const lotId = lotIdValue ? Number(lotIdValue) : null;
			const response = await getIoTDevices(lotId, statusValue, keywordValue);
			if (response?.data?.success) {
				setDevices(response?.data?.data || []);
			} else {
				setDevices([]);
				toast.error(response?.data?.message || 'Không tải được danh sách thiết bị');
			}
		} catch (error) {
			setDevices([]);
			toast.error(error?.response?.data?.message || 'Không tải được danh sách thiết bị');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void loadLots();
		void loadDevices();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		void loadDevices();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filterLotId, filterStatus, keyword]);

	const handleCreateSubmit = async (event) => {
		event.preventDefault();
		if (!createForm.mac_address.trim() || !createForm.device_name.trim()) {
			toast.error('Vui lòng nhập MAC và tên thiết bị');
			return;
		}
		setBusy(true);
		try {
			const response = await createIoTDevice({
				mac_address: createForm.mac_address.trim(),
				device_name: createForm.device_name.trim(),
				lot_id: createForm.lot_id ? Number(createForm.lot_id) : null,
			});
			if (response?.data?.success) {
				toast.success(response?.data?.message || 'Tạo thiết bị thành công');
				setShowCreateModal(false);
				setCreateForm(emptyCreateForm);
				await loadDevices();
				return;
			}
			toast.error(response?.data?.message || 'Tạo thiết bị thất bại');
		} catch (error) {
			toast.error(error?.response?.data?.message || 'Tạo thiết bị thất bại');
		} finally {
			setBusy(false);
		}
	};

	const openUpdateModal = (device) => {
		setSelectedDevice(device);
		setUpdateForm({
			device_name: device.device_name || '',
			status: device.status || 'ACTIVE',
			lot_id: device.lot_id ? String(device.lot_id) : '',
		});
		setShowUpdateModal(true);
	};

	const handleUpdateSubmit = async (event) => {
		event.preventDefault();
		if (!selectedDevice) return;
		if (!updateForm.device_name.trim()) {
			toast.error('Tên thiết bị không được để trống');
			return;
		}
		setBusy(true);
		try {
			const response = await updateIoTDevice(selectedDevice.mac_address, {
				device_name: updateForm.device_name.trim(),
				status: updateForm.status,
				lot_id: updateForm.lot_id ? Number(updateForm.lot_id) : null,
			});
			if (response?.data?.success) {
				toast.success(response?.data?.message || 'Cập nhật thiết bị thành công');
				setShowUpdateModal(false);
				setSelectedDevice(null);
				await loadDevices();
				return;
			}
			toast.error(response?.data?.message || 'Cập nhật thiết bị thất bại');
		} catch (error) {
			toast.error(error?.response?.data?.message || 'Cập nhật thiết bị thất bại');
		} finally {
			setBusy(false);
		}
	};

	return (
		<main className="admin-management-page">
			<header className="admin-management-header">
				<button className="admin-back-btn" type="button" onClick={() => navigate('/map')}>
					<FaArrowLeft /> Quay lại bản đồ
				</button>
				<div>
					<p className="admin-eyebrow">Admin tools</p>
					<h1>Quản lý thiết bị</h1>
					<p className="admin-subtitle">Theo dõi thiết bị IoT, lọc theo bãi đỗ và cập nhật trạng thái.</p>
				</div>
				<div className="admin-profile-chip">
					<FaTabletAlt />
					<span>{[currentUser?.first_name, currentUser?.last_name].filter(Boolean).join(' ') || currentUser?.email || 'Quản trị viên'}</span>
				</div>
			</header>

			<section className="admin-toolbar admin-toolbar--stacked">
				<div className="admin-search-grid">
					<div className="admin-search-box">
						<select className="admin-input" value={filterLotId} onChange={(event) => setFilterLotId(event.target.value)}>
							<option value="">Tất cả bãi đỗ</option>
							{lots.map((lot) => <option key={lot.id} value={lot.id}>{lot.name}</option>)}
						</select>
					</div>
					<div className="admin-search-box">
						<select className="admin-input" value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)}>
							<option value="">Tất cả trạng thái</option>
							{DEVICE_STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
						</select>
					</div>
					<div className="admin-search-box">
						<FaSearch />
						<input
							type="text"
							placeholder="Tìm theo MAC hoặc tên thiết bị"
							value={searchTerm}
							onChange={(event) => setSearchTerm(event.target.value)}
							onKeyDown={(event) => {
								if (event.key === 'Enter') {
									event.preventDefault();
									setKeyword(searchTerm.trim());
								}
							}}
						/>
						{(searchTerm || keyword) && (
							<button type="button" className="admin-icon-btn" onClick={() => { setSearchTerm(''); setKeyword(''); }}>
								<IoMdClose />
							</button>
						)}
					</div>
				</div>

				<div className="admin-toolbar-actions">
					<button type="button" className="admin-secondary-btn" onClick={() => loadDevices()} disabled={loading}>
						<FaSyncAlt /> Làm mới
					</button>
					<button type="button" className="admin-primary-btn" onClick={() => setShowCreateModal(true)}>
						<FaPlus /> Thêm thiết bị
					</button>
				</div>
			</section>

			<section className="admin-table-card">
				{loading ? (
					<div className="admin-empty-state">Đang tải dữ liệu...</div>
				) : devices.length ? (
					<div className="admin-table-wrap">
						<table className="admin-table">
							<thead>
								<tr>
									<th>MAC</th>
									<th>Tên thiết bị</th>
									<th>Bãi đỗ</th>
									<th>Trạng thái</th>
									<th>Last seen</th>
									<th>Thao tác</th>
								</tr>
							</thead>
							<tbody>
								{devices.map((device) => (
									<tr key={device.mac_address}>
										<td>{device.mac_address}</td>
										<td>{device.device_name || '---'}</td>
										<td>{device.lot_name || (device.lot_id ? lotNameMap.get(device.lot_id) : '---')}</td>
										<td><span className={`admin-status admin-status--${String(device.status || '').toLowerCase()}`}>{device.status}</span></td>
										<td>{device.last_seen ? new Date(device.last_seen).toLocaleString('vi-VN', { hour12: false }) : '---'}</td>
										<td>
											<button type="button" className="admin-outline-btn" onClick={() => openUpdateModal(device)}>
												Cập nhật
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				) : (
					<div className="admin-empty-state">Không có thiết bị phù hợp.</div>
				)}
			</section>

			{showCreateModal && (
				<ModalShell title="Thêm thiết bị IoT" onClose={() => setShowCreateModal(false)}>
					<form className="admin-modal-body" onSubmit={handleCreateSubmit}>
						<input className="admin-input" placeholder="MAC address" value={createForm.mac_address} onChange={(event) => setCreateForm((prev) => ({ ...prev, mac_address: event.target.value }))} />
						<input className="admin-input" placeholder="Tên thiết bị" value={createForm.device_name} onChange={(event) => setCreateForm((prev) => ({ ...prev, device_name: event.target.value }))} />
						<select className="admin-input" value={createForm.lot_id} onChange={(event) => setCreateForm((prev) => ({ ...prev, lot_id: event.target.value }))}>
							<option value="">Chưa gán bãi đỗ</option>
							{lots.map((lot) => <option key={lot.id} value={lot.id}>{lot.name}</option>)}
						</select>
						<div className="admin-modal-actions">
							<button type="button" className="admin-secondary-btn" onClick={() => setShowCreateModal(false)}>Hủy</button>
							<button type="submit" className="admin-primary-btn" disabled={busy}>{busy ? 'Đang tạo...' : 'Tạo mới'}</button>
						</div>
					</form>
				</ModalShell>
			)}

			{showUpdateModal && selectedDevice && (
				<ModalShell title={`Cập nhật thiết bị: ${selectedDevice.mac_address}`} onClose={() => setShowUpdateModal(false)}>
					<form className="admin-modal-body" onSubmit={handleUpdateSubmit}>
						<input className="admin-input" placeholder="Tên thiết bị" value={updateForm.device_name} onChange={(event) => setUpdateForm((prev) => ({ ...prev, device_name: event.target.value }))} />
						<select className="admin-input" value={updateForm.status} onChange={(event) => setUpdateForm((prev) => ({ ...prev, status: event.target.value }))}>
							{DEVICE_STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
						</select>
						<select className="admin-input" value={updateForm.lot_id} onChange={(event) => setUpdateForm((prev) => ({ ...prev, lot_id: event.target.value }))}>
							<option value="">Chưa gán bãi đỗ</option>
							{lots.map((lot) => <option key={lot.id} value={lot.id}>{lot.name}</option>)}
						</select>
						<div className="admin-modal-actions">
							<button type="button" className="admin-secondary-btn" onClick={() => setShowUpdateModal(false)}>Hủy</button>
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
			<div className="admin-modal" onClick={(event) => event.stopPropagation()}>
				<div className="admin-modal-header">
					<h3>{title}</h3>
					<button type="button" className="admin-icon-btn" onClick={onClose}><IoMdClose /></button>
				</div>
				{children}
			</div>
		</div>
	);
}

export default ManageDevices;
