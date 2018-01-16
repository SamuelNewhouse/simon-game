$(function () {
  var isOn = false;
  var isStarted = false;
  var isStrict = false;
  var isGameDoingPattern = false;
  var isPlayerDoingPattern = false;

  const winCount = 10;
  var gameCount = 0;
  var playerCount = 0;

  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  // Off/On functions
  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  function turnOff() {
    $("button, #display").removeClass("on");

    startOff();
    strictOff();

    isOn = false;
    isGameDoingPattern = false;
    isPlayerDoingPattern = false;
  }

  function turnOn() {
    isOn = true;
    $("button, #display").addClass("on");
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
  // Event Handlers
  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  
  $("input").on("click", handleOnOff);
  $("#start button").on("click", handleStart);
  $("#strict button").on("click", handleStrict);
});