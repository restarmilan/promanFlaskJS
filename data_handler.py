import persistence


def get_card_status(status_id):
    """
    Find the first status matching the given id
    :param status_id:
    :return: str
    """
    statuses = persistence.get_statuses()
    return next((status['title'] for status in statuses if status['id'] == str(status_id)), 'Unknown')


def save_new_board(title):
    boards = persistence.get_boards()
    last_board_id = boards[-1]["id"]
    new_id = int(last_board_id) + 1
    return persistence.save_new_board(new_id, title)


def get_boards():
    """
    Gather all boards
    :return:
    """
    return persistence.get_boards(force=True)


def get_cards_for_board(board_id):
    persistence.clear_cache()
    all_cards = persistence.get_cards()
    matching_cards = []
    for card in all_cards:
        if card['board_id'] == str(board_id):
            card['status_id'] = get_card_status(card['status_id'])  # Set textual status for the card
            matching_cards.append(card)
    return matching_cards


def update_card_changes(cards_data):
    existing_cards = persistence.get_cards(force=True)
    statuses = persistence.get_statuses(force=True)
    formated_card_data = _formate_card_data(cards_data, statuses)
    for card in formated_card_data:
        for index, existing_card in enumerate(existing_cards):
            if card['id'] == existing_card['id']:
                existing_cards[index]['title'], existing_cards[index]['status_id'] = card['title'], card['status_id']
    print(existing_cards)
    persistence.update_server_side_data(existing_cards)


def _formate_card_data(cards_data, statuses):
    formated_card_data = []
    for card in cards_data:
        for status in statuses:
            if card['status_id'] == status['title']:
                card['status_id'] = status['id']
                formated_card_data.append(card)
    return formated_card_data
