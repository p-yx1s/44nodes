const output = document.getElementById("output");
const input = document.getElementById("input");

// Reset state 
let state = "welcome";
let challenges = [];
let currentChallenge = null;
let active = true;

function print(text) {
  // Support paragraph breaks: literal \n\n in CSV becomes HTML line breaks
  const formatted = text.replace(/\\n\\n/g, "<br><br>").replace(/\\n/g, "<br>");
  output.innerHTML += formatted + "\n";
  // Scroll the output area, not the whole page
  output.scrollTop = output.scrollHeight;
}

// Collects challenge data from CSV
async function loadCSV() {
  const res = await fetch(window.NODE_FILE);
  if (!res.ok) {
    print(`[ERROR] Could not load CSV: ${window.NODE_FILE}`);
    challenges = [];
    return;
  }
  const text = await res.text();
  const rows = text.trim().split("\n").slice(1);
  challenges = rows.map(row => {
    const [title, description] = row.split(",");
    return { title, description };
  });
}

//Picks random challenge
function randomChallenge() {
  return challenges[Math.floor(Math.random() * challenges.length)];
}

// Kill session function
function killSession() {
  active = false;
  input.disabled = true;

  // Blocks players from reloading page
  try {
    sessionStorage.setItem('challenge-locked', '1');
  } catch (e) {}
}

// Initial welcome message 
function welcome() {
  print("=== 44 NODES - SECURE TERMINAL ===");
  print("Welcome PLAYER");
  print("Visit the rules page for game instructions");
  print("Type 'ready' to request assignment.");
}

// Player input 
input.addEventListener("keydown", e => {
  if (e.key !== "Enter" || !active) return;

  const value = input.value.trim().toLowerCase();

  print("C:\\Users\\44nodes> " + value);

  input.value = "";

  // Ready state true
  if (state === "welcome") {
    if (value === "ready") {
      currentChallenge = randomChallenge();
      // Block reload as soon as a challenge is issued
      try {
        sessionStorage.setItem('challenge-locked', '1');
      } catch (e) {}
      print("");
      print("[CHALLENGE FOUND]");
      print("ASSIGNMENT: " + currentChallenge.title);
      print(currentChallenge.description);
      print("");
      print("Type 'accept' or 'decline'");

      state = "challenge";
    } else {
      print("Unknown command.");
    }
  }

  // Accept or decline challenge logic 
  else if (state === "challenge") {

    if (value === "accept") {

      print("");
      print("[RULES]");
      print("- Do not disclose assignment");
      print("- Maintain terminal secrecy");
      print("- Send proof of mission completion to HQ");
      print("- Best of luck agent");
      print("Session terminated.");


      killSession();
    }

    else if (value === "decline") {

      print("");
      print("Assignment declined.");
      print("Wait 7 minutes before requesting another challenge.");
      print("No cheating.... remember Someone is always watching");
      print("Try again soon agent");
      print("Session terminated.");

      killSession();
    }

    else {
      print("Type 'accept' or 'decline'");
    }
  }

});


//Invalid URL csv file name
(async function init() {
  await loadCSV();
  if (challenges.length > 0) {
    welcome();
  } else {
    print("ACCESS DENIED - Scan a valid node");
    killSession();
  }
})();

// On load, check if challenge is locked for this session
try {
  // Always block if session is locked, even if coming from rules.html
  if (sessionStorage.getItem('challenge-locked') === '1') {
    document.body.innerHTML = `
      <div id="header">
        <img id="header-icon" src="icon.png" alt="Node Icon">
        <span id="header-title">44 Nodes - Secure Terminal</span>
        <a href="rules.html" style="margin-left:auto;color:#00ff66;text-decoration:underline;font-size:1em;">Rules</a>
      </div>
      <div style="color:#00ff66;font-family:monospace;padding:40px;text-align:center;max-width:700px;margin:80px auto 0 auto;">
        You must scan the Node to get a new challenge.<br><br>Reloading is not allowed.
      </div>
      `;
    throw new Error('Challenge locked');
  }
} catch (e) {}
