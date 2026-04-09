import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

import Home from "./Components/Home";
import Login from "./Components/Login";
import Register from "./Components/Eregister";
import ForgotPassword from "./Components/ForgotPassword";
import ResetPassword from "./Components/ResetPassword";
import NotFound from "./Components/NotFound";

const EmployeeDashboard = lazy(() => import("./Components/EmployeeDashboard"));
const AdminDashboard = lazy(() => import("./Components/AdminDashboard"));
const EmployeeSalary = lazy(() => import("./Components/EmployeePayroll"));
const EmployeeAttendance = lazy(() => import("./Components/EmployeeAttendance"));
const LeaveApplication = lazy(() => import("./Components/LeaveApplication"));
const ApplyLeaveForm = lazy(() => import("./Components/ApplyLeaveForm"));
const LeaveView = lazy(() => import("./Components/LeaveView"));
const AdminLogin = lazy(() => import("./Components/AdminLogin"));
const UpdateProfile = lazy(() => import("./Components/UpdateProfile"));
const AdminProfileUpdate = lazy(() => import("./Components/AdminProfileUpdate"));
const EmployeeAppraisal = lazy(() => import("./Components/EmployeeAppraisal"));
const ManagerReviewPage = lazy(() => import("./Components/ManagerReviewPage"));

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/eregister" element={<Register />} />
      <Route path="/forget" element={<ForgotPassword />} />
      <Route path="/reset/:token" element={<ResetPassword />} />

      <Route
        path="/employeedashboard"
        element={
          <Suspense fallback={<div>Loading...</div>}>
            <EmployeeDashboard />
          </Suspense>
        }
      />
      <Route
        path="/admindashboard"
        element={
          <Suspense fallback={<div>Loading...</div>}>
            <AdminDashboard />
          </Suspense>
        }
      />
      <Route
        path="/employeepayroll"
        element={
          <Suspense fallback={<div>Loading...</div>}>
            <EmployeeSalary />
          </Suspense>
        }
      />
      <Route
        path="/employeeattendance"
        element={
          <Suspense fallback={<div>Loading...</div>}>
            <EmployeeAttendance />
          </Suspense>
        }
      />
      <Route
        path="/leaveapplication"
        element={
          <Suspense fallback={<div>Loading...</div>}>
            <LeaveApplication />
          </Suspense>
        }
      />
      <Route
        path="/apply-leave/:type"
        element={
          <Suspense fallback={<div>Loading...</div>}>
            <ApplyLeaveForm />
          </Suspense>
        }
      />
      <Route
      path="/leave-view/:id"
      element={
        <Suspense fallback={<div>Loading...</div>}>
          <LeaveView />
        </Suspense>
      }
/>
      <Route
        path="/adminlogin"
        element={
          <Suspense fallback={<div>Loading...</div>}>
            <AdminLogin />
          </Suspense>
        }
      />
      <Route
        path="/update"
        element={
          <Suspense fallback={<div>Loading...</div>}>
            <UpdateProfile />
          </Suspense>
        }
      />
      <Route
        path="/admin-profile"
        element={
          <Suspense fallback={<div>Loading...</div>}>
            <AdminProfileUpdate />
          </Suspense>
        }
      />
      <Route
        path="/employeeappraisal"
        element={
          <Suspense fallback={<div>Loading...</div>}>
            <EmployeeAppraisal />
          </Suspense>
        }
      />
      <Route
        path="/managerreview"
        element={
          <Suspense fallback={<div>Loading...</div>}>
            <ManagerReviewPage />
          </Suspense>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
