import React from 'react'

const Create = ({ rounds, setRounds, handleCreate, setHandleCreateInput }) => {
  return (
    <div className='w-full max-w-sm rounded-3xl border-2 border-blue-600 bg-green-500 p-5 text-black shadow-xl'>
      <p className='text-2xl'>Set the showdown</p>
      <input type='number' placeholder='total rounds' className='mt-3 w-full rounded-xl border-2 border-black bg-white p-3 text-center text-xl' value={rounds} onChange={(e) => setRounds(e.target.value)}></input>
      <button onClick={handleCreate} className='mt-3 w-full rounded-xl border-2 border-black bg-red-500 p-3 text-white shadow-[3px_3px_0_#171717] active:translate-y-0.5 active:shadow-none'>Create room →</button>
      <button onClick={() => setHandleCreateInput(false)} className='mt-3 w-full rounded-xl border-2 border-black bg-white p-3'>Back</button>
      <p className='mt-4 rounded-xl bg-yellow-400 p-3 text-sm shadow'>If coming from a game please refresh once to continue before creating.</p>

    </div>
  )
}

export default Create
