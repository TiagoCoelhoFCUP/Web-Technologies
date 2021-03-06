var rows = 6;
var cols = 7;
var matrix = [];
var current_player = 1;
var starting_player = 1;
var game_type = "singleplayer";
var game_status = "stopped";
var score1 = 0;
var score2 = 0;
var dificulty = "easy";
var non_playable;


var rows_copy = 6;
var cols_copy = 7;
var game_type_copy = "singleplayer";
var starting_player_copy = 1;
var dificulty_copy = "easy"

function createBoard(){
  let body = document.body;
  let board = document.createElement("table");
  let background = document.createElement("div");
  let p1 = document.createElement("div");
  let p1_text = document.createTextNode("Jogador 1");
  p1.id = "p1";
  let p2 = document.createElement("div");
  let p2_text = document.createTextNode("Jogador 2");
  p2.id = "p2";
  let ficha1 = document.createElement("div");
  ficha1.id = "ficha1";
  let ficha2 = document.createElement("div");
  ficha2.id = "ficha2";
  if(starting_player==1){
    p2.style.display = "none";
    p1.style.display = "flex";
    ficha1.style.display = "block";
    ficha2.style.display = "none";
  }
  else{
    p1.style.display = "none";
    p2.style.display = "flex";
    ficha2.style.display = "block";
    ficha1.style.display = "none";
  }
  let button1 = document.createElement("BUTTON");
  let button2 = document.createElement("BUTTON");
  let text1 = document.createTextNode("Desistir");
  let text2 = document.createTextNode("Voltar");
  button1.appendChild(text1);
  button2.appendChild(text2);
  button1.className ="voltar";
  button2.className ="voltar";
  button1.id = "desistir"
  button2.id = "voltar_board"
  button1.onclick = function() {desistir()};
  button2.onclick = function() {voltar("board")};
  background.className = "background_div";
  background.id = "background";
  background.style.display = "flex";
  board.id = "game_table";
  for (let row=0; row<rows; row++) {
    let tr = board.insertRow();
    for (let col=0; col<cols; col++) {
      let td = tr.insertCell();
      td.id = "square_"+ row + "_"+ col;
      td.className =  "board_square";
      td.onclick = function() {play(col)};
      td.onmouseover = function(){mouseOver(col)};
      td.onmouseout = function(){mouseOut(col)};
    }
  }
  p1.appendChild(p1_text);
  p2.appendChild(p2_text);
  background.appendChild(button1);
  background.appendChild(button2);
  background.appendChild(p1);
  background.appendChild(p2);
  background.appendChild(ficha1);
  background.appendChild(ficha2);
  background.appendChild(board);
  let menu = document.getElementById("menu");
  body.insertBefore(background,menu);
  menu.style.display = "none";
}


function createMatrix() {
  var matrix = new Array(rows);
  for (let row=0; row<rows; row++) {
    matrix[row] = new Array(cols);
    for (let col=0; col<cols; col++) {
      matrix[row][col] = 0;
    }
  }
  return matrix;
}

function startGame(){
  let existanceCheck = document.getElementById("background");
  if(existanceCheck != null){
    existanceCheck.style.display = "flex";
    let menu = document.getElementById("menu");
    menu.style.display = "none";
  }
  else{
    rows = rows_copy;
    cols = cols_copy;
    starting_player = starting_player_copy;
    current_player = starting_player_copy;
    game_type = game_type_copy;
    dificulty = dificulty_copy;
    createBoard();
    matrix = createMatrix();
    game_status = "running";
    current_player = starting_player;
    if(starting_player==2 && game_type=="singleplayer"){
      computerplay();
    }
  }
}

function firstEmptyCell(column){
  for(let i=rows-1;i>=0;i--){
    if(matrix[i][column]==0){
      return i;
    }
  }
  return -1;
}

function drop(row,col){
  matrix[row][col]= current_player;
  if(current_player==1){
    document.getElementById('square_'+row+'_'+col).style.backgroundColor = "red";
    current_player = 2;
  }
  else{
    document.getElementById('square_'+row+'_'+col).style.backgroundColor = "yellow";
    current_player = 1;
  }
}

function play(column){
  var result = firstEmptyCell(column);
  if(result != -1){
    drop(result,column);
    if(game_type == "singleplayer"){
      disableOnclick();
    }
    winPrompt();
    changeTurnDisplay();
    if(game_type =="singleplayer" && game_status=="running"){
      setTimeout(computerplay,500);
      setTimeout(winPrompt,500);
      setTimeout(changeTurnDisplay,500);
    }
  }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function computerplay(){
  if(dificulty == "easy"){
    let comp_col = getRandomInt(0,cols);
    let index = firstEmptyCell(comp_col);
    while(index == -1){
      comp_col = getRandomInt(0,cols);
      index = firstEmptyCell(comp_col);
    }
    drop(index,comp_col);
  }
  if(dificulty == "medium"){
    let random = getRandomInt(0,cols);
    if(random%2==0){
      let comp_col = getRandomInt(0,cols);
      let index = firstEmptyCell(comp_col);
      while(index == -1){
        comp_col = getRandomInt(0,cols);
        index = firstEmptyCell(comp_col);
      }
      drop(index,comp_col);
    }
    else{
      let best = BestPlay();
      if(best[0] == -1){
        let comp_col = getRandomInt(0,cols);
        for(let i = 0;i<1000;i++){
          if(non_playable.includes(comp_col)){
          comp_col = getRandomInt(0,cols);
          }
          else{
            break;
          }
        }
        let index = firstEmptyCell(comp_col);
        while(index == -1){
          comp_col = getRandomInt(0,cols);
          index = firstEmptyCell(comp_col);
        }
        drop(index,comp_col);
      }
      else{
        drop(best[0],best[1]);
      }
    }
  }
  if(dificulty == "hard"){
    let best = BestPlay();
    if(best[0] == -1){
      let comp_col = getRandomInt(0,cols);
      for(let i = 0;i<1000;i++){
        if(non_playable.includes(comp_col)){
        comp_col = getRandomInt(0,cols);
        }
        else{
          break;
        }
      }
      let index = firstEmptyCell(comp_col);
      while(index == -1){
        comp_col = getRandomInt(0,cols);
        index = firstEmptyCell(comp_col);
      }
      drop(index,comp_col);
    }
    else{
      drop(best[0],best[1]);
    }
  }
  enableOnlick();
}

function BestPlay(){
  let playValue = 0;
  let column = -1;
  let row = -1;
  non_playable = [];
  //vertical
  for (let c=0;c<cols;c++){
    for (let r=0;r<rows-3;r++){
      if (matrix[r][c] == 0 && matrix[r+1][c] == 1 && matrix[r+2][c] == 1 && matrix[r+3][c] == 1){
        if(playValue <= 3){
          playValue = 3;
          column = c;
          row = r;
        }
      }
      else if (matrix[r][c] == 0 && matrix[r+1][c] == 2 && matrix[r+2][c] == 2 && matrix[r+3][c] == 2){
        if(playValue <= 4){
          playValue = 4;
          column = c;
          row = r;
        }
      }
      else if (matrix[r][c] == 0 && matrix[r+1][c] == 0 && matrix[r+2][c] == 1 && matrix[r+3][c] == 1){
        if(playValue <= 2){
          playValue = 2;
          column = c;
          row = r+1;
        }
      }
    }
  }
  //horizontal
  for(let c=0;c<cols-3;c++){
    for (let r=0;r<rows;r++){
      if (matrix[r][c] == 1 && matrix[r][c+1] == 1 && matrix[r][c+2] == 1 && matrix[r][c+3] == 0){
        let index = firstEmptyCell(c+3);
        if(index == r){
          if(playValue <= 3){
            playValue = 3;
            column = c+3;
            row = r;
          }
        }
        else{
          non_playable.push(c+3);
        }
      }
      else if (matrix[r][c] == 2 && matrix[r][c+1] == 2 && matrix[r][c+2] == 2 && matrix[r][c+3] == 0){
        let index = firstEmptyCell(c+3);
        if(index == r){
          if(playValue <= 4){
            playValue = 4;
            column = c+3;
            row = r;
          }
        }
        else{
          non_playable.push(c+3);
        }
      }
      else if(matrix[r][c] == 1 && matrix[r][c+1] == 1 && matrix[r][c+2] == 0 && matrix[r][c+3] == 1){
        let index = firstEmptyCell(c+2);
        if(index == r){
          if(playValue <= 3){
            playValue = 3;
            column = c+2;
            row = r;
          }
        }
        else{
          non_playable.push(c+2);
        }
      }
      else if(matrix[r][c] == 2 && matrix[r][c+1] == 2 && matrix[r][c+2] == 0 && matrix[r][c+3] == 2){
        let index = firstEmptyCell(c+2);
        if(index == r){
          if(playValue <= 4){
            playValue = 4;
            column = c+2;
            row = r;
          }
        }
        else{
          non_playable.push(c+2);
        }
      }
      else if(matrix[r][c] == 1 && matrix[r][c+1] == 0 && matrix[r][c+2] == 1 && matrix[r][c+3] == 1){
        let index = firstEmptyCell(c+1);
        if(index == r){
          if(playValue <= 3){
            playValue = 3;
            column = c+1;
            row = r;
          }
        }
        else{
          non_playable.push(c+1);
        }
      }
      else if(matrix[r][c] == 2 && matrix[r][c+1] == 0 && matrix[r][c+2] == 2 && matrix[r][c+3] == 2){
        let index = firstEmptyCell(c+1);
        if(index == r){
          if(playValue <= 4){
            playValue = 4;
            column = c+1;
            row = r;
          }
        }
        else{
          non_playable.push(c+1);
        }
      }
      else if(matrix[r][c] == 0 && matrix[r][c+1] == 1 && matrix[r][c+2] == 1 && matrix[r][c+3] == 1){
        let index = firstEmptyCell(c);
        if(index == r){
          if(playValue <= 3){
            playValue = 3;
            column = c;
            row = r;
          }
        }
        else{
          non_playable.push(c);
        }
      }
      else if(matrix[r][c] == 0 && matrix[r][c+1] == 2 && matrix[r][c+2] == 2 && matrix[r][c+3] == 2){
        let index = firstEmptyCell(c);
        if(index == r){
          if(playValue <= 4){
            playValue = 4;
            column = c;
            row = r;
          }
        }
        else{
          non_playable.push(c);
        }
      }
      else if(matrix[r][c] == 1 && matrix[r][c+1] == 1 && matrix[r][c+2] == 0 && matrix[r][c+3] == 0){
        let index = firstEmptyCell(c+2);
        if(index == r){
          if(playValue <= 2){
            playValue = 2;
            column = c+2;
            row = r;
          }
        }
      }
      else if(matrix[r][c] == 0  && matrix[r][c+1] == 1 && matrix[r][c+2] == 1 && matrix[r][c+3] == 0){
        let index = firstEmptyCell(c);
        if(index == r){
          if(playValue <= 2){
            playValue = 2;
            column = c;
            row = r;
          }
        }
      }
      else if(matrix[r][c] == 0  && matrix[r][c+1] == 0 && matrix[r][c+2] == 1 && matrix[r][c+3] == 1){
        let index = firstEmptyCell(c+1);
        if(index == r){
          if(playValue <= 2){
            playValue = 2;
            column = c+1;
            row = r;
          }
        }
      }
    }
  }
  //diagonal positiva
  for (let c=0;c<cols-3;c++){
		for (let r=0;r<rows-3;r++){
			if (matrix[r][c] == 1 && matrix[r+1][c+1] == 1 && matrix[r+2][c+2] == 1 && matrix[r+3][c+3] == 0){
        let index = firstEmptyCell(c+3);
        if(index == r+3){
          if(playValue <= 3){
            playValue = 3;
            column = c+3;
            row = r+3;
          }
        }
        else{
          non_playable.push(c+3);
        }
      }
      else if (matrix[r][c] == 2 && matrix[r+1][c+1] == 2 && matrix[r+2][c+2] == 2 && matrix[r+3][c+3] == 0){
        let index = firstEmptyCell(c+3);
        if(index == r+3){
          if(playValue <= 4){
            playValue = 4;
            column = c+3;
            row = r+3;
          }
        }
        else{
          non_playable.push(c+3);
        }
      }
      else if (matrix[r][c] == 1 && matrix[r+1][c+1] == 1 && matrix[r+2][c+2] == 0 && matrix[r+3][c+3] == 1){
        let index = firstEmptyCell(c+2);
        if(index == r+2){
          if(playValue <= 3){
            playValue = 3;
            column = c+2;
            row = r+2;
          }
        }
        else{
          non_playable.push(c+2);
        }
      }
      else if (matrix[r][c] == 2 && matrix[r+1][c+1] == 2 && matrix[r+2][c+2] == 0 && matrix[r+3][c+3] == 2){
        let index = firstEmptyCell(c+2);
        if(index == r+2){
          if(playValue <= 4){
            playValue = 4;
            column = c+2;
            row = r+2;
          }
        }
        else{
          non_playable.push(c+2);
        }
      }
      else if (matrix[r][c] == 1 && matrix[r+1][c+1] == 0 && matrix[r+2][c+2] == 1 && matrix[r+3][c+3] == 1){
        let index = firstEmptyCell(c+1);
        if(index == r+1){
          if(playValue <= 3){
            playValue = 3;
            column = c+1;
            row = r+1;
          }
        }
        else{
          non_playable.push(c+1);
        }
      }
      else if (matrix[r][c] == 2 && matrix[r+1][c+1] == 0 && matrix[r+2][c+2] == 2 && matrix[r+3][c+3] == 2){
        let index = firstEmptyCell(c+1);
        if(index == r+1){
          if(playValue <= 4){
            playValue = 4;
            column = c+1;
            row = r+1;
          }
        }
        else{
          non_playable.push(c+1);
        }
      }
      else if (matrix[r][c] == 0 && matrix[r+1][c+1] == 1 && matrix[r+2][c+2] == 1 && matrix[r+3][c+3] == 1){
        let index = firstEmptyCell(c);
        if(index == r){
          if(playValue <= 3){
            playValue = 3;
            column = c;
            row = r;
          }
        }
        else{
          non_playable.push(c);
        }
      }
      else if (matrix[r][c] == 0 && matrix[r+1][c+1] == 2 && matrix[r+2][c+2] == 2 && matrix[r+3][c+3] == 2){
        let index = firstEmptyCell(c);
        if(index == r){
          if(playValue <= 4){
            playValue = 4;
            column = c;
            row = r;
          }
        }
        else{
          non_playable.push(c);
        }
      }
    }
  }
  //diagonal negativa
  for (let c=0;c<cols-3;c++){
		for (let r=3;r<rows;r++){
			if (matrix[r][c] == 1 && matrix[r-1][c+1] == 1 && matrix[r-2][c+2] == 1 && matrix[r-3][c+3] == 0){
        let index = firstEmptyCell(c+3);
        if(index == r-3){
          if(playValue <= 3){
            playValue = 3;
            column = c+3;
            row = r-3;
          }
        }
        else{
          non_playable.push(c+3);
        }
      }
      else if (matrix[r][c] == 2 && matrix[r-1][c+1] == 2 && matrix[r-2][c+2] == 2 && matrix[r-3][c+3] == 0){
        let index = firstEmptyCell(c+3);
        if(index == r-3){
          if(playValue <= 4){
            playValue = 4;
            column = c+3;
            row = r-3;
          }
        }
        else{
          non_playable.push(c+3);
        }
      }
      else if (matrix[r][c] == 1 && matrix[r-1][c+1] == 1 && matrix[r-2][c+2] == 0 && matrix[r-3][c+3] == 1){
        let index = firstEmptyCell(c+2);
        if(index == r-2){
          if(playValue <= 3){
            playValue = 3;
            column = c+2;
            row = r-2;
          }
        }
        else{
          non_playable.push(c+2);
        }
      }
      else if (matrix[r][c] == 2 && matrix[r-1][c+1] == 2 && matrix[r-2][c+2] == 0 && matrix[r-3][c+3] == 2){
        let index = firstEmptyCell(c+2);
        if(index == r-2){
          if(playValue <= 4){
            playValue = 4;
            column = c+2;
            row = r-2;
          }
        }
        else{
          non_playable.push(c+2);
        }
      }
      else if (matrix[r][c] == 1 && matrix[r-1][c+1] == 0 && matrix[r-2][c+2] == 1 && matrix[r-3][c+3] == 1){
        let index = firstEmptyCell(c+1);
        if(index == r-1){
          if(playValue <= 3){
            playValue = 3;
            column = c+1;
            row = r-1;
          }
        }
        else{
          non_playable.push(c+1);
        }
      }
      else if (matrix[r][c] == 2 && matrix[r-1][c+1] == 0 && matrix[r-2][c+2] == 2 && matrix[r-3][c+3] == 2){
        let index = firstEmptyCell(c+1);
        if(index == r-1){
          if(playValue <= 4){
            playValue = 4;
            column = c+1;
            row = r-1;
          }
        }
        else{
          non_playable.push(c+1);
        }
      }
      else if (matrix[r][c] == 0 && matrix[r-1][c+1] == 1 && matrix[r-2][c+2] == 1 && matrix[r-3][c+3] == 1){
        let index = firstEmptyCell(c);
        if(index == r){
          if(playValue <= 3){
            playValue = 3;
            column = c;
            row = r;
          }
        }
        else{
          non_playable.push(c);
        }
      }
      else if (matrix[r][c] == 0 && matrix[r-1][c+1] == 2 && matrix[r-2][c+2] == 2 && matrix[r-3][c+3] == 2){
        let index = firstEmptyCell(c);
        if(index == r){
          if(playValue <= 4){
            playValue = 4;
            column = c;
            row = r;
          }
        }
        else{
          non_playable.push(c);
        }
      }
    }
  }
  return [row,column];
}



function checkTie(){
  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      if(matrix[r][c] == 0){
        return false;
      }
    }
  }
  return true;
}


function checkWin(piece){
  // horizontal
	for(let c=0;c<cols-3;c++){
		for (let r=0;r<rows;r++){
			if (matrix[r][c] == piece && matrix[r][c+1] == piece && matrix[r][c+2] == piece && matrix[r][c+3] == piece){
				return true;
      }
    }
  }

	//vertical
	for (let c=0;c<cols;c++){
		for (let r=0;r<rows-3;r++){
			if (matrix[r][c] == piece && matrix[r+1][c] == piece && matrix[r+2][c] == piece && matrix[r+3][c] == piece){
				return true;
      }
    }
  }

	//diagonais positivas
	for (let c=0;c<cols-3;c++){
		for (let r=0;r<rows-3;r++){
			if (matrix[r][c] == piece && matrix[r+1][c+1] == piece && matrix[r+2][c+2] == piece && matrix[r+3][c+3] == piece){
				return true;
      }
    }
  }

	// diagonais negativas
	for (let c=0;c<cols-3;c++){
		for (let r=3;r<rows;r++){
			if (matrix[r][c] == piece && matrix[r-1][c+1] == piece && matrix[r-2][c+2] == piece && matrix[r-3][c+3] == piece){
				return true;
      }
    }
  }
  return false;
}

function winPrompt(){
  let menu = document.getElementById("menu");
  if(checkTie() == true){
    showVictory(0);
    setTimeout(hideVictory,1000);
    let elem = document.getElementById("background");
    elem.parentNode.removeChild(elem);
    game_status ="stopped";
    current_player = starting_player;
    menu.style.display = "block";
    return;
  }
  let x = checkWin(1);
  if(x == true){
    showVictory(1);
    setTimeout(hideVictory,1000);
    let elem = document.getElementById("background");
    elem.parentNode.removeChild(elem);
    game_status ="stopped";
    current_player = starting_player;
    score1++;
    menu.style.display = "block";
  }
  else{
    let y = checkWin(2);
    if(y == true){
      showVictory(2);
      setTimeout(hideVictory,1000);
      let elem = document.getElementById("background");
      elem.parentNode.removeChild(elem);
      game_status = "stopped";
      current_player = starting_player;
      score2++;
      menu.style.display = "block";
    }
  }
  return;
}


function displayRegras(){
  let menu = document.getElementById("menu");
  menu.style.display = "none";
  let regras = document.getElementById("rules_background");
  regras.style.display ="flex";
}

function displayScore(){
  let menu = document.getElementById("menu");
  menu.style.display = "none";
  let score_div = document.getElementById("score_div");
  let score_player1 = document.createElement("div");
  let score_player2 = document.createElement("div");
  let divider = document.createElement("div");
  let text1 = document.createTextNode(score1.toString());
  let text2 = document.createTextNode(score2.toString());
  let text3 = document.createTextNode(":");
  score_player1.appendChild(text1);
  score_player2.appendChild(text2);
  divider.appendChild(text3);
  if(!document.getElementById("score_player1")){
    score_player1.id = "score_player1";
    score_player2.id = "score_player2";
    divider.id = "divider";
    score_div.appendChild(score_player1);
    score_div.appendChild(divider);
    score_div.appendChild(score_player2);
  }
  else{
    let score_player1_prev = document.getElementById("score_player1");
    score_player1_prev.parentNode.removeChild(score_player1_prev);
    let score_player2_prev = document.getElementById("score_player2");
    score_player2_prev.parentNode.removeChild(score_player2_prev);
    let divider = document.getElementById("divider");
    divider.parentNode.removeChild(divider);
    score_player1.id = "score_player1";
    score_player2.id = "score_player2";
    divider.id = "divider";
    score_div.appendChild(score_player1);
    score_div.appendChild(divider);
    score_div.appendChild(score_player2);
  }
  let score = document.getElementById("score_background");
  score.style.display ="flex";
}

function displayConfig(){
  let menu = document.getElementById("menu");
  menu.style.display = "none";
  let config = document.getElementById("config_background");
  config.style.display ="flex";
}

function displayMenu(){
  let menu = document.getElementById("menu");
  menu.style.display = "block";
  let login = document.getElementById("login");
  login.style.display = "none";
}

function login(){
  let submit = document.getElementById("submit");
  submit.style.visibility = "visible"
  let username = document.getElementById("username");
  username.value = "";
  let password = document.getElementById("password");
  password.value = "";
}

function voltar(div_name){
  if(div_name == "board"){
    var div = document.getElementById("background");
  }
  else{
    var div = document.getElementById(div_name+"_background");
  }
  div.style.display = "none";
  let menu = document.getElementById("menu");
  menu.style.display = "block";
}

function desistir(){
  if(current_player == 1){
    showVictory(2);
    setTimeout(hideVictory,1000);
    score2++;
  }
  else{
    showVictory(1);
    setTimeout(hideVictory,1000);
    score1++;
  }
  let elem = document.getElementById("background");
  elem.parentNode.removeChild(elem);
  game_status ="stopped";
  current_player = starting_player;
  menu.style.display = "block";
  return;
}

function change_size(num){
  let select_box = document.getElementById("select_tamanho"+num)
  var selectedValue = select_box.options[select_box.selectedIndex].value;
  if(num == 1){
    rows_copy = parseInt(selectedValue,10);
  }
  else{
    cols_copy = parseInt(selectedValue,10);
  }
}

function change_gamemode(string){
  if(string == "single"){
    let singleplayer = document.getElementById("singleplayer");
    let multiplayer = document.getElementById("multiplayer");
    singleplayer.style.backgroundColor = "#ed4759";
    multiplayer.style.backgroundColor = "#f7ac98";
    game_type_copy = "singleplayer";
  }
  else{
    let singleplayer = document.getElementById("singleplayer");
    let multiplayer = document.getElementById("multiplayer");
    multiplayer.style.backgroundColor = "#ed4759";
    singleplayer.style.backgroundColor = "#f7ac98";
    game_type_copy = "multiplayer";
  }
}

function change_startPlayer(string){
  if(string == "player1"){
    starting_player_copy = 1;
    let bola1 = document.getElementById("bola1");
    let player1 = document.getElementById("player1");
    let bola2 = document.getElementById("bola2");
    let player2 = document.getElementById("player2");
    bola1.style.backgroundColor = "red";
    bola2.style.backgroundColor = "#ffff73";
    player1.style.backgroundColor = "#ed4759";
    player2.style.backgroundColor = "#f7ac98";
  }
  else{
    starting_player_copy = 2;
    let bola1 = document.getElementById("bola1");
    let player1 = document.getElementById("player1");
    let bola2 = document.getElementById("bola2");
    let player2 = document.getElementById("player2");
    bola1.style.backgroundColor = "#ff9999";
    bola2.style.backgroundColor = "yellow";
    player1.style.backgroundColor = "#f7ac98";
    player2.style.backgroundColor = "#ed4759";
  }
}

function changeTurnDisplay(){
  if(game_status!="stopped"){
    let p1 = document.getElementById("p1");
    let p2 = document.getElementById("p2");
    let ficha1 = document.getElementById("ficha1");
    let ficha2 = document.getElementById("ficha2");
    if(current_player==2){
      p1.style.display = "none";
      p2.style.display = "flex";
      ficha2.style.display = "block";
      ficha1.style.display = "none";
    }
    else{
      p2.style.display = "none";
      p1.style.display = "flex";
      ficha1.style.display = "block";
      ficha2.style.display = "none";
    }
  }
}

function disableOnclick(){
  let squares = document.getElementsByClassName("board_square");
  for (let i=0; i < squares.length; i++){
    squares[i].onclick = null;
  }
}

function enableOnlick(){
  let squares = document.getElementsByClassName("board_square");
  for (let i=0; i < squares.length; i++){
    let square_id = squares[i].id;
    let coluna = parseInt(square_id.charAt(9),10);
    var click = function(){ play(coluna)};
    squares[i].onclick = click;
  }
}

function mouseOver(col){
  for(let i=0;i<rows;i++){
    let square = document.getElementById("square_"+i+"_"+col);
    square.style.borderColor = "#1c9eff";
  }
}

function mouseOut(col){
  for(let i=0;i<rows;i++){
    let square = document.getElementById("square_"+i+"_"+col);
    square.style.borderColor = "blue";
  }
}

function showVictory(winner){
  if(winner==0){
    var text = document.createTextNode("O jogo acabou num empate.");
  }
  else{
    var text = document.createTextNode("O jogador "+winner+" ganhou!");
  }
  let menu = document.getElementById("menu");
  let div = document.createElement("div");
  div.id = "VictoryScreen";
  text.id = "VictoryText";
  div.appendChild(text);
  menu.appendChild(div);
}

function hideVictory(){
  let victory = document.getElementById("VictoryScreen");
  victory.parentNode.removeChild(victory);
}

function change_dificulty(elem){
  let facil = document.getElementById("facil");
  let dificil = document.getElementById("dificil");
  let medio = document.getElementById("medio");
  if(elem == "easy"){
    facil.style.backgroundColor = "#ed4759";
    dificil.style.backgroundColor = "#f7ac98";
    medio.style.backgroundColor = "#f7ac98";
    dificulty_copy = "easy";
  }
  if(elem =="hard"){
    facil.style.backgroundColor = "#f7ac98";
    dificil.style.backgroundColor = "#ed4759";
    medio.style.backgroundColor = "#f7ac98";
    dificulty_copy = "hard";
  }
  if(elem =="medium"){
    facil.style.backgroundColor = "#f7ac98";
    dificil.style.backgroundColor = "#f7ac98";
    medio.style.backgroundColor = "#ed4759";
    dificulty_copy = "medium";
  }
}
