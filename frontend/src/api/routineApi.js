import axiosClient from './axiosClient';

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;

export const routineApi = {
    getByDate: (date) => axiosClient.get('/routines', { params: { date } }).then(unwrap),
    save: (data) => axiosClient.put('/routines', data).then(unwrap),
    checkIn: (data) => axiosClient.put('/routines/check-in', data).then(unwrap),
    undoCheckIn: (data) => axiosClient.post('/routines/check-in/undo', data).then(unwrap),
};

export default routineApi;
