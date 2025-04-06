import { useState, useEffect } from 'react';
import { Search, Plus, Download, Check, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RequestStatus from '@/components/Guide/courses/RequestStatus';
import ActionDialog from '@/components/Guide/courses/ActionDialog';
import PageLayout from "@/components/Guide/layout/Layout";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Mock data for requests


const Actions = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const [guideEmail, setGuideEmail] = useState("");
  
  const [guideId, setGuideId] = useState(null);
  const [students, setStudents] = useState([]);
  const [courseRequests, setCourseRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  // const [searchQuery, setSearchQuery] = useState("");
  // const [activeTab, setActiveTab] = useState("all");
  // const [selectedRequest, setSelectedRequest] = useState(null);
  // const [actionType, setActionType] = useState(null);
  // const [dialogOpen, setDialogOpen] = useState(false);
  // const { toast } = useToast();
      const [isDialogOpen, setIsDialogOpen] = useState(false);
  const handleViewDetails = (request) => {
    // setCourseRequests(course);
    setSelectedRequest(request);
    //setIsDetailsOpen(true);
    setIsDialogOpen(true);
  };
  // Filter requests based on search query and active tab

  const handleAction = async (request, type) => {
    try {
      const action = type === "approve" ? "approve" : "reject";
      
      // Call the backend API to update the status
      await axios.put(
        `http://localhost:8080/api/coursereq/${action}/${request.studentId}/${request.courseId}`, 
        { withCredentials: true }
      );

  
      toast({
        title: `Request ${action}d`,
        description: `You have ${action}d ${request.courseName} for ${request.studentName}`,
      });
  
      // Update UI after action
      setCourseRequests((prev) =>
        prev.map((req) =>
          req.id === request.id ? { ...req, status: type === "approve" ? "Approved" : "Rejected" } : req
        )
      );
      setFilteredRequests((prev) =>
        prev.map((req) =>
          req.id === request.id ? { ...req, status: type === "approve" ? "Approved" : "Rejected" } : req
        )
      );
  
      setDialogOpen(false);
    } catch (error) {
      console.error(`Error updating course request:`, error);
    }
  };
    // Step 1: Fetch Guide Email
    useEffect(() => {
      const fetchGuideEmail = async () => {
        try {
          const response = await axios.get("http://localhost:8080/api/user/super", { withCredentials: true });
          console.log(response.data);
          if (response.data.email) {
            setGuideEmail(response.data.email);
          } else {
            console.error("Failed to fetch guide email");
          }
        } catch (error) {
          console.error("Error fetching guide email:", error);
        }
      };
      fetchGuideEmail();
    }, []);
  
    // Step 2: Fetch Guide ID
    useEffect(() => {
      if (!guideEmail) return;
  
      const fetchGuideId = async () => {
        try {
          const response = await axios.get(`http://localhost:8080/api/guides/email/${guideEmail}`, { withCredentials: true });
          console.log(response.data);
          if (response.data) {
            setGuideId(response.data);
          } else {
            console.error("Guide ID not found");
          }
        } catch (error) {
          console.error("Error fetching guide ID:", error);
        }
      };
  
      fetchGuideId();
    }, [guideEmail]);
  
    // Step 3: Fetch Students Under Guide
    useEffect(() => {
      if (!guideId) return;
  
      const fetchStudents = async () => {
        try {
          const response = await axios.get(`http://localhost:8080/api/guides/${guideId}/students`, { withCredentials: true });
          console.log("j",response.data);
          if (response.data) {
            setStudents(response.data);
          } else {
            console.error("No students found for this guide");
          }
        } catch (error) {
          console.error("Error fetching students:", error);
        }
      };
  
      fetchStudents();
    }, [guideId]);
      // Step 4: Fetch Course Requests for Students
  useEffect(() => {
    if (students.length === 0) return;

    const fetchCourseRequests = async () => {
      try {
        const requests = await Promise.all(
          students.map(async (student) => {
            const response = await axios.get(`http://localhost:8080/api/coursereq/status/${student.rollNo}`, {
              withCredentials: true,
            });
            console.log(response.data);
            return response.data;
          })
        );
        // Flatten the array since `Promise.all` returns an array of arrays
        const allRequests = requests.flat();
        setCourseRequests(allRequests);
        setFilteredRequests(allRequests);
      } catch (error) {
        console.error("Error fetching course requests:", error);
      }
    };

    fetchCourseRequests();
  }, [students]);
    // Filter requests based on search and active tab
    useEffect(() => {
      console.log("Active Tab:", activeTab); // Debugging log
      console.log("Course Requests:", courseRequests); // Debugging log
    
      // Enrich courseRequests by adding studentName
      const enrichedRequests = courseRequests.map((request) => {
        const student = students.find((s) => s.rollNo === request.studentId);
        return {
          ...request,
          studentName: student ? student.name : "Unknown",
        };
      });
    
      // Debugging log to check enriched requests
      console.log("Enriched Requests:", enrichedRequests);
    
      // Filter based on search and status
      const filtered = enrichedRequests.filter((request) => {
        const matchesSearch =
          request.courseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.studentName.toLowerCase().includes(searchQuery.toLowerCase());
    
        // Debugging log to check request status filtering
        console.log("Checking request:", request.courseId, "Status:", request.status);
    
        if (activeTab === "all") return matchesSearch;
        return matchesSearch && request.status.toLowerCase() === activeTab.toLowerCase();
      });
    
      console.log("Filtered Requests:", filtered); // Debugging log
      setFilteredRequests(filtered);
    }, [searchQuery, activeTab, courseRequests, students]);
    
    

    const handleConfirmAction = async () => {
      try {
        const action = actionType === "approve" ? "approve" : "reject";
        await axios.put(`http://localhost:8080/api/coursereq/${action}/${selectedRequest.id}`, {}, { withCredentials: true });
  
        toast({
          title: `Request ${action}d`,
          description: `You have ${action}d ${selectedRequest.courseName} for ${selectedRequest.studentName}`,
        });
  
        // Update UI after action
        setCourseRequests((prev) =>
          prev.map((req) => (req.id === selectedRequest.id ? { ...req, status: actionType === "approve" ? "Approved" : "Rejected" } : req))
        );
        setFilteredRequests((prev) =>
          prev.map((req) => (req.id === selectedRequest.id ? { ...req, status: actionType === "approve" ? "Approved" : "Rejected" } : req))
        );
  
        setDialogOpen(false);
      } catch (error) {
        console.error(`Error updating course request:`, error);
      }
    };
    console.log(selectedRequest);

    return (
      <PageLayout>
        <div className="flex h-screen">
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Main Content */}
            <main className="flex-1 overflow-y-auto animate-fade-in">
              <div className="page-container">
                <div className="max-w-full mx-auto">
                  {/* Header */}
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Course Requests</h2>
                  </div>
    
                  {/* Course Requests Panel */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                    <div className="flex flex-col gap-4">
                      {/* Section Title */}
                      <div>
                        <h3 className="text-lg font-semibold">View Requested Courses</h3>
                        <p className="text-sm text-gray-500">
                          Track the status of course requests.
                        </p>
                      </div>
    
                      {/* Tabs and Search */}
                      <div className="flex justify-between items-center">
                        {/* Tabs for filtering requests */}
                        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
                          <TabsList className="bg-gray-100 p-1 rounded-full">
                            <TabsTrigger value="all" className="rounded-full">All</TabsTrigger>
                            <TabsTrigger value="pending" className="rounded-full">Pending</TabsTrigger>
                            <TabsTrigger value="approved" className="rounded-full">Approved</TabsTrigger>
                            <TabsTrigger value="rejected" className="rounded-full">Rejected</TabsTrigger>
                          </TabsList>
                        </Tabs>
    
                        {/* Search Bar */}
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input 
                              type="text"
                              placeholder="Search courses..." 
                              className="pl-10 w-[250px]"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
    
                      {/* Course Requests Table */}
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              {["Course ID", "Course Name", "Student", "Duration", "Status", "Actions"].map((header) => (
                                <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {filteredRequests.length > 0 ? (
                              filteredRequests.map((request) => (
                                <tr key={request.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {request.courseId}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {request.courseName}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex flex-col">
                                      <span className="text-gray-900">{request.studentName}</span>
                                      <span className="text-gray-500 text-xs">{request.studentId}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {request.duration}
                                  </td>
                                 
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <RequestStatus status={request.status} />
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {request.status === 'Pending' ? (
                                      <div className="flex space-x-2">
                                        <Button 
                                          onClick={() => handleAction(request, 'approve')}
                                          variant="outline" 
                                          size="sm" 
                                          className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                        >
                                          <Check className="h-4 w-4 mr-1" />
                                          Approve
                                        </Button>
                                        <Button 
                                          onClick={() => handleAction(request, 'reject')}
                                          variant="outline" 
                                          size="sm" 
                                          className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                        >
                                          <X className="h-4 w-4 mr-1" />
                                          Reject
                                        </Button>
                                      </div>
                                    ) : (
                                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(request)}>
                                        Details
                                      </Button>
                                    )}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={7} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                  No requests found matching your criteria.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
    
          {/* Action Dialog */}
          <ActionDialog 
            open={dialogOpen} 
            onOpenChange={setDialogOpen}
            actionType={actionType}
            request={selectedRequest}
            onConfirm={handleConfirmAction}
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-lg p-6">
                  {selectedRequest && (
                    <>
                      <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">{selectedRequest.courseName}</DialogTitle>
                      </DialogHeader>
        
                      <div className="space-y-3 text-sm text-gray-700">
                        <p><strong>Course ID:</strong> {selectedRequest.courseId}</p>
                        <p><strong>Duration:</strong> {selectedRequest.duration}</p>
                        <p><strong>Start Date:</strong> {selectedRequest.startDate}</p>
                        <p><strong>End Date:</strong> {selectedRequest.endDate}</p>
                        <p><strong>Provider:</strong> {selectedRequest.provider}</p>
                        {/* <p><strong>Institute:</strong> {selectedCourse.institute || "N/A"}</p> */}
                        {/* <p><strong>Co-Institute:</strong> {selectedCourse.co_Institute || "N/A"}</p> */}
                      </div>
        
                      <DialogFooter>
                        <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>Close</Button>
                      </DialogFooter>
                    </>
                  )}
                </DialogContent>
              </Dialog>
      </PageLayout>
    );
    
};

export default Actions;
