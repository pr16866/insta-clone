
import { combineReducers } from "@reduxjs/toolkit";
import authSlice from '../slice/authSlice';
import postSlice from '../slice/postSlice';
import socketSlice from '../slice/socketSlice';
import chatSlice from '../slice/chatSlice';
import rtnSlice from '../slice/rtnSlice'
import storage from 'redux-persist/lib/storage'
import { 
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist'

const persistConfig = {
    key: 'root',
    version: 1,
    storage,
}


const rootReducer = combineReducers({
    auth: authSlice,
    post:postSlice,
    socketio:socketSlice,
    chat:chatSlice,
    realTimeNotification:rtnSlice
});
const persistedReducer = persistReducer(persistConfig, rootReducer)
const reducers = {
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
};
export default reducers;