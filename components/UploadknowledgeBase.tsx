import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import ManageLibrary from "./ManageLibrary";

type UploadProps = {
  onClose: () => void;
};

const FileUpload = ({ onClose }: UploadProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(true);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const updateProgress = (fileName: string, progress: number) => {
    setUploadProgress((prev) => ({
      ...prev,
      [fileName]: progress,
    }));
  };

  const encodeFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]); // Extract Base64 part
      reader.onerror = () => reject(new Error(`Failed to encode file ${file.name}`));
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = selectedFiles.map(async (file) => {
        const base64Data = await encodeFileToBase64(file);

        const response = await fetch(
          "https://iu150pbrqd.execute-api.us-east-1.amazonaws.com/dev/v1/upload-to-kb/upload-file",
          {
            method: "POST",
            body: JSON.stringify({ file_name: file.name, file_data: base64Data }),
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response.ok) {
          throw new Error(`Upload failed for ${file.name}`);
        }

        updateProgress(file.name, 100); // Mark the file as 100% uploaded
      });

      await Promise.all(uploadPromises);
      alert("All uploads completed successfully");
    } catch (error) {
      console.error("Upload error:", error);
      alert("File upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    onClose();
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
                  <input
                    type="file"
                    onChange={handleFileChange}
                    multiple
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded-md file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
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
