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


  if (error) return <div>Error: {error}</div>;
  if (!room) return <div>Loading...</div>;

  

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