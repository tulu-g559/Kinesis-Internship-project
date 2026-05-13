from flask import Blueprint, request
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity
)

from app.models.user import User
from app.auth.services import register_user
from app.extensions import bcrypt

auth_bp = Blueprint("auth", __name__)


# REGISTER
@auth_bp.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    user, error = register_user(
        username,
        email,
        password
    )

    if error:
        return {"error": error}, 400

    access_token = create_access_token(identity=str(user.id))

    return {
        "message": "User registered successfully",
        "access_token": access_token,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email
        }
    }, 201


# LOGIN
@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if not user:
        return {"error": "Invalid credentials"}, 401

    valid_password = bcrypt.check_password_hash(
        user.password,
        password
    )

    if not valid_password:
        return {"error": "Invalid credentials"}, 401

    access_token = create_access_token(identity=str(user.id))

    return {
        "message": "Login successful",
        "access_token": access_token,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email
        }
    }



# GET CURRENT USER
@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():

    current_user_id = get_jwt_identity()

    user = User.query.get(current_user_id)

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email
    }