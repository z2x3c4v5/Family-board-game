import React, { useState, useEffect, useRef } from 'react';

// --- 데이터 정의 ---
// 가족 구성원 칸: gender(he/she), relation(관계), emoji, adj(묘사 형용사)
// task: 'relation' -> "Who is he/she?" 묻고 답하기
//       'description' -> 한글 힌트를 보고 영어로 묘사하기 (He's tall 등)
const BOARD_DATA = [
  { id: 0, type: 'start', label: 'START' },
  { id: 1, type: 'normal', task: 'relation', gender: 'she', relation: 'mother', emoji: '👩', adj: 'tall' },
  { id: 2, type: 'normal', task: 'description', gender: 'he', relation: 'father', emoji: '👨', adj: 'cute' },
  { id: 3, type: 'normal', task: 'relation', gender: 'she', relation: 'sister', emoji: '👧', adj: 'cute' },
  { id: 4, type: 'normal', task: 'description', gender: 'he', relation: 'brother', emoji: '👦', adj: 'tall' },
  { id: 5, type: 'normal', task: 'relation', gender: 'she', relation: 'grandmother', emoji: '👵', adj: 'cute' },
  { id: 6, type: 'normal', task: 'description', gender: 'he', relation: 'grandfather', emoji: '👴', adj: 'tall' },
  { id: 7, type: 'normal', task: 'description', gender: 'she', relation: 'mother', emoji: '👩', adj: 'cute' },
  { id: 8, type: 'normal', task: 'relation', gender: 'he', relation: 'father', emoji: '👨', adj: 'tall' },
  { id: 9, type: 'normal', task: 'description', gender: 'she', relation: 'sister', emoji: '👧', adj: 'tall' },
  { id: 10, type: 'normal', task: 'relation', gender: 'he', relation: 'brother', emoji: '👦', adj: 'cute' },
  { id: 11, type: 'action', action: 'forward2', label: '앞으로\n2칸 🚀', color: 'bg-green-200 border-green-500' },
  { id: 12, type: 'normal', task: 'description', gender: 'she', relation: 'grandmother', emoji: '👵', adj: 'tall' },
  { id: 13, type: 'normal', task: 'relation', gender: 'he', relation: 'grandfather', emoji: '👴', adj: 'cute' },
  { id: 14, type: 'action', action: 'rest', label: '한 번\n쉬기 💤', color: 'bg-blue-200 border-blue-500' },
  { id: 15, type: 'normal', task: 'relation', gender: 'she', relation: 'mother', emoji: '👩', adj: 'tall' },
  { id: 16, type: 'normal', task: 'description', gender: 'he', relation: 'father', emoji: '👨', adj: 'cute' },
  { id: 17, type: 'normal', task: 'description', gender: 'she', relation: 'sister', emoji: '👧', adj: 'cute' },
  { id: 18, type: 'action', action: 'back2', label: '뒤로\n2칸 🐌', color: 'bg-red-200 border-red-500' },
  { id: 19, type: 'normal', task: 'relation', gender: 'he', relation: 'brother', emoji: '👦', adj: 'tall' },
  { id: 20, type: 'normal', task: 'relation', gender: 'she', relation: 'grandmother', emoji: '👵', adj: 'tall' },
  { id: 21, type: 'normal', task: 'description', gender: 'he', relation: 'grandfather', emoji: '👴', adj: 'cute' },
  { id: 22, type: 'normal', task: 'description', gender: 'she', relation: 'mother', emoji: '👩', adj: 'cute' },
  { id: 23, type: 'normal', task: 'relation', gender: 'he', relation: 'father', emoji: '👨', adj: 'tall' },
  { id: 24, type: 'normal', task: 'description', gender: 'she', relation: 'sister', emoji: '👧', adj: 'tall' },
  { id: 25, type: 'normal', task: 'relation', gender: 'he', relation: 'brother', emoji: '👦', adj: 'cute' },
  { id: 26, type: 'normal', task: 'description', gender: 'she', relation: 'grandmother', emoji: '👵', adj: 'cute' },
  { id: 27, type: 'normal', task: 'relation', gender: 'he', relation: 'grandfather', emoji: '👴', adj: 'tall' },
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

// 칸 종류에 따라 질문/대답 문장을 생성
const buildTask = (cell) => {
  const P = cell.gender === 'he' ? 'He' : 'She';
  const p = cell.gender; // 'he' | 'she'
  if (cell.task === 'relation') {
    return {
      taskType: 'relation',
      question: `Who is ${p}?`,
      answer: `${P}'s my ${cell.relation}.`,
      hintEn: cell.relation,
      hintKo: RELATION_KO[cell.relation]
    };
  }
  // description: 한글 힌트를 보고 영어로 묘사
  return {
    taskType: 'description',
    question: null,
    answer: `${P}'s ${cell.adj}.`,
    hintEn: cell.adj,
    hintKo: ADJ_KO[cell.adj]
  };
};

// 칸 클릭 팝업(읽기/듣기)에 쓸 QUESTION·ANSWER 카드 데이터
const buildCard = (cell) => {
  const P = cell.gender === 'he' ? 'He' : 'She';
  const p = cell.gender;
  if (cell.task === 'relation') {
    return {
      category: '가족 관계',
      question: `Who is ${p}?`,
      answer: `${P}'s my ${cell.relation}.`,
    };
  }
  return {
    category: '가족 묘사',
    question: null, // 묘사 칸은 질문 없이 바로 표현만
    answer: `${P}'s ${cell.adj}.`,
  };
};

// 단어 클릭 시 보여줄 뜻 (소문자/축약형 기준)
const WORD_MEANING = {
  who: '누구',
  what: '무엇',
  is: '~이다',
  like: '어떠한 (~같은)',
  he: '그 (남자)',
  she: '그녀 (여자)',
  "he's": '그는 ~이다',
  "she's": '그녀는 ~이다',
  my: '나의',
  father: '아빠',
  mother: '엄마',
  grandfather: '할아버지',
  grandmother: '할머니',
  brother: '형제 (남자 형제)',
  sister: '자매 (여자 형제)',
  tall: '키가 큰',
  cute: '귀여운',
};

// 쓰기 활동에서 빠짐없이 다뤄야 할 8개 항목
const WRITING_TARGETS = ['father', 'mother', 'grandfather', 'grandmother', 'brother', 'sister', 'tall', 'cute'];

// ===== 음성 인식 정확도 향상 유틸 =====
// 흔한 오인식/발음 변형을 흡수하기 위한 별칭표 (같은 단어의 변형만 등록)
const ALIASES = {
  he: ['he', 'hes', 'heis', 'hed', 'hee', 'heez', 'hez', 'his'],
  she: ['she', 'shes', 'sheis', 'shi', 'shee', 'sheez', 'shez'],
  who: ['who', 'hoo', 'hu', 'whos', 'whois', 'hooz', 'whu'],
  father: ['father', 'farther', 'fodder', 'fadder', 'fadda', 'faather', 'fathers', 'fatha', 'fada', 'fadha', 'fathor', 'fathuh', 'fadher'],
  mother: ['mother', 'mudder', 'mudda', 'mothers', 'motha', 'mader', 'madder', 'mathor', 'mada', 'mathuh', 'mudha'],
  brother: ['brother', 'brudder', 'brudda', 'brothers', 'brotha', 'budder', 'broder', 'brathor', 'bruhdda', 'brudha'],
  sister: ['sister', 'sista', 'sistah', 'sisters', 'cister', 'sistuh', 'seester', 'sesta', 'sistor'],
  grandfather: ['grandfather', 'granfather', 'grandfodder', 'granfodder', 'grandfathers', 'grandfada', 'granfada', 'grandfadda', 'grandfatha'],
  grandmother: ['grandmother', 'granmother', 'grandmudder', 'granmudder', 'grandmothers', 'grandmada', 'granmada', 'grandmadda', 'grandmotha'],
  tall: ['tall', 'tal', 'tahl', 'taul', 'taller', 'taw', 'tawl', 'tol', 'toll', 'tor', 'taal'],
  cute: ['cute', 'coot', 'kyoot', 'cuter', 'kute', 'acute', 'cuteee', 'kyut', 'kewt', 'cued', 'kyute', 'qte'],
};
const RELATIONS = ['father', 'mother', 'brother', 'sister', 'grandfather', 'grandmother'];
const ADJECTIVES = ['tall', 'cute'];

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  let curr = new Array(n + 1).fill(0);
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

function tokenize(str) {
  return str
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

// 단어 하나가 target(또는 그 별칭/근사)인지 판단
function wordSim(token, target) {
  if (token === target) return true;
  const aliases = ALIASES[target];
  if (aliases && aliases.includes(token)) return true;
  const maxd = target.length <= 4 ? 1 : 2;
  return levenshtein(token, target) <= maxd;
}

// 닫힌 후보 집합 중 token이 가장 가까운 단어와 그 거리
function classify(token, set) {
  let best = null;
  let bestd = Infinity;
  for (const c of set) {
    const aliases = ALIASES[c];
    const d = token === c || (aliases && aliases.includes(token)) ? 0 : levenshtein(token, c);
    if (d < bestd) {
      bestd = d;
      best = c;
    }
  }
  return { best, bestd };
}

// 닫힌 집합에서 target으로 분류되는 토큰이 있는지 (혼동/오인식 방지, 엄격)
// - 형용사(tall/cute): 정확히 일치하거나 등록된 별칭만 인정 (거리 0)
// - 짧은 관계어(father 등): 거리 1까지 / 긴 관계어(grandfather): 거리 2까지 + 띄어 읽기 보정
function matchesClosed(tokens, target, set) {
  const isLong = target.length >= 10;
  const thr = set === ADJECTIVES ? 0 : isLong ? 2 : 1;

  for (const tok of tokens) {
    const { best, bestd } = classify(tok, set);
    if (best === target && bestd <= thr) return true;
  }
  // grandfather/grandmother를 "grand father"처럼 띄어 읽은 경우만 인접 토큰을 합쳐 비교
  if (isLong) {
    for (let i = 0; i < tokens.length - 1; i++) {
      const { best, bestd } = classify(tokens[i] + tokens[i + 1], set);
      if (best === target && bestd <= thr) return true;
    }
  }
  return false;
}

// he/she 대명사가 들어있는지 (성별 구분 유지)
function hasPronoun(tokens, gender) {
  for (const t of tokens) {
    const { best, bestd } = classify(t, ['he', 'she']);
    if (best === gender && bestd <= 1) return true;
  }
  return false;
}

// 여러 후보 transcript 중 하나라도 정답이면 true
function matchSpoken(transcripts, task) {
  const gender = task.cell.gender;
  for (const tr of transcripts) {
    const tokens = tokenize(tr);
    if (!tokens.length) continue;
    if (!hasPronoun(tokens, gender)) continue;

    if (task.taskType === 'relation') {
      if (!matchesClosed(tokens, task.cell.relation, RELATIONS)) continue;
      if (task.mode === 'qna' && !tokens.some((t) => wordSim(t, 'who'))) continue;
      return true;
    } else if (matchesClosed(tokens, task.cell.adj, ADJECTIVES)) {
      return true;
    }
  }
  return false;
}

export default function App() {
  const [gameState, setGameState] = useState('lobby');
  const [turn, setTurn] = useState('player');
  const [gameMode, setGameMode] = useState('answerOnly'); // answerOnly | qna (난이도)

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
  const [feedback, setFeedback] = useState('');
  const [aiSpeechText, setAiSpeechText] = useState('');

  // 칸 클릭 팝업 (듣기 / 단어 뜻)
  const [cellPopup, setCellPopup] = useState(null); // 클릭한 칸(cell)
  const [clickedWord, setClickedWord] = useState(null); // 클릭한 단어 { word, meaning }
  const [speakingDone, setSpeakingDone] = useState(false); // 말하기 차례 완료(정답/3회 시도)되어 넘어가는 중

  // 쓰기 활동: 보드 위 8개 칸을 표시하고 클릭하면 질문+답 쓰기
  const [writingMode, setWritingMode] = useState(false);
  const [writingCells, setWritingCells] = useState([]); // 표시할 보드 칸 index 8개
  const [writeCell, setWriteCell] = useState(null); // 쓰기 팝업이 열린 칸
  const [writeRevealed, setWriteRevealed] = useState(false); // 정답 공개 여부

  // --- 마이크 오류 방지 로직 ---
  const recognitionRef = useRef(null);
  const currentTaskRef = useRef(null);
  const isListeningRef = useRef(false);
  const answeredRef = useRef(false); // 한 번 정답 처리되면 중복 처리 방지
  const collectedRef = useRef([]); // 중간 결과 포함 모든 인식 후보 누적
  const attemptsRef = useRef(0); // 현재 문제에서 실패한 시도 횟수

  useEffect(() => {
    currentTaskRef.current = currentTask;
  }, [currentTask]);

  const speakText = (text, rate = 0.8) => {
    if (!text) return;
    // 한글이 들어간 안내 문구는 영어 음성으로 읽으면 이상하므로 읽지 않음
    if (/[가-힣㄰-㆏ᄀ-ᇿ]/.test(text)) return;
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
    setFeedback('');
    attemptsRef.current = 0;
    setSpeakingDone(false);

    const built = buildTask(cell);
    setCurrentTask({ cell, ...built, mode: gameMode });

    if (built.taskType === 'relation') {
      if (gameMode === 'qna') {
        setTimeout(() => speakText('그림을 보고 질문과 대답을 만들어보세요!'), 500);
      } else {
        setTimeout(() => speakText(built.question), 500);
      }
    }
    // description 칸은 한글 힌트만 보여주고 음성 안내는 하지 않습니다.
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
    recognition.interimResults = false; // 최종 결과만 채점 (오인식 누적 방지)
    recognition.maxAlternatives = 3;

    const goToAiTurn = () => {
      setTimeout(() => {
        setGameState('playing');
        setTurn('ai');
      }, 2500);
    };

    const acceptCorrect = () => {
      answeredRef.current = true;
      setSpeakingDone(true);
      setFeedback('Excellent! 정답입니다! 🎉 (AI 턴으로 넘어갑니다)');
      speakText('Excellent!');
      goToAiTurn();
    };

    // 3번 시도해도 안 되면 격려하고 다음으로 넘어가기
    const finishWithEncouragement = () => {
      answeredRef.current = true;
      setSpeakingDone(true);
      setFeedback('3번 모두 도전했어요. 정말 잘했어요! 👏 다음 차례로 넘어가요!');
      speakText('Good job!');
      goToAiTurn();
    };

    recognition.onstart = () => {
      isListeningRef.current = true;
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      // 최종 결과의 후보(transcript)들만 모아서 채점
      const cands = [];
      const res = event.results[0];
      if (res) {
        for (let j = 0; j < res.length; j++) {
          const t = res[j] && res[j].transcript;
          if (t) cands.push(t);
        }
      }
      collectedRef.current = cands;

      if (!answeredRef.current && currentTaskRef.current && matchSpoken(cands, currentTaskRef.current)) {
        acceptCorrect();
        try {
          recognition.stop();
        } catch (e) {
          // 무시
        }
      }
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
      if (answeredRef.current) return;
      // 누적된 모든 후보로 마지막 채점
      if (currentTaskRef.current && matchSpoken(collectedRef.current, currentTaskRef.current)) {
        acceptCorrect();
        return;
      }
      // 실패한 시도로 집계
      attemptsRef.current += 1;
      if (attemptsRef.current >= 3) {
        finishWithEncouragement();
        return;
      }
      setFeedback(`앗, 다시 또박또박 말해볼까요? 🎤 — ${attemptsRef.current}/3번째 시도`);
    };

    recognitionRef.current = recognition;

    try {
      setFeedback('');
      answeredRef.current = false;
      collectedRef.current = [];
      isListeningRef.current = true;
      setIsListening(true);
      recognition.start();
    } catch (e) {
      console.warn('마이크 시작 오류 방어:', e);
      isListeningRef.current = false;
      setIsListening(false);
    }
  };

  const startAiSpeakingTask = (cell) => {
    setGameState('aiSpeaking');
    setAiSpeechText('음... 🤔');

    const built = buildTask(cell);
    setCurrentTask({ cell, ...built });

    const finishTurn = () => {
      setAiSpeechText('AI 차례 끝. 이제 네가 주사위를 굴려서 정답을 말해봐!');
      setTimeout(() => {
        setGameState('playing');
        setTurn('player');
      }, 4000); // 안내 문구를 3초 더 길게 보여줌
    };

    // 질문&대답 모드의 관계 칸일 때만 AI도 질문을 합니다. (대답만 하기 모드는 대답만)
    const asksQuestion = built.taskType === 'relation' && gameMode === 'qna';

    setTimeout(() => {
      if (asksQuestion) {
        setAiSpeechText(`"${built.question}"`);
        speakText(built.question);
        setTimeout(() => {
          setAiSpeechText(`"${built.answer}"`);
          speakText(built.answer);
          setTimeout(finishTurn, 2500);
        }, 2500);
      } else {
        setAiSpeechText(`"${built.answer}"`);
        speakText(built.answer);
        setTimeout(finishTurn, 2500);
      }
    }, 1000);
  };

  const skipSpeaking = () => {
    setGameState('playing');
    setTurn('ai');
  };

  const handleCellClick = (cell) => {
    if (cell.type !== 'normal') return;

    // 쓰기 활동 모드: 표시된 칸만 클릭해 쓰기 팝업 열기
    if (writingMode) {
      if (writingCells.includes(cell.id)) {
        setWriteCell(cell);
        setWriteRevealed(false);
      }
      return;
    }

    if ((gameState !== 'playing' && gameState !== 'lobby') || isMoving || showDicePopup || actionPopup || catchEvent) return;

    setCellPopup(cell);
    setClickedWord(null);
    const card = buildCard(cell);
    const speech = card.question ? `${card.question} ... ${card.answer}` : card.answer;
    setTimeout(() => speakText(speech), 300);
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

  // --- 칸 클릭 팝업 (듣기 / 단어 뜻) ---
  const closeCellPopup = () => {
    setCellPopup(null);
    setClickedWord(null);
  };

  // 단어 클릭: 그 단어만 또박또박 읽어주고 뜻도 보여주기
  const handleWordClick = (word) => {
    const clean = word.toLowerCase().replace(/[^a-z']/g, '');
    if (clean) speakText(clean, 0.75);
    const meaning = WORD_MEANING[clean] || WORD_MEANING[clean.replace(/'s$/, '')] || '뜻 정보 없음';
    setClickedWord({ word: word.replace(/[.?!,]/g, ''), meaning });
  };

  // --- 쓰기 활동 (보드 위 8칸 표시) ---
  // 8개 항목(father~cute)을 각각 무작위 보드 칸에 배치해서 모두 빠짐없이 나오게 함
  const pickWritingCells = () => {
    const groups = {};
    BOARD_DATA.forEach((c, i) => {
      if (c.type !== 'normal') return;
      const key = c.task === 'relation' ? c.relation : c.adj;
      (groups[key] = groups[key] || []).push(i);
    });
    const picked = WRITING_TARGETS
      .map((t) => {
        const arr = groups[t] || [];
        return arr.length ? arr[Math.floor(Math.random() * arr.length)] : undefined;
      })
      .filter((i) => i !== undefined);
    setWritingCells(picked);
  };

  const enterWritingMode = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setCellPopup(null);
    pickWritingCells();
    setWritingMode(true);
  };

  const exitWritingMode = () => {
    setWritingMode(false);
    setWriteCell(null);
    setWriteRevealed(false);
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

        /* 영어 공책(4선) 위에 문장 표시 */
        .eng-line {
          position: relative;
          display: flex;
          flex-wrap: wrap;
          align-items: flex-end;
          gap: 0 0.4rem;
          padding: 1.7rem 0.6rem 0.45rem;
          border-bottom: 3px solid #f87171;   /* 기준선(빨강) */
          line-height: 1.05;
        }
        .eng-line::before {                    /* 맨 윗줄 */
          content: '';
          position: absolute;
          left: 0; right: 0; top: 0.5rem;
          border-top: 2px solid #cbd5e1;
        }
        .eng-line::after {                     /* 가운데 점선 */
          content: '';
          position: absolute;
          left: 0; right: 0; top: 50%;
          border-top: 2px dashed #93c5fd;
        }
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

        <div className="flex flex-col sm:flex-row gap-3 items-center">
          {/* 난이도 토글: 대답만 / 질문&대답 (관계 칸에만 적용) */}
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

          <button onClick={writingMode ? exitWritingMode : enterWritingMode} className={`px-5 py-2 rounded-xl font-bold transition-all active:translate-y-1 whitespace-nowrap text-white ${writingMode ? 'bg-rose-500 hover:bg-rose-400 shadow-[0_4px_0_0_rgba(190,18,60,1)] active:shadow-[0_0px_0_0_rgba(190,18,60,1)]' : 'bg-indigo-500 hover:bg-indigo-400 shadow-[0_4px_0_0_rgba(67,56,202,1)] active:shadow-[0_0px_0_0_rgba(67,56,202,1)]'}`}>
            {writingMode ? '✏️ 쓰기 끝내기' : '✏️ 쓰기 활동'}
          </button>

          <button onClick={resetGame} className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-amber-950 rounded-xl font-bold transition-all shadow-[0_4px_0_0_rgba(180,83,9,1)] active:shadow-[0_0px_0_0_rgba(180,83,9,1)] active:translate-y-1 whitespace-nowrap">
            처음부터 다시 하기
          </button>
        </div>
      </header>

      {gameState === 'lobby' && (
        <div className="w-full max-w-5xl bg-white/95 p-4 rounded-2xl shadow-md mb-4 text-center border-4 border-rose-400 z-10 animate-pulse">
          <h2 className="text-xl md:text-2xl font-black text-rose-700">
            💡 가족 그림을 누르면 <span className="text-blue-600">듣기·단어 뜻</span>을, 위쪽 <span className="text-indigo-600">✏️ 쓰기 활동</span> 탭에서 <span className="text-indigo-600">빈칸 쓰기</span>를 할 수 있어요!
          </h2>
        </div>
      )}

      {writingMode && (
        <div className="w-full max-w-5xl bg-indigo-600/95 text-white p-4 rounded-2xl shadow-[0_4px_0_0_rgba(0,0,0,0.2)] mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 z-10 border-2 border-white">
          <h2 className="text-lg md:text-xl font-black flex items-center gap-2">
            ✏️ 반짝이는 칸을 눌러 질문과 답을 써보세요! <span className="text-indigo-200 text-sm">(cute·tall은 답만)</span>
          </h2>
          <div className="flex gap-2">
            <button onClick={pickWritingCells} className="px-4 py-2 bg-white text-indigo-700 rounded-xl font-bold shadow-[0_3px_0_0_rgba(0,0,0,0.2)] active:translate-y-0.5 active:shadow-none transition-all">🔀 새로 섞기</button>
            <button onClick={exitWritingMode} className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white rounded-xl font-bold shadow-[0_3px_0_0_rgba(190,18,60,1)] active:translate-y-0.5 active:shadow-none transition-all">끝내기</button>
          </div>
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

          const isWritingCell = writingMode && writingCells.includes(idx);
          if (isWritingCell) {
            cellStyle += ' ring-4 ring-indigo-500 animate-pulse !cursor-pointer';
          } else if (writingMode && cell.type === 'normal') {
            cellStyle += ' opacity-40';
          }

          return (
            <div key={idx} className={cellStyle} onClick={() => handleCellClick(cell)}>
              {isWritingCell && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-40 bg-indigo-600 text-white text-xs md:text-sm font-black px-2 py-0.5 rounded-full border-2 border-white shadow-md">
                  ✏️ 쓰기
                </div>
              )}
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
                  {cell.task === 'relation' ? (
                    <div className="text-[10px] md:text-sm font-black text-[#5c3a21] bg-[#f3e3d0] border-2 border-[#d4bca3] px-2 py-0.5 rounded-full shadow-inner mt-1 capitalize leading-none">{cell.relation}</div>
                  ) : (
                    <div className="text-[10px] md:text-sm font-black text-rose-700 bg-rose-100 border-2 border-rose-300 px-2 py-0.5 rounded-full shadow-inner mt-1 leading-none">{ADJ_KO[cell.adj]}</div>
                  )}
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

            {currentTask.taskType === 'description' ? (
              <div className="mb-6 bg-rose-50 p-6 rounded-3xl border-2 border-rose-100 relative">
                <div className="flex justify-center items-center gap-4 mb-4">
                  <span className="text-7xl drop-shadow-md">{currentTask.cell.emoji}</span>
                  <span className="text-2xl md:text-3xl font-black text-rose-600 bg-white px-4 py-2 rounded-xl shadow-sm">{currentTask.hintKo}</span>
                </div>
                <p className="text-rose-500 font-bold mb-2 tracking-wide">📝 한글 힌트를 보고</p>
                <h3 className="text-2xl font-black text-slate-800 leading-snug">
                  이 가족을 <span className="text-rose-600 border-b-4 border-rose-300">영어로 묘사</span>해보세요!
                </h3>
              </div>
            ) : currentTask.mode === 'qna' ? (
              <div className="mb-6 bg-blue-50 p-6 rounded-3xl border-2 border-blue-100 relative">
                <div className="flex justify-center items-center gap-4 mb-4">
                  <span className="text-7xl drop-shadow-md">{currentTask.cell.emoji}</span>
                  <span className="text-2xl md:text-3xl font-black text-blue-600 bg-white px-3 py-2 rounded-xl shadow-sm capitalize">{currentTask.hintEn}</span>
                </div>
                <h3 className="text-2xl font-black text-slate-800 leading-snug">
                  그림에 맞는 <span className="text-blue-600 border-b-4 border-blue-300">질문</span>과 <span className="text-blue-600 border-b-4 border-blue-300">대답</span>을<br />모두 말해보세요!
                </h3>
              </div>
            ) : (
              <div className="mb-6 bg-blue-50 p-6 rounded-3xl border-2 border-blue-100 relative">
                <div className="flex justify-center items-center gap-4 mb-4">
                  <span className="text-7xl drop-shadow-md">{currentTask.cell.emoji}</span>
                  <span className="text-2xl md:text-3xl font-black text-blue-600 bg-white px-3 py-2 rounded-xl shadow-sm capitalize">{currentTask.hintEn}</span>
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
                {currentTask.taskType === 'description'
                  ? '마이크를 누르고 영어로 말해보세요!'
                  : currentTask.mode === 'qna'
                    ? '마이크를 누르고 질문과 대답을 모두 말해보세요!'
                    : '마이크를 누르고 영어로 대답하세요!'}
              </p>

              <button
                onClick={() => speakText(
                  currentTask.taskType === 'relation' && currentTask.mode === 'qna'
                    ? `${currentTask.question} ${currentTask.answer}`
                    : currentTask.answer
                )}
                disabled={isListening}
                className="mb-5 inline-flex items-center gap-2 px-5 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-800 border-2 border-amber-300 rounded-full font-bold shadow-sm transition-all active:translate-y-0.5 disabled:opacity-50"
              >
                🔊 정답 미리 듣기 (따라 말해보세요!)
              </button>

              <button
                onClick={startListening}
                disabled={isListening || speakingDone}
                className={`w-24 h-24 rounded-full text-4xl shadow-[0_8px_0_0_rgba(0,0,0,0.15)] flex items-center justify-center mx-auto transition-all
                  ${isListening ? 'bg-red-500 text-white animate-pulse shadow-none translate-y-2' : speakingDone ? 'bg-gray-300 text-white cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-400 active:shadow-none active:translate-y-2'}`}
              >
                {isListening ? '🎙️' : '🎤'}
              </button>

              {isListening && <p className="text-red-500 font-bold mt-6 animate-pulse">듣고 있어요... 🗣️</p>}

              {feedback && (
                <div className={`mt-4 text-xl font-black py-3 px-4 rounded-xl border-2 ${(feedback.includes('정답') || feedback.includes('잘했')) ? 'text-green-700 bg-green-100 border-green-300' : 'text-rose-600 bg-rose-50 border-rose-200'}`}>
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
                <span className="text-2xl font-black text-slate-500 capitalize">
                  {currentTask.taskType === 'relation' ? currentTask.cell.relation : currentTask.hintKo}
                </span>
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

      {cellPopup && (() => {
        const card = buildCard(cellPopup);
        const words = (text, hoverClass) =>
          text.split(' ').map((word, i) => (
            <button
              key={i}
              onClick={() => handleWordClick(word)}
              className={`px-1.5 py-0.5 rounded-lg font-black text-slate-800 transition-colors ${hoverClass}`}
            >
              {word}
            </button>
          ));

        const meaningLine = clickedWord ? (
          <div className="flex items-center justify-center gap-2 mb-4 bg-indigo-50 border-2 border-indigo-200 rounded-2xl px-4 py-2">
            <span className="text-xl font-black text-indigo-700">{clickedWord.word}</span>
            <span className="text-slate-400 font-black">→</span>
            <span className="text-xl font-black text-rose-600">{clickedWord.meaning}</span>
          </div>
        ) : (
          <p className="text-sm font-bold text-slate-400 mb-4">👆 단어를 누르면 발음과 뜻을 알 수 있어요</p>
        );

        const questionBox = card.question ? (
          <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-4 mb-3 text-left">
            <p className="text-xs font-black text-blue-500 tracking-wide mb-1">QUESTION · 질문</p>
            <div className="text-2xl md:text-3xl tracking-wide flex flex-wrap">
              {words(card.question, 'hover:bg-blue-200')}
            </div>
          </div>
        ) : null;

        return (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[75] p-4 backdrop-blur-sm" onClick={closeCellPopup}>
            <div className="relative bg-white rounded-[2rem] p-6 md:p-8 max-w-md w-full text-center shadow-2xl border-[6px] border-emerald-300" onClick={(e) => e.stopPropagation()}>

              <button
                onClick={closeCellPopup}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-black text-xl flex items-center justify-center transition-colors"
                aria-label="닫기"
              >
                ×
              </button>

              {/* 그림 + 단원 배지 */}
              <div className="flex flex-col items-center gap-2 mb-4">
                <div className="w-28 h-28 flex items-center justify-center bg-emerald-50 rounded-3xl border-2 border-emerald-100 text-7xl drop-shadow-sm">
                  {cellPopup.emoji}
                </div>
                <span className="text-sm font-bold text-emerald-700 bg-emerald-50 border-2 border-emerald-300 rounded-full px-3 py-0.5">
                  {card.category}
                </span>
              </div>

              {questionBox}

              {/* 대답/표현 박스 */}
              <div className="bg-amber-50 border-2 border-amber-100 rounded-2xl p-4 mb-3 text-left">
                <p className="text-xs font-black text-amber-600 tracking-wide mb-1">{card.question ? 'ANSWER · 대답' : '표현 · 문장'}</p>
                <div className="text-2xl md:text-3xl tracking-wide flex flex-wrap">
                  {words(card.answer, 'hover:bg-amber-200')}
                </div>
              </div>

              {meaningLine}

              <button
                onClick={() => speakText(card.question ? `${card.question} ... ${card.answer}` : card.answer)}
                className="w-full py-3 bg-green-500 hover:bg-green-400 text-white rounded-2xl font-black text-lg shadow-[0_4px_0_0_rgba(22,163,74,1)] active:shadow-none active:translate-y-1 transition-all"
              >
                🔊 다시 듣기
              </button>
            </div>
          </div>
        );
      })()}

      {writeCell && (() => {
        const card = buildCard(writeCell);
        const hintKo = writeCell.task === 'relation' ? RELATION_KO[writeCell.relation] : ADJ_KO[writeCell.adj];
        const blank = (w) => <span className={`inline-block border-b-4 border-purple-400 ${w} align-bottom`}>&nbsp;</span>;
        return (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[75] p-4 backdrop-blur-sm" onClick={() => setWriteCell(null)}>
            <div className="relative bg-white rounded-[2rem] p-6 md:p-8 max-w-md w-full text-center shadow-2xl border-[6px] border-indigo-300" onClick={(e) => e.stopPropagation()}>

              <button
                onClick={() => setWriteCell(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-black text-xl flex items-center justify-center transition-colors"
                aria-label="닫기"
              >
                ×
              </button>

              <div className="flex flex-col items-center gap-2 mb-4">
                <div className="w-24 h-24 flex items-center justify-center bg-indigo-50 rounded-3xl border-2 border-indigo-100 text-6xl drop-shadow-sm">
                  {writeCell.emoji}
                </div>
                <span className="text-base font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">{hintKo}</span>
              </div>

              <p className="text-sm font-black text-indigo-600 mb-4">
                📝 영어 공책 줄에 맞춰 빈칸을 채워 써보세요!
              </p>

              <div className="space-y-3 mb-4 text-left">
                {card.question && (
                  <div className="bg-white border-2 border-blue-100 rounded-2xl px-3 pt-2 pb-1">
                    <p className="text-xs font-black text-blue-500 tracking-wide">QUESTION · 질문</p>
                    <div className="eng-line text-2xl md:text-3xl font-black text-slate-700 tracking-wide">
                      <span>Who</span><span>is</span>{blank('w-16')}<span>?</span>
                    </div>
                  </div>
                )}
                <div className="bg-white border-2 border-amber-100 rounded-2xl px-3 pt-2 pb-1">
                  <p className="text-xs font-black text-amber-600 tracking-wide">{card.question ? 'ANSWER · 대답' : 'SENTENCE · 문장'}</p>
                  <div className="eng-line text-2xl md:text-3xl font-black text-slate-700 tracking-wide">
                    {card.question ? (
                      <>
                        {blank('w-14')}<span>'s</span><span>my</span>{blank('w-28')}<span>.</span>
                      </>
                    ) : (
                      <>
                        {blank('w-14')}<span>'s</span>{blank('w-24')}<span>.</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {writeRevealed && (
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl px-3 pt-2 pb-3 mb-4 text-left">
                  <p className="text-xs font-black text-green-600 tracking-wide mb-1">✅ 정답</p>
                  {card.question && (
                    <div className="eng-line text-2xl md:text-3xl font-black text-green-700 tracking-wide">{`Q. ${card.question}`}</div>
                  )}
                  <div className="eng-line text-2xl md:text-3xl font-black text-green-700 tracking-wide">{card.question ? `A. ${card.answer}` : card.answer}</div>
                  <button
                    onClick={() => speakText(card.question ? `${card.question} ... ${card.answer}` : card.answer)}
                    className="mt-3 text-sm font-bold text-indigo-600 bg-white border-2 border-indigo-200 hover:bg-indigo-50 px-4 py-1.5 rounded-full transition-colors"
                  >
                    🔊 들어보기
                  </button>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => speakText(card.question ? `${card.question} ... ${card.answer}` : card.answer)}
                  className="py-3 px-5 bg-blue-500 hover:bg-blue-400 text-white rounded-2xl font-black text-lg shadow-[0_4px_0_0_rgba(29,78,216,1)] active:shadow-none active:translate-y-1 transition-all whitespace-nowrap"
                >
                  🔊 듣기
                </button>
                <button
                  onClick={() => setWriteRevealed((v) => !v)}
                  className={`flex-1 py-3 rounded-2xl font-black text-white text-lg transition-all active:translate-y-1
                    ${writeRevealed ? 'bg-slate-400 hover:bg-slate-300 shadow-[0_4px_0_0_rgba(100,116,139,1)]' : 'bg-green-500 hover:bg-green-400 shadow-[0_4px_0_0_rgba(22,163,74,1)]'} active:shadow-none`}
                >
                  {writeRevealed ? '🙈 가리기' : '✅ 정답 보기'}
                </button>
                <button onClick={() => setWriteCell(null)} className="px-4 py-3 bg-white border-2 border-slate-300 text-slate-500 rounded-2xl font-bold hover:bg-slate-50 transition-all">
                  닫기
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
