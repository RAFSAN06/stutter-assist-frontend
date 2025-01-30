import React, { useState, useRef } from 'react';
import { Button, Box, Typography } from '@mui/material';
import axios from 'axios';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [processedAudio, setProcessedAudio] = useState(null);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    mediaRecorder.current.ondataavailable = (e) => {
      audioChunks.current.push(e.data);
    };
    mediaRecorder.current.start();
    setIsRecording(true);
  };

  const stopRecording = async () => {
    mediaRecorder.current.stop();
    mediaRecorder.current.onstop = async () => {
      const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
      const formData = new FormData();
      formData.append('audio', audioBlob);

      try {
        const response = await axios.post(
          'https://stutter-assist-backend-production.up.railway.app/process',
          formData
        );
        const audioUrl = URL.createObjectURL(new Blob([response.data], { type: 'audio/wav' }));
        setProcessedAudio(audioUrl);
      } catch (error) {
        console.error('Error:', error);
      }
    };
    setIsRecording(false);
    audioChunks.current = [];
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4">Stutter Assist</Typography>
      <Button
        variant="contained"
        color={isRecording ? 'error' : 'primary'}
        onClick={isRecording ? stopRecording : startRecording}
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </Button>
      {processedAudio && <audio controls src={processedAudio} style={{ marginTop: '20px' }} />}
    </Box>
  );
}

export default App;