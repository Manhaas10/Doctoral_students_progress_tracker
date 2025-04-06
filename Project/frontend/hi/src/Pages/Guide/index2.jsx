import React, { useEffect, useState } from "react";
import axios from "axios";
import PageLayout from "@/components/Guide/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck, Clock, FilePlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Dashboardg = () => {
  const [guideEmail, setGuideEmail] = useState("");
  const [guideId, setGuideId] = useState(null);
  const [scholars, setScholars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/coursereq/all", { withCredentials: true })
      .then((res) => {
        // Filter only pending requests
        const pending = res.data.filter((request) => request.status === "Pending");
        setPendingRequests(pending);
      })
      .catch((err) => console.error("Error fetching course requests:", err));
  }, []);

  // Fetch meetings for supervisor from backend
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/dc-meetings/fetch-for-supervisor", {
        withCredentials: true,
      })
      .then((res) => setMeetings(res.data))
      .catch((err) => console.error("Error fetching meetings:", err));
  }, []);
  console.log(pendingRequests);
  useEffect(() => {
    const fetchGuideEmail = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/user/super", { withCredentials: true });
        setGuideEmail(response.data.email || "");
      } catch (error) {
        console.error("Error fetching guide email:", error);
      }
    };
    fetchGuideEmail();
  }, []);

  useEffect(() => {
    if (!guideEmail) return;
    const fetchGuideId = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/guides/email/${guideEmail}`, { withCredentials: true });
        setGuideId(response.data || null);
      } catch (error) {
        console.error("Error fetching guide ID:", error);
      }
    };
    fetchGuideId();
  }, [guideEmail]);

  useEffect(() => {
    if (!guideId) return;
    const fetchScholars = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/guides/${guideId}/students`, { withCredentials: true });
        setScholars(response.data || []);
      } catch (error) {
        console.error("Error fetching scholars:", error);
        setError("Failed to load scholars");
      } finally {
        setLoading(false);
      }
    };
    fetchScholars();
  }, [guideId]);

 

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="shadow-soft animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <UserCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Scholars</p>
                  <h3 className="text-2xl font-semibold">{loading ? "Loading..." : scholars.length}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-soft animate-fade-in">
            <CardHeader>
              <CardTitle className="text-lg">DC Minutes Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {meetings.length > 0 ? (
                <div className="space-y-4">
                  {meetings.slice(-4).map((meeting) => (
                    <div key={meeting.id} className="flex gap-4 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-all-200">
                      <div className="bg-primary/10 p-2 rounded-full h-fit">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">DC Meeting - {meeting.studentEmail}</h3>
                        <div className="flex justify-between mt-1">
                        <p className="text-sm text-muted-foreground">
  {new Date(meeting.date[0], meeting.date[1] - 1, meeting.date[2]).toDateString()}
</p>
<p className="text-sm font-medium">
  {`${meeting.time[0].toString().padStart(2, "0")}:${meeting.time[1].toString().padStart(2, "0")}`}
</p>

                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <p className="text-muted-foreground">No upcoming DC meetings scheduled.</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="shadow-soft animate-fade-in">
            <CardHeader>
              <CardTitle className="text-lg">Pending Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingRequests.length > 0 ? (
                
                <div className="space-y-4">
                  
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="flex gap-4 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-all-200">
                      <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-full h-fit">
                        <FilePlus className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{request.courseName}</h3>
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">{request.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          <span className="font-medium">{request.type}</span> from {request.studentId}
                        </p>
                        {/* <p className="text-xs text-muted-foreground mt-1">Submitted on {request.date}</p> */}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <p className="text-muted-foreground">No pending requests.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboardg;