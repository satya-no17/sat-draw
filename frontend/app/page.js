'use client'

import { getRandomAvatarIndex } from '@/lib/avatar'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Home() {
  const router = useRouter()
  const [name, setName] = useState('')

  useEffect(() => {
    if (localStorage.getItem('sat_Draw_User')) router.replace('/dashboard')
  }, [router])

  const handleGuest = (event) => {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return

    localStorage.setItem('sat_Draw_User', JSON.stringify({
      id: crypto.randomUUID(),
      name: trimmedName,
      avatar: getRandomAvatarIndex(),
    }))
    router.push('/dashboard')
  }

  return (
    <main className="min-h-screen overflow-hidden bg-blue-800 px-4 py-6 text-white sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col">
        <header className="flex items-center justify-between border-b-2 border-blue-600 pb-4">
          <p className="text-2xl font-bold tracking-wide sm:text-3xl">Sat-Draw</p>
          <p className="rounded-full bg-yellow-400 px-3 py-1 text-xs text-black shadow">multiplayer doodle party</p>
        </header>

        <section className="flex flex-1 flex-col items-center justify-center gap-8 py-10 lg:flex-row lg:gap-16">
          <div className="max-w-xl text-center lg:text-left">
            <p className="mb-3 inline-block -rotate-2 rounded bg-red-500 px-3 py-1 text-sm text-white shadow">Draw fast. Guess faster.</p>
            <h1 className="text-5xl leading-none sm:text-7xl">Turn your scribbles into a win.</h1>
            <p className="mt-5 max-w-lg text-lg text-blue-100 sm:text-xl">Make a room, share a five-character code, and race your friends to guess hundreds of silly words before the 90-second timer runs out.</p>

            <div className="mt-7 grid grid-cols-3 gap-2 text-center text-sm text-black sm:max-w-md">
              <div className="rotate-[-2deg] rounded-xl bg-yellow-400 p-3 shadow"><b>5-char</b><br />room codes</div>
              <div className="rounded-xl bg-green-500 p-3 shadow"><b>90 sec</b><br />per turn</div>
              <div className="rotate-[2deg] rounded-xl bg-purple-500 p-3 text-white shadow"><b>600+</b><br />things to draw</div>
            </div>
          </div>

          <div className="w-full max-w-md rotate-1 rounded-3xl border-4 border-blue-600 bg-yellow-400 p-5 text-black shadow-2xl sm:p-7">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm">Ready, artist?</p>
                <h2 className="text-3xl">Pick a player name</h2>
              </div>
              <div className="flex -space-x-3">
                {['/1.png', '/2.png', '/3.png'].map((avatar) => <Image key={avatar} src={avatar} alt="Sat-Draw avatar" width={42} height={42} className="rounded-full border-2 border-yellow-400 bg-white" />)}
              </div>
            </div>

            <form onSubmit={handleGuest} className="space-y-3">
              <label htmlFor="player-name" className="text-sm">Your drawing name</label>
              <input id="player-name" className="w-full rounded-xl border-2 border-black bg-white px-4 py-3 text-lg outline-none placeholder:text-gray-400 focus:ring-4 focus:ring-red-500/50" placeholder="e.g. Picasso Potato" value={name} onChange={(event) => setName(event.target.value)} maxLength={20} autoFocus />
              <button type="submit" className="w-full rounded-xl border-2 border-black bg-red-500 px-4 py-3 text-xl text-white shadow-[4px_4px_0_#171717] transition hover:-translate-y-0.5 active:translate-y-0 active:shadow-none">Enter the doodle zone →</button>
            </form>
            <p className="mt-5 text-center text-sm">No account, no setup—just bring a name and your wildest sketches.</p>
          </div>
        </section>

        <footer className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm text-blue-200 sm:justify-between">
          <span>One player draws. Everyone else guesses.</span>
          <span>First correct guess earns 100 points.</span>
        </footer>
      </div>
    </main>
  )
}
