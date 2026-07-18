import React from 'react'

const Join = ({roomId ,setRoomId,handleJoin}) => {
  return (
    <div>
        <input placeholder='enter room id' className='rounded border' value={roomId} onChange={(e)=>setRoomId(e.target.value)}></input>
        <button onClick={handleJoin}>join</button>
    </div>
  )
}

export default Join