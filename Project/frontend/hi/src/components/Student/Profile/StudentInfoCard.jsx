import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Save, Edit, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const StudentInfoCard = ({ studentData, onUpdate }) => {
  const [editableData, setEditableData] = useState({
    orcidId: '',
    researchArea: '',
    admissionScheme: '' // Added admissionScheme in state
  });
  const [profileImage, setProfileImage] = useState(studentData.profilePicture);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/students/${studentData.rollNumber}`, {
          withCredentials: true
        });
        console.log(response.data);

        if (response.data) {
          const { orcid, areaofresearch, admissionscheme } = response.data;
          setEditableData({
            orcidId: orcid || '',
            researchArea: areaofresearch || '',
            admissionScheme: admissionscheme || '' // Fetched admission scheme from backend
          });
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };

    fetchStudentData();
  }, [studentData.rollNumber]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditableData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    axios.put(`http://localhost:8080/api/students/${studentData.rollNumber}`, {
      rollNumber: studentData.rollNumber,  // Include roll number
      name: studentData.name,              // Keep other fields unchanged
      email: studentData.email,
      orcid: editableData.orcidId,         // Match backend field names
      areaofresearch: editableData.researchArea,
      admissionscheme: editableData.admissionScheme  // Use fetched admission scheme
    })
      .then(() => {
        alert("Data saved successfully!");
        if (onUpdate) onUpdate(editableData);
        setIsEditing(false);
      })
      .catch(error => console.error("Error saving data:", error));
  };

  return (
    <Card className="w-full glass">
      <CardHeader>
        <CardTitle className="text-xl text-primary">Student Information</CardTitle>
      </CardHeader>

      <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="flex flex-col items-center gap-4">
          <Avatar className="h-32 w-32">
            <AvatarImage src={profileImage} alt={studentData.name} />
            <AvatarFallback><User className="h-12 w-12" /></AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">{studentData.name}</span>
        </div>
        
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Full Name</label>
              <Input value={studentData.name} readOnly className="bg-muted/30" />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Roll Number</label>
              <Input value={studentData.rollNumber} readOnly className="bg-muted/30" />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <Input value={studentData.email} readOnly className="bg-muted/30" />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">ORCID ID</label>
              <Input
                name="orcidId"
                value={editableData.orcidId}
                onChange={handleChange}
                placeholder="Enter ORCID ID"
                disabled={!isEditing}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Admission Scheme</label>
              <Input
                value={editableData.admissionScheme} // Display value from state fetched from backend
                readOnly
                className="bg-muted/30"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Major Area of Research</label>
            <Textarea
              name="researchArea"
              value={editableData.researchArea}
              onChange={handleChange}
              placeholder="Enter your Research Area"
              disabled={!isEditing}
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end gap-4">
        <Button onClick={() => setIsEditing(!isEditing)} className="gap-2" variant="outline">
          <Edit className="h-4 w-4" /> {isEditing ? "Cancel" : "Edit"}
        </Button>
        {isEditing && (
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" /> Save Changes
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default StudentInfoCard;
