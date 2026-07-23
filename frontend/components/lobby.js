'use client'
import { getSocket } from '@/lib/socket'
import Image from 'next/image'
import React from 'react'
import { useState } from "react";
const Lobby = ({ room }) => {
    const socket = getSocket()
    const colors = [
        "bg-red-500",
        "bg-blue-500",
        "bg-green-500",
        "bg-yellow-500",
        "bg-purple-500",
        "bg-pink-500",
    ];


    const [copied, setCopied] = useState(false);


    const handleStart=()=>{
        socket.emit('start_game',{roomId:room.roomId})
    }
    const handleLeave=()=>{
        socket.emit('leave_room',{roomId:room.roomId})
    }

    return (
        <div className='bg-blue-800 w-full h-[95vh] flex items-center  gap-4 p-4'>
            <div className="w-[50%] p-3 h-9/12 flex flex-col rounded-xl gap-1">
                {room?.players?.map((player, index) => (
                    <div
                        key={player.id}
                        className={`p-4 shadow border-b rounded-xl flex gap-3 justify-between items-center ${colors[index % colors.length]
                            }`}
                    >
                        <p>Name: {player.name}</p>
                        <Image
                            className="rounded-full"
                            src={player.avatar}
                            height={40}
                            width={40}
                            alt="avatar"
                        />
                    </div>
                ))}

            </div>
            <div className="w-[50%] h-9/12 rounded-2xl overflow-hidden shadow-2xl border-2 border-blue-600  text-white">

                {/* Lobby Info */}
                <div
                    className={`flex flex-col items-center justify-center h-1/2 gap-2 bg-blue-600 `}
                    onClick={() => {
                        navigator.clipboard.writeText(room.roomId);
                        setCopied(true);
                        setTimeout(() => {
                            setCopied(false)
                        }, 1500);
                    }}>
                    <p 
                    className="text-lg font-medium uppercase tracking-widest text-blue-100">
                        Lobby
                    </p>

                    <p className="text-6xl font-extrabold tracking-wider text-yellow-300 drop-shadow-lg">
                        {room?.roomId}
                    </p>
                    <p className={`text-2xl transition-all duration-300 ${copied ? "rotate-360 scale-75" : ""
                        }`}
                    >
                        📋{copied?'copied':''}</p>
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-3 border-y border-blue-400 bg-slate-800/70 p-5 sm:flex-row">
                    <button
                        onClick={handleStart}
                        disabled={room?.hostId !== socket.id}
                        className="flex-1 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 py-3 font-bold text-white shadow-lg transition duration-200 hover:scale-105 hover:from-green-600 hover:to-emerald-700 active:scale-95"
                    >
                        {room?.hostId === socket.id ? 'Start' : 'waiting for host to start'}
                    </button>

                    <button
                     onClick={handleLeave}
                        className="flex-1 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 py-3 font-bold text-white shadow-lg transition duration-200 hover:scale-105 hover:from-red-600 hover:to-pink-700 active:scale-95"
                    >
                        Leave game
                    </button>
                </div>

                <div className="flex h-1/4 items-center justify-center bg-purple-700">
                    <p className="text-xl font-semibold">
                        🏆 This game has{" "}
                        <span className="text-yellow-300 font-bold">
                            {room?.totalRounds}
                        </span>{" "}
                        rounds
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Lobby