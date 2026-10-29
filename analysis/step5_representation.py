import pandas as pd
import numpy as np
import math

df = pd.read_csv("employee_full.csv")

def norm_cdf(x):
    return 0.5*(1+math.erf(x/math.sqrt(2)))
def two_prop_ztest(x1,n1,x2,n2):
    p1, p2 = x1/n1, x2/n2
    p_pool = (x1+x2)/(n1+n2)
    se = math.sqrt(p_pool*(1-p_pool)*(1/n1+1/n2))
    z = (p1-p2)/se
    p = 2*(1-norm_cdf(abs(z)))
    return p1, p2, z, p

# leadership = D, VP, E, CEO ; non-leadership = IC, MM
df['is_leader'] = df['level'].isin(['D','VP','E','CEO'])
m = df[df['sex']=='M']
f = df[df['sex']=='F']
x1, n1 = m['is_leader'].sum(), len(m)
x2, n2 = f['is_leader'].sum(), len(f)
p1,p2,z,p = two_prop_ztest(x1,n1,x2,n2)
print(f"% Male in leadership (D+): {p1*100:.2f}%  ({x1}/{n1})")
print(f"% Female in leadership (D+): {p2*100:.2f}%  ({x2}/{n2})")
print(f"z={z:.3f}, p={p:.6f}")

print()
# engineering representation
x1e, n1e = (m['dept']=='engineering').sum(), n1
x2e, n2e = (f['dept']=='engineering').sum(), n2
p1e,p2e,ze,pe = two_prop_ztest(x1e,n1e,x2e,n2e)
print(f"% Male in Engineering: {p1e*100:.2f}%   % Female in Engineering: {p2e*100:.2f}%   z={ze:.3f} p={pe:.6f}")

x1h, n1h = (m['dept']=='HR').sum(), n1
x2h, n2h = (f['dept']=='HR').sum(), n2
p1h,p2h,zh,ph = two_prop_ztest(x1h,n1h,x2h,n2h)
print(f"% Male in HR: {p1h*100:.2f}%   % Female in HR: {p2h*100:.2f}%   z={zh:.3f} p={ph:.6f}")

print()
print("=== leadership share within each dept, by sex ===")
for d in ['engineering','sales','marketing','HR']:
    sub = df[df['dept']==d]
    ms = sub[sub['sex']=='M']
    fs = sub[sub['sex']=='F']
    pm = ms['is_leader'].mean()*100
    pf = fs['is_leader'].mean()*100
    print(f"{d:12s}  M leader%={pm:5.2f} (n={len(ms)})   F leader%={pf:5.2f} (n={len(fs)})")

print()
print("=== experience by level, sex (check pipeline) ===")
print(df.groupby(['level','sex'])['yrs_experience'].mean().reindex(['IC','MM','D','VP','E','CEO'], level=0))
