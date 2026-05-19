/**
 * Initial rows for an empty database (server-only). Not bundled to the SPA.
 */
import type { Hand, Match, Room, RoomStatus, StakeTier } from "../../src/lib/types.ts";
import { STAKE_TIERS } from "../../src/lib/types.ts";

export const SEED_PLAYER = {
  name: "Player_404",
  wallet: "0x71C...8e9A",
  balance: 12_450,
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
  "10コインで遊ぼう！初心者歓迎",
  "夜のじゃんけん部屋",
  "運試し・スピード勝負",
  "週末の真剣勝負ルーム",
  "ランチ代バトル",
  "ガチ勢求む",
  "雑談OKの部屋",
];

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

const FIXED_NOW = 1747200000000;

/** Two sample rooms per stake tier (10 / 20 / 50 / 100 coins). */
export const SEED_ROOMS: Room[] = Array.from({ length: 8 }, (_, i) => {
  const stake = STAKE_TIERS[Math.floor(i / 2)] as StakeTier;
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

function beats(w: Hand): Hand {
  if (w === "rock") return "scissors";
  if (w === "paper") return "rock";
  return "paper";
}

const SEED_GLOBAL_MATCHES: Match[] = Array.from({ length: 30 }, (_, i) => {
  const winner = pick(HOSTS, i, 10);
  let loser = pick(HOSTS, i, 11);
  let salt = 12;
  while (loser === winner) loser = pick(HOSTS, i, salt++);
  const winnerHand = pick(HANDS, i, 20);
  const stake = pick([...STAKE_TIERS], i, 21);
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

const SEED_MY_MATCHES: Match[] = Array.from({ length: 25 }, (_, i) => {
  const won = hash(i, 30) > 0.36;
  const opp = pick(HOSTS, i, 31);
  const stake = pick([...STAKE_TIERS], i, 32);
  const myHand = pick(HANDS, i, 33);
  return {
    id: `my-${i}`,
    roomId: `room-${1000 + (i % 8)}`,
    roomName: pick(ROOM_NAMES, i, 34),
    stake,
    winner: won ? SEED_PLAYER.name : opp,
    loser: won ? opp : SEED_PLAYER.name,
    winnerHand: myHand,
    loserHand: beats(myHand),
    payout: stake * 1.9,
    finishedAt: FIXED_NOW - i * 3600_000,
  };
});

export function allSeedMatches(): Match[] {
  const byId = new Map<string, Match>();
  for (const m of SEED_GLOBAL_MATCHES) byId.set(m.id, m);
  for (const m of SEED_MY_MATCHES) byId.set(m.id, m);
  return [...byId.values()];
}
