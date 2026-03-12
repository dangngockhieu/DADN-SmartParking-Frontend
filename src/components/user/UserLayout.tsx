import { useState } from 'react';
import UserSidebar from './UserSidebar';
import UserHeader from './UserHeader';
import { Outlet } from 'react-router-dom';
import './User.scss';

const UserLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapsed = () => setCollapsed((c) => !c);
  const toggleMobile = () => setMobileOpen((m) => !m);
  const closeMobile = () => setMobileOpen(false);

  return (
    <div className={`user-root ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <UserSidebar collapsed={collapsed} mobileOpen={mobileOpen} onCloseMobile={closeMobile} />
      <div className="user-main">
        <UserHeader onToggleCollapse={toggleCollapsed} onToggleMobile={toggleMobile} />
        <main className="user-content">
          <Outlet />
        </main>
      </div>
      {mobileOpen && <div className="user-overlay" onClick={closeMobile} aria-hidden="true" />}
    </div>
  );
};

export default UserLayout;

