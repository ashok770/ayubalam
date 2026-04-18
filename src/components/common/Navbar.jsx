import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../utils/constants";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo-link">
          <h1 className="logo">Complaint Management</h1>
        </Link>
        <ul className="nav-menu">
          <li>
            <NavLink to="/" end>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/track">Track</NavLink>
          </li>
          {isAuthenticated && user?.role === ROLES.USER && (
            <>
              <li>
                <NavLink to="/complaints/new">Submit</NavLink>
              </li>
              <li>
                <NavLink to="/dashboard/user">My dashboard</NavLink>
              </li>
            </>
          )}
          {isAuthenticated && user?.role === ROLES.ADMIN && (
            <li>
              <NavLink to="/dashboard/admin">Admin</NavLink>
            </li>
          )}
          {isAuthenticated && user?.role === ROLES.WORKER && (
            <li>
              <NavLink to="/dashboard/worker">Worker</NavLink>
            </li>
          )}
          {!isAuthenticated && (
            <>
              <li>
                <NavLink to="/login">Login</NavLink>
              </li>
              <li>
                <NavLink to="/register">Sign up</NavLink>
              </li>
            </>
          )}
          {isAuthenticated && (
            <li className="nav-user">
              <span className="nav-name">{user?.name}</span>
              <button type="button" className="btn-logout" onClick={handleLogout}>
                Log out
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
