import React from 'react'

const Create = ({rounds ,setRounds ,handleCreate}) => {
  return (
    <div className='flex flex-col gap-3'>
        <input  type='number' placeholder='enter room id' className='rounded border p-3' value={rounds} onChange={(e)=>setRounds(e.target.value)}></input>
        <button onClick={handleCreate}>Create</button>
    </div>
  )
}

export default Create