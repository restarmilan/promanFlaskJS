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
                <section class="board">
                    <div class="board-header"><span class="board-title">${board.title}</span>
                        <button class="board-add">Add card</button>
                        <button class="board-toggle"><i class="fas fa-chevron-down"></i></button>
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
        let newCards = dom.sortByID(cards, "new");
        let inProgressCards = dom.sortByID(cards, "in-progress");
        let testingCards = dom.sortByID(cards, "testing");
        let doneCards = dom.sortByID(cards, "done");
        let boardID = 'board-' + cards[0]['board_id'];
        const outerHtml = `
            ${dom.sortColumnsByID(newCards, "new")}
            ${dom.sortColumnsByID(inProgressCards, "in-progress")}
            ${dom.sortColumnsByID(testingCards, "testing")}
            ${dom.sortColumnsByID(doneCards, "done")}
        `;
        this._appendToElement(document.getElementById(boardID), outerHtml);
        // here comes more features
    },
    sortByID: function (cards, status_id) {
        let cardsByID = '';
        for (let card of cards) {
            if (card.status_id === status_id) {
                cardsByID += `
                    <div class="card" card-id="${card.id}" board-id="${card.board_id}" status-id='${card.status_id}'>
                        <div class="card-remove"><i class="fas fa-trash-alt"></i></div>
                        <div class="board-title">${card.title}</div>              
                    </div>
                `;
            }
        }
        return cardsByID;
    },
    sortColumnsByID: function (content, status) {
        let column = `
            <div class="board-column" id="${status}">
                <div class="board-title">${status}</div>
                <div class="board-column-content">
                    ${content}
                </div>
            </div>
            `;
        return column;
    }
};
