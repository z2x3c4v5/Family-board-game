import React, { useState, useEffect, useRef } from 'react';

// --- 데이터 정의 ---
// 가족 구성원: gender(he/she), relation(관계), emoji, adj(묘사 형용사)
const BOARD_DATA = [
  { id: 0, type: 'start', label: 'START' },
  { id: 1, type: 'normal', gender: 'she', relation: 'mother', emoji: '👩', adj: 'tall' },
  { id: 2, type: 'normal', gender: 'he', relation: 'father', emoji: '👨', adj: 'cute' },
  { id: 3, type: 'normal', gender: 'she', relation: 'sister', emoji: '👧', adj: 'cute' },
  { id: 4, type: 'normal', gender: 'he', relation: 'brother', emoji: '👦', adj: 'tall' },
  { id: 5, type: 'normal', gender: 'she', relation: 'grandmother', emoji: '👵', adj: 'cute' },
  { id: 6, type: 'normal', gender: 'he', relation: 'grandfather', emoji: '👴', adj: 'tall' },
  { id: 7, type: 'normal', gender: 'she', relation: 'mother', emoji: '👩', adj: 'cute' },
  { id: 8, type: 'normal', gender: 'he', relation: 'father', emoji: '👨', adj: 'tall' },
  { id: 9, type: 'normal', gender: 'she', relation: 'sister', emoji: '👧', adj: 'tall' },
  { id: 10, type: 'normal', gender: 'he', relation: 'brother', emoji: '👦', adj: 'cute' },
  { id: 11, type: 'action', action: 'forward2', label: '앞으로\n2칸 🚀', color: 'bg-green-200 border-green-500' },
  { id: 12, type: 'normal', gender: 'she', relation: 'grandmother', emoji: '👵', adj: 'tall' },
  { id: 13, type: 'normal', gender: 'he', relation: 'grandfather', emoji: '👴', adj: 'cute' },
  { id: 14, type: 'action', action: 'rest', label: '한 번\n쉬기 💤', color: 'bg-blue-200 border-blue-500' },
  { id: 15, type: 'normal', gender: 'she', relation: 'mother', emoji: '👩', adj: 'tall' },
  { id: 16, type: 'normal', gender: 'he', relation: 'father', emoji: '👨', adj: 'cute' },
  { id: 17, type: 'normal', gender: 'she', relation: 'sister', emoji: '👧', adj: 'cute' },
  { id: 18, type: 'action', action: 'back2', label: '뒤로\n2칸 🐌', color: 'bg-red-200 border-red-500' },
  { id: 19, type: 'normal', gender: 'he', relation: 'brother', emoji: '👦', adj: 'tall' },
  { id: 20, type: 'normal', gender: 'she', relation: 'grandmother', emoji: '👵', adj: 'tall' },
  { id: 21, type: 'normal', gender: 'he', relation: 'grandfather', emoji: '👴', adj: 'cute' },
  { id: 22, type: 'normal', gender: 'she', relation: 'mother', emoji: '👩', adj: 'cute' },
  { id: 23, type: 'normal', gender: 'he', relation: 'father', emoji: '👨', adj: 'tall' },
  { id: 24, type: 'normal', gender: 'she', relation: 'sister', emoji: '👧', adj: 'tall' },
  { id: 25, type: 'normal', gender: 'he', relation: 'brother', emoji: '👦', adj: 'cute' },
  { id: 26, type: 'normal', gender: 'she', relation: 'grandmother', emoji: '👵', adj: 'cute' },
  { id: 27, type: 'normal', gender: 'he', relation: 'grandfather', emoji: '👴', adj: 'tall' },
  { id: 28, type: 'finish', label: 'FINISH' }
];

// 화면에 보여줄 한글 힌트
const RELATION_KO = {
  father: '아빠', mother: '엄마',
  grandfather: '할아버지', grandmother: '할머니',
  brother: '형제', sister: '자매'
};
const ADJ_KO = { tall: '키가 커요', cute: '귀여워요' };

const RPS_EMOJI = { rock: '✊', paper: '🖐️', scissors: '✌️' };

// 가족 구성원 칸에서 질문/대답 문장을 생성
const buildSentences = (cell, topic) => {
  const P = cell.gender === 'he' ? 'He' : 'She';
  const p = cell.gender; // 'he' | 'she'
  if (topic === 'relation') {
    return {
      question: `Who is ${p}?`,
      answer: `${P}'s my ${cell.relation}.`,
      hint: cell.relation,
      hintKo: RELATION_KO[cell.relation]
    };
  }
  return {
    question: `What is ${p} like?`,
    answer: `${P}'s ${cell.adj}.`,
    hint: cell.adj,
    hintKo: ADJ_KO[cell.adj]
  };
};

export default function App() {
  const [gameState, setGameState] = useState('lobby');
  const [turn, setTurn] = useState('player');
  const [gameMode, setGameMode] = useState('answerOnly'); // answerOnly | qna (난이도)
  const [topic, setTopic] = useState('relation'); // relation | description (주제)

  const [rpsState, setRpsState] = useState('idle');
  const [playerChoice, setPlayerChoice] = useState(null);
  const [aiChoice, setAiChoice] = useState(null);
  const [rpsResult, setRpsResult] = useState('');

  const [playerPos, setPlayerPos] = useState(0);
  const [aiPos, setAiPos] = useState(0);
  const [playerRest, setPlayerRest] = useState(false);
  const [aiRest, setAiRest] = useState(false);
  const [diceResult, setDiceResult] = useState(null);
  const [isMoving, setIsMoving] = useState(false);

  // 3D 주사위 상태
  const [isRollingDice, setIsRollingDice] = useState(false);
  const [showDicePopup, setShowDicePopup] = useState(false);
  const [diceDisplay, setDiceDisplay] = useState(1);
  const [diceTransform, setDiceTransform] = useState('rotateX(0deg) rotateY(0deg)');

  // 팝업 상태
  const [actionPopup, setActionPopup] = useState(null);
  const [catchEvent, setCatchEvent] = useState(null);

  const [currentTask, setCurrentTask] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [feedback, setFeedback] = useState('');
  const [aiSpeechText, setAiSpeechText] = useState('');

  // --- 마이크 오류 방지 로직 ---
  const recognitionRef = useRef(null);
  const currentTaskRef = useRef(null);
  const isListeningRef = useRef(false);

  useEffect(() => {
    currentTaskRef.current = currentTask;
  }, [currentTask]);

  const speakText = (text, rate = 0.8) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = rate;
      window.speechSynthesis.speak(utterance);
    }
  };

  // --- 가위바위보 시뮬레이션 ---
  const handleRPS = (choice) => {
    if (rpsState !== 'idle') return;
    setPlayerChoice(choice);
    setRpsState('animating');

    let counter = 0;
    const choices = ['rock', 'paper', 'scissors'];

    const interval = setInterval(() => {
      setAiChoice(choices[counter % 3]);
      counter++;
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      const finalAiChoice = choices[Math.floor(Math.random() * 3)];
      setAiChoice(finalAiChoice);

      let result = '';
      if (choice === finalAiChoice) result = 'draw';
      else if (
        (choice === 'rock' && finalAiChoice === 'scissors') ||
        (choice === 'paper' && finalAiChoice === 'rock') ||
        (choice === 'scissors' && finalAiChoice === 'paper')
      ) {
        result = 'win';
      } else {
        result = 'lose';
      }

      setRpsResult(result);
      setRpsState('result');

      setTimeout(() => {
        if (result === 'draw') {
          setRpsState('idle');
          setPlayerChoice(null);
          setAiChoice(null);
          setRpsResult('');
        } else {
          setTurn(result === 'win' ? 'player' : 'ai');
          setGameState('playing');
        }
      }, 2000);
    }, 1500);
  };

  // AI 턴 자동 실행
  useEffect(() => {
    if (gameState === 'playing' && turn === 'ai' && !actionPopup && !catchEvent) {
      const timer = setTimeout(() => {
        executeAiTurn();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState, turn, actionPopup, catchEvent]);

  const rollDice = () => Math.floor(Math.random() * 6) + 1;

  const getDiceTransform = (finalDice) => {
    const extraX = 360 * (Math.floor(Math.random() * 2) + 2);
    const extraY = 360 * (Math.floor(Math.random() * 2) + 2);
    let targetX = extraX;
    let targetY = extraY;

    switch (finalDice) {
      case 1: break;
      case 2: targetY -= 90; break;
      case 3: targetY += 180; break;
      case 4: targetY += 90; break;
      case 5: targetX -= 90; break;
      case 6: targetX += 90; break;
    }
    return `rotateX(${targetX}deg) rotateY(${targetY}deg)`;
  };

  const animateMove = (who, currentPos, targetPos) => {
    if (currentPos === targetPos) {
      processCellLanding(targetPos, who);
      return;
    }
    const nextPos = currentPos < targetPos ? currentPos + 1 : currentPos - 1;
    if (who === 'player') setPlayerPos(nextPos);
    else setAiPos(nextPos);

    setTimeout(() => animateMove(who, nextPos, targetPos), 350);
  };

  const startDiceRoll = (who, finalDice, newPos) => {
    setShowDicePopup(true);
    setDiceTransform('rotateX(0deg) rotateY(0deg)');

    setTimeout(() => {
      setIsRollingDice(true);
      setDiceDisplay(finalDice);
      setDiceTransform(getDiceTransform(finalDice));
    }, 50);

    setTimeout(() => {
      setIsRollingDice(false);
      setDiceResult(`🎲 ${who === 'player' ? '나온 숫자' : 'AI 숫자'}: ${finalDice}`);

      setTimeout(() => {
        setShowDicePopup(false);
        animateMove(who, who === 'player' ? playerPos : aiPos, newPos);
      }, 1500);
    }, 1550);
  };

  const handlePlayerTurn = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(''));
    }

    if (playerRest) {
      setPlayerRest(false);
      setTurn('ai');
      return;
    }
    setIsMoving(true);
    const dice = rollDice();
    const newPos = Math.min(playerPos + dice, BOARD_DATA.length - 1);
    startDiceRoll('player', dice, newPos);
  };

  const executeAiTurn = () => {
    if (aiRest) {
      setDiceResult('🤖 AI 쉬는 턴 💤');
      setAiRest(false);
      setTurn('player');
      return;
    }
    setIsMoving(true);
    const dice = rollDice();
    const newPos = Math.min(aiPos + dice, BOARD_DATA.length - 1);
    startDiceRoll('ai', dice, newPos);
  };

  const processCellLanding = (pos, who) => {
    if (pos !== 0 && pos !== BOARD_DATA.length - 1) {
      if (who === 'player' && pos === aiPos) {
        setCatchEvent({ victim: 'ai', who, pos });
        return;
      } else if (who === 'ai' && pos === playerPos) {
        setCatchEvent({ victim: 'player', who, pos });
        return;
      }
    }
    continueCellLanding(pos, who);
  };

  const handleCatchClose = () => {
    const { victim, who, pos } = catchEvent;
    if (victim === 'ai') setAiPos(0);
    if (victim === 'player') setPlayerPos(0);

    setCatchEvent(null);
    continueCellLanding(pos, who);
  };

  const continueCellLanding = (pos, who) => {
    const cell = BOARD_DATA[pos];

    if (cell.type === 'finish') {
      setIsMoving(false);
      setGameState('finished');
      return;
    }

    if (cell.type === 'action') {
      setActionPopup({ action: cell.action, who: who, pos: pos });
      return;
    }

    setIsMoving(false);
    if (who === 'player') {
      startSpeakingTask(cell);
    } else {
      startAiSpeakingTask(cell);
    }
  };

  const handleActionPopupClose = () => {
    const { action, who, pos } = actionPopup;
    setActionPopup(null);

    let finalPos = pos;
    if (action === 'forward2') {
      finalPos = Math.min(pos + 2, BOARD_DATA.length - 1);
      animateMove(who, pos, finalPos);
    } else if (action === 'back2') {
      finalPos = Math.max(pos - 2, 0);
      animateMove(who, pos, finalPos);
    } else if (action === 'rest') {
      if (who === 'player') setPlayerRest(true);
      else setAiRest(true);
      setIsMoving(false);
      setTurn(who === 'player' ? 'ai' : 'player');
    }
  };

  const getActionMessage = () => {
    if (!actionPopup) return null;
    const { action, who } = actionPopup;
    const isMe = who === 'player';

    if (action === 'forward2') {
      return {
        title: isMe ? '우와 신난다! 🚀' : '앗, AI가 빨라요! 🚀',
        desc: isMe ? '앞으로 2칸 더 전진합니다!' : 'AI가 앞으로 2칸 더 이동합니다!',
        color: 'text-green-600 bg-green-50 border-green-400'
      };
    } else if (action === 'back2') {
      return {
        title: isMe ? '앗, 느려졌어요! 🐌' : '휴, 다행이에요! 🐌',
        desc: isMe ? '뒤로 2칸 돌아갑니다 ㅠㅠ' : 'AI가 뒤로 2칸 돌아갑니다!',
        color: 'text-red-500 bg-red-50 border-red-400'
      };
    } else if (action === 'rest') {
      return {
        title: isMe ? '조금 쉬어갈까요? 💤' : 'AI도 피곤해요 💤',
        desc: isMe ? '다음 차례에는 한 번 쉬게 됩니다.' : 'AI가 다음 차례에 한 번 쉽니다.',
        color: 'text-blue-500 bg-blue-50 border-blue-400'
      };
    }
  };

  const startSpeakingTask = (cell) => {
    setGameState('speaking');
    setSpokenText('');
    setFeedback('');

    const { question, answer, hint, hintKo } = buildSentences(cell, topic);

    setCurrentTask({ cell, question, answer, hint, hintKo, topic, mode: gameMode });

    if (gameMode === 'qna') {
      setTimeout(() => speakText('그림을 보고 질문과 대답을 만들어보세요!'), 500);
    } else {
      setTimeout(() => speakText(question), 500);
    }
  };

  const startListening = () => {
    if (isListeningRef.current) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('이 브라우저는 음성 인식을 지원하지 않습니다. Chrome을 사용해주세요.');
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        // 무시
      }
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      isListeningRef.current = true;
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSpokenText(transcript);
      checkAnswerRef(transcript, currentTaskRef.current);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      isListeningRef.current = false;
      setIsListening(false);
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setFeedback('마이크 연결이 불안정합니다. 다시 버튼을 눌러주세요! 🎤');
      }
    };

    recognition.onend = () => {
      isListeningRef.current = false;
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    try {
      setSpokenText('');
      setFeedback('');
      isListeningRef.current = true;
      setIsListening(true);
      recognition.start();
    } catch (e) {
      console.warn('마이크 시작 오류 방어:', e);
      isListeningRef.current = false;
      setIsListening(false);
    }
  };

  const checkAnswerRef = (transcript, task) => {
    if (!task) return;

    const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
    const spoken = normalize(transcript);
    const p = task.cell.gender; // he | she

    let answerVariants;
    let questionVariants;
    let keyword = null;

    if (task.topic === 'relation') {
      const r = task.cell.relation;
      // "He's my father" / "He is my father" / "He's father" 등 허용
      answerVariants = [`${p} is my ${r}`, `${p}s my ${r}`, `${p} my ${r}`, `${p} is ${r}`, `${p}s ${r}`];
      questionVariants = [`who is ${p}`, `whos ${p}`, `who ${p}`];
    } else {
      const a = task.cell.adj;
      answerVariants = [`${p} is ${a}`, `${p}s ${a}`];
      questionVariants = [`what is ${p} like`, `whats ${p} like`, `what ${p} like`, `how is ${p}`, `hows ${p}`];
      keyword = a; // tall/cute 는 겹치지 않으므로 단어만 말해도 정답 처리
    }

    const normArr = (arr) => arr.map(normalize);
    const answerOK =
      normArr(answerVariants).some((v) => spoken.includes(v)) ||
      (keyword && spoken.includes(normalize(keyword)));

    let isCorrect;
    if (task.mode === 'qna') {
      const questionOK = normArr(questionVariants).some((v) => spoken.includes(v));
      isCorrect = questionOK && answerOK;
    } else {
      isCorrect = answerOK;
    }

    if (isCorrect) {
      setFeedback('Excellent! 정답입니다! 🎉 (AI 턴으로 넘어갑니다)');
      speakText('Excellent!');
      setTimeout(() => {
        setGameState('playing');
        setTurn('ai');
      }, 2500);
    } else {
      setFeedback(`앗, 다시 해볼까요? (인식된 말: ${transcript})`);
    }
  };

  const startAiSpeakingTask = (cell) => {
    setGameState('aiSpeaking');
    setAiSpeechText('음... 🤔');

    const { question, answer } = buildSentences(cell, topic);

    setCurrentTask({ cell, question, expectedAnswer: answer });

    setTimeout(() => {
      setAiSpeechText(`"${question}"`);
      speakText(question);

      setTimeout(() => {
        setAiSpeechText(`"${answer}"`);
        speakText(answer);

        setTimeout(() => {
          setAiSpeechText('내 차례 끝!');
          setTimeout(() => {
            setGameState('playing');
            setTurn('player');
          }, 1000);
        }, 2500);
      }, 2500);
    }, 1000);
  };

  const skipSpeaking = () => {
    setGameState('playing');
    setTurn('ai');
  };

  const handleCellClick = (cell) => {
    if (cell.type !== 'normal' || (gameState !== 'playing' && gameState !== 'lobby') || isMoving || showDicePopup || actionPopup || catchEvent) return;

    const { question, answer } = buildSentences(cell, topic);
    speakText(`${question} ... ${answer}`);
  };

  const resetGame = () => {
    setPlayerPos(0);
    setAiPos(0);
    setPlayerRest(false);
    setAiRest(false);
    setRpsState('idle');
    setPlayerChoice(null);
    setAiChoice(null);
    setGameState('lobby');
    setTurn('player');
    setDiceResult(null);
    setShowDicePopup(false);
    setActionPopup(null);
    setCatchEvent(null);
  };

  const handleModeChange = (mode) => {
    setGameMode(mode);
    resetGame();
  };

  const handleTopicChange = (t) => {
    setTopic(t);
    resetGame();
  };

  const renderDots = (num) => {
    const dot = 'w-6 h-6 bg-slate-700 rounded-full shadow-inner';
    const redDot = 'w-8 h-8 bg-red-600 rounded-full shadow-inner';
    switch (num) {
      case 1: return <div className={redDot}></div>;
      case 2: return <div className="w-full h-full p-4 flex flex-col justify-between"><div className={`${dot} self-start`}></div><div className={`${dot} self-end`}></div></div>;
      case 3: return <div className="w-full h-full p-4 flex flex-col justify-between items-center"><div className={`${dot} self-start`}></div><div className={dot}></div><div className={`${dot} self-end`}></div></div>;
      case 4: return <div className="w-full h-full p-4 grid grid-cols-2 grid-rows-2 gap-4 place-items-center"><div className={dot}></div><div className={dot}></div><div className={dot}></div><div className={dot}></div></div>;
      case 5: return <div className="w-full h-full p-4 flex flex-col justify-between"><div className="flex justify-between"><div className={dot}></div><div className={dot}></div></div><div className="flex justify-center"><div className={dot}></div></div><div className="flex justify-between"><div className={dot}></div><div className={dot}></div></div></div>;
      case 6: return <div className="w-full h-full p-4 grid grid-cols-2 grid-rows-3 gap-2 place-items-center"><div className={dot}></div><div className={dot}></div><div className={dot}></div><div className={dot}></div><div className={dot}></div><div className={dot}></div></div>;
      default: return null;
    }
  };

  const appStyle = {
    fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', 'NanumSquareRound', 'Nanum Gothic', sans-serif"
  };

  return (
    <div className="min-h-screen bg-rose-300 text-gray-800 p-4 flex flex-col items-center relative overflow-hidden" style={appStyle}>

      <style>{`
        @import url('https://hangeul.pstatic.net/hangeul_static/css/nanum-square-round.css');

        .perspective-1000 { perspective: 1000px; }
        .cube-container {
          transform-style: preserve-3d;
          width: 100%;
          height: 100%;
          position: absolute;
        }
        .dice-face {
          position: absolute;
          width: 128px;
          height: 128px;
          background: #f8fafc;
          border: 4px solid #cbd5e1;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 0 20px rgba(0,0,0,0.05);
        }
        .face-front  { transform: rotateY(0deg) translateZ(64px); }
        .face-right  { transform: rotateY(90deg) translateZ(64px); }
        .face-back   { transform: rotateY(180deg) translateZ(64px); }
        .face-left   { transform: rotateY(-90deg) translateZ(64px); }
        .face-top    { transform: rotateX(90deg) translateZ(64px); }
        .face-bottom { transform: rotateX(-90deg) translateZ(64px); }
      `}</style>

      {/* 따뜻한 가족 분위기 배경 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-200 via-orange-300 to-rose-400 opacity-90 pointer-events-none"></div>
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 select-none">
        <span className="absolute top-10 left-8 text-5xl">🏠</span>
        <span className="absolute top-24 right-12 text-4xl">❤️</span>
        <span className="absolute bottom-20 left-16 text-4xl">🌷</span>
        <span className="absolute bottom-32 right-20 text-5xl">🧸</span>
        <span className="absolute top-1/2 left-1/3 text-3xl">💕</span>
        <span className="absolute top-1/3 right-1/4 text-4xl">🍰</span>
      </div>

      <header className="w-full max-w-5xl flex flex-col md:flex-row justify-between items-center gap-4 mb-4 bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-[0_4px_0_0_rgba(0,0,0,0.2)] z-10 border-2 border-rose-800">
        <h1 className="text-2xl md:text-3xl font-black text-rose-700 uppercase tracking-wider flex items-center gap-2">
          👨‍👩‍👧‍👦 Family Board Game
        </h1>

        <div className="flex flex-col gap-2 items-stretch sm:items-center">
          <div className="flex flex-col sm:flex-row gap-2 items-center">
            {/* 주제 토글: 관계 / 묘사 */}
            <div className="flex bg-rose-100 p-1 rounded-xl shadow-inner">
              <button
                onClick={() => handleTopicChange('relation')}
                className={`px-4 py-2 rounded-lg font-bold transition-all text-sm md:text-base ${topic === 'relation' ? 'bg-white shadow-sm text-rose-700 border border-rose-300' : 'text-gray-500 hover:text-gray-700'}`}
              >
                가족 관계
              </button>
              <button
                onClick={() => handleTopicChange('description')}
                className={`px-4 py-2 rounded-lg font-bold transition-all text-sm md:text-base ${topic === 'description' ? 'bg-white shadow-sm text-rose-700 border border-rose-300' : 'text-gray-500 hover:text-gray-700'}`}
              >
                가족 묘사
              </button>
            </div>

            {/* 난이도 토글: 대답만 / 질문&대답 */}
            <div className="flex bg-gray-200 p-1 rounded-xl shadow-inner">
              <button
                onClick={() => handleModeChange('answerOnly')}
                className={`px-4 py-2 rounded-lg font-bold transition-all text-sm md:text-base ${gameMode === 'answerOnly' ? 'bg-white shadow-sm text-emerald-800 border border-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
              >
                대답만 하기
              </button>
              <button
                onClick={() => handleModeChange('qna')}
                className={`px-4 py-2 rounded-lg font-bold transition-all text-sm md:text-base ${gameMode === 'qna' ? 'bg-white shadow-sm text-emerald-800 border border-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
              >
                질문&대답 같이
              </button>
            </div>
          </div>

          <button onClick={resetGame} className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-amber-950 rounded-xl font-bold transition-all shadow-[0_4px_0_0_rgba(180,83,9,1)] active:shadow-[0_0px_0_0_rgba(180,83,9,1)] active:translate-y-1 whitespace-nowrap self-center">
            처음부터 다시 하기
          </button>
        </div>
      </header>

      {gameState === 'lobby' && (
        <div className="w-full max-w-5xl bg-white/95 p-4 rounded-2xl shadow-md mb-4 text-center border-4 border-rose-400 z-10 animate-pulse">
          <h2 className="text-xl md:text-2xl font-black text-rose-700">
            {topic === 'relation'
              ? '💡 게임 시작 전, 가족 그림을 클릭하며 "Who is he/she?" 묻고 답하는 연습을 해봅시다.'
              : '💡 게임 시작 전, 가족 그림을 클릭하며 "He\'s tall / She\'s cute" 묘사하는 연습을 해봅시다.'}
          </h2>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="w-full max-w-5xl bg-white/95 p-4 rounded-2xl shadow-[0_4px_0_0_rgba(0,0,0,0.2)] mb-4 flex justify-between items-center border-l-8 border-amber-500 z-10">
          <div className="text-xl font-bold w-1/3 flex items-center gap-2">
            {turn === 'player' ? (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg border-2 border-blue-300 shadow-sm flex items-center gap-2">👦 내 차례</span>
            ) : (
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-lg border-2 border-red-300 shadow-sm flex items-center gap-2 animate-pulse">🤖 AI 차례...</span>
            )}
          </div>

          <div className="w-1/3 flex justify-center">
            {diceResult && !showDicePopup && (
              <div className="text-lg bg-amber-100 text-amber-900 border-2 border-amber-300 px-6 py-2 rounded-xl font-black shadow-sm transition-all">
                {diceResult}
              </div>
            )}
          </div>

          <div className="w-1/3 flex justify-end relative">
            {turn === 'player' && !isMoving && !showDicePopup && !actionPopup && !catchEvent && !playerRest && (
              <div className="absolute -top-10 right-0 md:-top-12 whitespace-nowrap text-xs md:text-sm font-bold text-amber-700 animate-bounce bg-amber-100 px-3 py-1 rounded-full border border-amber-300 shadow-sm z-20">
                내가 주사위 굴리기 버튼을 눌러서 시작해봅시다! 👇
              </div>
            )}
            <button
              onClick={handlePlayerTurn}
              disabled={(turn !== 'player' && !playerRest) || isMoving || showDicePopup || actionPopup || catchEvent}
              className={`px-8 py-3 rounded-2xl font-black text-white text-lg transition-all
                ${playerRest && turn === 'player'
                  ? 'bg-purple-500 hover:bg-purple-400 border-2 border-purple-600 shadow-[0_5px_0_0_rgba(147,51,234,1)] active:shadow-none active:translate-y-1 cursor-pointer animate-pulse'
                  : turn === 'player' && !isMoving && !showDicePopup && !actionPopup && !catchEvent
                    ? 'bg-amber-500 hover:bg-amber-400 border-2 border-amber-600 shadow-[0_5px_0_0_rgba(180,83,9,1)] active:shadow-none active:translate-y-1 cursor-pointer'
                    : 'bg-gray-400 border-2 border-gray-500 shadow-[0_5px_0_0_rgba(107,114,128,1)] cursor-not-allowed opacity-80'}`}
            >
              {playerRest && turn === 'player'
                ? '쿨쿨.. 한 번 쉬기 (턴 넘기기) 💤'
                : (isMoving || showDicePopup || actionPopup || catchEvent ? '기다려주세요...' : '주사위 굴리기')}
            </button>
          </div>
        </div>
      )}

      <div className={`w-full max-w-6xl p-8 md:p-14 rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] flex flex-wrap gap-4 md:gap-5 justify-center relative z-10 border-[16px] border-[#4a2e15] bg-[#e8dcc4] overflow-hidden ${gameState === 'lobby' ? 'mb-24' : ''}`}>

        <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
          <div className="absolute top-1/2 left-0 w-full h-[3px] bg-[#4a2e15]"></div>
          <div className="absolute top-0 left-1/2 w-[3px] h-full bg-[#4a2e15]"></div>
        </div>

        <div className="absolute inset-0 pointer-events-none opacity-[0.04] z-0 bg-[radial-gradient(#000_2px,transparent_2px)] [background-size:20px_20px]"></div>

        {BOARD_DATA.map((cell, idx) => {
          const isPlayerHere = playerPos === idx;
          const isAiHere = aiPos === idx;

          let baseStyle = 'w-20 h-24 md:w-[120px] md:h-[140px] rounded-2xl flex flex-col items-center justify-center relative transform transition-all duration-300 hover:-translate-y-2 z-10 group';
          let cellStyle = '';

          if (cell.type === 'normal') {
            cellStyle = `${baseStyle} bg-[#fdfbf7] border-[3px] border-[#d4bca3] shadow-[0_8px_0_0_#bca38f,0_15px_10px_rgba(0,0,0,0.2)] cursor-pointer hover:border-rose-400 hover:shadow-[0_8px_0_0_#fb7185,0_15px_10px_rgba(0,0,0,0.2)]`;
          } else if (cell.type === 'start') {
            cellStyle = `${baseStyle} bg-gradient-to-b from-amber-200 to-amber-400 border-[3px] border-amber-500 shadow-[0_8px_0_0_#b45309,0_15px_10px_rgba(0,0,0,0.2)]`;
          } else if (cell.type === 'finish') {
            cellStyle = `${baseStyle} bg-gradient-to-b from-rose-400 to-rose-600 border-[3px] border-rose-700 shadow-[0_8px_0_0_#9f1239,0_15px_10px_rgba(0,0,0,0.2)]`;
          } else if (cell.type === 'action') {
            let actionColor = cell.action === 'rest'
              ? 'bg-blue-100 border-blue-300 shadow-[0_8px_0_0_#93c5fd,0_15px_10px_rgba(0,0,0,0.2)]'
              : cell.action === 'forward2'
                ? 'bg-green-100 border-green-300 shadow-[0_8px_0_0_#86efac,0_15px_10px_rgba(0,0,0,0.2)]'
                : 'bg-red-100 border-red-300 shadow-[0_8px_0_0_#fca5a5,0_15px_10px_rgba(0,0,0,0.2)]';
            cellStyle = `${baseStyle} ${actionColor} border-[3px]`;
          }

          return (
            <div key={idx} className={cellStyle} onClick={() => handleCellClick(cell)}>
              <div className="absolute -top-4 -left-2 md:-top-6 md:-left-4 flex gap-1 z-30 w-full px-1">
                {isPlayerHere && (
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-400 to-blue-700 rounded-full border-[3px] border-white shadow-[0_8px_10px_rgba(0,0,0,0.5),inset_0_4px_4px_rgba(255,255,255,0.4)] flex items-center justify-center text-2xl md:text-3xl animate-bounce z-40">
                    👦
                  </div>
                )}
                {isAiHere && (
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-red-400 to-red-700 rounded-full border-[3px] border-white shadow-[0_8px_10px_rgba(0,0,0,0.5),inset_0_4px_4px_rgba(255,255,255,0.4)] flex items-center justify-center text-2xl md:text-3xl transition-transform duration-300 z-30">
                    🤖
                  </div>
                )}
              </div>

              {cell.type === 'normal' && (
                <>
                  <div className="absolute top-2 right-2 text-sm bg-gray-200/50 rounded-full w-6 h-6 flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-rose-100 transition-all">🔊</div>
                  <div className="text-4xl md:text-6xl mb-1 drop-shadow-md transform transition-transform group-hover:scale-110">{cell.emoji}</div>
                  <div className="text-[10px] md:text-sm font-black text-[#5c3a21] bg-[#f3e3d0] border-2 border-[#d4bca3] px-2 py-0.5 rounded-full shadow-inner mt-1 capitalize leading-none">{cell.relation}</div>
                </>
              )}

              {cell.type === 'action' && (
                <div className="text-[11px] md:text-sm font-black text-center whitespace-pre-line p-1 text-slate-700 drop-shadow-sm leading-tight">
                  {cell.label}
                </div>
              )}

              {(cell.type === 'start' || cell.type === 'finish') && (
                <div className="font-black text-xl md:text-2xl text-white tracking-wider drop-shadow-md bg-black/20 px-3 py-1 rounded-lg border border-white/30">
                  {cell.label}
                </div>
              )}

              <div className="absolute -bottom-3 right-2 md:right-3 w-6 h-6 md:w-8 md:h-8 bg-[#5c3a21] text-[#e8dcc4] rounded-full flex items-center justify-center text-[10px] md:text-sm font-black shadow-[0_4px_0_0_rgba(0,0,0,0.3)] border-2 border-[#e8dcc4] z-20">
                {idx}
              </div>
            </div>
          );
        })}
      </div>

      {gameState === 'lobby' && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={() => {
              if ('speechSynthesis' in window) {
                window.speechSynthesis.speak(new SpeechSynthesisUtterance(''));
              }
              setGameState('rps');
            }}
            className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-white rounded-full font-black text-2xl md:text-3xl shadow-[0_8px_0_0_rgba(180,83,9,1)] active:shadow-none active:translate-y-2 transition-all flex items-center gap-3 border-4 border-white animate-bounce"
          >
            🚀 게임 시작하기!
          </button>
        </div>
      )}

      {catchEvent && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]">
          <div className="bg-white rounded-[2rem] p-10 max-w-md w-full text-center shadow-2xl border-8 border-orange-400 transform transition-all scale-100">
            <div className="text-7xl mb-6 animate-bounce">
              {catchEvent.victim === 'ai' ? '😆' : '😱'}
            </div>
            <h2 className="text-3xl font-black mb-4 drop-shadow-sm text-orange-600">
              {catchEvent.victim === 'ai' ? '잡았다!' : '앗, 잡혔다!'}
            </h2>
            <p className="text-xl font-bold text-gray-700 mb-8 whitespace-pre-line">
              {catchEvent.victim === 'ai'
                ? '내가 AI를 잡았어요!\nAI는 출발선으로 돌아갑니다.'
                : 'AI에게 잡히고 말았어요!\n출발선으로 돌아갑니다.'}
            </p>
            <button
              onClick={handleCatchClose}
              className="w-full py-4 text-white bg-orange-500 hover:bg-orange-400 rounded-2xl font-black text-2xl transition-transform active:translate-y-2 border-b-8 border-orange-700"
            >
              알겠어요! 👍
            </button>
          </div>
        </div>
      )}

      {actionPopup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]">
          <div className={`bg-white rounded-[2rem] p-10 max-w-md w-full text-center shadow-2xl border-8 ${getActionMessage()?.color} transform transition-all scale-100`}>
            <div className="text-7xl mb-6 animate-bounce">
              {getActionMessage()?.title.includes('🚀') ? '🚀' : getActionMessage()?.title.includes('🐌') ? '🐌' : '💤'}
            </div>
            <h2 className="text-3xl font-black mb-4 drop-shadow-sm">
              {getActionMessage()?.title}
            </h2>
            <p className="text-xl font-bold text-gray-700 mb-8">
              {getActionMessage()?.desc}
            </p>
            <button
              onClick={handleActionPopupClose}
              className={`w-full py-4 text-white rounded-2xl font-black text-2xl transition-transform active:translate-y-2
                ${actionPopup.action === 'rest' ? 'bg-blue-500 border-b-8 border-blue-700' :
                  actionPopup.action === 'forward2' ? 'bg-green-500 border-b-8 border-green-700' : 'bg-red-500 border-b-8 border-red-700'}`}
            >
              알겠어요! 👍
            </button>
          </div>
        </div>
      )}

      {gameState === 'rps' && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full text-center shadow-2xl border-8 border-rose-400 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>

            {rpsState === 'idle' && (
              <div className="relative z-10">
                <h2 className="text-3xl font-black mb-4 text-rose-700">누가 먼저 할까요?</h2>
                <p className="text-rose-500 font-bold mb-8">가위바위보로 먼저 시작할 사람을 정해요!</p>
                <div className="flex justify-center gap-4">
                  <button onClick={() => handleRPS('scissors')} className="text-5xl hover:scale-110 transition-transform bg-white p-5 rounded-2xl border-4 border-rose-200 shadow-[0_8px_0_0_rgba(253,164,175,1)] active:shadow-none active:translate-y-2">✌️</button>
                  <button onClick={() => handleRPS('rock')} className="text-5xl hover:scale-110 transition-transform bg-white p-5 rounded-2xl border-4 border-rose-200 shadow-[0_8px_0_0_rgba(253,164,175,1)] active:shadow-none active:translate-y-2">✊</button>
                  <button onClick={() => handleRPS('paper')} className="text-5xl hover:scale-110 transition-transform bg-white p-5 rounded-2xl border-4 border-rose-200 shadow-[0_8px_0_0_rgba(253,164,175,1)] active:shadow-none active:translate-y-2">🖐️</button>
                </div>
              </div>
            )}

            {(rpsState === 'animating' || rpsState === 'result') && (
              <div className="flex flex-col items-center relative z-10">
                <h2 className="text-3xl font-black mb-8 text-amber-500 animate-pulse">가위~ 바위~ 보!</h2>

                <div className="flex justify-center items-center gap-6 mb-8 w-full px-4">
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-slate-500 mb-2 font-bold text-lg">👦 나</span>
                    <div className="text-6xl bg-blue-50 w-full py-6 rounded-3xl border-4 border-blue-200 shadow-inner">
                      {RPS_EMOJI[playerChoice]}
                    </div>
                  </div>
                  <div className="text-3xl font-black text-slate-300 italic">VS</div>
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-slate-500 mb-2 font-bold text-lg">🤖 AI</span>
                    <div className="text-6xl bg-red-50 w-full py-6 rounded-3xl border-4 border-red-200 shadow-inner">
                      {aiChoice ? RPS_EMOJI[aiChoice] : '❓'}
                    </div>
                  </div>
                </div>

                {rpsState === 'result' && (
                  <div className="text-2xl font-black mt-4 animate-bounce bg-amber-100 py-3 px-6 rounded-full text-amber-800 border-2 border-amber-300 shadow-lg">
                    {rpsResult === 'draw' ? '앗, 비겼다! 다시! 😅' :
                      rpsResult === 'win' ? '🎉 내가 이겼다! 먼저 시작! 🎉' :
                        '😭 AI 승리! AI가 먼저 시작! 😭'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {showDicePopup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-10 max-w-sm w-full text-center shadow-2xl border-8 border-amber-400 transform transition-all scale-110">
            <h2 className="text-3xl font-black mb-12 text-amber-600 drop-shadow-sm">
              {turn === 'player' ? '👦 내 차례!' : '🤖 AI 차례!'}
            </h2>

            <div className="w-32 h-32 relative perspective-1000 mb-12 mx-auto">
              <div
                className="cube-container"
                style={{
                  transform: diceTransform,
                  transition: isRollingDice ? 'transform 1.5s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none'
                }}
              >
                <div className="dice-face face-front">{renderDots(1)}</div>
                <div className="dice-face face-right">{renderDots(2)}</div>
                <div className="dice-face face-back">{renderDots(3)}</div>
                <div className="dice-face face-left">{renderDots(4)}</div>
                <div className="dice-face face-top">{renderDots(5)}</div>
                <div className="dice-face face-bottom">{renderDots(6)}</div>
              </div>
            </div>

            <div className="h-12 flex items-center justify-center">
              {!isRollingDice && (
                <div className="text-3xl font-black text-emerald-600 animate-pulse bg-emerald-50 px-6 py-2 rounded-full border-2 border-emerald-200 shadow-md">
                  {diceDisplay}칸 이동!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {gameState === 'speaking' && currentTask && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-6 md:p-10 max-w-lg w-full text-center shadow-2xl border-8 border-blue-400">

            {currentTask.mode === 'qna' ? (
              <div className="mb-6 bg-blue-50 p-6 rounded-3xl border-2 border-blue-100 relative">
                <div className="flex justify-center items-center gap-4 mb-4">
                  <span className="text-7xl drop-shadow-md">{currentTask.cell.emoji}</span>
                  <span className="text-2xl md:text-3xl font-black text-blue-600 bg-white px-3 py-2 rounded-xl shadow-sm capitalize">{currentTask.hint}</span>
                </div>
                <h3 className="text-2xl font-black text-slate-800 leading-snug">
                  그림에 맞는 <span className="text-blue-600 border-b-4 border-blue-300">질문</span>과 <span className="text-blue-600 border-b-4 border-blue-300">대답</span>을<br />모두 말해보세요!
                </h3>
              </div>
            ) : (
              <div className="mb-6 bg-blue-50 p-6 rounded-3xl border-2 border-blue-100 relative">
                <div className="flex justify-center items-center gap-4 mb-4">
                  <span className="text-7xl drop-shadow-md">{currentTask.cell.emoji}</span>
                  <span className="text-2xl md:text-3xl font-black text-blue-600 bg-white px-3 py-2 rounded-xl shadow-sm capitalize">{currentTask.hint}</span>
                </div>
                <p className="text-blue-500 font-bold mb-2 uppercase tracking-wide">🤖 AI 친구의 질문:</p>
                <h3 className="text-3xl font-black text-slate-800">"{currentTask.question}"</h3>
                <button onClick={() => speakText(currentTask.question)} className="mt-4 text-sm text-blue-600 bg-white border border-blue-200 hover:bg-blue-100 px-4 py-2 rounded-full transition-colors font-bold shadow-sm">
                  🔊 질문 다시 듣기
                </button>
              </div>
            )}

            <div className="mb-8">
              <p className="text-lg font-bold text-slate-600 mb-4">
                {currentTask.mode === 'qna' ? '마이크를 누르고 질문과 대답을 모두 말해보세요!' : '마이크를 누르고 영어로 대답하세요!'}
              </p>
              <button
                onClick={startListening}
                disabled={isListening || feedback.includes('Excellent')}
                className={`w-24 h-24 rounded-full text-4xl shadow-[0_8px_0_0_rgba(0,0,0,0.15)] flex items-center justify-center mx-auto transition-all
                  ${isListening ? 'bg-red-500 text-white animate-pulse shadow-none translate-y-2' : 'bg-green-500 text-white hover:bg-green-400 active:shadow-none active:translate-y-2'}`}
              >
                {isListening ? '🎙️' : '🎤'}
              </button>

              {isListening && <p className="text-red-500 font-bold mt-6 animate-pulse">듣고 있어요... 🗣️</p>}

              {spokenText && (
                <div className="mt-6 p-4 bg-slate-50 rounded-2xl border-2 border-slate-200">
                  <p className="text-xs text-slate-400 font-bold mb-1 uppercase">내가 한 말</p>
                  <p className="text-xl font-black text-slate-800">"{spokenText}"</p>
                </div>
              )}

              {feedback && (
                <div className={`mt-4 text-xl font-black py-3 px-4 rounded-xl border-2 ${feedback.includes('정답') ? 'text-green-700 bg-green-100 border-green-300' : 'text-rose-600 bg-rose-50 border-rose-200'}`}>
                  {feedback}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-slate-300 font-bold">💬 정답 예시: {currentTask.answer}</span>
              <button onClick={skipSpeaking} className="text-slate-400 text-sm font-bold hover:text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                PASS (선생님용)
              </button>
            </div>
          </div>
        </div>
      )}

      {gameState === 'aiSpeaking' && currentTask && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-6 md:p-10 max-w-lg w-full text-center shadow-2xl border-8 border-red-400">

            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 bg-red-100 rounded-full border-4 border-red-500 flex items-center justify-center text-6xl mb-4 shadow-lg animate-bounce">
                🤖
              </div>
              <h2 className="text-2xl font-black text-red-600 uppercase tracking-widest">🤖 AI의 차례입니다!</h2>
            </div>

            <div className="mb-6 bg-slate-50 p-6 rounded-3xl border-2 border-slate-200 relative">
              <div className="flex justify-center items-center gap-4 mb-6 opacity-60">
                <span className="text-5xl">{currentTask.cell.emoji}</span>
                <span className="text-2xl font-black text-slate-500 capitalize">{currentTask.cell.relation}</span>
              </div>

              <div className="bg-white p-6 rounded-2xl border-2 border-red-200 shadow-md relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-t-2 border-l-2 border-red-200 rotate-45"></div>
                <p className="text-3xl font-black text-slate-800 transition-all duration-300">
                  {aiSpeechText}
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      {gameState === 'finished' && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-10 max-w-md w-full text-center shadow-2xl border-8 border-amber-400">
            <div className="text-8xl mb-6 animate-bounce">🏆</div>
            <h2 className="text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-rose-500">
              {playerPos >= BOARD_DATA.length - 1 ? '나의 승리!' : 'AI의 승리!'}
            </h2>
            <p className="text-lg font-bold text-slate-500 mb-8">정말 멋진 게임이었어요!</p>
            <button onClick={resetGame} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-white rounded-2xl font-black text-2xl transition-transform border-b-8 border-amber-600 active:border-b-0 active:translate-y-2">
              다시 게임하기 🔄
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
