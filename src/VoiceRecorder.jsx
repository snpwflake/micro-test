import React, { useState, useRef, useEffect } from 'react';

const VoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);

  const getSupportedMimeType = () => {
    if (MediaRecorder.isTypeSupported('audio/webm')) return 'audio/webm';
    if (MediaRecorder.isTypeSupported('audio/mp4')) return 'audio/mp4';
    return '';
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Your browser doesn't support audio recording.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mimeType = getSupportedMimeType();
      if (mimeType === '') {
        alert('No supported audio format found for your device.');
        return;
      }

      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });

      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setDuration(0);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Microphone access denied or unavailable.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  // Calculate duration once audioURL updates
  useEffect(() => {
    if (audioURL) {
      const audio = audioRef.current;
      audio.src = audioURL;
      console.log(audio)
      audio.addEventListener('loadedmetadata', (event) => {
        setDuration(audio.duration);
      });
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('loadedmetadata', () => {});
      }
    }
  }, [audioURL, setDuration]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div>
      <h2>Voice Recorder (Android & iOS)</h2>
      {!isRecording ? (
        <button onClick={startRecording}>🎤 Start Recording</button>
      ) : (
        <button onClick={stopRecording}>⏹️ Stop Recording</button>
      )}
      {audioURL && (
        <div>
          <h3>Playback:</h3>
          <audio ref={audioRef} controls />
          <p>Duration: {formatDuration(duration)}</p>
          <a href={audioURL} download={`recording.${audioURL.includes('webm') ? 'webm' : 'mp4'}`}>
            Download Recording
          </a>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;