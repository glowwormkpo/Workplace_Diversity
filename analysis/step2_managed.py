import pandas as pd
import numpy as np
import sys
sys.setrecursionlimit(20000)

emp = pd.read_csv("employee.csv")
hier = pd.read_csv("company_hierarchy.csv")
df = pd.read_csv("employee_with_levels.csv")

children = {}
for _, row in hier.iterrows():
    b = row['boss_id']
    if pd.notna(b):
        children.setdefault(int(b), []).append(int(row['employee_id']))

emp_ids = list(hier['employee_id'])

# iterative post-order traversal to avoid recursion depth issues, computing subtree size (excluding self)
subtree_size = {}
# process leaves first similar to level computation (topological order by level rank already known)
levels_df = pd.read_csv("employee_with_levels.csv")
level_map = dict(zip(levels_df['employee_id'], levels_df['level']))
level_rank = {'IC':0,'MM':1,'D':2,'VP':3,'E':4,'CEO':5}

order = sorted(emp_ids, key=lambda e: level_rank[level_map[e]])  # IC first, CEO last
for eid in order:
    kids = children.get(eid, [])
    if not kids:
        subtree_size[eid] = 0
    else:
        subtree_size[eid] = sum(1 + subtree_size[k] for k in kids)

df['total_managed'] = df['employee_id'].map(subtree_size)
df['direct_reports'] = df['employee_id'].map(lambda e: len(children.get(e, [])))

print(df.groupby('level')['total_managed'].agg(['min','max','mean','count']))
print()
print(df[df['level']=='CEO'][['employee_id','total_managed','direct_reports']])
print()
# sanity check: sum of total_managed should be consistent; CEO total_managed should = 9999 (everyone else)
ceo_managed = df[df['level']=='CEO']['total_managed'].iloc[0]
print("CEO manages (expect 9999):", ceo_managed)

df.to_csv("employee_full.csv", index=False)
