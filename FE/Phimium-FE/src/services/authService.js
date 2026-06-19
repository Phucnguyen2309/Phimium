import axiosClient from '../api/axiosClient';

export const loginUser = async (email, password) => {
    try {
        const response = await axiosClient.post('/auth/login', {
            email,
            password
        });
        return response.data; 
    } catch (error) {
        throw error.response?.data || 'Đăng nhập thất bại. Kiểm tra lại thông tin.';
    }
};
export const registerUser = async (userData) => {
    try {
        const response = await axiosClient.post('/auth/register', userData);
        return response.data; 
    } catch (error) {
        throw error.response?.data || 'Đăng ký thất bại. Vui lòng thử lại.';
    }
};