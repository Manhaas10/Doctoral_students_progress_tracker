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
import { CalendarIcon, Search } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const DCMeetingsg = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [date, setDate] = useState(undefined);
  const [meetings, setMeetings] = useState([]);

  // Fetch meetings for supervisor from backend
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/dc-meetings/fetch-for-supervisor", {
        withCredentials: true,
      })
      .then((res) => setMeetings(res.data))
      .catch((err) => console.error("Error fetching meetings:", err));
  }, []);

  // Filter meetings by search term and date
  const filteredMeetings = meetings.filter((meeting) => {
    const matchesSearch =
      meeting.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (meeting.writeup || "").toLowerCase().includes(searchTerm.toLowerCase());

    // Convert meeting.date array to string if necessary
    let meetingDateFormatted = "";
    if (Array.isArray(meeting.date)) {
      // meeting.date is [year, month, day]
      // Note: JavaScript Date month is 0-indexed, so subtract 1.
      meetingDateFormatted = dayjs(new Date(meeting.date[0], meeting.date[1] - 1, meeting.date[2])).format("MMMM D, YYYY");
    } else {
      meetingDateFormatted = dayjs(meeting.date).format("MMMM D, YYYY");
    }
    const selectedDateFormatted = date ? dayjs(date).format("MMMM D, YYYY") : null;

    const matchesDate = !date || meetingDateFormatted === selectedDateFormatted;
    return matchesSearch && matchesDate;
  });

  // Function to handle file download using the backend endpoint
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
    }
  };

  return (
    <PageLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">DC Meetings</h1>
            <p className="text-muted-foreground mt-1">
              Manage doctoral committee meetings with PhD scholars
            </p>
          </div>
          {/* Navigate to the "Minutes Approvals" page. Ensure that page fetches real data too. */}
          <Button
            className="bg-sidebar-primary text-white hover:bg-blue-600"
            onClick={() => navigate("/meetingsapprovals")}
          >
            Minutes Approvals
          </Button>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>DC Meeting Minutes Requests</CardTitle>
                <CardDescription>
                  View and Approve the DC minutes
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search meetings..."
                    className="pl-8 w-full sm:w-[250px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? dayjs(date).format("PPP") : <span>Filter by date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                {date && (
                  <Button variant="ghost" onClick={() => setDate(undefined)} className="px-2">
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredMeetings.length > 0 ? (
                filteredMeetings.map((meeting) => {
                  // Format date & time with dayjs
                  const displayDate = Array.isArray(meeting.date)
                    ? dayjs(new Date(meeting.date[0], meeting.date[1] - 1, meeting.date[2])).format("DD/MM/YYYY")
                    : dayjs(meeting.date).format("DD/MM/YYYY");

                  const displayTime = Array.isArray(meeting.time)
                    ? dayjs(new Date(1970, 0, 1, meeting.time[0], meeting.time[1])).format("HH:mm")
                    : meeting.time
                    ? dayjs(`1970-01-01T${meeting.time}`).format("HH:mm")
                    : "No Time";

                  return (
                    <div
                      key={meeting.id}
                      className="p-4 rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-200 animate-scale-in"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-medium text-lg">
                            DC Meeting - {meeting.studentEmail}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {meeting.writeup || "No Writeup"}
                          </p>
                        </div>
                        <div className="flex gap-4 items-center">
                          <div className="text-right">
                            <p className="font-medium">{displayDate}</p>
                            <p className="text-sm text-gray-500">{displayTime}</p>
                          </div>
                          {/* Download button aligned with backend functionality */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(meeting.id, meeting.fileName)}
                          >
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No meetings found matching your filters
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default DCMeetingsg;
