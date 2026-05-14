export type Hand = "rock" | "paper" | "scissors";
export type RoomStatus = "waiting" | "playing" | "finished";

export interface Room {
  id: string;
  name: string;
  host: string;
  maxPlayers: 2 | 3;
  stake: 1 | 5 | 10;
  players: string[];
  status: RoomStatus;
  createdAt: number;
}

export interface Match {
  id: string;
  roomId: string;
  roomName: string;
  stake: number;
  winner: string;
  loser: string;
  winnerHand: Hand;
  loserHand: Hand;
  payout: number;
  finishedAt: number;
}

export const HAND_EMOJI: Record<Hand, string> = {
  rock: "✊",
  paper: "✋",
  scissors: "✌️",
};

export const HAND_JP: Record<Hand, string> = {
  rock: "グー",
  paper: "パー",
  scissors: "チョキ",
};

export const ME = {
  name: "Player_404",
  wallet: "0x71C...8e9A",
  balance: 1245.5,
};

const HOSTS = [
  "CryptoSamurai",
  "JankenKing",
  "Web3Dojo",
  "Tanaka88",
  "GachaGod",
  "Yuki_San",
  "Satoshi_",
  "MochiChain",
  "NekoPunk",
  "Sakura_dev",
];

const ROOM_NAMES = [
  "最強決定戦・本気勢のみ",
  "$1で遊ぼう！初心者歓迎",
  "夜のじゃんけん部屋",
  "運試し・スピード勝負",
  "週末の真剣勝負ルーム",
  "ランチ代バトル",
  "ガチ勢求む",
  "雑談OKの部屋",
];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const MOCK_ROOMS: Room[] = Array.from({ length: 8 }, (_, i) => {
  const max = (rand([2, 2, 3]) as 2 | 3);
  const stake = (rand([1, 1, 5, 5, 10]) as 1 | 5 | 10);
  const playerCount = Math.min(max, Math.floor(Math.random() * max) + 1);
  const status: RoomStatus = playerCount === max ? "playing" : "waiting";
  return {
    id: `room-${1000 + i}`,
    name: ROOM_NAMES[i % ROOM_NAMES.length],
    host: HOSTS[i % HOSTS.length],
    maxPlayers: max,
    stake,
    players: Array.from({ length: playerCount }, (_, j) => (j === 0 ? HOSTS[i % HOSTS.length] : rand(HOSTS))),
    status,
    createdAt: Date.now() - i * 60_000,
  };
});

const HANDS: Hand[] = ["rock", "paper", "scissors"];

export const MOCK_MATCHES: Match[] = Array.from({ length: 30 }, (_, i) => {
  const winner = rand(HOSTS);
  let loser = rand(HOSTS);
  while (loser === winner) loser = rand(HOSTS);
  const winnerHand = rand(HANDS);
  const stake = rand([1, 5, 10]);
  return {
    id: `m-${i}`,
    roomId: `room-${1000 + (i % 8)}`,
    roomName: rand(ROOM_NAMES),
    stake,
    winner,
    loser,
    winnerHand,
    loserHand: beats(winnerHand),
    payout: stake * 1.9,
    finishedAt: Date.now() - i * 90_000,
  };
});

function beats(w: Hand): Hand {
  if (w === "rock") return "scissors";
  if (w === "paper") return "rock";
  return "paper";
}

// My matches for mypage
export const MY_MATCHES: Match[] = Array.from({ length: 25 }, (_, i) => {
  const won = Math.random() > 0.36;
  const opp = rand(HOSTS);
  const stake = rand([1, 5, 10]);
  const myHand = rand(HANDS);
  return {
    id: `my-${i}`,
    roomId: `room-${1000 + (i % 8)}`,
    roomName: rand(ROOM_NAMES),
    stake,
    winner: won ? ME.name : opp,
    loser: won ? opp : ME.name,
    winnerHand: myHand,
    loserHand: beats(myHand),
    payout: stake * 1.9,
    finishedAt: Date.now() - i * 3600_000,
  };
});

export function determineWinner(a: Hand, b: Hand): "a" | "b" | "draw" {
  if (a === b) return "draw";
  if (
    (a === "rock" && b === "scissors") ||
    (a === "paper" && b === "rock") ||
    (a === "scissors" && b === "paper")
  )
    return "a";
  return "b";
}
