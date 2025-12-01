import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/CallPage.css';

export default function CallPage() {
    const { chatName } = useParams<{ chatName: string }>();
    const navigate = useNavigate();
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [inCall, setInCall] = useState(false);

    useEffect(() => {
        // Auto-request media when entering page
        const startMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
                setInCall(true);
            } catch (e) {
                setError('Không thể truy cập camera/micro.');
            }
        };
        startMedia();
        return () => {
            // Cleanup local stream
            const tracks = (localVideoRef.current?.srcObject as MediaStream | undefined)?.getTracks();
            tracks?.forEach(t => t.stop());
        };
    }, []);

    const handleHangUp = () => {
        const tracks = (localVideoRef.current?.srcObject as MediaStream | undefined)?.getTracks();
        tracks?.forEach(t => t.stop());
        setInCall(false);
        navigate('/chat');
    };

    // Placeholder for remote peer logic
    // TODO: Implement signaling (WebSocket) + RTCPeerConnection exchange
    // For now we just show a placeholder panel

    return (
        <div className="call-page">
            <div className="call-header">
                <h2>Cuộc gọi với {chatName}</h2>
                <button className="end-btn" onClick={handleHangUp} aria-label="Kết thúc cuộc gọi">✕</button>
            </div>

            {error && <div className="call-error">{error}</div>}

            <div className="call-grid">
                <div className="video-wrapper local">
                    <video ref={localVideoRef} autoPlay playsInline muted className="video" />
                    <div className="label">Bạn</div>
                </div>
                <div className="video-wrapper remote">
                    {inCall ? (
                        <video ref={remoteVideoRef} autoPlay playsInline className="video placeholder" />
                    ) : (
                        <div className="video placeholder">Đang chờ kết nối...</div>
                    )}
                    <div className="label">Đối tác</div>
                </div>
            </div>

            <div className="call-controls">
                <button className="control-btn" aria-label="Tắt/Mở micro">🎙️</button>
                <button className="control-btn" aria-label="Tắt/Mở camera">🎥</button>
                <button className="control-btn danger" onClick={handleHangUp} aria-label="Kết thúc">Kết thúc</button>
            </div>

            <div className="call-hints">
                <p>Đang trong chế độ demo. Cần triển khai signaling WebSocket để kết nối thực.</p>
            </div>
        </div>
    );
}
