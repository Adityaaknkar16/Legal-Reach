import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import Peer from "simple-peer";


const socket = io("http://localhost:3000");

const VoiceCall = () => {
  const [me, setMe] = useState("");
  const [stream, setStream] = useState(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState("");
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("");

  const myAudio = useRef();
  const userAudio = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: false, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myAudio.current) {
            myAudio.current.srcObject = currentStream;
        }
      });

    socket.on("connect", () => {
        setMe(socket.id); 
    });

    socket.on("call-user", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data.signal);
    });
  }, []);

  const callUser = (id) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });

    peer.on("signal", (data) => {
      socket.emit("call-user", {
        userToCall: id,
        signalData: data,
        from: me,
        name: "Test User",
      });
    });

    peer.on("stream", (remoteStream) => {
      if (userAudio.current) {
        userAudio.current.srcObject = remoteStream;
      }
    });

    socket.on("call-accepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });

    peer.on("signal", (data) => {
      socket.emit("answer-call", { signal: data, to: caller });
    });

    peer.on("stream", (remoteStream) => {
      if (userAudio.current) {
        userAudio.current.srcObject = remoteStream;
      }
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    if (connectionRef.current) {
        connectionRef.current.destroy();
    }
    window.location.reload();
  };

  return (
    <div style={{ padding: "20px", border: "1px solid #ddd", margin: "20px", borderRadius: "8px" }}>
      <h3>📞 Voice Call Console</h3>
      
      <div style={{ marginBottom: "20px" }}>
        <strong>My Call ID:</strong> {me}
        <p style={{fontSize: "12px", color: "gray"}}>Copy this ID and open a new tab to test calling yourself.</p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Paste ID to call"
          value={idToCall}
          onChange={(e) => setIdToCall(e.target.value)}
          style={{ padding: "10px", width: "200px" }}
        />
        {callAccepted && !callEnded ? (
          <button onClick={leaveCall} style={{ background: "red", color: "white", padding: "10px", marginLeft: "10px" }}>
            End Call
          </button>
        ) : (
          <button onClick={() => callUser(idToCall)} style={{ padding: "10px", marginLeft: "10px", background: "#007bff", color: "white" }}>
            Call
          </button>
        )}
      </div>

      {receivingCall && !callAccepted ? (
        <div style={{ background: "#e3f2fd", padding: "10px", marginBottom: "20px" }}>
          <p>{name || "Someone"} is calling...</p>
          <button onClick={answerCall} style={{ background: "green", color: "white", padding: "10px" }}>
            Answer
          </button>
        </div>
      ) : null}

      <div>
        {/* Hidden Audio Players */}
        {stream && <audio playsInline muted ref={myAudio} autoPlay />}
        {callAccepted && !callEnded && (
          <audio playsInline ref={userAudio} autoPlay />
        )}
      </div>
    </div>
  );
};

export default VoiceCall;