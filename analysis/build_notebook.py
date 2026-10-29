import json

def md(text):
    return {"cell_type": "markdown", "metadata": {}, "source": text.splitlines(keepends=True)}

def code(text):
    return {"cell_type": "code", "execution_count": None, "metadata": {}, "outputs": [], "source": text.splitlines(keepends=True)}

cells = []

cells.append(md("""# Workplace Diversity Analysis

**Goal:** Classify employees into organizational levels, measure span of control, build a salary model, and assess whether the company treats employees fairly across factors such as sex.

**Data:** `employee.csv` (10,000 rows: signing_bonus, salary, degree_level, sex, yrs_experience) and `company_hierarchy.csv` (10,000 rows: employee_id, boss_id, dept).

**Sections:**
1. Load & validate data
2. Classify employee levels (IC / MM / D / VP / E / CEO)
3. Compute total people managed (direct + indirect reports)
4. Exploratory analysis of salary drivers
5. Salary prediction model (OLS regression)
6. Fairness assessment (gender pay gap, representation)
7. Conclusions & recommendations for the Head of HR
"""))

cells.append(md("## 1. Load & Validate Data"))

cells.append(code("""import pandas as pd
import numpy as np
import math
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker

pd.set_option('display.float_format', lambda x: f'{x:,.2f}')

employee = pd.read_csv("employee.csv")
hierarchy = pd.read_csv("company_hierarchy.csv")

print("employee.csv:", employee.shape)
print("company_hierarchy.csv:", hierarchy.shape)
employee.head()
"""))

cells.append(code("""# Data quality checks
print("Nulls in employee.csv:\\n", employee.isnull().sum())
print("\\nNulls in company_hierarchy.csv:\\n", hierarchy.isnull().sum())
print("\\nDuplicate employee_ids (employee.csv):", employee['employee_id'].duplicated().sum())
print("Duplicate employee_ids (hierarchy.csv):", hierarchy['employee_id'].duplicated().sum())
print("\\nEmployee IDs match between tables:", set(employee.employee_id) == set(hierarchy.employee_id))
print("\\nRows with no boss (should be exactly the CEO):")
hierarchy[hierarchy['boss_id'].isna()]
"""))

cells.append(md("""Both tables are clean: no nulls except the single `boss_id` for the CEO (who has no boss, as expected), no duplicate IDs, and both tables cover the same 10,000 employees."""))

cells.append(md("""## 2. Classify Employee Levels

Levels are defined recursively from the bottom of the org up:
- **IC**: manages no one
- **MM**: direct boss of only ICs
- **D**: direct boss of only MMs
- **VP**: direct boss of only Directors
- **E**: direct boss of only VPs
- **CEO**: direct boss of only Executives

We build a children map from `boss_id`, then process employees bottom-up (IC first) so that every manager's level can be derived from the already-known levels of their direct reports."""))

cells.append(code("""children = {}
for _, row in hierarchy.iterrows():
    b = row['boss_id']
    if pd.notna(b):
        children.setdefault(int(b), []).append(int(row['employee_id']))

emp_ids = set(hierarchy['employee_id'])
direct_reports = {eid: len(children.get(eid, [])) for eid in emp_ids}

level_rank = {'IC': 0, 'MM': 1, 'D': 2, 'VP': 3, 'E': 4, 'CEO': 5}
rank_level = {v: k for k, v in level_rank.items()}

level = {eid: 'IC' for eid in emp_ids if direct_reports[eid] == 0}
remaining = set(emp_ids) - set(level)

while remaining:
    progressed = False
    for eid in list(remaining):
        reports = children.get(eid, [])
        if all(r in level for r in reports):
            new_rank = max(level_rank[level[r]] for r in reports) + 1
            level[eid] = rank_level[min(new_rank, level_rank['CEO'])]
            remaining.remove(eid)
            progressed = True
    if not progressed:
        raise RuntimeError(f"Could not resolve levels for {len(remaining)} employees - check for cycles")

df = hierarchy.merge(employee, on='employee_id', how='left')
df['level'] = df['employee_id'].map(level)
df['direct_reports'] = df['employee_id'].map(direct_reports)

df['level'].value_counts().reindex(['IC','MM','D','VP','E','CEO'])
"""))

cells.append(md("""The org resolves cleanly into a pyramid with no ambiguous cases: 9,001 ICs, 800 MMs, 159 Directors, 35 VPs, 4 Executives, and 1 CEO. This matches the expected shape of a real organization and confirms the hierarchy data has no cycles or orphaned employees."""))

cells.append(md("## 3. Total People Managed (Direct + Indirect Reports)"))

cells.append(code("""# Process bottom-up (IC -> CEO) so each employee's subtree size can be
# computed from their already-known direct reports' subtree sizes.
order = sorted(emp_ids, key=lambda e: level_rank[level[e]])

subtree_size = {}
for eid in order:
    kids = children.get(eid, [])
    subtree_size[eid] = sum(1 + subtree_size[k] for k in kids) if kids else 0

df['total_managed'] = df['employee_id'].map(subtree_size)

# Sanity check: the CEO should manage everyone else (9,999 employees)
ceo_managed = df.loc[df['level'] == 'CEO', 'total_managed'].iloc[0]
print(f"CEO manages {ceo_managed:,} people (expected 9,999): {'OK' if ceo_managed == len(df)-1 else 'MISMATCH'}")

df.groupby('level')['total_managed'].agg(['min','max','mean','count']).reindex(['IC','MM','D','VP','E','CEO'])
"""))

cells.append(md("Span of control scales sensibly with level: Directors manage 6-166 people, VPs 111-607, Executives 1,693-3,598, and the CEO manages the entire company (9,999). This cross-check confirms the level classification and the recursive subtree-size logic are both correct."))

cells.append(md("## 4. Exploratory Analysis of Salary Drivers"))

cells.append(code("""fig, axes = plt.subplots(1, 2, figsize=(13,4.5))

avg_sal = df.groupby('level')['salary'].mean().reindex(['IC','MM','D','VP','E','CEO'])
axes[0].bar(avg_sal.index, avg_sal.values, color='#55A868')
axes[0].set_title('Average Salary by Level')
axes[0].yaxis.set_major_formatter(mticker.FuncFormatter(lambda x,_: f'${x:,.0f}'))

DEPT_LABEL = {'engineering': 'Engineering', 'marketing': 'Marketing', 'sales': 'Sales', 'HR': 'HR'}
avg_dept = df[df['dept']!='CEO'].groupby('dept')['salary'].mean().sort_values()
axes[1].bar([DEPT_LABEL[d] for d in avg_dept.index], avg_dept.values, color='#8172B2')
axes[1].set_title('Average Salary by Department')
axes[1].yaxis.set_major_formatter(mticker.FuncFormatter(lambda x,_: f'${x:,.0f}'))

plt.tight_layout()
plt.show()
"""))

cells.append(code("""print("Correlation of numeric features with salary:")
print(df[['salary','yrs_experience','total_managed','direct_reports','signing_bonus']].corr()['salary'].sort_values(ascending=False))
print()
print("Average salary by degree level:")
print(df.groupby('degree_level')['salary'].mean().sort_values())
"""))

cells.append(md("""**Observations:** Salary rises steeply with level (IC ≈ \\$188K → CEO \\$700K) and varies a great deal by department (HR ≈ \\$85K vs. Engineering ≈ \\$244K). By contrast, years of experience, degree level, and signing bonus have only weak raw correlations with salary. This suggests **level and department, not experience or education, are the dominant pay drivers** at this company — something we test formally in the regression model below."""))

cells.append(md("## 5. Salary Prediction Model (OLS Regression)\n\nsklearn/scipy/statsmodels are not available in this environment, so the model is implemented directly with `numpy`: coefficients via the normal-equation solution `beta = (X'X)^-1 X'y`, standard errors from the residual variance, and p-values from the standard normal approximation to the t-distribution (an excellent approximation here since n ≈ 10,000)."))

cells.append(code("""def norm_cdf(x):
    return 0.5 * (1 + math.erf(x / math.sqrt(2)))

def two_tailed_p(z):
    return 2 * (1 - norm_cdf(abs(z)))

def ols(X, y, colnames):
    XtX_inv = np.linalg.pinv(X.T @ X)
    beta = XtX_inv @ X.T @ y
    resid = y - X @ beta
    n, k = X.shape
    dof = n - k
    mse = np.sum(resid**2) / dof
    se = np.sqrt(np.diag(XtX_inv) * mse)
    t_stats = beta / se
    p_vals = [two_tailed_p(t) for t in t_stats]
    r2 = 1 - np.sum(resid**2) / np.sum((y - y.mean())**2)
    adj_r2 = 1 - (1-r2)*(n-1)/(n-k)
    return pd.DataFrame({'coef': beta, 'std_err': se, 't': t_stats, 'p_value': p_vals}, index=colnames), r2, adj_r2

# Exclude the CEO (n=1, zero variance, would dominate as a leverage point)
model_df = df[df['level'] != 'CEO'].copy()

level_dummies = pd.get_dummies(model_df['level'].astype(str), prefix='level', drop_first=True).astype(float)
dept_dummies = pd.get_dummies(model_df['dept'], prefix='dept', drop_first=True).astype(float)
model_df['degree_level'] = pd.Categorical(model_df['degree_level'], categories=['High_School','Bachelor','Master','PhD'], ordered=True)
degree_dummies = pd.get_dummies(model_df['degree_level'], prefix='degree', drop_first=True).astype(float)
sex_dummy = (model_df['sex'] == 'M').astype(float).rename('sex_Male')

X_df = pd.concat([level_dummies, dept_dummies, degree_dummies, sex_dummy,
                   model_df[['yrs_experience','signing_bonus']]], axis=1)
X_df.insert(0, 'const', 1.0)

results, r2, adj_r2 = ols(X_df.values.astype(float), model_df['salary'].values.astype(float), X_df.columns.tolist())
print(f"R-squared: {r2:.4f}   Adjusted R-squared: {adj_r2:.4f}   N={len(model_df):,}")

# Relabel the raw model column names with human-readable factor descriptions
LABEL_MAP = {
    'const': 'Intercept (reference employee)',
    'level_E': 'Level: Executive (vs. Director)',
    'level_VP': 'Level: VP (vs. Director)',
    'level_MM': 'Level: Middle Manager (vs. Director)',
    'level_IC': 'Level: Individual Contributor (vs. Director)',
    'dept_engineering': 'Dept: Engineering (vs. HR)',
    'dept_marketing': 'Dept: Marketing (vs. HR)',
    'dept_sales': 'Dept: Sales (vs. HR)',
    'degree_PhD': "Degree: PhD (vs. High School)",
    'degree_Master': "Degree: Master's (vs. High School)",
    'degree_Bachelor': "Degree: Bachelor's (vs. High School)",
    'sex_Male': 'Sex: Male (vs. Female)',
    'yrs_experience': 'Years of experience (per year)',
    'signing_bonus': 'Signing bonus (received vs. not)',
}
results.rename(index=LABEL_MAP)
"""))

cells.append(md("""**Reading the model** (reference employee: Director level, HR department, High School degree, Female, 0 years experience, no signing bonus):

- **Level** and **department** are by far the strongest, most significant drivers of salary — moving from HR to Engineering is worth about **+\\$160K**; moving from D to E level is worth **+\\$355K**.
- **Degree level, years of experience, and signing bonus are not statistically significant** (p > 0.1 for all) once level and department are accounted for.
- **`sex_Male` is not statistically significant** (coef ≈ –\\$700, p = 0.65) — meaning that among employees at the *same level* and *same department*, there is no detectable pay difference by sex.

The model explains about 35% of salary variance (R² = 0.35), consistent with level and department being coarse, high-impact predictors while individual salaries still carry idiosyncratic variation."""))

cells.append(md("## 6. Fairness Assessment: Is the Gender Pay Gap Real?"))

cells.append(code("""# Raw (unadjusted) gender pay gap
raw_gap = df.groupby('sex')['salary'].mean()
print("Raw average salary by sex:")
print(raw_gap)
print(f"\\nRaw gap: Men earn \\${raw_gap['M'] - raw_gap['F']:,.0f} more than women on average "
      f"({(raw_gap['M']/raw_gap['F']-1)*100:.1f}% higher).")
"""))

cells.append(md("There is a large, statistically significant **raw** pay gap ( +\\$27,562, p < 0.001, from a simple sex-only regression). But the multi-factor model above shows this gap almost fully disappears (to a statistically insignificant –\\$700) once we control for level and department. That means we find no significant gap within the same job — **the raw gap is largely accounted for by *where* men and women sit in the organization** (with the caveat that no performance measure is available)."))

cells.append(code("""# Where are men and women concentrated?
print("Department composition (% of each sex working in each dept):")
dept_ct = (pd.crosstab(df['dept'], df['sex'], normalize='columns')*100).round(1)
dept_ct.index = dept_ct.index.map({'engineering': 'Engineering', 'marketing': 'Marketing', 'sales': 'Sales', 'HR': 'HR'})
print(dept_ct)

print("\\n% reaching Director level or above, by sex:")
df['is_leader'] = df['level'].isin(['D','VP','E','CEO'])
print((df.groupby('sex')['is_leader'].mean()*100).round(2))

print("\\nAverage years of experience at each level, by sex:")
print(df[df['level']!='CEO'].groupby(['level','sex'])['yrs_experience'].mean().unstack().reindex(['IC','MM','D','VP','E']).round(1))
"""))

cells.append(code("""def two_prop_ztest(x1, n1, x2, n2):
    p1, p2 = x1/n1, x2/n2
    p_pool = (x1+x2)/(n1+n2)
    se = math.sqrt(p_pool*(1-p_pool)*(1/n1+1/n2))
    z = (p1-p2)/se
    return p1, p2, z, two_tailed_p(z)

m, f = df[df.sex=='M'], df[df.sex=='F']
p1,p2,z,p = two_prop_ztest(m['is_leader'].sum(), len(m), f['is_leader'].sum(), len(f))
print(f"Leadership rate: Male {p1*100:.2f}% vs Female {p2*100:.2f}%  (z={z:.2f}, p={p:.4f})")

p1e,p2e,ze,pe = two_prop_ztest((m.dept=='engineering').sum(), len(m), (f.dept=='engineering').sum(), len(f))
print(f"Engineering share: Male {p1e*100:.2f}% vs Female {p2e*100:.2f}%  (z={ze:.2f}, p={pe:.2e})")

p1h,p2h,zh,ph = two_prop_ztest((m.dept=='HR').sum(), len(m), (f.dept=='HR').sum(), len(f))
print(f"HR share: Male {p1h*100:.2f}% vs Female {p2h*100:.2f}%  (z={zh:.2f}, p={ph:.2e})")
"""))

cells.append(md("""**Findings:**

1. **No significant pay gap within role.** Controlling for level and department, the sex coefficient is small and not statistically significant (p = 0.65). This is the absence of evidence of a gap, not proof of fairness: there is no performance control, so unobserved factors could still matter.
2. **Representation differs sharply.** A far larger share of women than men work in the lowest-paying department (HR: 29.7% of women vs. 9.9% of men) and a smaller share in the highest-paying one (Engineering: 18.8% of women vs. 31.4% of men), p < 0.001 for both. These are shares within each sex.
3. **A smaller share of women reach leadership** (D and above): 1.60% of women vs. 2.21% of men (p = 0.038).
4. **Senior women have more experience than senior men.** Among employees who *do* reach Director, VP, or Executive level, women have meaningfully more years of experience than men at the same level (e.g., Directors: 16.5 yrs for women vs. 12.9 yrs for men; VPs: 25.6 vs. 19.0). These differences were not significance-tested. This snapshot shows experience at each level, not time to promotion, so it is a flag for follow-up with promotion-timing data, not evidence of a glass ceiling.

**Conclusion:** the raw ~14% pay gap is real. Within the same level and department we find no significant gap (not proof of fairness, since there is no performance control); the gap appears to track differences in representation and promotion pace."""))

cells.append(md("""## 7. Recommendations for the Head of HR

1. **Don't stop at "equal pay for equal role."** The compensation model finds no significant gap within level and department — but that is not proof of fairness (no performance control), and it can mask the structural issue: who gets into which department and who gets promoted, and how fast.
2. **Investigate the Engineering pipeline.** Audit hiring, internal transfer, and retention funnels into Engineering (the highest-paying department) to understand why a smaller share of women than men work in Engineering, relative to HR, Sales, and Marketing.
3. **Audit promotion timelines and criteria.** The experience gap at D/VP/E level suggests women face a longer or higher bar to promotion. Review promotion criteria, calibration processes, and manager decision patterns for bias, and track median time-to-promotion by sex and level going forward.
4. **Set representation targets and monitor over time**, not just a single pay-equity snapshot — track department mix and leadership representation by sex quarterly.
5. **Re-run this analysis periodically** (and extend it to other protected characteristics, e.g. race/ethnicity, if that data becomes available) to check whether interventions are closing the representation and promotion gaps.
"""))

nb = {
    "cells": cells,
    "metadata": {
        "kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"},
        "language_info": {"name": "python", "version": "3.10"}
    },
    "nbformat": 4,
    "nbformat_minor": 5
}

with open("Workplace_Diversity_Analysis.ipynb", "w") as fh:
    json.dump(nb, fh, indent=1)

print("Notebook written.")
