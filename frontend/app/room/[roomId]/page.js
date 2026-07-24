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
      {(room.status === 'playing' || room.status === 'round_end') && (
        <Canvas
          room={room}
        />
      )}
      {room.status === 'game_end' && (
        <div>Results screen goes here (not built yet)</div>
      )}

    </div>
  )
}

export default Page