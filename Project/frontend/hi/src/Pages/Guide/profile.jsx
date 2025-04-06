import React, { useState, useEffect } from "react";
import PageLayout from "@/components/Guide/layout/Layout";
import ProfileOverview from "@/components/Guide/profile/ProfileOverview";
import ScholarsList from "@/components/Guide/profile/ScholarsList";
import axios from 'axios';

// Mock data - Keeping all other fields unchanged
const mockGuideData = {
  designation: "Associate Professor",
  department: "Department of Computer Science and Engineering",
  phone: "+91 9876543210",
  address: "Room 304, CSE Block, University Campus, Bangalore - 560012",
  expertise: [
    "Artificial Intelligence",
    "Machine Learning",
    "Natural Language Processing",
    "Computer Vision",
    "Data Mining"
  ],
  totalScholars: 12,
  activeScholars: 8,
  completedScholars: 4
};

const Profileg = () => {
  const [guideData, setGuideData] = useState(mockGuideData);
  const [guideEmail, setGuideEmail] = useState("");  
  const [guideId, setGuideId] = useState(null);
  const [scholars, setScholars] = useState([]);
  const [selectedScholarRollNo, setSelectedScholarRollNo] = useState(null);
  const [selectedScholar, setSelectedScholar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const showSnackbar = (message) => {
    alert(message); // Temporary fix, replace with actual snackbar
  };

  // Fetch Guide Data
  useEffect(() => {
    const fetchGuideData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8080/api/user/super', {
          withCredentials: true
        });

        console.log("Guide Data Response:", response.data);

        if (response.data && response.data.name && response.data.email) {
          setGuideData(prevData => ({
            ...prevData,
            name: response.data.name,
            email: response.data.email
          }));
          setGuideEmail(response.data.email);
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

  // Fetch Guide ID
  useEffect(() => {
    if (!guideEmail) return;

    const fetchGuideId = async () => {
      try {
        setLoading(true); // Ensure loading is set before request
        const response = await axios.get(`http://localhost:8080/api/guides/email/${guideEmail}`, { withCredentials: true });
        
        console.log("Guide ID Response:", response.data);

        if (response.data) {
          setGuideId(response.data);
        } else {
          throw new Error("Guide ID not found");
        }
      } catch (error) {
        console.error("Error fetching guide ID:", error);
        showSnackbar("Failed to fetch guide ID");
      } finally {
        setLoading(false);
      }
    };

    fetchGuideId();
  }, [guideEmail]);

  // Fetch Scholars Under Guide
  useEffect(() => {
    if (!guideId) return;

    const fetchScholars = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8080/api/guides/${guideId}/students`, { withCredentials: true });

        console.log("Scholars Response:", response.data);

        if (Array.isArray(response.data)) {
          setScholars(response.data);
        } else {
          throw new Error("Invalid scholar data received");
        }
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
        setLoading(true);
        const response = await axios.get(`http://localhost:8080/api/students/${selectedScholarRollNo}`, {
          withCredentials: true,
        });

        console.log("Student Profile Response:", response.data);

        setSelectedScholar(response.data);
      } catch (error) {
        console.error("Error fetching full student profile:", error);
        showSnackbar("Failed to load student details");
        setLoading(false);
      }
    };

    fetchStudentProfile();
  }, [selectedScholarRollNo]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">My Profile</h1>
        
        <ProfileOverview guide={guideData} />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <ScholarsList 
              scholars={scholars} 
              selectedScholarId={selectedScholarRollNo} 
              onScholarSelect={setSelectedScholarRollNo} 
            />
          </div>
          <div className="lg:col-span-1">
            {/* <QuickActions /> */}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Profileg;
