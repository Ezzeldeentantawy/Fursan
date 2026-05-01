import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/register';
import Login from './pages/login';
import AdminGuard from './components/AdminGuard';
import AdminDashboard from './pages/admin/dashboard';
import CreateEmployerAcc from './pages/admin/createEmployerAcc';
import EmployerGuard from './components/EmployerGuard';
import EmployerDashboard from './pages/Employer/Dashboard';
import CreateJob from './pages/Employer/createJob';


function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path="/test" element="<p>test routes<p/>" />
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          {/* Protect admin routes */}
          <Route element={<AdminGuard />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/dashboard/create-employer-account" element={<CreateEmployerAcc />} />
          </Route>
          {/* Protect employer routes */}
          <Route element={<EmployerGuard />}>
            <Route path="/employer/dashboard" element={<EmployerDashboard />} />
            <Route path="/employer/dashboard/create-job" element={<CreateJob />} />/
          </Route>
        </Routes>
      </Router>
    </>
  )
}

export default App;
