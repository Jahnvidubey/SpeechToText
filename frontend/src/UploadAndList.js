// src/UploadAndList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload'; // Correct import path
import './UploadAndList.css'; // Include your custom CSS for styling

const UploadAndList = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState({});
  const [transcribedFiles, setTranscribedFiles] = useState({}); // Track transcribed files

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = () => {
    axios.get('http://127.0.0.1:8000/speech/retrieve/')
      .then(response => {
        setFiles(response.data);
      })
      .catch(error => {
        console.error('Error fetching audio files:', error);
      });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    axios.post('http://127.0.0.1:8000/speech/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then(response => {
      console.log('File uploaded successfully:', response.data);
      fetchFiles(); // Refresh the file list after upload
    })
    .catch(error => {
      console.error('Error uploading file:', error);
    });
  };

  const handleTranscribe = (filePath) => {
    setLoading(prev => ({ ...prev, [filePath]: true }));

    axios.get(`http://127.0.0.1:8000/speech/transcribe/${filePath}/`, { responseType: 'blob' })
      .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        setTranscribedFiles(prev => ({ ...prev, [filePath]: url }));
      })
      .catch(error => {
        console.error('Error transcribing audio file:', error);
      })
      .finally(() => {
        setLoading(prev => ({ ...prev, [filePath]: false }));
      });
  };

  return (
    <div>
      <h2>Upload and List Audio Files</h2>
      <Button
        component="label"
        variant="contained"
        startIcon={<CloudUploadIcon />}
      >
        Upload file
        <input
          type="file"
          hidden
          onChange={handleFileChange}
        />
      </Button>

      <h3>Uploaded Files</h3>
      <ul>
        {files.map(filePath => (
          <li key={filePath}>
            {filePath.split('/').pop()}
            <Button
              variant="contained"
              onClick={() => handleTranscribe(filePath)}
              disabled={loading[filePath]}
              style={{ backgroundColor: loading[filePath] ? 'gray' : '#125570' }}
            >
              {loading[filePath] ? 'Transcribing...' : 'Transcribe'}
            </Button>
            {loading[filePath] && <CircularProgress size={20} />}
            {transcribedFiles[filePath] && (
              <Button
                variant="contained"
                color="secondary"
                href={transcribedFiles[filePath]}
                download={`${filePath}.txt`}
              >
                Download
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UploadAndList;
