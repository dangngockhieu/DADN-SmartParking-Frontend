import { useEffect, useMemo, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { FaPlus, FaSearch } from "react-icons/fa";
import { BsFillPencilFill } from "react-icons/bs";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-toastify";

import type { IoTDevice, IoTDeviceStatus, Lot } from "../../../interfaces";
import {
  createIoTDevice,
  getAllLot,
  getIoTDevices,
  updateIoTDevice,
} from "../../../services/apiServices";

import "./ManageDevice.scss";

type ApiResponse<T = unknown> = {
  success?: boolean;
  message?: string;
  data?: T;
};

type CreateForm = {
  mac_address: string;
  device_name: string;
  lot_id: string;
};

type UpdateForm = {
  device_name: string;
  status: IoTDeviceStatus;
  lot_id: string;
};

const DEVICE_STATUS_OPTIONS: Array<{ value: IoTDeviceStatus; label: string }> = [
  { value: "ACTIVE", label: "Hoạt động" },
  { value: "INACTIVE", label: "Tạm dừng" },
  { value: "ERROR", label: "Lỗi" },
];

const statusClass = (status: IoTDeviceStatus) => {
  if (status === "ACTIVE") return "status-pill status-pill--active";
  if (status === "INACTIVE") return "status-pill status-pill--inactive";
  return "status-pill status-pill--error";
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN", { hour12: false });
};

const ManageDevice = () => {
  const [lots, setLots] = useState<Lot[]>([]);
  const [devices, setDevices] = useState<IoTDevice[]>([]);

  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updatingMac, setUpdatingMac] = useState<string | null>(null);

  const [filterLotId, setFilterLotId] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [keyword, setKeyword] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<IoTDevice | null>(null);

  const [createForm, setCreateForm] = useState<CreateForm>({
    mac_address: "",
    device_name: "",
    lot_id: "",
  });

  const [updateForm, setUpdateForm] = useState<UpdateForm>({
    device_name: "",
    status: "ACTIVE",
    lot_id: "",
  });

  const lotNameMap = useMemo(
    () =>
      new Map<number, string>(lots.map((lot) => [lot.id, `${lot.name} - ${lot.location}`])),
    [lots]
  );

  const loadLots = async () => {
    try {
      const res = await getAllLot();
      const payload = res?.data as ApiResponse<Lot[]> | undefined;
      if (!payload?.success) {
        setLots([]);
        return;
      }
      setLots(Array.isArray(payload.data) ? payload.data : []);
    } catch {
      setLots([]);
    }
  };

  const loadDevices = async () => {
    try {
      setLoading(true);
      const lotIdNum =
        filterLotId.trim() === "" ? null : Number.parseInt(filterLotId, 10);
      const res = await getIoTDevices(
        lotIdNum,
        filterStatus || undefined,
        keyword || undefined
      );
      const payload = res?.data as ApiResponse<unknown> | undefined;
      if (!payload?.success) {
        toast.error(payload?.message || "Không lấy được danh sách thiết bị");
        setDevices([]);
        return;
      }

      const raw = payload.data;
      if (Array.isArray(raw)) {
        setDevices(raw as IoTDevice[]);
        return;
      }

      if (raw && typeof raw === "object" && Array.isArray((raw as { data?: unknown }).data)) {
        setDevices((raw as { data: IoTDevice[] }).data);
        return;
      }

      if (raw && typeof raw === "object" && Array.isArray((raw as { devices?: unknown }).devices)) {
        setDevices((raw as { devices: IoTDevice[] }).devices);
        return;
      }

      setDevices([]);
    } catch {
      toast.error("Không lấy được danh sách thiết bị");
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadInitialLots = async () => {
      await loadLots();
    };
    loadInitialLots();
  }, []);

  useEffect(() => {
    const loadInitialDevices = async () => {
      await loadDevices();
    };
    loadInitialDevices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterLotId, filterStatus, keyword]);


  const openUpdateModal = (device: IoTDevice) => {
    setSelectedDevice(device);
    setUpdateForm({
      device_name: device.device_name || "",
      status: device.status,
      lot_id: device.lot_id ? String(device.lot_id) : "",
    });
    setShowUpdateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setCreateForm({
      mac_address: "",
      device_name: "",
      lot_id: "",
    });
  };

  const closeUpdateModal = () => {
    setShowUpdateModal(false);
    setSelectedDevice(null);
    setUpdateForm({
      device_name: "",
      status: "ACTIVE",
      lot_id: "",
    });
  };

  const handleCreateDevice = async () => {
    const mac = createForm.mac_address.trim();
    const deviceName = createForm.device_name.trim();
    const lotId =
      createForm.lot_id.trim() === ""
        ? null
        : Number.parseInt(createForm.lot_id, 10);

    if (!mac || !deviceName) {
      toast.error("Vui lòng nhập đầy đủ MAC và tên thiết bị");
      return;
    }

    if (createForm.lot_id.trim() !== "" && (!lotId || lotId <= 0)) {
      toast.error("Lot không hợp lệ");
      return;
    }

    try {
      setCreating(true);
      const res = await createIoTDevice({
        mac_address: mac,
        device_name: deviceName,
        lot_id: lotId,
      });

      if (!res?.data?.success) {
        toast.error(res?.data?.message || "Tạo thiết bị thất bại");
        return;
      }

      toast.success(res?.data?.message || "Tạo thiết bị thành công");
      closeCreateModal();
      await loadDevices();
    } catch {
      toast.error("Tạo thiết bị thất bại");
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateDevice = async () => {
    if (!selectedDevice) return;

    const deviceName = updateForm.device_name.trim();
    const lotId =
      updateForm.lot_id.trim() === ""
        ? null
        : Number.parseInt(updateForm.lot_id, 10);

    if (!deviceName) {
      toast.error("Tên thiết bị không được để trống");
      return;
    }

    if (updateForm.lot_id.trim() !== "" && (!lotId || lotId <= 0)) {
      toast.error("Lot không hợp lệ");
      return;
    }

    try {
      setUpdatingMac(selectedDevice.mac_address);
      const res = await updateIoTDevice(selectedDevice.mac_address, {
        device_name: deviceName,
        status: updateForm.status,
        lot_id: lotId,
      });

      if (!res?.data?.success) {
        toast.error(res?.data?.message || "Cập nhật thiết bị thất bại");
        return;
      }

      toast.success(res?.data?.message || "Cập nhật thiết bị thành công");
      closeUpdateModal();
      await loadDevices();
    } catch {
      toast.error("Cập nhật thiết bị thất bại");
    } finally {
      setUpdatingMac(null);
    }
  };

  return (
    <div className="manage-device-container">
      <div className="header">
        <div>
          <h2 className="title">Quản lý IoT Device</h2>
          <p className="sub-title">Theo dõi và quản lý thiết bị trong hệ thống</p>
        </div>

        <div className="actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="Tìm theo MAC hoặc tên thiết bị"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setKeyword(searchTerm.trim());
              }}
            />
            {keyword ? (
              <button
                className="search-clear-btn"
                onClick={() => {
                  setSearchTerm("");
                  setKeyword("");
                }}
              >
                <IoMdClose />
              </button>
            ) : (
              <button className="search-icon-btn" onClick={() => setKeyword(searchTerm.trim())}>
                <FaSearch />
              </button>
            )}
          </div>

          <select value={filterLotId} onChange={(e) => setFilterLotId(e.target.value)}>
            <option value="">Tất cả lot</option>
            {lots.map((lot) => (
              <option key={lot.id} value={lot.id}>
                {lot.name} - {lot.location}
              </option>
            ))}
          </select>

          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            {DEVICE_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button className="btn-create" onClick={() => setShowCreateModal(true)}>
            <FaPlus /> Thêm Device
          </button>
        </div>
      </div>

      <div className="table-card">
        <table className="table table-hover table-bordered">
          <thead>
            <tr>
              <th>MAC</th>
              <th>Tên thiết bị</th>
              <th>Trạng thái</th>
              <th>Lot</th>
              <th>Last seen</th>
              <th>Updated</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="text-center">
                  Đang tải danh sách thiết bị...
                </td>
              </tr>
            )}

            {!loading &&
              devices.map((device) => (
                <tr key={device.mac_address}>
                  <td>{device.mac_address}</td>
                  <td>{device.device_name}</td>
                  <td>
                    <span className={statusClass(device.status)}>{device.status}</span>
                  </td>
                  <td>
                    {device.lot_name ||
                      (device.lot_id ? lotNameMap.get(device.lot_id) || device.lot_id : "Chưa gán lot")}
                  </td>
                  <td>{formatDateTime(device.last_seen)}</td>
                  <td>{formatDateTime(device.updated_at)}</td>
                  <td>
                    <button className="btn btn-warning" onClick={() => openUpdateModal(device)}>
                      <BsFillPencilFill style={{ fontSize: "1rem" }} />
                    </button>
                  </td>
                </tr>
              ))}

            {!loading && devices.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center">
                  Không có thiết bị nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal show={showCreateModal} onHide={closeCreateModal} backdrop="static" className="device-modal">
        <Modal.Header closeButton>
          <Modal.Title>Thêm IoT Device</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            <label>MAC address</label>
            <input
              type="text"
              className="form-control"
              value={createForm.mac_address}
              onChange={(e) =>
                setCreateForm((prev) => ({ ...prev, mac_address: e.target.value }))
              }
            />
          </div>
          <div className="form-group mt-3">
            <label>Device name</label>
            <input
              type="text"
              className="form-control"
              value={createForm.device_name}
              onChange={(e) =>
                setCreateForm((prev) => ({ ...prev, device_name: e.target.value }))
              }
            />
          </div>
          <div className="form-group mt-3">
            <label>Lot</label>
            <select
              className="form-select"
              value={createForm.lot_id}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, lot_id: e.target.value }))}
            >
              <option value="">Không gán Lot</option>
              {lots.map((lot) => (
                <option key={lot.id} value={lot.id}>
                  {lot.name} - {lot.location}
                </option>
              ))}
            </select>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeCreateModal}>
            Đóng
          </Button>
          <Button variant="primary" onClick={handleCreateDevice} disabled={creating}>
            {creating ? "Đang tạo..." : "Tạo Device"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showUpdateModal} onHide={closeUpdateModal} backdrop="static" className="device-modal">
        <Modal.Header closeButton>
          <Modal.Title>Cập nhật IoT Device</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            <label>MAC address</label>
            <input
              type="text"
              className="form-control"
              value={selectedDevice?.mac_address || ""}
              disabled
            />
          </div>
          <div className="form-group mt-3">
            <label>Device name</label>
            <input
              type="text"
              className="form-control"
              value={updateForm.device_name}
              onChange={(e) =>
                setUpdateForm((prev) => ({ ...prev, device_name: e.target.value }))
              }
            />
          </div>
          <div className="form-group mt-3">
            <label>Status</label>
            <select
              className="form-select"
              value={updateForm.status}
              onChange={(e) =>
                setUpdateForm((prev) => ({
                  ...prev,
                  status: e.target.value as IoTDeviceStatus,
                }))
              }
            >
              {DEVICE_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group mt-3">
            <label>Lot</label>
            <select
              className="form-select"
              value={updateForm.lot_id}
              onChange={(e) => setUpdateForm((prev) => ({ ...prev, lot_id: e.target.value }))}
            >
              <option value="">Không gán Lot</option>
              {lots.map((lot) => (
                <option key={lot.id} value={lot.id}>
                  {lot.name} - {lot.location}
                </option>
              ))}
            </select>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeUpdateModal}>
            Đóng
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdateDevice}
            disabled={updatingMac === selectedDevice?.mac_address}
          >
            {updatingMac === selectedDevice?.mac_address ? "Đang lưu..." : "Lưu"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageDevice;
