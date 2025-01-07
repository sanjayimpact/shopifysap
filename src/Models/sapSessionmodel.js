import mongoose, { mongo } from "mongoose";
const sapsessionSchema = new mongoose.Schema({
    session:{
        type: String,
        trime:true
    }
})
export const SapSession = mongoose.model('SapSession',sapsessionSchema);