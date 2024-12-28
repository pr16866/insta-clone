import { setMessages } from "@/redux/slice/chatSlice";
import { setPosts } from "@/redux/slice/postSlice";
import { fetchData } from "@/utils/fetchData";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import useLogout from "./useLogout";

const useGetAllMessage = () => {
    const dispatch = useDispatch();
    const {selectedUser} = useSelector(store=>store.auth);
    const logout = useLogout();

    useEffect(() => {
        const fetchAllMessage = async () => {
            try {
                // const res = await axios.get(`https://instaclone-g9h5.onrender.com/api/v1/message/all/${selectedUser?._id}`, { withCredentials: true });
                
                const res=await fetchData("get",`/message/all/${selectedUser?._id}`)
                if (res.data.success) {  
                    dispatch(setMessages(res.data.messages));
                }else{
                    logout(res);

                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchAllMessage();
    }, [selectedUser]);
};
export default useGetAllMessage;