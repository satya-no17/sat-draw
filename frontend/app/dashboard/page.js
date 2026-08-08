'use client'

import { getSocket } from '@/lib/socket'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const AVATARS = ['/1.png', '/2.png', '/3.png', '/4.png', '/5.png', '/6.png', '/g.png']

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [mode, setMode] = useState(null)
  const [roomId, setRoomId] = useState('')
  const [rounds, setRounds] = useState(3)
  const [error, setError] = useState('')

  useEffect(() => {
    const raw = localStorage.getItem('sat_Draw_User')
    if (!raw) {
      router.replace('/')
      return
    }
    const loadUser = window.setTimeout(() => setUser(JSON.parse(raw)), 0)
    return () => window.clearTimeout(loadUser)
  }, [router])

  const goToRoom = (socket) => {
    socket.once('room_update', (room) => router.push(`/room/${room.roomId}`))
    socket.once('error', (message) => setError(message?.message || 'Something went wrong. Try again.'))
  }

  const handleCreate = () => {
    if (!user) return
    setError('')
    const socket = getSocket()
    goToRoom(socket)
    socket.emit('create_room', { name: user.name, avatar: user.avatar, totalRounds: Math.max(1, Math.min(10, Number(rounds) || 3)) })
  }

  const handleJoin = () => {
    if (!user || !roomId.trim()) {
      setError('Enter the five-character room code first.')
      return
    }
    setError('')
    const socket = getSocket()
    goToRoom(socket)
    socket.emit('join_room', { name: user.name, avatar: user.avatar, roomId: roomId.trim().toUpperCase() })
  }

  const changeAvatar = (avatar) => {
    const updatedUser = { ...user, avatar }
    setUser(updatedUser)
    localStorage.setItem('sat_Draw_User', JSON.stringify(updatedUser))
  }

  const signOut = () => {
    localStorage.removeItem('sat_Draw_User')
    router.push('/')
  }

  if (!user) return null

  return (
    <main className="min-h-screen bg-blue-800 px-4 py-6 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-blue-600 pb-5">
          <div>
            <p className="text-3xl font-bold sm:text-4xl">Sat-Draw</p>
            <p className="text-blue-200">Your launchpad for a proper scribble showdown.</p>
          </div>
          <button onClick={signOut} className="rounded-full border border-blue-300 px-4 py-2 text-sm transition hover:bg-blue-700">Not {user.name}? Start over</button>
        </header>

        <section className="mt-7 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <div className="rounded-3xl border-2 border-blue-600 bg-yellow-400 p-5 text-black shadow-xl sm:p-7">
            <div className="flex flex-wrap items-center gap-4">
              <Image className="rounded-full border-4 border-white bg-white" src={user.avatar || '/g.png'} height={82} width={82} alt={`${user.name}'s avatar`} />
              <div className="flex-1">
                <p className="text-sm">Welcome back,</p>
                <h1 className="text-4xl sm:text-5xl">{user.name}!</h1>
                <p className="mt-1">Create a fresh room or jump into a friend&apos;s one.</p>
              </div>
              <span className="rotate-2 rounded-lg bg-red-500 px-3 py-2 text-sm text-white shadow">+100 for a correct guess</span>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <button onClick={() => { setMode('create'); setError('') }} className={`rounded-2xl border-2 border-black p-5 text-left shadow transition hover:-translate-y-1 ${mode === 'create' ? 'bg-green-500' : 'bg-white'}`}>
                <span className="text-3xl">✦</span>
                <span className="mt-2 block text-2xl">Create a room</span>
                <span className="block text-sm">Choose the rounds. You&apos;re the host.</span>
              </button>
              <button onClick={() => { setMode('join'); setError('') }} className={`rounded-2xl border-2 border-black p-5 text-left shadow transition hover:-translate-y-1 ${mode === 'join' ? 'bg-purple-500 text-white' : 'bg-white'}`}>
                <span className="text-3xl">⌁</span>
                <span className="mt-2 block text-2xl">Join a room</span>
                <span className="block text-sm">Got a code? Your friends are waiting.</span>
              </button>
            </div>

            {mode === 'create' && <div className="mt-5 rounded-2xl bg-green-500 p-5 text-black">
              <label htmlFor="rounds" className="text-xl">How many rounds?</label>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <input id="rounds" type="number" min="1" max="10" value={rounds} onChange={(event) => setRounds(event.target.value)} className="w-24 rounded-lg border-2 border-black bg-white p-3 text-center text-xl" />
                <span>Each turn gets 90 seconds.</span>
                <button onClick={handleCreate} className="ml-auto rounded-xl border-2 border-black bg-red-500 px-5 py-3 text-white shadow-[3px_3px_0_#171717] active:translate-y-0.5 active:shadow-none">Make my room →</button>
              </div>
            </div>}

            {mode === 'join' && <div className="mt-5 rounded-2xl bg-purple-500 p-5 text-white">
              <label htmlFor="room-code" className="text-xl">Room code</label>
              <div className="mt-3 flex flex-wrap gap-3">
                <input id="room-code" placeholder="ABCDE" value={roomId} onChange={(event) => setRoomId(event.target.value.toUpperCase())} maxLength={5} className="min-w-0 flex-1 rounded-lg border-2 border-black bg-white p-3 text-center text-xl tracking-[0.35em] text-black placeholder:tracking-normal" />
                <button onClick={handleJoin} className="rounded-xl border-2 border-black bg-yellow-400 px-5 py-3 text-black shadow-[3px_3px_0_#171717] active:translate-y-0.5 active:shadow-none">Join the fun →</button>
              </div>
            </div>}

            {error && <p role="alert" className="mt-4 rounded-xl bg-red-500 px-4 py-3 text-white">{error}</p>}
          </div>

          <aside className="rounded-3xl border-2 border-blue-600 bg-blue-700 p-5 shadow-xl sm:p-7">
            <p className="text-xl">Choose your lucky avatar</p>
            <div className="mt-4 grid grid-cols-4 gap-3">
              {AVATARS.map((avatar) => <button key={avatar} onClick={() => changeAvatar(avatar)} className={`rounded-full p-1 transition hover:scale-110 ${user.avatar === avatar ? 'bg-yellow-400 ring-2 ring-white' : 'bg-blue-800'}`} aria-label="Choose avatar"><Image src={avatar} alt="" width={56} height={56} className="rounded-full" /></button>)}
            </div>
            <div className="mt-7 rounded-2xl bg-blue-800 p-5 text-blue-100">
              <p className="text-2xl text-yellow-300">How it works</p>
              <ol className="mt-3 space-y-2 text-sm">
                <li>1. Start a room and share its code.</li>
                <li>2. Take turns drawing from the word bank.</li>
                <li>3. Be the first to guess for 100 points.</li>
              </ol>
            </div>
            <p className="mt-5 text-center text-sm text-blue-200">Tip: dramatic stick figures are completely valid art.</p>
          </aside>
        </section>
      </div>
    </main>
  )
}
