import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import AddApplicantForm from "./pages/AddApplicantForm";
import ApplicantDetailsPage from "./pages/ApplicantDetailsPage";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
      <Route path="/login" element={<PublicRoute element={<LoginPage />} />} />
        <Route path="/hr_ats" element={<PrivateRoute element={<Dashboard />} />} />
        <Route path="/add-applicant" element={<PrivateRoute element={<AddApplicantForm />} />} />
        <Route path="/applicant/:id" element={<PrivateRoute element={<ApplicantDetailsPage />} />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;