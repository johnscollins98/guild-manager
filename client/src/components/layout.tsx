import { Outlet } from 'react-router-dom';
import Control from './control';

const Layout = () => {
  return (
    <>
      <Control />
      <div className="outlet">
        <Outlet />
      </div>
    </>
  );
};

export default Layout;
