import { setUserProfile } from "@/redux/slice/authSlice";
import { fetchData } from "@/utils/fetchData";
import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import useLogout from "./useLogout";


const useGetUserProfile = (userId) => {
    const dispatch = useDispatch();
    // const [userProfile, setUserProfile] = useState(null);
    const logout = useLogout();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                // const res = await axios.get(`https://instaclone-g9h5.onrender.com/api/v1/user/${userId}/profile`, { withCredentials: true });
               const res=await fetchData("get",`/user/${userId}/profile`);
                if (res.data.success) { 
                    dispatch(setUserProfile(res.data.user));
                }else{
                    logout(res);
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchUserProfile();
    }, [userId]);
};
export default useGetUserProfile;