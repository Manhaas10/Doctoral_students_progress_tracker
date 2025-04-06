import { useState, useCallback, useEffect } from "react";
import { FileSpreadsheet, User, UserCog, Eye } from "lucide-react";
import Layout from "@/components/Co-ordinator/layout/Layout";
import FileUpload from "@/components/Co-ordinator/FileUpload";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const UploadExcel = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [students, setStudents] = useState([]);
  const [isViewing, setIsViewing] = useState(false);

  // Handle file selection
  const handleFileSelect = useCallback((selectedFile) => {
    setFile(selectedFile);
    setUploadSuccess(false);
  }, []);

  // Fetch students
  const fetchStudents = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:8080/api/students/all");

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Fetched students:", data);

      if (data.length > 0) {
        setStudents(data);
        setUploadSuccess(true);
        localStorage.setItem("uploadCompleted", "true");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error(`Fetch error: ${error.message}`);
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem("uploadCompleted") === "true") {
      fetchStudents();
    }
  }, [fetchStudents]);
  useEffect(() => {
    console.log("Updated students state:", students);
  }, [students]); // Log students whenever it updates
  

  // Handle file upload
  const handleUpload = useCallback(async () => {
    if (!file) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8080/api/students/upload", {
        method: "POST",
        body: formData,
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Uploaded students:", data);

      setStudents(data);
      setUploadSuccess(true);
      localStorage.setItem("uploadCompleted", "true");

      toast.success("Student data processed", {
        description: `${data.length} students imported from ${file.name}`,
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Error uploading file");
    } finally {
      setIsUploading(false);
    }
  }, [file]);

  // View students list
  const handleViewStudents = () => {
    setIsViewing(true);
    fetchStudents(); // Ensure fresh data loads
    console.log("View Students clicked. Students:", students);
  };

  return (
    <Layout>
      <div className="animate-fade-in">
        <div className="flex items-center space-x-2 mb-2">
          <FileSpreadsheet className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Upload Student-Guide List</h1>
        </div>
        <p className="text-muted-foreground mb-8">
          Upload an Excel sheet containing student information and their assigned guides.
        </p>

        {!uploadSuccess ? (
          <>
            {/* File Upload Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-border mb-8">
              <h2 className="text-xl font-semibold mb-4">Upload Excel File</h2>
              <FileUpload onFileSelect={handleFileSelect} accept=".xlsx,.xls,.csv" maxSize={5} />
              
              <div className="mt-6">
                <Button 
                  onClick={handleUpload} 
                  disabled={!file || isUploading}
                  className="w-full sm:w-auto"
                >
                  {isUploading ? "Processing..." : "Upload Student-Guide List"}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* View Students Button */}
            {uploadSuccess && (
              <div className="mt-6">
                <Button onClick={handleViewStudents} className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Student Guide List
                </Button>
              </div>
            )}

            {/* Processed Student List */}
            {isViewing && students.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-border animate-slide-up mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-semibold mb-2">Students-Guide List</h2>
                </div>

                <div className="overflow-auto ">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted border-b border-border">
                        <th className="py-3 px-4 text-left">ID</th>
                        <th className="py-3 px-4 text-left">Name</th>
                        <th className="py-3 px-4 text-left">Student Email</th>
                        <th className="py-3 px-4 text-left">Guide Name</th>
                        <th className="py-3 px-4 text-left">Guide Email</th>
                        
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
  {students.map((student) => (
    student ? (
      <tr key={student.id} className="hover:bg-muted/50 transition-colors">
        <td className="py-3 px-4">{student.studentId}</td>
        <td className="py-3 px-4 flex items-center space-x-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{student.studentName}</span>
        </td>
        <td className="py-3 px-4">{student.studentEmail}</td>
        <td className="py-3 px-4 flex items-center space-x-2">
          <UserCog className="h-4 w-4 text-muted-foreground" />
          <span>{student.guideName ? student.guideName : "No Guide Assigned"}</span>
        </td>
        <td className="py-3 px-4">{student.guideEmail ? student.guideEmail : "-"}</td>
        
      </tr>
    ) : null
  ))}
</tbody>
                  </table>
                </div>
              </div>
            )}
          </>
          
        )}
        {!uploadSuccess && (
          <div className="bg-muted/50 rounded-xl p-6 border border-border">
            <h3 className="text-lg font-medium mb-4">Instructions</h3>
            <p className="text-sm text-muted-foreground mb-4">
      Please ensure that your Excel file strictly follows the format below. The columns must be in the exact order specified.
    </p>

    {/* Required Format */}
    <div className="mb-4 p-4 bg-primary/10 border border-primary rounded-lg">
      <p className="font-semibold text-primary mb-2">📂 Required Excel Format:</p>
      <pre className="text-sm text-muted-foreground bg-gray-100 p-3 rounded-md overflow-auto">
        | Student Name | Student Email | Admission Scheme | Guide Name | Guide Email | Date of Joining |
      </pre>
    </div>

    <ul className="space-y-2 text-sm text-muted-foreground">
      <li className="flex items-start gap-2">
        <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center mt-0.5 flex-shrink-0">1</span>
        <span>Ensure your Excel file contains <strong>exactly 6 columns</strong> in the order shown above.</span>
      </li>
      <li className="flex items-start gap-2">
        <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center mt-0.5 flex-shrink-0">2</span>
        <span>All columns must be filled—empty values may cause errors.</span>
      </li>
      <li className="flex items-start gap-2">
        <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center mt-0.5 flex-shrink-0">3</span>
        <span>Accepted file formats: <strong>.xlsx, .xls, .csv</strong> (Max size: 5MB).</span>
      </li>
      <li className="flex items-start gap-2">
        <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center mt-0.5 flex-shrink-0">4</span>
        <span>After uploading, verify the student-guide list displayed.</span>
      </li>
    </ul>
          </div>
        )} 
      </div>
    </Layout>
  );
};

export default UploadExcel;
