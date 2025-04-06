import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Filter,
  Pencil,
  Plus,
  Info,
  ClipboardCheck,
  CheckCircle,
  XCircle,
  Clock,
  AlignLeft,
  Eye,
} from "lucide-react";
import FileUpload from "@/components/Co-ordinator/FileUpload";
import DashboardLayout from "@/components/Co-ordinator/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";


function formatTimestamp(timestamp) {
  const [year, month, day, hour, minute, second, _] = timestamp;
  const date = new Date(year, month, day);
  return date.toLocaleString(); // This will format the date and time according to the user's locale
}
const formatDateReq = (timestamp) => {
  if (!timestamp || timestamp.length < 5) return "Invalid Date";

  return new Date(timestamp[0], timestamp[1] - 1, timestamp[2], timestamp[3], timestamp[4])
    .toLocaleString("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // Ensures 24-hour format
    });
};


const ExamAnnouncement = () => {
  // Common state
  const [activeTab, setActiveTab] = useState("announcements");
  const [loading, setLoading] = useState(true);

  // Announcements state
  const [exams, setExams] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);

  // Approved Requests state
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [requestSearchQuery, setRequestSearchQuery] = useState("");
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [newStatus, setNewStatus] = useState("pending");
  const [file, setFile] = useState(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [courses, setCourses] = useState([]);

  // Approvals related states
  const [approvals, setApprovals] = useState([]);
  const [filteredApprovals, setFilteredApprovals] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [viewingApproval, setViewingApproval] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Updated Form states – removed eligibility; added new fields;
  const [formData, setFormData] = useState({
    name: "",
    examDate: "",
    deadline: "",
    examVenue: "",
    examDuration: "",
    examShift: "",
    broadcast: false,
  });
  const [Results, setResults] = useState([]);
  const [isViewing, setIsViewing] = useState(false);

  // ============ COMMENTS TAB STATE ============
  const [showCommentsDialog, setShowCommentsDialog] = useState(false);
  const [selectedExamForComments, setSelectedExamForComments] = useState(null);
  const [comments, setComments] = useState([]);


  // ============ UPLOAD RESULTS LOGIC ============
  const handleUpload = useCallback(async () => {
    if (!file) return;
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8080/api/results/upload", {
        method: "POST",
        body: formData,
        mode: "cors",
      });

      if (!response.ok) throw new Error("Failed to upload file");

      const data = await response.json();
      setResults(data);
      setUploadSuccess(true);
      localStorage.setItem("uploadCompleted", "true");

      toast.success("Results data processed", {
        description: `${data.length} Results imported from ${file.name}`,
      });
    } catch (error) {
      toast.error("Error uploading file");
    } finally {
      setIsUploading(false);
    }
  }, [file]);

  const fetchStudents = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:8080/api/results/all");
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      if (data.length > 0) {
        setResults(data);
        setUploadSuccess(true);
        localStorage.setItem("uploadCompleted", "true");
      }
    } catch (error) {
      toast.error(`Fetch error: ${error.message}`);
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem("uploadCompleted") === "true") {
      fetchStudents();
    }
  }, [fetchStudents]);

  const handleViewStudents = () => {
    setIsViewing(true);
    fetchStudents();
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    toast.success("Swayam Results have been submitted", {
      description: `${courses.length} course records have been successfully added to the system.`,
    });
  };

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setUploadSuccess(false);
    setIsSubmitted(false);
  };

  // ============ LOAD DATA (EXAMS + REQUESTS) ============
  useEffect(() => {
    const loadAllData = async () => {
      try {
        // 1) Fetch exams from server
        const examRes = await fetch("http://localhost:8080/api/exams", {
          method: "GET",
        });
        if (!examRes.ok) {
          throw new Error("Failed to fetch exams");
        }
        const examData = await examRes.json();
        setExams(examData);

        // 2) Fetch student applications from backend
        const appRes = await fetch("http://localhost:8080/api/applications/all", {
          method: "GET",
        });
        if (!appRes.ok) {
          throw new Error("Failed to fetch student applications");
        }
        const appData = await appRes.json();
        // console.log(appRes.data);
        setRequests(appData);
        setFilteredRequests(appData);

        setLoading(false);
      } catch (error) {
        toast.error(`Error fetching data: ${error.message}`);
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  useEffect(()=>{
    console.log(filteredRequests);

  },[filteredRequests]);
  // ============ FORM + EXAM CRUD ============
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleAddExam = async () => {
    if (
      !formData.name ||
      !formData.examDate ||
      !formData.deadline ||
      !formData.examVenue ||
      !formData.examDuration ||
      !formData.examShift
    ) {
      toast.error("Please fill all fields", {
        description: "All fields are required to add a new exam.",
      });
      return;
    }
    if (!formData.broadcast) {
      toast.error("Broadcast Required", {
        description:
          "Please check the Broadcast Announcement box to announce the exam to all students.",
      });
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/exams/announce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error("Failed to announce exam");
      }
      const newExam = await response.json();
      setExams((prev) => [...prev, newExam]);
      toast.success("Exam announced", {
        description: "The exam announcement has been successfully broadcasted to all students.",
      });
      setFormData({
        name: "",
        examDate: "",
        deadline: "",
        examVenue: "",
        examDuration: "",
        examShift: "",
        broadcast: false,
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      toast.error("Error announcing exam", { description: error.message });
    }
  };

  const handleEditExam = async () => {
    if (!selectedExam) return;
    if (
      !formData.name ||
      !formData.examDate ||
      !formData.deadline ||
      !formData.examVenue ||
      !formData.examDuration ||
      !formData.examShift
    ) {
      toast.error("Please fill all fields", {
        description: "All fields are required to update the exam.",
      });
      return;
    }
    if (!formData.broadcast) {
      toast.error("Broadcast Required", {
        description: "Announcement must be broadcasted.",
      });
      return;
    }
    try {
      const response = await fetch(`http://localhost:8080/api/exams/${selectedExam.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error("Failed to update exam");
      }
      const updatedExam = await response.json();
      setExams((prevExams) =>
        prevExams.map((exam) => (exam.id === selectedExam.id ? updatedExam : exam))
      );
      toast.success("Exam updated", {
        description: "The exam details have been successfully updated.",
      });
      setFormData({
        name: "",
        examDate: "",
        deadline: "",
        examVenue: "",
        examDuration: "",
        examShift: "",
        broadcast: false,
      });
      setIsEditDialogOpen(false);
      setSelectedExam(null);
    } catch (error) {
      toast.error("Error updating exam", { description: error.message });
    }
  };

  const openEditDialog = (exam) => {
    setSelectedExam(exam);
    setFormData({
      name: exam.name,
      examDate: exam.examDate,
      deadline: exam.deadline,
      examVenue: exam.examVenue,
      examDuration: exam.examDuration,
      examShift: exam.examShift,
      broadcast: exam.broadcast,
    });
    setIsEditDialogOpen(true);
  };

  // ============ REQUESTS TAB LOGIC ============
  useEffect(() => {
    let filtered = [...requests];
    if (statusFilter !== "all") {
      filtered = filtered.filter((req) => req.status === statusFilter);
    }
    if (requestSearchQuery) {
      const query = requestSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (req) =>
          req.studentName.toLowerCase().includes(query) ||
          req.rollNumber.toLowerCase().includes(query) ||
          req.examName.toLowerCase().includes(query)
      );
    }
    setFilteredRequests(filtered);
  }, [statusFilter, requestSearchQuery, requests]);

  const handleUpdateStatus = () => {
    if (!selectedRequest || !newStatus) return;
    setRequests((prevRequests) =>
      prevRequests.map((request) =>
        request.id === selectedRequest.id
          ? {
            ...request,
            status: newStatus,
            approvalDate:
              newStatus === "pending" ? "" : new Date().toISOString().split("T")[0],
          }
          : request
      )
    );
    setIsStatusDialogOpen(false);
    const statusMessages = {
      approved: "Request approved successfully",
      rejected: "Request rejected",
      pending: "Request marked as pending",
    };
    toast.success("Status updated", {
      description: statusMessages[newStatus],
    });
  };

  const openStatusDialog = (request) => {
    setSelectedRequest(request);
    setNewStatus(request.status);
    setIsStatusDialogOpen(true);
  };

  // ============ COMMENTS TAB LOGIC ============
  // ADDED: Function to open comments dialog and fetch comments
  const openCommentsDialog = async (exam) => {
    setSelectedExamForComments(exam);
    setShowCommentsDialog(true);

    try {
      const res = await fetch(`http://localhost:8080/api/exams/${exam.id}/comments`, {
        method: "GET",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch comments");
      }
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load comments");
    }
  };


  // ============ HELPER FUNCTIONS ============
  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle size={16} className="text-green-600" />;
      case "rejected":
        return <XCircle size={16} className="text-red-600" />;
      case "pending":
        return <Clock size={16} className="text-amber-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      approved: "bg-green-100 text-green-800 border border-green-200",
      rejected: "bg-red-100 text-red-800 border border-red-200",
      pending: "bg-amber-100 text-amber-800 border border-amber-200",
    };
    return (
      <div
        className={cn(
          "px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1",
          styles[status]
        )}
      >
        {getStatusIcon(status)}
        <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </div>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // ============ RENDER ============
  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-72 bg-gray-200 rounded-md"></div>
          <div className="h-16 bg-gray-200 rounded-xl"></div>
          <div className="h-80 bg-gray-200 rounded-xl"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="flex items-center space-x-2 mb-2">
          <Calendar className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Comprehensive Exam Management</h1>
        </div>
        <p className="text-muted-foreground mb-8">
          Manage comprehensive exams and view student requests for doctoral students
        </p>

        {/* Updated Tabs: added "Comments" tab. */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="announcements" className="text-sm">
              <Calendar className="mr-2 h-4 w-4" />
              Exam Announcements
            </TabsTrigger>
            <TabsTrigger value="requests" className="text-sm">
              <ClipboardCheck className="mr-2 h-4 w-4" />
              Exam Requests
            </TabsTrigger>
            <TabsTrigger value="comments" className="text-sm">
              <AlignLeft className="mr-2 h-4 w-4" />
              Exam Comments
            </TabsTrigger>
            <TabsTrigger value="upload" className="text-sm">
              <ClipboardCheck className="mr-2 h-4 w-4" />
              Upload Results
            </TabsTrigger>
          </TabsList>

          {/* Exams Announcements Tab */}
          <TabsContent value="announcements" className="pt-4">
            <div className="bg-white rounded-xl mb-4 animate-slide-up">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-right gap-2">
                      <Plus size={16} />
                      Announce Exam
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                      <DialogTitle>Announce Comprehensive Exam</DialogTitle>
                      <DialogDescription>
                        Fill in the details to add a new comprehensive exam to the list.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      {/* Exam Name */}
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="name" className="text-right">
                          Exam Name
                        </label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="e.g., Comprehensive Exam - Machine Learning"
                          className="col-span-3"
                          value={formData.name}
                          onChange={handleFormChange}
                        />
                      </div>
                      {/* Exam Date */}
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="examDate" className="text-right">
                          Exam Date
                        </label>
                        <Input
                          id="examDate"
                          name="examDate"
                          type="date"
                          className="col-span-3"
                          value={formData.examDate}
                          onChange={handleFormChange}
                        />
                      </div>
                      {/* Application Deadline */}
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="deadline" className="text-right">
                          Application Deadline
                        </label>
                        <Input
                          id="deadline"
                          name="deadline"
                          type="date"
                          className="col-span-3"
                          value={formData.deadline}
                          onChange={handleFormChange}
                        />
                      </div>
                      {/* Exam Venue */}
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="examVenue" className="text-right">
                          Exam Venue
                        </label>
                        <Input
                          id="examVenue"
                          name="examVenue"
                          placeholder="e.g., Main Auditorium"
                          className="col-span-3"
                          value={formData.examVenue}
                          onChange={handleFormChange}
                        />
                      </div>
                      {/* Exam Duration */}
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="examDuration" className="text-right">
                          Exam Duration
                        </label>
                        <Input
                          id="examDuration"
                          name="examDuration"
                          placeholder="e.g., 3 hours"
                          className="col-span-3"
                          value={formData.examDuration}
                          onChange={handleFormChange}
                        />
                      </div>
                      {/* Exam Shift */}
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="examShift" className="text-right">
                          Exam Shift
                        </label>
                        <Select
                          value={formData.examShift}
                          onValueChange={(value) =>
                            setFormData((prev) => ({ ...prev, examShift: value }))
                          }
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select shift" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="January">January (2nd/3rd week)</SelectItem>
                            <SelectItem value="May">May (2nd/3rd week)</SelectItem>
                            <SelectItem value="September">September (2nd/3rd week)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {/* Broadcast Checkbox */}
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="broadcast" className="text-right">
                          Broadcast Announcement
                        </label>
                        <div className="col-span-3 flex items-center">
                          <input
                            id="broadcast"
                            name="broadcast"
                            type="checkbox"
                            checked={formData.broadcast}
                            onChange={handleFormChange}
                            className="mr-2"
                          />
                          <span>This announcement will be broadcasted to all students</span>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddExam}>Add Exam</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Exams Table */}
            <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden animate-fade-in">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[400px]">Exam Name</TableHead>
                      <TableHead className="w-[200px]">Exam Date</TableHead>
                      <TableHead className="w-[300px]">Application Deadline</TableHead>
                      <TableHead className="w-[200px] text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exams.length > 0 ? (
                      exams.map((exam) => (
                        <TableRow key={exam.id} className="group">
                          <TableCell className="w-[400px] font-medium">{exam.name}</TableCell>
                          <TableCell className="w-[200px]">
                            {formatDate(exam.examDate)}
                          </TableCell>
                          <TableCell className="w-[300px]">
                            {formatDate(exam.deadline)}
                          </TableCell>
                          <TableCell className="w-[200px] items-center">
                            <div className="flex justify-center items-center space-x-3">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="opacity-50 group-hover:opacity-100 hover:bg-blue-50 text-blue-600"
                                      onClick={() => openEditDialog(exam)}
                                    >
                                      <Pencil size={16} />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Edit exam</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <Calendar className="h-10 w-10 mb-2" />
                            <h3 className="text-lg font-medium">No exams found</h3>
                            <p className="text-sm">There are no exams to display.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Edit Comprehensive Exam</DialogTitle>
                  <DialogDescription>
                    Update the details of the comprehensive exam.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="edit-name" className="text-right">
                      Exam Name
                    </label>
                    <Input
                      id="edit-name"
                      name="name"
                      className="col-span-3"
                      value={formData.name}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="edit-examDate" className="text-right">
                      Exam Date
                    </label>
                    <Input
                      id="edit-examDate"
                      name="examDate"
                      type="date"
                      className="col-span-3"
                      value={formData.examDate}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="edit-deadline" className="text-right">
                      Application Deadline
                    </label>
                    <Input
                      id="edit-deadline"
                      name="deadline"
                      type="date"
                      className="col-span-3"
                      value={formData.deadline}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="edit-examVenue" className="text-right">
                      Exam Venue
                    </label>
                    <Input
                      id="edit-examVenue"
                      name="examVenue"
                      placeholder="e.g., Main Auditorium"
                      className="col-span-3"
                      value={formData.examVenue}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="edit-examDuration" className="text-right">
                      Exam Duration
                    </label>
                    <Input
                      id="edit-examDuration"
                      name="examDuration"
                      placeholder="e.g., 3 hours"
                      className="col-span-3"
                      value={formData.examDuration}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="edit-examShift" className="text-right">
                      Exam Shift
                    </label>
                    <Select
                      value={formData.examShift}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, examShift: value }))
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select shift" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="January">January (2nd/3rd week)</SelectItem>
                        <SelectItem value="May">May (2nd/3rd week)</SelectItem>
                        <SelectItem value="September">September (2nd/3rd week)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="edit-broadcast" className="text-right">
                      Broadcast Announcement
                    </label>
                    <div className="col-span-3 flex items-center">
                      <input
                        id="edit-broadcast"
                        name="broadcast"
                        type="checkbox"
                        checked={formData.broadcast}
                        onChange={handleFormChange}
                        className="mr-2"
                      />
                      <span>This announcement will be broadcasted to all students</span>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleEditExam}>Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Approved Requests Tab */}
          <TabsContent value="requests" className="pt-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-border mb-8 animate-slide-up">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="relative w-full md:w-72">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, roll number..."
                    className="pl-9"
                    value={requestSearchQuery}
                    onChange={(e) => setRequestSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Requests</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden animate-fade-in">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Student Name</TableHead>
                      <TableHead>Roll Number</TableHead>
                      <TableHead className="w-[300px]">Shift</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Approval Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.length > 0 ? (
                      filteredRequests.map((request) => (
                        <TableRow key={request.id} className="group">
                          <TableCell className="font-medium">{request.studentName}</TableCell>
                          <TableCell>{request.studentRoll}</TableCell>
                          <TableCell>{request.shift}</TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell>{formatDateReq(request.dateApplied)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <ClipboardCheck className="h-10 w-10 mb-2" />
                            <h3 className="text-lg font-medium">No requests found</h3>
                            <p className="text-sm">
                              There are no exam requests matching your search criteria.
                            </p>
                            {(statusFilter !== "all" || requestSearchQuery) && (
                              <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => {
                                  setStatusFilter("all");
                                  setRequestSearchQuery("");
                                }}
                              >
                                Clear filters
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

            <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
              <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                  <DialogTitle>Update Request Status</DialogTitle>
                  <DialogDescription>
                    Change the approval status for this comprehensive exam request.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  {selectedRequest && (
                    <div className="bg-gray-50 border border-gray-100 rounded-md p-4 mb-4">
                      <p className="font-medium">{selectedRequest.studentName}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedRequest.rollNumber}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedRequest.examName}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium">New Status</label>
                    <Select
                      value={newStatus}
                      onValueChange={(value) => setNewStatus(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select new status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="text-amber-600" />
                            <span>Pending</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="approved">
                          <div className="flex items-center gap-2">
                            <CheckCircle size={16} className="text-green-600" />
                            <span>Approved</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="rejected">
                          <div className="flex items-center gap-2">
                            <XCircle size={16} className="text-red-600" />
                            <span>Rejected</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateStatus}
                    className={cn(
                      newStatus === "approved" && "bg-green-600 hover:bg-green-700",
                      newStatus === "rejected" && "bg-red-600 hover:bg-red-700"
                    )}
                  >
                    Update Status
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments" className="pt-4">
            <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden animate-fade-in">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[400px]">Exam Name</TableHead>
                      <TableHead className="w-[200px]">Exam Date</TableHead>
                      <TableHead className="w-[300px]">Application Deadline</TableHead>
                      <TableHead className="w-[200px] text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exams.length > 0 ? (
                      exams.map((exam) => (
                        <TableRow key={exam.id} className="group">
                          <TableCell className="w-[400px] font-medium">{exam.name}</TableCell>
                          <TableCell className="w-[200px]">
                            {formatDate(exam.examDate)}
                          </TableCell>
                          <TableCell className="w-[300px]">
                            {formatDate(exam.deadline)}
                          </TableCell>
                          <TableCell className="w-[200px] items-center">
                            <div className="flex justify-center items-center">
                              <Button onClick={() => openCommentsDialog(exam)}>
                                View Comments
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-10">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <Calendar className="h-10 w-10 mb-2" />
                            <h3 className="text-lg font-medium">No exams found</h3>
                            <p className="text-sm">There are no exams to display.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            {/* ADDED: Dialog to display exam comments */}
            <Dialog open={showCommentsDialog} onOpenChange={setShowCommentsDialog}>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>
                    Comments for {selectedExamForComments?.name}
                  </DialogTitle>
                  <DialogDescription>
                    These are the comments submitted by students.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {comments.length > 0 ? (
                    comments.map((c) => (
                      <div key={c.id} className="border p-2 rounded-md">
                        <p className="font-medium">{c.studentEmail}</p>
                        <p>{c.comment}</p>
                        <p className="text-xs text-muted-foreground">
                          {(c.timestamp)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground">
                      No comments found.
                    </p>
                  )}
                </div>
                <DialogFooter>
                  <Button onClick={() => setShowCommentsDialog(false)}>Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Upload Results Tab */}
          <TabsContent value="upload" className="space-y-8">
            {!uploadSuccess ? (
              <>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
                  <h2 className="text-xl font-semibold mb-4">Upload Results File</h2>
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
                      {isUploading ? "Processing..." : "Upload Results"}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="mt-6">
                  <Button onClick={handleViewStudents} className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Comprehensive Exam Results
                  </Button>
                </div>
                {isViewing && Results.length > 0 && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-border animate-slide-up mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold">Comprehensive Exam Results</h2>
                    </div>
                    <div className="overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Core(20)</TableHead>
                            <TableHead>Specialization(80)</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Results.map((res) => (
                            <TableRow key={res.id}>
                              <TableCell className="font-medium">{res.id}</TableCell>
                              <TableCell>{res.name}</TableCell>
                              <TableCell>{res.core}</TableCell>
                              <TableCell>{res.specialization}</TableCell>
                              <TableCell>{res.specialization + res.core}</TableCell>
                              <TableCell>
                                {res.specialization + res.core >= 35 ? "Pass" : "Fail"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </>
            )}
            {!uploadSuccess && (
          <div className="bg-muted/50 rounded-xl p-6 border border-border">
            <h3 className="text-lg font-medium mb-4">Instructions</h3>
            <p className="text-sm text-muted-foreground mb-4">
      Please ensure that your Excel file strictly follows the format below. The columns must be in the exact order specified.
    </p>

    {/* Required Format */}
    <div className="mb-4 p-4 bg-primary/10 border border-primary rounded-lg">
      <p className="font-semibold text-primary mb-2">📂 Required Excel Format:</p>
      <pre className="text-sm text-muted-foreground bg-gray-100 p-3 rounded-md overflow-auto">
        | Student Roll | Student Name | Core Marks | Specialisation Marks |
      </pre>
    </div>

    <ul className="space-y-2 text-sm text-muted-foreground">
      <li className="flex items-start gap-2">
        <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center mt-0.5 flex-shrink-0">1</span>
        <span>Ensure your Excel file contains <strong>exactly 4 columns</strong> in the order shown above.</span>
      </li>
      <li className="flex items-start gap-2">
        <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center mt-0.5 flex-shrink-0">2</span>
        <span>All columns must be filled—empty values may cause errors.</span>
      </li>
      <li className="flex items-start gap-2">
        <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center mt-0.5 flex-shrink-0">3</span>
        <span>Accepted file formats: <strong>.xlsx, .xls, .csv</strong> (Max size: 5MB).</span>
      </li>
      <li className="flex items-start gap-2">
        <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center mt-0.5 flex-shrink-0">4</span>
        <span>After uploading, verify the student-guide list displayed.</span>
      </li>
    </ul>
          </div>
        )} 
          </TabsContent>
        </Tabs>

        {/* Comments Dialog */}
        <Dialog open={showCommentsDialog} onOpenChange={setShowCommentsDialog}>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Comments for {selectedExamForComments?.name}</DialogTitle>
                <DialogDescription>
                  These are the comments submitted by students.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {comments.length > 0 ? (
                  comments.map((c) => (
                    <div key={c.id} className="border p-2 rounded-md">
                      <p className="font-medium">{c.studentEmail}</p>
                      <p>{c.comment}</p>
                      <p className="text-xs text-muted-foreground">
                      {new Date(c.timestamp[0], c.timestamp[1] - 1, c.timestamp[2], c.timestamp[3], c.timestamp[4])
    .toLocaleString("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // Ensures 24-hour format
    })}
                      </p> 
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground">No comments found.</p>
                )}
              </div>
              <DialogFooter>
                <Button onClick={() =>
                  setShowCommentsDialog(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default ExamAnnouncement;
