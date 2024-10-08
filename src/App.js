import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const BASE_URL = 'http://127.0.0.1:3030';

const getFileType = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    return {
        pptx: 'PPT', txt: 'Text', xlsx: 'Excel', docx: 'Word', pdf: 'PDF',
        jpg: 'Image', jpeg: 'Image', png: 'Image', gif: 'Image',
        mp3: 'Audio', flac: 'Audio',
        mp4: 'Video', mkv: 'Video',
        zip: 'Archive', rar: 'Archive', '7z': 'Archive'
    }[extension] || 'Other';
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

    const uploadFile = async (event) => {
        const data = new FormData();
        Array.from(event.target.files).forEach(file => {
            data.append('files', file);
        });

        setUploading(true);
        try {
            await axios.post(`${BASE_URL}/upload`, data, {
                params: { path: currentPath },
                headers: {'Content-Type': 'multipart/form-data'}
            });
            fetchFiles(currentPath);
            alert('文件上传成功！');
        } catch (error) {
            console.error('Error uploading files:', error);
            alert('文件上传失败！');
        }
        setUploading(false);
    };

    const uploadFolder = async (event) => {
        const data = new FormData();
        Array.from(event.target.files).forEach((file, index) => {
            console.log(file.name + ": " + file.webkitRelativePath);  // 打印文件名和路径
            data.append('files', file); // 将文件添加到 FormData
            data.append(`paths[${index}]`, file.webkitRelativePath); // 以数组索引的方式添加路径，确保唯一性
        });        
        // 查看 FormData 中的内容
        for (let [key, value] of data.entries()) {
            console.log(`${key}: ${value}`);
        }
        setUploading(true);
        try {
            await axios.post(`${BASE_URL}/upload`, data, {
                params: { path: currentPath },
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchFiles(currentPath);
            alert('文件夹上传成功！');
        } catch (error) {
            console.error('Error uploading files:', error);
            alert('文件夹上传失败！');
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
            <label htmlFor="file-upload" className="custom-file-upload">
                <img src="upload-file.svg" alt="上传文件" />
            </label>
            <input id="file-upload" type="file" multiple onChange={uploadFile} disabled={uploading} style={{display: 'none'}} />

            <label htmlFor="folder-upload" className="custom-file-upload">
                <img src="upload-folder.svg" alt="上传文件夹" />
            </label>
            <input id="folder-upload" type="file" multiple webkitdirectory="true" onChange={uploadFolder} disabled={uploading} style={{display: 'none'}} />

            {uploading && <p>正在上传...</p>}
            <button className="custom-file-upload" onClick={navigateUp} disabled={!currentPath}>返回</button>
            <table>
                <thead>
                    <tr>
                        <th>名称</th>
                        <th>类型</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    {files.map(file => (
                        <tr key={file.name}>
                            <td>{file.isDirectory ? `[文件夹] ${file.name}` : file.name}</td>
                            <td>{file.type}</td>
                            <td>
                                {file.isDirectory ? (
                                    <a href="#" onClick={(e) => handleFolderClick(e, file.name)} style={{ color: 'blue' }}>进入</a>
                                ) : (
                                    <a href={`${BASE_URL}/uploads/${encodeURIComponent(currentPath ? currentPath + '/' + file.name : file.name)}`} target="_blank" rel="noopener noreferrer">查看</a>
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
