from pathlib import Path
from argparse import ArgumentParser
from .ocr import getImage
from .parse import parseScript
from .login import login
from .createEntry import createEntry
from .info import information
from uuid import uuid1
from json import dumps, loads
from os import remove
from rich.console import Console
from rich.status import Status
from .printData import printData
from subprocess import Popen

console = Console()
# "We built an end-to-end intelligent expense processing system that converts unstructured physical receipts into structured financial data automatically, detects duplicate transactions, maintains a persistent expense history, and turns those transactions into actionable student spending information."


def main():
    console.print(
        "This program will help you find the estimated group distribution based on the bill, give you a report on what all you spent this month and how much",
        style="yellow",
    )
    parser = ArgumentParser()
    subparser = parser.add_subparsers(dest="command")

    subparser.add_parser("info")
    record = subparser.add_parser("record")
    record.add_argument("Path", help="Enter Path Of The Receipt")
    subparser.add_parser("api")
    args = parser.parse_args()
    if args.command == "api":
        project_dir = Path(__file__).resolve().parent
        Popen(["uvicorn", "api:app", "--reload"], cwd=project_dir)
        console.print("[green]✓[/green] API ENABLED..")
    userId = login()
    if not userId:
        return
    if args.command == "info":
        with console.status("[bold green]Retrieving expenses..."):
            data = information(userId)
        console.print("[green]✓[/green] Expenses fetched")
        printData(data)
    else:
        path = args.Path
        if not Path(path).exists():
            console.print("The Given Path Does Not Exist", style="red")
            return
        else:
            data = None
            with console.status("[bold green]Running OCR..."):
                text = getImage(Path(path))
            console.print("[green]✓[/green] OCR complete")
            with console.status("[bold green]Parsing receipt..."):
                data = parseScript(text)
            console.print("[green]✓[/green] Receipt parsed")

            file_name = uuid1()
            console.print(
                f"Hello User, We Have Read The Receipt And Are Ready To Publish Changes. But As A Final Confirmation, We Are Creating A File Called {file_name}.txt Verify It And Make Necessary Changes. Once You Are Done, Press Enter.",
                style="cyan",
            )
            with open(f"{file_name}.txt", "w") as f:
                f.write(dumps(data))

            x = input("")
            out = None
            with open(f"{file_name}.txt", "r") as f:
                try:
                    out = loads(f.read())
                except:
                    out = data
            try:
                remove(f"{file_name}.txt")
            except:
                pass
        x = input("Enter Number of People Who are together in this Receipt: ")
        if x.isdigit() and str(int(x)) == x:
            x = int(x)
            out = loads(out)
            if x > 0 and x < int(out["total"]):
                out["total"] /= x
            else:
                console.print(
                    "Error Total number of people cannot be less than 1 or greater than total amount of receipt. Aborting...!",
                    style="red",
                )
                return
        else:
            # where users can manually assign items. But don't make that part of your current core scope.For a college project, your reasoning is also easy to defend:"Since receipts do not contain information about which individual consumed each item, ARTHA uses equal splitting by default. This minimizes manual input while providing a practical estimate of each user's share."
            console.print(
                "Error Total number of people must be an integer value. Aborting...!",
                style="red",
            )
            return
        res = None
        out = dumps(out)
        with console.status("[bold green]Saving expense..."):
            if type(out) == type("s"):
                out = loads(out)
            res = createEntry(userId, out)
        if res and res != "dup":
            console.print("[green]✓[/green] Expense saved")
        elif res == "dup":
            console.print("[red]✓[/red] Expense already exists")
        else:
            console.print("[red]✓[/red] Some Error Occurred")


# Human-in-the-Loop Validation
