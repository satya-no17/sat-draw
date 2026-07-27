'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'

const EndGame = ({ gameEndData }) => {
const router = useRouter()
  return (
    <div className='flex h-screen w-screen items-center justify-center bg-black/70 px-4'>
      <div className='w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl'>
        <p className='text-sm font-semibold uppercase tracking-[0.3em] text-gray-500'>Game over</p>
        <h2 className='mt-3 text-3xl font-bold text-gray-900'>The match has ended</h2>
        <div className='mt-4 text-lg text-gray-700'>
           {gameEndData?.finalScores?.map((p, index) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between px-6 py-4 border-b last:border-none"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg">
                          #{index + 1}
                        </span>
          
                        <Image
                          src={p.avatar}
                          alt={p.name}
                          width={45}
                          height={45}
                          className="rounded-full"
                        />
          
                        <span className="font-semibold">{p.name}</span>
                      </div>
          
                      <span className="font-bold text-green-600">
                        {p.score} pts
                      </span>
                    </div>
                  ))}
        </div>
        <p className='mt-2 text-sm text-gray-500' onClick={()=>{router.push('/dashboard');router.refresh()}}>Click to go Home</p>
      </div>
    </div>
  )
}

export default EndGame