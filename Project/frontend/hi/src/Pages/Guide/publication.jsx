import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import PageLayout from "@/components/Guide/layout/Layout";
import axios from 'axios'; // Don't forget to import axios
const Publicationsg = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [guideEmail, setGuideEmail] = useState(null);
  const [guideId, setGuideId] = useState(null);
  const navigate = useNavigate();

  // Step 1: Fetch Guide Email from SupervisorProfileController
  useEffect(() => {
    const fetchGuideEmail = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/user/super', {
          withCredentials: true
        });
  
        const data = response.data; // Axios already parses JSON
        if (data.email) {
          setGuideEmail(data.email);
        } else {
          console.error("Failed to fetch guide email");
        }
      } catch (error) {
        console.error("Error fetching guide email:", error);
      }
    };
  
    fetchGuideEmail();
  }, []);

  useEffect(() => {
    if (!guideEmail) return;

    const fetchGuideId = async () => {
      console.log("Guide Email being used for API request:", guideEmail);
      try {
        const response = await axios.get(`http://localhost:8080/api/guides/email/${guideEmail}`, {
          withCredentials: true,
        });
    
        console.log("Guide ID response:", response.data); // Log response
       // console.log("Students API Response:", response.data);
        if (response.data) {
         // console.log("Guide ID set:", response.data);
          setGuideId(response.data);
        } else {
          console.error("Guide ID not found in response");
        }
      } catch (error) {
        console.error("Error fetching guide ID:", error);
      }
    };

    fetchGuideId();
  }, [guideEmail]);

  // Step 3: Fetch Students when Guide ID is Available
  useEffect(() => {
    //console.log("gi");
    if (!guideId) return;
    

    const fetchStudents = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/guides/${guideId}/students`, {
          withCredentials: true, // Include credentials if needed
        });
        console.log("Students API Response:", response.data);

        if (response.data) {
          setStudents(response.data);
          
          setFilteredStudents(response.data);
          // console.log(filteredStudentsstudents);
        } else {
          console.error("Error fetching students");
        }
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchStudents();
  }, [guideId]);


  // Step 4: Handle Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setFilteredStudents(
        students.filter(student =>
          student.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, students]);

  // Handle Student Click
  const handleStudentClick = (student) => {
    console.log(student.rollNo);
    
    navigate(`/student/${student.rollNo}`);
  };

  return (
    <PageLayout>
      <div className="flex h-screen">
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto animate-fade-in">
            <div className="page-container">
              <h2 className="text-2xl font-bold mb-6">Current Publications</h2>

              {/* Search Bar */}
              <div className="mb-6 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search students..."
                  className="pl-10 bg-white border border-gray-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Student Table */}
              <div className="table-container animate-slide-in">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Publications</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ORCID</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.map((student) => (
                      <tr key={student.rollNo} className="table-row-hover" onClick={() => handleStudentClick(student)}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{student.publicationCount}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <a href={`https://orcid.org/${student.orcid}`} target="_blank" rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                            onClick={(e) => e.stopPropagation()}>
                            {student.orcid}
                          </a>
                        </td>
                      </tr>
                    ))}
                    {filteredStudents.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                          No students found matching your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>
    </PageLayout>
  );
};

export default Publicationsg;
