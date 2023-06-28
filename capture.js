// Based on the youtube video
// https://www.youtube.com/watch?v=Hc7GE3ENz7k

const video = document.getElementById("video");
document.body.style.backgroundImage = "url('background.jpg')";
audioDeviceId = null;
videoDeviceId = null;

function triggerAccessPrompt() {
  // Trigger access of video and audio access right prompt to users
  // https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Build_a_phone_with_peerjs/Connect_peers/Get_microphone_permission
  // can't set the video property in the other section, so set the width, height and framerate here
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
      // Avoid error of srcObject not defined.
      // window.localAudio.srcObject = stream; // B
      // window.localAudio.autoplay = true; // C
    })
    .catch((err) => {
      console.error(`you got an error: ${err}`);
    });
}

function setShadowCast() {
  audioDeviceId = null;
  videoDeviceId = null;

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
          if (audioDeviceId && videoDeviceId) {
            video.srcObject = stream;
            document.body.style.backgroundImage = "none";
            video.style.display = "block";
            video.play(); // Must not use the autoplay attribute in html
            console.log("video started");
          } else {
            document.body.style.backgroundImage = "url('background.jpg')";
            video.style.display = "none";
            console.log("Can't find the ShadowCast device");
          }
        })
        .catch(console.error);
    })
    .catch((err) => {
      console.error(`${err.name}: ${err.message}`);
    });
}

function openFullscreen() {
  console.log("openFullscreen");
  if (video.requestFullscreen) {
    video.requestFullscreen();
  } else if (video.webkitRequestFullscreen) {
    /* Safari */
    video.webkitRequestFullscreen();
  }
}

function startup() {
  navigator.permissions
    .query({ name: "microphone" || "camera" })
    .then(function (result) {
      if (result.state == "granted") {
        setShadowCast();
      } else {
        triggerAccessPrompt();
      }
      result.onchange = function () {
        console.log(result.state);
        if (result.state == "granted") {
          setShadowCast();
        }
      };
    });

  // console.log("startup");
}

window.addEventListener("load", startup, false);

//
//https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/devicechange_event
//
navigator.mediaDevices.addEventListener("devicechange", startup, false);
