import { 
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter 
  } from '@/components/ui/dialog';
  import { Button } from '@/components/ui/button';
  import { Check, X } from 'lucide-react';
  

  
  const ActionDialog = ({ open, onOpenChange, actionType, request, onConfirm }) => {
    if (!request || !actionType) return null;
  
    const isApprove = actionType === 'approve';
    
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {isApprove ? 'Approve Course Request' : 'Reject Course Request'}
            </DialogTitle>
            <DialogDescription>
              {isApprove 
                ? 'Are you sure you want to approve this course request?' 
                : 'Are you sure you want to reject this course request?'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Course:</span>
                <span className="text-sm text-gray-900">{request.courseName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Course ID:</span>
                <span className="text-sm text-gray-900">{request.courseId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Student:</span>
                <span className="text-sm text-gray-900">{request.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Student ID:</span>
                <span className="text-sm text-gray-900">{request.studentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Credits:</span>
                <span className="text-sm text-gray-900">{request.Duration}</span>
              </div>
              {/* <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Applied Date:</span>
                <span className="text-sm text-gray-900">{request.appliedDate}</span>
              </div> */}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={onConfirm}
              className={isApprove 
                ? "bg-green-600 hover:bg-green-700 text-white" 
                : "bg-red-600 hover:bg-red-700 text-white"
              }
            >
              {isApprove ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Approve
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  export default ActionDialog;
  