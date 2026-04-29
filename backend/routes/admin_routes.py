from flask import Blueprint, request, jsonify
import os
import jwt
import datetime

SECRET_KEY = "SUPER_SECRET_KEY"

admin_bp = Blueprint("admin", __name__)

UPLOAD_FOLDER = "uploads"

# ================= LOGIN =================
@admin_bp.route("/admin/login", methods=["POST"])
def admin_login():
    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    # ⚠️ Replace with DB check later
    if username == "admin" and password == "admin123":
        token = jwt.encode({
            "user": username,
            "role": "admin",
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
        }, SECRET_KEY, algorithm="HS256")

        return jsonify({
            "success": True,
            "token": token
        })

    return jsonify({"success": False}), 401

# ================= GET FILES =================
@admin_bp.route("/admin/files", methods=["GET"])
def get_files():
    if not os.path.exists(UPLOAD_FOLDER):
        return jsonify({"files": []})

    files = os.listdir(UPLOAD_FOLDER)

    return jsonify({"files": files})


# ================= DELETE FILE =================
@admin_bp.route("/admin/delete", methods=["POST"])
def delete_file():
    data = request.get_json()
    filename = data.get("filename")

    file_path = os.path.join(UPLOAD_FOLDER, filename)

    if not os.path.exists(file_path):
        return jsonify({"error": "File not found"}), 404

    os.remove(file_path)

    return jsonify({"success": True})

# ================= GET ALL USERS =================
@admin_bp.route("/admin/users", methods=["GET"])
def get_users():
    from models import User  # make sure you have this model

    users = User.query.all()

    return jsonify({
        "users": [
            {
                "id": u.id,
                "name": u.username,
                "email": u.email,
                "role": getattr(u, "role", "user")
            }
            for u in users
        ]
    })


# ================= DELETE USER =================
@admin_bp.route("/admin/delete-user", methods=["POST"])
def delete_user():
    from models import User
    from database import db

    data = request.get_json()
    user_id = data.get("userId")

    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()

    return jsonify({"success": True})


# ================= UPDATE ROLE =================
@admin_bp.route("/admin/update-role", methods=["POST"])
def update_role():
    from models import User
    from database import db

    data = request.get_json()
    user_id = data.get("userId")
    role = data.get("role")

    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    user.role = role
    db.session.commit()

    return jsonify({"success": True})