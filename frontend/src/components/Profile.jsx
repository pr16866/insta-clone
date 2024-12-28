import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import useGetUserProfile from "@/hooks/useGetUserProfile";
import { json, Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { AtSign, Heart, MessageCircle, SearchIcon } from "lucide-react";
import { toast } from "sonner";
import { fetchData } from "@/utils/fetchData";
import useLogout from "@/hooks/useLogout";
import { setAuthUser, setUserProfile } from "@/redux/slice/authSlice";
import { getFollowers } from "@/service/service";
import { Dialog, DialogContent } from "./ui/dialog";
import { Input } from "./ui/input";
// import { jsxs } from 'react/jsx-runtime';

const Profile = () => {
  const params = useParams();
  const userId = params.id;
  useGetUserProfile(userId);
  const [activeTab, setActiveTab] = useState("posts");

  const { userProfile, user } = useSelector((store) => store.auth);

  const isLoggedInUserProfile = user?._id === userProfile?._id;

  const isFollowing = userProfile?.followers?.includes(user._id);
  const logout = useLogout();
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const displayedPost =
    activeTab === "posts" ? userProfile?.posts : userProfile?.bookmarks;
  const dispatch = useDispatch();

  const handleFollowAndUnfollow = async (followingId) => {
    try {
      let res = await fetchData(
        "post",
        `/user/followOrUnfollow/${followingId}`
      );

      if (res.data.success) {
        // Create deep copies of user and userProfile
        let prevUser = JSON.parse(JSON.stringify(user));
        let prevProfile = JSON.parse(JSON.stringify(userProfile));

        // Update `following` in the current user
        prevUser.following = res.data.followed
          ? [...prevUser.following, followingId] // Add if followed
          : prevUser.following.filter((item) => item !== followingId); // Remove if unfollowed

        // Update `followers` in the profile being viewed
        prevProfile.followers = res.data.followed
          ? [...prevProfile.followers, prevUser._id] // Add the current user's ID
          : prevProfile.followers.filter((item) => item !== prevUser._id); // Remove the current user's ID

        // Dispatch the updated states
        dispatch(setAuthUser({ ...prevUser }));
        dispatch(setUserProfile({ ...prevProfile }));

        // Show success message
        toast.success(res.data.message);
      } else {
        logout(res); // Handle logout for unsuccessful response
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  const [chatUsers, setChatUsers] = useState({ followers: [], following: [] });
  const getFollowingAndFollowers = async () => {
    let resp = await getFollowers(user._id);
    if (resp.data.success) {
      setChatUsers({
        followers: [...resp.data.followers],
        following: [...resp.data.following],
      });
      setFilterData({
        followers: [...resp.data.followers],
        following: [...resp.data.following],
      })
    } else {
      logout(resp);
    }
  };

  useEffect(() => {
    getFollowingAndFollowers();
  }, []);
 
  const [isModalOpen, setIsModalOpen] = useState({ isOpen: false, type: "" });
  const [searchgText, setSearchText] = useState("");
  const [filterData,setFilterData]=useState({following:[],followers:[]});

  useEffect(() => {
       if(searchgText&&isModalOpen.type){
        let followers=chatUsers.followers;
        let following=chatUsers.following;
        if(isModalOpen.type==="followers"){
          followers=followers.filter((item)=>item.username.includes(searchgText))
        }else{
          following=following.filter((item)=>item.username.includes(searchgText))

        }
        setFilterData({following,followers});
       }else{
        setFilterData({followers:chatUsers.followers,following:chatUsers.following})
       }
      }, [searchgText]);

  return (
    <div className="flex max-w-5xl justify-center mx-auto pl-10">
      <div className="flex flex-col gap-20 p-8">
        <div className="grid grid-cols-2">
          <section className="flex items-center justify-center">
            <Avatar className="h-32 w-32">
              <AvatarImage
                src={userProfile?.profilePicture}
                alt="profilephoto"
              />
              <AvatarFallback>
                {userProfile?.username?.substr(0, 2)}
              </AvatarFallback>
            </Avatar>
          </section>
          <section>
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-2">
                <span>{userProfile?.username}</span>
                {isLoggedInUserProfile ? (
                  <>
                    <Link to="/account/edit">
                      <Button
                        variant="secondary"
                        className="hover:bg-gray-200 h-8"
                      >
                        Edit profile
                      </Button>
                    </Link>
                    <Button
                      variant="secondary"
                      className="hover:bg-gray-200 h-8"
                    >
                      View archive
                    </Button>
                    {/* <Button variant='secondary' className='hover:bg-gray-200 h-8'>Ad tools</Button> */}
                  </>
                ) : isFollowing ? (
                  <>
                    <Button
                      variant="secondary"
                      className="h-8"
                      onClick={() => handleFollowAndUnfollow(userId)}
                    >
                      Unfollow
                    </Button>
                    <Button variant="secondary" className="h-8">
                      Message
                    </Button>
                  </>
                ) : (
                  <Button
                    className="bg-[#0095F6] hover:bg-[#3192d2] h-8"
                    onClick={() => handleFollowAndUnfollow(userId)}
                  >
                    Follow
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-4">
                <p>
                  <span className="font-semibold">
                    {userProfile?.posts?.length}{" "}
                  </span>
                  posts
                </p>
                <p
                 onClick={() =>
                  setIsModalOpen({ isOpen: true, type: "followers" })
                }
                className="cursor-pointer"
                >
                  <span
                    className="font-semibold"
                   
                  >
                    {userProfile?.followers?.length}{" "}
                  </span>
                  followers
                </p>
                <p
                 onClick={() =>
                  setIsModalOpen({ isOpen: true, type: "following" })
                }
                className="cursor-pointer"
                 >
                  <span
                    className="font-semibold  "
                    
                  >
                    {userProfile?.following?.length}{" "}
                  </span>
                  following
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-semibold">
                  {userProfile?.bio || "bio here..."}
                </span>
                <Badge className="w-fit" variant="secondary">
                  <AtSign />{" "}
                  <span className="pl-1">{userProfile?.username}</span>{" "}
                </Badge>
              </div>
            </div>
          </section>
        </div>
        <div className="border-t border-t-gray-200">
          <div className="flex items-center justify-center gap-10 text-sm">
            <span
              className={`py-3 cursor-pointer ${
                activeTab === "posts" ? "font-bold" : ""
              }`}
              onClick={() => handleTabChange("posts")}
            >
              POSTS
            </span>
            <span
              className={`py-3 cursor-pointer ${
                activeTab === "saved" ? "font-bold" : ""
              }`}
              onClick={() => handleTabChange("saved")}
            >
              SAVED
            </span>
              
          </div>
          <div className="grid grid-cols-3 gap-1">
            {displayedPost?.map((post) => {
              return (
                <div key={post?._id} className="relative group cursor-pointer">
                  <img
                    src={post.image}
                    alt="postimage"
                    className="rounded-sm my-2 w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center text-white space-x-4">
                      <button className="flex items-center gap-2 hover:text-gray-300">
                        <Heart />
                        <span>{post?.likes.length}</span>
                      </button>
                      <button className="flex items-center gap-2 hover:text-gray-300">
                        <MessageCircle />
                        <span>{post?.comments.length}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Dialog open={isModalOpen.isOpen}>
        <DialogContent
          onInteractOutside={() => {
            setIsModalOpen({ isOpen: false, type: "" });
            setSearchText("");
          }}
        >
          <h1 className="text-base font-bold">{isModalOpen.type==="followers"?"Followers":"Followings"}</h1>
          <div>
            <Input
              type="text"
              placeholder="Search friends..."
              Icon={SearchIcon} // Passing the icon component
              className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 pl-10 py-2 rounded-md focus:ring-0 focus:outline-none hover:bg-slate-200 dark:hover:bg-slate-700"
              onChange={(e) => setSearchText(e.target.value)}
              value={searchgText}
            />
            {(isModalOpen.type === "followers"
              ? filterData.followers
              : filterData.following
            ).map((item, index) => (
              <div
                key={item._id}
                className="flex items-center justify-between my-5 cursor-pointer"
                onClick={() => {
                  setIsModalOpen({type:"",isOpen:false});
                  navigate(`/profile/${item?._id}`);
                }}
              >
                <div className="flex items-center gap-2">
                  <div>
                    <Avatar>
                      <AvatarImage
                        src={item?.profilePicture}
                        alt="post_image"
                      />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <h1 className="font-semibold text-sm">
                      <Link to={`/profile/${item?._id}`}>
                        {item?.username}
                      </Link>
                    </h1>
                    <span className="text-gray-600 text-sm">
                      {item?.bio || "Bio here..."}
                    </span>
                  </div>
                </div>
                {/* <span
                  className={`${
                    isFollowing(item._id)
                      ? "text-slate-400"
                      : "text-[#3BADF8]"
                  } text-xs font-bold cursor-pointer `}
                  onClick={() => {
                    handleFollowAndUnfollow(suggeteduser?._id);
                  }}
                >
                  {isFollowing(suggeteduser?._id) ? "Unfollow" : "Follow"}
                </span> */}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
