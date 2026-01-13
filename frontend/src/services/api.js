import axios from 'axios';

const API_URL = 'http://localhost:8080'; // Adjust if your backend runs elsewhere

const api = axios.create({
    baseURL: API_URL,
});

export const getRegions = async () => {
    const response = await api.get('/superadmin/regions');
    return response.data;
};

export const getPlantsByRegion = async (regionName) => {
    const response = await api.get(`/superadmin/plants?region=${regionName}`);
    return response.data.plants;
};

export const getAdminsByPlant = async (plantId) => {
    // Assuming backend endpoint exists or we filter client side. 
    // Ideally: GET /users?role=ADMIN&plant_id=...
    // For now, let's fetch all admins and filter client side if backend doesn't support generic filter
    const response = await api.get('/users?role=ADMIN'); 
    return response.data.filter(user => user.plant_id === plantId);
};

export const registerUser = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};

export default api;
