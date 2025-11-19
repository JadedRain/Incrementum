import pandas as pd


def local_high_opens(values: pd.DataFrame):
    pf = "Date"
    if ("Date" not in values):
        pf = "Datetime"
    rows = [(values.loc[value, pf], values.loc[value, "Open"]) for value in
            range(len(values))]
    ishigh = True
    highs = []
    for key in range(1, len(rows)):
        if rows[key][1] < rows[key-1][1]:
            if ishigh:
                highs.append(rows[key-1][0])
                ishigh = False
            continue
        elif rows[key][1] > rows[key-1][1]:
            ishigh = True
    if ishigh:
        highs.append(rows[-1][0])
    print(rows)
    return highs


def local_low_opens(values: pd.DataFrame):
    # Detect date column
    pf = "Date" if "Date" in values.columns else "Datetime"

    # Build list of (date, open)
    rows = [(values.loc[value, pf], values.loc[value, "Open"]) for value in range(len(values))]

    islow = True
    lows = []

    for key in range(1, len(rows)):
        if rows[key][1] > rows[key-1][1]:
            if islow:
                lows.append(rows[key-1][0])
                islow = False
            continue
        elif rows[key][1] < rows[key-1][1]:
            islow = True

    # Ensure last value is included if still a low
    if islow:
        lows.append(rows[-1][0])

    return lows
