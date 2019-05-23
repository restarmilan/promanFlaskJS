import csv

STATUSES_FILE = './data/statuses.csv'
BOARDS_FILE = './data/boards.csv'
CARDS_FILE = './data/cards.csv'

_cache = {}  # We store cached data in this dict to avoid multiple file readings


def _read_csv(file_name):
    """
    Reads content of a .csv file
    :param file_name: relative path to data file
    :return: OrderedDict
    """
    with open(file_name) as boards:
        rows = csv.DictReader(boards, delimiter=',', quotechar='"')
        formatted_data = []
        for row in rows:
            formatted_data.append(dict(row))
        return formatted_data


def _write_csv(filename, new_line, write_mode='a'):
    file = open(filename, write_mode)
    file.write(new_line)


def _write_whole_csv(filename, data):
    dataheader = []
    for keys in data[0]:
        dataheader.append(keys)
    print(dataheader)
    with open(filename, 'w') as file:
        writer = csv.DictWriter(file, fieldnames=dataheader, delimiter=',', quotechar='"')
        writer.writeheader()
        for item in data:
            writer.writerow(item)


def _get_data(data_type, file, force):
    """
    Reads defined type of data from file or cache
    :param data_type: key where the data is stored in cache
    :param file: relative path to data file
    :param force: if set to True, cache will be ignored
    :return: OrderedDict
    """
    if force or data_type not in _cache:
        _cache[data_type] = _read_csv(file)
    return _cache[data_type]


def save_new_board(id, title):
    new_line = f"{id},{title}\n"
    _write_csv(BOARDS_FILE, new_line)
    return get_boards()


def save_new_card(new_id, card_title, board_id, status_id):
    new_line = f"{new_id},{board_id},{card_title},{status_id},0\n"
    _write_csv(CARDS_FILE, new_line)
    return get_cards()


def remove_card(cards, write_mode):
    new_data = 'id,board_id,title,status_id,order\n'
    for card in cards:
        new_data += f"{card['id']},{card['board_id']},{card['title']},{card['status_id']},{card['order']}\n"
    _write_csv(CARDS_FILE, new_data, write_mode)
    return get_cards()


def clear_cache():
    for k in list(_cache.keys()):
        _cache.pop(k)


def get_statuses(force=False):
    return _get_data('statuses', STATUSES_FILE, force)


def get_boards(force=False):
    return _get_data('boards', BOARDS_FILE, force)


def get_cards(force=False):
    return _get_data('cards', CARDS_FILE, force)


def update_server_side_data(updated_data):
    _write_whole_csv(CARDS_FILE, updated_data)


def update_board_file(data):
    existing_boards = get_boards(force=True)
    for board in existing_boards:
        print(board)
        if data['id'] == board['id']:
            board['title'] = data["title"]
    _write_whole_csv(BOARDS_FILE, existing_boards)
