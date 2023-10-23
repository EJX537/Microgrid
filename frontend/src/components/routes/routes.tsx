import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/dashboard/dashboard';
import Page404 from '../page404';

const RoutesProvider = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="*" element={<Page404 />} />
    </Routes>
  );
};

export default RoutesProvider;
