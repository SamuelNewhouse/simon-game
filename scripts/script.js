$(function main() {
  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  // Game state variables
  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  var isOn = false;
  var isStarted = false;
  var isStrict = false;
  var isGameShowingPattern = false;
  var isGameShowingWinOrLoss = false;
  var isPlayerTryingPattern = false;

  var playButtonFocus = null; // Tracks beginning and end of game button press

  var pattern = [];
  var patternInterval = null; // setInterval function for pattern display

  var showPatternCount = 0;
  var playerEntryCount = 0;

  const winCount = 2;

  // HTML element IDs mapped from 0 to 3.
  const gameButtonIndexMap = { "top-left": 0, "top-right": 1, "bottom-right": 2, "bottom-left": 3 };

  const patternPace = 1000; // ms between each pattern display
  const lightDuration = 700; /* pattern lights are not lit the entire pace
  duration to make clear when the same light is lit multiple times */

  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  // gameButton definition
  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  function GameButton(divId, audioId) {
    this.divId = divId;
    this.sound = document.getElementById(audioId);
    this.dimTimeout = null;
  };
  GameButton.prototype = {
    light: function light(length = lightDuration, isPlayingSound = true) {
      $("#" + this.divId).addClass("show");

      if (isPlayingSound)
        this.playSound();

      if (length > 0) {
        this.dimTimeout = setTimeout(this.dim.bind(this), length);
      }
    },
    dim: function dim() {
      $("#" + this.divId).removeClass("show");
      this.stopSound();

      // Could be called elsewhere before timeOut calls it.
      clearTimeout(this.dimTimeout);
    },
    playSound: function playSound() {
      this.sound.currentTime = 0;
      this.sound.volume = 1;
      this.sound.play();
    },
    stopSound: function stopSound() {
      this.sound.volume = 0;
      this.sound.pause();
      this.sound.currentTime = 0;
    }
  };
  var gameButtons = [];
  gameButtons[0] = new GameButton("top-left", "sound1");
  gameButtons[1] = new GameButton("top-right", "sound2");
  gameButtons[2] = new GameButton("bottom-right", "sound3");
  gameButtons[3] = new GameButton("bottom-left", "sound4");

  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  // Clear and reset functions
  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  function clearGameButtons() {
    for (let i of gameButtons)
      i.dim();
  }

  function clearPattern() {
    pattern = [];
    updateCountDisplay();
  }

  function reset() {
    victory.end();
    defeat.end();
    stopPattern();   // call order is important
    stopPlayerTry(); // stopPattern() calls startPlayerTry() so stop it here
    startOff();
    clearPattern(); // call last to make sure Count updates properly.
  }

  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  // victory definition
  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  var victory = (function defineVictory() {
    const victoryPace = 200;
    const victoryLength = 2990;
    var curButton = 0;
    var intervalStep = null;
    var timeoutEnd = null;

    function step() {
      if (curButton > 3)
        curButton = 0;

      clearGameButtons();
      gameButtons[curButton].light(victoryPace);
      curButton++;
    }

    function begin() {
      updateCountDisplay();
      intervalStep = setInterval(step, victoryPace);
      timeoutEnd = setTimeout(end, victoryLength);
    }

    function end() {
      clearGameButtons();
      clearInterval(intervalStep);
      clearTimeout(timeoutEnd);
      startOff();
      updateCountDisplay();
    }

    return {
      begin: begin,
      end: end
    };
  })();

  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  // defeat definition
  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  var defeat = (function defineDefeat() {
    const flickerPace = 250;
    const length = 2000;
    var stepInterval = null;
    var endTimeout = null;
    var curStep = 0;

    function step() {
      if (curStep % 2 == 0) {
        $(".game-button").addClass("show");
        $("#display").html("X");
      }
      else {
        $(".game-button").removeClass("show");
        $("#display").html("");
      }
      curStep++;
    }

    function begin() {
      curStep = 0;
      stepInterval = setInterval(step, flickerPace);
      endTimeout = setTimeout(end, length);
    }

    function end() {
      clearInterval(stepInterval);
      clearTimeout(endTimeout);
      updateCountDisplay();
    }

    return {
      begin: begin,
      end: end
    }
  })();

  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  // Off/on functions
  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  function turnOff() {
    reset();
    strictOff();
    isOn = false;
    $("button, #display").removeClass("on");
  }

  function turnOn() {
    $("button, #display").addClass("on");
    isOn = true;
  }

  function handleOnOff() {
    if (isOn)
      turnOff();
    else
      turnOn();

    isOn = $("input").is(":checked");
  }

  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  // Start functions
  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  function startOff() {
    $("#start button").removeClass("selected");
    isStarted = false;
  }

  function startOn() {
    $("#start button").addClass("selected");
    isStarted = true;

    startPattern();
  }

  function handleStart() {
    if (!isOn || isStarted)
      return;
    else
      startOn();
  }

  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  // Strict functions
  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  function strictOff() {
    $("#strict button").removeClass("selected");
    isStrict = false;
  }

  function strictOn() {
    $("#strict button").addClass("selected");
    isStrict = true;
  }

  function handleStrict(val) {
    if (!isOn || isStarted)
      return;
    else if (isStrict)
      strictOff();
    else
      strictOn();
  }

  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  // Pattern display functions
  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  function extendPattern() {
    var nextButton = Math.floor(Math.random() * 4); // 0-3
    pattern.push(nextButton);
  }

  function showPattern() {
    if (showPatternCount >= pattern.length) {
      stopPattern();
      return;
    }

    var curButton = pattern[showPatternCount];
    gameButtons[curButton].light();
    showPatternCount++;
  }

  function stopPattern() {
    clearGameButtons();
    isGameShowingPattern = false;
    clearInterval(patternInterval);
    startPlayerTry(); // Assume player should now try entering pattern.
  }

  function startPattern(isExtending) {
    isExtending = (typeof isExtending === "boolean") ? isExtending : true;

    if (isExtending) {
      extendPattern();
    }

    showPatternCount = 0;
    isGameShowingPattern = true;
    patternInterval = setInterval(showPattern, patternPace);
  }

  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  // Player pattern entry functions
  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  function stopPlayerTry() {
    isPlayerTryingPattern = false;
  }

  function startPlayerTry() {
    isPlayerTryingPattern = true;
    playerEntryCount = 0;
  }

  function prePlayerTry() { // While mouse is down
    if (!isPlayerTryingPattern)
      return;

    playButtonFocus = this.id;

    var curButton = gameButtonIndexMap[playButtonFocus];

    gameButtons[curButton].light(0);

    //lightGameButton(playButtonFocus);
  }

  function handlePlayerTry() { // When mouse goes up or leaves button    
    if (!isPlayerTryingPattern || (playButtonFocus !== this.id))
      return;

    playButtonFocus = null;
    clearGameButtons();

    var playerEntry = gameButtonIndexMap[this.id];

    if (playerEntry !== pattern[playerEntryCount]) {
      if (isStrict) {
        reset();
        defeat.begin();
      }
      else {
        stopPlayerTry();
        startPattern(false);
      }
      return;
    }

    playerEntryCount++;

    if (playerEntryCount >= winCount) {
      stopPlayerTry();
      victory.begin();
    }
    else if (playerEntryCount >= pattern.length) {
      stopPlayerTry();
      updateCountDisplay();
      startPattern();
    }
  }

  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  // Count display function
  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  
  function updateCountDisplay() {
    if (!isOn || !isStarted)
      $("#display").html("--");
    else
      $("#display").html(pattern.length);
  }

  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  // Event Handlers
  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  
  $("input").click(handleOnOff);
  $("#start button").click(handleStart);
  $("#strict button").click(handleStrict);
  $(".game-button").mousedown(prePlayerTry);
  $(".game-button").mouseup(handlePlayerTry);
  $(".game-button").mouseleave(handlePlayerTry);

  // Backup for drag and select stopping
  $("*").on("dragstart", () => false);
  $("*").on("selectstart", () => false);
});