from flask import Flask, jsonify, request
from dotenv import load_dotenv
from flask_cors import CORS
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import requests
import os
import time

load_dotenv() #api키
API_KEY = os.getenv("BUNGIE_API_KEY")

print(API_KEY)

app = Flask(__name__)
CORS(app)

baseURL = "https://www.bungie.net/Platform"

data_cache = {
    "milestone": None,
    "vendor": None,
    "milestone_def": None,
    "activity_def": None,
    "modifier_def": None,
    "timestamp": 0
}

@app.route("/manifest")
def get_manifest():
    headers = {"X-API-Key": API_KEY}

    response = requests.get(
        f"{baseURL}/Destiny2/Manifest",
        headers = headers
    )

    print(response.json())

    return jsonify(response.json())

# 강력한/최고급 장비 itemHash
POWERFUL_ITEM_HASHES = {277576667, 2390540451}

def has_powerful_reward(milestone):
    for reward in milestone.get("rewards", {}).values():
        for entry in reward.get("rewardEntries", {}).values():
            for item in entry.get("items", []):
                if item["itemHash"] in POWERFUL_ITEM_HASHES:
                    return True
    return False

@app.route("/weekly")
def get_milestone():
    current_time = time.time()

    if (
        data_cache["milestone"] and
        data_cache["vendor"] and
        data_cache["milestone_def"] and
        data_cache["activity_def"] and
        data_cache["modifier_def"] and
        (current_time - data_cache["timestamp"] < 3600)
    ):
        return jsonify({
            "milestone": data_cache["milestone"],
            "vendor": data_cache["vendor"],
            "milestone_def": data_cache["milestone_def"],
            "activity_def": data_cache["activity_def"],
            "modifier_def": data_cache["modifier_def"],
            "powerfulMilestones": data_cache["powerful_milestone_hashes"]
        })

    headers = {"X-API-Key": API_KEY}
    milestone = requests.get(f"{baseURL}/Destiny2/Milestones/", headers=headers).json()
    vendor = requests.get(f"{baseURL}/Destiny2/Vendors/", headers=headers).json()
    manifest = requests.get(f"{baseURL}/Destiny2/Manifest/", headers=headers).json()

    path = manifest["Response"]["jsonWorldComponentContentPaths"]["ko"]
    milestone_def = requests.get("https://www.bungie.net" + path["DestinyMilestoneDefinition"]).json()
    activity_def = requests.get("https://www.bungie.net" + path["DestinyActivityDefinition"]).json()
    modifier_def = requests.get("https://www.bungie.net" + path["DestinyActivityModifierDefinition"]).json()

    powerful_hashes = [h for h, v in milestone_def.items() if has_powerful_reward(v)]

    # 캐시 저장
    data_cache.update({
        "milestone": milestone,
        "vendor": vendor,
        "milestone_def": milestone_def,
        "activity_def": activity_def,
        "modifier_def": modifier_def,
        "powerful_milestone_hashes": powerful_hashes,
        "timestamp": current_time
    })

    return jsonify({
        "milestone": milestone,
        "vendor": vendor,
        "milestone_def": milestone_def,
        "activity_def": activity_def,
        "modifier_def": modifier_def,
        "powerfulMilestones": powerful_hashes
    })


@app.route("/user/<username>") #프로필
def get_user_info(username):
    headers = {"X-API-Key": API_KEY}

    response = requests.post(
        f"{baseURL}/User/Search/GlobalName/0/",
        headers = headers,
        json = {"displayNamePrefix": username.split("#")[0]}
    )

    print(response.json())

    return jsonify(response.json())

if __name__ == "__main__":
    app.run(debug=True, port=5000)