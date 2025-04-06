import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

// 1) Import or define the same formatDate function you use in compre-exam.jsx
const formatDate = (dateArray) => {
  if (!dateArray || dateArray.length < 6) return "Invalid Date";
  const [year, month, day, hour, minute, second] = dateArray;
  const date = new Date(year, month - 1, day, hour, minute, second);
  return date.toLocaleString();
};

const ActionDialogg = ({ open, onOpenChange, actionType, request, onConfirm }) => {
  if (!request || !actionType) return null;

  const isApprove = actionType === "approve";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isApprove ? "Approve Request" : "Reject Request"}
          </DialogTitle>
          <DialogDescription>
            {isApprove
              ? "Are you sure you want to approve this request?"
              : "Are you sure you want to reject this request?"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-2">
            {/* Exam ID */}
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Exam:</span>
              <span className="text-sm text-gray-900">{request.examId}</span>
            </div>

            {/* Roll No */}
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Roll No:</span>
              <span className="text-sm text-gray-900">{request.studentRoll}</span>
            </div>

            {/* Student Name */}
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Student:</span>
              <span className="text-sm text-gray-900">{request.studentName}</span>
            </div>

            {/* Applied Date (formatted) */}
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Applied Date:</span>
              <span className="text-sm text-gray-900">
                {request.dateApplied ? formatDate(request.dateApplied) : "N/A"}
              </span>
            </div>

            {/* Student Shift */}
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Shift:</span>
              <span className="text-sm text-gray-900">{request.shift}</span>
            </div>

            {/* Student Special Syllabus */}
            <div className="mb-2">
            <span className="text-sm font-medium text-gray-500">Specialized Syllabi:</span>
            <span className="text-sm text-gray-900">
              <ul className="list-disc list-inside text-sm font-medium text-gray-500">
                {request.specializedSyllabi && request.specializedSyllabi.length > 0 ? (
                  request.specializedSyllabi.map((s, index) => (
                    <li key={s.id || index}>{s.content}</li>
                  ))
                ) : (
                  <li>No syllabi provided.</li>
                )}
              </ul>
              </span>
            </div>

          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className={
              isApprove
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

export default ActionDialogg;
