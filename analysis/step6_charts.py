import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker

plt.rcParams.update({'font.size': 11, 'figure.dpi': 150})
LEVEL_ORDER = ['IC','MM','D','VP','E','CEO']
COLOR_M = '#4C72B0'
COLOR_F = '#C44E52'

df = pd.read_csv("employee_full.csv")

# 1. Level distribution
fig, ax = plt.subplots(figsize=(7,4.5))
counts = df['level'].value_counts().reindex(LEVEL_ORDER)
bars = ax.bar(LEVEL_ORDER, counts.values, color='#4C72B0')
ax.set_yscale('log')
ax.set_ylabel('Number of employees (log scale)')
ax.set_title('Org Pyramid: Employee Count by Level')
for b,c in zip(bars, counts.values):
    ax.text(b.get_x()+b.get_width()/2, b.get_height()*1.1, f'{c:,}', ha='center', fontsize=9)
plt.tight_layout()
plt.savefig("chart_level_distribution.png")
plt.close()

# 2. Avg salary by level
fig, ax = plt.subplots(figsize=(7,4.5))
avg_sal = df.groupby('level')['salary'].mean().reindex(LEVEL_ORDER)
bars = ax.bar(LEVEL_ORDER, avg_sal.values, color='#55A868')
ax.set_ylabel('Average Salary (USD)')
ax.set_title('Average Salary by Level')
ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x,_: f'${x:,.0f}'))
for b,v in zip(bars, avg_sal.values):
    ax.text(b.get_x()+b.get_width()/2, b.get_height()+8000, f'${v:,.0f}', ha='center', fontsize=8, rotation=0)
plt.tight_layout()
plt.savefig("chart_salary_by_level.png")
plt.close()

# 3. Salary by sex within level (grouped bar)
piv = df[df['level']!='CEO'].groupby(['level','sex'])['salary'].mean().unstack().reindex(LEVEL_ORDER[:-1])
fig, ax = plt.subplots(figsize=(8,4.8))
x = np.arange(len(piv.index))
w = 0.35
ax.bar(x-w/2, piv['F'], width=w, label='Female', color=COLOR_F)
ax.bar(x+w/2, piv['M'], width=w, label='Male', color=COLOR_M)
ax.set_xticks(x); ax.set_xticklabels(piv.index)
ax.set_ylabel('Average Salary (USD)')
ax.set_title('Average Salary by Level and Sex (raw, unadjusted)')
ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x,_: f'${x:,.0f}'))
ax.legend()
plt.tight_layout()
plt.savefig("chart_salary_by_level_sex.png")
plt.close()

# Human-readable dept labels used across all dept charts
DEPT_LABEL = {'engineering': 'Engineering', 'marketing': 'Marketing', 'sales': 'Sales', 'HR': 'HR'}
DEPT_ORDER = ['engineering', 'marketing', 'sales', 'HR']

# 4. Dept representation by sex
ct = pd.crosstab(df['dept'], df['sex'], normalize='columns')*100
ct = ct.drop(index='CEO', errors='ignore').reindex(DEPT_ORDER)
fig, ax = plt.subplots(figsize=(7.5,4.8))
x = np.arange(len(ct.index))
w=0.35
ax.bar(x-w/2, ct['F'], width=w, label='Female', color=COLOR_F)
ax.bar(x+w/2, ct['M'], width=w, label='Male', color=COLOR_M)
ax.set_xticks(x); ax.set_xticklabels([DEPT_LABEL[d] for d in ct.index])
ax.set_ylabel('% of employees of that sex')
ax.set_title('Department Composition by Sex\n(Share of each sex working in each dept)')
ax.legend()
plt.tight_layout()
plt.savefig("chart_dept_by_sex.png")
plt.close()

# 5. Avg salary by dept
fig, ax = plt.subplots(figsize=(7,4.5))
avg_dept = df[df['dept']!='CEO'].groupby('dept')['salary'].mean().reindex(['HR','marketing','sales','engineering'])
bars = ax.bar([DEPT_LABEL[d] for d in avg_dept.index], avg_dept.values, color='#8172B2')
ax.set_ylabel('Average Salary (USD)')
ax.set_title('Average Salary by Department')
ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x,_: f'${x:,.0f}'))
for b,v in zip(bars, avg_dept.values):
    ax.text(b.get_x()+b.get_width()/2, b.get_height()+5000, f'${v:,.0f}', ha='center', fontsize=9)
plt.tight_layout()
plt.savefig("chart_salary_by_dept.png")
plt.close()

# 6. Regression coefficients (adjusted model)
# Map raw model column names -> human-readable labels for the chart.
LABEL_MAP = {
    'level_E': 'Level: Executive (vs. Director)',
    'level_VP': 'Level: VP (vs. Director)',
    'level_MM': 'Level: Middle Manager (vs. Director)',
    'level_IC': 'Level: Individual Contributor (vs. Director)',
    'dept_engineering': 'Dept: Engineering (vs. HR)',
    'dept_marketing': 'Dept: Marketing (vs. HR)',
    'dept_sales': 'Dept: Sales (vs. HR)',
    'degree_PhD': 'Degree: PhD (vs. High School)',
    'degree_Master': 'Degree: Master\'s (vs. High School)',
    'degree_Bachelor': 'Degree: Bachelor\'s (vs. High School)',
    'sex_Male': 'Sex: Male (vs. Female)',
    'yrs_experience': 'Years of Experience (per year)',
    'signing_bonus': 'Signing Bonus (received vs. not)',
}
res = pd.read_csv("model_results_full.csv", index_col=0)
res_plot = res.drop(index='const')
res_plot = res_plot.reindex(res_plot['coef'].abs().sort_values(ascending=True).index)
colors = ['#C44E52' if 'sex' in i else ('#DD8452' if 'degree' in i else ('#55A868' if 'dept' in i else ('#4C72B0' if 'level' in i else '#8172B2'))) for i in res_plot.index]
labels = [LABEL_MAP.get(i, i) for i in res_plot.index]
fig, ax = plt.subplots(figsize=(9,6))
ax.barh(labels, res_plot['coef'], color=colors)
ax.axvline(0, color='black', linewidth=0.8)
ax.set_xlabel('Effect on Salary (USD), holding other factors constant')
ax.set_title('Salary Model: Effect of Each Factor\n(Reference: Director, HR dept, High School diploma, Female)')
ax.xaxis.set_major_formatter(mticker.FuncFormatter(lambda x,_: f'${x:,.0f}'))
plt.tight_layout()
plt.savefig("chart_regression_coefficients.png")
plt.close()

# 7. Leadership representation
fig, ax = plt.subplots(figsize=(6,4.5))
df['is_leader'] = df['level'].isin(['D','VP','E','CEO'])
leader_pct = df.groupby('sex')['is_leader'].mean()*100
bars = ax.bar(['Female','Male'], [leader_pct['F'], leader_pct['M']], color=[COLOR_F, COLOR_M])
ax.set_ylabel('% reaching Director level or above')
ax.set_title('Leadership Representation by Sex')
for b,v in zip(bars, [leader_pct['F'], leader_pct['M']]):
    ax.text(b.get_x()+b.get_width()/2, b.get_height()+0.03, f'{v:.2f}%', ha='center')
plt.tight_layout()
plt.savefig("chart_leadership_by_sex.png")
plt.close()

# 8. Years experience needed by level & sex
piv2 = df[df['level']!='CEO'].groupby(['level','sex'])['yrs_experience'].mean().unstack().reindex(LEVEL_ORDER[:-1])
fig, ax = plt.subplots(figsize=(8,4.8))
x = np.arange(len(piv2.index))
ax.bar(x-w/2, piv2['F'], width=w, label='Female', color=COLOR_F)
ax.bar(x+w/2, piv2['M'], width=w, label='Male', color=COLOR_M)
ax.set_xticks(x); ax.set_xticklabels(piv2.index)
ax.set_ylabel('Average Years of Experience')
ax.set_title('Average Years of Experience at Each Level, by Sex')
ax.legend()
plt.tight_layout()
plt.savefig("chart_experience_by_level_sex.png")
plt.close()

print("Charts saved.")
import os
print([f for f in os.listdir('.') if f.endswith('.png')])
