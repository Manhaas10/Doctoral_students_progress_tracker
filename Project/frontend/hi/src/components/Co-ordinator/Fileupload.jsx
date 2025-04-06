import { useState, useRef } from "react";
import { Upload, File, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";



const FileUpload = ({
  onFileSelect,
  accept = ".xlsx,.xls,.csv",
  maxSize = 10,
  className,
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (selectedFile) => {
    setError(null);
    
    // Check file type
    const fileType = selectedFile.name.split('.').pop()?.toLowerCase();
    const acceptableTypes = accept.split(',').map(type => 
      type.trim().replace('.', '').toLowerCase()
    );
    
    if (!acceptableTypes.includes(fileType || '')) {
      setError(`Invalid file type. Please upload ${accept} files only.`);
      return;
    }
    
    // Check file size
    if (selectedFile.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds ${maxSize}MB limit.`);
      return;
    }
    
    setFile(selectedFile);
    if (onFileSelect) {
      onFileSelect(selectedFile);
    }
    
    toast({
      title: "File uploaded",
      description: `${selectedFile.name} has been selected.`,
    });
  };

  const handleDragOver = () => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = () => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-xl p-8 transition-all duration-200 flex flex-col items-center justify-center text-center",
          isDragging ? "border-primary bg-primary/5" : "border-border",
          error ? "border-red-300 bg-red-50" : "",
          "cursor-pointer hover:border-primary/60 hover:bg-primary/5"
        )}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {file ? (
          <div className="flex flex-col items-center animate-scale-in">
            <CheckCircle className="h-10 w-10 text-green-500 mb-2" />
            <p className="font-medium text-green-600">{file.name}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
            >
              Change file
            </Button>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center animate-scale-in">
            <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
            <p className="font-medium text-red-600">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4 border-red-200 text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                setError(null);
              }}
            >
              Try again
            </Button>
          </div>
        ) : (
          <>
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-1">Upload Excel File</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Drag and drop your file here or click to browse
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <File className="h-3 w-3" />
              Accepts {accept.replaceAll(".", "")} files up to {maxSize}MB
            </p>
          </>
        )}
      </div>
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        accept={accept}
        onChange={(e) => {
          if (e.target.files?.length) {
            handleFileSelect(e.target.files[0]);
          }
        }}
      />
    </div>
  );
};

export default FileUpload;
