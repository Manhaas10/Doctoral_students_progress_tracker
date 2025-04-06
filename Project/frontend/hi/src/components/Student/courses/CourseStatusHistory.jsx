import React from 'react';
import { CheckCircle2, XCircle, Clock, Send } from 'lucide-react';

const CourseStatusHistory = ({ course }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Applied':
        return <Send className="h-4 w-4 text-blue-500" />;
      case 'Approved':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'Rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div className="p-4 bg-muted/50 rounded-md">
      <h4 className="text-sm font-medium mb-3">Status History</h4>
      <ol className="relative border-l border-primary/30">
        {course.statusHistory.map((item, index) => (
          <li key={index} className="mb-6 ml-6">
            <span className="absolute flex items-center justify-center w-6 h-6 bg-white rounded-full -left-3 ring-8 ring-white">
              {getStatusIcon(item.status)}
            </span>
            <h3 className="flex items-center mb-1 text-sm font-semibold">
              {item.status}
            </h3>
            <time className="block mb-2 text-xs font-normal leading-none text-muted-foreground">
              {new Date(item.date).toLocaleDateString()} at {new Date(item.date).toLocaleTimeString()}
            </time>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default CourseStatusHistory;
