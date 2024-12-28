import { Heart, Home, LogOut, MessageCircle, MessageCircleCode, PlusSquare, Search, SearchIcon, TrendingUp } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { toast } from 'sonner'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setAuthUser, setUserProfile } from '@/redux/slice/authSlice'
import CreatePost from './CreatePost'
import { setPosts, setSelectedPost } from '@/redux/slice/postSlice'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Button } from './ui/button'
import { fetchData } from '@/utils/fetchData'
import useLogout from '@/hooks/useLogout'
import { Dialog, DialogContent, DialogHeader } from './ui/dialog'
import { Input } from './ui/input'

const LeftSidebar = () => {
    const navigate = useNavigate();
    const { user } = useSelector(store => store.auth);
    const { likeNotification } = useSelector(store => store.realTimeNotification);
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const logout = useLogout();
    const [isSearchDilogOpen,setIsSearchDilogOpen]=useState(false);
    const { suggestedUsers } = useSelector(store => store.auth);
    const [searchgText,setSearchText]=useState("");
    const [filterData,setFilterData]=useState([]);
    // const navigate=useNavigate();

    const logoutHandler = async () => {
        try {
            // const res = await axios.get('https://instaclone-g9h5.onrender.com/api/v1/user/logout', { withCredentials: true });
           let res=await fetchData("get","/user/logout");
            if (res.data.success) {
                dispatch(setAuthUser(null));
                dispatch(setSelectedPost(null));
            dispatch(setUserProfile({}));

                dispatch(setPosts([]));
                navigate("/login");
                toast.success(res.data.message);
            }else{
                logout(res);

            }
        } catch (error) {
            toast.error(error.response.data.message);
        }
    }

    const sidebarHandler = (textType) => {
        if (textType === 'Logout') {
            logoutHandler();
        } else if (textType === "Create") {
            setOpen(true);
        } else if (textType === "Profile") {
            navigate(`/profile/${user?._id}`);
        } else if (textType === "Home") {
            navigate("/");
        } else if (textType === 'Messages') {
            navigate("/chat");
        }else if(textType==="Search"){
            setIsSearchDilogOpen(true)
        }
    }

    const sidebarItems = [
        { icon: <Home />, text: "Home" },
        { icon: <Search />, text: "Search" },
        // { icon: <TrendingUp />, text: "Explore" },
        { icon: <MessageCircleCode />, text: "Messages" },
        // { icon: <Heart />, text: "Notifications" },
        { icon: <PlusSquare />, text: "Create" },
        {
            icon: (
                <Avatar className='w-6 h-6'>
                    <AvatarImage src={user?.profilePicture} alt="@shadcn" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
            ),
            text: "Profile"
        },
        { icon: <LogOut />, text: "Logout" },
    ]
  
    const isFollowing=(followingId)=>{
        return user?.following?.includes(followingId)
       }
 
    const handleFollowAndUnfollow = async (followingId) => {
        try {
          let res = await fetchData("post", `/user/followOrUnfollow/${followingId}`);
      console.log("res.data",res.data)
          if (res.data.success) {
            // Create deep copies of user and userProfile
            let prevUser = JSON.parse(JSON.stringify(user));
       
            prevUser.following = res.data.followed
              ? [...prevUser.following, followingId] // Add if followed
              : prevUser.following.filter((item) => item !== followingId); // Remove if unfollowed
      
            dispatch(setAuthUser({ ...prevUser }));
           
            toast.success(res.data.message);
          } else {
            logout(res); // Handle logout for unsuccessful response
          }
        } catch (error) {
          toast.error(error.message);
        }
      };
     
      useEffect(() => {
       if(searchgText){
        setFilterData(suggestedUsers.filter((item)=>item.username.includes(searchgText)));
       }else{
        setFilterData([...suggestedUsers])
       }
      }, [searchgText])
      
    return (
        <div className='fixed top-0 z-10 left-0 px-4 border-r border-gray-300 w-[16%] h-screen'>
            <div className='flex flex-col'>
                <h1 className='my-8 pl-3 font-bold text-xl'>LOGO</h1>
                <div>
                    {
                        sidebarItems.map((item, index) => {
                            return (
                                <div onClick={() => sidebarHandler(item.text)} key={index} className='flex items-center gap-3 relative hover:bg-gray-100 cursor-pointer rounded-lg p-3 my-3'>
                                    {item.icon}
                                    <span>{item.text}</span>
                                    {
                                        item.text === "Notifications" &&  (
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button size='icon' className="rounded-full h-5 w-5 bg-red-600 hover:bg-red-600 absolute bottom-6 left-6">{likeNotification.length}</Button>
                                                </PopoverTrigger>
                                                <PopoverContent>
                                                    <div>
                                                        {
                                                            likeNotification.length === 0 ? (<p>No new notification</p>) : (
                                                                likeNotification.map((notification) => {
                                                                    return (
                                                                        <div key={notification.userId} className='flex items-center gap-2 my-2'>
                                                                            <Avatar>
                                                                                <AvatarImage src={notification.userDetails?.profilePicture} />
                                                                                <AvatarFallback>CN</AvatarFallback>
                                                                            </Avatar>
                                                                            <p className='text-sm'><span className='font-bold'>{notification.userDetails?.username}</span> liked your post</p>
                                                                        </div>
                                                                    )
                                                                })
                                                            )
                                                        }
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        )
                                    }
                                </div>
                            )
                        })
                    }
                </div>
            </div>

            <CreatePost open={open} setOpen={setOpen} />
            <Dialog open={isSearchDilogOpen}>
      <DialogContent onInteractOutside={() => {setIsSearchDilogOpen(false)
        setSearchText("")
      }}>
      <div>

      <Input
      type="text"
      placeholder="Search friends..."
      Icon={SearchIcon}  // Passing the icon component
      className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 pl-10 py-2 rounded-md focus:ring-0 focus:outline-none hover:bg-slate-200 dark:hover:bg-slate-700"
   onChange={(e)=>setSearchText(e.target.value)}
   value={searchgText}
   />

        </div>
      <div className=' px-4 py-2 max-h-40 overflow-y-auto scrollable-container'>
      
     
            {
                filterData?.map((suggeteduser) => {
                    if(user?._id!==suggeteduser?._id){

                    return (
                        <div key={suggeteduser._id} className='flex items-center justify-between my-5 cursor-pointer' onClick={()=>{
                            setIsSearchDilogOpen(false)
                            navigate(`/profile/${suggeteduser?._id}`)
                        }}>
                            <div className='flex items-center gap-2'>
                                <div >
                                    <Avatar>
                                        <AvatarImage src={suggeteduser?.profilePicture} alt="post_image" />
                                        <AvatarFallback>CN</AvatarFallback>
                                    </Avatar>
                                </div>
                                <div>
                                    <h1 className='font-semibold text-sm'><Link to={`/profile/${suggeteduser?._id}`}>{suggeteduser?.username}</Link></h1>
                                    <span className='text-gray-600 text-sm'>{suggeteduser?.bio || 'Bio here...'}</span>
                                </div>
                            </div>
                            {/* {console.log("profile?.following?.include(user?._id)",profile?.following)} */}
                            <span className={`${isFollowing(suggeteduser._id)?"text-slate-400":"text-[#3BADF8]"} text-xs font-bold cursor-pointer `} onClick={()=>{handleFollowAndUnfollow(suggeteduser?._id)}}>{isFollowing(suggeteduser?._id)?"Unfollow":"Follow"}</span>
                        </div>
                    )
                }
                })
            }

        </div>

</DialogContent>
            </Dialog>
        </div>
    )
}

export default LeftSidebar