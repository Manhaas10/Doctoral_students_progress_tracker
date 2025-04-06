import React, { useEffect, useState } from 'react';
import Layout from '@/components/Student/layout/Layout';
import ProfileCard from '@/components/Student/Dashboard/ProfileCard';
import StatsCard from '@/components/Student/Dashboard/StatsCard';
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Calendar, 
  BookOpen, 
  FileCheck, 
  GraduationCap, 
  ChevronRight, 
  PlusCircle, 
  Clock 
} from 'lucide-react';
import axios from 'axios';
const upcomingMeetings = [
  {
    id: 1,
    title: "DC Committee Meeting",
    date: "March 15, 2025",
    status: "scheduled",
  },
  {
    id: 2,
    title: "Progress Review",
    date: "March 05, 2025",
    status: "pending",
  }
];
const recentPublications = [
  {
    id: 1,
    title: "Deep Learning Approaches for Natural Language Processing in Healthcare",
    journal: "IEEE Transactions on Medical Imaging",
    status: "published",
    date: "jan 1, 2024",
  },
  {
    id: 2,
    title: "Novel Approaches to Quantum Computing Algorithms",
    journal: "Physical Review Letters",
    status: "Editorial Revision",
    date: "june 15, 2024",
  }
];
const getPublicationStats = (publications) => {
  let stats = {
    total: publications.length,
    published: 0,
    accepted: 0,
    submitted: 0,
    editorialRevision: 0
  };

  publications.forEach((pub) => {
    switch (pub.status.toLowerCase()) {
      case "published":
        stats.published += 1;
        break;
      case "accepted":
        stats.accepted += 1;
        break;
      case "submitted":
        stats.submitted += 1;
        break;
      case "editorial revision":
        stats.editorialRevision += 1;
        break;
      default:
        break;
    }
  });

  return stats;
};

const Index = () => {
  // Initially set with minimal mock data.
  const [profileData, setProfileData] = useState({
    orcid: "",
    ResearchArea: "",
    avatarUrl: "/placeholder.svg"
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orcidInput, setOrcidInput] = useState("");  
  const [researchInput, setResearchInput] = useState("");
  // const [profileData, setProfileData] = useState(null);
  const [publications, setPublications] = useState([]);
  const [publicationStats, setPublicationStats] = useState({ total: 0, published: 0, accepted: 0, submitted: 0, editorialRevision: 0 });
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch profile from backend
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8080/api/user/profile', {
          withCredentials: true
        });

        // Ensure required keys are available
        if (response.data && response.data.name && response.data.email && response.data.rollNumber) {
          setProfileData(prevData => ({
            ...prevData,
            name: response.data.name,
            email: response.data.email,
            rollNumber: response.data.rollNumber,
            orcid: response.data.orcid,         // from backend response
            areaofresearch: response.data.areaofresearch || ""  // note the capital "R" here per your backend
          }));
          // Pre-fill local state if data is present
          setOrcidInput(response.data.orcid || "");
          setResearchInput(response.data.areaofresearch || "");
          fetchPublications(response.data.rollNumber); 
        
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to load profile data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);
  const fetchPublications = async (rollNumber) => {
    try {
      const publicationsResponse = await axios.get(`http://localhost:8080/api/publications/get/${rollNumber}`);
      setPublications(publicationsResponse.data);
      console.log("Publications Data:", publicationsResponse.data);
      setPublicationStats(getPublicationStats(publicationsResponse.data));
      
    } catch (err) {
      console.error("Error fetching publications:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handler for saving ORCID and Research Area
  const handleProfileUpdate = async () => {
    try {
      // Update endpoint expects the keys "orcid" and "areaofresearch"
      const payload = {
        email: profileData.email,
        orcid: orcidInput,
        areaofresearch: researchInput
      };

      await axios.put('http://localhost:8080/api/user/update-profile', payload, { withCredentials: true });
      
      // Update local state once backend update is successful.
      setProfileData(prev => ({
        ...prev,
        orcid: orcidInput,
        areaofresearch: researchInput
      }));

      // Optionally, show a success notification here.
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Layout >
      <div className="space-y-6">
        {/* Display ProfileCard with current profileData */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ProfileCard profileData={profileData} />
            {/* If ORCID or Research Area is missing, show input fields inline */}
            {(!profileData.orcid || !profileData.areaofresearch) && (
              <div className="mt-6 p-4 border border-dashed border-gray-300 rounded-lg">
                <h2 className="text-xl font-semibold mb-2">Complete Your Profile</h2>
                {!profileData.orcid && (
                  <div className="mb-4">
                    <label className="text-sm font-medium text-muted-foreground">ORCID:</label>
                    <input
                      type="text"
                      placeholder="Enter your ORCID"
                      className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-black-500 focus:border-black-500"
                      value={orcidInput}
                      onChange={(e) => setOrcidInput(e.target.value)}
                    />
                  </div>
                )}
                {!profileData.areaofresearch && (
                  <div className="mb-4">
                    <label className="block text-sm mb-1">Research Area:</label>
                    <textarea
                      placeholder="Enter your Research Area"
                      className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-black-500 focus:border-black-500"
                      value={researchInput}
                      onChange={(e) => setResearchInput(e.target.value)}
                    />
                  </div>
                )}
                <Button onClick={handleProfileUpdate} className="mt-2">
                  Save Profile Details
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-6">
          <StatsCard
          title="Publications"
          value={publicationStats.total}
          description={`${publicationStats.accepted} accepted, ${publicationStats.published} published, ${publicationStats.submitted} submitted, ${publicationStats.editorialRevision} editorial revised`}
          icon={<BookOpen className="h-6 w-6" />}
        />

          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            <Card className="card-transition">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Publications</CardTitle>
                  <Button variant="outline" size="sm" className="h-8 gap-1" onClick={()=>navigate("/addpublication")}>
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Add Publication</span>
                  </Button>
                </div>
                <CardDescription>Your recent papers and journal submissions</CardDescription>
              </CardHeader>
              <CardContent>
                {publications.length > 0 ? (
                  <div className="space-y-4">
                    {publications.slice(-3).map((publication) => (
                      <div key={publication.id} className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-sm line-clamp-1">{publication.title}</h4>
                          <div className={`text-xs font-medium ml-2 px-2 py-0.5 rounded flex-shrink-0 ${
                            publication.status === 'Published' 
                             ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              : publication.status === 'Accepted' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : publication.status === 'Editorial Revision' 
                                 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                  : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' // Default case
                                  }`}>
                                  {publication.status}
                                  </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{publication.journal}</p>
                        <p className="text-xs text-muted-foreground mt-1">{publication.publishername}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <BookOpen className="mx-auto h-8 w-8 opacity-40 mb-2" />
                    <p>No publications yet</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-1">
                <Button variant="ghost" size="sm" className="w-full justify-between" onClick={()=>navigate("/publication")}>
                  <span>View all publications</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
            {/* <Card className="card-transition">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>DC Meetings</CardTitle>
                  <Button variant="outline" size="sm" className="h-8 gap-1" onClick={()=>navigate("/dcmeeting")}>
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>DC Meeting</span>
                  </Button>
                </div>
                <CardDescription>Your DC minutes reviews</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingMeetings.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingMeetings.map((meeting) => (
                      <div key={meeting.id} className="flex items-center p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-4">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm">{meeting.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {meeting.date}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {meeting.time}
                            </p>
                          </div>
                        </div>
                        <div className={`text-xs font-medium px-2 py-0.5 rounded ${
                          meeting.status === 'scheduled' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {meeting.status === 'scheduled' ? 'Scheduled' : 'Pending'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <Calendar className="mx-auto h-8 w-8 opacity-40 mb-2" />
                    <p>No upcoming meetings scheduled</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-1">
                <Button variant="ghost" size="sm" className="w-full justify-between">
                  <span>View all meetings</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card> */}
          </div>
          
          <div className="space-y-6">       
            <Card className="card-transition">
              <CardHeader className="pb-3">
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="secondary" size="sm" className="w-full justify-start gap-2" onClick={() => navigate('/dcmeeting')}>
                  <PlusCircle className="h-4 w-4" />
                  <span> Submit DC Minutes</span>
                </Button>
                <Button variant="secondary" size="sm" className="w-full justify-start gap-2" onClick={()=> navigate('/addpublication')}>
                  <PlusCircle className="h-4 w-4" />
                  <span>Add New Publication</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
