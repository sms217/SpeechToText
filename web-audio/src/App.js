
import './App.css';
import {useState, useEffect} from 'react';
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const mic = new SpeechRecognition();
mic.continuous = true;
mic.interimResults = true;
mic.lang = 'ja-JP'
function App() {

    const [volume,setVolume]=useState(0);
    const [isListening, setIsListening] = useState(false);
    const [note, setNote] = useState(null);
    const [savedNotes, setSavedNotes] = useState([]);

    const constraints = window.constraints = {
      audio: true,
      video: false
    };

    let meterRefresh = null;

    function handleError(error) {
      console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
    }

    function handleSuccess(stream) {
      // Put variables in global scope to make them available to the
      // browser console.
      window.stream = stream;
      const soundMeter = window.soundMeter = new SoundMeter(window.audioContext);
      soundMeter.connectToSource(stream, function(e) {
        if (e) {
          alert(e);
          return;
        }
        meterRefresh = setInterval(() => {
          setVolume(Math.floor(soundMeter.volume*100))
        }, 100);
      });
    }

    function start() {
      console.log('Requesting local stream');
      setIsListening(prev => !prev);
      if(isListening==true){
        try {
          window.AudioContext = window.AudioContext || window.webkitAudioContext;
          window.audioContext = new AudioContext();
        } catch (e) {
          alert('Web Audio API not supported.');
        }
        
        navigator.mediaDevices
        .getUserMedia(constraints)
        .then(handleSuccess)
        .catch(handleError);
      } else{
        setVolume(0);
      }
    }

    function SoundMeter(context) {
      this.context = context;
      this.volume = 0.0;
      this.script = context.createScriptProcessor(2048, 1, 1);
      const that = this;
      this.script.onaudioprocess = function(event) {
        const input = event.inputBuffer.getChannelData(0);
        let i;
        let sum = 0.0;
        for (i = 0; i < input.length; ++i) {
          sum += input[i] * input[i];
        }
        that.volume = Math.sqrt(sum / input.length);
      };
    }
    
    SoundMeter.prototype.connectToSource = function(stream, callback) {
      console.log('SoundMeter connecting');
      try {
        this.mic = this.context.createMediaStreamSource(stream);
        this.mic.connect(this.script);
        // necessary to make sample run, but should not be.
        this.script.connect(this.context.destination);
        if (typeof callback !== 'undefined') {
          callback(null);
        }
      } catch (e) {
        console.error(e);
        if (typeof callback !== 'undefined') {
          callback(e);
        }
      }
    };
    useEffect(()=>{
      handleListen();
    },[isListening])
  
    function handleListen() {
      if (isListening) {
        mic.start();
        mic.onend = () => {
          console.log('continue..');
          mic.start()
        }
      } else {
        mic.stop()
        mic.onend = () => {
          console.log('Stopped Mic on Click')
        }
      }
      mic.onstart = () => {
        console.log('Mics on');
      }
      mic.onresult = event => {
        const transcirpt = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
        console.log(transcirpt);
        setNote(transcirpt);
        mic.onerror = event =>{
          console.log(event.error)
        }
      }
    }
  
    function handleSaveNote() {
      setSavedNotes([...savedNotes, note]);
      setNote('')
    }

  return (
    <div className="App">
      <button onClick={start}>start/stop</button>
      <p>volume : {volume}</p>
      <div>
      <div>
        <h2>Current Note</h2>
        {isListening ? <span>🎙</span> : <span>🛑</span>}
        <button onClick={handleSaveNote} disabled={!note}>Save Note</button>
        {/* <button onClick={() => setIsListening(prev => !prev)}>Start/Stop</button> */}
        <p>{note}</p>
      </div>
      <div>
        <h2>Notes</h2>
        {savedNotes.map(n => (
          <p key={n}>{n}</p>
        ))}
      </div>
    </div>
    </div>
  );
}

export default App;
