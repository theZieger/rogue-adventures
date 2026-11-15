// Virtual time for the pages under test: a page's timers do not run by the wall clock but in the order they are due,
// while the test waits with sleep(). So a test takes no real waiting and gives the same result however busy the
// machine is. One clock serves every page that is open.
const timers = [];
let clock = 0;
let lastTimer = 0;

function cancel(id) {
  const i = timers.findIndex((timer) => timer.id === id);
  if (i >= 0) timers.splice(i, 1);
}

// onError(message): what a timer of this page throws
function install(win, onError) {
  const later = (fn, ms, args, every) => {
    timers.push({ id: ++lastTimer, due: clock + (ms || 0), fn, args, every, win, onError });
    return lastTimer;
  };
  win.setTimeout = (fn, ms, ...args) => later(fn, ms, args);
  win.setInterval = (fn, ms, ...args) => later(fn, ms, args, ms || 1);
  win.clearTimeout = win.clearInterval = win.cancelAnimationFrame = cancel;
  win.requestAnimationFrame = (fn) => later(() => fn(clock), 16, []);
  win.performance.now = () => clock;
}

// a closed page's timers never run
function uninstall(win) {
  for (const timer of timers.filter((timer) => timer.win === win)) cancel(timer.id);
}

const breath = () => new Promise((resolve) => setImmediate(resolve));

async function sleep(ms) {
  const until = clock + ms;
  for (;;) {
    await breath();
    const next = timers.filter((timer) => timer.due <= until).sort((a, b) => a.due - b.due || a.id - b.id)[0];
    if (!next) break;
    clock = Math.max(clock, next.due);
    if (next.every) next.due = clock + next.every;
    else cancel(next.id);
    try {
      next.fn(...next.args);
    } catch (e) {
      next.onError(e.message);
    }
  }
  clock = until;
  await breath();
}

export { install, sleep, uninstall };
