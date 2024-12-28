import { fetchData } from "@/utils/fetchData";
import { toast } from "sonner";


export const getFollowers=async(id)=>{
try {
    let resp=await fetchData("get",`user/${id}/followers-following`);
    return resp
} catch (error) {
    toast.error(error.message);
}
}