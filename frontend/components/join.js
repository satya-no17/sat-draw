import React from 'react'

const Join = ({roomId ,setRoomId,handleJoin,setHandleJoinInput}) => {
  return (
    <div className='w-full max-w-sm rounded-3xl border-2 border-blue-600 bg-purple-500 p-5 text-white shadow-xl'>
        <p className='text-2xl'>Find your crew</p>
        <input placeholder='enter room id' className='mt-3 w-full rounded-xl border-2 border-black bg-white p-4 text-center text-xl tracking-[0.25em] text-black' value={roomId} onChange={(e)=>setRoomId(e.target.value)}></input>
        <button onClick={handleJoin} className='mt-3 w-full rounded-xl border-2 border-black bg-yellow-400 p-3 text-black shadow-[3px_3px_0_#171717] active:translate-y-0.5 active:shadow-none'>Join room →</button>
        <button onClick={()=>setHandleJoinInput(false)} className='mt-3 w-full rounded-xl border-2 border-black bg-white p-3 text-black'>Back</button>
      <p className='mt-4 rounded-xl bg-blue-800 p-3 text-sm shadow'>If coming from a game please refresh once to continue before joining.</p>
        
    </div>
  )
}

export default Join
