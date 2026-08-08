import { getSocket } from '@/lib/socket'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import Drawcanvas from './drawcanvas'
import EndRound from './endRound';
import EndGame from './endGame';

const Canvas = ({ room, }) => {
  const players = room?.players ?? []
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const scrollRef = useRef(null)
  const [endRound, setEndRound] = useState(false)
  const [count, setCount] = useState(10)
  const [RoundUpdate, setRoundUpdate] = useState(null)
  const [endGamePage, setEndGamePage] = useState(false)
  const [gameEndData, setGameEndData] = useState(null)
  const intervalRef = useRef(null);
  const socket = getSocket()
  useEffect(() => {

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
    if (!input.trim()) return


    socket.emit('send_guess', { roomId: room.roomId, message: input.trim() })
    setInput('')
  }

  const handleEndUpdate = (data) => {
    //countdown implemented by ai as i dont even know bout the setinterval
    clearInterval(intervalRef.current);
    setRoundUpdate(data)
    setEndRound(true)
    setCount(10)

    let sec = 10

    intervalRef.current = setInterval(() => {
      sec--;

      setCount(sec);

      if (sec <= 0) {
        clearInterval(intervalRef.current);
        setEndRound(false);
      }
    }, 1000);
  }
  useEffect(() => {
    socket.on('round_end', handleEndUpdate)

    return () => {
      socket.off('round_end', handleEndUpdate)
    }
  }, [])

  useEffect(() => {
    const handleGameEndUpdate = (endGameData) => {
      setGameEndData(endGameData)
      console.log('rendered')
      setEndGamePage(true)
    }

    socket.on('game_end', handleGameEndUpdate)

    return () => {

      socket.off('game_end', handleGameEndUpdate)

    }
  }, [])
  useEffect(()=>{
    console.log(gameEndData)
  },[gameEndData])


  return (
    <div className='relative min-h-screen bg-blue-800 text-black'>
      {endGamePage && (
        <div className='fixed inset-0 z-50'>
          <EndGame gameEndData={gameEndData} />
        </div>
      )}

      {/* header */} {endRound && <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50">
        <EndRound RoundUpdate={RoundUpdate} count={count} />
      </div>}

      <div className='flex flex-wrap items-center justify-between gap-3 border-b-2 border-blue-600 bg-blue-800 px-4 py-4 text-white sm:px-8'>
        <p className='rounded-full bg-yellow-400 px-3 py-1 text-sm text-black'>Rounds left: {room?.totalRounds - room?.currentRound}/{room?.totalRounds}</p>
        <p className='text-3xl font-bold sm:text-4xl'>Sat Draw</p>
        <p className='rounded-full bg-purple-500 px-3 py-1 text-sm'>Room: {room.roomId}</p>
      </div>
      <div className='mx-auto grid max-w-[1600px] gap-4 p-4 lg:grid-cols-[112px_minmax(0,1fr)_340px] sm:p-6'>
        {/* leaderboard */}
        <div className='flex flex-row justify-center gap-3 rounded-3xl border-2 border-blue-600 bg-yellow-400 p-3 lg:flex-col lg:items-center'>
          <p className='hidden text-center text-xl lg:block'>Players</p>
          {room.players.map(player => (
            <div key={player.id} className='group relative'>
              <Image src={player.avatar} alt='avt' width={60} height={60} className='rounded-full border-2 border-white bg-white transition group-hover:scale-110' />
              <span className='absolute -bottom-1 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-blue-800 px-2 py-1 text-xs text-white group-hover:block'>{player.name}</span>
            </div>
          ))}
        </div>
        {/* canvas */}
        <div className='min-w-0 rounded-3xl border-2 border-blue-600 bg-green-500 p-3 shadow-xl sm:p-5'>
          <Drawcanvas room={room} />
        </div>
        {/* chat */}
        <div className='flex min-h-[330px] flex-col overflow-hidden rounded-3xl border-2 border-blue-600 bg-purple-500 shadow-xl'>
          <div className='flex flex-wrap gap-2 bg-yellow-400 p-4 text-black'>
            <p className='text-xl'>Guess this:</p>
            <p className='rounded bg-white px-2 text-xl'>{room.currentWord}</p>
          </div>
          {/* chat */}
          <div className='m-3 flex flex-1 flex-col justify-center rounded-2xl bg-blue-800 p-3 shadow-inner'>
            <div className='h-full space-y-1 overflow-y-auto p-1'>
              {messages.map(msg => (
                <div key={msg.id}>
                  {msg.type === 'correct' ? (
                    <p className="rounded bg-green-500 px-2 py-1 font-semibold text-black">
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
            <div className='mt-3 flex h-11 w-full'>
              <input placeholder='enter guess' className='w-full rounded-l-xl border-2 border-black bg-white px-3 text-black outline-none' value={input} onChange={(e) => setInput(e.target.value)}></input>
              <button onClick={handleSend} className='rounded-r-xl border-2 border-l-0 border-black bg-red-500 px-4 text-white transition hover:bg-red-600 active:scale-95'>→</button>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}

export default Canvas
