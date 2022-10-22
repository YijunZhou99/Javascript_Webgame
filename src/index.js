'use strict'

var boardSize = 16;
var gameMode = '';
var gameModeLst = {"easy":8,"median":12,"hard":16}
var firstCard = null;
var secondCard = null;
var boardFrozen = false;
var matchedCard = 0;
var retry = false;
var flippedTime = 0;
var flipSound = new Audio ("flip.mp3")
var correctSound = new Audio ("correct.mp3")
var wrongSound = new Audio("wrong.mp3")
var winStatus = false;
var imgList = [
  {imgSrc: "images/Picture1.jpg", imgName: "watermelon"},
  {imgSrc: "images/Picture2.jpg", imgName: "grape"},
  {imgSrc: "images/Picture3.jpg", imgName: "orange"},
  {imgSrc: "images/Picture4.jpg", imgName: "strawberry"},
  {imgSrc: "images/Picture5.jpg", imgName: "kiwi"},
  {imgSrc: "images/Picture6.jpg", imgName: "pineapple"},
  {imgSrc: "images/Picture7.jpg", imgName: "banana"},
  {imgSrc: "images/Picture8.jpg", imgName: "peach"},
  {imgSrc: "images/Picture9.jpg", imgName: "apple"},
  {imgSrc: "images/Picture10.jpg", imgName: "lemon"}
];
const cards = document.querySelectorAll(".card");
var resultbox = document.getElementById("result");
let game_massgae = document.getElementById("game_massage");
let game_result = document.getElementById("game_result");
let welcome_page = document.getElementById("welcome_page");
let game_mode_page = document.getElementById("game_mode_page");
let leadboard_page = document.getElementById("leadboard_page");

let best_easy = 0;
let best_median = 0;
let best_hard = 0;


function startGame(){
  // get the game mode from user selection
  var game_mode = document.getElementsByName('game_mode');
  for (let i = 0; i<game_mode.length;i++){
    if (game_mode[i].checked){
      gameMode = game_mode[i].id;
      boardSize = gameModeLst[gameMode]
    }
  };

  // hide the choice box
  resultbox.style.visibility = "hidden";

  //set up the game board
  let game_items = document.getElementsByClassName('game_items');
  for (let i = 0; i<game_items.length;i++){
    game_items[i].style.visibility = "visible";
  }

  for (let i = 0; i<cards.length;i++){
    if (cards[i].classList.contains(gameMode)){
      cards[i].style.visibility = "visible";
    }else{
      cards[i].style.visibility = "hidden"
    }
  };

  //reset the cards
  resetCards();

  //show the best score
  var bestRecord = document.getElementById("bestRecord")
  if (gameMode =='easy'){
    best_easy = localStorage.getItem("best_easy");
    bestRecord.innerText = best_easy;
  }
  if (gameMode =='median'){
    best_median = localStorage.getItem("best_median");
    bestRecord.innerHTML = best_median;
  }
  if (gameMode =='hard'){
    best_hard = localStorage.getItem("best_hard");
    bestRecord.innerHTML = best_hard;
  }
}

function resetCards(){
  //change cards to start status
  for (let i = 0; i<cards.length;i++){
    if(cards[i].classList.contains('flipped')){
      cards[i].classList.remove('flipped');
      cards[i].style.pointerEvents = "auto";
    };
  };

  //shuffle cards
  setInterval(shuffleCard(boardSize), 2000); 

  //start timer
  countDown();

  //reset data
  winStatus = false;
  matchedCard = 0;
  flippedTime = 0;
  firstCard = secondCard = null;
  retry = false;
}

function setup(){
  // shuffle the cards
  shuffleCard(boardSize);
  // flip the cards 
   cards.forEach(card =>
    card.addEventListener("click", (e) =>{
      if (!boardFrozen){
      card.classList.add('flipped')
      flippedTime++;
      flipSound.play();
      var filpped  = document.getElementById("flippedTime")
      filpped.innerHTML = flippedTime
      // checked if the flipped card matched
      checkCards(e)}
    }));
};
  
function checkCards(e){
  let clikedCard = e.target.parentElement.parentElement
  if (firstCard === null){
    firstCard = clikedCard
    firstCard.style.pointerEvents = "none";
  }else{
    secondCard = clikedCard
    secondCard.style.pointerEvents = "none";
    boardFrozen = true;
    // check if img matches
    if(firstCard.firstElementChild.firstElementChild.name === secondCard.firstElementChild.firstElementChild.name){
      matchedCard++;
      setTimeout(() => {correctSound.play();},500);
      setTimeout(() => {checkWinning();},800);
    }else{
      //add shaking card effect and cannot do next move until card flip back
      setTimeout(() => {
        wrongSound.play();
        firstCard.firstElementChild.classList.add("shaking");
        secondCard.firstElementChild.classList.add("shaking");
      },400);

      setTimeout(() => {
        firstCard.firstElementChild.classList.remove("shaking");
        secondCard.firstElementChild.classList.remove("shaking");
      },800);

      //flip back
      setTimeout(() => {
        firstCard.style.pointerEvents = "auto";
        secondCard.style.pointerEvents = "auto";
        firstCard.classList.remove("flipped");
        secondCard.classList.remove("flipped");
      },1000);
    }

    //reset the fisrt second card and release the gameboard
    setTimeout(() => {
    firstCard = null;
    secondCard = null;
    boardFrozen = false;
    },1200);
    
  }
};

function checkWinning(){
  if (matchedCard == boardSize/2){
    winStatus = true;
    resultbox.style.visibility = "visible";
    welcome_page.style.display = "block";
    game_mode_page.style.display = "none";
    leadboard_page.style.display = "none";
    game_massgae.innerHTML = "You Won!";
    game_result.innerHTML = "</br>" +"your score is "+flippedTime+".";
    //update best score
    if (gameMode == "easy" && (flippedTime<best_easy || best_easy == 0)){
      best_easy = flippedTime;
      game_result.innerHTML = "</br>" +"New Record: "+flippedTime+"!";
    } 
    if (gameMode == "median" && (flippedTime< best_median || best_median == 0)){
      best_median = flippedTime;
      game_result.innerHTML = "</br>" +"New Record: "+flippedTime+"!";
    } 
    if (gameMode == "hard" && (flippedTime< best_hard || best_hard == 0)){
      best_hard = flippedTime;
      game_result.innerHTML = "</br>" +"New Record: "+flippedTime+"!";
    } 
    //update to local storage
    saveCookies();
  }
  if(retry == true){
    winStatus = true;
    resultbox.style.visibility = "visible";
    welcome_page.style.display = "block";
    game_mode_page.style.display = "none";
    leadboard_page.style.display = "none";
  }
};

function shuffleCard(boardSize){
  //shuffle the imgList
  for (let i = imgList.length-1; i>0;i--){
    let j = Math.floor(Math.random()*(i+1));
    [imgList[i], imgList[j]] = [imgList[j], imgList[i]]
  }

  //shuffle the  img for each card
  let imgList_newGame = imgList.slice(0,boardSize/2)
  let cardImgList = imgList_newGame.concat(imgList_newGame)
  for (let i = cardImgList.length-1; i>0;i--){
    let j = Math.floor(Math.random()*(i+1));
    [cardImgList[i], cardImgList[j]] = [cardImgList[j], cardImgList[i]]
  }
  //assign img to cards 
  cards.forEach((card,index) => {
    if (index < boardSize){ 
    card.firstElementChild.firstElementChild.src = cardImgList[index].imgSrc;
    card.firstElementChild.firstElementChild.name = cardImgList[index].imgName;
    }else{}
  });
};

function countDown(){

  var timer = document.getElementById("timer")
  var totalTime = 90;
  var myTimer = setInterval(function(){
    var minute = parseInt(totalTime / 60, 10);
    var second = parseInt(totalTime % 60, 10);

    minute = minute < 10 ? "0" + minute : minute;
    second = second < 10 ? "0" + second : second;

    timer.innerText = minute +':'+second;

    totalTime--
    if(retry ==true){
      totalTime = 90;
      clearInterval(myTimer);
    };
    if (totalTime < 0 || winStatus==true){
      totalTime = 90;
      clearInterval(myTimer);
      if(winStatus == false){
        resultbox.style.visibility = "visible";
        welcome_page.style.display = "block";
        game_mode_page.style.display = "none";
        leadboard_page.style.display = "none";
        game_massgae.innerHTML = "Time's Up!";
        game_result.innerHTML = "</br> Try again to win.";
      }
    };
  }
  , 1000);
};


function reTry(){
  console.log("in")
  retry = true;
  checkWinning();
};

function chooseGamemode(){
  welcome_page.style.display = "none";
  game_mode_page.style.display = "inline-block";
  game_massgae.innerHTML = "Welcome to </br>Card Match Game!</br>";
  game_result.innerHTML = "";
};

function showLeadboard(){
  welcome_page.style.display = "none";
  leadboard_page.style.display = "inline-block";
  game_massgae.innerHTML = "Welcome to </br>Card Match Game!</br>";
  game_result.innerHTML = "";
  document.getElementById("best_easy").innerHTML = localStorage.getItem('best_easy');
  document.getElementById("best_median").innerHTML = localStorage.getItem('best_median');
  document.getElementById("best_hard").innerHTML = localStorage.getItem('best_hard');
};

function backtoHome(){
  welcome_page.style.display = "block";
  game_mode_page.style.display = "none";
  leadboard_page.style.display = "none";
}

function saveCookies(){
  localStorage.setItem("best_easy",best_easy);
  localStorage.setItem("best_median",best_median);
  localStorage.setItem("best_hard",best_hard);
}
