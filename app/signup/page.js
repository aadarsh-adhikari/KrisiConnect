"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
const SignupPage = () => {
    const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role:""
  });
 
  const [message, setMessage] = useState("");
  const router = useRouter();
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
    const handleSubmit = async(e) =>{
        e.preventDefault()
        const  res= await fetch("/api/auth/signup",{
            method: "POST",
            headers:{"Content-Type": "application/json"},
            body: JSON.stringify(formData)
      })
       const result = await res.json();
      if (!res.ok) {
        setMessage(result.message || "Error in signup");
        return;
      }

      setMessage("Signup successful!");
      router.push("/login")
         
    }
  return (
    <div>
      <h1>Signup Page</h1>
      <form onSubmit={handleSubmit}>
        name <input type="text" name="name" onChange={handleChange} required/>
        <br />
        email <input type="email" name="email"onChange={handleChange} required />
        <br />
        password <input type="password" name="password" onChange={handleChange} required/>
        <br />
        role 
           <select
          name="role"
          onChange={handleChange}
          required
        >
          <option value="">---</option>
          <option value="farmer">Farmer</option>
          <option value="buyer">Buyer</option>
        </select>
        <br />
        <button type="submit">Signup</button>
      </form>
      {message}
    </div>
  );
};

export default SignupPage;
