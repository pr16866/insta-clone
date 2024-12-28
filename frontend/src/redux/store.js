// const { configureStore } = require("@reduxjs/toolkit");

import { configureStore } from"@reduxjs/toolkit"
import reducers from "./reducers"
const store=configureStore(reducers)
export default store;