import React from 'react'

const Footer = () => {
  return (
    <footer className="mt-auto border-t-2 border-blue-600 bg-blue-800 px-4 py-4 text-sm text-blue-200 sm:px-8">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-2 text-center sm:grid-cols-3 sm:text-left">
        <p>✦ Draw • Guess • Win</p>
        <p className="order-first text-center text-base text-white sm:order-none">
          Created by{' '}
          <a
            href="https://github.com/satya-no17"
            target="_blank"
            rel="noreferrer"
            className="rounded bg-yellow-400 px-2 py-1 font-bold text-black transition hover:bg-green-500"
          >
            Satya
          </a>
        </p>
        <p className="sm:text-right">Keep your crayons ready ✎</p>
      </div>
    </footer>
  )
}

export default Footer
