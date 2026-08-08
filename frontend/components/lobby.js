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


    const handleStart = () => {
        socket.emit('start_game', { roomId: room.roomId })
    }
    const handleLeave = () => {
        socket.emit('leave_room', { roomId: room.roomId })
    }

    return (
        <>
            <div className="flex items-center justify-between border-b-2 border-blue-600 bg-blue-800 px-4 py-4 text-white sm:px-8">
                <p className="text-3xl font-bold sm:text-4xl">Sat Draw</p>
                <p className="rotate-1 rounded-full bg-yellow-400 px-3 py-1 text-xs text-black shadow">lobby doodle party</p>
            </div>
            <div className='min-h-[calc(100vh-76px)] bg-blue-800 p-4 sm:p-8'>
                <div className='mx-auto flex max-w-6xl flex-col-reverse items-stretch gap-6 lg:flex-row'>
                    <div className="flex min-w-0 flex-1 flex-col gap-3 rounded-3xl border-2 border-blue-600 bg-yellow-400 p-5 text-black shadow-xl">
                        <p className='w-full text-center text-3xl'>Your drawing crew</p>
                        <p className='text-center text-sm'>Invite friends with the room code—everyone gets a turn at the canvas.</p>
                        {room?.players?.map((player, index) => (
                            <div
                                key={player.id}
                                className={`flex items-center justify-between gap-3 rounded-2xl border-2 border-black p-4 shadow ${colors[index % colors.length]
                                    }`}
                            >
                                <p className="text-lg">{player.name}</p>
                                <Image
                                    className="rounded-full border-2 border-white"
                                    src={player.avatar}
                                    height={40}
                                    width={40}
                                    alt="avatar"
                                />
                                {player.id === room.hostId && (
                                    <span className="rounded-full bg-yellow-300 px-2 py-1 text-xs font-bold text-black">host ✦</span>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="min-w-0 flex-1 overflow-hidden rounded-3xl border-2 border-blue-600 text-white shadow-xl">
                        <div
                            className="flex min-h-64 cursor-pointer flex-col items-center justify-center gap-2 bg-yellow-400 p-6 text-black"
                            onClick={() => {
                                navigator.clipboard.writeText(room.roomId);
                                setCopied(true);
                                setTimeout(() => {
                                    setCopied(false)
                                }, 1500);
                            }}>
                            <p className="text-lg font-medium uppercase tracking-widest">Your room code</p>
                            <p className="text-6xl font-extrabold tracking-[0.2em] text-red-600 drop-shadow-lg sm:text-7xl">{room?.roomId}</p>
                            <p className={`text-2xl transition-all duration-300 ${copied ? "rotate-360 scale-75" : ""}`}>📋{copied ? ' copied!' : ''}</p>
                            <p className='text-xs'>Click the code to copy and send it to your crew.</p>
                        </div>
                        <div className="flex flex-col gap-3 border-y-2 border-blue-600 bg-blue-700 p-5 sm:flex-row">
                            <button
                                onClick={handleStart}
                                disabled={room?.hostId !== socket.id}
                                className="flex-1 rounded-xl border-2 border-black bg-green-500 p-4 text-lg text-black shadow-[3px_3px_0_#171717] transition hover:-translate-y-0.5 active:translate-y-0 active:shadow-none disabled:cursor-not-allowed disabled:bg-blue-300 disabled:shadow-none"
                            >
                                {room?.hostId === socket.id ? 'Start' : 'waiting for host to start'}
                            </button>
                            <button
                                onClick={handleLeave}
                                className="flex-1 rounded-xl border-2 border-black bg-red-500 py-3 text-lg font-bold text-white shadow-[3px_3px_0_#171717] transition hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
                            >
                                Leave game
                            </button>
                        </div>
                        <div className="flex min-h-28 items-center justify-center bg-purple-500 p-5 text-center">
                            <p className="text-xl">This game has <span className="rounded bg-yellow-400 px-2 py-1 font-bold text-black">{room?.totalRounds}</span> rounds</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Lobby
