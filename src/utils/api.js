import axios from "axios";

const api = axios.create({
  baseURL: "https://balaji-backend-7dos.onrender.com" ,
  headers: {
    "Content-Type": "application/json"
  }
});

export default api;