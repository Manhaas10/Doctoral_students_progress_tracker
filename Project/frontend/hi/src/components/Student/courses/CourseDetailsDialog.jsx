import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import CourseStatusHistory from './CourseStatusHistory';

const CourseDetailsDialog = ({ isOpen, onClose, course }) => {
  if (!course) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{course.course_name}</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Badge variant="outline">{course.id}</Badge>
            <span>{course.credits} credits</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-2">
          {course.description ? (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-1">Description</h4>
              <p className="text-sm text-muted-foreground">{course.description}</p>
            </div>
          ) : (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-1">Description</h4>
              <p className="text-sm text-muted-foreground">No description available for this course.</p>
            </div>
          )}
          
          <CourseStatusHistory course={course} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CourseDetailsDialog;
