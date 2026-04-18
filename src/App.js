import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import ProtectedRoute from "./components/common/ProtectedRoute";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TrackComplaintPage from "./pages/TrackComplaintPage";
import AddComplaintPage from "./pages/AddComplaintPage";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import WorkerDashboard from "./pages/WorkerDashboard";
import ComplaintDetailsPage from "./pages/ComplaintDetailsPage";
import { ROLES } from "./utils/constants";

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="container">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/track" element={<TrackComplaintPage />} />

            <Route
              path="/dashboard/user"
              element={
                <ProtectedRoute roles={[ROLES.USER]}>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute roles={[ROLES.ADMIN]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/worker"
              element={
                <ProtectedRoute roles={[ROLES.WORKER]}>
                  <WorkerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/complaints/new"
              element={
                <ProtectedRoute roles={[ROLES.USER]}>
                  <AddComplaintPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/complaints/:id"
              element={
                <ProtectedRoute roles={[ROLES.USER]}>
                  <ComplaintDetailsPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
        <ToastContainer position="top-right" newestOnTop closeOnClick />
      </div>
    </Router>
  );
}

export default App;
