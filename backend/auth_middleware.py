from flask import request, jsonify
import jwt
from functools import wraps

SECRET = "SUPER_SECRET_KEY"


# =========================
# 🔐 GENERIC LOGIN REQUIRED
# =========================
def login_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        token = request.headers.get("Authorization")

        if not token:
            return jsonify({"error": "Token missing"}), 401

        try:
            # Handle "Bearer <token>"
            if token.startswith("Bearer "):
                token = token.split(" ")[1]

            decoded = jwt.decode(token, SECRET, algorithms=["HS256"])

            # Attach user data to request
            request.user_id = decoded.get("user_id")
            request.user_role = decoded.get("role")

        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401

        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        return fn(*args, **kwargs)

    return wrapper


# =========================
# 🛑 ADMIN ONLY PROTECTION
# =========================
def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        token = request.headers.get("Authorization")

        if not token:
            return jsonify({"error": "Token missing"}), 401

        try:
            if token.startswith("Bearer "):
                token = token.split(" ")[1]

            decoded = jwt.decode(token, SECRET, algorithms=["HS256"])

            # Check role
            if decoded.get("role") != "admin":
                return jsonify({"error": "Admin access required"}), 403

            # Attach user info
            request.user_id = decoded.get("user_id")
            request.user_role = decoded.get("role")

        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401

        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        return fn(*args, **kwargs)

    return wrapper