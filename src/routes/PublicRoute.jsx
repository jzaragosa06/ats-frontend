import React from "react";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

const PublicRoute = ({ element }) => {
  const token = Cookies.get("token");

  return token ? <Navigate to="/" /> : element;
};

export default PublicRoute;