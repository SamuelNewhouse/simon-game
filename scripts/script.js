$(function () {
  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  // Game state variables
  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  var isOn = false;
  var isStarted = false;
  var isStrict = false;
  var isGameShowingPattern = false;
  var isPlayerTryingPattern = false;

  var pattern = [];
  var patternInterval = null; // setInterval function

  const winCount = 10;
  var showCount = 0;
  var playerCount = 0;

  var playButtonMap = {
    "top-left": 0,
    "top-right": 1,
    "bottom-right": 2,
    "bottom-left": 3
  }

  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  // Off/on functions
  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  function turnOff() {
    stopPattern();
    stopPlayerTry();
    strictOff();
    startOff();

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
  function clearPlayLights() {
    $(".game-button").removeClass("show");
  }

  function extendPattern() {
    var nextButton = Math.floor(Math.random() * 4); // 0-3
    pattern.push(nextButton);
  }

  function showPattern() {
    if (showCount >= pattern.length) {
      stopPattern();
      return;
    }

    console.log(pattern[showCount]);

    clearPlayLights();

    switch (pattern[showCount]) {
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

    showCount++;
  }

  function stopPattern() {
    clearInterval(patternInterval);
    clearPlayLights();
    isGameShowingPattern = false;

    startPlayerTry(); // Assume player should now try entering pattern.
  }

  function startPattern() {
    extendPattern();
    showCount = 0;
    isGameShowingPattern = true;
    patternInterval = setInterval(showPattern, 1000);
  }

  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  // Player pattern entry
  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  function stopPlayerTry() {
    console.log("Enter stopPlayerTry()")
    isPlayerTryingPattern = false;
  }

  function startPlayerTry() {
    isPlayerTryingPattern = true;
    playerCount = 0;
  }

  function handlePlayerTry() {
    console.log("Enter handlePlayerTry()");
    if (!isPlayerTryingPattern)
      return;

    var playerEntry = playButtonMap[this.id];

    if (playerEntry === pattern[playerCount])
      console.log("correct");
    else
      console.log("incorrect");

    playerCount++;

    if (playerCount >= pattern.length) {
      console.log("playerCount >= pattern.length");
      stopPlayerTry();
      startPattern();
      return;
    }
  }

  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  // Event Handlers
  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  
  $("input").on("click", handleOnOff);
  $("#start button").on("click", handleStart);
  $("#strict button").on("click", handleStrict);
  $(".game-button").on("click", handlePlayerTry);
});