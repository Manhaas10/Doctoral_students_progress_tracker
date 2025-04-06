export const CourseStatus = {
    APPLIED: "Applied",
    APPROVED: "Approved",
    REJECTED: "Rejected",
  };
  
  // Helper function to filter courses by status
  export const filterCoursesByStatus = (courses, status) => {
    return courses.filter(course => course.status === status);
  };
  
  // Helper function to update course status
  export const updateCourseStatus = (courses, courseId, newStatus) => {
    const now = new Date().toISOString();
  
    return courses.map(course => {
      if (course.id === courseId) {
        const updatedCourse = { 
          ...course, 
          status: newStatus,
          statusHistory: [...course.statusHistory, { status: newStatus, date: now }]
        };
  
        if (newStatus === "Approved") {
          updatedCourse.approvedDate = now;
        } else if (newStatus === "Rejected") {
          updatedCourse.rejectedDate = now;
        }
  
        return updatedCourse;
      }
      return course;
    });
  };
  