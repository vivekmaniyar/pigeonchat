import React from 'react';
import { RtcRole, RtcTokenBuilder } from 'agora-access-token';
import AgoraUIKit from 'agora-react-uikit';
import { useState } from 'react';

export default function Videocall() {
    //retrieve channel name from url query
    const urlParams = new URLSearchParams(window.location.search);
    const channelName = urlParams.get('channel');
    const appId = '317bfcb35162405ba288565c2dad34e4';
    const appCertificate = '4d5d9a96699148f4ad5674b61af7f402';
    const uid = 0;
    const role = RtcRole.PUBLISHER;
    const expirationTimeInSeconds = 3600
    const currentTimestamp = Math.floor(Date.now() / 1000)
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds
    const tokenA = RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uid, role, privilegeExpiredTs);

    const [videoCall, setVideoCall] = useState(true);

    const rtcProps = {
        appId: appId,
        channel: channelName,
        token: tokenA,
        activeSpeaker: true,
    };

    const callbacks = {
        EndCall: () => {
            setVideoCall(false);
            //close the window
            window.close();
        },
    };

    return videoCall ? (
        <div style={{ display: "flex", width: "100vw", height: "100vh",flex:1 }}>
          <AgoraUIKit rtcProps={rtcProps} callbacks={callbacks} />
        </div>
      ) : (
        <h3 onClick={() => setVideoCall(true)}>Join</h3>
      );
}
