const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

function checkFFmpeg() {
  return new Promise((resolve) => {
    exec('ffmpeg -version', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ FFmpeg not found in PATH');
        console.log('📥 Attempting to download FFmpeg...');
        downloadFFmpeg().then(resolve);
      } else {
        console.log('✅ FFmpeg found and working');
        console.log('Version:', stdout.split('\n')[0]);
        resolve(true);
      }
    });
  });
}

async function downloadFFmpeg() {
  console.log('🔧 FFmpeg Setup Instructions:');
  console.log('');
  console.log('1. Download FFmpeg from: https://ffmpeg.org/download.html');
  console.log('2. For Windows: https://www.gyan.dev/ffmpeg/builds/');
  console.log('3. Extract and add to PATH, or place in project root');
  console.log('4. Alternative: Use chocolatey: choco install ffmpeg');
  console.log('5. Alternative: Use winget: winget install ffmpeg');
  console.log('');
  console.log('🎯 Quick Setup (Windows):');
  console.log('   winget install "FFmpeg (Essentials Build)"');
  console.log('');
  return false;
}

if (require.main === module) {
  checkFFmpeg().then(success => {
    if (success) {
      console.log('🚀 Ready for video transcoding!');
    } else {
      console.log('⚠️  Streaming will work with RTMP indicator only');
    }
    process.exit(success ? 0 : 1);
  });
}

module.exports = { checkFFmpeg };