import pandas as pd

ledger_path = '/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/SO_CHI_TIET_HHP_2023.xlsx'
df = pd.read_excel(ledger_path, sheet_name='1121')
df = df.iloc[:-1] # drop tổng cộng
df = df[df['Diễn giải'] != 'Số dư đầu kỳ']

dr_diff = 187689248334 - 184594781025
cr_diff = 185510628845 - 184590424094

# See if there's any single subset of transactions that sum exactly to this using a quick greedy search
drs = df['Phát sinh Nợ'].values
drs = drs[drs > 0]
crs = df['Phát sinh Có'].values
crs = crs[crs > 0]

print("Trying to find a match for Dr diff:", dr_diff)
print("Trying to find a match for Cr diff:", cr_diff)

# Check if there are a few distinct transactions forming this
def subset_sum(numbers, target, partial=[], partial_sum=0):
    if partial_sum == target:
        return partial
    if partial_sum > target:
        return None
    for i, n in enumerate(numbers):
        res = subset_sum(numbers[i+1:], target, partial + [n], partial_sum + n)
        if res:
            return res
    return None

import random
# Just try 1000 random subsets to see if we hit it roughly
found_dr = False
for _ in range(5000):
    samp = np.random.choice(drs, size=random.randint(1, 10), replace=False)
    if samp.sum() == dr_diff:
        print("Found DR match:", samp)
        found_dr = True
        break
if not found_dr:
    print("No simple DR match found")
    
found_cr = False
for _ in range(5000):
    samp = np.random.choice(crs, size=random.randint(1, 10), replace=False)
    if samp.sum() == cr_diff:
        print("Found CR match:", samp)
        found_cr = True
        break
if not found_cr:
    print("No simple CR match found")

