from flask import Flask, render_template, url_for, request, session
from util import json_response

import data_handler

app = Flask(__name__)

app.secret_key = b'_5#y2L"F4Q8z\n\xec]/'


@app.route("/")
def index():
    """
    This is a one-pager which shows all the boards and cards
    """
    return render_template('index.html')


@app.route("/get-boards")
@json_response
def get_boards():
    """
    All the boards
    """
    return data_handler.get_boards()


@app.route("/get-cards/<int:board_id>")
@json_response
def get_cards_for_board(board_id: int):
    """
    All cards that belongs to a board
    :param board_id: id of the parent board
    """
    return data_handler.get_cards_for_board(board_id)


@app.route("/get-card-status/<int:status_id>")
@json_response
def get_card_status(status_id: int):
    return data_handler.get_card_status(status_id)


@app.route("/save-new-board/<title>")
@json_response
def save_new_board(title):
    return data_handler.save_new_board(title)


@app.route("/save-card-data", methods=['GET', 'POST'])
@json_response
def save_card_data():
    card_data = request.json['saveData']
    print(card_data)
    data_handler.update_card_changes(card_data)

  
@app.route("/save-new-card/<card_title>/<board_id>/<status_id>")
@json_response
def save_new_card(card_title, board_id, status_id):
    return data_handler.save_new_card(card_title, board_id, status_id)


@app.route("/remove-card/<card_id>")
@json_response
def remove_card(card_id):
    return data_handler.remove_card(card_id)


@app.route('/update-board-name', methods=['GET', 'POST'])
@json_response
def update_board_name():
    data = request.json['data']
    print(data)
    data_handler.update_board_name(data)


@app.route('/registration', methods=['POST'])
@json_response
def registration():
    if data_handler.verify_user_name(request.json['username']):
        data_handler.add_new_user(request.json['username'], request.json['password'])
        return True
    else:
        return False


@app.route('/login', methods=['POST'])
@json_response
def login():
    if data_handler.verify_login_data(request.json['username'], request.json['password']):
        session['username'] = request.json['username']
        return True
    return False


@app.route('/logout')
@json_response
def logout():
    session.pop('username', None)
    return True


def main():
    app.run(debug=True)

    # Serving the favicon
    with app.app_context():
        app.add_url_rule('/favicon.ico', redirect_to=url_for('static', filename='favicon/favicon.ico'))


if __name__ == '__main__':
    main()
