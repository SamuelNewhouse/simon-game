$(function () {
  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  // Game state variables
  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  var isOn = false;
  var isStarted = false;
  var isStrict = false;
  var isGameShowingPattern = false;
  var isPlayerTryingPattern = false;

  var playButtonFocus = null; // Tracks beginning and end of game button press.

  var pattern = [];
  var patternInterval = null; // setInterval function  

  var showPatternCount = 0;
  var playerEntryCount = 0;

  const winCount = 10;

  const playButtonMap = {
    "top-left": 0,
    "top-right": 1,
    "bottom-right": 2,
    "bottom-left": 3
  }

  const patternPace = 1000; // ms between each pattern display
  const lightDuration = 700; /* pattern lights are not lit the entire pace
  duration to make clear when the same light is lit multiple times */


  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  // Clear and reset functions
  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  function clearPlayLights() {
    $(".game-button").removeClass("show");
  }

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

  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  // Off/on functions
  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  function turnOff() {
    reset();
    strictOff();

    $("button, #display").removeClass("on");
    isOn = false;
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
  // Pattern functions
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

    switch (pattern[showPatternCount]) {
      case 0:
        $("#top-left").addClass("show");
        break;
      case 1:
        $("#top-right").addClass("show");
        break;
      case 2:
        $("#bottom-right").addClass("show");
        break;
      case 3:
        $("#bottom-left").addClass("show");
        break;
    }

    showPatternCount++;
    // Clear light before next light starts.
    setTimeout(clearPlayLights, lightDuration);
  }

  function stopPattern() {
    clearInterval(patternInterval);
    clearPlayLights();
    isGameShowingPattern = false;

    startPlayerTry(); // Assume player should now try entering pattern.
  }

  function startPattern(doExtend) {
    doExtend = (typeof doExtend === "boolean") ? doExtend : true;

    if (doExtend) {
      // Displayed count is pattern length before extending.
      updateCountDisplay();
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
    $("#" + playButtonFocus).addClass("show");
  }

  function handlePlayerTry() { // When mouse goes up or leaves button
    if (!isPlayerTryingPattern || (playButtonFocus !== this.id))
      return;

    playButtonFocus = null;
    clearPlayLights();

    var playerEntry = playButtonMap[this.id];

    if (playerEntry !== pattern[playerEntryCount]) {
      if (isStrict)
        reset();
      else {
        stopPlayerTry();
        startPattern(false);
      }
      return;
    }

    playerEntryCount++;

    if (playerEntryCount >= pattern.length) {
      stopPlayerTry();
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