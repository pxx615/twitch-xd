navigator.mediaDevices
  .getUserMedia({
    audio: true,
    video: true,
  })
  .then(function (stream) {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);

    analyser.smoothingTimeConstant = 0.8;
    analyser.fftSize = 1024;

    microphone.connect(analyser);
    analyser.connect(scriptProcessor);
    scriptProcessor.connect(audioContext.destination);
    scriptProcessor.onaudioprocess = function () {
      const array = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(array);
      const arraySum = array.reduce((a, value) => a + value, 0);
      const average = arraySum / array.length;
      colorPids(average);

      //average
      console.log(Math.round(average));
    };
  })
  .catch(function (err) {
    console.error(err);
  });

function colorPids(vol) {
  const allPids = [...document.querySelectorAll(".pid")];
  const numberOfPidsToColor = Math.round(vol / 10);
  const pidsToColor = allPids.slice(0, numberOfPidsToColor);
  for (const pid of allPids) {
    pid.style.backgroundColor = "#e6e7e8";
  }
  for (const pid of pidsToColor) {
    pid.style.backgroundColor = "#69ce2b";
  }
}
