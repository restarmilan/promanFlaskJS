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
            dom.clearContent();
            dom.showBoards(boards);
        });
    },
    clearContent: function () {
        document.getElementById('boards').textContent = '';
    },
    showBoards: function (boards) {
        // shows boards appending them to #boards div
        // it adds necessary event listeners also}

        let boardList = '';

        for (let board of boards) {
            boardList += `
                <div id="board-${board.id}">${board.title}</div>
            `;
        }

        const outerHtml = `
          <div class="board-container">  
                ${boardList}
          </div>
        `;
        console.log(outerHtml);
        this._appendToElement(document.querySelector('#boards'), outerHtml);
    },
    loadCards: function (boardId) {

        dataHandler.getCardsByBoardId(boardId, function (callback) {
            dom.showCards(callback);
        });
        // retrieves cards and makes showCards called
    },
    showCards: function (cards) {
        // shows the cards of a board
        // it adds necessary event listeners also
        let newCards = dom.sortByID(cards,"new");
        let inProgressCards = dom.sortByID(cards, "in progress");
        let testingCards = dom.sortByID(cards, "testing");
        let doneCards = dom.sortByID(cards, "done");
        let boardID = '#board-' + cards[0]['board_id'];
        const outerHtml = `
            <div id="new">
                ${newCards}
            </div>
            <div id="in-progress">
                ${inProgressCards}
            </div>
            <div id="testing">
                ${testingCards}
            </div>
            <div id="done">
                ${doneCards}
            </div>
        `;
        this._appendToElement(document.querySelector(boardID), outerHtml);
        // here comes more features
    },
    sortByID: function (cards, status_id) {
        let cardsByID = '';
        for (let card of cards) {
            if (card.status_id === status_id) {
                cardsByID += `
                    <div card-id="${card.id}" board-id="${card.board_id}" status-id='${card.status_id}'>${card.title}</div>
                `;
            }
        }
        return cardsByID;
    }
};
