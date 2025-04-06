import React, { useState } from "react";
import { X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const CourseCard = ({ course, onRemove }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Card className="card-transition w-full overflow-hidden">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-lg">{course.course_name}</h3>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Badge variant="outline">{course.id}</Badge>
                <span>{course.duration}</span>
                <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
                  Details
                </Button>
              </div>
            </div>

            {/* Remove Button (X) */}
            {onRemove && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                onClick={() => onRemove(course.id)}
              >
                <X size={16} />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog Box for Course Details */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">{course.course_name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3 text-sm text-gray-700">
            <p><strong>Course ID:</strong> {course.id}</p>
            <p><strong>Duration:</strong> {course.duration}</p>
            <p><strong>Start Date:</strong> {course.startDate}</p>
            <p><strong>End Date:</strong> {course.endDate}</p>
            <p><strong>Provider:</strong> {course.sme_Name}</p>
            <p><strong>Institute:</strong> {course.institute}</p>
            <p><strong>Co-Institute:</strong> {course.co_Institute}</p>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CourseCard;
