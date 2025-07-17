import axios from "axios";

export const getCheck = async (id: string) => {
  const url = `http://localhost:80/UNG/hs/billsqueque/status_get/${id}`;
  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Basic dmVua29uOm92ZXJsb3Jk` },
    });
    return response.data;
  } catch (error) {
    // Handle error as needed
    throw error;
  }
};
