
import { DEFAULT_BUCKET_NAME } from '../constants';

export const uploadFileToBackend = async (
  file: File,
  backendUrl: string,
  bucketName: string = DEFAULT_BUCKET_NAME,
  onProgress: (progress: number) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    
    formData.append('file', file);
    formData.append('bucketName', bucketName);

    // If backendUrl is empty (relative mode), construct path as '/upload'
    // If backendUrl is provided (e.g. http://localhost:3001), construct as 'http://localhost:3001/upload'
    let endpoint = '/upload';
    if (backendUrl) {
       endpoint = backendUrl.endsWith('/upload') ? backendUrl : `${backendUrl.replace(/\/$/, '')}/upload`;
    }

    xhr.open('POST', endpoint, true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100;
        onProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response.publicUrl);
        } catch (e) {
          reject(new Error('Invalid response from server'));
        }
      } else {
        let errorMessage = 'Upload failed';
        try {
          const err = JSON.parse(xhr.responseText);
          errorMessage = err.message || errorMessage;
        } catch (e) {
          // ignore
        }
        reject(new Error(`Server Error (${xhr.status}): ${errorMessage}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error. Is the backend server running?'));
    xhr.send(formData);
  });
};
