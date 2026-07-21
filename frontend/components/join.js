import React from 'react'

const Join = ({roomId ,setRoomId,handleJoin,setHandleJoinInput}) => {
  return (
    <div className='flex flex-col gap-3'>
        <input placeholder='enter room id' className='rounded border' value={roomId} onChange={(e)=>setRoomId(e.target.value)}></input>
        <button onClick={handleJoin}>join</button>
        <button onClick={()=>setHandleJoinInput(false)}> back</button>
    </div>
  )
}

export default Join