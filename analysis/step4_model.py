import pandas as pd
import numpy as np
import math

df = pd.read_csv("employee_full.csv")

def norm_cdf(x):
    return 0.5*(1+math.erf(x/math.sqrt(2)))

def two_tailed_p(z):
    return 2*(1-norm_cdf(abs(z)))

def ols(X, y, colnames):
    n, k = X.shape
    XtX = X.T @ X
    XtX_inv = np.linalg.pinv(XtX)
    beta = XtX_inv @ X.T @ y
    y_hat = X @ beta
    resid = y - y_hat
    rss = np.sum(resid**2)
    tss = np.sum((y - y.mean())**2)
    r2 = 1 - rss/tss
    dof = n - k
    mse = rss/dof
    se = np.sqrt(np.diag(XtX_inv) * mse)
    t_stats = beta/se
    p_vals = [two_tailed_p(t) for t in t_stats]
    adj_r2 = 1 - (1-r2)*(n-1)/(n-k)
    results = pd.DataFrame({
        'coef': beta, 'std_err': se, 't': t_stats, 'p_value': p_vals
    }, index=colnames)
    return results, r2, adj_r2, n, dof

model_df = df[df['level'] != 'CEO'].copy()  # exclude CEO (n=1, no variance, outlier)

# Build design matrix manually with reference categories
level_dummies = pd.get_dummies(model_df['level'].astype(str), prefix='level', drop_first=True).astype(float)  # ref = IC
dept_dummies = pd.get_dummies(model_df['dept'], prefix='dept', drop_first=True).astype(float)  # ref = HR (alphabetically first excluding CEO... check)
degree_order = ['High_School','Bachelor','Master','PhD']
model_df['degree_level'] = pd.Categorical(model_df['degree_level'], categories=degree_order, ordered=True).remove_unused_categories()
degree_dummies = pd.get_dummies(model_df['degree_level'], prefix='degree', drop_first=True).astype(float)  # ref = High_School
sex_dummy = (model_df['sex']=='M').astype(float).rename('sex_Male')  # ref = Female

X_df = pd.concat([level_dummies, dept_dummies, degree_dummies, sex_dummy,
                   model_df[['yrs_experience','signing_bonus']]], axis=1)
X_df.insert(0, 'const', 1.0)
colnames = X_df.columns.tolist()
X = X_df.values.astype(float)
y = model_df['salary'].values.astype(float)

results, r2, adj_r2, n, dof = ols(X, y, colnames)
pd.set_option('display.float_format', lambda x: f'{x:,.3f}')
print(f"N={n}, dof={dof}, R2={r2:.4f}, Adj R2={adj_r2:.4f}")
print(results)

results.to_csv("model_results_full.csv")

# Simple model: sex only (raw gap)
X_simple = pd.DataFrame({'const':1.0, 'sex_Male': sex_dummy})
res_simple, r2s, adjr2s, ns, dofs = ols(X_simple.values.astype(float), y, ['const','sex_Male'])
print("\n=== Raw gap (sex only) ===")
print(res_simple)

# Sex + level + dept (no experience/degree) to see level/dept explain most
X_ld = pd.concat([level_dummies, dept_dummies, sex_dummy], axis=1)
X_ld.insert(0,'const',1.0)
res_ld, r2ld, adjr2ld, nld, dofld = ols(X_ld.values.astype(float), y, X_ld.columns.tolist())
print(f"\n=== Level+Dept+Sex model === R2={r2ld:.4f}")
print(res_ld)

