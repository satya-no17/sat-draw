'use client'

import Lobby from '@/components/lobby'
import { useRoom } from '@/hooks/useRoom'
import { getSocket } from '@/lib/socket'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const Page = ({ }) => {
  const { roomId } = useParams()

  const {room,error} = useRoom(roomId)
  
  return (
    <div>Page {roomId}
    <Lobby room={room}/>
    </div>
  )
}

export default Page