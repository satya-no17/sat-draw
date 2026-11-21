'use client'
import { getSocket } from '@/lib/socket'
import React, { useEffect, useRef, useState } from 'react'

const PALETTE = [
    { color: '#000000', name: 'Black' },
    { color: '#ffffff', name: 'White' },
    { color: '#64748b', name: 'Slate' },
    { color: '#ef4444', name: 'Red' },
    { color: '#f97316', name: 'Orange' },
    { color: '#eab308', name: 'Yellow' },
    { color: '#22c55e', name: 'Green' },
    { color: '#06b6d4', name: 'Cyan' },
    { color: '#3b82f6', name: 'Blue' },
    { color: '#8b5cf6', name: 'Purple' },
    { color: '#ec4899', name: 'Pink' },
    { color: '#78350f', name: 'Brown' },
]

const BRUSH_SIZES = [
    { label: 'Fine', size: 3, dotSize: 6 },
    { label: 'Normal', size: 6, dotSize: 10 },
    { label: 'Bold', size: 12, dotSize: 16 },
    { label: 'Chonky', size: 22, dotSize: 22 },
]

const Drawcanvas = ({ room }) => {
    const socket = getSocket()
    const drawerId = room?.players?.[room?.currentDrawerIndex]?.id
    const drawerName = room?.players?.[room?.currentDrawerIndex]?.name || 'Artist'

    const canvasRef = useRef(null)
    const localLastPointRef = useRef(null)
    const remoteLastPointRef = useRef(null)

    const [drawing, setDrawing] = useState(false)
    const [color, setColor] = useState('#000000')
    const [brushSize, setBrushSize] = useState(6)
    const [tool, setTool] = useState('pen') // 'pen' | 'eraser'

    const isDrawer = socket.id === drawerId

    // Initialize Canvas Context
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')

        canvas.width = 800
        canvas.height = 600

        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
    }, [])

    const getPosition = (e) => {
        const canvas = canvasRef.current
        if (!canvas) return { x: 0, y: 0 }
        const rect = canvas.getBoundingClientRect()
        const clientX = e.touches ? e.touches[0].clientX : e.clientX
        const clientY = e.touches ? e.touches[0].clientY : e.clientY

        const scaleX = rect.width ? canvas.width / rect.width : 1
        const scaleY = rect.height ? canvas.height / rect.height : 1

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY,
        }
    }

    const startDrawing = (e) => {
        if (!isDrawer) return
        if (e.touches && e.cancelable) e.preventDefault()

        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        const pos = getPosition(e)

        const strokeColor = tool === 'eraser' ? '#ffffff' : color
        const strokeSize = tool === 'eraser' ? brushSize * 2.5 : brushSize

        ctx.strokeStyle = strokeColor
        ctx.lineWidth = strokeSize
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        ctx.beginPath()
        ctx.arc(pos.x, pos.y, strokeSize / 2, 0, Math.PI * 2)
        ctx.fillStyle = strokeColor
        ctx.fill()

        localLastPointRef.current = pos
        setDrawing(true)

        socket.emit('draw', {
            roomId: room.roomId,
            strokeData: {
                from: pos,
                to: pos,
                x: pos.x,
                y: pos.y,
                color: strokeColor,
                size: strokeSize,
            },
        })
    }

    const draw = (e) => {
        if (!isDrawer || !drawing) return
        if (e.touches && e.cancelable) e.preventDefault()

        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        const currentPos = getPosition(e)
        const prevPos = localLastPointRef.current || currentPos

        const strokeColor = tool === 'eraser' ? '#ffffff' : color
        const strokeSize = tool === 'eraser' ? brushSize * 2.5 : brushSize

        ctx.strokeStyle = strokeColor
        ctx.lineWidth = strokeSize
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        ctx.beginPath()
        ctx.moveTo(prevPos.x, prevPos.y)
        ctx.lineTo(currentPos.x, currentPos.y)
        ctx.stroke()

        localLastPointRef.current = currentPos

        socket.emit('draw', {
            roomId: room.roomId,
            strokeData: {
                from: prevPos,
                to: currentPos,
                x: currentPos.x,
                y: currentPos.y,
                color: strokeColor,
                size: strokeSize,
            },
        })
    }

    const stopDrawing = () => {
        if (!isDrawer || !drawing) return

        localLastPointRef.current = null
        setDrawing(false)
        socket.emit('draw_end', { roomId: room.roomId })
    }

    const clearCanvas = () => {
        if (!isDrawer) return

        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')

        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        localLastPointRef.current = null
        socket.emit('clear_canvas', { roomId: room.roomId })
    }

    // Socket Event Subscriptions
    useEffect(() => {
        const socket = getSocket()

        const handleDraw = ({ strokeData }) => {
            const canvas = canvasRef.current
            if (!canvas || !strokeData) return
            const ctx = canvas.getContext('2d')

            const strokeColor = strokeData.color || '#000000'
            const strokeSize = strokeData.size || 6

            ctx.strokeStyle = strokeColor
            ctx.lineWidth = strokeSize
            ctx.lineCap = 'round'
            ctx.lineJoin = 'round'

            if (strokeData.from && strokeData.to) {
                ctx.beginPath()
                ctx.moveTo(strokeData.from.x, strokeData.from.y)
                ctx.lineTo(strokeData.to.x, strokeData.to.y)
                ctx.stroke()
            } else {
                if (!remoteLastPointRef.current) {
                    ctx.beginPath()
                    ctx.moveTo(strokeData.x, strokeData.y)
                } else {
                    ctx.lineTo(strokeData.x, strokeData.y)
                    ctx.stroke()
                }
                remoteLastPointRef.current = { x: strokeData.x, y: strokeData.y }
            }
        }

        const handleDrawEnd = () => {
            remoteLastPointRef.current = null
        }

        const handleClearCanvas = () => {
            const canvas = canvasRef.current
            if (!canvas) return
            const ctx = canvas.getContext('2d')
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            remoteLastPointRef.current = null
            localLastPointRef.current = null
        }

        const handleRoundStart = () => {
            handleClearCanvas()
        }

        socket.on('draw', handleDraw)
        socket.on('draw_end', handleDrawEnd)
        socket.on('clear_canvas', handleClearCanvas)
        socket.on('round_start', handleRoundStart)

        return () => {
            socket.off('draw', handleDraw)
            socket.off('draw_end', handleDrawEnd)
            socket.off('clear_canvas', handleClearCanvas)
            socket.off('round_start', handleRoundStart)
        }
    }, [])

    return (
        <div className="flex h-full w-full flex-col items-center gap-3">
            {/* Live Canvas Banner */}
            <div className="flex w-full items-center justify-between gap-2 rounded-xl border-2 border-black bg-yellow-400 px-4 py-2 text-black shadow">
                <p className="text-sm font-bold sm:text-base">
                    {isDrawer
                        ? "Make it unmistakable—your team is watching!"
                        : `${drawerName} is drawing live!`}
                </p>
                <span className="rounded-lg border border-black bg-white px-2 py-0.5 text-xs font-bold shadow-sm">
                    Live canvas
                </span>
            </div>

            {/* The Drawing Canvas Easel */}
            <div className="relative w-full overflow-hidden rounded-2xl border-4 border-white bg-white shadow-xl">
                <canvas
                    id="board"
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className={`aspect-[4/3] w-full touch-none select-none bg-white ${
                        isDrawer ? 'cursor-crosshair' : 'cursor-default'
                    }`}
                />
            </div>

            {/* Drawer Studio Controls */}
            {isDrawer && (
                <div className="flex w-full flex-col gap-3 rounded-2xl border-2 border-black bg-blue-800 p-3.5 text-white shadow-xl">
                    {/* Top Row: Tools, Brush Sizes, Clear */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        {/* Tool Toggle: Pen / Eraser */}
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => setTool('pen')}
                                title="Pen Tool"
                                className={`flex items-center gap-1 rounded-xl border-2 border-black px-3 py-1.5 text-xs font-bold shadow transition active:translate-y-0.5 ${
                                    tool === 'pen'
                                        ? 'bg-yellow-400 text-black shadow-[2px_2px_0_#171717]'
                                        : 'bg-blue-700 text-white hover:bg-blue-600'
                                }`}
                            >
                                <span>✏️</span> Pen
                            </button>
                            <button
                                type="button"
                                onClick={() => setTool('eraser')}
                                title="Eraser Tool"
                                className={`flex items-center gap-1 rounded-xl border-2 border-black px-3 py-1.5 text-xs font-bold shadow transition active:translate-y-0.5 ${
                                    tool === 'eraser'
                                        ? 'bg-yellow-400 text-black shadow-[2px_2px_0_#171717]'
                                        : 'bg-blue-700 text-white hover:bg-blue-600'
                                }`}
                            >
                                <span>🧼</span> Eraser
                            </button>
                        </div>

                        {/* Brush Sizes */}
                        <div className="flex items-center gap-1.5">
                            <span className="hidden text-xs font-bold text-yellow-300 sm:inline">Size:</span>
                            {BRUSH_SIZES.map((b) => (
                                <button
                                    key={b.size}
                                    type="button"
                                    onClick={() => setBrushSize(b.size)}
                                    title={`${b.label} (${b.size}px)`}
                                    className={`flex h-8 w-8 items-center justify-center rounded-xl border-2 border-black transition active:scale-95 ${
                                        brushSize === b.size
                                            ? 'bg-yellow-400 text-black shadow-[2px_2px_0_#171717]'
                                            : 'bg-blue-700 text-white hover:bg-blue-600'
                                    }`}
                                >
                                    <span
                                        className="rounded-full bg-current"
                                        style={{ width: `${b.dotSize}px`, height: `${b.dotSize}px` }}
                                    />
                                </button>
                            ))}
                        </div>

                        {/* Clear Canvas Button */}
                        <button
                            type="button"
                            onClick={clearCanvas}
                            className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-red-500 px-4 py-1.5 text-xs font-bold text-white shadow-[2px_2px_0_#171717] transition hover:bg-red-600 active:translate-y-0.5 active:shadow-none"
                        >
                            <span>🗑️</span> Clear
                        </button>
                    </div>

                    {/* Bottom Row: Color Swatches & Custom Picker */}
                    <div className="flex flex-wrap items-center justify-center gap-2 border-t-2 border-blue-700 pt-3 sm:justify-start">
                        <span className="hidden text-xs font-bold text-yellow-300 sm:inline">Colors:</span>
                        {PALETTE.map((p) => {
                            const isSelected = tool === 'pen' && color.toLowerCase() === p.color.toLowerCase()
                            return (
                                <button
                                    key={p.color}
                                    type="button"
                                    onClick={() => {
                                        setColor(p.color)
                                        setTool('pen')
                                    }}
                                    title={p.name}
                                    style={{ backgroundColor: p.color }}
                                    className={`h-7 w-7 rounded-full border-2 border-black transition-transform hover:scale-115 active:scale-95 ${
                                        isSelected
                                            ? 'scale-120 ring-2 ring-yellow-400 ring-offset-2 ring-offset-blue-800'
                                            : ''
                                    }`}
                                />
                            )
                        })}

                        {/* Custom Color Picker */}
                        <label
                            title="Custom Color"
                            className="relative flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-black bg-gradient-to-tr from-pink-500 via-yellow-400 to-cyan-400 shadow transition hover:scale-115 active:scale-95"
                        >
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => {
                                    setColor(e.target.value)
                                    setTool('pen')
                                }}
                                className="absolute inset-0 cursor-pointer opacity-0"
                            />
                            <span className="text-[10px] font-black text-black">🎨</span>
                        </label>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Drawcanvas
