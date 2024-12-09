import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type UploadProps = {
  onClose: () => void;
};

type FileUploadStatus = {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
};

const FileUpload = ({ onClose }: UploadProps) => {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const bucketOptions = ["demo-data-asg4563", "seasidesec"];
  const [bucketName, setBucketName] = useState(bucketOptions[0]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileStatuses, setFileStatuses] = useState<FileUploadStatus[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(true);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
    
    // Initialize file statuses
    const initialStatuses = files.map(file => ({
      file,
      status: 'pending' as const,
      progress: 0,
      error: file.size > MAX_FILE_SIZE ? 'File too large' : undefined
    }));
    setFileStatuses(initialStatuses);
  };

  const encodeFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = () => reject(new Error(`Failed to encode file ${file.name}`));
      reader.readAsDataURL(file);
    });
  };

  const uploadFile = async (fileStatus: FileUploadStatus) => {
    const { file, status } = fileStatus;

    // Skip files that are too large
    if (file.size > MAX_FILE_SIZE) {
      setFileStatuses(prev => 
        prev.map(f => 
          f.file === file 
            ? { ...f, status: 'error', error: 'File size exceeds 10MB limit' }
            : f
        )
      );
      return false;
    }

    try {
      // Update status to uploading
      setFileStatuses(prev => 
        prev.map(f => 
          f.file === file 
            ? { ...f, status: 'uploading', progress: 0 }
            : f
        )
      );

      const base64Data = await encodeFileToBase64(file);
      
      const response = await fetch(
        "https://iu150pbrqd.execute-api.us-east-1.amazonaws.com/dev/v1/upload-to-kb/upload-file",
        {
          method: "POST",
          body: JSON.stringify({ 
            file_name: file.name, 
            file_data: base64Data, 
            bucket_name: bucketName 
          }),
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed for ${file.name}`);
      }

      // Update status to success
      setFileStatuses(prev => 
        prev.map(f => 
          f.file === file 
            ? { ...f, status: 'success', progress: 100 }
            : f
        )
      );

      return true;
    } catch (error) {
      // Update status to error
      setFileStatuses(prev => 
        prev.map(f => 
          f.file === file 
            ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Unknown error' }
            : f
        )
      );
      return false;
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    try {
      // Upload files sequentially
      for (const fileStatus of fileStatuses) {
        await uploadFile(fileStatus);
      }

      // Check if any uploads were successful
      const successfulUploads = fileStatuses.filter(f => f.status === 'success').length;
      const failedUploads = fileStatuses.filter(f => f.status === 'error').length;
    } catch (error) {
      console.error("Upload process error:", error);
      alert("File upload process encountered an error");
    } finally {
      setUploading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    onClose();
  };

  const getStatusColor = (status: FileUploadStatus['status']) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'uploading': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-600 bg-opacity-50 z-50">
          <div className="w-full max-w-md mx-auto bg-white p-6 rounded-lg">
            <Card>
              <CardContent className="flex-1 flex flex-col overflow-hidden pt-6 px-6 pb-4">
                <h1 className="text-2xl font-semibold mb-4">File Upload</h1>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Knowledgebase
                  </label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full">
                        {bucketName}
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {bucketOptions.map((bucket) => (
                        <DropdownMenuItem
                          key={bucket}
                          onClick={() => setBucketName(bucket)}
                        >
                          {bucket}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mb-4">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    multiple
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded-md file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                {fileStatuses.length > 0 && (
                  <div className="mb-4 max-h-40 overflow-y-auto">
                    {fileStatuses.map((fileStatus) => (
                      <div key={fileStatus.file.name} className="mb-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-sm ${getStatusColor(fileStatus.status)}`}>
                            {fileStatus.file.name}
                          </span>
                          <span className="text-sm text-gray-600">
                            {fileStatus.file.size > MAX_FILE_SIZE 
                              ? 'Too large' 
                              : `${(fileStatus.file.size / 1024).toFixed(1)} KB`}
                          </span>
                        </div>
                        <Progress 
                          value={fileStatus.progress} 
                          className={`h-2 ${
                            fileStatus.status === 'success' ? 'bg-green-200' :
                            fileStatus.status === 'error' ? 'bg-red-200' : 'bg-blue-200'
                          }`}
                        />
                        {fileStatus.error && (
                          <p className="text-xs text-red-600 mt-1">{fileStatus.error}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className="mb-4">
                  <Button
                    onClick={handleUpload}
                    disabled={uploading || selectedFiles.length === 0}
                    className="w-full"
                  >
                    {uploading ? "Uploading..." : "Upload Files"}
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="p-6 flex justify-between">
                <Button onClick={handleCloseModal} disabled={uploading}>
                  Close
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </>
  );
};

export default FileUpload;