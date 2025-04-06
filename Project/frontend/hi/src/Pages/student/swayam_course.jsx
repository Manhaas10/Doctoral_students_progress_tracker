import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Student/layout/Layout";
import CourseSearch from "@/components/Student/courses/CourseSearch";
import CourseCard from "@/components/Student/courses/CourseCard";
import CourseDetailsDialog from "@/components/Student/courses/CourseDetailsDialog";
import RequestStatus from '@/components/Guide/courses/RequestStatus';
import { Snackbar, Alert } from "@mui/material";
const Courses = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("add");
  const [activeStatusTab, setActiveStatusTab] = useState("all");
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [courseRequests, setCourseRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [student, setStudent] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info", // "success", "error", "warning", "info"
  });
  /** Fetch user profile */
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/user/profile", { withCredentials: true });
        if (response.data?.rollNumber) {
          setStudent(response.data);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };
    fetchProfileData();
  }, []);

  /** Fetch requested courses */
  const fetchCourseRequests = async () => {
    if (!student?.rollNumber) return;
    try {
      const response = await axios.get(`/api/coursereq/status/${student.rollNumber}`);
      setCourseRequests(response.data);
    } catch (error) {
      console.error("Error fetching course requests:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "view") {
      fetchCourseRequests();
    }
  }, [activeTab]);

  /** Add Course */
  const handleAddCourse = (course) => {
    if (!selectedCourses.some((c) => c.id === course.id)) {
      setSelectedCourses([...selectedCourses, course]);
      setSnackbar({ open: true, message: `${course.course_name} has been added.`, severity: "success" });
    } else {
      setSnackbar({ open: true, message: `${course.course_name} is already in your list.`, severity: "error" });
    }
  };

  /** Remove Course */
  const handleRemoveCourse = (courseId) => {
    setSelectedCourses(selectedCourses.filter((course) => course.id !== courseId));
    setSnackbar({ open: true, message: "Course has been removed.", severity: "warning" });
  };

  /** Submit Selected Courses */
  const handleSubmitCourses = async () => {
    if (selectedCourses.length === 0) {
      setSnackbar({
        open: true,
        message: "Select at least one course before submitting.",
        severity: "error",
      });
      return;
    }
  
    try {
      const newRequests = selectedCourses.map((course) => ({
        studentId: student.rollNumber,
        courseId: course.id,
        courseName: course.course_name,
        provider: course.sme_Name,
        duration: course.duration,
        startDate: course.startDate,
        endDate: course.endDate,
        status: "Pending",
      }));
  
      await axios.post("/api/coursereq/add", newRequests, {
        headers: { "Content-Type": "application/json" },
      });
  
      toast({
        title: "Courses submitted",
        description: `${selectedCourses.length} course(s) submitted successfully.`,
      });
  
      setSelectedCourses([]);
      setActiveTab("view");
      fetchCourseRequests();
    } catch (error) {
      console.error("Error submitting course request:", error);
  
      // Get a meaningful error message from the backend response
      const errorMessage =
        error.response?.data?.message ||
        "There was an issue submitting your course requests.";
  
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: "error",
        });
    }
  };
  

  /** Open Course Details */
  const handleViewDetails = (course) => {
    setSelectedCourse(course);
    setIsDetailsOpen(true);
    setIsDialogOpen(true);
  };

  /** Filter Courses */
  const getFilteredCourses = () => {
    let filtered = courseRequests;
    if (activeStatusTab !== "all") {
      filtered = filtered.filter((course) => course.status === activeStatusTab);
    }
    if (searchTerm) {
      filtered = filtered.filter((course) => course.courseName.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return filtered;
  };
    /** Close Snackbar */
    const handleCloseSnackbar = () => {
      setSnackbar({ ...snackbar, open: false });
    };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Swayam Courses</h1>
          <div className="flex gap-2">
            <Button variant={activeTab === "add" ? "default" : "outline"} onClick={() => setActiveTab("add")}>Add Courses</Button>
            <Button variant={activeTab === "view" ? "default" : "outline"} onClick={() => setActiveTab("view")}>View Courses</Button>
          </div>
        </div>
         <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
                  <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
                    {snackbar.message}
                  </Alert>
                </Snackbar>
        

        {activeTab === "add" ? (
          <Card>
            <CardHeader>
              <CardTitle>Add Courses</CardTitle>
              <CardDescription>Search for courses and add them to your request list.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <CourseSearch onAddCourse={handleAddCourse} />
              {selectedCourses.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Selected Courses ({selectedCourses.length})</h3>
                  <div className="grid gap-3">
                    {selectedCourses.map((course) => (
                      <CourseCard key={course.id} course={course} onRemove={handleRemoveCourse} />
                    ))}
                  </div>
                  <Button className="w-full" onClick={handleSubmitCourses}>Submit Course Requests</Button>
                </div>
              ) : (
                <div className="text-center py-10 border rounded-md border-dashed">
                  <p className="text-muted-foreground">No courses selected yet. Use the search bar above to find courses.</p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>View Requested Courses</CardTitle>
              <CardDescription>Track the status of your course requests.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeStatusTab} onValueChange={setActiveStatusTab}>
                <TabsList className="grid grid-cols-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="Pending">Requested</TabsTrigger>
                  <TabsTrigger value="Approved">Approved</TabsTrigger>
                  <TabsTrigger value="Rejected">Rejected</TabsTrigger>
                </TabsList>
              </Tabs>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course ID</TableHead>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Prof Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredCourses().map((course) => (
                    <TableRow key={course.courseId}>
                      <TableCell>{course.courseId}</TableCell>
                      <TableCell>{course.courseName}</TableCell>
                      <TableCell>{course.provider}</TableCell>
                      <TableCell> <td className="px-6 py-4 whitespace-nowrap">
                                    <RequestStatus status={course.status} />
                                  </td></TableCell>
                      <TableCell><Button variant="outline" size="sm" onClick={() => handleViewDetails(course)}>Details</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg p-6">
          {selectedCourse && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">{selectedCourse.courseName}</DialogTitle>
              </DialogHeader>

              <div className="space-y-3 text-sm text-gray-700">
                <p><strong>Course ID:</strong> {selectedCourse.courseId}</p>
                <p><strong>Duration:</strong> {selectedCourse.duration}</p>
                <p><strong>Start Date:</strong> {selectedCourse.startDate}</p>
                <p><strong>End Date:</strong> {selectedCourse.endDate}</p>
                <p><strong>Provider:</strong> {selectedCourse.provider}</p>
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

      {/* {selectedCourse && <CourseDetailsDialog course={selectedCourse} isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} />} */}
    </Layout>
  );
};

export default Courses;
