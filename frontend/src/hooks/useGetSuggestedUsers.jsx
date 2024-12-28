// import { setSuggestedUsers } from "@/redux/authSlice";
import { setAuthUser, setSuggestedUsers } from "@/redux/slice/authSlice";
import { setPosts, setSelectedPost } from "@/redux/slice/postSlice";
import { fetchData } from "@/utils/fetchData";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import useLogout from "./useLogout";


const useGetSuggestedUsers = () => {
    const dispatch = useDispatch();
    const navigate=useNavigate();
     const logout = useLogout();
    useEffect(() => {
        const fetchSuggestedUsers = async () => {
            try {
                // const res = await axios.get('https://instaclone-g9h5.onrender.com/api/v1/user/suggested', { withCredentials: true });
               const res= await fetchData("get","/user/suggested")
                if (res.data.success) { 
                    dispatch(setSuggestedUsers(res.data.users));
                }else {
                    logout(res);
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchSuggestedUsers();
    }, []);
};
export default useGetSuggestedUsers;