import React, { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

const VoiceCall = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const zpRef = useRef(null);
  
  const roomId = searchParams.get('roomId');
  const userName = searchParams.get('userName');
  const receiverId = searchParams.get('receiverId');
  const callType = searchParams.get('callType') || 'video';

  useEffect(() => {
    const initCall = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!roomId) {
        navigate('/');
        return;
      }

      if (!user) {
        navigate('/login');
        return;
      }

      // Log call start to database
      if (receiverId && roomId) {
        const token = localStorage.getItem('token');
        if (token) {
          axios.post('http://localhost:3000/api/calls/log-start', {
            receiverId,
            roomId,
            callType
          }, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(err => console.error("Call start log error:", err));
        }
      }

      try {
        const appId = Number(import.meta.env.VITE_ZEGO_APP_ID);
        const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET;

        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appId,
          serverSecret,
          roomId,
          user._id,
          userName || user.name
        );

        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zpRef.current = zp;

        zp.joinRoom({
          container: containerRef.current,
          scenario: {
            mode: callType === 'video' 
              ? ZegoUIKitPrebuilt.OneONoneCall 
              : ZegoUIKitPrebuilt.OneONoneCall,
          },
          turnOnCameraWhenJoining: callType === 'video',
          turnOnMicrophoneWhenJoining: true,
          showScreenSharingButton: false,
          showPreJoinView: false,
          onLeaveRoom: () => {
            const token = localStorage.getItem('token');
            if (token && roomId) {
              axios.post('http://localhost:3000/api/calls/log-end', { roomId, status: 'completed' }, {
                headers: { Authorization: `Bearer ${token}` }
              }).catch(err => console.error("Call log end error:", err));
            }
            navigate(-1);
          }
        });
      } catch (error) {
        console.error('Error initializing call:', error);
        navigate(-1);
      }
    };

    initCall();

    return () => {
      if (zpRef.current) {
        try {
          zpRef.current.destroy();
        } catch (error) {
          console.error('Cleanup error:', error);
        }
      }
    };
  }, [roomId, userName, callType, navigate]);

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#1a1a1a' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default VoiceCall;