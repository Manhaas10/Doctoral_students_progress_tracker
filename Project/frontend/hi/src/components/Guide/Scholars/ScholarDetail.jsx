import axios from "axios"; // Ensure axios is installed
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  User, GraduationCap, 
  BookOpen, FileText, 
  Calendar, Clipboard, 
  ClipboardCheck, Users
} from "lucide-react";
import { parseISO, isBefore } from "date-fns";


const ScholarDetail= ({ scholar }) => {
  const [dcMembers, setDcMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publications, setPublications] = useState([]);
  useEffect(() => {
    if (!scholar || !scholar.roll) {
      setDcMembers([]);
      return;
    }

    const fetchDCMembers = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/students/${scholar.roll}/dc/get-dc`
        );
        console.log("hi",response.data);
        setDcMembers(response.data); // Assuming response contains an array of DC members
      } catch (error) {
        console.error("Error fetching DC members:", error);
        setDcMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDCMembers();
  }, [scholar]);
  
  const [swayamCourses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    if (!scholar || !scholar.roll) return;

    const fetchCourses = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/coursereq/approved/${scholar.roll}`
        );
        console.log("Courses Data:", response.data);
        setCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, [scholar]);
  useEffect(() => {
    if (!scholar || !scholar.roll) return;
    // console.log("hi");
    const fetchPublications = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/publications/get/${scholar.roll}`
        );
        ;
        setPublications(response.data);
      } catch (error) {
        console.error("Error fetching publications:", error);
        setPublications([]);
      }
    };
    
    fetchPublications();
  }, [scholar]);
  
  // In a real app, these would be fetched based on the scholar ID
  // console.log("1",publications);
  // const dcMembers = [
  //   "Dr. Anand Kumar (Guide)",
  //   "Dr. Ramesh Iyer (Chair)",
  //   "Dr. Suman Gupta (Member)",
  // ];



  // const swayamCourses = [
  //   { name: "Deep Learning Specialization", platform: "NPTEL", status: "Completed", certificate: true },
  //   { name: "Big Data Analytics", platform: "SWAYAM", status: "In Progress", certificate: false },
  // ];

  return (
    <Card className="shadow-soft border animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-border">
            <AvatarImage src="/placeholder.svg" alt={scholar.name} />
            <AvatarFallback className="text-xl bg-primary/10 text-primary">
              {scholar.name.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl">{scholar.name}</CardTitle>
            <p className="text-muted-foreground mt-1">{scholar.rollNo}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {/* <TabsTrigger value="courses">Courses</TabsTrigger> */}
            <TabsTrigger value="publications">Publications</TabsTrigger>
            {/* <TabsTrigger value="comprehensive">Comprehensive</TabsTrigger> */}
            <TabsTrigger value="swayam">SWAYAM</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" /> Personal Information
                  </h3>
                  <div className="bg-secondary/50 p-4 rounded-md space-y-2">
                    <div className="grid grid-cols-4">
                      <span className="text-sm text-muted-foreground col-span-1">Name:</span>
                      <span className="text-sm font-medium col-span-3">{scholar.name}</span>
                    </div>
                    <div className="grid grid-cols-4">
                      <span className="text-sm text-muted-foreground col-span-1">Reg No:</span>
                      <span className="text-sm font-medium col-span-3">{scholar.roll}</span>
                    </div>
                    <div className="grid grid-cols-4">
                      <span className="text-sm text-muted-foreground col-span-1">Department:</span>
                      <span className="text-sm font-medium col-span-3">CSE</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" /> Academic Information
                  </h3>
                  <div className="bg-secondary/50 p-4 rounded-md space-y-2">
                    <div className="grid grid-cols-4">
                      <span className="text-sm text-muted-foreground col-span-2">AdmissionScheme:</span>
                      <span className="text-sm font-medium col-span-2">{scholar.admissionscheme
                      }</span>
                    </div>
                    <div className="grid grid-cols-4">
                      <span className="text-sm text-muted-foreground col-span-2">Orcid:</span>
                      <span className="text-sm font-medium col-span-2">{scholar.orcid}</span>
                    </div>
                    <div className="grid grid-cols-4">
                      <span className="text-sm text-muted-foreground col-span-2">ResearchArea:</span>
                      <span className="text-sm font-medium col-span-2">{scholar.areaofresearch
                      }</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
  <div>
    <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
      <Users className="h-4 w-4" /> DC Committee Members
    </h3>
    <div className="bg-secondary/50 p-4 rounded-md">
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : dcMembers && Object.keys(dcMembers).length > 0? (
        <ul className="space-y-2">
          {/* Display PhD Supervisor */}
          <div className="grid grid-cols-4">
          <span className="text-sm text-muted-foreground col-span-2"> PhD Supervisor:</span>
          <span className="text-sm font-medium col-span-2 ">{dcMembers.phdSupervisorName}</span>
          </div>

          {/* Display DC Chair */}
          {/* <li className="text-sm font-semibold"> */}
            {/* DC Chair: {dcMembers.dcChairName}{" "} */}
            {/* <span className="text-muted-foreground">({dcMembers.dcChairEmail})</span> */}
          {/* </li> */}
          <div className="grid grid-cols-4">
          <span className="text-sm text-muted-foreground col-span-2"> DC Chair:</span>
          <span className="text-sm font-medium col-span-2 ">{dcMembers.dcChairName}</span>
          </div>

          {/* Display Other DC Members */}
          {dcMembers.members.length > 0 ? (
            dcMembers.members.map((member, index) => (
              <div className="grid grid-cols-4">
              <span className="text-sm text-muted-foreground col-span-2">
                DC Member:
              </span>
            <span className="text-sm font-medium col-span-2 ">{member.name}</span>
            </div>
            ))
          ) : (
            <li className="text-sm text-muted-foreground">No other DC members assigned.</li>
          )}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No DC members assigned yet.</p>
      )}
    </div>
  </div>
                
              </div>
            </div>
          </TabsContent>
          
         
          
          {/* Publications Tab */}
            <TabsContent value="publications">
                   <div className="space-y-4">
                     {publications.length > 0 ? (
                       publications.map((pub, index) => (
                         <div key={index} className="bg-secondary/50 p-4 rounded-md relative">
                          <p className="absolute top-5 right-4 text-sm text-muted-foreground">
                            {pub.dateOfSubmission.join("-")}
                            </p>
                           <h3 className="font-medium">{pub.title}</h3>
                           <p className="text-sm text-muted-foreground mt-1">
                             {pub.publishername} 
                           </p>
                           {/* <p className="text-sm text-muted-foreground">DOI: {pub.doi}</p> */}
                           {/* <p className="text-sm text-muted-foreground">Status: {pub.status}</p> */}
                           <div className="mt-2 flex justify-between items-center w-full">
                           <div className="flex gap flex-wrap">
                             <Badge variant="outline" className="bg-white-1000 text-black-800 mx-1">
                               {pub.indexing}
                             </Badge>
                             <Badge variant="outline" className="bg-white-100 text-white-800 mx-2">
                               {pub.publicationType}
                             </Badge>
                             <Badge variant="outline" 
                             className={` ${
                              pub.status === "Editorial Revision"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                               : pub.status === "Submitted"
                               ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
                               : pub.status === "Accepted"
                                 ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                 : pub.status === "Published"
                                 ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                 : "bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                                 }`}>
                                  {pub.status}
                                  </Badge>
                                  </div>

                             <a href={`https://doi.org/${pub.doi}`}   target="_blank" rel="noopener noreferrer" className="text-sm text-primary ml-2 hover:underline">
                               View Publication
                             </a>
                           </div>
                         </div>
                       ))
                     ) : (
                       <div className="text-center py-6">
                         <p className="text-muted-foreground">No publications recorded yet.</p>
                       </div>
                     )}
                   </div>
                 </TabsContent>
          
          {/* Comprehensive Exam Tab */}
          
          
          {/* SWAYAM Courses Tab */}
          {/* import { parseISO, isBefore } from "date-fns"; // Importing date-fns for date comparisons */}
          <TabsContent value="swayam" className="pt-4">
             <div className="space-y-4">
               {swayamCourses.map((course, index) => {
                const courseDate = course.endDate;// Convert course date to Date object
                const currentDate = new Date();
                const options = { month: 'short', day: 'numeric', year: 'numeric' };
                const formattedDate = currentDate.toLocaleDateString('en-US', options);
                
                 const isCompleted = isBefore(courseDate, formattedDate);
                 console.log(courseDate) // Check if course date is before today
               return (
                  <div key={index} className="bg-secondary/50 p-4 rounded-md">
                      <div className="flex justify-between items-center">
                         <h3 className="font-medium">{course.courseName}</h3>
                          <Badge   variant="outline"
                           className={
                              isCompleted
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                            }
                             >
                              {isCompleted ? "Completed" : "In Progress"}
                               </Badge>
                                </div>
                                  <p className="text-sm text-muted-foreground mt-1">
                                       Duration: {course.duration}
                                        </p>
                 </div>
      );
    })}

    {swayamCourses.length === 0 && (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No SWAYAM courses enrolled yet.</p>
      </div>
    )}
  </div>
</TabsContent>

        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ScholarDetail;
