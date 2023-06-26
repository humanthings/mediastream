const video = document.getElementById("video");

function startup() {
  // Trigger access of video and audio access right prompt to users
  // https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Build_a_phone_with_peerjs/Connect_peers/Get_microphone_permission
  // can't set the video property in the other section, so set them here
  //
  navigator.mediaDevices
    .getUserMedia({
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 60 },
      },
      audio: true,
    })
    .then((stream) => {
      window.localStream = stream; // A
      window.localAudio.srcObject = stream; // B
      window.localAudio.autoplay = true; // C
    })
    .catch((err) => {
      console.error(`you got an error: ${err}`);
    });

  navigator.mediaDevices
    .enumerateDevices()
    .then((devices) => {
      devices.forEach((device) => {
        // Get the audio and video IDs from ShadowCast device
        if (
          device.label?.toLowerCase()?.includes("298f:1996") ||
          device.label?.toLowerCase()?.includes("shadowcast")
        ) {
          // Get the audio ID
          if (device.kind === "audioinput") {
            audioDeviceId = device.deviceId;
            // console.log(audioDeviceId);
          }

          // Get the video ID
          if (device.kind === "videoinput") {
            videoDeviceId = device.deviceId;
            // console.log(videoDeviceId);
          }
        }
      });
    })
    .then(() => {
      // from https://github.com/humanthings/genki-arcade-web/blob/master/src/hooks/useMediaStream.ts#L61
      navigator.mediaDevices
        .getUserMedia({
          audio: {
            deviceId: audioDeviceId,
            autoGainControl: false,
            echoCancellation: false,
            noiseSuppression: false,
            channelCount: 2,
          },
          video: {
            deviceId: videoDeviceId,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 60 },
          },
        })
        .then((stream) => {
          video.srcObject = stream;
          video.play(); // Must not use the autoplay attribute in html
        })
        .catch(console.error);
    })
    .catch((err) => {
      console.error(`${err.name}: ${err.message}`);
    });
}

window.addEventListener("load", startup, false);
