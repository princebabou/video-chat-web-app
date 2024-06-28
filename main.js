
const APP_ID = "479f64a115cc4e6da6b4f4fb70f54d72";
const TOKEN =
  "007eJxTYNiyN0d8x+OWnIDG9uDC+xX6LPFfzIL3rnH0LvOUknreuEqBwcTcMs3MJNHQ0DQ52STVLCXRLMkkzSQtydwgzdQkxdyoejtvWkMgI0P7fQ4WRgYIBPFZGHITM/MYGAAiIR6b";
const CHANNEL = "main";
const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
let localTracks = [];
let remoteUsers = {};

let joinAndDisplayLocalStream = async () => {
  try {
    client.on("user-published", handleUserJoined);
    client.on("user-left", handleUserLeft);
    let UID = await client.join(APP_ID, CHANNEL, TOKEN, null);
    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();

    let player = `<div class="video-container" id="user-container-${UID}">
                        <div class="video-player id="user-${UID}"></div>
                      </div>`;
    document
      .getElementById("video-streams")
      .insertAdjacentHTML("beforeend", player);
    localTracks[1].play(`user-${UID}`);

    await client.publish([localTracks[0], localTracks[1]]);
  } catch (error) {
    console.log("Error joining or publishing stream:", error);
    // Handle error, maybe display a message to the user
  }
};

let joinStream = async () => {
  await joinAndDisplayLocalStream();
  document.getElementById("join-btn").style.display = "none";
  document.getElementById("stream-controls").style.display = "flex";
};

let handleUserJoined = async (user, mediaType) => {
  try {
    remoteUsers[user.UID] = user;
    await client.subscribe(user, mediaType);

    if (mediaType === "video") {
      let player = document.getElementById(`user-container-${user.UID}`);
      if (player != null) {
        player.remove();
      }

      player = `<div class= video-container" id= "user-container-${user.UID}">
          <div class="video-player id= user-${user.UID}"></div>
          </div>`;

      document
        .getElementById("video-streams")
        .insertAdjacentHTML("beforeend", player);
      user.videoTrack.play(`user-${user.UID}`);
    }

    if (mediaType === "audio") {
      user.audioTrack.play();
    }
  } catch (error) {
    console.error("Error joining or publishing stream:", error);
  }
};

let handleUserLeft = async () => {
  try {
    delete remoteUsers[user.UID];
    document.getElementById(`user-container-${user.UID}`).remove();
  } catch (error) {
    console.log("error");
  }
};

let leaveAndRemoveLocalStream = async () => {
  try {
    for (let i = 0; localTracks.length > i; i++) {
      localTracks[i].stop();
      localTracks[i].close();
    }
    await client.leave();
    document.getElementById("join-btn").style.display = "block";
    document.getElementById("stream-controls").style.display = "none";
    document.getElementById("video-streams").innerHTML = "";
  } catch (error) {
    console.log("error");
  }
};

let toggleMic = async (e) => {
  if (localTracks[0].muted) {
    await localTracks[1].setMuted(false);
    e.target.innerText = "Mic on";
    e.target.style.backgroundColor = "blue";
  } else {
    await localTracks[0].setMuted(true);
    e.target.innerText = "mic off";
    e.target.style.backgroundColor = "green";
  }
};

let toggleCamera = async (e) => {
  if (localTracks[1].muted) {
    await localTracks[1].setMuted(false);
    e.target.innerText = "camera on";
    e.target.style.backgroundColor = "blue";
  } else {
    await localTracks[1].setMuted(true);
    e.target.innerText = "camera off";
    e.target.style.backgroundColor = "green";
  }
};


const leavebtn = document.getElementById('leave-btn');
const micbtn = document.getElementById('mic-btn');
const camerabtn = document.getElementById('camera-btn');
const joinbtn = document.getElementById("join-btn");

joinbtn.addEventListener("click", joinStream);
leavebtn.addEventListener('click' , leaveAndRemoveLocalStream);
micbtn.addEventListener('click', toggleMic);
camerabtn.addEventListener('click', toggleCamera);
