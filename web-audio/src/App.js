import "./App.css";
import { useState, useEffect } from "react";

const App = () => {
  const [v, setV] = useState();
  const [point, setPoint] = useState(0);
  let volumeCallback = null;

  navigator.mediaDevices
    .getUserMedia({
      audio: true,
    })
    .then(function (stream) {
      const audioContext = new AudioContext();
      const audioSource = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      analyser.minDecibels = -127;
      analyser.maxDecibels = 0;
      analyser.smoothingTimeConstant = 0;
      audioSource.connect(analyser);
      const volumes = new Uint8Array(analyser.frequencyBinCount);

      volumeCallback = () => {
        analyser.getByteFrequencyData(volumes);
        let volumeSum = 0;
        for (const volume of volumes) volumeSum += volume;
        const averageVolume = volumeSum / volumes.length;
        let currentVolume = Math.floor((averageVolume * 100) / 127);
        setV(currentVolume);
        if(currentVolume!=0)console.log(currentVolume);
        if (currentVolume > 50 && v!=0) {
          setPoint(point => point + 1);
        }
      };
      setInterval(volumeCallback, 5000);
    });

  return (
    <div>
      {v}
      <br></br>
      현재점수 : {point}
    </div>
  );
};
export default App;
