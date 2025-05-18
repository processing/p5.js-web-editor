import axios from 'axios';

const api = {
  uploadImageByUrl: async (imageUrl) => {
    const response = await axios.post('/api/media/upload-by-url', { imageUrl });
    return response.data;
  },
  updateSketchFiles: async ({ sketchId, files }) => {
    const response = await axios.put(`/api/sketches/${sketchId}`, { files });
    return response.data;
  }
};

export default api;
