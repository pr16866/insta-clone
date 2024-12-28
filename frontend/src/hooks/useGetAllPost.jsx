import { setAuthUser } from "@/redux/slice/authSlice";
import { setPosts, setSelectedPost } from "@/redux/slice/postSlice";
import { fetchData } from "@/utils/fetchData";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import useLogout from "./useLogout";


const useGetAllPost = () => {
    const dispatch = useDispatch();
    const navigate=useNavigate()
    const logout = useLogout();
    useEffect(() => {
        const fetchAllPost = async () => {
            try {
                // const res = await axios.get('https://instaclone-g9h5.onrender.com/api/v1/post/all', { withCredentials: true });
                const res=await fetchData("get","/post/all")
               
                if (res.data.success) { 
                    console.log(res.data.posts);
                    dispatch(setPosts(res.data.posts));
                }else {
                    logout(res)
                }
            } catch (error) {
                console.log(error);

            }
        }
        fetchAllPost();
    }, []);
};
export default useGetAllPost;