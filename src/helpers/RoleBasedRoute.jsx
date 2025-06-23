import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const RoleBasedRoute = ({ allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) return <Navigate to="/" replace />;

  return allowedRoles.includes(user.user_type) ? <Outlet /> : <Navigate to="/" replace />;
};

export default RoleBasedRoute;
