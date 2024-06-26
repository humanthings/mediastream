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
let modeSelected = "Favor Resolution";
let mode_arrow = document.getElementById("mode-arrow");
let video_arrow = document.getElementById("video-arrow");
let resolution_arrow = document.getElementById("resolution-arrow");
let framerate_arrow = document.getElementById("framerate-arrow");
let mic_arrow = document.getElementById("mic-arrow");
let lang_arrow = document.getElementById("lang-arrow");
let shadowcastType = "shadowcast";
let videoDevices = [];
let audioDevices = [];
let videoSelected = null;
let videoSelectedID = "";
let resolutionSelected = "1920 x 1080";
let framerateSelected = "60";
let micSelected = null;
let micSelectedID = "default";
let useMic = false; // if the mic button is clicked
let volume = 100;
let langSelected = "English";
let fileformat = "webm";

function setLanguage(lang) {
  if (lang === "English") {
    // Get the en.json file and set the text
    file = "en";
  } else if (lang === "Chinese Simplified") {
    file = "zh-hans";
  } else if (lang === "Chinese Traditional") {
    file = "zh-hant";
  } else if (lang === "Japanese") {
    file = "jp";
  } else if (lang === "Korean") {
    file = "ko";
  }

  // Disable the translate of menu items for testing.
  fetch(`./assets/translations/${file}.json`).then((response) => {
    // console.log(response);
    response.json().then((data) => {
      // console.log(data.FAVOR_PERFOMANCE);
      // return data;
      header_title = document.getElementsByClassName(
        "settings-item--header-title"
      );

      header_title[0].innerText = data.VIDEO;
      header_title[1].innerText = data.RESOLUTION;
      header_title[2].innerText = data.FRAMERATE;
      header_title[3].innerText = data.MICROPHONE;
      header_title[4].innerText = data.VOLUME;
      header_title[5].innerText = data.CREDITS;
      header_title[6].innerText = data.LANGUAGE;
      // Array.from(header_title).forEach((title) => {
      //   console.log(title.childNodes[0]);
      //   title.innerText = data.MODE;
      //   console.log(data.MODE);
      // });
    });
  });
}

function initLangDropdown() {
  // Get localstorage the value of the langSelected
  langSelected = localStorage.getItem("langSelected");
  if (langSelected === null) {
    langSelected = "English";
  }
  document.getElementById("lang-items").innerHTML = `
  <div
      class="settings-item--list-item"
      style="color: rgba(255, 255, 255, 0.8); display: block;"
      onclick="onChangeMic(event)">
      ${langSelected}
  </div>
  `;
  // Set the language
  setLanguage(langSelected);
}

function onChangeLang(event) {
  // console.log("onChangeLang");
  console.log(event.target.innerText);
  // get the value of the audio device from the clicked element

  langSelected = event.target.innerText;

  // Set the language
  setLanguage(langSelected);
  // set localstorage the value of the langSelected
  localStorage.setItem("langSelected", langSelected);

  // get the parent element of the clicked element
  let parent = event.target.parentElement;
  // get the child elements and set their color to default
  for (let i = 0; i < parent.children.length; i++) {
    parent.children[i].style.display = "none";
  }

  event.target.style.display = "block";
  event.target.style.color = "rgb(255, 255, 255, 0.8)";
  lang_arrow.style.transform = "";
}

function onLangDropdown() {
  console.log("onLangDropdown");

  let langs = [
    "English",
    "Chinese Simplified",
    "Chinese Traditional",
    "Japanese",
    "Korean",
  ];

  if (lang_arrow.style.transform == "") {
    langList = [];
    langs.forEach(function (lang) {
      if (lang === langSelected) {
        langList += `
        <div
          class="settings-item--list-item"
          style="color: rgb(240, 83, 72); display: block;"
          onclick="onChangeLang(event)">
          ${lang}
        </div>
        `;
      } else {
        langList += `
        <div
          class="settings-item--list-item"
          style="color: rgba(255, 255, 255, 0.8); display: block;"
          onclick="onChangeLang(event)">
          ${lang}
        </div>
        `;
      }
    });

    document.getElementById("lang-items").innerHTML = langList;

    // Rotate lang-arrow 180 degree
    lang_arrow.style.transform = "rotate(180deg)";
  } else {
    // Close drop down menu
    initLangDropdown();

    lang_arrow.style.transform = "";
  }
}

function initModeDropdown() {
  if (modeSelected === "Favor Performance") {
    // console.log("Set Favour Performance to red");

    document.getElementById("mode-items").innerHTML = `            
    <div
        class="settings-item--list-item"
        style="color: rgba(255, 255, 255, 0.8); display: block;"
        onclick="onChangeMode(event)">
        Favor Mesholution
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

  // stop the stream
  let tracks = mediaStream.getTracks();
  tracks.forEach(function (track) {
    track.stop();
  });

  // wait for 1 second to stop the stream
  setTimeout(function () {
    // Set the video input change
    setShadowCast();
  }, 100);
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

function initVideoDropDown() {
  console.log("initVideoDropDown");

  navigator.mediaDevices
    .enumerateDevices()
    .then(function (devices) {
      // console.log(devices);
      videoDevices = [];
      audioDevices = [];
      devices.forEach(function (device) {
        console
          .log
          // device.kind + ": " + device.label + " id = " + device.deviceId
          ();
        if (device.kind === "videoinput") {
          videoDevices.push(device);
        }
        if (device.kind === "audioinput") {
          audioDevices.push(device);
        }
      });
    })
    .then(function () {
      console.log("videoDevices :", videoDevices);
      console.log("videoSelectedID :", videoSelectedID);

      videoDevices.forEach(function (device) {
        // console.log(device.label + " id = " + device.deviceId);
        if (device.deviceId === videoSelectedID) {
          videoSelected = device.label;
          console.log("Got vdieoDeviceId in initial", videoSelectedID);
        }
      });

      if (videoSelected !== null) {
        document.getElementById("video-items").innerHTML = `            
          <div
              class="settings-item--list-item"
              style="color: rgba(255, 255, 255, 0.8); display: block;"
              onclick="onChangeMic(event)">
              ${videoSelected}
          </div>
    `;
      }
    });
}

function initResolutionDropdown() {
  // if (resolutionSelected !== "") {
  document.getElementById("resolution-items").innerHTML = `            
    <div
        class="settings-item--list-item"
        style="color: rgba(255, 255, 255, 0.8); display: block;"
        onclick="onChangeResolution(event)">
        ${resolutionSelected}
    </div>  
    `;
  // }
}

function initFramerateDropdown() {
  console.log("initFramerateDropdown");
  // if (resolutionSelected !== "") {
  document.getElementById("framerate-items").innerHTML = `            
    <div
        class="settings-item--list-item"
        style="color: rgba(255, 255, 255, 0.8); display: block;"
        onclick="onChangeFramerate(event)">
        ${framerateSelected}
    </div>  
    `;
  // }
}

function initMicDropDown() {
  console.log("initMicDropDown");
  // console.log("micSelectedID", micSelectedID);

  // Get the device lable from id
  navigator.mediaDevices
    .enumerateDevices()
    .then(function (devices) {
      // console.log(devices);
      videoDevices = [];
      audioDevices = [];
      devices.forEach(function (device) {
        console
          .log
          // device.kind + ": " + device.label + " id = " + device.deviceId
          ();
        if (device.kind === "videoinput") {
          videoDevices.push(device);
        }
        if (device.kind === "audioinput") {
          audioDevices.push(device);
        }
      });
    })
    .then(function () {
      console.log("audioDevices :", audioDevices);
      console.log("micSelectedID :", micSelectedID);

      audioDevices.forEach(function (device) {
        // console.log(device.label + " id = " + device.deviceId);
        if (device.deviceId === micSelectedID) {
          micSelected = device.label;
          // console.log("Got audioDeviceId", micSelectedID);
        }
      });

      if (micSelected !== null) {
        document.getElementById("mic-items").innerHTML = `            
      <div
          class="settings-item--list-item"
          style="color: rgba(255, 255, 255, 0.8); display: block;"
          onclick="onChangeMic(event)">
          ${micSelected}
      </div>
      `;
      }
    });
}

function onChangeVideo(event) {
  console.log("onChangeVideo");
  console.log(event.target.innerText);

  videoSelected = event.target.innerText;

  // Get the device ID for video from the selected video device
  videoDevices.forEach(function (device) {
    // console.log(device.label + " id = " + device.deviceId);
    if (device.label === videoSelected) {
      videoSelectedID = device.deviceId;
      console.log("Got videoDeviceId", videoSelectedID);
    }
  });

  // get the parent element of the clicked element
  let parent = event.target.parentElement;
  // get the child elements and set their color to default
  for (let i = 0; i < parent.children.length; i++) {
    parent.children[i].style.display = "none";
  }

  event.target.style.display = "block";
  event.target.style.color = "rgb(255, 255, 255, 0.8)";
  video_arrow.style.transform = "";

  // stop the stream
  if (mediaStream !== null) {
    try {
      let tracks = mediaStream.getTracks();
      tracks.forEach(function (track) {
        track.stop();
      });
    } catch (error) {
      console.log("Error: ", error);
    }
  }

  // wait for 1 second to stop the stream
  setTimeout(function () {
    // Set the video input change
    setShadowCast();
  }, 100);
}

function onChangeResolution(event) {
  console.log("onChangeResolution");
  console.log(event.target.innerText);

  resolutionSelected = event.target.innerText;

  // get the parent element of the clicked element
  let parent = event.target.parentElement;
  // get the child elements and set their color to default
  for (let i = 0; i < parent.children.length; i++) {
    parent.children[i].style.display = "none";
  }

  event.target.style.display = "block";
  event.target.style.color = "rgb(255, 255, 255, 0.8)";
  resolution_arrow.style.transform = "";

  // stop the stream
  if (mediaStream !== null) {
    try {
      let tracks = mediaStream.getTracks();
      tracks.forEach(function (track) {
        track.stop();
      });
    } catch (error) {
      console.log("Error: ", error);
    }
  }

  // wait for 1 second to stop the stream
  setTimeout(function () {
    // Set the video input change
    setShadowCast();
  }, 100);
}

function onChangeFramerate(event) {
  console.log("onChangeFramerate");
  console.log(event.target.innerText);

  framerateSelected = event.target.innerText;

  // get the parent element of the clicked element
  let parent = event.target.parentElement;
  // get the child elements and set their color to default
  for (let i = 0; i < parent.children.length; i++) {
    parent.children[i].style.display = "none";
  }

  event.target.style.display = "block";
  event.target.style.color = "rgb(255, 255, 255, 0.8)";
  framerate_arrow.style.transform = "";

  // stop the stream
  if (mediaStream !== null) {
    try {
      let tracks = mediaStream.getTracks();
      tracks.forEach(function (track) {
        track.stop();
      });
    } catch (error) {
      console.log("Error: ", error);
    }
  }

  // wait for 1 second to stop the stream
  setTimeout(function () {
    // Set the video input change
    setShadowCast();
  }, 100);
}

function onChangeMic(event) {
  // console.log("onChangeMic");
  console.log(event.target.innerText);
  // get the value of the audio device from the clicked element

  micSelected = event.target.innerText;
  audioDevices.forEach(function (device) {
    // console.log(device.label + " id = " + device.deviceId);
    if (device.label === micSelected) {
      micSelectedID = device.deviceId;
      console.log("Got audioDeviceId", micSelectedID);
    }
  });

  // get the parent element of the clicked element
  let parent = event.target.parentElement;
  // get the child elements and set their color to default
  for (let i = 0; i < parent.children.length; i++) {
    parent.children[i].style.display = "none";
  }

  event.target.style.display = "block";
  event.target.style.color = "rgb(255, 255, 255, 0.8)";
  mic_arrow.style.transform = "";

  // Set the solution
  setShadowCast();
}

function onVideoDropdown() {
  console.log("onVideoDropdown");
  console.log("videoSelectedID :", videoSelectedID);
  console.log("videoDevices :", videoDevices);

  if (video_arrow.style.transform == "") {
    navigator.mediaDevices.enumerateDevices().then(function (devices) {
      // console.log(devices);
      videoDevices = [];
      devices.forEach(function (device) {
        // console.log(
        //   device.kind + ": " + device.label + " id = " + device.deviceId
        // );
        if (device.kind === "videoinput") {
          videoDevices.push(device);
        }
      });
    });

    let videoDevicesList = "";
    videoDevices.forEach(function (device) {
      // console.log(device.label + " id = " + device.deviceId);
      if (device.deviceId === videoSelectedID) {
        videoDevicesList += `
      <div
        class="settings-item--list-item"
        style="color: rgb(240, 83, 72); display: block;"
        onclick="onChangeVideo(event)">
        ${device.label}
      </div>
      `;
      } else {
        videoDevicesList += `
      <div
        class="settings-item--list-item"
        style="color: rgba(255, 255, 255, 0.8); display: block;"
        onclick="onChangeVideo(event)">
        ${device.label}
      </div>
      `;
      }
    });
    // console.log(videoDevicesList);

    document.getElementById("video-items").innerHTML = videoDevicesList;
    // Rotate mode-arrow 180 degree
    video_arrow.style.transform = "rotate(180deg)";
  } else {
    // document.getElementById("mic-items").innerHTML = "";
    console.log("Close and reset video dropdown");

    initVideoDropDown();

    video_arrow.style.transform = "";
  }
}

function onResolutionDropdown() {
  console.log("onResolutionDropdown");
  resolution = [
    "3840 x 2160",
    "2560 x 1440",
    "1920 x 1080",
    "1360 x 768",
    "1280 x 1024",
    "1280 x 960",
    "1280 x 720",
    "1024 x 768",
    "800 x 600",
    "720 x 576",
    "720 x 480",
    "640 x 480",
  ];
  console.log("onResolutionDropdown :", shadowcastType);
  if (shadowcastType === "shadowcast 2 pro") {
    console.log("shadowcast 2 pro got");
    resolution = [
      "3840 x 2160",
      "2560 x 1440",
      "2560 x 1080",
      "1920 x 1080",
      "1360 x 768",
      "1280 x 1024",
      "1280 x 720",
      "1024 x 768",
      "800 x 600",
      "720 x 768",
      "720 x 480",
    ];
  }
  if (shadowcastType === "shadowcast 2") {
    console.log("shadowcast 2 got");
    resolution = ["2560 x 1440", "1920 x 1080", "1280 x 720", "640 x 480"];
  }
  if (shadowcastType === "shadowcast") {
    console.log("shadowcast got");
    resolution = ["1920 x 1080", "1280 x 720", "640 x 480"];
  }
  console.log(resolution);

  if (resolution_arrow.style.transform == "") {
    let resolutionList = "";
    resolution.forEach(function (resol) {
      // console.log(resol);
      if (resol === resolutionSelected) {
        resolutionList += `
      <div
        class="settings-item--list-item"
        style="color: rgb(240, 83, 72); display: block;"
        onclick="onChangeResolution(event)">
        ${resol}
      </div>
      `;
      } else {
        resolutionList += `
      <div
        class="settings-item--list-item"
        style="color: rgba(255, 255, 255, 0.8); display: block;"
        onclick="onChangeResolution(event)">
        ${resol}
      </div>
      `;
      }
    });
    document.getElementById("resolution-items").innerHTML = resolutionList;
    resolution_arrow.style.transform = "rotate(180deg)";
  } else {
    initResolutionDropdown();
    resolution_arrow.style.transform = "";
  }
}

function onFrameRateDropdown() {
  console.log("onFrameRateDropdown");
  framerate = ["60", "50", "40", "30", "25", "20", "15", "10"];

  if (shadowcastType === "shadowcast 2 pro") {
    console.log("shadowcast 2 pro got");
    if (resolutionSelected === "1920 x 1080") {
      framerate = [
        "240",
        "144",
        "120",
        "60",
        "50",
        "40",
        "30",
        "25",
        "20",
        "15",
        "10",
        "5",
      ];
    } else {
      framerate = ["60", "50", "30", "25"];
    }
  }

  if (shadowcastType === "shadowcast 2") {
    console.log("shadowcast 2 got");
    if (resolutionSelected === "2560 x 1440") {
      framerate = ["30", "25", "20", "15", "10", "5"];
    }
  }

  console.log(framerate);

  if (framerate_arrow.style.transform == "") {
    let framerateList = "";
    framerate.forEach(function (fr) {
      console.log(fr);
      if (fr === framerateSelected) {
        framerateList += `
      <div
        class="settings-item--list-item"
        style="color: rgb(240, 83, 72); display: block;"
        onclick="onChangeFramerate(event)">
        ${fr}
      </div>
      `;
      } else {
        framerateList += `
      <div
        class="settings-item--list-item"
        style="color: rgba(255, 255, 255, 0.8); display: block;"
        onclick="onChangeFramerate(event)">
        ${fr}
      </div>
      `;
      }
    });
    document.getElementById("framerate-items").innerHTML = framerateList;
    framerate_arrow.style.transform = "rotate(180deg)";
  } else {
    initFramerateDropdown();
    framerate_arrow.style.transform = "";
  }
}

function onMicDropdown() {
  console.log("onMicDropdown");

  if (mic_arrow.style.transform == "") {
    // Get the list of audio devices
    navigator.mediaDevices.enumerateDevices().then(function (devices) {
      // console.log(devices);
      audioDevices = [];
      devices.forEach(function (device) {
        // console.log(
        //   device.kind + ": " + device.label + " id = " + device.deviceId
        // );
        if (device.kind === "audioinput") {
          audioDevices.push(device);
        }
      });

      // console.log(audioDevices);

      let audioDevicesList = "";
      audioDevices.forEach(function (device) {
        // console.log(
        //   device.kind + ": " + device.label + " id = " + device.deviceId
        // );
        if (device.deviceId === micSelectedID) {
          audioDevicesList += `
          <div
            class="settings-item--list-item"
            style="color: rgb(240, 83, 72); display: block;"
            onclick="onChangeMic(event)">
            ${device.label}
          </div>
          `;
        } else {
          audioDevicesList += `
          <div
            class="settings-item--list-item"
            style="color: rgba(255, 255, 255, 0.8); display: block;"
            onclick="onChangeMic(event)">
            ${device.label}
          </div>
          `;
        }
      });

      // console.log(audioDevicesList);

      document.getElementById("mic-items").innerHTML = audioDevicesList;
    });

    // Rotate mode-arrow 180 degree
    mic_arrow.style.transform = "rotate(180deg)";
  } else {
    // document.getElementById("mic-items").innerHTML = "";
    console.log("Close and reset mic dropdown");

    initMicDropDown();

    mic_arrow.style.transform = "";
  }
}

function onVolumeChange(value) {
  console.log("onVolumeChange", value);

  // Set the volume
  volume = value;

  setShadowCast();
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

function stopStreamedVideo(videoElem) {
  // https://stackoverflow.com/questions/11642926/stop-close-webcam-which-is-opened-by-navigator-getusermedia
  let stream = videoElem.srcObject;
  let tracks = stream.getTracks();
  tracks.forEach(function (track) {
    track.stop();
  });
}

function setShadowCast() {
  console.log("setShadowCast");
  audioDeviceId = null;
  videoDeviceId = ""; // null;
  console.log("resolutionSelected: ", resolutionSelected);
  console.log("framerateSelected: ", framerateSelected);
  width_value = resolutionSelected.split(" x ")[0];
  height_value = resolutionSelected.split(" x ")[1];
  frame_rate = framerateSelected;

  // This is the resolution for ShadowCast
  // if (modeSelected === "Favor Resolution") {
  //   width_value = 1920;
  //   height_value = 1080;
  // } else {
  //   width_value = 1280;
  //   height_value = 720;
  // }

  navigator.mediaDevices
    .enumerateDevices()
    .then((devices) => {
      devices.forEach((device) => {
        // Get the audio and video IDs from ShadowCast device
        if (
          device.label?.toLowerCase()?.includes("298f:1996") ||
          device.label?.toLowerCase()?.includes("shadowcast")
        ) {
          console.log("DETECTED ShahowCast");

          // Get the audio ID
          if (device.kind === "audioinput") {
            audioDeviceId = device.deviceId;
            // console.log("audioDeviceId: ", audioDeviceId);
          }

          // If user selected to use the mic
          if (useMic === true) {
            audioDeviceId = micSelectedID;
            console.log("Got audioDeviceId", audioDeviceId);
          }

          // Get the video ID
          if (device.kind === "videoinput") {
            videoDeviceId = device.deviceId;
            shadowcastType = "shadowcast";

            if (device.label?.toLowerCase()?.includes("shadowcast 2")) {
              shadowcastType = "shadowcast 2";
            }

            if (device.label?.toLowerCase()?.includes("shadowcast 2 pro")) {
              shadowcastType = "shadowcast 2 pro";
            }

            // videoSelectedID = device.deviceId;
            // console.log(videoDeviceId);
            // width_value = 1920;
            // height_value = 1080;
            // frame_rate = 30;
          }
        }
        // If the not video input is selected, then use the default ShadowCast video device
        // Override the videoDeviceId with the selected video device by the user
        if (videoSelectedID !== "") {
          console.log("Got videoSelectedID", videoSelectedID);
          videoDeviceId = videoSelectedID;
          // console.log("changed ID", videoDeviceId);
          // If video is selected, then use the mic selected as well. no matter if the mic button is clicked or not.
          audioDeviceId = micSelectedID;
        }

        // This is the check if the ShadowCast 2 (Pro) is connected
        // if (videoSelectedID === "") {
        //   if (
        //     device.label?.toLowerCase()?.includes("shadowcast 2") &
        //     (device.kind === "videoinput")
        //   ) {
        //     shadowcastType = "shadowcast 2";
        //     if (modeSelected === "Favor Resolution") {
        //       width_value = 2560; // Set the 2K
        //       height_value = 1440;
        //       frame_rate = 30;
        //     } else {
        //       width_value = 1920;
        //       height_value = 1080;
        //       frame_rate = 30;
        //     }
        //   }
        //   if (
        //     device.label?.toLowerCase()?.includes("shadowcast 2 pro") &
        //     (device.kind === "videoinput")
        //   ) {
        //     shadowcastType = "shadowcast 2 pro";
        //     if (modeSelected === "Favor Resolution") {
        //       width_value = 3840; // Set the 4K
        //       height_value = 2160;
        //       frame_rate = 60;
        //     } else {
        //       width_value = 1920;
        //       height_value = 1080;
        //       frame_rate = 60;
        //     }
        //   }
        // }
      });
    })
    .then(() => {
      console.log(
        "Resolution selected: ",
        width_value,
        height_value,
        frame_rate
      );

      // videoDeviceId =
      //   "4be6e747da686a4db1c8d635063edf5c1de75ebd778ba731ab61fa4f1c010480";
      console.log("Before change getUserMedia :", videoDeviceId);
      console.log("Before change getUserMedia :", audioDeviceId);

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
            // deviceId: videoDeviceId,
            // width: width_value,
            // height: height_value,
            // frameRate: { ideal: 60 },
            deviceId: videoDeviceId,
            width: { exact: width_value },
            height: { exact: height_value },
            frameRate: { exact: frame_rate },
          },
        })
        .then((stream) => {
          if (audioDeviceId && videoDeviceId) {
            video.srcObject = stream;

            document.body.style.backgroundImage = "none";
            btn_go_to_website.style.visibility = "hidden";
            btn_sologans.style.visibility = "hidden";
            settings_container.style.visibility = "visible";
            controls_container.style.visibility = "visible";
            video.style.display = "block"; // Display the video container

            // Set the video volume
            video.volume = volume / 100;

            video.play(); // Must not use the autoplay attribute in html

            console.log("video started");

            // Set mediaStram global variable
            mediaStream = stream;

            console.log(mediaStream);
          } else {
            document.body.style.backgroundImage =
              "url('./assets/images/background.jpg')";
            video.style.display = "none";
            btn_go_to_website.style.visibility = "visible";
            btn_sologans.style.visibility = "visible";
            settings_container.style.visibility = "hidden";
            controls_container.style.visibility = "hidden";
            console.log("Can't find the ShadowCast device");
          }
        })
        .catch(console.error);
      // .catch((err) => {
      //   console.error;
      //   console.log("getstream failed");
      // });
    })
    .catch((err) => {
      console.error(`${err.name}: ${err.message}`);
      // stopStreamedVideo();  // see if this code can stop the stream when ShadowCast is NOT found.
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

function onUseMic() {
  console.log("useMic");
  useMic = true;

  setShadowCast();

  // Invisible use mic button
  document.getElementById("btn_use_mic").style.display = "none";
  document.getElementById("btn_use_no_mic").style.display = "block";
}

function onUseNoMic() {
  console.log("useNoMic");
  useMic = false;

  setShadowCast();

  // Invisible use No mic button
  document.getElementById("btn_use_mic").style.display = "block";
  document.getElementById("btn_use_no_mic").style.display = "none";
}

function onScreenshoot1() {
  console.log("onScreenshoot");
  const track = mediaStream.getVideoTracks()[0];
  let imageCapture = new ImageCapture(track);
  btn_screenshoot = document.getElementById("btn_screenshoot");
  btn_screenshoot.style.display = "none";
  btn_screenshoot_active = document.getElementById("btn_screenshoot_active");
  btn_screenshoot_active.style.display = "block";

  imageCapture
    .takePhoto()
    .then((blob) => {
      // console.log("Took photo:", blob);

      // Save blob to a file and download it
      // https://stackoverflow.com/questions/19327749/javascript-blob-filename-without-link
      const a = document.createElement("a");
      a.style.display = "none";
      document.body.appendChild(a);

      // Create ObjectURL
      const url = window.URL.createObjectURL(blob);
      a.href = url;
      // Give filename with date and time in simple format
      a.download = "screenshot_" + new Date().toLocaleString() + ".jpg";
      a.click();
      window.URL.revokeObjectURL(url);

      btn_screenshoot.style.display = "block";
      btn_screenshoot_active.style.display = "none";
    })
    .catch((error) => {
      console.error("takePhoto() error: ", error);

      btn_screenshoot.style.display = "block";
      btn_screenshoot_active.style.display = "none";
    });
}

function onScreenshoot() {
  console.log("onScreenshoot new");

  btn_screenshoot = document.getElementById("btn_screenshoot");
  btn_screenshoot.style.display = "none";
  btn_screenshoot_active = document.getElementById("btn_screenshoot_active");
  btn_screenshoot_active.style.display = "block";

  //https://levelup.gitconnected.com/webrtc-capturestream-ios-compatibility-2ba51cdc7207
  const video = document.querySelector("video");
  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  if (!canvas || !video) return;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
  // console.log(canvas);
  const url = canvas.toDataURL();

  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = "screenshot_" + new Date().toLocaleString() + ".jpg";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);

  btn_screenshoot.style.display = "block";
  btn_screenshoot_active.style.display = "none";
}

//
// https://dev.to/ethand91/mediarecorder-api-tutorial-54n8
//
const startRecord = async () => {
  let mimeType = "video/webm;codecs=vp8,opus";

  if (!MediaRecorder.isTypeSupported(mimeType)) {
    // alert("vp8/opus mime type is not supported");

    // return;
    mimeType = "video/mp4";
    fileformat = "mp4";
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
  document.getElementById("btn_start_record").style.display = "none";
  document.getElementById("btn_stop_record").style.display = "block";
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

  // Invisible btn_stop_record
  document.getElementById("btn_start_record").style.display = "block";
  document.getElementById("btn_stop_record").style.display = "none";
};

const saveFile = () => {
  const blob = new Blob(chunks);

  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.style = "display: none";
  link.href = blobUrl;
  if (fileformat == "webm") {
    link.download = "video_" + new Date().toLocaleString() + ".webm";
  } else {
    link.download = "video_" + new Date().toLocaleString() + ".mp4";
  }

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.URL.revokeObjectURL(blobUrl);
  chunks = [];
};

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

// initModeDropdown();

initVideoDropDown();

initResolutionDropdown();

initFramerateDropdown();

initMicDropDown();

initLangDropdown();

// Check if the animation is completed then close it
let lottie_startup = document.getElementById("lottie_startup");
lottie_startup.addEventListener("complete", () => {
  // console.log("You've captured the stop event!");
  lottie_startup.style.visibility = "hidden";
});

var timeout;
document.onmousemove = function () {
  settings_container.style.visibility = "visible";
  controls_container.style.visibility = "visible";
  clearTimeout(timeout);
  timeout = setTimeout(function () {
    // console.log("move your mouse");
    settings_container.style.visibility = "hidden";
    controls_container.style.visibility = "hidden";
  }, 6000);
};
