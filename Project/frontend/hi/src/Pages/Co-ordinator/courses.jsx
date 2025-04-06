import { useState, useCallback, useEffect } from "react";
import { FileText, Search, Filter, Download, Eye, BookOpen } from "lucide-react";
import DashboardLayout from "@/components/Co-ordinator/layout/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import FileUpload from "@/components/Co-ordinator/FileUpload";
import { toast } from "sonner";

const SwayamCourseApprovals = () => {
  // Upload related states
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [courseReqs, setCourseReqs] = useState([]); // State for course requirements

  // Approvals related states
  const [approvals, setApprovals] = useState([]);
  const [filteredApprovals, setFilteredApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingApproval, setViewingApproval] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [isViewing, setIsViewing] = useState(false);

  // Fetch course requirements
  const fetchCourseReqs = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:8080/api/coursereq/all");
      if (!response.ok) throw new Error("Failed to fetch course requirements");
      const data = await response.json();
      console.log(data);
      setCourseReqs(data);
      setApprovals(data);
      setFilteredApprovals(data);
    } catch (error) {
      toast.error(`Error fetching course requirements: ${error.message}`);
    }
  }, []);

  // Fetch students
  const fetchStudents = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:8080/api/students/all");
      if (!response.ok) throw new Error("Failed to fetch students");
      const data = await response.json();
      console.log(data);
      setStudents(data);
    } catch (error) {
      toast.error(`Error fetching students: ${error.message}`);
    }
  }, []);

  // Fetch courses
  const fetchCourses = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:8080/api/courses/all");
      if (!response.ok) throw new Error("Failed to fetch courses");
      const data = await response.json();
      setCourses(data);
      setUploadSuccess(true);
      localStorage.setItem("uploadCompleted", "true");
    } catch (error) {
      toast.error(`Error fetching courses: ${error.message}`);
    }
  }, []);
  useEffect(() => {
    if (courseReqs.length > 0 && students.length > 0) {
      const updatedApprovals = courseReqs.map((approval) => {
        const student = students.find((student) => student.studentId === approval.studentId);
        return {
          ...approval,
          studentName: student ? student.studentName : "Unknown",
          guide: student ? student.guideName : "Unknown",
        };
      });
      setApprovals(updatedApprovals);
      setFilteredApprovals(updatedApprovals);
      setLoading(false);
    }
  }, [courseReqs, students]);

  // Load data on component mount
  useEffect(() => {
    if (localStorage.getItem("uploadCompleted") === "true") {
      fetchCourses();
      fetchStudents();
      fetchCourseReqs();
    }
  }, [fetchCourses, fetchStudents, fetchCourseReqs]);

  // Handle view students
  const handleViewStudents = () => {
    setIsViewing(true);
    fetchCourses(); // Ensure fresh data is fetched
  };

  // Approval functions
  const handleViewDetails = (approval) => {
    setViewingApproval(approval);
    setOpenDialog(true);
  };


  const getStatusBadge = (status) => {
    switch (status) {
      case "Approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "Rejected":
        return <Badge className="bg-red-500">Rejected</Badge>;
      case "Pending":
        return <Badge className="bg-blue-500">Pending</Badge>;
      default:
        return null;
    }
  };

  // Upload functions
  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setUploadSuccess(false);
    setIsSubmitted(false);
  };

  const handleUpload = useCallback(async () => {
    if (!file) return;
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8080/api/courses/upload", {
        method: "POST",
        body: formData,
        mode: 'cors'
      });

      if (!response.ok) throw new Error("Failed to upload file");

      const data = await response.json();
      setCourses(data);
      setUploadSuccess(true);
      localStorage.setItem("uploadCompleted", "true");

      toast.success("Courses data processed", {
        description: `${data.length} Courses imported from ${file.name}`,
      });
    } catch (error) {
      toast.error("Error uploading file");
    } finally {
      setIsUploading(false);
    }
  }, [file]);

  const handleSubmit = () => {
    setIsSubmitted(true);
    toast.success("Swayam Courses have been submitted", {
      description: `${courses.length} course records have been successfully added to the system.`,
    });
  };

  // Load approval data
  // useState(() => {
  //   const timer = setTimeout(() => {

  //     setApprovals(courseReqs);
  //     setFilteredApprovals(courseReqs);
  //     setLoading(false);
  //   }, 1500);

  //   return () => clearTimeout(timer);
  // }, []);

  // Filter approvals
  useEffect(() => {
    let filtered = [...approvals];
  
    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(approval => approval.status.toLowerCase() === statusFilter.toLowerCase());
    }
  
    // Filter by course
    if (courseFilter !== "all") {
      filtered = filtered.filter(approvals => approvals.courseId === courseFilter);
    }
  
    console.log("hi",filtered);
    // Filter by search query
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        approval =>
          approval.studentName.toLowerCase().includes(query) ||
          approval.courseName.toLowerCase().includes(query) ||
          approval.studentId.toLowerCase().includes(query) ||
          approval.guide.toLowerCase().includes(query)
      );
    }
  
    // Update filteredApprovals
    setFilteredApprovals(filtered);
  }, [statusFilter, courseFilter, searchQuery, approvals]);

  const getUniqueCoursesOptions = () => {
    const uniqueCourses = new Map();
    approvals.forEach(approval => {
      if (!uniqueCourses.has(approval.courseId)) {
        uniqueCourses.set(approval.courseId, approval.courseName);
      }
    });
    //console.log(uniqueCourses);
    
    return Array.from(uniqueCourses).map(([id, name]) => ({
      id,
      name,
    }));
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="flex items-center space-x-2 mb-2">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Swayam Course Management</h1>
        </div>
        <p className="text-muted-foreground mb-8">
          Upload new courses and track student applications
        </p>

        {/* Main Tabs Navigation */}
        <Tabs 
          defaultValue="upload" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="mb-8"
        >
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="upload">Upload Courses</TabsTrigger>
            <TabsTrigger value="approvals">Course Logs</TabsTrigger>
          </TabsList>

          {/* Upload Courses Tab */}
           <TabsContent value="upload" className="space-y-8">
          {!uploadSuccess ? (
            
            
         
            <>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
              <h2 className="text-xl font-semibold mb-4">Upload Courses File</h2>
              <FileUpload
                onFileSelect={handleFileSelect}
                accept=".xlsx,.xls,.csv"
                maxSize={5}
              />
              
              <div className="mt-6">
                <Button 
                  onClick={handleUpload} 
                  disabled={!file || isUploading}
                  className="w-full sm:w-auto"
                >
                  {isUploading ? "Processing..." : "Upload Courses"}
                </Button>
              </div>
            </div>
            </>
          ):(
            <>
            <div className="mt-6">
              <Button onClick={handleViewStudents} className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                View Courses
              </Button>
            </div>
            {isViewing && courses.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-border animate-slide-up mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Available Swayam Courses</h2>
                  {/* <Button onClick={handleSubmit} className="flex items-center gap-2">
                    Upload Courses
                  </Button> */}
                </div>
                <div className="overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell className="font-medium">{course.id}</TableCell>
                          <TableCell>{course.course_name}</TableCell>
                          <TableCell>{course.sme_Name}</TableCell>
                          <TableCell>{course.duration}</TableCell>
                          {/* <TableCell>{new Date(course.StartDate).toLocaleDateString()}</TableCell> */}
                          <TableCell>{new Date(course.startDate).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(course.endDate).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
            </>
          )
          // </TabsContent>
          }

          </TabsContent>

          {/* Course Logs Tab */}
          <TabsContent value="approvals" className="space-y-8">
            {/* Filters */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-border mb-8 animate-slide-up">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4">
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search student, course..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-28 sm:w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <Select
                      value={courseFilter}
                      onValueChange={setCourseFilter}
                    >
                      <SelectTrigger className="w-36 sm:w-40">
                        <SelectValue placeholder="Course" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Courses</SelectItem>
                        {getUniqueCoursesOptions().map(course => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                {/* <Button 
                  variant="outline" 
                  size="sm"
                  onClick={exportToCSV}
                  className="flex items-center gap-1"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button> */}
              </div>
            </div>

            {/* Approval Logs Table */}
            <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden animate-slide-up">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Guide</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApprovals.length > 0 ? (
                      filteredApprovals.map((approval) => (
                        <TableRow key={approval.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{approval.studentName}</div>
                              <div className="text-sm text-muted-foreground">{approval.studentId}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{approval.courseName}</div>
                              <div className="text-sm text-muted-foreground">{approval.courseId}</div>
                            </div>
                          </TableCell>
                          <TableCell>{approval.guide}</TableCell>
                          <TableCell>{approval.provider}</TableCell>
                          <TableCell>{getStatusBadge(approval.status)}</TableCell>
                          <TableCell className="text-right">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewDetails(approval)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>View Details</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10">
                          <div className="flex flex-col items-center">
                            <Search className="h-10 w-10 text-muted-foreground mb-2" />
                            <p className="text-lg font-medium">No approval records found</p>
                            <p className="text-sm text-muted-foreground mb-4">
                              Try adjusting your filters or search query
                            </p>
                            {(statusFilter !== "all" || courseFilter !== "all" || searchQuery) && (
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setStatusFilter("all");
                                  setCourseFilter("all");
                                  setSearchQuery("");
                                }}
                              >
                                Clear all filters
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Approval Details Dialog */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Approval Details</DialogTitle>
              <DialogDescription>
                Detailed information about the course approval
              </DialogDescription>
            </DialogHeader>
            
            {viewingApproval && (
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Student Name</h4>
                    <p>{viewingApproval.studentName}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Student ID</h4>
                    <p>{viewingApproval.studentId}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Course</h4>
                    <p>{viewingApproval.courseName}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Course ID</h4>
                    <p>{viewingApproval.courseId}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Guide</h4>
                    <p>{viewingApproval.guide}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Provider</h4>
                    <p>{viewingApproval.provider}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                    <p>{getStatusBadge(viewingApproval.status)}</p>
                  </div>
                  {viewingApproval.approvalDate && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Decision Date</h4>
                      <p>{new Date(viewingApproval.approvalDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
                
                {viewingApproval.approvedBy && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Approved/Rejected By</h4>
                    <p>{viewingApproval.approvedBy}</p>
                  </div>
                )}
                
                {viewingApproval.comments && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Comments</h4>
                    <p className="text-sm mt-1 p-3 bg-muted rounded-md">
                      {viewingApproval.comments}
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default SwayamCourseApprovals;
