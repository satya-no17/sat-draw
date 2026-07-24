// 'use client'
// import Image from 'next/image'
// import React from 'react'

// const EndRound = ({RoundUpdate}) => {
  
//     return (
//         <div className='h-3/5 max-w-3/5 flex flex-col rounded-2xl border shadow transition'>
//             <div className='flex flex-col '>
//                 <p className='text-sm'>Your word was...</p>
//                 <p className='text-3xl font-bold'>{RoundUpdate?.word}</p>
//             </div>
//             <div className=''>
//                 {RoundUpdate?.scores.map(p => (
//                     <div key={p.id} className='flex items-center justify-between p-2 border-t'>
//                         <p>
//                             {p.name}
//                         </p>
//                         <Image src={p.avatar} alt={'p.avt'} width={50} height={50} />
//                     </div>
//                 ))}

//             </div>

//         </div>
//     )
// }

// export default EndRound

'use client'

import Image from 'next/image'
import React from 'react'

const EndRound = ({ RoundUpdate ,count}) => {
  return (
    <div className="bg-white rounded-3xl shadow-2xl w-[500px] max-w-[90vw] overflow-hidden animate-popup">
        <div className='flex flex-col items-center justify-center'>
<p className='text-sm opacity-80'>next Round in</p>
<p className='text-5xl'>{count}</p>
        </div>
      {/* Header */}
      <div className="bg-blue-600 text-white text-center py-6">
        <p className="text-lg">Round Over</p>
        <p className="text-sm opacity-80">The word was</p>
        <h1 className="text-4xl font-bold mt-2">
          {RoundUpdate?.word}
        </h1>
      </div>

      {/* Scores */}
      <div className="max-h-80 overflow-y-auto">
        {RoundUpdate?.scores?.map((p, index) => (
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
    </div>
  )
}

export default EndRound