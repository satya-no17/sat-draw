'use client'
import Image from 'next/image'
import React from 'react'

const Lobby = ({ room }) => {



    return (
        <div className='bg-blue-800 w-full h-[95vh] flex items-center  gap-4'>
            <div className='w-[50%] p-3 h-9/12 flex flex-col shadow rounded-xl '>
                <div className='border rounded-xl'>
                    {room?.players?.map((player) => (
                        <div key={player.id} className='p-4 shadow border-b rounded-b-xl flex gap-3 justify-between items-center bg-blue-900'>
                            <p> Name: {player.name}</p><Image className='rounded-full' src={player?.avatar} height={40} width={40} alt='avataar' />
                        </div>
                    ))}
                </div>
            </div>
            <div className='w-[50%]  h-9/12 flex flex-col shadow rounded-xl border '>
                    <div className='w-full flex items-center justify-center  h-full flex-col '>
                    <p>Lobby </p>
                  <p className=' text-5xl'> {room?.roomId}</p>
                    </div>
                     <div className="flex flex-col gap-3 border-y border-blue-700 p-5 sm:flex-row sm:gap-4 sm:p-6">
            <button
            //   onClick={handleStart}
            //   disabled={!isHost || !canStart}
              className="flex-1 rounded-xl bg-green-500 py-3 font-semibold text-white transition hover:bg-green-600 active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-500 disabled:opacity-60"
            >
               Start
            </button>

            <button
            //   onClick={handleLeave}
              className="flex-1 rounded-xl bg-red-500 py-3 font-semibold text-white transition hover:bg-red-600 active:scale-95"
            >
              🚪 Leave
            </button>
          </div>
                    <div className='w-full flex justify-center items-center h-full'>
                    this game has {room?.totalRounds} round 
                    </div>
            </div>
        </div>
    )
}

export default Lobby