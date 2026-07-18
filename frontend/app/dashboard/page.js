'use client'
import Create from '@/components/create'
import Join from '@/components/join'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const Page = () => {
    const [names, setNames] = useState('')
    const [id, setId] = useState()
    const [avatar, setAvatar] = useState()
    const router = useRouter()
    const [roomId, setRoomId] = useState()
    const [handleJoinInput, setHandleJoinInput] = useState(false)
    const [handleCreateInput, setHandleCreateInput] = useState(false)
    const [rounds, setRounds] = useState(3)

    useEffect(() => {
        const raw = localStorage.getItem('user')
        const user = JSON.parse(raw)
        console.log(user)
        if (user) {
            setId(user.id)
            setAvatar(user.avatar)
            setNames(user.name)
        }
        console.log(names, id, avatar)
    }, [])
    const handleJoin = () => {

    }
    const handleCreate = () => {

    }



    return (
        <div className='bg-blue-800 w-full h-screen flex items-center  gap-4 flex-col'>
            <div className=" w-full text-center py-4 bg-blue-800 shadow">
                Sat-Draw
            </div>
            <div className='flex gap-3 justify-center items-center'>
                <Image className='rounded-full' src={avatar || '/g.png'} height={70} width={70} alt='avataar' />  {names}
            </div>
            <div className='flex gap-4'>
                {handleJoinInput && <Join roomId={roomId} setRoomId={setRoomId} handleJoin={handleJoin} />}
                {handleCreateInput && <Create rounds={rounds} setRounds={setRounds} handleCreate={handleCreate}/>}
                {handleCreateInput === false && handleJoinInput === false &&
                    <>
                        <button onClick={() => setHandleJoinInput(true)} className="border p-2 rounded-2xl" >
                            join room
                        </button>

                        <button onClick={() => setHandleCreateInput(true)} className="border p-2 rounded-2xl" >
                            create your room
                        </button>
                    </>
                }
            </div>
        </div >
    )
}

export default Page