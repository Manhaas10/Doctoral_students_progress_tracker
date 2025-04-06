import React, { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/Guide/layout/Layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  FileText, 
  Download, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  User,
  MoreHorizontal,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const MeetingApprovals = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [records, setRecords] = useState([]);

  // NEW STATE: For supervisor action dialog (Approve/Reject)
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);
  const [actionType, setActionType] = useState(null); // "Approved" or "Rejected"
  const [actionComment, setActionComment] = useState("");
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);

  // Fetch real data from backend for supervisor
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/dc-meetings/fetch-for-supervisor", {
        withCredentials: true,
      })
      .then((res) => setRecords(res.data))
      .catch((err) => console.error("Error fetching meetings:", err));
  }, []);

  // Function to format date if it's returned as an array or string
  const formatDate = (dateField) => {
    if (Array.isArray(dateField)) {
      return dayjs(new Date(dateField[0], dateField[1] - 1, dateField[2])).format("DD/MM/YYYY");
    }
    return dayjs(dateField).format("DD/MM/YYYY");
  };

  // Function to format time if it's returned as an array or string
  const formatTime = (timeField) => {
    if (Array.isArray(timeField)) {
      return dayjs(new Date(1970, 0, 1, timeField[0], timeField[1])).format("HH:mm");
    }
    return timeField ? dayjs(`1970-01-01T${timeField}`).format("HH:mm") : "No Time";
  };

  // Filter records by search term based on multiple fields
  const getFilteredRecords = (status) => {
    return records
      .filter((record) => record.status.toLowerCase() === status.toLowerCase())
      .filter(
        (record) =>
          record.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.writeup.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          formatDate(record.date).includes(searchTerm)
      );
  };

  // Map status to an icon
  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "submitted":
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  // Supervisor Action: Approve/Reject with Comments
  const handleAction = async (id, action, comment) => {
    try {
      const response = await axios.put(
        `http://localhost:8080/api/dc-meetings/supervisor-action/${id}`,
        { 
          status: action.toLowerCase(),
          comments: comment,
        },
        { withCredentials: true }
      );

      if (response.status === 200) {
        toast({
          title: `Document ${action}`,
          description: `You have ${action.toLowerCase()} the document submission.`,
          variant: action === "Approved" ? "default" : "destructive",
        });
        // Update local state so UI moves record to new status tab
        setRecords((prevRecords) =>
          prevRecords.map((rec) =>
            rec.id === id ? { ...rec, status: action.toLowerCase(), comments: comment } : rec
          )
        );
      }
    } catch (error) {
      console.error(`Error ${action.toLowerCase()}ing document:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action.toLowerCase()} document. Please try again.`,
        variant: "destructive",
      });
    }
  };

  // Download handler
  const handleDownload = async (id, fileName) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/dc-meetings/download/${id}`,
        {
          withCredentials: true,
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName || "file.pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast({
        title: "Download Error",
        description: "Failed to download file. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <PageLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Minutes Approvals</h1>
          <p className="text-muted-foreground mt-1">
            Review and approve student submitted meeting documents
          </p>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Student Submissions</CardTitle>
                <CardDescription>
                  Review and manage student DC meeting Minutes
                </CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search by name or content..."
                  className="pl-8 w-full sm:w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="submitted" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="submitted">Pending Review</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>

              {["draft", "submitted", "approved", "rejected"].map((status) => (
                <TabsContent key={status} value={status} className="animate-fade-up">
                  <div className="rounded-md border">
                    {/* Header row */}
                    <div className="grid grid-cols-12 gap-4 p-4 text-sm font-medium text-gray-500 bg-gray-50 rounded-t-md">
                      <div className="col-span-1">Date</div>
                      <div className="col-span-1">Time</div>
                      <div className="col-span-2">Student</div>
                      <div className="col-span-2">Document</div>
                      <div className="col-span-3">Writeup</div>
                      <div className="col-span-1">Status</div>
                      <div className="col-span-2 text-right">Actions</div>
                    </div>
                    <Separator />

                    {/* Rows */}
                    {getFilteredRecords(status).length > 0 ? (
                      getFilteredRecords(status).map((record) => {
                        const displayDate = formatDate(record.date);
                        const displayTime = formatTime(record.time);
                        return (
                          <div key={record.id} className="animate-fade-in">
                            <div className="grid grid-cols-12 gap-4 p-4 items-center text-sm hover:bg-gray-50 transition-colors">
                              <div className="col-span-1">{displayDate}</div>
                              <div className="col-span-1">{displayTime}</div>
                              <div className="col-span-2 flex items-center">
                                <User className="h-4 w-4 mr-2 text-gray-400" />
                                <span className="truncate">{record.studentEmail}</span>
                              </div>
                              <div className="col-span-2 flex items-center">
                                <FileText className="h-4 w-4 mr-2 text-gray-400" />
                                <span className="truncate">{record.fileName}</span>
                              </div>
                              <div className="col-span-3 flex items-center">
                                <span className="truncate">{record.writeup}</span>
                                {record.writeup && record.writeup.length > 70 && (
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button variant="ghost" size="icon" className="ml-1 h-6 w-6">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80 max-h-60 overflow-y-auto p-4">
                                      <div className="text-sm">
                                        <p className="font-medium mb-1">Full Writeup:</p>
                                        <p className="text-gray-700">{record.writeup}</p>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                )}
                              </div>
                              <div className="col-span-1">
                                <div className="flex flex-col">
                                  <div className="flex items-center">
                                    {getStatusIcon(record.status)}
                                    <span className={cn(
                                      "ml-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
                                      record.status === "submitted" && "bg-blue-100 text-blue-800",
                                      record.status === "approved" && "bg-green-100 text-green-800",
                                      record.status === "rejected" && "bg-red-100 text-red-800",
                                      record.status === "draft" && "bg-gray-100 text-gray-800"
                                    )}>
                                      {record.status.charAt(0).toUpperCase() +
                                        record.status.slice(1)}
                                    </span>
                                  </div>
                                  {(record.status.toLowerCase() === "approved" ||
                                    record.status.toLowerCase() === "rejected") &&
                                    record.comments && (
                                      <p className="mt-1 text-xs text-gray-600">
                                        Comments: {record.comments}
                                      </p>
                                    )}
                                </div>
                              </div>
                              <div className="col-span-2 flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Download Document"
                                  onClick={() =>
                                    handleDownload(record.id, record.fileName)
                                  }
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                {status === "submitted" && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-green-600"
                                      title="Approve Submission"
                                      onClick={() => {
                                        setSelectedMeetingId(record.id);
                                        setActionType("Approved");
                                        setActionComment("");
                                        setIsActionDialogOpen(true);
                                      }}
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-red-600"
                                      title="Reject Submission"
                                      onClick={() => {
                                        setSelectedMeetingId(record.id);
                                        setActionType("Rejected");
                                        setActionComment("");
                                        setIsActionDialogOpen(true);
                                      }}
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                            <Separator />
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-8 text-center text-muted-foreground">
                        No {status} records found
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Back button */}
      <div className="absolute right-4 bottom-4">
        <Button variant="outline" onClick={() => navigate("/meetings_g")}>
          ← Back
        </Button>
      </div>

      {/* ---------- Supervisor Action Dialog for Approve/Reject ---------- */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {actionType === "Approved" ? "Approve Document" : "Reject Document"}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Please provide your comments (optional):
            </p>
            <Input
              placeholder="Enter comments..."
              value={actionComment}
              onChange={(e) => setActionComment(e.target.value)}
              className="mt-2"
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className={actionType === "Approved" ? "bg-green-600" : "bg-red-600"}
              onClick={() => {
                handleAction(selectedMeetingId, actionType, actionComment);
                setIsActionDialogOpen(false);
              }}
            >
              Confirm {actionType}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default MeetingApprovals;
