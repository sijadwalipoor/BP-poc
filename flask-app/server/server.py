import os
import json
from flask import Flask, request, abort, jsonify
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)

# Voor het resetten van de highscores, moet alles in de highscores file worden gewist.

# Om de highscores persistent te houden, zelfs wanneer de server opnieuw opstart, gebruik ik hiervoor een nieuwe
# JSON-file gebruiken:
HIGHSCORES_FILE = 'highscores.json'


# ============================================================
# ===== HELPER METHODS =======================================
# ============================================================

def load_highscores():
    try:
        with open(HIGHSCORES_FILE, 'r') as file:
            highscores_data = json.load(file)
            return highscores_data
    except (ValueError, FileNotFoundError):
        return {}


# Om mijn JSON-file niet steeds te moeten inladen, gebruik ik hiervoor een globale variabele,
# die mijn file juist één keer inleest:
highscores = load_highscores()


# Twee hulp methoden om code duplicatie te vermijden:
def save_highscores():
    with open(HIGHSCORES_FILE, 'w') as file:
        json.dump(highscores, file)


def create_response(key, message, status_code):
    message = {key: message}
    return jsonify(message), status_code


# ============================================================
# ===== LEVEL ROUTING ========================================
# ============================================================

# Geeft een JSON-object terug van het aantal levels uit de directory "levels".
@app.route('/levels')
def fetch_levels():
    number_of_levels = 0
    for filename in os.listdir("levels"):
        if filename.startswith("level") and filename.endswith(".json"):
            number_of_levels += 1
    data = {
        "aantal_levels": number_of_levels
    }
    return data, 200


# Geeft een JSON-object terug van een opgegeven level:
@app.route('/level/<int:level>')
def fetch_level(level: int):
    try:
        with open(f'levels/level{level}.json', 'r', encoding='utf-8') as level_file:
            level_json_data = json.load(level_file)
            new_json = {
                "level": level,
                "game": level_json_data
            }
            if f"highscore_{level}" not in highscores:
                new_json[f'highscore'] = -1
                highscores[f'highscore_{level}'] = -1
            new_json["highscore"] = highscores[f"highscore_{level}"]
            return jsonify(new_json), 200
    except FileNotFoundError:
        abort(404, f"Puzzel {level} bestaat niet.")


# Geeft een JSON-object terug van een random level:
@app.route('/random_level')
def fetch_random_level():
    levels_data, _ = fetch_levels()
    random_level_number = random.randint(1, levels_data["aantal_levels"])
    return fetch_level(random_level_number)[0]


# ============================================================
# ===== HIGHSCORE ROUTING ====================================
# ============================================================

@app.route('/highscore/<int:level>', methods=['POST'])
def update_highscore(level: int):
    score = ""
    try:
        score = request.json['highscore']
    except KeyError:
        abort(404, "Kan highscore niet veranderen met opgegeven JSON.")
    highscore_key = f"highscore_{level}"
    # Als er geen highscore bestaat voor de opgegeven level, nemen we als default waarde -1:
    current_highscore = highscores.get(highscore_key, -1)
    if (current_highscore > score or current_highscore == -1) and score > 0:
        highscores[highscore_key] = score
        save_highscores()
        return create_response('status',
                               f'Highscore succesvol bijgewerkt van {current_highscore} naar {score}.',
                               200)
    return jsonify({}), 304


# ============================================================
# ===== ERROR HANDELING  =====================================
# ============================================================


@app.errorhandler(404)
def not_found_error(error):
    return create_response("foutboodschap", str(error).split(": ")[1], 404)


if __name__ == '__main__':
    app.run(port=3000)
