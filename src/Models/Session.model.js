
import mongoose from "mongoose";
const sessionSchema = new mongoose.Schema({
    id:{
        type:String,
        trim:true
    
        
    },
    state:{
        type:String,
        trim:true
    },
    
shop:{
    type:String,
    trim:true
},

isOnline:{
    type:Boolean,
    enum:[true,false],
    default:false
},
scope:
    {
        type:String,
        trim:true
    }
,

accessToken:{
    type:String,
    trim:true
}
})

export const Session = mongoose.model('Session', sessionSchema);