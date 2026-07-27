import React from 'react'

const Create = ({ rounds, setRounds, handleCreate, setHandleCreateInput }) => {
  return (
    <div className='flex flex-col gap-3'>
      <input type='number' placeholder='total rounds' className='rounded border p-3' value={rounds} onChange={(e) => setRounds(e.target.value)}></input>
      <button onClick={handleCreate}>Create</button>
      <button onClick={() => setHandleCreateInput(false)}>cancel</button>
      <p className='border p-3 shadow bg-yellow-400 text-black rounded-4xl'>If coming from a game please refresh once to continue before creating</p>

    </div>
  )
}

export default Create