import { useState, useEffect } from 'react';
import { Search, Check, X, Edit, Info, MessageCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// IMPORTANT: Import your custom tabs from the snippet you provided
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

import RequestStatus from '@/components/Guide/courses/RequestStatus';
import ActionDialogg from '@/components/Guide/courses/ActionDialogg';
import EditDialogg from '@/components/Guide/courses/EditDialog';
import PageLayout from "@/components/Guide/layout/Layout";
import axios from 'axios';

const Compre = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('requests'); // The default tab is "requests"
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // For the "Add Comments" modal
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);

  // All applications loaded from the backend
  const [applications, setApplications] = useState([]);
  const { toast } = useToast();

  const [guideId, setGuideId] = useState(null);

  const formatDate = (dateArray) => {
    if (!dateArray || dateArray.length < 6) return "Invalid Date";

    const [year, month, day, hour, minute, second] = dateArray;
    const date = new Date(year, month - 1, day, hour, minute, second); // Adjust month (0-based index)

    return date.toLocaleString(); // Formats based on user's locale
  };

  // Fetch guide details (including guideId) when the component mounts
  useEffect(() => {
    axios.get("http://localhost:8080/api/guides/me", { withCredentials: true })
      .then(response => {
        console.log(response.data);
        setGuideId(response.data); // Set guideId
      })
      .catch(error => {
        console.error("Error fetching guide info", error);
        toast({
          title: "Error",
          description: "Could not fetch guide details."
        });
      });
  }, []);

  // Fetch applications only when guideId is available
  useEffect(() => {
    if (!guideId) return;

    axios.get(`http://localhost:8080/api/applications/guide/${guideId}`)
      .then(response => setApplications(response.data))
      .catch(error => {
        console.error("Error fetching applications", error);
        toast({
          title: "Error",
          description: "Could not load applications."
        });
      });
  }, [guideId]);



  // ========== TAB 1: "Exam Requests" ==========
  // Filter applications for the search bar in the "requests" tab
  const filteredApplications = applications.filter(app => {
    const matchesSearch =
      String(app.examId).toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.studentEmail.toLowerCase().includes(searchQuery.toLowerCase());

    // Only filter by search here; we always show everything in the "requests" tab
    return matchesSearch;
  });

  // Approve/Reject
  const handleAction = (application, type) => {
    console.log(application.specializedSyllabi);
    setSelectedRequest(application);
    setActionType(type);
    setDialogOpen(true);
  };

  const handleConfirmAction = () => {
    const newStatus = actionType === 'approve' ? 'Approved' : 'Rejected';
    axios.put(`http://localhost:8080/api/applications/${selectedRequest.id}`, {
      status: newStatus
    })
      .then(response => {
        toast({
          title: `Application ${newStatus}`,
          description: `You have ${newStatus.toLowerCase()} the application from ${selectedRequest.studentEmail}`
        });
        setApplications(applications.map(app =>
          app.id === selectedRequest.id ? response.data : app
        ));
        setDialogOpen(false);
      })
      .catch(error => {
        console.error("Error updating application", error);
        toast({
          title: "Error",
          description: "Could not update the application."
        });
      });
  };

  // Edit
  const handleEdit = (application) => {
    setSelectedRequest(application);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = (editedApplication) => {
    axios.put(`http://localhost:8080/api/applications/${editedApplication.id}`, editedApplication)
      .then(response => {
        toast({
          title: "Application Updated",
          description: "The application has been updated successfully."
        });
        setApplications(applications.map(app =>
          app.id === editedApplication.id ? response.data : app
        ));
        setEditDialogOpen(false);
      })
      .catch(error => {
        console.error("Error saving edits", error);
        toast({
          title: "Error",
          description: "Could not save the application edits."
        });
      });
  };

  // Details
  const handleDetails = (application) => {
    setSelectedRequest(application);
    setDetailsDialogOpen(true);
  };

  // ========== TAB 2: "Add Comments" ==========
  console.log("Applications:", applications);

  const rejectedApplications = (applications || []).filter((app) => {
    console.log("Checking Application:", app);
    console.log("Status:", app.status);
    console.log(app.studentEmail);
    return (app.status || '') === 'Rejected';
  });

  console.log("Rejected Applications:", rejectedApplications);


  // Add/Update comment for a rejected application
  const handleAddComment = (application) => {
    console.log(application.studentEmail);
    setSelectedRequest(application);
    setCommentDialogOpen(true);
  };

  // Save the comment to the backend
  const handleSaveComment = (applicationWithComment) => {
    // Prepare the payload (using the full DTO expected by the backend)
    const payload = {
      status: applicationWithComment.status,
      shift: applicationWithComment.shift,
      specializedSyllabi: applicationWithComment.specializedSyllabi
        ? applicationWithComment.specializedSyllabi.map(s => s.content)
        : [],
      guideComment: applicationWithComment.guideComment // use the guideComment from the object
    };

    // If the current guideComment is null, use POST to create the comment;
    // otherwise, use PUT to update it.
    if (applicationWithComment.guideComment === null) {
      // For POST, we need additional fields like examId and studentEmail
      axios.post("http://localhost:8080/api/applications", {
        examId: applicationWithComment.examId,
        studentEmail: applicationWithComment.studentEmail,
        ...payload
      }, { headers: { "Content-Type": "application/json" } })
        .then(response => {
          toast({
            title: "Comment Saved",
            description: "Your comment has been saved successfully."
          });
          // Update local state with the new application (the created record)
          setApplications(applications.map(app =>
            app.id === applicationWithComment.id ? response.data : app
          ));
          setCommentDialogOpen(false);
        })
        .catch(error => {
          console.error("Error saving comment", error);
          toast({
            title: "Error",
            description: "Could not save the comment."
          });
        });
    } else {
      // If a guide comment already exists, update it using PUT
      axios.put(`http://localhost:8080/api/applications/${applicationWithComment.id}`, payload, {
        headers: { "Content-Type": "application/json" }
      })
        .then(response => {
          toast({
            title: "Comment Updated",
            description: "Your comment has been updated successfully."
          });
          setApplications(applications.map(app =>
            app.id === applicationWithComment.id ? response.data : app
          ));
          setCommentDialogOpen(false);
        })
        .catch(error => {
          console.error("Error updating comment", error);
          toast({
            title: "Error",
            description: "Could not update the comment."
          });
        });
    }
  };

  return (
    <PageLayout>
      <div className="flex h-screen">
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* This is your new top bar with two tabs: "Exam Requests" and "Add Comments" */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Tab Triggers */}
            <TabsList className="space-x-2 bg-gray-100 border-none p-2">
              <TabsTrigger value="requests" className="px-4 py-2">
                Exam Requests
              </TabsTrigger>
              <TabsTrigger value="comments" className="px-4 py-2">
                Add Comments
              </TabsTrigger>
            </TabsList>

            {/* ========== TAB CONTENTS ========== */}

            {/* ========== Tab 1: Exam Requests ========== */}
            <TabsContent value="requests" className="flex-1">
              <div className="page-container p-4">
                <div className="max-w-full mx-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Exam Requests</h2>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                    <div className="flex flex-col gap-4">
                      <div>
                        <h3 className="text-lg font-semibold">View exam requests</h3>
                        <p className="text-sm text-gray-500">
                          Track the status and update exam applications.
                        </p>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {/* <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              type="text"
                              placeholder="Search applications..."
                              className="pl-10 w-[250px]"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                            />
                          </div> */}
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Exam ID
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Student Name
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Applied Date
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Shift
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {filteredApplications.length > 0 ? (
                              filteredApplications.map((application) => {
                                const statusLower = application.status?.toLowerCase() || '';
                                return (
                                  <tr key={application.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                      {application.examId}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {application.studentName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {formatDate(application.dateApplied)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <RequestStatus status={application.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {application.shift || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {statusLower === 'submitted' || statusLower === 'pending' ? (
                                        <div className="flex space-x-2">
                                          <Button
                                            onClick={() => handleAction(application, 'approve')}
                                            variant="outline"
                                            size="sm"
                                            className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                          >
                                            <Check className="h-4 w-4 mr-1" />
                                            Approve
                                          </Button>
                                          <Button
                                            onClick={() => handleAction(application, 'reject')}
                                            variant="outline"
                                            size="sm"
                                            className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                          >
                                            <X className="h-4 w-4 mr-1" />
                                            Reject
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEdit(application)}
                                          >
                                            <Edit className="h-4 w-4 mr-1" />
                                            Edit
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDetails(application)}
                                          >
                                            <Info className="h-4 w-4 mr-1" />
                                            Details
                                          </Button>
                                        </div>
                                      ) : (
                                        <div className="flex space-x-2">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEdit(application)}
                                          >
                                            <Edit className="h-4 w-4 mr-1" />
                                            Edit
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDetails(application)}
                                          >
                                            <Info className="h-4 w-4 mr-1" />
                                            Details
                                          </Button>
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                  No applications found matching your criteria.
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
            </TabsContent>

            {/* ========== Tab 2: Add Comments (Rejected apps) ========== */}
            <TabsContent value="comments" className="flex-1">
              <div className="p-4">
                <h2 className="text-2xl font-bold mb-4">Add Comments for Rejected Applications</h2>
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                  <div className="flex flex-col gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">Rejected Applications</h3>
                      <p className="text-sm text-gray-500">
                        Add or update comments for students to address before resubmission.
                      </p>
                    </div>

                    <RejectedAppsTable
                      applications={rejectedApplications}
                      onAddComment={handleAddComment}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Approve/Reject Confirmation Dialog */}
        <ActionDialogg
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          actionType={actionType}
          request={selectedRequest}
          onConfirm={handleConfirmAction}
        />

        {/* Edit Application Dialog */}
        <EditDialogg
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          request={selectedRequest}
          onSave={handleSaveEdit}
        />

        {/* Details Dialog */}
        <DetailsDialog
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          request={selectedRequest}
        />

        {/* Comment Dialog */}
        <CommentDialog
          open={commentDialogOpen}
          onOpenChange={setCommentDialogOpen}
          request={selectedRequest}
          onSave={handleSaveComment}
        />
      </div>
    </PageLayout>
  );
};

// ============= RejectedAppsTable Component =============
const RejectedAppsTable = ({ applications, onAddComment }) => {
  if (!applications || applications.length === 0) {
    return (
      <div className="p-2 text-gray-500">
        No rejected applications found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Exam ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Student Roll No
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Student Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Comment
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {applications.map((app) => (
            <tr key={app.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {app.examId}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {app.studentRoll}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {app.studentName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {/* Display the guide's rejection comment if it exists */}
                {app.guideComment || 'No comment yet'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddComment(app)}
                  className="flex items-center"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Add/Update Comment
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ============= CommentDialog Component =============
const CommentDialog = ({ open, onOpenChange, request, onSave }) => {
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (request && request.guideComment) {
      setComment(request.guideComment);
    } else {
      setComment('');
    }
  }, [request]);

  if (!open || !request) return null;

  const handleSave = () => {
    // We'll just store this comment in a new field, e.g. "guideComment"
    const updatedApp = {
      ...request,
      guideComment: comment
    };
    onSave(updatedApp);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-white rounded p-6 w-96 max-h-full overflow-auto">
        <h3 className="text-xl font-bold mb-4">Add/Edit Comment</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Guide Comment</label>
          <textarea
            className="w-full p-2 border rounded"
            rows={4}
            placeholder="Explain why this application was rejected..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </div>
  );
};

// ============= EditDialog Component (Existing) =============
const EditDialog = ({ open, onOpenChange, request, onSave }) => {
  const [editedStatus, setEditedStatus] = useState('');
  const [editedShift, setEditedShift] = useState('');
  const [editedSyllabi, setEditedSyllabi] = useState([]);

  useEffect(() => {
    if (request) {
      setEditedStatus(request.status || '');
      setEditedShift(request.shift || '');
      const syllabiArr = request.specializedSyllabi
        ? request.specializedSyllabi.map(s => s.content)
        : [];
      setEditedSyllabi(syllabiArr);
    }
  }, [request]);

  if (!open) return null;

  const handleSyllabusChange = (index, value) => {
    setEditedSyllabi((prevSyllabi) => {
      const newSyllabi = [...prevSyllabi];
      newSyllabi[index] = value;
      return newSyllabi;
    });
  };

  const handleAddSyllabus = () => {
    setEditedSyllabi([...editedSyllabi, '']);
  };

  const handleRemoveSyllabus = (index) => {
    const newSyllabi = editedSyllabi.filter((_, i) => i !== index);
    setEditedSyllabi(newSyllabi);
  };

  const handleSave = () => {
    const updatedApplication = {
      ...request,
      status: editedStatus,
      shift: editedShift,
      specializedSyllabi: editedSyllabi
        .map(text => text.trim())
        .filter(text => text)
    };
    onSave(updatedApplication);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded p-6 w-96 max-h-full overflow-auto">
        <h3 className="text-xl font-bold mb-4">Edit Application</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Status</label>
          <Input
            value={editedStatus}
            onChange={(e) => setEditedStatus(e.target.value)}
            placeholder="Enter status"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Shift</label>
          <Input
            value={editedShift}
            onChange={(e) => setEditedShift(e.target.value)}
            placeholder="e.g., Morning, Afternoon, Evening"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Specialized Syllabi</label>
          {editedSyllabi.map((syllabus, index) => (
            <div key={index} className="flex items-center mb-2">
              <Input
                value={syllabus}
                onChange={(e) => handleSyllabusChange(index, e.target.value)}
                placeholder={`Syllabus ${index + 1}`}
              />
              <Button
                variant="outline"
                size="sm"
                className="ml-2"
                onClick={() => handleRemoveSyllabus(index)}
              >
                X
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={handleAddSyllabus}>
            Add New Syllabus
          </Button>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </div>
  );
};

// ============= DetailsDialog Component (Existing) =============
const DetailsDialog = ({ open, onOpenChange, request }) => {
  if (!open || !request) return null;

  const formatDate = (dateArray) => {
    if (!dateArray || dateArray.length < 6) return "Invalid Date";

    const [year, month, day, hour, minute, second] = dateArray;
    const date = new Date(year, month - 1, day, hour, minute, second); // Adjust month (0-based index)

    return date.toLocaleString(); // Formats based on user's locale
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-white rounded p-6 w-96 max-h-full overflow-auto">
        <h3 className="text-xl font-bold mb-4">Application Details</h3>
        <div className="mb-2">
          <strong>Exam ID:</strong> {request.examId}
        </div>
        <div className="mb-2">
          <strong>Student Email:</strong> {request.studentEmail}
        </div>
        <div className="mb-2">
          <strong>Applied Date:</strong>{' '}
          {request?.dateApplied
            ? formatDate(request.dateApplied)
            : 'Invalid Date'}
        </div>
        <div className="mb-2">
          <strong>Status:</strong> {request.status}
        </div>
        <div className="mb-2">
          <strong>Shift:</strong> {request.shift || 'N/A'}
        </div>
        <div className="mb-2">
          <strong>Specialized Syllabi:</strong>
          <ul className="list-disc list-inside">
            {request.specializedSyllabi && request.specializedSyllabi.length > 0 ? (
              request.specializedSyllabi.map((s, index) => (
                <li key={s.id || index}>{s.content}</li>
              ))
            ) : (
              <li>No syllabi provided.</li>
            )}
          </ul>
        </div>
        {/* Show the guide comment if any */}
        {request.guideComment && (
          <div className="mb-2">
            <strong>Guide Comment:</strong> {request.guideComment}
          </div>
        )}
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </div>
    </div>
  );
};

export default Compre;
