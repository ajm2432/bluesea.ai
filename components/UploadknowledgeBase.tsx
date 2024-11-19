import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
// @ts-ignore
// Helper function to chunk files
const chunkFile = (file, chunkSize) => {
  const chunks = [];
  let offset = 0;
  while (offset < file.size) {
    chunks.push(file.slice(offset, offset + chunkSize));
    offset += chunkSize;
  }
  return chunks;
};

const FileUploadMultipart = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(true); // To manage modal visibility
  //@ts-ignore
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
    const fileChunks = chunkFile(selectedFile, CHUNK_SIZE);
    const totalParts = fileChunks.length;

    try {
      // Step 1: Initiate multipart upload
      const initResponse = await fetch('YOUR_API_ENDPOINT/initiate-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        //@ts-ignore
          file_name: selectedFile.name,
          part_count: totalParts,
        }),
      });

      const initData = await initResponse.json();
      const uploadId = initData.upload_id;
      const presignedUrls = initData.presigned_urls;

      // Step 2: Upload each part
      const uploadPromises = fileChunks.map((chunk, index) => {
        const { part_number, url } = presignedUrls[index];

        return fetch(url, {
          method: 'PUT',
          body: chunk,
        }).then((response) => {
          if (!response.ok) throw new Error('Upload failed for part ' + part_number);
          return response.headers.get('ETag'); // Needed for the complete request
        });
      });

      // Track progress
      let uploadedParts = 0;
      const etags = await Promise.all(
        uploadPromises.map((promise) =>
          promise.then((etag) => {
            uploadedParts += 1;
            setUploadProgress((uploadedParts / totalParts) * 100);
            return etag;
          })
        )
      );
      
      // Step 3: Complete multipart upload
      await fetch('YOUR_API_ENDPOINT/complete-upload', {
      
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            //@ts-ignore
          file_name: selectedFile.name,
          upload_id: uploadId,
          parts: etags.map((etag, index) => ({
            ETag: etag,
            PartNumber: index + 1,
          })),
        }),
      });

      alert('Upload completed successfully');
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
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded-md file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <div className="mb-4">
                  {/* Upload Button */}
                  <Button
                    onClick={handleUpload}
                    disabled={uploading || !selectedFile}
                    className="w-full"
                  >
                    {uploading ? 'Uploading...' : 'Upload File'}
                  </Button>
                </div>
                {uploading && (
                  <div className="mb-4">
                    {/* Progress Bar */}
                    <progress
                      value={uploadProgress}
                      max="100"
                      className="w-full h-2 rounded bg-gray-200"
                    ></progress>
                    <p className="text-center mt-2 text-sm">
                      {uploadProgress.toFixed(2)}% complete
                    </p>
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
