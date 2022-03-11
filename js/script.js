const canvas = document.getElementById("tetris");
const ctx = canvas.getContext("2d");
ctx.scale(20, 20);

let audio = document.getElementById("tetrismusic");
let audioDefeat = document.getElementById("defeat");
let audioVictory = document.getElementById("victory");

audio.addEventListener(
  "ended",
  function () {
    this.currentTime = 0;
    this.play();
  },
  false
);

audio.volume = 0.35;
audio.play();

function create_game_environment(w, h) {
  const game_environment = [];
  while (h--) {
    game_environment.push(new Array(w).fill(0));
  }
  return game_environment;
}

function update_score() {
  document.getElementById("score").innerText = "Score: " + player.score;
}

function version_game() {
  document.getElementById("version").innerText = "Version: 2.0";
}

function lines_sweep() {
  let row_score_count = 2;
  outer: for (let y = arena.length - 1; y > 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) {
        continue outer;
      }
    }
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    ++y;
    player.score += row_score_count * 50;
  }
}

function collision(arena, player) {
  const [p, o] = [player.pieces, player.pos];
  for (let y = 0; y < p.length; ++y) {
    for (let x = 0; x < p[y].length; ++x) {
      if (p[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

const pieces_colors = [
  null,
  "A001F1",
  "0100F1",
  "F00001",
  "F8E608",
  "02F102",
  "EF8201",
  "01F1F2",
];

function initialize_game() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  draw_pieces(arena, { x: 0, y: 0 });
  draw_pieces(player.pieces, player.pos);
}

function create_pieces(type) {
  if (type === "T") {
    return [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0],
    ];
  } else if (type === "J") {
    return [
      [0, 2, 0],
      [0, 2, 0],
      [2, 2, 0],
    ];
  } else if (type === "Z") {
    return [
      [3, 3, 0],
      [0, 3, 3],
      [0, 0, 0],
    ];
  } else if (type === "O") {
    return [
      [4, 4],
      [4, 4],
    ];
  } else if (type === "S") {
    return [
      [0, 5, 5],
      [5, 5, 0],
      [0, 0, 0],
    ];
  } else if (type === "L") {
    return [
      [0, 6, 0],
      [0, 6, 0],
      [0, 6, 6],
    ];
  } else if (type === "I") {
    return [
      [0, 7, 0, 0],
      [0, 7, 0, 0],
      [0, 7, 0, 0],
      [0, 7, 0, 0],
    ];
  }
}

function draw_pieces(pieces, offset) {
  pieces.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        ctx.fillStyle = `#${pieces_colors[value]}`;
        ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function rotate_pieces(pieces, direction) {
  for (let y = 0; y < pieces.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [pieces[x][y], pieces[y][x]] = [pieces[y][x], pieces[x][y]];
    }
  }
  if (direction > 0) {
    pieces.forEach((row) => row.reverse());
  } else {
    pieces.reverse();
  }
}

function rotate_player(direction) {
  let original_position = player.pos.x;
  let offset = 1;
  rotate_pieces(player.pieces, direction);
  while (collision(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.pieces[0].length) {
      rotate_pieces(player.pieces, -dir);
      player.pos.x = position;
      return;
    }
  }
}

function player_random_piece() {
  const pieces = "TJZOSLI";
  player.pieces = create_pieces(pieces[(pieces.length * Math.random()) | 0]);
  player.pos.y = 0;
  player.pos.x =
    ((arena[0].length / 2) | 0) - ((player.pieces[0].length / 2) | 0);
  if (collision(arena, player)) {
    arena.forEach((row) => row.fill(0));
    audioDefeat.muted = false;
    audio.muted = true;
    audioDefeat.play();
    alert("Vous avez perdu ! Retentez votre chance tout de suite !");
    player.score = 0;
    update_score();
    audio.muted = false;
    audioDefeat.muted = true;
  }
}

function player_movement(direction) {
  player.pos.x += direction;
  if (collision(arena, player)) {
    player.pos.x -= direction;
  }
}

function player_drop() {
  player.pos.y++;
  if (collision(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    player_random_piece();
    lines_sweep();
    update_score();
  }
  drop_counter = 0;
}

function merge(arena, player) {
  player.pieces.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

let drop_counter = 0;
let drop_interval = 1000;
let previous_time = 0;

function update_game(time = 0) {
  const drop_time = time - previous_time;
  previous_time = time;
  drop_counter += drop_time;

  if (drop_counter > drop_interval) {
    player_drop();
  }

  if (player.score === 100) {
    drop_interval = 960;
  } else if (player.score === 200) {
    drop_interval = 920;
  } else if (player.score === 300) {
    drop_interval = 880;
  } else if (player.score === 400) {
    drop_interval = 820;
  } else if (player.score === 500) {
    audio.playbackRate = 1.2;
    drop_interval = 780;
  } else if (player.score === 600) {
    drop_interval = 740;
  } else if (player.score === 700) {
    drop_interval = 700;
  } else if (player.score === 800) {
    drop_interval = 660;
  } else if (player.score === 900) {
    drop_interval = 620;
  } else if (player.score === 1000) {
    audio.playbackRate = 1.4;
    drop_interval = 580;
  } else if (player.score === 1100) {
    drop_interval = 540;
  } else if (player.score === 1200) {
    drop_interval = 500;
  } else if (player.score === 1300) {
    drop_interval = 460;
  } else if (player.score === 1400) {
    drop_interval = 420;
  } else if (player.score === 1500) {
    audio.playbackRate = 1.6;
    drop_interval = 380;
  } else if (player.score === 1600) {
    drop_interval = 340;
  } else if (player.score === 1700) {
    drop_interval = 300;
  } else if (player.score === 1800) {
    drop_interval = 260;
  } else if (player.score === 1900) {
    drop_interval = 220;
  } else if (player.score === 2000) {
    audio.playbackRate = 1.8;
    drop_interval = 180;
  } else if (player.score === 2100) {
    drop_interval = 160;
  } else if (player.score === 2200) {
    drop_interval = 140;
  } else if (player.score === 2300) {
    drop_interval = 120;
  } else if (player.score === 2400) {
    drop_interval = 100;
  }

  if (player.score === 2500) {
    arena.forEach((row) => row.fill(0));
    audioVictory.muted = false;
    audio.muted = true;
    audioVictory.play();
    alert("Vous avez gagné !");
    player.score = 0;
    update_score();
    audio.muted = false;
    audioVictory.muted = false;
  }

  initialize_game();
  requestAnimationFrame(update_game);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    player_movement(-1);
  } else if (event.key === "ArrowRight") {
    player_movement(1);
  } else if (event.key === "ArrowDown") {
    player_drop();
  } else if (event.key === "a") {
    rotate_player(1);
  } else if (event.key === "e") {
    rotate_player(-1);
  }
});

const arena = create_game_environment(18, 26);

const player = {
  pos: { x: 0, y: 0 },
  pieces: null,
  score: 0,
};

player_random_piece();
version_game();
update_score();
update_game();
