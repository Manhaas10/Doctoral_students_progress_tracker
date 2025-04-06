import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, FilterX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const ScholarsList = () => {
  const [scholars, setScholars] = useState([]);
  const [filteredScholars, setFilteredScholars] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [guideEmail, setGuideEmail] = useState("");
  const [guideId, setGuideId] = useState(null);
  const [error, setError] = useState(null);

  // Fetch Guide Email
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

  // Fetch Guide ID
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

  // Fetch Scholars Under Guide
  useEffect(() => {
    if (!guideId) return;

    const fetchScholars = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8080/api/guides/${guideId}/students`, { withCredentials: true });
        const scholarsList = response.data || [];

        if (!Array.isArray(scholarsList) || scholarsList.length === 0) {
          setScholars([]);
          setFilteredScholars([]);
          setLoading(false);
          return;
        }

        // Fetch full details for each scholar
        const fullDetailsPromises = scholarsList.map((scholar) =>
          axios
            .get(`http://localhost:8080/api/students/${scholar.rollNo}`, { withCredentials: true })
            .then((res) => res.data)
            .catch((err) => {
              console.error(`Failed to fetch details for ${scholar.rollNo}`, err);
              return null;
            })
        );

        const fullDetails = (await Promise.all(fullDetailsPromises)).filter((data) => data !== null);

        setScholars(fullDetails);
        // console.log(scholars);
        setFilteredScholars(fullDetails);
      } catch (error) {
        console.error("Error fetching scholars:", error);
        setError("Failed to load scholars");
      } finally {
        setLoading(false);
      }
    };

    fetchScholars();
  }, [guideId]);

  // Search function
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (!term.trim()) {
      setFilteredScholars(scholars);
      return;
    }

    const filtered = scholars.filter(
      (scholar) =>
        scholar.name.toLowerCase().includes(term.toLowerCase()) ||
        scholar.regNo.toLowerCase().includes(term.toLowerCase()) ||
        scholar.research.toLowerCase().includes(term.toLowerCase())
    );

    setFilteredScholars(filtered);
  };

  const resetSearch = () => {
    setSearchTerm("");
    setFilteredScholars(scholars);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "On Leave":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <Card className="shadow-soft border mt-6 animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">My Scholars</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search scholars..."
                className="pl-9 h-9"
                value={searchTerm}
                onChange={handleSearch}
              />
              {searchTerm && (
                <Button variant="ghost" size="icon" className="absolute right-1 top-1 h-7 w-7" onClick={resetSearch}>
                  <FilterX className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-muted-foreground">Loading scholars...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {filteredScholars.length > 0 ? (
                filteredScholars.map((scholar) => (
                  <div
                    key={scholar.rollNo}
                    className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-all-200"
                  >
                    <Avatar className="h-12 w-12 border border-border">
                      <AvatarImage src="/placeholder.svg" alt={scholar.name} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {scholar.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <h3 className="font-medium truncate">{scholar.name}</h3>
                          <p className="text-sm text-muted-foreground">{scholar.roll}</p>
                        </div>
                        <Badge variant="outline" className={getStatusColor(scholar.status)}>
                          {scholar.admissionscheme}
                        </Badge>
                      </div>
                      <p className="text-sm mt-1 text-muted-foreground truncate">{scholar.areaofresearch}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No scholars found matching your search.</p>
                  <Button variant="outline" size="sm" onClick={resetSearch}>
                    Reset Search
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default ScholarsList;
