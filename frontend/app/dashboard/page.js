'use client'
import Create from '@/components/create'
import Join from '@/components/join'
import { getSocket } from '@/lib/socket'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const Page = () => {
    const [names, setNames] = useState('')
    const [id, setId] = useState()
    const [avatar, setAvatar] = useState()
    const router = useRouter()
    const [roomId, setRoomId] = useState('')
    const [handleJoinInput, setHandleJoinInput] = useState(false)
    const [handleCreateInput, setHandleCreateInput] = useState(false)
    const [rounds, setRounds] = useState(3)



    useEffect(() => {

        const raw = localStorage.getItem('sat_Draw_User')
        if (!raw) {
            router.push('/')
            return
        }
        const user = JSON.parse(raw)
        console.log(user)
        if (user) {
            setId(user.id)
            setAvatar(user.avatar)
            setNames(user.name)
        }
    }, [])
    const handleJoin = () => {
        const socket = getSocket()
        socket.emit('join_room', { name: names, avatar,roomId })
        socket.once('room_update', (room) => {console.log(room);router.push(`/room/${room.roomId}`)});
    }
    const handleCreate = () => {
        const socket = getSocket()
        socket.emit('create_room', { name: names, avatar, totalRounds:rounds })
        socket.once('room_update', (room) =>{ console.log(room);router.push(`/room/${room.roomId}`)});
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
                {handleJoinInput && <Join roomId={roomId} setRoomId={setRoomId} handleJoin={handleJoin} setHandleJoinInput={setHandleJoinInput} />}
                {handleCreateInput && <Create rounds={rounds} setRounds={setRounds} handleCreate={handleCreate} setHandleCreateInput={setHandleCreateInput} />}
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