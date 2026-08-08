'use client'

import Canvas from '@/components/canvas'
import EndRound from '@/components/endRound'
import Lobby from '@/components/lobby'
import { useRoom } from '@/hooks/useRoom'
import { getSocket } from '@/lib/socket'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const Page = ({ }) => {
  const { roomId } = useParams()
  const { room, error } = useRoom(roomId)


  if (error) return <div className="flex min-h-screen items-center justify-center bg-blue-800 p-4 text-white"><div className="rounded-3xl border-2 border-blue-600 bg-yellow-400 p-8 text-center text-black shadow-xl"><p className="text-3xl">Oops—this room vanished!</p><p className="mt-3">{error}</p></div></div>;
  if (!room) return <div className="flex min-h-screen items-center justify-center bg-blue-800 text-white"><p className="rotate-[-2deg] rounded-xl bg-yellow-400 px-5 py-3 text-2xl text-black shadow">Sharpening the crayons…</p></div>;

  

  return (
    <div>
      {room.status === 'lobby' && <Lobby room={room} />}
      {(room.status === 'playing' || room.status === 'round_end' || room.status === 'game_end') && (
        <Canvas
          room={room}
        />
      )}

    </div>
  )
}

export default Page
