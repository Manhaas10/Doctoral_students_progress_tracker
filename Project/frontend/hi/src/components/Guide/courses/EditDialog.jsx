import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
  } from "@/components/ui/dialog";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { useState, useEffect } from "react";
  import { X } from "lucide-react";
  
  import * as DialogPrimitive from "@radix-ui/react-dialog";
  
  const EditDialog = ({ open, onOpenChange, request, onSave }) => {
    // Ensure specializedSyllabi updates when request changes
    const [specializedSyllabi, setSpecializedSyllabi] = useState([]);
    const [newSyllabus, setNewSyllabus] = useState("");
  
    useEffect(() => {
      if (request?.specializedSyllabi) {
        setSpecializedSyllabi(request.specializedSyllabi.map(s => s.content)); // Extract content for editing
      }
    }, [request]);
  
    // Handle adding a new syllabus
    const handleAddSyllabus = () => {
      if (newSyllabus.trim() !== "") {
        setSpecializedSyllabi([...specializedSyllabi, newSyllabus]);
        setNewSyllabus("");
      }
    };
  
    // Handle editing an existing syllabus
    const handleSyllabusChange = (index, value) => {
      const updatedSyllabi = [...specializedSyllabi];
      updatedSyllabi[index] = value;
      setSpecializedSyllabi(updatedSyllabi);
    };
  
    // Handle removing an existing syllabus
    const handleRemoveSyllabus = (index) => {
      setSpecializedSyllabi(specializedSyllabi.filter((_, i) => i !== index));
    };
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {/* Custom Overlay to Remove Black Background */}
        <DialogPrimitive.Overlay className="fixed inset-0 bg-transparent" />
  
        <DialogContent className="sm:max-w-[425px] bg-white shadow-lg">
          <DialogHeader>
            <DialogTitle>Edit Application</DialogTitle>
          </DialogHeader>
  
          {/* Ensure request is not undefined before accessing fields */}
          {request ? (
            <>
              {/* Status Field (Read-Only) */}
              <div>
                <label className="block font-medium mb-1">Status</label>
                <Input value={request.status || "SUBMITTED"} readOnly />
              </div>
  
              {/* Shift Field (Read-Only) */}
              <div>
                <label className="block font-medium mb-1">Shift</label>
                <Input value={request.shift || "January"} readOnly />
              </div>
  
              {/* Specialized Syllabi List (Editable) */}
              <div>
                <label className="block font-medium mb-1">Specialized Syllabi</label>
                {specializedSyllabi.map((syllabus, index) => (
                  <div key={index} className="flex items-center gap-2 border p-2 rounded mb-2">
                    <Input
                      value={syllabus}
                      onChange={(e) => handleSyllabusChange(index, e.target.value)}
                    />
                    <Button size="icon" variant="ghost" onClick={() => handleRemoveSyllabus(index)}>
                      <X size={16} />
                    </Button>
                  </div>
                ))}
  
                {/* Input for New Syllabus */}
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newSyllabus}
                    onChange={(e) => setNewSyllabus(e.target.value)}
                    placeholder="Add new syllabus"
                  />
                  <Button onClick={handleAddSyllabus}>Add</Button>
                </div>
              </div>
            </>
          ) : (
            <p className="text-red-500">Error: No application data available.</p>
          )}
  
          {/* Footer Buttons */}
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={() => onSave({ ...request, specializedSyllabi })}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  export default EditDialog;
  