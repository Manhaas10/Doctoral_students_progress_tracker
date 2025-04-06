import React, { useState, useEffect } from 'react'
import Layout from '@/components/student/layout/Layout'
import axios from "axios"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, FileText, GraduationCap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

// Helper function to format the date array
const formatDate = (dateArray) => {
  if (!dateArray || dateArray.length < 6) return "Invalid Date";
  const [year, month, day, hour, minute, second] = dateArray;
  // Note: month is 0-indexed in JS Date, so subtract 1
  const date = new Date(year, month - 1, day, hour, minute, second);
  return date.toLocaleString();
};

const Exam = () => {
  // ------------------ State ------------------
  const [activeTab, setActiveTab] = useState('announcements')

  // For applying/resubmitting
  const [showApplyDialog, setShowApplyDialog] = useState(false)
  const [selectedExam, setSelectedExam] = useState(null)
  const [isResubmitting, setIsResubmitting] = useState(false)
  const [resubmitAppId, setResubmitAppId] = useState(null)
  const [specializedSyllabi, setSpecializedSyllabi] = useState([''])

  // For adding comments on announcements
  const [showCommentDialog, setShowCommentDialog] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null)
  const [comment, setComment] = useState('')

  // For details modal (view approved application details)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)

  const handleViewDetails = (request) => {
    setSelectedRequest(request)
    setDetailsOpen(true)
  };
  const [results, setResults] = useState([]);
  const [loding, setLoading] = useState(false);

  // Fetched data
  const [currentStudent, setCurrentStudent] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [applications, setApplications] = useState([])

  // Example student results (unchanged)
  const studentResults = [
    {
      id: 1,
      rollNo: 'P210545CS',
      coreMarks: 16,
      specializationMarks: 72,
      totalMarks: 88,
      status: 'Pass',
      semester: 'Sem 1'
    },
    {
      id: 2,
      rollNo: 'P220545CS',
      coreMarks: 14,
      specializationMarks: 68,
      totalMarks: 82,
      status: 'Pass',
      semester: 'Sem 2'
    },
    {
      id: 3,
      rollNo: 'P230545CS',
      coreMarks: 10,
      specializationMarks: 24,
      totalMarks: 34,
      status: 'Fail',
      semester: 'Sem 3'
    }
  ]

  // ------------------ Fetch Student Profile ------------------
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/user/profile', {
          credentials: 'include'
        })
        if (!res.ok) throw new Error('Failed to fetch user profile')
        const profile = await res.json()
        setCurrentStudent({
          name: profile.name,
          email: profile.email,
          rollNo: profile.rollNumber,
        })
        // console.log(currentStudent);
      } catch (error) {
        console.error(error)
        toast.error('Failed to fetch user profile.')
      }
    }
    fetchUserInfo()
  }, [])
  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        console.log(currentStudent.rollNo);
        const res = await axios.get(`http://localhost:8080/api/results/${currentStudent.rollNo}`);
        
        // setResults(res.data); 
        setResults(Array.isArray(res.data) ? res.data : [res.data]);
        console.log("Updated results:", res.data); // ✅ Logs correct API response
      } catch (error) {
        console.error("Failed to fetch results:", error);
        toast.error("Failed to fetch results.");
      } finally {
        setLoading(false);
      }
    };
  
    // if (currentStudent.rollNo) {
      fetchResults();
    // }
  }, [currentStudent]);
  

  // ------------------ Fetch Announcements & Applications ------------------
  useEffect(() => {
    if (!currentStudent) return; // Wait until currentStudent is available

    const fetchData = async () => {
      try {
        // 1) Get all exam announcements
        const examRes = await fetch('http://localhost:8080/api/exams')
        if (!examRes.ok) throw new Error('Failed to fetch exams')
        const examData = await examRes.json()

        // Map each exam to a simpler object
        const mappedExams = examData.map((exam) => ({
          id: exam.id,
          examName: exam.name,
          examDate: exam.examDate,
          subject: exam.examVenue || 'N/A',
          registrationDeadline: exam.deadline,
          isOpen: exam.broadcast,
          shift: exam.examShift
        }))
        setAnnouncements(mappedExams)

        // 2) Get this student's existing applications
        const appsRes = await fetch(
          `http://localhost:8080/api/applications/student/${currentStudent.email}`
        )
        if (!appsRes.ok) throw new Error('Failed to fetch applications')
        const appsData = await appsRes.json()
        setApplications(appsData)
      } catch (err) {
        console.error(err)
        toast.error(err.message)
      }
    }

    fetchData()
  }, [currentStudent])

  // ------------------ "Apply Now" / Resubmit Logic ------------------
  const handleApply = (exam) => {
    setSelectedExam(exam)
    setIsResubmitting(false)
    setResubmitAppId(null)
    setSpecializedSyllabi(['']) // Reset
    setShowApplyDialog(true)
  }

  const handleResubmit = (application, exam) => {
    // Prefill from existing application
    setSelectedExam(exam)
    setSpecializedSyllabi(application.specializedSyllabi || [''])
    setIsResubmitting(true)
    setResubmitAppId(application.id)
    setShowApplyDialog(true)
  }
  // console.log(selectedExam);

  const handleConfirmApplication = async () => {
    if (!selectedExam) return

    try {
      const formattedSyllabi = specializedSyllabi.map((s) => s.content)
      if (isResubmitting && resubmitAppId) {
        // Updating existing (rejected) application
        const response = await fetch(
          `http://localhost:8080/api/applications/${resubmitAppId}`,
          {
            method: 'PUT', // or PATCH
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              examId: selectedExam.id,
              name: selectedExam.examName,
              studentEmail: currentStudent.email,
              specializedSyllabi: formattedSyllabi,
              status: 'Submitted',
              shift: selectedExam.shift
            })
          }
        )
        if (!response.ok) throw new Error('Failed to resubmit application')

        toast.success(`Successfully resubmitted for ${selectedExam.examName}`)
      } else {
        // New application
        const response = await fetch('http://localhost:8080/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            examId: selectedExam.id,
            name: selectedExam.examName,
            studentEmail: currentStudent.email,
            specializedSyllabi: formattedSyllabi,
            status: 'Submitted',
            shift: selectedExam.shift
          })
        })
        
        if (!response.ok) throw new Error('Failed to submit application')

        toast.success(`Successfully applied for ${selectedExam.examName}`)
      }

      // Close dialog & refresh
      setShowApplyDialog(false)
      setIsResubmitting(false)
      setResubmitAppId(null)

      const updatedApps = await fetch(
        `http://localhost:8080/api/applications/student/${currentStudent.email}`
      )
      if (updatedApps.ok) {
        setApplications(await updatedApps.json())
      }
    } catch (error) {
      console.error(error)
      toast.error(error.message)
    }
  }
  console.log("h",applications);

  // ------------------ "Add Comment" on Announcement ------------------
  const handleAddComment = (announcement) => {
    setSelectedAnnouncement(announcement)
    setComment('')
    setShowCommentDialog(true)
  }

  const handleConfirmComment = async () => {
    if (!selectedAnnouncement) return
    try {
      const response = await fetch(
        `http://localhost:8080/api/exams/${selectedAnnouncement.id}/comments`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentEmail: currentStudent.email,
            comment
          })
        }
      )
      if (!response.ok) throw new Error('Failed to submit comment')

      toast.success(`Comment submitted for ${selectedAnnouncement.examName}`)
      setShowCommentDialog(false)
    } catch (error) {
      console.error(error)
      toast.error(error.message)
    }
  }

  // ------------------ Filter Applications by Status ------------------
  const draftApplications = applications.filter((a) => a.status === 'DRAFT')
  const submittedApplications = applications.filter((a) => a.status === 'Submitted')
  const approvedApplications = applications.filter((a) => a.status === 'Approved')
  const rejectedApplications = applications.filter((a) => a.status === 'Rejected')

  // ------------------ Student Results Logic ------------------
  // const [selectedSemester, setSelectedSemester] = useState('')
  // const semesterGroups = studentResults.reduce((acc, result) => {
  //   if (!acc[result.semester]) acc[result.semester] = []
  //   acc[result.semester].push(result)
  //   return acc
  // }, {})
  // const semesters = Object.keys(semesterGroups)
  // const displaySemester =
    // selectedSemester || (semesters.length > 0 ? semesters[0] : '')
  // const displayResults = semesterGroups[displaySemester] || []

  // If profile not loaded yet
  if (!currentStudent) {
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    )
  }
  useEffect(() => {
    console.log("Updated results:", results); // ✅ Logs updated state
    console.log("Results length:", results.length); // ✅ Now `results.length` is defined
  }, [results]);

  // ------------------ Render ------------------
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Comprehensive Exam Management
        </h1>

        {/*
          TOP-LEVEL TABS (4):
          1) Announcements
          2) Apply
          3) Comments
          4) Results
        */}
        <Tabs
          defaultValue="announcements"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="announcements" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Announcements
            </TabsTrigger>

            <TabsTrigger value="apply" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Apply
            </TabsTrigger>

            <TabsTrigger value="comments" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Add Comment
            </TabsTrigger>

            <TabsTrigger value="results" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Results
            </TabsTrigger>
          </TabsList>

          {/** ========== TAB 1: Announcements ========== */}
          <TabsContent value="announcements" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              {announcements.length > 0 ? (
                announcements.map((exam) => (
                  <Card key={exam.id} className="card-transition">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle>{exam.examName}</CardTitle>
                        {exam.isOpen && <Badge variant="default">Open</Badge>}
                      </div>
                      <CardDescription>{exam.subject}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">Exam Date:</span>
                          <span>{new Date(exam.examDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Deadline:</span>
                          <span>{new Date(exam.registrationDeadline).toLocaleDateString()}</span>
                        </div>
                        {exam.shift && (
                          <div className="flex justify-between">
                            <span className="font-medium">Shift:</span>
                            <span>{exam.shift}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-muted-foreground mt-4">
                  No announcements available.
                </p>
              )}
            </div>
          </TabsContent>

          {/** ========== TAB 2: Apply (Available Exams + Nested Tabs for Student's Applications) ========== */}
          <TabsContent value="apply" className="mt-2">
            {/* --- Open Exams (no heading) --- */}
            {/* --- Nested Tabs for Existing Applications --- */}
            <Tabs defaultValue="draft" className="mt-2">
              <TabsList>
                <TabsTrigger value="draft">Draft</TabsTrigger>
                <TabsTrigger value="submitted">Submitted</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>

              {/* Draft Applications */}
              <TabsContent value="draft" className="mt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {announcements
                    .filter(
                      (exam) =>
                        exam.isOpen &&
                        !applications.some((app) => app.examId === exam.id)
                    )
                    .map((exam) => (
                      <Card key={exam.id} className="card-transition">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle>{exam.examName}</CardTitle>
                            <Badge variant="default">Open</Badge>
                          </div>
                          <CardDescription>{exam.subject}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="font-medium">Exam Date:</span>
                              <span>{new Date(exam.examDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Deadline:</span>
                              <span>{new Date(exam.registrationDeadline).toLocaleDateString()}</span>
                            </div>
                            {exam.shift && (
                              <div className="flex justify-between">
                                <span className="font-medium">Shift:</span>
                                <span>{exam.shift}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button onClick={() => handleApply(exam)}>Apply Now</Button>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              </TabsContent>

              {/* Submitted Applications */}
              <TabsContent value="submitted" className="mt-4">
                {submittedApplications.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {submittedApplications.map((app) => (
                      <Card key={app.id} className="card-transition">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle>Exam Name: {app.name}</CardTitle>
                            <Badge variant="default">Submitted</Badge>
                          </div>
                          <CardDescription>Roll: {app.studentRoll}</CardDescription>
                          <CardDescription>Shift: {app.shift}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {app.guideComment && (
                            <div className="mt-2 p-2 border rounded-md bg-gray-50">
                              <p className="text-sm font-medium">Guide’s Comments:</p>
                              <p className="text-sm">{app.guideComment}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground mt-4">No submitted applications.</p>
                )}
              </TabsContent>

              {/* Approved Applications */}
              <TabsContent value="approved" className="mt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {approvedApplications.map((app) => (
                    <Card key={app.id} className="card-transition">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle>Exam Name: {app.name}</CardTitle>
                          <Badge variant="default">Approved</Badge>
                        </div>
                        <CardDescription>Roll: {app.studentRoll}</CardDescription>
                        <CardDescription>Shift: {app.shift}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {app.guideComment && (
                          <div className="mt-2 p-2 border rounded-md bg-gray-50">
                            <p className="text-sm font-medium">Guide’s Comments:</p>
                            <p className="text-sm">{app.guideComment}</p>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter>
                        <Button onClick={() => handleViewDetails(app)}>View Details</Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Rejected Applications */}
              <TabsContent value="rejected" className="mt-4">
                {rejectedApplications.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {rejectedApplications.map((app) => (
                      <Card key={app.id} className="card-transition">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle>Exam Name: {app.name}</CardTitle>
                            <Badge variant="destructive">Rejected</Badge>
                          </div>
                          <CardDescription>Roll: {app.studentRoll}</CardDescription>
                          <CardDescription>Shift: {app.shift}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {app.guideComment && (
                            <div className="mt-2 p-2 border rounded-md bg-gray-50">
                              <p className="text-sm font-medium">Guide’s Comments:</p>
                              <p className="text-sm">{app.guideComment}</p>
                            </div>
                          )}
                        </CardContent>
                        <CardFooter>
                          <Button variant="outline" onClick={() => handleResubmit(app, { id: app.examId })}>
                            Resubmit
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground mt-4">No rejected applications.</p>
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/** ========== TAB 3: Comments (Add Comment) ========== */}
          <TabsContent value="comments" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Add Comment</CardTitle>
                <CardDescription>
                  Select an announcement below and add your comment.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {announcements.filter((a) => a.isOpen).length > 0 ? (
                    announcements
                      .filter((a) => a.isOpen)
                      .map((announcement) => (
                        <Card key={announcement.id} className="overflow-hidden">
                          <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                              <h3 className="font-medium">{announcement.examName}</h3>
                              <p className="text-sm text-muted-foreground">
                                {announcement.subject}
                              </p>
                              <div className="flex flex-col md:flex-row gap-4 mt-2">
                                <span className="text-sm">
                                  <span className="font-medium">Exam Date:</span>{' '}
                                  {new Date(announcement.examDate).toLocaleDateString()}
                                </span>
                                <span className="text-sm">
                                  <span className="font-medium">Deadline:</span>{' '}
                                  {new Date(announcement.registrationDeadline).toLocaleDateString()}
                                </span>
                              </div>
                              {announcement.shift && (
                                <div className="flex justify-between mt-2">
                                  <span className="font-medium">Shift:</span>
                                  <span>{announcement.shift}</span>
                                </div>
                              )}
                            </div>
                            <Button onClick={() => handleAddComment(announcement)}>
                              Add Comment
                            </Button>
                          </div>
                        </Card>
                      ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        There are no open announcements at this time.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/** ========== TAB 4: Results ========== */}
          <TabsContent value="results" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>My Exam Results</CardTitle>
                <CardDescription>
                  View your comprehensive exam results.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-4 bg-muted rounded-lg">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-8">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                      <div>
                        <span className="text-sm font-medium">Student Name:</span>
                        <span className="ml-2">{currentStudent.name}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Roll Number:</span>
                        <span className="ml-2">{currentStudent.rollNo}</span>
                      </div>
                    </div>
                    
                  </div>
                </div>

                {results.length > 0 ? (
                  <div className="space-y-6">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">Core (20)</TableHead>
                            <TableHead className="text-right">Specialization (80)</TableHead>
                            <TableHead className="text-right">Total (100)</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {results.map((result) => (
                            <TableRow key={result.id}>
                              <TableCell className="text-right">
                                {result.core}
                              </TableCell>
                              <TableCell className="text-right">
                                {result.specialization}
                              </TableCell>
                              <TableCell className="text-right">
                                {result.core+result.specialization}
                              </TableCell>
                              <TableCell>
                              <Badge
                              className={result.core + result.specialization >= 35 ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}
                              >
                                {result.core + result.specialization >= 35 ? 'Pass' : 'Fail'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No results available 
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        {/* END of top-level Tabs */}

        {/* ========================= APPLY DIALOG ========================= */}
        <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Apply for Comprehensive Exam</DialogTitle>
              <DialogDescription>
                Please confirm your application for the following exam:
              </DialogDescription>
            </DialogHeader>
            {selectedExam && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <h4 className="font-medium">{selectedExam.examName}</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedExam.subject}
                  </p>
                </div>
                {/* Specialized Syllabi Textareas */}
                <div className="border-t pt-4 mt-4">
                  <p className="font-medium text-sm mb-2">
                    Specialized Subjects Syllabus
                  </p>
                  {specializedSyllabi.map((syllabus, index) => (
                    <textarea
                      key={syllabus.id} // Use `id` instead of index
                      value={syllabus.content} // Access `content`
                      onChange={(e) => {
                        const updatedSyllabi = [...specializedSyllabi];
                        updatedSyllabi[index] = { ...syllabus, content: e.target.value };
                        setSpecializedSyllabi(updatedSyllabi);
                      }}
                      className="w-full p-2 mb-2 border rounded-md text-sm"
                      placeholder="Paste your specialized subject's syllabus here..."
                    />
                  ))}
                  <Button
                    variant="outline"
                    className="text-sm"
                    onClick={() =>
                      setSpecializedSyllabi([
                        ...specializedSyllabi,
                        { id: Date.now(), content: '' } // Add new syllabus with a temporary unique ID
                      ])
                    }
                  >
                    + Add Another Syllabus
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground border-t pt-4 mt-4">
                  <p>
                    By applying, you confirm that you meet all the requirements
                    for this comprehensive exam.
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowApplyDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmApplication}>Confirm Application</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ========================= COMMENT DIALOG ========================= */}
        <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Comment to Announcement</DialogTitle>
              <DialogDescription>
                Please enter your comment for the selected announcement:
              </DialogDescription>
            </DialogHeader>
            {selectedAnnouncement && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <h4 className="font-medium">{selectedAnnouncement.examName}</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedAnnouncement.subject}
                  </p>
                </div>
                <div className="border-t pt-4 mt-4">
                  <p className="font-medium text-sm mb-2">Your Comment</p>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full p-2 border rounded-md text-sm"
                    placeholder="Enter your comment here..."
                  />
                </div>
                <div className="text-sm text-muted-foreground border-t pt-4 mt-4">
                  <p>Your comment will be sent to the coordinator for review.</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCommentDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmComment}>Submit Comment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ========================= DETAILS DIALOG ========================= */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
              <DialogDescription>
                View the specialized syllabus and other details of this application.
              </DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4 py-4">
                {/* Basic Info */}
                <div>
                  <strong>Exam ID:</strong> {selectedRequest.examId}
                </div>
                <div>
                  <strong>Student Email:</strong> {selectedRequest.studentEmail}
                </div>
                <div>
                  <strong>Date Applied:</strong>{' '}
                  {selectedRequest.dateApplied
                    ? formatDate(selectedRequest.dateApplied)
                    : 'Invalid Date'}
                </div>
                <div>
                  <strong>Status:</strong> {selectedRequest.status}
                </div>
                <div>
                  <strong>Shift:</strong> {selectedRequest.shift || 'N/A'}
                </div>

                {/* Specialized Syllabi */}
                <div>
                  <strong>Specialized Syllabus:</strong>
                  <ul className="list-disc list-inside">
                    {selectedRequest.specializedSyllabi && selectedRequest.specializedSyllabi.length > 0 ? (
                      selectedRequest.specializedSyllabi.map((s, index) => (
                        <li key={index}>{typeof s === 'object' ? s.content : s}</li>
                      ))
                    ) : (
                      <li>No syllabus provided.</li>
                    )}
                  </ul>
                </div>
                {/* Guide Comment (if any) */}
                {selectedRequest.guideComment && (
                  <div>
                    <strong>Guide Comment:</strong> {selectedRequest.guideComment}
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  )
}

export default Exam
