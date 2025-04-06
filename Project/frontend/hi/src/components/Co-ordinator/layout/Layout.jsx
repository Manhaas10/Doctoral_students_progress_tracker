
import React, { ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";


const PageLayout = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header studentName="Amit Praseed" />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default PageLayout;