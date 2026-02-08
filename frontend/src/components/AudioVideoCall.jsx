import React, { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import './AudioVideoCall.css';

const AudioVideoCall = ({ socket, user, receiverId, isInitiator, incomingSignal, onClose }) => {
  const [stream, setStream] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current) myVideo.current.srcObject = currentStream;

        if (isInitiator) {
          const peer = new Peer({ initiator: true, trickle: false, stream: currentStream });

          peer.on("signal", (data) => {
            socket.emit("callUser", {
              userToCall: receiverId,
              signalData: data,
              from: user._id,
              name: user.name,
            });
          });

          peer.on("stream", (userStream) => {
            if (userVideo.current) userVideo.current.srcObject = userStream;
          });

          socket.on("callAccepted", (signal) => {
            setCallAccepted(true);
            peer.signal(signal);
          });

          connectionRef.current = peer;
        } else {
          const peer = new Peer({ initiator: false, trickle: false, stream: currentStream });

          peer.on("signal", (data) => {
            socket.emit("answerCall", { signal: data, to: receiverId });
          });

          peer.on("stream", (userStream) => {
            if (userVideo.current) userVideo.current.srcObject = userStream;
          });

          peer.signal(incomingSignal);
          connectionRef.current = peer;
          setCallAccepted(true);
        }
      });

    return () => {
      socket.off("callAccepted");
      if(connectionRef.current) connectionRef.current.destroy();
    };
  }, []);

  const leaveCall = () => {
    setCallEnded(true);
    socket.emit("endCall", { to: receiverId });
    if(connectionRef.current) connectionRef.current.destroy();
    onClose();
    window.location.reload();
  };

  return (
    <div className="call-overlay">
      <div className="video-container">
        {stream && (
          <video playsInline muted ref={myVideo} autoPlay className="my-video" />
        )}
        
        {callAccepted && !callEnded ? (
          <video playsInline ref={userVideo} autoPlay className="user-video" />
        ) : (
          <div className="calling-text">Connecting...</div>
        )}
      </div>

      <div className="call-controls">
        <button className="btn-end" onClick={leaveCall}>End Call</button>
      </div>
    </div>
  );
};

export default AudioVideoCall;