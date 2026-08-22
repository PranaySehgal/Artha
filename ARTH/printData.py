from rich.console import Console, Group
from rich.table import Table
from rich.align import Align
from rich.padding import Padding

console = Console()


def printData(expenses):

    table = Table(
        title="[bold cyan]ARTHA Expense History[/bold cyan]",
        title_style="bold cyan",
        border_style="cyan",
    )
    table.add_column("Date")
    table.add_column("Merchant")
    table.add_column("Category")
    table.add_column("Amount", justify="right")

    for expense in expenses:
        table.add_row(
            expense[-2],
            expense[-1],
            expense[-3],
            f"{float(expense[1]):.2f}",
        )

    console.print(Align.center(table))

    print("\n\n")
    spending_breakdown(expenses)


def spending_breakdown(expenses: dict):
    data = {}
    for i in expenses:
        if data.get(i[-3], -90) == -90:
            data[i[-3]] = float(i[1])
        else:
            data[i[-3]] += float(i[1])

    max_amount = max(data.values())
    total = sum(data.values())
    bar_width = 30

    table = Table(show_header=False, box=None, padding=(0, 1))

    table.add_column("Category", width=16)
    table.add_column("Bar", width=30)
    table.add_column("Percent", width=8, justify="right")
    table.add_column("Amount", width=12, justify="right")

    for category, amount in sorted(data.items(), key=lambda x: x[1], reverse=True):
        percentage = amount / total * 100
        bar_length = int(amount / max_amount * bar_width)

        table.add_row(
            category, "█" * bar_length, f"{percentage:.1f}%", f"{amount:,.0f}\n\n"
        )

    section = Group(
        Align.center("SPENDING BREAKDOWN"), Padding("", (1, 0)), Align.center(table)
    )

    console.print(section)
