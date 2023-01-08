(()=> {

    const selectors = {
        playButton:       document.getElementById("playButton"),
        colsSelect:       document.getElementById("colsSelect"),
        rowsSelect:       document.getElementById("rowsSelect"),
        returnToHomePage: document.getElementById("returnToHomePage"),
        scoreBtn:         document.getElementById("scoreBtn"),
        closeHighScoreBtn:document.getElementById("closeHighScore"),
        highScoreButton:  document.getElementById("highScoreButton"),
    }
//-------------------------------------------------- listener ------------------------------------------------------
    document.addEventListener("DOMContentLoaded", () => {
        let listenerFunction = listenerFunctions();

        //home
        selectors.playButton.addEventListener("click", (event) => {
            listenerFunction.playButtonClick(event);
        });

        selectors.colsSelect.addEventListener("change", (event) => {
            listenerFunction.settingsSelect(event);
        });

        selectors.rowsSelect.addEventListener("change", (event) => {
            listenerFunction.settingsSelect(event);
        });

        //game
        selectors.returnToHomePage.addEventListener("click", (event) => {
            listenerFunction.backButtonClick("gameScreen", "homeScreen", ["gameScreenMain"]);
        });

        //score
        selectors.scoreBtn.addEventListener("click", () => {
            listenerFunction.backButtonClick("scoresScreen","homeScreen", ["scoresScreenHeader", "scoresScreenMain"]);
        });

        selectors.closeHighScoreBtn.addEventListener("click", () => {
            listenerFunction.backButtonClick("", "", ["modalBody"])
        });

        selectors.highScoreButton.addEventListener("click", () => {
            listenerFunction.highScoreClick("", "", ["modalBody"]);
        });
    });


//-------------------------------------------------- home handler ------------------------------------------------------
    /** a module for all the home screens fumctions and stored data
     * @type {{showSelectErrorMsg: (function(*=): {void}),homePageValidator: (function(*=):{modul of validator functions}), removeTextElement:  (function(*=):{void}), showInputErrorMsg:  (function(*=):{void})}}
     */
    function homeScreen(){

        /** takes an HTML element as an argument and appends a <span> element containing an error message to the provided element.
         * @param element - the element to ass the msg text in dom as child.
         */
        function showSelectErrorMsg(element){

            let textNode = document.createElement("span");

            textNode.setAttribute("id", "columnsError");
            textNode.setAttribute("class", "columns-error text-danger");
            textNode.textContent = "Number of card (rows X columns) must be even";

            element.appendChild(textNode);
        }

        /** a module of validator, holds all the validation functions of home page
         * @type {{isValidName: (function(*=): {boolean}),isValidRowsCols: (function(*=):{boolean})}}
         */
        function homePageValidator(){

            /**
             *  function checks whether a given product name is valid, based on the length of the name and the characters that it contains.
             *  @param productName - user name to check validation
             * @returns boolean */
            function isValidName(productName){
                let maxLen = 12;
                /** check leangth of string - at max 12*/
                function isValidLength () { return productName.length > 0 && productName.length <= maxLen; }
                /** check if the str contain letters and digits only*/
                function isValidChars  () { return /^[A-Za-z0-9]+$/.test(productName);  }

                return isValidLength() && isValidChars();
            }

            /** checks if the product size if valid, whether the product has an even number of cards
             * @param {*} productCols - number of cols
             * @param {*} productRows - number of rows
             * @returns boolean
             */
            function isValidRowsCols(productCols,productRows){
                return (productRows * productCols) % 2 === 0;
            }

            return {
                nameInput     : isValidName,
                settingsInput : isValidRowsCols,
            };
        }

        /** function removes the next sibling of an HTML element with the specified id
         *  @param idName is the id of element to remove text from
         */
        function removeTextElement(idName){

            let element = document.getElementById(idName);

            if(element.nextSibling)
            {
                element.nextSibling.remove();
            }
        }

        /** function sets a custom error message for an input field with the specified id and triggers the error message to be displayed.*/
        function showInputErrorMsg(){

            let userNameElement = document.getElementById("username");
            userNameElement.setCustomValidity("name can contain letters and digits only, 12 chars at max");
            userNameElement.reportValidity();
        }

        return {
            selectErr : showSelectErrorMsg,
            validator : homePageValidator,
            removeErr : removeTextElement,
            inputErr  :showInputErrorMsg,

        };
    }

//-------------------------------------------------- listeners functions -----------------------------------------------
    /** a module that holds all the listener functions.
     * @type {{playButtonClickHandler: (function(*=): {void}),rowsColsSelectHandler: (function(*=):{modul of validator functions}), highScoreBoard:  (function(*=):{void}), backButtonClickHandler:  (function(*=):{void}), screenTransition:  (function(*=):{void})}}
     */
    function listenerFunctions(){

        /** function is called when the "Play" button is clicked. It retrieves the product name, rows, columns, and delay from the relevant
         * input fields and passes them to the gameScreen function if the product name is valid. Otherwise, it displays an error message.
         * @param event - the current event that turned by the listner
         */
        const playButtonClickHandler = (event) => {
            event.preventDefault();

            let product = {
                name: document.getElementById("username").value.trim(),
                rows: document.getElementById("rows").value,
                cols: document.getElementById("cols").value,
                delay: document.getElementById("delay").value,
            }

            if(homeScreen().validator().nameInput(product.name))
            {
                screenTransition("homeScreen", "gameScreen", []);
                gameScreen(product);
            }

            else
            {
                homeScreen().inputErr();
            }
        }

        /**
         * function is called when the rows and columns select elements are changed. It removes any existing error messages and either enables
         * the "Play" button or displays an error message, depending on whether the number of rows and columns is valid.
         * @param event - the current event that turned by the listner
         */
        const rowsColsSelectHandler = (event) => {
            event.preventDefault();

            homeScreen().removeErr("rows");
            homeScreen().removeErr("cols");

            if (homeScreen().validator().settingsInput(document.getElementById("rows").value, document.getElementById("cols").value))
            {
                document.getElementById("playButton").disabled = false;
            }
            else
            {
                document.getElementById("playButton").disabled = true;
                homeScreen().selectErr(event.target.parentElement);
            }
        }

        /**
         * function is called when the "Back" button is clicked in any screen, sends the parameteres to screen transition and clear the old data of current screen.
         * @param currScreen - the id of the current screen
         * @param futureScreen - the id of the wanted screen to move for
         * @param headNodes - array that contains all the ids of ccontainers to delete from dom
         */
        const backButtonClickHandler = (currScreen, futureScreen, headNodes) => {
            screenTransition(currScreen,futureScreen,headNodes);
        }

        /** function is called when the "High Scores" button is clicked in home screen. It calls the scoreTable function from the scoreScreen module to display the high score table.
         * @param event - the current event that turned by the listner
         */
        function highScoreBoard(event) {
            scoreScreen().scoreTable("modalBody");
        }

        /**
         *   function is used to hide the current screen and show the specified future screen, and to remove all child nodes from the specified head nodes.
         * @param currScreen - the id of the current screen
         * @param futureScreen - the id of the wanted screen to move for
         * @param headNodes - array that contains all the ids of ccontainers to delete from dom
         */
        function screenTransition(currScreen, futureScreen, headNodes){

            const removeAllChildNodes = (parentNode) => {

                while (parentNode && parentNode.firstChild)
                {
                    parentNode.removeChild(parentNode.firstChild);
                }
            }

            const hideScreens = (currScreen, nextScreen) => {
                if(currScreen === "" || nextScreen === "") return;

                document.getElementById(currScreen).classList.add("d-none");
                document.getElementById(nextScreen).classList.remove("d-none");
            }

            hideScreens(currScreen, futureScreen);
            [...headNodes].forEach(headNode => {removeAllChildNodes(document.getElementById(headNode))});
        }

        return {
            playButtonClick : playButtonClickHandler,
            settingsSelect  : rowsColsSelectHandler,
            highScoreClick  : highScoreBoard,
            backButtonClick : backButtonClickHandler,
            screenTransition: screenTransition

        };
    }

//----------------------------------------------  game handler ---------------------------------------------------------
    /**
     * The gameScreen function initializes several variables, including an array of cards, an array of flipped cards, a counter for the
     * number of steps taken, and the maximum number of flipped cards. It then defines several functions that are used to manage the game.
     * @param product - all the user data that he entered in home screen -  contains the product name, rows, columns, and delay.
     * @returns {prepareGameData - {void}}
     */
    function gameScreen(product) {

        const {name, rows, cols, delay} = product

        let cards = [];
        let flippedCards = [];
        let maxFlippedCards = 2;
        let stepCounter = 0;


        /**is called when a card is clicked. It checks whether the maximum number of flipped cards has been reached, and if not, it calls the flipCard function to flip the card.
         * @param event - the current event that turned by the listner
         */
        const clickOnCardHandle = (event) => {

            if (flippedCards.length >= maxFlippedCards) return;
            if (event.target.classList.contains("flipped")) return;

            updateSteps();
            flipCard(event);
        }

        /** flips the card by updating its class and image source, and it adds the card to the flippedCards array.
         * If the maximum number of flipped cards has been reached, it calls the checkCards function after a delay.
         * @param event - the current event that turned by the listner
         * */
        const flipCard = (event) => {

            let srcId = cards[event.target.getAttribute('id')];
            updateCard("hidden", "flipped",  event.target, srcId);

            flippedCards = document.getElementsByClassName('flipped');
            if (flippedCards.length === maxFlippedCards) { setTimeout(()=>{checkCards()}, delay * 1000); }
        }

        /**
         *  updates the CSS class and image source for a card.
         * @param {*} currClass - str of class name of current the card mode
         * @param {*} futureClass - str of the future class name of the current card mode
         * @param {*} card  - element in dom
         * @param {*} srcClass - the number of the fitted img to the card
         */
        const updateCard = (currClass, futureClass, card, srcClass) => {
            card.classList.replace(currClass, futureClass);
            if (srcClass !== "")
            {
                card.src = `../images/${srcClass}.jpg`;
            }
        }

        /** compares the images of the two flipped cards. If they match, it marks the cards as matched. Otherwise, it flips the cards back over.
         *  If there are no more hidden cards, it calls the win function from the scoreScreen module to display the winning screen.*/
        const checkCards = () => {
            if (flippedCards[0] === undefined || flippedCards[1] === undefined) return;

            if (flippedCards[0].src === flippedCards[1].src)
            {
                [...flippedCards].forEach(card => {updateCard("flipped", "matched", card,"")});
            }
            else
            {
                [...flippedCards].forEach(card =>{updateCard("flipped","hidden", card,"card")});
            }

            flippedCards = [];

            if(document.getElementsByClassName('hidden').length === 0)
            {
                scoreScreen().win(cols, rows, delay, stepCounter, name);
            }
        }

        /***  increments the step counter and updates the step count on the game screen.*/
        const updateSteps = () => {
            stepCounter++;
            const steps = document.getElementById("steps");
            steps.innerHTML = `Steps: ${stepCounter}`;
        }

        /** creates the game board and appends it to the game screen. */
        const createGameScreen = () =>{
            const steps = document.createElement("div");
            steps.setAttribute('id', 'steps');
            steps.innerHTML = `Steps: 0`;

            let board = document.createElement('div');
            board.setAttribute('id', 'gameBoard');
            board.appendChild(steps);

            let counter = 0;

            for (let i = 0; i < rows; i++) {
                let row = document.createElement('div');
                row.classList.add('row','justify-content-center');

                for (let j = 0; j < cols; j++) {
                    let col = document.createElement('div');
                    col.classList.add('card', 'col-2');

                    let card = document.createElement('img');
                    card.src = '../images/card.jpg';
                    card.classList.add('hidden');
                    card.setAttribute('id', `${counter}`);
                    card.addEventListener('click', clickOnCardHandle);

                    col.appendChild(card);
                    row.appendChild(col);

                    counter++;
                }
                board.appendChild(row);
            }
            document.getElementById("gameScreenMain").prepend(board);
        }

        /** picks random images for the cards and creates an array of cards. */
        const pickRandomCards = () => {
            let arr = [...Array(15).keys()];

            for (let index = 0; index < (rows*cols)/2; index++)
            {
                let rand = Math.floor(Math.random() * arr.length);
                cards.push(arr[rand], arr[rand]);
                arr.splice(rand,1);
            }
        }

        /** shuffles the array of cards */
        const shuffle = () => {

            let i = cards.length;
            while (--i > 0) {
                let temp = Math.floor(Math.random() * (i + 1));
                [cards[temp], cards[i]] = [cards[i], cards[temp]];
            }
        }

        /** prepare the cards, and then it calls function to create the game screen and start the game. */
        function prepareGameData() {
            pickRandomCards();
            shuffle();
            createGameScreen();
        }

        return prepareGameData();
    }

//---------------------------------------------- score screen handler ---------------------------------------------------
    /** a module builds, calc and display leaderboard of the top three best users scores.
     * @type {{win: (function(*=): {void}),scoreTable: (function(*=):{void})
     */
    function scoreScreen(){

        /** : this function is called when the user wins the game. It transitions to the score screen and builds the score screen.
         * @param {*} cols -  the number of columns in the game grid
         * @param {*} rows - the number of rows in the game grid
         * @param {*} delay - the delay time of the game
         * @param {*} steps - the number of steps the user took to complete the game
         * @param {*} name -  the user's name
         */
        const winGame = (cols, rows, delay, steps, name) => {

            listenerFunctions().screenTransition("gameScreen", "scoresScreen", ["gameScreenMain"]);
            buildScoreScreen(cols, rows, delay, steps, name);
        }

        /** this function takes in a list of high scores and a username, and returns the user's ranking in the high scores list.
         * @param {*} highScores - array of top3 @param {*} name
         * @returns number - the rank of the user {1-4}
         */
        const getRank = (highScores, name) => {

            return (highScores.findIndex(user => user.username === name))+1;
        }

        /**  this function calculates the user's score, enters it into the high scores list, updates the top three high scores.
         * @param {*} newScore @param {*} newUsername
         * @returns str -  the user's ranking in the high scores list
         */
        const calcScores = (newScore, newUsername) => {

            newUsername = newUsername.toLowerCase();

            let highScores = JSON.parse(localStorage.getItem('highScores')) || [];

            enterNewScore(highScores, newUsername, newScore);

            updateTopThree(highScores);

            let rank = getRank(highScores, newUsername);

            return rankStr(rank);
        }

        /** this function takes in a list of high scores, a username, and a score, and updates the high scores list with the new score for the given user.
         * @param {*} highScores  - array of top3  @param {*} newUsername @param {*} newScore
         */
        const enterNewScore = (highScores,newUsername,newScore) => {
            let index = highScores.findIndex((user => user.username == newUsername));

            if(index !== -1)
            {
                highScores[index].score = (newScore > highScores[index].score) ? newScore : highScores[index].score;
            }
            else
            {
                highScores.push({ username: newUsername, score: newScore});
            }
        }

        /** this function takes in a list of high scores, sorts the list in descending order by score, and keeps only the top three scores.
         * @param {*} highScores -  - array of top3
         */
        const updateTopThree = (highScores) => {

            highScores.sort((a, b) => b.score - a.score);
            highScores = highScores.slice(0, 3);

            localStorage.clear();
            localStorage.setItem('highScores', JSON.stringify(highScores));
        }

        /** this function takes in a ranking and returns a string with the user's ranking in the high scores list.
         * @param {*} rank - number
         * @returns str of the user rank
         */
        const rankStr = (rank) => {

            return (rank > 0 && rank < 4) ? `You ranked ${rank} out of 3` : "Your score didnt enter to leaderBoard" ;
        }

        /** this function builds and displays the user's score and ranking on the score screen.
         * @param {*} gridSize  @param {*} currScore  @param {*} currUserRank
         */
        const buidUserInfo = (gridSize, currScore, currUserRank) => {

            let userInfo = document.createElement('h1');
            userInfo.innerText = "Game Over";

            let txt = document.createElement('h4');
            txt.innerText = `number of cards played: ${gridSize}`;

            let scoreData = document.createElement('h6');
            scoreData.innerText = `your score: ${currScore}!\n ${currUserRank}`;

            userInfo.appendChild(txt);
            txt.appendChild(scoreData);

            document.getElementById('scoresScreenHeader').prepend(userInfo);
        }

        /** this function builds and displays the table of top three high scores on the score screen.
         * @param {*} cols @param {*} rows  @param {*} delay @param {*} steps @param {*} name
         */
        const buildScoreScreen = (cols, rows, delay, steps, name) => {

            let currScore = calculateScore(cols, rows, delay, steps);
            let currUserRank = calcScores(currScore, name);

            buidUserInfo(cols*rows,currScore, currUserRank);

            buildScoreTable("scoresScreenMain");
        }

        /** this function builds and displays the table of top three high scores on the score screen.
         * @param {*} headNode - the id of element in dom to enter the leaferboard elment as a child,
         */
        const buildScoreTable = (headNode) => {
            // Create the table element
            let table = document.createElement('table');

            // Add the Bootstrap 5 table classes to the element
            table.classList.add('table', 'table-striped', 'table-bordered', 'table-hover');

            let thead = document.createElement('thead');
            let tbody = document.createElement('tbody');
            let headRow = document.createElement('tr');

            // Create table head cells for each column
            let rankH  = document.createElement('th');
            let nameH = document.createElement('th');
            let scoreH = document.createElement('th');

            // Add text to the table head cells
            rankH.innerText = "Rank";
            nameH.innerText = "Name";
            scoreH.innerText = "Score";

            // Add the table head cells to the row
            headRow.appendChild(rankH);
            headRow.appendChild(nameH);
            headRow.appendChild(scoreH);

            // Add the row to the table head
            thead.appendChild(headRow);

            let highScores = JSON.parse(localStorage.getItem('highScores'));
            for(let i = 0; i < highScores.length; ++i) {

                // Create a row for the table body
                let bodyRow = document.createElement('tr');

                // Create table body cells for each column
                let rankB = document.createElement('td');
                let nameB = document.createElement('td');
                let scoreB = document.createElement('td');

                // Add text to the table body cells
                rankB.innerText = `${i+1}`;
                nameB.innerText = `${highScores[i].username}`;
                scoreB.innerText = `${highScores[i].score}`;

                // Add the table body cells to the row
                bodyRow.appendChild(rankB);
                bodyRow.appendChild(nameB);
                bodyRow.appendChild(scoreB);

                // Add the row to the table body
                tbody.appendChild(bodyRow);
            }

            // Add the table head and body to the table
            table.appendChild(thead);
            table.appendChild(tbody);

            // Add the table to the page
            document.getElementById(headNode).appendChild(table);
        }

        /** This new calculation takes into account the number of correct matches, the delay, and the number of incorrect attempts, and assigns different weights to each factor. This means that
         *  the score will better reflect the player's performance, as players who make more correct matches will get higher scores, even if they have a higher delay or more incorrect attempts.
         * @param {*} cols  @param {*} rows @param {*} delay  @param {*} steps  @returns number - score*/
        const calculateScore = (cols, rows, delay, steps) => {
            let gameSize = cols * rows;
            let numMatches = gameSize / 2;
            let numIncorrectAttempts = steps - numMatches;

            // Set the weights for each factor
            let matchWeight = 10;
            let delayWeight = 5;
            let attemptWeight = 1;

            // Calculate the final score
            let score = matchWeight * numMatches - delayWeight * delay - attemptWeight * numIncorrectAttempts;
            return Math.max(Math.round(score*5), 0);
        }
        return {
            win : winGame,
            scoreTable : buildScoreTable,
        };
    }

})();