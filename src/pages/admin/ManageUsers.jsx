import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEye, FaPlus, FaSearch, FaSyncAlt, FaUserShield } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import { toast } from 'react-toastify';
import { changeUserRole, createUser, getUsers } from '../../services/adminService';
import '../../styles/admin-management.css';

const PAGE_SIZE = 8;
const ROLE_OPTIONS = ['USER', 'MANAGER', 'ADMIN'];

const getStoredUser = () => {
	try {
		const rawUser = localStorage.getItem('user_info');
		return rawUser ? JSON.parse(rawUser) : null;
	} catch {
		return null;
	}
};

const emptyCreateForm = {
	email: '',
	password: '',
	first_name: '',
	last_name: '',
	role: 'USER',
};

function formatUserName(user) {
	return [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim() || '---';
}

function ManageUsers() {
	const navigate = useNavigate();
	const currentUser = useMemo(getStoredUser, []);
	const [users, setUsers] = useState([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [pageCount, setPageCount] = useState(0);
	const [searchTerm, setSearchTerm] = useState('');
	const [keyword, setKeyword] = useState('');
	const [loading, setLoading] = useState(false);
	const [selectedUser, setSelectedUser] = useState(null);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showRoleModal, setShowRoleModal] = useState(false);
	const [showViewModal, setShowViewModal] = useState(false);
	const [createForm, setCreateForm] = useState(emptyCreateForm);
	const [roleValue, setRoleValue] = useState('USER');
	const [createLoading, setCreateLoading] = useState(false);
	const [roleLoading, setRoleLoading] = useState(false);

	const fetchUsers = async (page = currentPage, nextKeyword = keyword) => {
		setLoading(true);
		try {
			const response = await getUsers(page, PAGE_SIZE, nextKeyword);
			if (response?.data?.success) {
				const payload = response.data.data;
				const list = payload?.users || [];
				const total = payload?.total || 0;
				setUsers(list);
				setPageCount(Math.max(1, Math.ceil(total / PAGE_SIZE)));
			} else {
				setUsers([]);
				setPageCount(0);
				toast.error(response?.data?.message || 'Không tải được danh sách người dùng');
			}
		} catch (error) {
			setUsers([]);
			setPageCount(0);
			toast.error(error?.response?.data?.message || 'Không tải được danh sách người dùng');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void fetchUsers(1, '');
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleSearchSubmit = async () => {
		setKeyword(searchTerm.trim());
		setCurrentPage(1);
		await fetchUsers(1, searchTerm.trim());
	};

	const handleClearSearch = async () => {
		setSearchTerm('');
		setKeyword('');
		setCurrentPage(1);
		await fetchUsers(1, '');
	};

	const handleCreateUser = async (event) => {
		event.preventDefault();
		setCreateLoading(true);
		try {
			const response = await createUser({
				email: createForm.email.trim(),
				password: createForm.password,
				first_name: createForm.first_name.trim(),
				last_name: createForm.last_name.trim(),
				role: createForm.role,
			});

			if (response?.data?.success) {
				toast.success(response?.data?.message || 'Tạo người dùng thành công');
				setShowCreateModal(false);
				setCreateForm(emptyCreateForm);
				await fetchUsers(1, keyword);
				setCurrentPage(1);
				return;
			}

			toast.error(response?.data?.message || 'Tạo người dùng thất bại');
		} catch (error) {
			toast.error(error?.response?.data?.message || 'Tạo người dùng thất bại');
		} finally {
			setCreateLoading(false);
		}
	};

	const handleChangeRole = async (event) => {
		event.preventDefault();
		if (!selectedUser) return;
		setRoleLoading(true);
		try {
			const response = await changeUserRole(selectedUser.id, roleValue);
			if (response?.data?.success) {
				toast.success(response?.data?.message || 'Cập nhật vai trò thành công');
				setShowRoleModal(false);
				setSelectedUser(null);
				await fetchUsers(currentPage, keyword);
				return;
			}
			toast.error(response?.data?.message || 'Cập nhật vai trò thất bại');
		} catch (error) {
			toast.error(error?.response?.data?.message || 'Cập nhật vai trò thất bại');
		} finally {
			setRoleLoading(false);
		}
	};

	const openRoleModal = (user) => {
		setSelectedUser(user);
		setRoleValue(user.role || 'USER');
		setShowRoleModal(true);
	};

	const openViewModal = (user) => {
		setSelectedUser(user);
		setShowViewModal(true);
	};

	const userDisplayName = useMemo(() => {
		return [currentUser?.first_name, currentUser?.last_name].filter(Boolean).join(' ') || currentUser?.email || 'Quản trị viên';
	}, [currentUser]);

	return (
		<main className="admin-management-page">
			<header className="admin-management-header">
				<button className="admin-back-btn" type="button" onClick={() => navigate('/map')}>
					<FaArrowLeft />
					Quay lại bản đồ
				</button>
				<div>
					<p className="admin-eyebrow">Admin tools</p>
					<h1>Quản lý người dùng</h1>
					<p className="admin-subtitle">Theo dõi danh sách tài khoản, tạo người dùng mới và thay đổi vai trò.</p>
				</div>
				<div className="admin-profile-chip">
					<FaUserShield />
					<span>{userDisplayName}</span>
				</div>
			</header>

			<section className="admin-toolbar">
				<div className="admin-search-box">
					<FaSearch />
					<input
						type="text"
						value={searchTerm}
						onChange={(event) => setSearchTerm(event.target.value)}
						placeholder="Tìm theo email"
						onKeyDown={(event) => {
							if (event.key === 'Enter') {
								event.preventDefault();
								void handleSearchSubmit();
							}
						}}
					/>
					{(searchTerm || keyword) && (
						<button type="button" className="admin-icon-btn" onClick={handleClearSearch}>
							<IoMdClose />
						</button>
					)}
				</div>
				<div className="admin-toolbar-actions">
					<button type="button" className="admin-secondary-btn" onClick={() => fetchUsers(currentPage, keyword)} disabled={loading}>
						<FaSyncAlt /> Làm mới
					</button>
					<button type="button" className="admin-primary-btn" onClick={() => setShowCreateModal(true)}>
						<FaPlus /> Tạo người dùng
					</button>
				</div>
			</section>

			<section className="admin-table-card">
				{loading ? (
					<div className="admin-empty-state">Đang tải dữ liệu...</div>
				) : users.length > 0 ? (
					<div className="admin-table-wrap">
						<table className="admin-table">
							<thead>
								<tr>
									<th>STT</th>
									<th>Họ tên</th>
									<th>Email</th>
									<th>Vai trò</th>
									<th>Thao tác</th>
								</tr>
							</thead>
							<tbody>
								{users.map((user, index) => (
									<tr key={user.id}>
										<td>{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
										<td>{formatUserName(user)}</td>
										<td>{user.email}</td>
										<td><span className={`admin-status admin-status--${String(user.role || '').toLowerCase()}`}>{user.role}</span></td>
										<td>
											<div className="admin-row-actions">
												<button type="button" className="admin-icon-btn" onClick={() => openViewModal(user)} title="Xem chi tiết">
													<FaEye />
												</button>
												<button type="button" className="admin-outline-btn" onClick={() => openRoleModal(user)}>
													Đổi vai trò
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				) : (
					<div className="admin-empty-state">Không tìm thấy người dùng phù hợp.</div>
				)}

				{pageCount > 1 && (
					<div className="admin-pagination">
						{Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
							<button
								key={page}
								type="button"
								className={`admin-page-btn ${page === currentPage ? 'active' : ''}`}
								onClick={() => {
									setCurrentPage(page);
									void fetchUsers(page, keyword);
								}}
							>
								{page}
							</button>
						))}
					</div>
				)}
			</section>

			{showCreateModal && (
				<div className="admin-modal-overlay" onClick={() => setShowCreateModal(false)}>
					<div className="admin-modal" onClick={(event) => event.stopPropagation()}>
						<div className="admin-modal-header">
							<h3>Tạo người dùng mới</h3>
							<button type="button" className="admin-icon-btn" onClick={() => setShowCreateModal(false)}>
								<IoMdClose />
							</button>
						</div>
						<form className="admin-modal-body" onSubmit={handleCreateUser}>
							<div className="admin-form-grid">
								<input required className="admin-input" placeholder="Email" value={createForm.email} onChange={(event) => setCreateForm((prev) => ({ ...prev, email: event.target.value }))} />
								<input required className="admin-input" placeholder="Mật khẩu" type="password" value={createForm.password} onChange={(event) => setCreateForm((prev) => ({ ...prev, password: event.target.value }))} />
								<input required className="admin-input" placeholder="Họ" value={createForm.first_name} onChange={(event) => setCreateForm((prev) => ({ ...prev, first_name: event.target.value }))} />
								<input required className="admin-input" placeholder="Tên" value={createForm.last_name} onChange={(event) => setCreateForm((prev) => ({ ...prev, last_name: event.target.value }))} />
								<select className="admin-input" value={createForm.role} onChange={(event) => setCreateForm((prev) => ({ ...prev, role: event.target.value }))}>
									{ROLE_OPTIONS.map((role) => <option key={role} value={role}>{role}</option>)}
								</select>
							</div>
							<div className="admin-modal-actions">
								<button type="button" className="admin-secondary-btn" onClick={() => setShowCreateModal(false)}>Hủy</button>
								<button type="submit" className="admin-primary-btn" disabled={createLoading}>{createLoading ? 'Đang tạo...' : 'Tạo mới'}</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{showRoleModal && selectedUser && (
				<div className="admin-modal-overlay" onClick={() => setShowRoleModal(false)}>
					<div className="admin-modal" onClick={(event) => event.stopPropagation()}>
						<div className="admin-modal-header">
							<h3>Đổi vai trò: {selectedUser.email}</h3>
							<button type="button" className="admin-icon-btn" onClick={() => setShowRoleModal(false)}>
								<IoMdClose />
							</button>
						</div>
						<form className="admin-modal-body" onSubmit={handleChangeRole}>
							<label className="admin-field-label">Vai trò</label>
							<select className="admin-input" value={roleValue} onChange={(event) => setRoleValue(event.target.value)}>
								{ROLE_OPTIONS.map((role) => <option key={role} value={role}>{role}</option>)}
							</select>
							<div className="admin-modal-actions">
								<button type="button" className="admin-secondary-btn" onClick={() => setShowRoleModal(false)}>Hủy</button>
								<button type="submit" className="admin-primary-btn" disabled={roleLoading}>{roleLoading ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{showViewModal && selectedUser && (
				<div className="admin-modal-overlay" onClick={() => setShowViewModal(false)}>
					<div className="admin-modal" onClick={(event) => event.stopPropagation()}>
						<div className="admin-modal-header">
							<h3>Chi tiết người dùng</h3>
							<button type="button" className="admin-icon-btn" onClick={() => setShowViewModal(false)}>
								<IoMdClose />
							</button>
						</div>
						<div className="admin-modal-body admin-detail-grid">
							<div><span>Họ tên</span><strong>{formatUserName(selectedUser)}</strong></div>
							<div><span>Email</span><strong>{selectedUser.email}</strong></div>
							<div><span>Vai trò</span><strong>{selectedUser.role}</strong></div>
							<div><span>ID</span><strong>{selectedUser.id}</strong></div>
						</div>
					</div>
				</div>
			)}
		</main>
	);
}

export default ManageUsers;
