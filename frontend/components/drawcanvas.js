'use client'
import { getSocket } from '@/lib/socket'
import React, { useEffect, useRef, useState } from 'react'

const Drawcanvas = ({ room }) => {
    const socket = getSocket()
    let drawerId = room.players[room.currentDrawerIndex]?.id
    const lastPointRef = useRef(null)
    const canvasRef = useRef(null)
    const [drawing, setDrawing] = useState(false);
    const [color, setColor] = useState("#000000");

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        canvas.width = 600
        canvas.height = 600

        ctx.lineCap = "round";
        ctx.lineJoin = "round";

    }, []);

    const getPosition = (e) => {
        if (socket.id !== drawerId) return
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    };

    const startDrawing = (e) => {
        if (socket.id !== drawerId) return

        const ctx = canvasRef.current.getContext("2d");
        const { x, y } = getPosition(e);

        ctx.beginPath();
        ctx.moveTo(x, y);

        setDrawing(true);
    };

    const draw = (e) => {
        if (socket.id !== drawerId) return
        if (!drawing) return;

        const ctx = canvasRef.current.getContext("2d");
        const { x, y } = getPosition(e);

        ctx.strokeStyle = color;
        ctx.lineWidth = 5;

        ctx.lineTo(x, y);
        ctx.stroke();
        socket.emit('draw', { roomId: room.roomId, strokeData: { x, y, color } })

    };

    const stopDrawing = () => {
        if (socket.id !== drawerId) return

        const ctx = canvasRef.current.getContext("2d");

        ctx.closePath();
        setDrawing(false);
        socket.emit('draw_end', { roomId: room.roomId })
    };

    const clearCanvas = () => {
        if (socket.id !== drawerId) return

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        socket.emit('clear_canvas', { roomId: room.roomId })
    };

    useEffect(() => {
        const socket = getSocket()

        const handleDraw = ({ strokeData }) => {
            const ctx = canvasRef.current.getContext("2d");
            const { x, y, color: strokeColor } = strokeData;

            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 5;

            if (!lastPointRef.current) {
                ctx.beginPath();
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
                ctx.stroke();
            }
            lastPointRef.current = { x, y };
        }
        const handleDrawEnd = () => {
            lastPointRef.current = null;
        }

        const handleClearCanvas = () => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");

            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        socket.on('draw', handleDraw)
        socket.on('draw_end',handleDrawEnd)
        socket.on('clear_canvas', handleClearCanvas)

        return () => {
            socket.off('draw', handleDraw)
            socket.off('draw_end',handleDrawEnd)
            socket.off('clear_canvas', handleClearCanvas)
        }
    }, [])

    return (
        <div className="flex h-full flex-col items-center gap-3">
            <div className="flex w-full items-center justify-between gap-3 rounded-xl bg-yellow-400 px-4 py-2 text-black">
                <p className="text-sm sm:text-base">Make it unmistakable—your team is watching!</p>
                <span className="rounded bg-white px-2 py-1 text-xs">Live canvas</span>
            </div>
            <canvas id='board'
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className='max-w-full rounded-2xl border-4 border-white bg-white shadow-lg'
            />


            <div className="flex w-full flex-wrap items-center justify-center gap-3 rounded-xl bg-blue-800 p-3 text-white">
                <label className="text-lg">Brush color</label>
                <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                />
            </div>
            <button
                onClick={clearCanvas}
                className="rounded-lg border-2 border-black bg-red-500 px-4 py-2 text-white shadow-[2px_2px_0_#171717] active:translate-y-0.5 active:shadow-none"
            >
                Clear
            </button>

        </div>
    )
}

export default Drawcanvas
