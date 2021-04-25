let userScore = 0;
let computerScore = 0;
//html elements that store dom variables
const userScore_span = document.getElementById("user-score");
const computerScore_span = document.getElementById("computer-score");
//store in variables for later use
const scoreBoard_div = document.querySelector(".score-board");
const result_div = document.querySelector(".result > p");
const rock_div = document.getElementById("r");
const paper_div = document.getElementById("p");
const scissors_div = document.getElementById("s");


function getComputerChoice(){
    const choices = ['r', 'p', 's'];
    const r = Math.floor(Math.random()*3);
    return choices[r];
}
function convertToWord(letter){
    if (letter == 'r') return "Rock";
    if (letter == 'p') return "Paper";
    else return "Scissors";
}
function win(userChoice, computerChoice){
    userScore++;
    userScore_span.innerHTML = userScore;
    computerScore_span.innerHTML = computerScore;
    result_div.innerHTML = `${convertToWord(userChoice)} beats ${convertToWord(computerChoice)}. You win!`;
    document.getElementById(userChoice).classList.add('green-glow');
    setTimeout(() => document.getElementById(userChoice).classList.remove('green-glow'), 300);
}



function lose(userChoice, computerChoice){
    computerScore++;
    userScore_span.innerHTML = userScore;
    computerScore_span.innerHTML = computerScore;
    result_div.innerHTML = convertToWord(computerChoice) + " beats " + convertToWord(userChoice) + ". You lose!";
    document.getElementById(userChoice).classList.add('red-glow');
    setTimeout(() => document.getElementById(userChoice).classList.remove('red-glow') , 300);

}
function draw(userChoice, computerChoice){
    userScore_span.innerHTML = userScore;
    computerScore_span.innerHTML = computerScore;
    result_div.innerHTML = convertToWord(computerChoice) + " and " + convertToWord(userChoice) + ". You win!";
    document.getElementById(userChoice).classList.add('gray-glow');
    setTimeout(() => document.getElementById(userChoice).classList.remove('gray-glow') , 300);

}

function game(userChoice){
    const computerChoice = getComputerChoice();
    switch (userChoice + computerChoice) {
        case 'rs':
        case 'pr':
        case 'sp':
            console.log("user wins!");
            win(userChoice, computerChoice);
            break;
        case 'rp':
        case 'ps':
        case 'sr':
            console.log("computer wins!");
            lose(userChoice, computerChoice);
            break;
        case 'rr':
        case 'pp':
        case 'ss':
            console.log("a draw!");
            draw(userChoice, computerChoice);
            break;
    }

}

function main(){
    
    rock_div.addEventListener('click', function(){
        game("r");
        console.log("rock clicked");
    })
    paper_div.addEventListener('click', function(){
        game("p");
        console.log("paper clicked");
    })
    scissors_div.addEventListener('click', function(){
        game("s");
        console.log("scissors clicked");
    })
}



main();