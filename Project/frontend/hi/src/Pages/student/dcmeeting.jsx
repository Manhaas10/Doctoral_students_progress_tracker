import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios for API calls
import dayjs from "dayjs";
import Layout from '@/components/Student/layout/Layout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, FileText, Download, Search, X, Plus, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

const MeetingStatusTabs = ['draft', 'submitted', 'approved', 'rejected', 'resubmit'];

const DCMeetings = () => {
  const [activeTab, setActiveTab] = useState('draft');
  const [meetings, setMeetings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // For creating a new meeting
  const [newMeeting, setNewMeeting] = useState({
    date: '',
    time: '',
    notes: '',
    file: null,
    fileName: ''
  });

  // For editing a meeting (if needed)
  const [editMeeting, setEditMeeting] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // For viewing comments (approved/rejected)
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  // For the "New Meeting" dialog
  const [isNewMeetingOpen, setIsNewMeetingOpen] = useState(false);

  // For the "Resubmit" dialog (for rejected meetings)
  const [isResubmitOpen, setIsResubmitOpen] = useState(false);
  // New state to hold updated data for resubmission
  const [resubmitData, setResubmitData] = useState(null);

  // ------------------------------------
  // Fetch meetings from backend
  // ------------------------------------
  const fetchMeetings = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/dc-meetings/fetch", {
        withCredentials: true,
      });
      setMeetings(response.data);
    } catch (error) {
      console.error("Error fetching meetings:", error);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  // ------------------------------------
  // Create or Submit Meeting
  // ------------------------------------
  const handleSubmit = async (id) => {
    if (id) {
      // Submit an existing meeting
      try {
        const response = await axios.put(
          `http://localhost:8080/api/dc-meetings/submit/${id}`,
          {},
          { withCredentials: true }
        );
        if (response.status === 200) {
          setMeetings((prev) =>
            prev.map((m) => (m.id === id ? { ...m, status: 'submitted' } : m))
          );
          toast.success('Meeting updated and submitted successfully');
        }
      } catch (error) {
        console.error("Error submitting meeting:", error);
        toast.error("Failed to submit meeting. Please try again.");
      }
    } else {
      // Creating a new meeting
      try {
        const formData = new FormData();
        formData.append("date", newMeeting.date);
        formData.append("time", newMeeting.time);
        formData.append("writeup", newMeeting.notes);
        formData.append("status", "draft");

        if (newMeeting.file) {
          formData.append("file", newMeeting.file);
        }

        const response = await axios.post(
          "http://localhost:8080/api/dc-meetings/create",
          formData,
          { withCredentials: true }
        );

        if (response.status === 200) {
          toast.success("Meeting created successfully!");
          setIsNewMeetingOpen(false);
          setNewMeeting({ date: '', time: '', notes: '', file: null, fileName: '' });
          fetchMeetings();
        }
      } catch (error) {
        console.error("Error creating meeting:", error);
        toast.error("Failed to create meeting. Please try again.");
      }
    }
  };

  // ------------------------------------
  // Resubmit Meeting (for Rejected) with Updates
  // ------------------------------------
  const handleResubmitUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append("date", resubmitData.date);
      formData.append("time", resubmitData.time);
      formData.append("writeup", resubmitData.notes);
      // Force status to submitted when resubmitting
      formData.append("status", "submitted");

      if (resubmitData.file) {
        formData.append("file", resubmitData.file);
      }

      const response = await axios.put(
        `http://localhost:8080/api/dc-meetings/update/${resubmitData.id}`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 200) {
        toast.success("Meeting resubmitted successfully!");
        setIsResubmitOpen(false);
        setResubmitData(null);
        fetchMeetings();
      }
    } catch (error) {
      console.error("Error resubmitting meeting:", error);
      toast.error("Failed to resubmit meeting. Please try again.");
    }
  };

  // ------------------------------------
  // Download Meeting File
  // ------------------------------------
  const handleDownload = async (id, fileName) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/dc-meetings/download/${id}`,
        {
          withCredentials: true,
          responseType: 'blob',
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'file.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file. Please try again.');
    }
  };

  // ------------------------------------
  // Edit Meeting (for Drafts)
  // ------------------------------------
  const handleEdit = (meeting) => {
    setEditMeeting({ ...meeting, notes: meeting.writeup });
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append("date", editMeeting.date);
      formData.append("time", editMeeting.time);
      formData.append("writeup", editMeeting.notes);
      formData.append("status", editMeeting.status || "draft");

      if (editMeeting.file) {
        formData.append("file", editMeeting.file);
      }

      const response = await axios.put(
        `http://localhost:8080/api/dc-meetings/update/${editMeeting.id}`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 200) {
        toast.success("Meeting updated successfully!");
        setIsEditOpen(false);
        fetchMeetings();
      }
    } catch (error) {
      console.error("Error updating meeting:", error);
      toast.error("Failed to update meeting. Please try again.");
    }
  };

  // ------------------------------------
  // Format Date and Time helpers
  // ------------------------------------
  const formatDateValue = (dateField) => {
    return dayjs(dateField).format("DD/MM/YYYY");
  };

  const formatTimeValue = (timeField) => {
    return timeField ? dayjs(`1970-01-01T${timeField}`).format("HH:mm") : "No Time";
  };

  // ------------------------------------
  // Filter meetings based on status and search query
  // ------------------------------------
  const filteredMeetings = meetings
    .filter((m) => m.status === activeTab)
    .filter((m) => searchQuery === '' || m.date?.includes(searchQuery));

  // ------------------------------------
  // Render status badge
  // ------------------------------------
  const getStatusBadge = (status) => {
    const badgeStyles = {
      draft: 'bg-slate-100 text-slate-700',
      submitted: 'bg-blue-100 text-blue-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      resubmit: 'bg-amber-100 text-amber-700'
    };
    return (
      <Badge variant="outline" className={badgeStyles[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">DC Meetings</h1>
            <p className="text-muted-foreground">Manage your DC minutes submission</p>
          </div>

          <div className="flex items-center gap-4 mt-4 sm:mt-0 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by date"
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="absolute right-2 top-2.5"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* New Meeting Dialog */}
            <Dialog open={isNewMeetingOpen} onOpenChange={setIsNewMeetingOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#6A5AE0] hover:bg-[#A89FE7] transition-colors">
                  <Plus className="mr-2 h-4 w-4" /> New Minutes
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] backdrop-blur-sm bg-white/90 border border-white/40">
                <DialogHeader>
                  <DialogTitle>Submit DC Minutes</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">Date</label>
                      <Input
                        type="date"
                        value={newMeeting.date}
                        onChange={(e) =>
                          setNewMeeting({ ...newMeeting, date: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">Time</label>
                      <Input
                        type="time"
                        value={newMeeting.time}
                        onChange={(e) =>
                          setNewMeeting({ ...newMeeting, time: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">DC Writeup</label>
                    <Textarea
                      value={newMeeting.notes}
                      onChange={(e) =>
                        setNewMeeting({ ...newMeeting, notes: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">File Upload</label>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setNewMeeting({
                            ...newMeeting,
                            file: e.target.files[0],
                            fileName: e.target.files[0].name
                          });
                        }
                      }}
                    />
                    {newMeeting.fileName && (
                      <p className="text-sm text-gray-600 mt-2">{newMeeting.fileName}</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-between mt-4">
                  <Button variant="outline" onClick={() => setIsNewMeetingOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="bg-[#6A5AE0] hover:bg-[#A89FE7] transition-colors"
                    onClick={() => handleSubmit()}
                  >
                   Upload
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Meetings Card */}
        <Card className="shadow-md border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle>Meeting Records</CardTitle>
            <CardDescription>
              Filter and manage your DC meeting records by status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="draft"
              className="w-full"
              value={activeTab}
              onValueChange={(value) => setActiveTab(value)}
            >
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger
                  value="draft"
                  className="data-[state=active]:bg-[#A89FE7]/20 data-[state=active]:border-b-2 data-[state=active]:border-[#6A5AE0]"
                >
                  Draft
                </TabsTrigger>
                <TabsTrigger
                  value="submitted"
                  className="data-[state=active]:bg-[#A89FE7]/20 data-[state=active]:border-b-2 data-[state=active]:border-[#6A5AE0]"
                >
                  Submitted
                </TabsTrigger>
                <TabsTrigger
                  value="approved"
                  className="data-[state=active]:bg-[#A89FE7]/20 data-[state=active]:border-b-2 data-[state=active]:border-[#6A5AE0]"
                >
                  Approved
                </TabsTrigger>
                <TabsTrigger
                  value="rejected"
                  className="data-[state=active]:bg-[#A89FE7]/20 data-[state=active]:border-b-2 data-[state=active]:border-[#6A5AE0]"
                >
                  Rejected
                </TabsTrigger>
              </TabsList>

              {['draft', 'submitted', 'approved', 'rejected', 'resubmit'].map((tab) => (
                <TabsContent key={tab} value={tab} className="mt-0">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                            Time
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                            File Name
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                            Notes
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMeetings.length > 0 ? (
                          filteredMeetings.map((meeting) => (
                            <tr
                              key={meeting.id}
                              className="border-b border-gray-200 hover:bg-[#A89FE7]/5 transition-colors"
                            >
                              <td className="px-4 py-3 text-sm">
                                {meeting.date
                                  ? dayjs(meeting.date).format("DD/MM/YYYY")
                                  : "Invalid Date"}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {meeting?.time
                                  ? dayjs(`1970-01-01T${meeting.time}`).format("HH:mm")
                                  : "No Time"}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <div className="flex items-center">
                                  <FileText className="h-4 w-4 mr-2 text-[#3B82F6]" />
                                  <span>{meeting.fileName || "No File"}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {meeting.writeup || "No Writeup"}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {getStatusBadge(meeting.status)}
                                {(meeting.status === 'approved' || meeting.status === 'rejected') && meeting.comments && (
                                  <p className="mt-1 text-xs text-gray-600">
                                    Comments: {meeting.comments}
                                  </p>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {meeting.status === 'draft' && (
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDownload(meeting.id, meeting.fileName)}
                                    >
                                      Download
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEdit(meeting)}
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      size="sm"
                                      className="bg-[#6A5AE0] hover:bg-[#A89FE7]"
                                      onClick={() => handleSubmit(meeting.id)}
                                    >
                                      Submit
                                    </Button>
                                  </div>
                                )}

                                {meeting.status === 'submitted' && (
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDownload(meeting.id, meeting.fileName)}
                                    >
                                      Download
                                    </Button>
                                    <Button variant="outline" size="sm" disabled>
                                      Pending Review
                                    </Button>
                                  </div>
                                )}

                                {meeting.status === 'approved' && (
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDownload(meeting.id, meeting.fileName)}
                                    >
                                      Download
                                    </Button>
                                  </div>
                                )}

                                {meeting.status === 'rejected' && (
                                  <div className="flex flex-col gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDownload(meeting.id, meeting.fileName)}
                                    >
                                      Download
                                    </Button>
                                    <div className="flex gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setSelectedMeeting(meeting);
                                          setResubmitData({
                                            id: meeting.id,
                                            date: meeting.date,
                                            time: meeting.time,
                                            notes: meeting.writeup,
                                            file: null,
                                            fileName: meeting.fileName
                                          });
                                          setIsResubmitOpen(true);
                                        }}
                                      >
                                        Resubmit
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                              No meetings found with {activeTab} status.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* "Comments" Dialog for Approved/Rejected */}
                  <Dialog open={isCommentsOpen && selectedMeeting?.id} onOpenChange={setIsCommentsOpen}>
                    <DialogContent className="sm:max-w-[500px] backdrop-blur-sm bg-white/90 border border-white/40">
                      <DialogHeader>
                        <DialogTitle>Guide's Comments</DialogTitle>
                      </DialogHeader>
                      {selectedMeeting && (
                        <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-md">
                          <p className="text-sm text-amber-600">
                            {selectedMeeting.comments || "No comments provided."}
                          </p>
                        </div>
                      )}
                      <div className="flex justify-end mt-4">
                        <Button variant="outline" onClick={() => setIsCommentsOpen(false)}>
                          Close
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* "Resubmit" Dialog for Rejected Meetings */}
                  <Dialog open={isResubmitOpen && resubmitData?.id} onOpenChange={setIsResubmitOpen}>
                    <DialogContent className="sm:max-w-[500px] backdrop-blur-sm bg-white/90 border border-white/40">
                      <DialogHeader>
                        <DialogTitle>Resubmit Meeting</DialogTitle>
                      </DialogHeader>
                      {resubmitData && (
                        <div className="space-y-4 mt-2">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-sm font-medium">Date</label>
                              <Input
                                type="date"
                                value={resubmitData.date}
                                onChange={(e) =>
                                  setResubmitData({ ...resubmitData, date: e.target.value })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-sm font-medium">Time</label>
                              <Input
                                type="time"
                                value={resubmitData.time}
                                onChange={(e) =>
                                  setResubmitData({ ...resubmitData, time: e.target.value })
                                }
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-sm font-medium">DC Writeup</label>
                            <Textarea
                              value={resubmitData.notes}
                              onChange={(e) =>
                                setResubmitData({ ...resubmitData, notes: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-sm font-medium">Upload Revised File</label>
                            <Input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setResubmitData({
                                    ...resubmitData,
                                    file: e.target.files[0],
                                    fileName: e.target.files[0].name
                                  });
                                }
                              }}
                            />
                            {resubmitData.fileName && (
                              <p className="text-sm text-gray-600 mt-1">
                                Current File: {resubmitData.fileName}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="flex justify-between mt-4">
                        <Button variant="outline" onClick={() => setIsResubmitOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          className="bg-[#6A5AE0] hover:bg-[#A89FE7]"
                          onClick={handleResubmitUpdate}
                        >
                          Resubmit
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* EDIT DIALOG */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px] backdrop-blur-sm bg-white/90 border border-white/40">
          <DialogHeader>
            <DialogTitle>Edit Meeting</DialogTitle>
          </DialogHeader>
          {editMeeting && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Date</label>
                  <Input
                    type="date"
                    value={editMeeting.date}
                    onChange={(e) =>
                      setEditMeeting({ ...editMeeting, date: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Time</label>
                  <Input
                    type="time"
                    value={editMeeting.time}
                    onChange={(e) =>
                      setEditMeeting({ ...editMeeting, time: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">DC Writeup</label>
                <Textarea
                  value={editMeeting.notes}
                  onChange={(e) =>
                    setEditMeeting({ ...editMeeting, notes: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">File Upload</label>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setEditMeeting({
                        ...editMeeting,
                        file: e.target.files[0],
                        fileName: e.target.files[0].name
                      });
                    }
                  }}
                />
                {editMeeting.fileName && (
                  <p className="text-sm text-gray-600 mt-1">
                    Current File: {editMeeting.fileName}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#6A5AE0] hover:bg-[#A89FE7]"
              onClick={handleUpdate}
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default DCMeetings;
