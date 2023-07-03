// Based on the youtube video
// https://www.youtube.com/watch?v=Hc7GE3ENz7k

const video = document.getElementById("video");
document.body.style.backgroundImage = "url('./assets/images/background.jpg')";
let audioDeviceId = null;
let videoDeviceId = null;
// For Video recording
let chunks = [];
let mediaRecorder;
let mediaStream;
let modeSelected = "Favor Performance";
let mode_arrow = document.getElementById("mode-arrow");

function initModeDropdown() {
  if (modeSelected === "Favor Performance") {
    // console.log("Set Favour Performance to red");

    document.getElementById("mode-items").innerHTML = `            
    <div
        class="settings-item--list-item"
        style="color: rgba(255, 255, 255, 0.8); display: block;"
        onclick="onChangeMode(event)">
        Favor Performance
    </div>
    `;
  } else if (modeSelected === "Favor Resolution") {
    document.getElementById("mode-items").innerHTML = `            
    <div
        class="settings-item--list-item"
        style="color: rgba(255, 255, 255, 0.8); display: block;"
        onclick="onChangeMode(event)">
        Favor Resolution
    </div>  
    `;
  }
}

function onChangeMode(event) {
  // console.log("onChangeMode");
  // console.log(event.target.innerText);
  modeSelected = event.target.innerText;
  // console.log("Set ", modeSelected);

  // get the parent element of the clicked element
  let parent = event.target.parentElement;
  // get the child elements and set their color to default
  parent.children[0].style.display = "none";
  parent.children[1].style.display = "none";

  event.target.style.display = "block";
  event.target.style.color = "rgb(255, 255, 255, 0.8)";
  mode_arrow.style.transform = "";

  // Set the solution
  setShadowCast();
}

function onModeDropdown() {
  // console.log("onModeDropdown");
  // Get the value of the mode
  // Set an array of two modes: Favour Performance and Favour Resolution
  let modes = ["Favor Performance", "Favor Resolution"];

  // console.log("Get ", modeSelected);

  if (mode_arrow.style.transform == "") {
    if (modeSelected === "Favor Performance") {
      // console.log("Set Favour Performance to red");

      document.getElementById("mode-items").innerHTML = `            
      <div
          class="settings-item--list-item"
          style="color: rgb(240, 83, 72); display: block;"
          onclick="onChangeMode(event)">
          Favor Performance
      </div>
      <div
          class="settings-item--list-item"
          style="color: rgba(255, 255, 255, 0.8); display: block;"
          onclick="onChangeMode(event)">
          Favor Resolution         
      </div>  
      `;
    } else if (modeSelected === "Favor Resolution") {
      document.getElementById("mode-items").innerHTML = `            
      <div
          class="settings-item--list-item"
          style="color: rgba(255, 255, 255, 0.8); display: block;"
          onclick="onChangeMode(event)">
          Favor Performance
      </div>
      <div
          class="settings-item--list-item"
          style="color: rgb(240, 83, 72); display: block;"
          onclick="onChangeMode(event)">
          Favor Resolution
      </div>  
      `;
    }

    // Rotate mode-arrow 180 degree
    mode_arrow.style.transform = "rotate(180deg)";
  } else {
    // Close drop down menu
    initModeDropdown();

    mode_arrow.style.transform = "";
  }
}

function onMicDropdown() {
  console.log("onMicDropdown");
  let mic_arrow = document.getElementById("mic-arrow");

  if (mic_arrow.style.transform == "") {
  } else {
    document.getElementById("mic-items").innerHTML = "";
    mode_arrow.style.transform = "";
  }
}

function triggerAccessPrompt() {
  // Trigger access of video and audio access right prompt to users
  // https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Build_a_phone_with_peerjs/Connect_peers/Get_microphone_permission
  // can't set the video property in the other section, so set the width, height and framerate here
  //
  navigator.mediaDevices
    .getUserMedia({
      video: true,
      // {
      //   width: { ideal: 1920 },
      //   height: { ideal: 1080 },
      //   frameRate: { ideal: 60 },
      // },
      audio: true,
    })
    .then((stream) => {
      console.log("stream intialized");
      window.localStream = stream; // A
      // Avoid error of srcObject not defined.
      // window.localAudio.srcObject = stream; // B
      // window.localAudio.autoplay = true; // C

      // Must clear the stream first before the resolution can be changed later.
      stream.getTracks().forEach((track) => track.stop());
      console.log("stream stopped");
    })
    .catch((err) => {
      console.error(`you got an error: ${err}`);
    });
}

// function stopStreamedVideo(videoElem) {
//   // https://stackoverflow.com/questions/11642926/stop-close-webcam-which-is-opened-by-navigator-getusermedia
//   let stream = videoElem.srcObject;
//   let tracks = stream.getTracks();
//   tracks.forEach(function (track) {
//     track.stop();
//   });
// }

function setShadowCast() {
  audioDeviceId = null;
  videoDeviceId = null;
  width_value = 1920;
  height_value = 1080;

  if (modeSelected === "Favor Performance") {
    width_value = 1920;
    height_value = 1080;
  } else {
    width_value = 720;
    height_value = 480;
  }

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
            width: width_value,
            height: height_value,
            frameRate: { ideal: 60 },
          },
        })
        .then((stream) => {
          if (audioDeviceId && videoDeviceId) {
            video.srcObject = stream;

            document.body.style.backgroundImage = "none";
            video.style.display = "block"; // Display the video container

            video.play(); // Must not use the autoplay attribute in html

            console.log("video started");

            // Set mediaStram global variable
            mediaStream = stream;
          } else {
            document.body.style.backgroundImage =
              "url('./assets/images/background.jpg')";
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

//
// https://dev.to/ethand91/mediarecorder-api-tutorial-54n8
//
const startRecord = async () => {
  const mimeType = "video/webm;codecs=vp8,opus";

  if (!MediaRecorder.isTypeSupported(mimeType)) {
    alert("vp8/opus mime type is not supported");

    return;
  }

  const options = {
    audioBitsPerSecond: 128000,
    mimeType,
    videoBitsPerSecond: 2500000,
  };

  // const mediaStream = await getLocalMediaStream();

  // Get mediaStream from global variable
  mediaRecorder = new MediaRecorder(mediaStream, options);

  setListeners();

  mediaRecorder.start(1000);

  // Invisible btn_start_record
  document.getElementById("btn_start_record").style.visibility = "hidden";
  document.getElementById("btn_stop_record").style.visibility = "visible";
};

const setListeners = () => {
  mediaRecorder.ondataavailable = handleOnDataAvailable;
  mediaRecorder.onstop = handleOnStop;
};

const handleOnDataAvailable = ({ data }) => {
  if (data.size > 0) {
    chunks.push(data);
  }
};

const handleOnStop = () => {
  saveFile();

  destroyListeners();
  mediaRecorder = undefined;
};

const destroyListeners = () => {
  mediaRecorder.ondataavailable = undefined;
  mediaRecorder.onstop = undefined;
};

const stopRecord = async () => {
  if (!mediaRecorder) return;

  mediaRecorder.stop();

  // Invisible btn_start_record
  document.getElementById("btn_start_record").style.visibility = "visible";
  document.getElementById("btn_stop_record").style.visibility = "hidden";
};

const saveFile = () => {
  const blob = new Blob(chunks);

  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.style = "display: none";
  link.href = blobUrl;
  link.download = "recorded_file.webm";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.URL.revokeObjectURL(blobUrl);
  chunks = [];
};

function startup() {
  // Remarked to disable the example of ffmpeg

  // const { createFFmpeg, fetchFile } = FFmpeg;
  // const ffmpeg = createFFmpeg({ log: true });
  // const transcode = async ({ target: { files } }) => {
  //   const { name } = files[0];
  //   await ffmpeg.load();
  //   ffmpeg.FS("writeFile", name, await fetchFile(files[0]));
  //   await ffmpeg.run("-i", name, "output.mp4");
  //   const data = ffmpeg.FS("readFile", "output.mp4");
  //   const video = document.getElementById("player");
  //   video.src = URL.createObjectURL(
  //     new Blob([data.buffer], { type: "video/mp4" })
  //   );
  // };
  // document.getElementById("uploader").addEventListener("change", transcode);

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

initModeDropdown();
