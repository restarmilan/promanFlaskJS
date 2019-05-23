// It uses data_handler.js to visualize elements
import {dataHandler} from "./data_handler.js";

export let dom = {
    _appendToElement: function (elementToExtend, textToAppend, prepend = false) {
        // function to append new DOM elements (represented by a string) to an existing DOM element
        let fakeDiv = document.createElement('div');
        fakeDiv.innerHTML = textToAppend.trim();

        for (let childNode of fakeDiv.childNodes) {
            if (prepend) {
                elementToExtend.prependChild(childNode);
            } else {
                elementToExtend.appendChild(childNode);
            }
        }

        return elementToExtend.lastChild;
    },
    init: function () {
        // This function should run once, when the page is loaded.
    },
    loadBoards: function () {
        // retrieves boards and makes showBoards called
        dataHandler.getBoards(function (boards) {
            dom.clearContent('boards');
            dom.showBoards(boards);
        });
    },
    clearContent: function (elementID) {
        document.getElementById(elementID).textContent = '';
    },
    removeCard: function (element) {
        element.parentNode.removeChild(element);
    },
    showBoards: function (boards) {
        // shows boards appending them to #boards div
        // it adds necessary event listeners also}

        let boardList = '';

        for (let board of boards) {
            boardList += `
                <section class="board">
                    <div class="board-header"><span class="board-title" data-id="${boards.indexOf(board)}">${board.title}</span>
                        <button class="board-add" id="add-to-board-${board.id}">Add card</button>
                        <button class="renameButton" data-id="${boards.indexOf(board)}">Rename board</button>
                        <button class="board-toggle" id="toggle-board-${board.id}" ><i class="fas fa-chevron-down"></i></button>
           
                    </div>
                    <div class="board-columns" id="board-${board.id}"></div>
                </section>
            `;
        }

        const outerHtml = `
          <div class="board-container">  
                ${boardList}
          </div>
        `;
        console.log(outerHtml);
        this._appendToElement(document.querySelector('#boards'), outerHtml);
        dom.addEventListenerForToggleButtons(boards);
        dom.addEventListenerForAddCardButton(boards);
        dom.addEventListenerForRenameButtons();
    },
    addEventListenerForAddCardButton: function (boards) {
        for (let board of boards) {
            document.getElementById('add-to-board-' + board.id).addEventListener("click", function () {
                dataHandler.createNewCard(prompt('Please enter card title !'), board.id, "0", function () {
                    dom.loadCards(board.id);
                })
            });
        }
    },
    addEventListenerForToggleButtons: function (boards) {
        for (let board of boards) {
            document.getElementById('toggle-board-' + board.id).addEventListener("click", function () {
                if (document.getElementById("board-" + board.id).firstChild === null) {
                    dom.loadCards(board.id);
                } else {
                    dom.closeBoardContent(document.getElementsByClassName("board-column-" + board.id), document.getElementById("board-" + board.id));
                }
            });
        }
    },
    closeBoardContent: function (elements, parent) {
        for (let elementIndex = elements.length - 1; elementIndex > -1; elementIndex--) {
            parent.removeChild(elements[elementIndex]);
        }
    },
    addEventListenerForRenameButtons: function () {
        let boardNames = document.getElementsByClassName('board-title');
        let renameButtons = document.getElementsByClassName('renameButton');
        for (let board of boardNames) {
            for (let buttons of renameButtons) {
                if (board.dataset.id === buttons.dataset.id) {
                    buttons.addEventListener('click', function () {
                        board.textContent = prompt('You can change your boardname here: ');
                    })
                }
            }
        }
    },
    loadCards: function (boardId) {

        dataHandler.getCardsByBoardId(boardId, function (callback) {
            dom.clearContent('board-' + boardId);
            dom.showCards(callback);
        });
        // retrieves cards and makes showCards called
    },
    showCards: function (cards) {
        // shows the cards of a board
        // it adds necessary event listeners also
        let newCards = dom.sortByID(cards, "new");
        let inProgressCards = dom.sortByID(cards, "in-progress");
        let testingCards = dom.sortByID(cards, "testing");
        let doneCards = dom.sortByID(cards, "done");
        let boardNumber = cards[0]['board_id'];
        let boardID = 'board-' + boardNumber;
        const outerHtml = `
            ${dom.sortColumnsByID(newCards, "new", boardNumber)}
            ${dom.sortColumnsByID(inProgressCards, "in-progress", boardNumber)}
            ${dom.sortColumnsByID(testingCards, "testing", boardNumber)}
            ${dom.sortColumnsByID(doneCards, "done", boardNumber)}
        `;
        this._appendToElement(document.getElementById(boardID), outerHtml);
        dom.addEventListenerForRenameCardButtons();

        this.createDragula(cards)
        // here comes more features
        dom.addEventListenerForRemoveButton(cards);


    },
    addEventListenerForRemoveButton: function (cards) {
        for (let card of cards) {
            document.getElementById('remove-card-' + card.id).addEventListener("click", function () {
                dataHandler.removeCard(card.id, function () {
                    dom.loadCards(card.board_id);
                });
            });
        }
    },
    sortByID: function (cards, status_id) {
        let cardsByID = '';
        for (let card of cards) {
            if (card.status_id === status_id) {
                cardsByID += `
                    <div class="card" id="board-${card.board_id}-card-${card.id}" cardId="${card.id}" boardId="${card.board_id}" statusId='${card.status_id}'>
                        <div class="card-remove" id="remove-card-${card.id}"><i class="fas fa-trash-alt"></i></div>
                        <div class ="card-rename" data-cardid="${cards.indexOf(card)}"><i class="fas fa-pen"></i></div>
                        <div class="board-title" data-cardid="${cards.indexOf(card)}">${card.title}</div>              
                    </div>
                `;
            }
        }
        return cardsByID;
    },
    sortColumnsByID: function (content, status, boardID) {
        return `
            <div class="board-column-${boardID}" id="board-column" >
                <div class="board-title">${status}</div>
                <div class="board-column-content" id="${boardID}-${status}">
                    ${content}
                </div>
            </div>
            `;
    },
    createDragula: function (cards) {
        let drake = dragula([document.getElementById(`${cards[0].board_id}-new`), document.getElementById(`${cards[0].board_id}-in-progress`), document.getElementById(`${cards[0].board_id}-testing`), document.getElementById(`${cards[0].board_id}-done`)])
        drake.on('drop', function (el, target, source, sibling) {
            //call your function here
            console.log(el.attributes.statusid.value);
            console.log(target.id.substring(2));
            el.setAttribute('statusId', target.id.substring(2));
            dataHandler.saveCardData()
        })
    },
    addEventListenerForAddBoardButton: function () {
        document.getElementById("add-board").addEventListener("click", function () {
            dataHandler.createNewBoard(prompt("Enter board name !"), function () {
                dom.loadBoards();
            });
        });

    },
    addEventListenerForRenameCardButtons : function(){
        let cardNames = document.getElementsByClassName('board-title');
        let renameCardButtons = document.getElementsByClassName('card-rename');
        for (let card of cardNames) {
            for (let button of renameCardButtons) {
                if (card.dataset.cardid === button.dataset.cardid) {
                    button.addEventListener('click', function () {
                    card.textContent = prompt('You can change your cardname here: ');
                    dataHandler.saveCardData()

                    })
                }
            }
        }
    },
};


