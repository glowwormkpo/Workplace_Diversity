import pandas as pd
import numpy as np

emp = pd.read_csv("employee.csv")
hier = pd.read_csv("company_hierarchy.csv")

df = hier.merge(emp, on="employee_id", how="left")

# Build children map
children = {}
for _, row in hier.iterrows():
    b = row['boss_id']
    if pd.notna(b):
        children.setdefault(int(b), []).append(int(row['employee_id']))

emp_ids = set(hier['employee_id'])

# direct reports count
direct_reports = {eid: len(children.get(eid, [])) for eid in emp_ids}

# Level classification via iterative bottom-up (topological) approach:
# IC = no direct reports
# Level of a manager = based on levels of their direct reports (must be uniform per problem statement, but we'll take max)
level_rank = {'IC':0,'MM':1,'D':2,'VP':3,'E':4,'CEO':5}
rank_level = {v:k for k,v in level_rank.items()}

level = {}
# initialize ICs
for eid in emp_ids:
    if direct_reports[eid] == 0:
        level[eid] = 'IC'

# iterative fixed point: a manager's level = rank_level[max(rank of reports)+1], but only when all reports assigned
remaining = set(eid for eid in emp_ids if eid not in level)
max_iter = 20
it = 0
while remaining and it < max_iter:
    it += 1
    progressed = False
    for eid in list(remaining):
        reports = children.get(eid, [])
        if all(r in level for r in reports):
            max_rank = max(level_rank[level[r]] for r in reports)
            new_rank = max_rank + 1
            if new_rank > level_rank['CEO']:
                new_rank = level_rank['CEO']
            level[eid] = rank_level[new_rank]
            remaining.remove(eid)
            progressed = True
    if not progressed:
        break

print("Unresolved after loop:", len(remaining))
if remaining:
    print(list(remaining)[:20])

df['level'] = df['employee_id'].map(level)
print(df['level'].value_counts())
print("Total employees:", len(df))

# who is the CEO (no boss)
ceo_row = hier[hier['boss_id'].isna()]
print("No-boss row:", ceo_row)

df.to_csv("employee_with_levels.csv", index=False)
