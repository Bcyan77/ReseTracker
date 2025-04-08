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

data_cache = { #캐시 데이터
    "milestone": None,
    "vendor": None,
    "timestamp": 0
}

@app.route("/weekly")
def get_milestone():
    current_time = time.time()

    if data_cache["milestone"] and data_cache["vendor"] and (current_time - data_cache["timestamp"] < 3600): #캐시 데이터 반환
        return jsonify({
            "milestone": data_cache["milestone"],
            "vendor": data_cache["vendor"]
        })
    
    headers = {"X-API-Key": API_KEY}

    milestone_response = requests.get( #마일스톤
        f"{baseURL}/Destiny2/Milestones/",
        headers = headers) 
    data_cache["milestone"] = milestone_response.json()

    vendor_response = requests.get( #상인
        f"{baseURL}/Destiny2/Vendors/",
        headers = headers,
        params = {})
    data_cache["vendor"] = vendor_response.json()

    data_cache["timestamp"] = current_time

    print(milestone_response.text)
    print(vendor_response.text)

    return jsonify({
        "milestone": data_cache["milestone"],
        "vendor": data_cache["vendor"]
    })

@app.route("/user/<username>") #프로필
def get_user_info(username):
    headers = {"X-API-Key": API_KEY}

    response = requests.post(
        f"{baseURL}/User/Search/GlobalName/0/",
        headers = headers,
        json = {"displayNamePrefix": username.split("#")[0]}
    )

    return jsonify(response.json())

if __name__ == "__main__":
    app.run(debug=True, port=5000)