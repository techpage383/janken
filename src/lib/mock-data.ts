export type Hand = "rock" | "paper" | "scissors";
export type RoomStatus = "waiting" | "playing" | "finished";

export interface Room {
  id: string;
  name: string;
  host: string;
  maxPlayers: 2;
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

// Pure per-index hash so SSR & client produce identical mock data (no shared state).
function hash(n: number, salt = 0): number {
  let x = (n + 1) * 2654435761 + salt * 0x9e3779b1;
  x = (x ^ (x >>> 16)) >>> 0;
  x = Math.imul(x, 0x85ebca6b) >>> 0;
  x = (x ^ (x >>> 13)) >>> 0;
  x = Math.imul(x, 0xc2b2ae35) >>> 0;
  x = (x ^ (x >>> 16)) >>> 0;
  return x / 0xffffffff;
}
function pick<T>(arr: T[], n: number, salt = 0): T {
  return arr[Math.floor(hash(n, salt) * arr.length)];
}

const FIXED_NOW = 1747200000000; // stable timestamp for SSR/client parity
export const MOCK_ROOMS: Room[] = Array.from({ length: 8 }, (_, i) => {
  const stake = pick<1 | 5 | 10>([1, 1, 5, 5, 10], i, 2);
  const playerCount = Math.min(2, Math.floor(hash(i, 3) * 2) + 1);
  const status: RoomStatus = playerCount === 2 ? "playing" : "waiting";
  return {
    id: `room-${1000 + i}`,
    name: ROOM_NAMES[i % ROOM_NAMES.length],
    host: HOSTS[i % HOSTS.length],
    maxPlayers: 2,
    stake,
    players: Array.from({ length: playerCount }, (_, j) =>
      j === 0 ? HOSTS[i % HOSTS.length] : pick(HOSTS, i * 10 + j, 4),
    ),
    status,
    createdAt: FIXED_NOW - i * 60_000,
  };
});

const HANDS: Hand[] = ["rock", "paper", "scissors"];

export const MOCK_MATCHES: Match[] = Array.from({ length: 30 }, (_, i) => {
  const winner = pick(HOSTS, i, 10);
  let loser = pick(HOSTS, i, 11);
  let salt = 12;
  while (loser === winner) loser = pick(HOSTS, i, salt++);
  const winnerHand = pick(HANDS, i, 20);
  const stake = pick([1, 5, 10], i, 21);
  return {
    id: `m-${i}`,
    roomId: `room-${1000 + (i % 8)}`,
    roomName: pick(ROOM_NAMES, i, 22),
    stake,
    winner,
    loser,
    winnerHand,
    loserHand: beats(winnerHand),
    payout: stake * 1.9,
    finishedAt: FIXED_NOW - i * 90_000,
  };
});

function beats(w: Hand): Hand {
  if (w === "rock") return "scissors";
  if (w === "paper") return "rock";
  return "paper";
}

// My matches for mypage
export const MY_MATCHES: Match[] = Array.from({ length: 25 }, (_, i) => {
  const won = hash(i, 30) > 0.36;
  const opp = pick(HOSTS, i, 31);
  const stake = pick([1, 5, 10], i, 32);
  const myHand = pick(HANDS, i, 33);
  return {
    id: `my-${i}`,
    roomId: `room-${1000 + (i % 8)}`,
    roomName: pick(ROOM_NAMES, i, 34),
    stake,
    winner: won ? ME.name : opp,
    loser: won ? opp : ME.name,
    winnerHand: myHand,
    loserHand: beats(myHand),
    payout: stake * 1.9,
    finishedAt: FIXED_NOW - i * 3600_000,
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
