import { Outlet } from 'react-router-dom';
import NavBar from './nav-bar';

const Layout = () => {
  return (
    <>
      <NavBar />
      <div className="outlet">
        <Outlet />
      </div>
    </>
  );
};

export default Layout;
