document.addEventListener("DOMContentLoaded", () => {
    squares();



    function squares(){

        const gameBoard = document.getElementById("board")
        for (let i = 1; i <= 30; i++){
            let square = document.createElement("div");
            square.classList.add("square");
            square.setAttribute("id", i)
            gameBoard.appendChild(square)
        }
    }
})