// Each object = a single video file config
// `order` = playback order step
// If multiple share the same `order`, they are alternates (one chosen randomly)
// After all orders are played, jump to any `order: "HOLD"` video randomly

const videoConfig = [
  // Order 1 — always bg1
  {
    file: "bg1.webm",
    order: 1,
    speed: 1.2,
    startTime: 0,
    repeat: 0,
    loopStart: null,
  },

  // Order 2 — alternates
  {
    file: "bg2-1.webm",
    order: 2,
    speed: 1.0,
    startTime: 0,
    repeat: 0,
    loopStart: null,
  },
  {
    file: "bg2-2.webm",
    order: 2,
    speed: 1.0,
    startTime: 0,
    repeat: 0,
    loopStart: null,
  },

  // Order 3 — single
  {
    file: "bg3.webm",
    order: 3,
    speed: 1.0,
    startTime: 0,
    repeat: 0,
    loopStart: null,
  },

  // Order 4 — alternates
  {
    file: "bg4-1.webm",
    order: 4,
    speed: 1.0,
    startTime: 0,
    repeat: 0,
    loopStart: null,
  },
  {
    file: "bg4-2.webm",
    order: 4,
    speed: 1.0,
    startTime: 0,
    repeat: 0,
    loopStart: null,
  },

  // HOLD videos (after sequence is done)
  {
    file: "bgH-1.webm",
    order: "HOLD",
    speed: 1.0,
    startTime: 0,
    repeat: 0,
    loopStart: null,
  },
  {
    file: "bgH-2.webm",
    order: "HOLD",
    speed: 1.0,
    startTime: 0,
    repeat: 0,
    loopStart: null,
  },
  {
    file: "bgH-3.webm",
    order: "HOLD",
    speed: 1.0,
    startTime: 0,
    repeat: 0,
    loopStart: null,
  },
];

export default videoConfig;
