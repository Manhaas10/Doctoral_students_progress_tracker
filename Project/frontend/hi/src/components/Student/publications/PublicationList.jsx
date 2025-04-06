import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Edit, MoreVertical, FileText, Trash, ExternalLink, Check, RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

// StatusBadge component for displaying status with colors
const StatusBadge = ({ status }) => {
  let customClass = "";

  switch (status) {
    case "Submitted":
      customClass = "bg-gray-500 text-white";
      break;
    case "Editorial Revision":
      customClass = "bg-yellow-500 text-white";
      break;
    case "Accepted":
      customClass = "bg-green-500 text-white";
      break;
    case "Published":
      customClass = "bg-blue-500 text-white";
      break;
    default:
      customClass = "bg-gray-300 text-black";
  }

  return <Badge className={customClass}>{status}</Badge>;
};

const PublicationList = ({ publications = [], onUpdateStatus }) => {
  const [editingStatus, setEditingStatus] = useState({ id: null, status: null });

  // Handle status change from dropdown
  const handleStatusChange = (publication, newStatus) => {
    setEditingStatus({ id: publication.id, status: newStatus });
  };

  // Send PUT request to update the status
  const handleSaveStatus = async (publication) => {
    if (editingStatus.id === publication.id && editingStatus.status) {
      try {
        const response = await fetch(`/api/publications/${publication.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: editingStatus.status }),
        });
  
        if (!response.ok) throw new Error("Failed to update status");
  
        const updatedPublication = await response.json();
        onUpdateStatus?.(publication.id, updatedPublication.status);
  
        toast.success(`Status updated to ${updatedPublication.status}`);
        setEditingStatus({ id: null, status: null });
  
        // ✅ Call API to add history record
        const historyResponse = await fetch(`/api/publications/history/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // publicationId: publication.id,
            title: publication.title, // ✅ Adding missing fields
            publishername: publication.publishername,
            journal: publication.journal,
            doi: publication.doi,
            publicationType: publication.publicationType,
            indexing: publication.indexing,
            quartile: publication.quartile,
            rollNo: publication.rollNo,
            status: updatedPublication.status,
            dateOfSubmission: new Date().toISOString().split('T')[0], // Ensure format matches backend expectations
          }),
        });
  
        if (!historyResponse.ok) throw new Error("Failed to add history record");
  
        console.log("History added successfully");
  
        // ✅ Refresh data in parent component if available
        if (typeof onUpdateStatus === "function") {
          onUpdateStatus(publication.id, updatedPublication.status);
        } else {
          window.location.reload(); // ❌ Fallback: Full page refresh
        }
      } catch (error) {
        toast.error("Error updating status");
        console.error("Error:", error);
      }
    }
  };
  
  

  const handleCancelEdit = () => {
    setEditingStatus({ id: null, status: null });
  };

  return (
    <div className="relative overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[20%]">Title</TableHead>
            <TableHead className="w-[15%]">Publisher Name</TableHead>
            <TableHead className="w-[15%]">Indexing</TableHead>
            <TableHead className="w-[15%]">Type</TableHead>
            <TableHead className="w-[15%]">Category</TableHead>
            {/* <TableHead className="w-[15%]">Status</TableHead> */}
            <TableHead className="w-[15%]">Status</TableHead>
            <TableHead className="w-[15%] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {publications.length > 0 ? (
            publications.map((publication) => (
              <TableRow key={publication.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  {publication.title}
                  <div className="text-xs text-muted-foreground mt-1">DOI: {publication.doi}</div>
                </TableCell>
                <TableCell>{publication.publishername}</TableCell>
                
                <TableCell>
                  <Badge variant="outline">{publication.indexing}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{publication.publicationType}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{publication.quartile}</Badge>
                </TableCell>
                <TableCell>
                  {editingStatus.id === publication.id ? (
                    <div className="flex flex-col space-y-2">
                      <Select
                        value={editingStatus.status || publication.status}
                        onValueChange={(value) => handleStatusChange(publication, value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Submitted">Submitted</SelectItem>
                          <SelectItem value="Editorial Revision">Editorial Revision</SelectItem>
                          <SelectItem value="Accepted">Accepted</SelectItem>
                          <SelectItem value="Published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={() => handleSaveStatus(publication)} className="flex-1">
                          <Check className="h-3 w-3 mr-1" /> Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEdit} className="flex-1">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="flex items-center gap-1 cursor-pointer"
                      onClick={() => setEditingStatus({ id: publication.id, status: publication.status })}
                    >
                      <StatusBadge status={publication.status} />
                      <RefreshCw className="h-3 w-3 text-primary" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          const doi = publication.doi; // Get the DOI of the publication
                          const url = `https://doi.org/${doi}`; // Construct the DOI URL
                          window.open(url, "_blank"); // Open the DOI URL in a new tab
                        }}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        <span>Open DOI</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No publications found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default PublicationList;
