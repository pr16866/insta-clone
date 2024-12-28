import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { setAuthUser } from '@/redux/slice/authSlice';
import { toast } from 'sonner';
import { fetchData } from '@/utils/fetchData';

const SuggestedUsers = () => {
    const { suggestedUsers } = useSelector(store => store.auth);
    const {user:profile}=useSelector(store=>store.auth);
    const dispatch=useDispatch();

    const handleFollowAndUnfollow = async (followingId) => {
        try {
          let res = await fetchData("post", `/user/followOrUnfollow/${followingId}`);
      console.log("res.data",res.data)
          if (res.data.success) {
            // Create deep copies of user and userProfile
            let prevUser = JSON.parse(JSON.stringify(profile));
            // let prev = JSON.parse(JSON.stringify(userProfile));
      
            // Update `following` in the current user
            prevUser.following = res.data.followed
              ? [...prevUser.following, followingId] // Add if followed
              : prevUser.following.filter((item) => item !== followingId); // Remove if unfollowed
      
            // // Update `followers` in the profile being viewed
            // prevProfile.followers = res.data.followed
            //   ? [...prevProfile.followers, prevUser._id] // Add the current user's ID
            //   : prevProfile.followers.filter((item) => item !== prevUser._id); // Remove the current user's ID
      
            // Dispatch the updated states
            dispatch(setAuthUser({ ...prevUser }));
            // dispatch(setUserProfile({ ...prevProfile }));
      
            // Show success message
            toast.success(res.data.message);
          } else {
            logout(res); // Handle logout for unsuccessful response
          }
        } catch (error) {
          toast.error(error.message);
        }
      };

      const isFollowing=(followingId)=>{
       return profile?.following?.includes(followingId)
      }
      
    return (
        <div className='my-10  px-4 py-2 max-h-80 overflow-y-auto scrollable-container'>
            <div className='flex items-center justify-between text-sm'>
                <h1 className='font-semibold text-gray-600'>Suggested for you</h1>
                {/* <span className='font-medium cursor-pointer'>See All</span> */}
            </div>
            {
                suggestedUsers?.map((user) => {
                    if(profile?._id!==user?._id){

                    return (
                        <div key={user._id} className='flex items-center justify-between my-5'>
                            <div className='flex items-center gap-2'>
                                <Link to={`/profile/${user?._id}`}>
                                    <Avatar>
                                        <AvatarImage src={user?.profilePicture} alt="post_image" />
                                        <AvatarFallback>CN</AvatarFallback>
                                    </Avatar>
                                </Link>
                                <div>
                                    <h1 className='font-semibold text-sm'><Link to={`/profile/${user?._id}`}>{user?.username}</Link></h1>
                                    <span className='text-gray-600 text-sm'>{user?.bio || 'Bio here...'}</span>
                                </div>
                            </div>
                            {/* {console.log("profile?.following?.include(user?._id)",profile?.following)} */}
                            <span className={`${isFollowing(user._id)?"text-slate-400":"text-[#3BADF8]"} text-xs font-bold cursor-pointer `} onClick={()=>{handleFollowAndUnfollow(user?._id)}}>{isFollowing(user._id)?"Unfollow":"Follow"}</span>
                        </div>
                    )
                }
                })
            }

        </div>
    )
}

export default SuggestedUsers