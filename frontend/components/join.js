import React from 'react'

const Join = ({roomId ,setRoomId,handleJoin,setHandleJoinInput}) => {
  return (
    <div className='flex flex-col gap-3'>
        <input placeholder='enter room id' className='rounded p-4 border' value={roomId} onChange={(e)=>setRoomId(e.target.value)}></input>
        <button onClick={handleJoin}>join</button>
        <button onClick={()=>setHandleJoinInput(false)}> back</button>
      <p className='border p-3 shadow bg-yellow-400 text-black rounded-4xl'>If coming from a game please refresh once to continue before joining</p>
        
    </div>
  )
}

export default Join