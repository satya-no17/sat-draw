'use client'
import { getRandomAvatarIndex } from "@/lib/avatar";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter()
  const [name, setName] = useState('')
  const handleGuest = () => {
    if(!name.trim())return
    
    const guestUser = {
      id: crypto.randomUUID(),
      name: name,
      avatar: getRandomAvatarIndex(),
    }
    localStorage.setItem("user", JSON.stringify(guestUser))
    console.log(guestUser)
    router.push('/dashboard')
  }
  return (
    <div className="bg-blue-800 w-full h-screen flex items-center justify-center gap-4 flex-col">
      <div className="fixed top-0 w-full text-center py-4 bg-blue-800 shadow">
        Sat-Draw
      </div>
      <div>
        <input className="border rounded p-2 m-2" placeholder="enter Name" value={name} onChange={(e)=>(setName(e.target.value))}></input>
        <button onClick={handleGuest} className="border p-2 rounded-2xl" >
          click to play
        </button>
      </div>
    </div>
  );
}
