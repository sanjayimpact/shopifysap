import mongoose from "mongoose";

export const connect =async()=>{

    try{
        await mongoose.connect("mongodb+srv://avatar:avatar@cluster0.nce8nas.mongodb.net/Shopifysap?retryWrites=true&w=majority&appName=Cluster0")
        console.log("successfully connected")
       
    }catch(err){
        console.log(err);
    }
}
connect();