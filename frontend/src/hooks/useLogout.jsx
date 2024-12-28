import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setAuthUser } from "@/redux/slice/authSlice";
import { setPosts, setSelectedPost } from "@/redux/slice/postSlice";
import { toast } from "sonner";
// import { setAuthUser, setSelectedPost, setPosts } from "@/redux/slice/authSlice";

const useLogout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const logout = (response) => {
        if (response?.status === 401 || response?.data?.message === "Unauthorized") {
            // Handle 401 error and log out the user
            dispatch(setAuthUser(null));
            dispatch(setSelectedPost(null));
            dispatch(setPosts([]));
            dispatch(setUserProfile({}));

            // Redirect to the login page
            navigate("/login");
        } else {
            toast.warning(res.data.message)
            // Handle other scenarios if needed (e.g., other errors or successful responses)
            console.log("Logging out due to:", response);
        }
    };

    return logout;
};

export default useLogout;
