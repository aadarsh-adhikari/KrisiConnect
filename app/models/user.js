import mongoose from "mongoose";
const userSchema = mongoose.Schema({
    name :{type:String, required:true},
    email: {type:String, unique:true , required:true , lowercase:true},
    password :{type:String , required:true},
    role:{ type: String, enum: ["buyer", "farmer"], default: "buyer" },
    contact: { type: String, required:true },
    createdAt: { type: Date, default: Date.now },
})
const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;