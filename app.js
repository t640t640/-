const passage = document.getElementById('passage').textContent;
const resultDiv = document.getElementById('result');
const startButton = document.getElementById('start');

const recognition = new webkitSpeechRecognition();
recognition.lang = 'zh-TW'; // 設置為中文
recognition.continuous = true;
recognition.interimResults = true;

let finalTranscript = '';
let startTime;

recognition.onresult = (event) => {
  let interimTranscript = '';
  for (let i = event.resultIndex; i < event.results.length; i++) {
    const transcript = event.results[i][0].transcript;
    if (event.results[i].isFinal) {
      finalTranscript += transcript;
    } else {
      interimTranscript = transcript;
    }
  }

  const similarity = calculateSimilarity(finalTranscript.trim(), passage.trim());
  const errorCount = editDistance(finalTranscript.trim(), passage.trim());
  const totalChars = passage.trim().length;
  const correctRate = ((totalChars - errorCount) / totalChars * 100).toFixed(2);

  if (interimTranscript) {
    resultDiv.textContent = `正在朗讀中...`;
  } else {
    const endTime = new Date().getTime();
    const duration = (endTime - startTime) / 1000 / 60; // 持續時間（分鐘）
    const charsPerMinute = Math.round(totalChars / duration);
    resultDiv.innerHTML = `
      <p>正確率: ${correctRate}%</p>
      <p>錯誤字數: ${errorCount}</p>
      <p>每分鐘平均字數: ${charsPerMinute}</p>
    `;
  }
};

recognition.onend = () => {
  console.log('Speech recognition ended');
};

startButton.addEventListener('click', () => {
  recognition.start();
  finalTranscript = '';
  startTime = new Date().getTime();
  resultDiv.textContent = '正在收聽中...';
});

function calculateSimilarity(str1, str2) {
  const longerLength = Math.max(str1.length, str2.length);
  if (longerLength === 0) {
    return 1;
  }
  return (longerLength - editDistance(str1, str2)) / longerLength;
}

function editDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) {
    dp[i][0] = i;
  }

  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}