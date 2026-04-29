from flask import Blueprint, request, jsonify
import os
from ml.insight_generator import generate_insights

analysis_bp = Blueprint("analysis", __name__)

UPLOAD_FOLDER = "uploads"

@analysis_bp.route("/analyze", methods=["POST"])
def analyze_file():
    data = request.get_json()
    filename = data.get("filename")

    if not filename:
        return jsonify({"error": "No filename provided"}), 400

    file_path = os.path.join(UPLOAD_FOLDER, filename)

    if not os.path.exists(file_path):
        return jsonify({"error": "File not found"}), 404

    insights = generate_insights(file_path)

    return jsonify({
        "insights": insights
    })