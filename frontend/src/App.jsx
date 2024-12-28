import { useEffect } from 'react'
// import ChatPage from './components/ChatPage'
// import EditProfile from './components/EditProfile'
// import Home from './components/Home'
// import Login from './components/Login'
// import MainLayout from './components/MainLayout'
// import Profile from './components/Profile'
import Signup from './components/Signup'
import Profile from './components/Profile'
import EditProfile from './components/EditProfile'
import "./app.css";
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import MainLayout from './components/MainLayout'
import Login from './components/Login'
import ProtectedRoutes from './components/ProctedRoutes'
import Home from './components/Home'
import ChatPage from './components/ChatPage'
import socket from './hooks/useSocket'
import useSocket from './hooks/useSocket'
import { useDispatch, useSelector } from 'react-redux'
import { setOnlineUsers } from './redux/slice/chatSlice'
import { setAuthUser, setUserProfile } from './redux/slice/authSlice'
// import ChatPage from './components/ChatPage'
// import { io } from "socket.io-client";
// import { useDispatch, useSelector } from 'react-redux'
// import { setSocket } from './redux/socketSlice'
// import { setOnlineUsers } from './redux/chatSlice'
// import { setLikeNotification } from './redux/rtnSlice'
// import ProtectedRoutes from './components/ProtectedRoutes'


const browserRouter = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoutes><MainLayout /></ProtectedRoutes>, // Keep this one
    children: [
      {
        path: '/',
        element: <ProtectedRoutes><Home /></ProtectedRoutes>
      },
      {
        path: '/profile/:id',
        element: <ProtectedRoutes> <Profile /></ProtectedRoutes>
      },
      {
        path: '/account/edit',
        element: <ProtectedRoutes><EditProfile /></ProtectedRoutes>
      },
      {
        path: '/chat',
        element: <ProtectedRoutes><ChatPage /></ProtectedRoutes>
      },
    ]
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/signup',
    element: <Signup />
  },
])


function App() {


  // const { user } = useSelector(store => store.auth);
    const socket = useSocket();
  
  const { userProfile, user } = useSelector(store => store.auth);
    
  
  // const { socket } = useSelector(store => store.socketio);
  // const dispatch = useDispatch();

  // useEffect(() => {
  //   if (user) {
  //     const socketio = io('http://localhost:8000', {
  //       query: {
  //         userId: user?._id
  //       },
  //       transports: ['websocket']
  //     });
  //     dispatch(setSocket(socketio));

  //     // listen all the events
  //     socketio.on('getOnlineUsers', (onlineUsers) => {
  //       dispatch(setOnlineUsers(onlineUsers));
  //     });

  //     socketio.on('notification', (notification) => {
  //       dispatch(setLikeNotification(notification));
  //     });

  //     return () => {
  //       socketio.close();
  //       dispatch(setSocket(null));
  //     }
  //   } else if (socket) {
  //     socket.close();
  //     dispatch(setSocket(null));
  //   }
  // }, [user, dispatch]);



// useEffect(() => {
//   socket.connect()
// socket.on("connect",()=>{
//   console.log("Connected with Socket ID:", socket.id);
// })
//   return () => {
//  socket.close();
//   }
// }, [])
const dispatch = useDispatch();
// console.log("user",user)
useEffect(() => {
  if (socket) {
    socket.on("onlineUsers", (activeUsers) => {
      console.log("activeUsers",Array.isArray(activeUsers)
      ? activeUsers.flat() // Flatten the array
      : [])
      dispatch(setOnlineUsers(Array.isArray(activeUsers)
      ? activeUsers.flat() // Flatten the array
      : []));
    });

    return () => {
      socket.off("onlineUsers");
    };
  }
}, [socket, user?._id]);
// Only re-run when socket changes
// useEffect(() => {
//   let authUser={...user};
//   authUser.following=[];
//   authUser.followers=[];
//   dispatch(setAuthUser({...authUser}))

// }, [])

  return (
    <>
      <RouterProvider router={browserRouter} />
    </>
  )
}

export default App
