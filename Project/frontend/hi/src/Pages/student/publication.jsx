import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Student/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Search, FileText } from "lucide-react";
import PublicationList from "@/components/Student/publications/PublicationList";
import { useToast } from "@/hooks/use-toast";
import axios from "axios"; // Ensure axios is imported

const Publications = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [publications, setPublications] = useState([]);
  const [filteredPublications, setFilteredPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null); // Initialize student state

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:8080/api/user/profile", {
          withCredentials: true,
        });

        if (response.data && response.data.name && response.data.email && response.data.rollNumber) {
          setStudent({
            name: response.data.name,
            email: response.data.email,
            rollNumber: response.data.rollNumber,
            orcidId: response.data.orcid || "",
            researchArea: response.data.areaofresearch || "",
          });
        } else {
          throw new Error("Invalid response format");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast({
          title: "Error",
          description: "Could not fetch profile data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []); // Only fetch profile data once when the component mounts

  useEffect(() => {
    if (student) {
      // If student data is available, fetch their publications
      fetchPublications(student.rollNumber);
    }
  }, [student]); // Fetch publications when student data is available

  const fetchPublications = async (rollNo) => {
    try {
      const response = await fetch(`http://localhost:8080/api/publications/get/${rollNo}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to fetch publications");

      const data = await response.json();
      setPublications(data);
      setFilteredPublications(data);
    } catch (error) {
      console.error("Fetch Error:", error);
      toast({
        title: "Error",
        description: "Could not fetch publications.",
        variant: "destructive",
      });
    }
  };

  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchTerm(searchValue);
    setFilteredPublications(
      searchValue
        ? publications.filter((pub) => pub.title.toLowerCase().includes(searchValue))
        : publications
    );
  };

  const handleAddNewPublication = () => {
    navigate("/addpublication");
  };

  return (
    <Layout>
      <div className="space-y-6">
        <Card className="card-transition">
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <CardTitle className="text-2xl font-bold">Your Publications</CardTitle>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by title..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-8 w-full md:w-[250px]"
                />
              </div>
              <Button onClick={handleAddNewPublication} className="gap-2 whitespace-nowrap">
                <PlusCircle className="h-4 w-4" />
                Add New Publication
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center">Loading publications...</p>
            ) : filteredPublications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md border-dashed border-muted">
                <FileText className="w-10 h-10 text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">No publications found</h3>
                <p className="text-sm text-muted-foreground mt-1">Get started by adding your first publication.</p>
                <Button onClick={handleAddNewPublication} variant="outline" className="mt-4 gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Add Publication
                </Button>
              </div>
            ) : (
              <PublicationList publications={filteredPublications} />
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Publications;
