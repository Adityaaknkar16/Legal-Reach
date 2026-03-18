import React, { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

const VoiceCall = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const zpRef = useRef(null);
  
  const roomId = searchParams.get('roomId');
  const userName = searchParams.get('userName');
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

      try {
        const appId = 615561568;
        const serverSecret = "b7cfab4369fb1e6aeab8a7c4e733ef7c";

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