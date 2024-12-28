import { setMessages } from "@/redux/slice/chatSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import useSocket from "./useSocket";

const useGetRTM = () => {
    const dispatch = useDispatch();
    const socket = useSocket();

    // const { socket } = useSelector(store => store.socketio);
    const { messages } = useSelector(store => store.chat);
    useEffect(() => {
        socket?.on('newMessage', (newMessage) => {
            dispatch(setMessages([...messages, newMessage]));
        })

        return () => {
            socket?.off('newMessage');
        }
    }, [messages, setMessages]);
};
export default useGetRTM;