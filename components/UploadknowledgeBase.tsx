import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

// Helper function to chunk files
const chunkFile = (file: File, chunkSize: number) => {
  const chunks = [];
  let offset = 0;
  while (offset < file.size) {
    chunks.push(file.slice(offset, offset + chunkSize));
    offset += chunkSize;
  }
  return chunks;
};

const FileUploadMultipart = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]); // Handle multiple files
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({}); // Track progress per file
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(true); // To manage modal visibility

  // Handle file or directory selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files); // Update state to handle multiple files
  };

  // Update progress of a single file
  const updateProgress = (fileName: string, progress: number) => {
    setUploadProgress((prevProgress) => ({
      ...prevProgress,
      [fileName]: progress,
    }));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks

    try {
      // Step 1: Initiate multipart uploads for all files
      const initResponses = await Promise.all(selectedFiles.map(async (file) => {
        const fileChunks = chunkFile(file, CHUNK_SIZE);
        const totalParts = fileChunks.length;

        const initResponse = await fetch('YOUR_API_ENDPOINT/initiate-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file_name: file.name,
            part_count: totalParts,
          }),
        });

        return initResponse.json(); // Will return { upload_id, presigned_urls }
      }));

      const allUploadIds = initResponses.map(response => response.upload_id);
      const allPresignedUrls = initResponses.map(response => response.presigned_urls);

      // Step 2: Upload each part for each file
      const uploadPromises = selectedFiles.map((file, index) => {
        const fileChunks = chunkFile(file, CHUNK_SIZE);
        const uploadId = allUploadIds[index];
        const presignedUrls = allPresignedUrls[index];

        const uploadPartPromises = fileChunks.map((chunk, partIndex) => {
          const { part_number, url } = presignedUrls[partIndex];

          return fetch(url, {
            method: 'PUT',
            body: chunk,
          }).then((response) => {
            if (!response.ok) throw new Error('Upload failed for part ' + part_number);

            // Update progress for this file after each part is uploaded
            updateProgress(file.name, ((partIndex + 1) / fileChunks.length) * 100);
            return response.headers.get('ETag'); // Needed for the complete request
          });
        });

        return Promise.all(uploadPartPromises).then((etags) => {
          // Step 3: Complete multipart upload for each file
          return fetch('YOUR_API_ENDPOINT/complete-upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              file_name: file.name,
              upload_id: uploadId,
              parts: etags.map((etag, partIndex) => ({
                ETag: etag,
                PartNumber: partIndex + 1,
              })),
            }),
          });
        });
      });

      // Track overall progress across all files
      await Promise.all(uploadPromises);

      alert('All uploads completed successfully');
    } catch (error) {
      console.error('Multipart upload error:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false); // Close the modal after upload starts
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
                  {/* File Input */}
                  <input
                    type="file"
                    onChange={handleFileChange}
                    multiple
                    //@ts-ignore
                    webkitdirectory="true" // Allow directories to be selected
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded-md file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <div className="mb-4">
                  {/* Upload Button */}
                  <Button
                    onClick={handleUpload}
                    disabled={uploading || selectedFiles.length === 0}
                    className="w-full"
                  >
                    {uploading ? 'Uploading...' : 'Upload Files'}
                  </Button>
                </div>
                {uploading && (
                  <div className="mb-4">
                    {/* Progress Bars for Multiple Files */}
                    {selectedFiles.map((file) => (
                      <div key={file.name} className="mb-2">
                        <p>{file.name}</p>
                        <progress
                          value={uploadProgress[file.name] || 0}
                          max="100"
                          className="w-full h-2 rounded bg-gray-200"
                        ></progress>
                        <p className="text-center mt-2 text-sm">
                          {uploadProgress[file.name]?.toFixed(2)}% complete
                        </p>
                      </div>
                    ))}
                  </div>
                )}
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

export default FileUploadMultipart;
