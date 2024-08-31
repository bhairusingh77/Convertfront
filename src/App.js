import React, { useState } from 'react';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState('mp4');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [fileDownloaded, setFileDownloaded] = useState(false);
  const [previewKey, setPreviewKey] = useState(0); // Add a key to force video refresh

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, format }),
      });

      const data = await response.json();
      if (data.downloadUrl) {
        const timestamp = new Date().getTime(); // Add timestamp for cache-busting
        setDownloadUrl(`http://localhost:5000${data.downloadUrl}?t=${timestamp}`);
        setFileDownloaded(true);
        setPreviewKey(prevKey => prevKey + 1); // Ensure component re-renders
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleUnload = async () => {
    if (fileDownloaded) {
      try {
        await fetch('http://localhost:5000/api/delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ format }),
        });
      } catch (error) {
        console.error('Failed to delete file:', error);
      }
    }
  };

  React.useEffect(() => {
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [fileDownloaded]);

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL"
        />
        <select value={format} onChange={(e) => setFormat(e.target.value)}>
          <option value="mp4">Video (MP4)</option>
          <option value="mp3">Audio (MP3)</option>
        </select>
        <button type="submit">Download</button>
      </form>

      {downloadUrl && (
        <div className="preview-container">
          {format === 'mp4' ? (
            <video key={previewKey} controls className="video-preview">
              <source src={downloadUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <audio key={previewKey} controls className="audio-preview">
              <source src={downloadUrl} type="audio/mp3" />
              Your browser does not support the audio element.
            </audio>
          )}
          <a href="/howtodownload.html" className="redirect-link">How To Download</a>
        </div>
      )}
    </div>
  );
}

export default App;
