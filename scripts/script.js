$(function () {
  var isOn = false;
  var isStarted = false;
  var isStrict = false;
  var isGameDoingPattern = false;
  var isPlayerDoingPattern = false;

  const winCount = 10;
  var gameCount = 0;
  var playerCount = 0;

  function turnOff() {
    isOn = false;
    isStarted = false;
    isStrict = false;
    isGameDoingPattern = false;
    isPlayerDoingPattern = false;
    $("button, #display").removeClass("on");
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
  function handleStart() {
    console.log("Start.");
  }
  function handleStrict() {
    console.log("Strict.");
  }

  $("input").on("click", handleOnOff);
  $("#start button").on("click", handleStart);
  $("#strict button").on("click", handleStrict);
});