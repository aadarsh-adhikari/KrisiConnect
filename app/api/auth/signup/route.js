import ConnectDB from "@/lib/connect";
import User from "@/app/models/user";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
export async function POST(req) {
    try{
        const {name, email, password, role} = await req.json()
         if(!name || !email || !password || !role){
            return NextResponse.json({message:"all field must be filled"}, {status:400})
        }
        await ConnectDB();
        const existingUser = await User.findOne({email})
        if(existingUser){
            return NextResponse.json({message:"email already exists"}, {status:500})
        }
        const hashedPassword = await bcrypt.hash(password,10)
        const newUser = new User({name, email, password:hashedPassword , role})
        await newUser.save();
        return NextResponse.json({message:"user created sucessfully"}, {status:201})
    }
   catch(e){
     return NextResponse.json({message:"server error"})
   }
}