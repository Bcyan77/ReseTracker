from flask import Flask, jsonify, request
from dotenv import load_dotenv
from flask_cors import CORS
import requests
import os
import time
import json

load_dotenv()
API_KEY = os.getenv("BUNGIE_API_KEY")

app = Flask(__name__)
CORS(app)

baseURL = "https://www.bungie.net/Platform"

# 캐시
data_cache = {
    "milestone": None,
    "vendor": None,
    "milestone_def": None,
    "activity_def": None,
    "modifier_def": None,
    "activity_type_map": None,
    "timestamp": 0
}

@app.route("/manifest")
def get_manifest():
    headers = {"X-API-Key": API_KEY}
    response = requests.get(f"{baseURL}/Destiny2/Manifest", headers=headers)
    return jsonify(response.json())

@app.route("/weekly")
def get_milestone():
    current_time = time.time()

    if (
        data_cache["milestone"] and
        data_cache["vendor"] and
        data_cache["milestone_def"] and
        data_cache["activity_def"] and
        data_cache["modifier_def"] and
        data_cache["activity_type_map"] and
        (current_time - data_cache["timestamp"] < 3600)
    ):
        return jsonify({
            "milestone": data_cache["milestone"],
            "vendor": data_cache["vendor"],
            "milestone_def": data_cache["milestone_def"],
            "activity_def": data_cache["activity_def"],
            "modifier_def": data_cache["modifier_def"],
            "activity_type_map": data_cache["activity_type_map"]
        })

    headers = {"X-API-Key": API_KEY}
    milestone = requests.get(f"{baseURL}/Destiny2/Milestones/", headers=headers).json()["Response"]
    vendor = requests.get(f"{baseURL}/Destiny2/Vendors/", headers=headers).json()

    manifest = requests.get(f"{baseURL}/Destiny2/Manifest/", headers=headers).json()
    path = manifest["Response"]["jsonWorldComponentContentPaths"]["ko"]

    milestone_def = requests.get("https://www.bungie.net" + path["DestinyMilestoneDefinition"]).json()
    activity_def = requests.get("https://www.bungie.net" + path["DestinyActivityDefinition"]).json()
    modifier_def = requests.get("https://www.bungie.net" + path["DestinyActivityModifierDefinition"]).json()

    activity_type_map = {}
    for act_hash, act in activity_def.items():
        type_hash = act.get("activityTypeHash")
        if type_hash is not None:
            activity_type_map[int(act_hash)] = type_hash

    data_cache.update({
        "milestone": milestone,
        "vendor": vendor,
        "milestone_def": milestone_def,
        "activity_def": activity_def,
        "modifier_def": modifier_def,
        "activity_type_map": activity_type_map,
        "timestamp": current_time
    })

    return jsonify({
        "milestone": milestone,
        "vendor": vendor,
        "milestone_def": milestone_def,
        "activity_def": activity_def,
        "modifier_def": modifier_def,
        "activity_type_map": activity_type_map
    })

@app.route("/user/<username>")
def get_user_info(username):
    headers = {"X-API-Key": API_KEY}
    response = requests.post(
        f"{baseURL}/User/Search/GlobalName/0/",
        headers=headers,
        json={"displayNamePrefix": username.split("#")[0]}
    )
    return jsonify(response.json())

@app.route("/save_milestone_json")
def save_milestone_json():
    headers = {"X-API-Key": API_KEY}
    response = requests.get(f"{baseURL}/Destiny2/Milestones/", headers=headers)
    data = response.json()

    with open("milestone.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    return jsonify({"message": "milestone.json 저장 완료", "milestoneCount": len(data.get("Response", {}))})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)