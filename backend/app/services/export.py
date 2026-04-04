import pandas as pd


def export_to_csv(data, filename="value_bets.csv"):
    df = pd.DataFrame(data)
    df.to_csv(filename, index=False)
    return filename


def export_to_excel(data, filename="value_bets.xlsx"):
    df = pd.DataFrame(data)
    df.to_excel(filename, index=False)
    return filename