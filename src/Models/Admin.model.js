import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    name:{
        type:String,
        trim:true
    },
    password:{
        type:String,
        trim:true
    }
})
export const Admin  = mongoose.model('Admin',adminSchema);