import mongoose from "mongoose";
const uri = process.env.MONGODB_URI 
if(!uri){
   throw new Error("no uri found check .env file")
}
export default async function ConnectDB() {
 try{
    await mongoose.connect(uri)
    console.log("successfully connected")
 } 
 catch(e){
    console.log(e)
 }  
}