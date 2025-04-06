import React, { useState, useEffect } from "react";
import axios from "axios";
import PageLayout from "@/components/Guide/layout/Layout";
import ScholarsList from "@/components/Guide/Scholars/ScholarList";
import ScholarDetail from "@/components/Guide/Scholars/ScholarDetail";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const ScholarProfiles = () => {
  const [selectedScholarRollNo, setSelectedScholarRollNo] = useState(null);
  const [scholars, setScholars] = useState([]);
  const [selectedScholar, setSelectedScholar] = useState(null); // Store full details
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [guideEmail, setGuideEmail] = useState("");
  const [guideId, setGuideId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  // Fetch Guide Email
  useEffect(() => {
    const fetchGuideEmail = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/user/super", { withCredentials: true });
        setGuideEmail(response.data.email || "");
      } catch (error) {
        console.error("Error fetching guide email:", error);
        showSnackbar("Failed to fetch guide email");
      }
    };
    fetchGuideEmail();
  }, []);

  // Fetch Guide ID
  useEffect(() => {
    if (!guideEmail) return;
    const fetchGuideId = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/guides/email/${guideEmail}`, { withCredentials: true });
        setGuideId(response.data || null);
      } catch (error) {
        console.error("Error fetching guide ID:", error);
        showSnackbar("Failed to fetch guide ID");
      }
    };
    fetchGuideId();
  }, [guideEmail]);

  // Fetch Scholars Under Guide
  useEffect(() => {
    if (!guideId) return;
    const fetchScholars = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/guides/${guideId}/students`, { withCredentials: true });
        setScholars(response.data || []);
      } catch (error) {
        console.error("Error fetching scholars:", error);
        setError("Failed to load scholars");
        showSnackbar("Failed to load scholars");
      } finally {
        setLoading(false);
      }
    };
    fetchScholars();
  }, [guideId]);

  // Fetch full student details when a scholar is selected
  useEffect(() => {
    if (!selectedScholarRollNo) {
      setSelectedScholar(null);
      return;
    }

    const fetchStudentProfile = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/students/${selectedScholarRollNo}`, {
          withCredentials: true,
        });
        console.log("Profile response:", response.data);
        
        setSelectedScholar(response.data);
      } catch (error) {
        console.error("Error fetching full student profile:", error);
        showSnackbar("Failed to load student details");
      }
    };

    fetchStudentProfile();
  }, [selectedScholarRollNo]);

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Student Profiles</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ScholarsList
              scholars={scholars}
              selectedScholarId={selectedScholarRollNo} // Pass rollNo instead of id
              onScholarSelect={setSelectedScholarRollNo} // Update with rollNo
            />
          </div>
          <div className="lg:col-span-2">
            {selectedScholar ? (
              <ScholarDetail scholar={selectedScholar} />
            ) : (
              <div className="h-full flex items-center justify-center p-8 border rounded-lg bg-secondary/30">
                <p className="text-muted-foreground">
                  Select a scholar from the list to view their profile.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ScholarProfiles;
