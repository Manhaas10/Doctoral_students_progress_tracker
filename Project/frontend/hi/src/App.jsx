import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Pages/login";
import Index from "./Pages/Student/index"; 
import Profile from "./Pages/Student/profile"; 
import DCMeetings from "./Pages/Student/dcmeeting"; 
import Publications from "./Pages/Student/publication"; 
import AddPublication from "./Pages/Student/AddPublication"; 
import Exam from "./Pages/Student/comprehensive_exam"; 
import Courses from "./Pages/Student/swayam_course"; 
import Dashboardg from "./Pages/Guide/index2"; 
import Profileg from "./Pages/Guide/profile"; 
import ScholarProfiles from "./Pages/Guide/ScholarProfile"; 
import  Dashboardc from "./Pages/Co-ordinator/dashboardc.jsx"; 
import  UploadExcel from "./Pages/Co-ordinator/Excelpage.jsx"; 
import  CourseExcel from "./Pages/Co-ordinator/courses.jsx"; 
import  ExamAnnouncement from "./Pages/Co-ordinator/ExamAnnoucements.jsx"; 
import  DCMeetingsg from "./Pages/Guide/DCmeetings.jsx"; 
import  MeetingApprovals from "./Pages/Guide/meetingapprovals.jsx"; 
import  Publicationsg from "./Pages/Guide/publication.jsx"; 
import  Actions from "./Pages/Guide/coursesg.jsx"; 
import StudentPublications from "./pages/Guide/studentpublications";
import Compre from "./pages/Guide/compre-exam.jsx";
import PublicationHistory from "./pages/Guide/publicationh.jsx";
import ScholarProfiless from "./pages/Co-ordinator/ScholarProfile";

// import Index2 from "./Pages/index2"; 
import "./index.css";

export default function App() {
  return (
    <Router>
      <Routes>
        
        <Route path="/" element={<Login />} /> {/* Login Page */}
        {/* this is for student home page on successful login */}
        <Route path="/student-dashboard" element={<Index />} /> {/* Home Page (index.jsx) */}
        <Route path="/profile" element={<Profile />} /> {/*  (profile.jsx) */}
        <Route path="/dcmeeting" element={<DCMeetings />} /> {/*  (dcmeeting.jsx) */}
        <Route path="/publication" element={<Publications />} /> {/*  (publication.jsx) */}
        <Route path="/addpublication" element={<AddPublication />} /> {/*  (addpublication.jsx) */}
        <Route path="/swayam_course" element={<Courses />} /> {/*  (swayam_courses.jsx) */}
        <Route path="/index2" element={<Dashboardg />} />  
        <Route path="/profileg" element={<Profileg />} />  
        <Route path="/scholarprofile" element={<ScholarProfiles />} />  
        <Route path="/dashboardc" element={<Dashboardc />} />  
        <Route path="/Excelpage" element={<UploadExcel />} />  
        <Route path="/meetings_g" element={<DCMeetingsg />} />  
        <Route path="/meetingsapprovals" element={<MeetingApprovals />} />  
        <Route path="/publicationsg" element={<Publicationsg />} />  
        <Route path="/coursesg" element={<Actions />} />  
        <Route path="/student/:rollNumber" element={<StudentPublications />} />
        <Route path="/Cocourses" element={<CourseExcel />} />
        <Route path="/scholarprofiles" element={<ScholarProfiless />} />
        <Route path="/exam" element={<Exam />} />
        <Route path="/cocompre" element={<ExamAnnouncement />} />
        <Route path="/comprehensive-exam" element={<Compre />} />
        <Route path="/publicationh/:rollNumber" element={<PublicationHistory />} />
      </Routes>
    </Router>
  );
}
