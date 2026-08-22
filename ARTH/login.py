from sqlalchemy import create_engine, text
from dotenv import get_key
from .verifyCred import verifyCred
from .addCred import addCred
from pathlib import Path
from rich.console import Console

console = Console()
BASE_DIR = Path(__file__).resolve().parent


def signup() -> bool | str:
    username = input("Enter Your Username: ")
    password = input("Enter Your Password: ")
    re_password = input("Re-Enter Your Password: ")
    if password != re_password:
        console.print("Passwords Don't Match", style=" red")
        signup(username)
    else:
        user_id = addCred(username, password)
        if user_id:
            console.print(
                f"Account Created Successfully. Your User Id Is {user_id}",
                style=" green",
            )
            return user_id

        else:
            console.print("Error Encountered", style=" red")
            return False


def login() -> bool | str:
    user_id = input("Enter UserId: (If You Do Not Have One, Just Press <Enter> )")
    res = None
    with console.status("[bold green]Retrieving Usernames..."):
        conn = create_engine(get_key(f"{BASE_DIR}/.env", "DATABASE")).connect()
        query = text('SELECT * FROM "USERS" WHERE user_id=:username')
        res = conn.execute(query, {"username": user_id}).fetchall()
        conn.close()

    if not res:
        console.print("[red]X[/red] Username Not Found")
        console.print(
            "Username Not Registered With Us, to re-enter the username, enter 'login' in next prompt or press <enter> to signup",
            style=" red",
        )
        x = input(">>> ")
        if x.lower() == "login":
            return login()
        else:
            console.print("Redirecting To Signup", style=" yellow")
            return signup()
    else:
        password = input("Enter Your Password: ")
        if not verifyCred(res[0][0], password, res[0][2]):
            console.print("Incorrect Password!", style=" red")
            return login()
        else:
            console.print(f"Welcome! {res[0][1]}", style=" green")
            return res[0][0]
