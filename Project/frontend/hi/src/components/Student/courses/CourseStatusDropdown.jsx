import React, { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { CourseStatus } from '@/types/courses';



const CourseStatusDropdown= ({ currentStatus, onStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<CourseStatus>(currentStatus);
  const [showSaveButton, setShowSaveButton] = useState(false);

  // Update selected status when currentStatus prop changes
  React.useEffect(() => {
    setSelectedStatus(currentStatus);
  }, [currentStatus]);

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Applied':
        return 'secondary';
      case 'Approved':
        return 'success';
      case 'Rejected':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const handleStatusSelect = (status) => {
    if (status !== currentStatus) {
      setSelectedStatus(status);
      setShowSaveButton(true);
    }
    setIsOpen(false);
  };

  const handleSave = () => {
    onStatusChange(selectedStatus);
    setShowSaveButton(false);
  };

  const statuses= ['Applied', 'Approved', 'Rejected'];

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 gap-1 px-2 hover:bg-muted">
            <Badge variant={getStatusVariant(selectedStatus)}>
              {selectedStatus}
            </Badge>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-background">
          {statuses.map((status) => (
            <DropdownMenuItem
              key={status}
              onClick={() => handleStatusSelect(status)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Badge variant={getStatusVariant(status)}>
                {status}
              </Badge>
              {status === selectedStatus && <Check className="h-4 w-4 ml-auto" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {showSaveButton && (
        <Button size="sm" className="h-8" onClick={handleSave}>
          Save
        </Button>
      )}
    </div>
  );
};

export default CourseStatusDropdown;
