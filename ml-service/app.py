from flask import Flask, request, jsonify

app = Flask(__name__)

def predict_category(text):
    text = text.lower()

    if any(word in text for word in ["steal", "stolen", "theft", "robbery", "bike", "mobile","stole","lost"]):
        return "Theft"
    elif any(word in text for word in ["attack", "hit", "assault", "fight", "injured"]):
        return "Assault"
    elif any(word in text for word in ["hack", "fraud", "scam", "otp", "cyber", "online"]):
        return "Cyber Crime"
    else:
        return "Other"

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    description = data.get("description", "")
    category = predict_category(description)
    return jsonify({"category": category})

if __name__ == "__main__":
    app.run(port=5001)
