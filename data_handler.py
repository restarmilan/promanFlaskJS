import persistence


def get_card_status(status_id):
    """
    Find the first status matching the given id
    :param status_id:
    :return: str
    """
    statuses = persistence.get_statuses()
    return next((status['title'] for status in statuses if status['id'] == str(status_id)), 'Unknown')


def convert_status(status):
    if status == "new":
        return 0
    elif status == "in-progress":
        return 1
    elif status == "testing":
        return 2
    elif status == "done":
        return 3
    return status


def save_new_board(title):
    boards = persistence.get_boards()
    last_board_id = boards[-1]["id"]
    new_id = int(last_board_id) + 1
    return persistence.save_new_board(new_id, title)


def save_new_card(card_title, board_id, status_id):
    cards = persistence.get_cards()
    last_card_id = cards[-1]["id"]
    new_id = int(last_card_id) + 1
    return persistence.save_new_card(new_id, card_title, board_id, status_id)


def remove_card(card_id):
    cards = persistence.get_cards()
    index_to_remove = 0
    for card in cards:
        card['status_id'] = convert_status(card['status_id'])
        if card["id"] == card_id:
            index_to_remove = cards.index(card)
    cards.pop(index_to_remove)
    return persistence.remove_card(cards, 'w')


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
    print(formated_card_data)
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
