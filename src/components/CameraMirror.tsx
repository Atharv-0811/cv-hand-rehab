'use client';
import { useRef, useEffect } from 'react';

export const CameraMirror = ({ videoRef }: { videoRef: React.RefObject<HTMLVideoElement> }) => {
    useEffect(() => {
        async function setupCamera() {
            if (!navigator.mediaDevices || !videoRef.current) return;
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640, max: 640 },
                    height: { ideal: 480, max: 480 },
                    frameRate: { ideal: 30 } // Don't let high-end webcams push 60fps
                },
                audio: false,
            });
            videoRef.current.srcObject = stream;
        }
        setupCamera();
    }, [videoRef]);

    return (
        <video
            ref={videoRef}
            className="w-full max-w-2xl rounded-lg -scale-x-100 border-2 border-slate-800"
            autoPlay
            muted
            playsInline
        />
    );
};