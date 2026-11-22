"""Accounts: password hashing (scrypt, standard library) and bearer-token sessions.

The website and API live on different domains, so the site keeps the token and sends it
as "Authorization: Bearer <token>". Only a SHA-256 hash of each token is stored.
"""

import hashlib
import hmac
import secrets

from fastapi import Header, HTTPException

from app.db import query, query_one

SESSION_DAYS = 30


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(password.encode(), salt=salt, n=2**14, r=8, p=1)
    return f"scrypt${salt.hex()}${digest.hex()}"


def check_password(password: str, stored: str) -> bool:
    try:
        _, salt_hex, digest_hex = stored.split("$")
    except ValueError:
        return False
    digest = hashlib.scrypt(password.encode(), salt=bytes.fromhex(salt_hex), n=2**14, r=8, p=1)
    return hmac.compare_digest(digest.hex(), digest_hex)


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def create_session(user_id: int) -> str:
    token = secrets.token_urlsafe(32)
    query(
        "INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (%s, %s, now() + %s * interval '1 day') RETURNING user_id",
        (_hash_token(token), user_id, SESSION_DAYS),
    )
    return token


def end_session(token: str) -> None:
    query("DELETE FROM sessions WHERE token_hash = %s RETURNING user_id", (_hash_token(token),))


def _token(authorization: str | None) -> str | None:
    if authorization and authorization.lower().startswith("bearer "):
        return authorization[7:].strip() or None
    return None


def optional_user(authorization: str | None = Header(None)):
    token = _token(authorization)
    if not token:
        return None
    return query_one(
        """SELECT u.id, u.name, u.email FROM sessions s JOIN users u ON u.id = s.user_id
           WHERE s.token_hash = %s AND s.expires_at > now()""",
        (_hash_token(token),),
    )


def current_user(authorization: str | None = Header(None)):
    user = optional_user(authorization)
    if not user:
        raise HTTPException(401, "Please sign in")
    return user
