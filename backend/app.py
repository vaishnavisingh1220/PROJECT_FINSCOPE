from flask import Flask
from flask_cors import CORS
from routes.auth_routes import auth_bp
from routes.file_routes import file_bp
from routes.admin_routes import admin_bp
from routes.analysis_routes import analysis_bp
from database import db
import os

app = Flask(__name__)
CORS(app, supports_credentials=True)

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{os.path.join(BASE_DIR, 'finscope.db')}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = "SUPER_SECRET_KEY"

db.init_app(app)

app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(file_bp, url_prefix="/files")
app.register_blueprint(admin_bp, url_prefix="/api")
app.register_blueprint(analysis_bp, url_prefix="/api")


@app.route("/")
def home():
    return {"message": "FinScope AI Backend is running 🎯"}

with app.app_context():
    db.create_all()
    print("✅ Database initialized")

if __name__ == "__main__":
    app.run(debug=True)
