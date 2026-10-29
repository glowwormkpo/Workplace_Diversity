import pandas as pd
import numpy as np

df = pd.read_csv("employee_full.csv")
pd.set_option('display.width', 120)

print("=== Salary by level ===")
print(df.groupby('level')['salary'].agg(['mean','median','std','count']).reindex(['IC','MM','D','VP','E','CEO']))

print("\n=== Salary by sex (overall) ===")
print(df.groupby('sex')['salary'].agg(['mean','median','std','count']))

print("\n=== Salary by sex within level ===")
print(df.groupby(['level','sex'])['salary'].agg(['mean','count']).reindex(['IC','MM','D','VP','E','CEO'], level=0))

print("\n=== Sex distribution by level (%) ===")
ct = pd.crosstab(df['level'], df['sex'], normalize='index')*100
print(ct.reindex(['IC','MM','D','VP','E','CEO']))

print("\n=== Salary by dept ===")
print(df.groupby('dept')['salary'].agg(['mean','median','count']))

print("\n=== Salary by degree_level ===")
print(df.groupby('degree_level')['salary'].agg(['mean','median','count']))

print("\n=== Salary by signing_bonus ===")
print(df.groupby('signing_bonus')['salary'].agg(['mean','median','count']))

print("\n=== Correlations (numeric) ===")
num = df[['salary','yrs_experience','total_managed','direct_reports','signing_bonus']]
print(num.corr()['salary'])

print("\n=== Sex distribution overall ===")
print(df['sex'].value_counts(normalize=True))

print("\n=== Degree by sex ===")
print(pd.crosstab(df['degree_level'], df['sex'], normalize='columns')*100)

print("\n=== Dept by sex ===")
print(pd.crosstab(df['dept'], df['sex'], normalize='columns')*100)

print("\n=== yrs_experience by sex ===")
print(df.groupby('sex')['yrs_experience'].agg(['mean','median']))
