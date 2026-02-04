import React from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import "./MainLayout.css";

const MainLayout = ({ children }) => {
  return (
    <div className="main-layout">
      <Sidebar />
      <main className="main-content">
        <div className="content-container">{children}</div>
      </main>
    </div>
  );
};

export default MainLayout;
