import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { doLogout } from '../../redux/slices/userSlice';
import { logout } from "../../services/apiServices";
import { toast } from 'react-toastify';
import { BsJustify, BsList, BsPersonCircle, BsKey, BsBoxArrowRight } from "react-icons/bs";

type UserHeaderProps = {
  onToggleCollapse: () => void;
  onToggleMobile?: () => void;
};

const UserHeader = ({ onToggleCollapse, onToggleMobile }: UserHeaderProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { account } = useAppSelector((state) => state.user);

  const [isMobile, setIsMobile] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Xử lý responsive sidebar
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 900);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Xử lý click ra ngoài để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Xử lý đăng xuất
  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      toast.error('Logout request failed');
    }
    dispatch(doLogout());
    navigate('/login');
  };

  // Xử lý chuyển trang đổi mật khẩu
  const handleChangePassword = () => {
    setShowDropdown(false);
    navigate('/change-password');
  };

  return (
    <header className="user-header">
      <div className="user-header__left">
        {!isMobile && (
          <button className="btn-toggle" onClick={onToggleCollapse} aria-label="Toggle sidebar">
            <BsJustify style={{ justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem' }} />
          </button>
        )}

        {isMobile && (
          <button className="btn-mobile" onClick={() => onToggleMobile && onToggleMobile()} aria-label="Open mobile menu">
            <BsList size={20} style={{ justifyContent: 'center', alignItems: 'center' }} />
          </button>
        )}

        <span className="header-title">Trang quản lý của User</span>
      </div>

      <div className="user-header__right" ref={dropdownRef}>
        {/* Khu vực Avatar */}
        <div
          className="user-profile"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          {/* Bạn có thể thay BsPersonCircle bằng thẻ <img> nếu có link avatar từ API */}
          <BsPersonCircle className="avatar-icon" size={32} />
          <span className="user-user">Xin chào, {account?.first_name || 'User'}</span>
        </div>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="user-dropdown">
            <div className="dropdown-item" onClick={handleChangePassword}>
              <BsKey className="dropdown-icon" />
              Đổi mật khẩu
            </div>
            <div className="dropdown-divider"></div>
            <div className="dropdown-item text-danger" onClick={handleLogout}>
              <BsBoxArrowRight className="dropdown-icon" />
              Đăng xuất
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default UserHeader;