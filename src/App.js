import React, { useState, useEffect } from 'react';
import axios from 'axios'; 

function App() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await axios.get('https://your-backend-api.com/files');
      setFiles(response.data);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const uploadFiles = async (event) => {
    const data = new FormData();
    for (let file of event.target.files) {
      data.append('files', file);
    }

    setUploading(true);
    try {
      await axios.post('https://your-backend-api.com/upload', data);
      fetchFiles();
    } catch (error) {
      console.error('Error uploading files:', error);
    }
    setUploading(false);
  };

  return (
    <div className="App">
      <h1>Simple File Manager</h1>
      <input type="file" multiple onChange={uploadFiles} disabled={uploading} />
      <div>
        {uploading ? <p>Uploading files...</p> : null}
        {files.map(file => (
          <div key={file.name}>{file.name}</div>
        ))}
      </div>
    </div>
  );
}
export default App;

