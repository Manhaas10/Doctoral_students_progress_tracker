import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const CourseSearch = ({ onAddCourse }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [allCourses, setAllCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get("/api/courses/all"); // Update API endpoint if needed
        console.log("Fetched Courses:", response.data);
        setAllCourses(response.data);
        setFilteredCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = allCourses.filter(
        (course) =>
          course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses(allCourses);
    }
    setShowSuggestions(true);
  }, [searchTerm, allCourses]);

  const handleSelectCourse = (course) => {
    onAddCourse(course);
    setSearchTerm("");
    // setShowSuggestions(false);
  };

  const handleViewDetails = (course) => {
    setSelectedCourse(course);
  };

  return (
    <div className="w-full">
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search for course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-[30%] transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <Button
          onClick={() => {
            if (filteredCourses.length > 0) {
              handleSelectCourse(filteredCourses[0]);
            }
          }}
          disabled={filteredCourses.length === 0}
          className="flex items-center gap-1"
        >
          <Plus size={16} />
          Add
        </Button>
      </div>

      {showSuggestions && (
        <div className="border rounded-md overflow-hidden">
          {filteredCourses.length > 0 ? (
            <div className="max-h-[300px] overflow-y-auto">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="px-4 py-3 hover:bg-muted cursor-pointer flex justify-between items-center border-b last:border-0"
                >
                  <div>
                    <div className="font-medium">{course.course_name}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <Badge variant="outline">{course.id}</Badge>
                      <span>{course.duration}</span>
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(course)}>
                        Details
                      </Button>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleSelectCourse(course)}>
                    <Plus size={16} className="text-primary" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">No courses found matching your search.</div>
          )}
        </div>
      )}

      {/* Dialog Box for Course Details */}
      {selectedCourse && (
        <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
          <DialogContent className="max-w-lg p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">{selectedCourse.course_name}</DialogTitle>
            </DialogHeader>

            <div className="space-y-3 text-sm text-gray-700">
              <p><strong>Course ID:</strong> {selectedCourse.id}</p>
              <p><strong>Duration:</strong> {selectedCourse.duration}</p>
              <p><strong>Start Date:</strong> {selectedCourse.startDate}</p>
              <p><strong>End Date:</strong> {selectedCourse.endDate}</p>
              <p><strong>Provider:</strong> {selectedCourse.sme_Name}</p>
              <p><strong>Institute:</strong> {selectedCourse.institute}</p>
              <p><strong>Co-Institute:</strong> {selectedCourse.co_Institute}</p>
            </div>

            <DialogFooter>
              <Button variant="secondary" onClick={() => setSelectedCourse(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CourseSearch;
