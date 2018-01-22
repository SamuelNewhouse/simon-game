$(function () {
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
  var dimTimeout = null; // setTimeout function for dimming light and sound
  var curAudio = null; // last audio element playing

  var showPatternCount = 0;
  var playerEntryCount = 0;

  const winCount = 10;

  // HTML element IDs mapped from 0 to 3.
  const gameButtonIDMap = ["top-left", "top-right", "bottom-right", "bottom-left"];
  const audioIDMap = ["sound1", "sound2", "sound3", "sound4"];

  const patternPace = 1000; // ms between each pattern display
  const lightDuration = 700; /* pattern lights are not lit the entire pace
  duration to make clear when the same light is lit multiple times */

  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  // Game button audio functions
  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  function stopSound(audioID) {
    var sound = document.getElementById(audioID);
    sound.pause();
    sound.currentTime = 0;
  }

  function playSound(audioID) {
    var sound = document.getElementById(audioID);
    sound.currentTime = 0;
    sound.play();
  }

  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  // Game button lighting functions
  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  function clearPlayLights() {
    clearTimeout(dimTimeout);
    stopSound(curAudio);
    $(".game-button").removeClass("show");
  }

  function lightGameButton(value) {
    var numValue = gameButtonIDMap.findIndex((v) => { return v === value; });
    curAudio = audioIDMap[numValue];
    playSound(curAudio);
    $("#" + value).addClass("show");
  }

  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  // Clear and reset functions
  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  function clearPattern() {
    pattern = [];
    updateCountDisplay();
  }

  function reset() {
    stopPattern();   // call order is important
    stopPlayerTry(); // stopPattern() calls startPlayerTry() so stop it here
    startOff();
    clearPattern(); // call last to make sure Count updates properly.
  }

  function showDefeat() {

  }

  function showVictory() {

  }
  
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
    pattern.push(gameButtonIDMap[nextButton]);
  }

  function showPattern() {
    if (showPatternCount >= pattern.length) {
      stopPattern();
      return;
    }

    lightGameButton(pattern[showPatternCount]);

    showPatternCount++;
    // Clear light before next light starts.
    dimTimeout = setTimeout(clearPlayLights, lightDuration);
  }

  function stopPattern() {
    clearInterval(patternInterval);
    clearPlayLights();
    isGameShowingPattern = false;

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
    lightGameButton(playButtonFocus);
  }

  function handlePlayerTry() { // When mouse goes up or leaves button
    if (!isPlayerTryingPattern || (playButtonFocus !== this.id))
      return;

    playButtonFocus = null;
    clearPlayLights();

    var playerEntry = this.id;

    if (playerEntry !== pattern[playerEntryCount]) {
      if (isStrict) {        
        reset();
        showDefeat();
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
      showVictory();
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

  // Backup drag and select stopping
  $("*").on("dragstart", () => false);
  $("*").on("selectstart", () => false);
});