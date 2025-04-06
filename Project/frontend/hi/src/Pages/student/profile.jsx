import React, { useState, useEffect } from 'react';
import Layout from '@/components/Student/layout/Layout';
import StudentInfoCard from '@/components/Student/Profile/StudentInfoCard';
import DCInfoCard from '@/components/Student/Profile/DCInfoCard';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

// Initial student state (empty values)
const initialStudentData = {
  profilePicture: '/placeholder.svg',
  orcidId: '0000-0002-1825-0097',
  degree: 'PhD',
  department: 'CSED',
  dateOfJoining: 'August 15, 2022',
  admissionScheme: '',
  researchArea: '',
  rollNumber: '',  // will be fetched from API (mapped from "rollNumber")
  guideName: '',   // fetched from backend
  guideEmail: ''   // fetched from backend
};

// Initial DC state (empty structure)
const initialDCData = {
  chair: {
    name: "",
    email: ""
  },
  supervisor: {
    name: "",
    email: ""
  },
  members: []
};

const Profile = () => {
  const [student, setStudent] = useState(initialStudentData);
  const [dc, setDC] = useState(initialDCData);
  const [hasDC, setHasDC] = useState(false);
  const { toast } = useToast();

  // First effect: Fetch student profile including guide details
  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/user/profile', {
          withCredentials: true
        });
        console.log("Profile response:", response.data);
        // Use the "rollNumber" field from the backend response.
        if (response.data && response.data.name && response.data.email && response.data.rollNumber) {
          const updatedStudent = {
            ...student,
            name: response.data.name,
            email: response.data.email,
            rollNumber: response.data.rollNumber, // using rollNumber as provided by backend
            orcidId: response.data.orcid,
            researchArea: response.data.areaofresearch || "",
            guideName: response.data.guideName || "",   // new guide details
            guideEmail: response.data.guideEmail || ""    // new guide details
          };
          setStudent(updatedStudent);
          console.log("Fetched student:", updatedStudent);
        } else {
          throw new Error('Invalid response format for student profile');
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchStudentProfile();
  }, []);

  // Second effect: When student.rollNumber is set, fetch DC details
  useEffect(() => {
    const fetchDCData = async () => {
      if (!student.rollNumber) return;
      try {
        const dcResponse = await axios.get(
          `http://localhost:8080/api/students/${student.rollNumber}/dc/get-dc`,
          { withCredentials: true }
        );
        const fetchedDC = dcResponse.data;
        console.log("Fetched DC data:", fetchedDC);
        setHasDC(true);
        // Transform the backend flat format to the UI shape:
        const transformedDC = {
          chair: {
            name: fetchedDC.dcChairName,
            email: fetchedDC.dcChairEmail
          },
          supervisor: {
            name: fetchedDC.phdSupervisorName,
            email: fetchedDC.phdSupervisorEmail
          },
          members: fetchedDC.members
        };
        setDC(transformedDC);
      } catch (dcError) {
        if (dcError.response && dcError.response.status === 404) {
          console.log("No existing DC found. Prepopulating supervisor details from profile.");
          setHasDC(false);
          // Use the guide details fetched in the profile for the supervisor section.
          setDC({
            chair: initialDCData.chair,
            supervisor: {
              name: student.guideName,
              email: student.guideEmail
            },
            members: initialDCData.members
          });
        } else {
          console.error("Error fetching DC data:", dcError);
        }
      }
    };

    fetchDCData();
  }, [student.rollNumber, student.guideName, student.guideEmail]);

  const handleStudentUpdate = (updatedData) => {
    // Not altering student details in the DC flow.
    setStudent({ ...student, ...updatedData });
    toast({
      title: "Profile updated",
      description: "Your information has been saved successfully.",
      duration: 3000,
    });
  };

  const handleDCUpdate = async (updatedData) => {
    try {
      // Transform UI shape into backend payload:
      const payload = {
        dcChairName: updatedData.chair.name,
        dcChairEmail: updatedData.chair.email,
        phdSupervisorName: updatedData.supervisor.name,
        phdSupervisorEmail: updatedData.supervisor.email,
        members: updatedData.members
      };

      console.log("Sending DC payload:", payload);

      let response;
      if (!hasDC) {
        // Create a new DC record
        response = await axios.post(
          `http://localhost:8080/api/students/${student.rollNumber}/dc/create-dc`,
          payload,
          { withCredentials: true }
        );
        setHasDC(true);
      } else {
        // Update the existing DC record
        response = await axios.put(
          `http://localhost:8080/api/students/${student.rollNumber}/dc/put-dc`,
          payload,
          { withCredentials: true }
        );
      }
      
      const updatedDCFromBackend = response.data;
      // Transform backend data to UI shape:
      const transformedDC = {
        chair: {
          name: updatedDCFromBackend.dcChairName,
          email: updatedDCFromBackend.dcChairEmail
        },
        supervisor: {
          name: updatedDCFromBackend.phdSupervisorName,
          email: updatedDCFromBackend.phdSupervisorEmail
        },
        members: updatedDCFromBackend.members
      };
      setDC(transformedDC);

      toast({
        title: "Committee details updated",
        description: "DC information has been saved successfully.",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error updating/creating DC:", error);
      toast({
        title: "Error",
        description: error.response?.data || "Failed to save DC",
        duration: 3000,
      });
    }
  };

  // Wait until student.rollNumber is defined
  if (!student || !student.rollNumber) return <div>Loading...</div>;

  return (
    <Layout>
      <div className="w-full max-w-5xl mx-auto space-y-8 py-6">
        <h1 className="text-3xl font-semibold mb-6 text-primary">Profile Information</h1>
        <StudentInfoCard studentData={student} onUpdate={handleStudentUpdate} />
        <DCInfoCard dcData={dc} onUpdate={handleDCUpdate} />
      </div>
    </Layout>
  );
};

export default Profile;
