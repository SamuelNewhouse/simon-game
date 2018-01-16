$(function () {
  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  // Game state variables
  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  var isOn = false;
  var isStarted = false;
  var isStrict = false;
  var isGameShowingPattern = false;
  var isPlayerTryingPattern = false;

  var pattern = [0, 1, 2, 3, 0];
  var patternInterval = null; // setInterval function

  const winCount = 10;
  var showCount = 0;
  var playerCount = 0;

  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  // Off/On functions
  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  function turnOff() {
    $("button, #display").removeClass("on");
    stopPattern();
    strictOff();
    startOff();

    isOn = false;
    isPlayerTryingPattern = false;
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
    // TODO: call function to start displaying moves.
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
  function clearLights() {
    $(".game-button").removeClass("show");
  }

  function extendPattern() {
    var nextButton = Math.floor(Math.random() * 4); // 0-3
    pattern.push(nextButton);
  }

  function showPattern() {
    if (showCount >= pattern.length){
      stopPattern();
      return;
    }

    console.log(pattern[showCount]);

    clearLights();

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

  function startPattern() {
    extendPattern();
    showCount = 0;
    isGameShowingPattern = true;
    patternInterval = setInterval(showPattern, 1000);
  }

  function stopPattern() {
    clearInterval(patternInterval);
    clearLights();
    isGameShowingPattern = false;
  }

  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  // Player pattern entry
  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  
  function handlePatternEntry() {

  }

  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  // Event Handlers
  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  
  $("input").on("click", handleOnOff);
  $("#start button").on("click", handleStart);
  $("#strict button").on("click", handleStrict);
  $(".game-button").on("click", handlePatternEntry);
});