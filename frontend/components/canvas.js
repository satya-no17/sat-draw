import { getSocket } from '@/lib/socket'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import Drawcanvas from './drawcanvas'

const Canvas = ({ room, }) => {
  const players = room?.players??[]

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    const socket = getSocket()

    const handleNewGuess = (data) => {
      const player = room?.players.find(p => p.id === data.playerId)
      setMessages(prev => [...prev, {
        type: 'guess',
        name: player?.name || 'Unknown',
        text: data.message,
        id: Date.now() + Math.random(), // simple unique key
      }])
    }

    const handleCorrectGuess = (data) => {
      const player = room?.players.find(p => p.id === data.playerId)
      setMessages(prev => [...prev, {
        type: 'correct',
        name: player?.name || 'Unknown',
        points: data.points,
        id: Date.now() + Math.random(),
      }])
    }

    const handleRoundStart = () => {
      setMessages([])
    }

    socket.on('new_guess', handleNewGuess)
    socket.on('correct_guess', handleCorrectGuess)
    socket.on('round_start', handleRoundStart)

    return () => {
      socket.off('new_guess', handleNewGuess)
      socket.off('correct_guess', handleCorrectGuess)
      socket.off('round_start', handleRoundStart)
    }
  }, [players])

  // auto-scroll to newest message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (e) => {
     e.preventDefault();
    if (!input.trim() ) return

    const socket = getSocket()
    socket.emit('send_guess', { roomId: room.roomId, message: input.trim() })
    setInput('')
  }

  return (
    <div className='bg-yellow-400 text-black'>
      {/* header */}
      <div className='w-full flex justify-between items-center'>
        <p>Rounds Left:{room?.totalRounds - room?.currentRound}/{room?.totalRounds}  </p>
        <p className='text-4xl underline'>Sat Draw</p>
        <p>Game Id:{room.roomId}</p>
      </div>
      <div className='bg-white w-full h-[94vh] flex '>
        {/* leaderboard */}
        <div className=' flex flex-col bg-blue-800 items-center p-2'>
          <p className='font-bold text-xl'>Players</p>
          {room.players.map(player => (
            <div key={player.id}>
              <Image src={player.avatar} alt='avt' width={70} height={70} className='rounded-full' />
            </div>
          ))}
        </div>
        {/* canvas */}
        <div className='bg-green-400 w-full '>
          <Drawcanvas room={room}/>
        </div>
        {/* chat */}
        <div className='flex w-[40%] flex-col bg-amber-600'>
          <div className='w-full bg-amber-600 text-2xl flex  gap-1'>
            <p>Guess this :</p>
            <p>{room.maskedWord}</p>
          </div>
          {/* chat */}
          <div className='bg-purple-500 m-2 h-3/5 rounded shadow flex p-1 justify-center flex-col'>
            <div className='h-full p-1'>
              {messages.map(msg => (
                <div key={msg.id}>
                  {msg.type === 'correct' ? (
                    <p className="font-semibold text -green-400">
                      {msg.name} guessed it (+{msg.points})
                    </p>
                  ) : (
                    <p className="text-blue-100">
                      <span className="font-semibold">{msg.name}:</span> {msg.text}
                    </p>
                  )}

                </div>
              ))}
              <div ref={scrollRef} />
            </div>
            <div className=' flex item-center justify-center h-10 w-full '>
              <input placeholder='enter Guess' className='border p-1 rounded-s-md w-[92%]' value={input} onChange={(e)=>setInput(e.target.value)}></input>
              <button onClick={handleSend} className='border active:animate-bounce animate-pulse p-1 rounded-e-full  '>-&gt;&gt;</button>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}

export default Canvas