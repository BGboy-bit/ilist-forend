import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const BASE_URL = 'http://127.0.0.1:3030';

const getFileType = (filename) => {
  const extension = filename.split('.').pop().toLowerCase();
  switch(extension) {
    case 'pptx':
      return 'PPT';
    case 'txt':
      return 'Text';
    case 'xlsx':
      return 'Excel';
    case 'docx':
      return 'Word';
    case 'pdf':
      return 'PDF';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return 'Image';
    case 'mp3':
    case 'flac':
      return 'Audio';
    case 'mp4':
    case 'mkv':
      return 'Video';
    case 'zip':
    case 'rar':
    case '7z':
      return 'Archive';
    default:
      return 'Other';
  }
};


function App() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    fetchFiles(currentPath);
  }, [currentPath]);

  const fetchFiles = async (path) => {
    try {
      const response = await axios.get(`${BASE_URL}/files?path=${encodeURIComponent(path)}`);
      setFiles(response.data.map(file => ({
        ...file,
        type: getFileType(file.name)
      })));
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
      await axios.post(`${BASE_URL}/upload`, data, { params: { path: currentPath } });
      fetchFiles(currentPath);
      alert('文件上传成功！');
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('文件上传失败！');
    }
    setUploading(false);
  };

  const handleFolderClick = (event, folderName) => {
    event.preventDefault();
    setCurrentPath(currentPath ? `${currentPath}/${folderName}` : folderName);
  };

  const navigateUp = () => {
    const upOneLevel = currentPath.substring(0, currentPath.lastIndexOf('/'));
    setCurrentPath(upOneLevel);
  };

  return (
    <div className="App">
      <h1>iList</h1>
      <input type="file" multiple onChange={uploadFiles} disabled={uploading} />
      {uploading && <p>Uploading files...</p>}
      <button onClick={navigateUp} disabled={!currentPath}>Back</button>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.map(file => (
            <tr key={file.name}>
              <td>{file.isDirectory ? `[Folder] ${file.name}` : file.name}</td>
              <td>{file.type}</td>
              <td>
                {file.isDirectory ? (
                  <a href="#" onClick={(e) => handleFolderClick(e, file.name)} style={{ color: 'blue' }}>Enter</a>
                ) : (
                  <a href={`${BASE_URL}/uploads/${encodeURIComponent(currentPath ? currentPath + '/' + file.name : file.name)}`} target="_blank" rel="noopener noreferrer">View</a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
