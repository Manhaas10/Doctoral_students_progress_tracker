import React, { useEffect, useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
// import { useState, useEffect } from 'react';
import axios from 'axios'; // Don't forget to import axios

const PageLayout = ({ children }) => {
    const [guideData, setGuideData] = useState([]);
    const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
  useEffect(() => {
    const fetchGuideData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8080/api/user/super', {
          withCredentials: true
        });

        if (response.data && response.data.name && response.data.email) {
          setGuideData(prevData => ({
            ...prevData,
            name: response.data.name,
            email: response.data.email
          }));
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching guide data:', err);
        setError('Failed to load guide data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchGuideData();
  }, []);
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header studentName={guideData?.name || 'Student'} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default PageLayout;
