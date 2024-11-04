import React, { useState, useCallback } from 'react';

export default function UploadForm() {
    const [loading, setLoading] = useState(false);

    const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);

        try {
            const response = await fetch('app/api/process-document', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }

            // Process and download the file
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = 'processed_letter.docx';
            document.body.appendChild(a);
            a.click();
            a.remove();

            // Cleanup the object URL
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error:', error);

            // Type guard to check if error is an instance of Error
            if (error instanceof Error) {
                alert(`Error: ${error.message}`);
            } else {
                alert('An unknown error occurred');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <form onSubmit={handleSubmit}>
            <input type="file" name="file" accept=".pdf,.png,.jpg,.jpeg,.tiff" required />
            <button type="submit" disabled={loading}>
                {loading ? 'Processing...' : 'Upload and Process'}
            </button>
        </form>
    );
}
