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
  const [drawerWord, setDrawerWord] = useState('')
  const socket = getSocket()
  const [socketId, setSocketId] = useState(socket?.id)
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!socket) return
    const handleConnect = () => setSocketId(socket.id)
    socket.on('connect', handleConnect)
    return () => {
      socket.off('connect', handleConnect)
    }
  }, [socket])

  const currentSocketId = socketId || socket?.id
  const drawerId = room?.players?.[room?.currentDrawerIndex]?.id
  const isDrawer = Boolean((currentSocketId && drawerId === currentSocketId) || drawerWord)

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

    const handleRoundStart = (data) => {
      setMessages([])
      if (data?.word) {
        setDrawerWord(data.word)
      } else {
        setDrawerWord('')
      }
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
    if (isDrawer || !input.trim()) return


    socket.emit('send_guess', { roomId: room.roomId, message: input.trim() })
    setInput('')
  }

  const handleEndUpdate = (data) => {
    //countdown implemented by ai as i dont even know bout the setinterval
    clearInterval(intervalRef.current);
    setDrawerWord('')
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
      clearInterval(intervalRef.current)
      setEndRound(false)
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


  const [copied, setCopied] = useState(false)

  const handleCopyCode = () => {
    if (!room?.roomId) return
    navigator.clipboard?.writeText(room.roomId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const currentDrawerId = room?.players?.[room?.currentDrawerIndex]?.id
  const sortedPlayers = [...players].sort((a, b) => (b.score || 0) - (a.score || 0))
  const displayWord = isDrawer
    ? (drawerWord || room?.currentWord || room?.maskedWord)
    : room?.maskedWord
  const letterCount = room?.maskedWord ? room.maskedWord.replace(/ /g, '').length : 0

  return (
    <div className='relative flex min-h-screen flex-col bg-blue-800 text-white font-sans'>
      {(endGamePage || room?.status === 'game_end') && (
        <div className='fixed inset-0 z-50'>
          <EndGame gameEndData={gameEndData || {
            finalScores: (room?.players || [])
              .map(p => ({ id: p.id, name: p.name, score: p.score, avatar: p.avatar }))
              .sort((a, b) => b.score - a.score)
          }} />
        </div>
      )}

      {/* Round End Overlay */}
      {endRound && !endGamePage && room?.status !== 'game_end' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <EndRound RoundUpdate={RoundUpdate} count={count} />
        </div>
      )}

      {/* Navigation Header */}
      <header className='flex flex-wrap items-center justify-between gap-3 border-b-2 border-blue-600 bg-blue-800 px-4 py-4 text-white sm:px-8'>
        <div className='flex items-center gap-3'>
          <span className='rounded-full bg-yellow-400 px-3 py-1 text-sm font-bold text-black shadow'>
            Round {room?.currentRound} / {room?.totalRounds}
          </span>
          <p className='text-3xl font-bold sm:text-4xl'>Sat Draw</p>
        </div>

        <button
          onClick={handleCopyCode}
          className='flex items-center gap-1.5 rounded-full border-2 border-black bg-purple-500 px-4 py-1.5 text-sm font-bold text-white shadow-[2px_2px_0_#171717] transition hover:-translate-y-0.5 active:translate-y-0 active:shadow-none'
          title='Click to copy room code'
        >
          <span>{copied ? '✓' : '📋'}</span>
          <span>Room: {room?.roomId}</span>
          {copied && <span className='text-xs font-bold text-yellow-300'>(Copied!)</span>}
        </button>
      </header>

      {/* Main Game Grid Layout */}
      <main className='mx-auto grid w-full max-w-[1600px] flex-1 gap-4 p-4 lg:grid-cols-[220px_minmax(0,1fr)_340px] sm:p-6'>
        {/* Left Column: Player Scoreboard */}
        <div className='flex flex-col gap-3'>
          {/* Mobile Horizontal Player Strip */}
          <div className='flex gap-2 overflow-x-auto rounded-2xl border-2 border-blue-600 bg-yellow-400 p-2.5 shadow-xl lg:hidden'>
            {sortedPlayers.map((player) => {
              const isDrawingNow = player.id === currentDrawerId
              return (
                <div
                  key={player.id}
                  className={`flex shrink-0 items-center gap-2 rounded-2xl border-2 border-black px-3 py-1.5 shadow ${
                    isDrawingNow ? 'bg-green-400' : 'bg-white'
                  }`}
                >
                  <Image
                    src={player.avatar || '/g.png'}
                    alt={player.name}
                    width={32}
                    height={32}
                    className='rounded-full border border-black bg-white'
                  />
                  <div className='text-xs'>
                    <p className='font-bold text-black'>{player.name}</p>
                    <p className='font-extrabold text-blue-700'>{player.score || 0} pts</p>
                  </div>
                  {isDrawingNow && <span title='Drawing' className='text-xs'>✏️</span>}
                </div>
              )
            })}
          </div>

          {/* Desktop Vertical Leaderboard Card */}
          <div className='hidden flex-col rounded-3xl border-2 border-blue-600 bg-yellow-400 p-4 text-black shadow-xl lg:flex gap-3'>
            <div className='flex items-center justify-between border-b-2 border-black/20 pb-2'>
              <h2 className='text-lg font-bold'>
                Players ({players.length})
              </h2>
              <span className='rounded bg-black px-2 py-0.5 text-xs font-bold text-yellow-400'>
                Live
              </span>
            </div>

            <div className='flex flex-col gap-2.5'>
              {sortedPlayers.map((player, index) => {
                const isDrawingNow = player.id === currentDrawerId
                const isHost = player.id === room?.hostId
                return (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between gap-2.5 rounded-2xl border-2 border-black p-2.5 shadow transition-all ${
                      isDrawingNow
                        ? 'bg-green-400 shadow-[2px_2px_0_#171717]'
                        : 'bg-white hover:-translate-y-0.5'
                    }`}
                  >
                    <div className='flex items-center gap-2 min-w-0'>
                      <span className='w-4 text-center text-xs font-bold text-gray-500'>
                        #{index + 1}
                      </span>

                      <div className='relative shrink-0'>
                        <Image
                          src={player.avatar || '/g.png'}
                          alt={player.name}
                          width={40}
                          height={40}
                          className='rounded-full border-2 border-black bg-white'
                        />
                        {isDrawingNow && (
                          <span className='absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-300 text-[10px] border border-black font-bold'>
                            ✏️
                          </span>
                        )}
                      </div>

                      <div className='min-w-0 flex-1'>
                        <div className='flex items-center gap-1'>
                          <p className='truncate text-sm font-bold text-black'>
                            {player.name}
                          </p>
                          {isHost && (
                            <span title='Room Host' className='text-xs text-yellow-600'>
                              ✦
                            </span>
                          )}
                        </div>
                        <p className='text-xs font-extrabold text-blue-700'>
                          {player.score || 0} pts
                        </p>
                      </div>
                    </div>

                    <div className='flex flex-col items-end gap-1 shrink-0'>
                      {isDrawingNow && (
                        <span className='rounded-full border border-black bg-yellow-300 px-1.5 py-0.5 text-[10px] font-bold text-black shadow-sm'>
                          Drawing
                        </span>
                      )}
                      {player.hasGuessedCorrect && (
                        <span className='rounded-full border border-black bg-green-500 px-1.5 py-0.5 text-[10px] font-bold text-black shadow-sm'>
                          ✓ Guessed
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Center Column: The Interactive Drawing Canvas */}
        <div className='min-w-0 rounded-3xl border-2 border-blue-600 bg-green-500 p-3 shadow-xl sm:p-5 flex flex-col items-center'>
          <Drawcanvas room={room} />
        </div>

        {/* Right Column: Word Reveal & Chat */}
        <div className='flex min-h-[380px] flex-col overflow-hidden rounded-3xl border-2 border-blue-600 bg-purple-500 shadow-xl'>
          {/* Word Reveal / Guess Banner */}
          <div className='flex flex-wrap items-center justify-between gap-2 bg-yellow-400 p-4 border-b-2 border-black text-black'>
            <p className='text-xl font-bold'>
              {isDrawer ? 'Draw this:' : 'Guess this:'}
            </p>
            <p
              className={`rounded-xl border-2 border-black bg-white px-3 py-1 font-bold shadow ${
                isDrawer
                  ? 'text-xl sm:text-2xl text-red-600 uppercase tracking-wide'
                  : 'text-xl sm:text-2xl text-black font-mono tracking-[0.25em]'
              }`}
            >
              {displayWord}
            </p>
          </div>

          {/* Chat & Guesses Card */}
          <div className='m-3 flex flex-1 flex-col justify-center rounded-2xl border-2 border-black bg-blue-800 p-3 shadow-inner text-white'>
            <div className='h-full space-y-1.5 overflow-y-auto p-1'>
              {messages.length === 0 && (
                <p className='text-center text-xs text-blue-200 mt-4'>
                  Guesses appear here. Race to be the first!
                </p>
              )}

              {messages.map((msg) => (
                <div key={msg.id}>
                  {msg.type === 'correct' ? (
                    <p className='rounded-xl border-2 border-black bg-green-500 px-2.5 py-1 font-bold text-black shadow-sm'>
                      🎉 {msg.name} guessed it! (+{msg.points} pts)
                    </p>
                  ) : (
                    <p className='text-blue-100'>
                      <span className='font-bold text-yellow-300'>{msg.name}:</span> {msg.text}
                    </p>
                  )}
                </div>
              ))}
              <div ref={scrollRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className='mt-3 flex h-11 w-full'>
              <input
                placeholder={
                  isDrawer ? "You're drawing!" : 'enter guess'
                }
                disabled={isDrawer}
                className='w-full rounded-l-xl border-2 border-black bg-white px-3 text-black outline-none disabled:bg-gray-200 disabled:cursor-not-allowed'
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                type='submit'
                disabled={isDrawer || !input.trim()}
                className='rounded-r-xl border-2 border-l-0 border-black bg-red-500 px-5 text-xl font-bold text-white shadow-[2px_2px_0_#171717] transition hover:bg-red-600 active:translate-y-0.5 active:shadow-none disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed'
              >
                →
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Canvas
