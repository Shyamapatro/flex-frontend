import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [brightness, setBrightness] = useState<number>(1);
  const [contrast, setContrast] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);

  // Loader states
  const [uploading, setUploading] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await axios.post('http://localhost:3002/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setPreview(response.data.filePath);
        toast.success("Image uploaded successfully!");
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Failed to upload image.");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleProcessImage = async () => {
    if (!preview) return;

    setProcessing(true);

    try {
      const response = await axios.post('http://localhost:3002/process', {
        filePath: preview,
        brightness,
        contrast,
        rotation,
        format: 'jpeg'
      });
      const url = response.data.filePath;
      setProcessedImageUrl(url);
      toast.success("Image processed successfully!");
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("Failed to process image.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async (format: 'png' | 'jpeg') => {
    if (!processedImageUrl) {
      toast.error("No processed image available for download.");
      return;
    }

    setDownloading(true);

    try {
      const response = await axios.post('http://localhost:3002/download', {
        filePath: processedImageUrl,
        format
      }, {
        responseType: 'blob'
      });

      if (response.status === 200) {
        const url = URL.createObjectURL(response.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `processed.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Image downloaded successfully!");
      } else {
        toast.error(`Failed to download image. Status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error downloading image:", error);
      toast.error("Failed to download image.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Image Processor</h1>

        {/* Image Upload */}
        <div className="mb-6">
          <input
            type="file"
            onChange={handleImageUpload}
            accept="image/png, image/jpeg"
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all duration-300"
          />
          {uploading && <p className="text-blue-600 mt-2">Uploading...</p>}
        </div>

        {/* Image Preview */}
        {preview && !uploading && (
          <div className="mb-6 flex flex-col items-center">
            <img src={preview} alt="Preview" className="w-64 h-auto rounded-lg shadow-md mb-4" />
            <span className="text-sm text-gray-500">Preview of the uploaded image</span>
          </div>
        )}

        {/* Sliders for brightness, contrast, rotation */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Brightness</label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-gray-600 text-sm">{brightness.toFixed(1)}</span>

          <label className="block text-gray-700 font-medium mb-2 mt-4">Contrast</label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={contrast}
            onChange={(e) => setContrast(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-gray-600 text-sm">{contrast.toFixed(1)}</span>

          <label className="block text-gray-700 font-medium mb-2 mt-4">Rotation</label>
          <input
            type="range"
            min="0"
            max="360"
            step="1"
            value={rotation}
            onChange={(e) => setRotation(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-gray-600 text-sm">{rotation}°</span>
        </div>

        {/* Apply Changes Button */}
        <div className="text-center mb-6">
          <button
            onClick={handleProcessImage}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition-all duration-300"
            disabled={processing}
          >
            {processing ? 'Processing...' : 'Apply Changes'}
          </button>
        </div>

        {/* Download Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => handleDownload('jpeg')}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-300"
            disabled={downloading}
          >
            {downloading ? 'Downloading...' : 'Download as JPEG'}
          </button>
          <button
            onClick={() => handleDownload('png')}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-300"
            disabled={downloading}
          >
            {downloading ? 'Downloading...' : 'Download as PNG'}
          </button>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default App;