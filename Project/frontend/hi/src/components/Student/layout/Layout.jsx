import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Don't forget to import axios
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [student, setStudent] = useState(null); // Initialize student state

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/user/profile', {
          withCredentials: true
        });

        if (response.data && response.data.name && response.data.email && response.data.rollNumber) {
          setStudent({
            name: response.data.name,
            email: response.data.email,
            rollNumber: response.data.rollNumber,
            orcidId: response.data.orcid || "",
            researchArea: response.data.areaofresearch || ""
          });
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar (Always Visible) */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header studentName={student?.name || "Student"} /> {/* Handle null case safely */}
        <main className="flex-1 p-6 overflow-x-hidden animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
