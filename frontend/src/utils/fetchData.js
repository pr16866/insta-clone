import axios from "axios";
// import { useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const fetchData = async (
  method = "get",
  url = "",
  payload = { body: null, queries: null },
  contentType = "application/json"
) => {
    let baseURL = import.meta.env.VITE_BASEURL;
    // console.log(document.cookie.split('; '));
  let accessToken = "";
  // const dispatch = useDispatch();
  // const navigate = useNavigate();

  try {
    const instance = axios.create({
      baseURL: baseURL,
      headers: {
        "Content-Type": contentType,
        Accept: contentType,
      },
      withCredentials:true
    });

    // Add a request interceptor
    instance.interceptors.request.use(
      function (config) {
        if (accessToken) {
          config.headers[Authorization] = "Bearer " + accessToken;
        }
        return config;
      },
      function (error) {
        return Promise.reject(error);
      }
    );

    // Add a response interceptor
    instance.interceptors.response.use(
      function (response) {
        return response;
      },
      function (error) {
       
        if (error?.response?.status === 401) {
          // Handle 401 - Unauthorized
          // console.log(error);
          toast.error(error?.response?.data?.message);
          // window.location.href="/login"
        }
       
        return Promise.reject(error);
      }
    );
 
    const res = await instance[method.toLowerCase()](
      `${url}${
        payload.queries ? "?" + new URLSearchParams(payload.queries) : ""
      }`,
      payload.body?payload.body:{}
    );
    if (res.status === 200 || res.statusText == "ok") {
      return res;
    } else {
      return res;
    }
  } catch (error) {
    console.error("error", error);
    return error?.response;
  }
};
