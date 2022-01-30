/*
https://github.com/cwilso/volume-meter

The MIT License (MIT)
Copyright (c) 2014 Chris Wilson
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
var audioContext = null;
var meter = null;
var canvasContext = null;
var WIDTH = 1000;
var HEIGHT = 20;
var rafID = null;
var averaging = 0.98;

var imageContainer_talking = null;
var imageContainer_resting = null;
var imageContainer_afk = null;
var afkSwitch = false;
var noneSwitch = false;

window.onload = function () {
  // grab our canvas
  canvasContext = document.getElementById("meter").getContext("2d");

  // set image container
  imageContainer_talking = document.getElementById("image-container-talking");
  imageContainer_resting = document.getElementById("image-container-resting");
  imageContainer_afk = document.getElementById("image-container-afk");
  afkSwitch = document.getElementById("mode-afk-checkbox");
  noneSwitch = document.getElementById("mode-none-checkbox");

  // monkeypatch Web Audio
  window.AudioContext = window.AudioContext || window.webkitAudioContext;

  // grab an audio context
  audioContext = new AudioContext();

  // Attempt to get audio input
  try {
    // monkeypatch getUserMedia
    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia;

    // ask for an audio input
    navigator.getUserMedia(
      {
        audio: {
          mandatory: {
            googEchoCancellation: "false",
            googAutoGainControl: "false",
            googNoiseSuppression: "false",
            googHighpassFilter: "false",
          },
          optional: [],
        },
      },
      gotStream,
      didntGetStream
    );
  } catch (e) {
    alert("getUserMedia threw exception :" + e);
  }
};

function didntGetStream() {
  alert("Stream generation failed.");
}

var mediaStreamSource = null;

function gotStream(stream) {
  // Create an AudioNode from the stream.
  mediaStreamSource = audioContext.createMediaStreamSource(stream);

  // Create a new volume meter and connect it.
  meter = createAudioMeter(audioContext);
  mediaStreamSource.connect(meter);
  meter.averaging = averaging;

  // kick off the visual updating
  drawLoop();
}

function drawLoop(time) {
  // clear the background
  canvasContext.clearRect(0, 0, WIDTH, HEIGHT);

  // check if we're currently clipping
  if (meter.checkClipping()) canvasContext.fillStyle = "#e74c3c";
  else canvasContext.fillStyle = "#2ecc71";

  // draw a bar based on the current volume
  canvasContext.fillRect(0, 0, meter.volume * WIDTH * 1.4, HEIGHT);

  // set up the next visual callback
  rafID = window.requestAnimationFrame(drawLoop);

  //set image path
  if (noneSwitch.checked) {
    if (meter.volume * 100 <= 5) updateImage("resting");
    else updateImage("talking");

    return;
  }

  if (afkSwitch.checked) {
    updateImage("afk");
    return;
  }
}

function updateImage(mode) {
  imageContainer_afk.style.display = mode == "afk" ? "block" : "none";
  imageContainer_resting.style.display = mode == "resting" ? "block" : "none";
  imageContainer_talking.style.display = mode == "talking" ? "block" : "none";
}
