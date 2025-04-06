import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Award, Briefcase } from "lucide-react";

const ProfileOverview = ({ guide }) => {
  const [scholars, setScholars] = useState([]);
  const [guideEmail, setGuideEmail] = useState("");
  const [guideId, setGuideId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch Guide Email
  useEffect(() => {
    const fetchGuideData = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:8080/api/user/super", {
          withCredentials: true,
        });

        if (response.data?.email) {
          setGuideEmail(response.data.email);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("Error fetching guide data:", err);
        setError("Failed to load guide data.");
      } finally {
        setLoading(false);
      }
    };

    fetchGuideData();
  }, []);

  // Fetch Guide ID
  useEffect(() => {
    if (!guideEmail) return;

    const fetchGuideId = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8080/api/guides/email/${guideEmail}`, {
          withCredentials: true,
        });

        if (response.data) {
          setGuideId(response.data);
        } else {
          throw new Error("Guide ID not found");
        }
      } catch (error) {
        console.error("Error fetching guide ID:", error);
        setError("Failed to fetch guide ID");
      } finally {
        setLoading(false);
      }
    };

    fetchGuideId();
  }, [guideEmail]);

  // Fetch Scholars
  useEffect(() => {
    if (!guideId) return;

    const fetchScholars = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8080/api/guides/${guideId}/students`, {
          withCredentials: true,
        });

        if (Array.isArray(response.data)) {
          setScholars(response.data);
        } else {
          throw new Error("Invalid scholar data received");
        }
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
    <Card className="shadow-soft border animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Profile Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-32 w-32 border-2 border-border shadow-soft">
              <AvatarImage src="/placeholder.svg" alt={guide?.name || "Guide"} />
              <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                {guide?.name?.split(" ").map((n) => n[0]).join("") || "G"}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h2 className="text-xl font-medium">{guide?.name || "Unknown"}</h2>
              <p className="text-muted-foreground">{guide?.designation || "N/A"}</p>
              <p className="text-sm text-muted-foreground">{guide?.department || "N/A"}</p>
            </div>
          </div>

          <Separator orientation="vertical" className="hidden md:block" />

          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{guide?.email || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{guide?.phone || "N/A"}</span>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Award className="h-4 w-4" /> Areas of Expertise
              </h3>
              <div className="flex flex-wrap gap-2">
                {guide?.expertise?.length > 0 ? (
                  guide.expertise.map((item, index) => (
                    <Badge key={index} variant="secondary">
                      {item}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No expertise listed</span>
                )}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-secondary rounded-md">
                <div className="text-2xl font-semibold">{scholars.length}</div>
                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                  <Briefcase className="h-3 w-3" /> Total Scholars
                </div>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileOverview;
