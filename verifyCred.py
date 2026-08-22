from argon2 import PasswordHasher


def verifyCred(user_id: str, password: str, hash: str) -> bool:
    ph = PasswordHasher()
    try:
        ph.verify(hash, password)
        return True
    except:
        return False
