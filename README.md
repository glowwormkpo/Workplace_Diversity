# Workplace Diversity Analysis

Analysis of internal HR data (10,000 employees) to classify organizational levels, measure span of control, model salary, and test for a gender pay gap and for differences in representation and promotion.

## Files

| File | Description |
|---|---|
| `Workplace_Diversity_Analysis.ipynb` | Full analysis notebook — data loading, level classification, span of control, EDA, salary regression, fairness tests. All cells pre-executed with outputs/charts included. |
| `Workplace_Diversity_Analysis_Report.docx` | Written report for the Head of HR: methodology, findings, and recommendations. |
| `Workplace_Diversity_Analysis_Deck.pptx` | Slide deck version of the same findings, for presenting. |
| `Workplace_Diversity_Analysis_Deck.pdf` | PDF export of the deck. |
| `analysis/employee.csv` | Per-employee data: `employee_id`, `signing_bonus`, `salary`, `degree_level`, `sex`, `yrs_experience`. |
| `analysis/company_hierarchy.csv` | Org structure: `employee_id`, `boss_id`, `dept`. |
| `analysis/` | Step scripts (1–6), notebook/report/deck builders, chart images and model results. |

## Method

1. **Levels** — classified each employee into IC / MM / D / VP / E / CEO by working bottom-up through the reporting hierarchy (boss_id).
2. **Span of control** — recursive count of direct + indirect reports per employee, cross-checked against level (e.g. CEO manages all 9,999 others).
3. **Salary model** — multiple linear regression (OLS implemented directly in NumPy via the normal equations) predicting salary from level, department, degree, experience, signing bonus, and sex.
4. **Fairness test** — compared the raw gender pay gap to the gap after controlling for level and department, plus representation and experience-by-level checks by sex.

## Key findings

- Raw gender pay gap: **+$27,562 (14.0%)**, statistically significant (p < 0.001).
- Adjusted gap (same level & department): **–$703**, not significant (p = 0.65): no significant gap within the same level and department. This is not proof of fairness; there is no performance control.
- Share of each sex working in Engineering (highest-paying dept): 18.8% of women vs. 31.4% of men; in HR (lowest-paying): 29.7% of women vs. 9.9% of men; both p < 0.001.
- A smaller share of women reach Director+ roles (1.60% of women vs. 2.21% of men, p = 0.038) and women at senior levels have more experience on average than men at the same level (e.g. Director: 16.5 vs. 12.9 years; not significance-tested).

**Bottom line:** the raw pay gap tracks representation and promotion-pipeline differences; within the same level and department we find no significant gap, though without a performance control that is not proof of fairness. See the report/deck for full recommendations.

## How to rebuild

Everything runs from the `analysis/` folder, which holds the input data, the step scripts and the chart images.

```bash
cd analysis
pip install pandas numpy matplotlib
python step1_levels.py && python step2_managed.py && python step3_eda.py
python step4_model.py && python step5_representation.py && python step6_charts.py
python build_notebook.py && python execute_notebook.py   # writes the notebook
npm install docx pptxgenjs
node build_report.js                                     # writes the report
node build_deck.js && python fix_multilvl.py Workplace_Diversity_Analysis_Deck.pptx   # deck, then PowerPoint label fix
```

Copy the rebuilt notebook, report and deck up to the repo root to publish them.

## Limitations

The salary model has no train/test split, residual diagnostics, multicollinearity (VIF) check or performance-rating control. OLS and p-values are implemented directly in NumPy and were not cross-checked against statsmodels. The deck's chart-label fix has been checked in LibreOffice, not yet in PowerPoint.

## Project history

This project was built in July 2026 and first uploaded as a single batch of files. It was refined in October 2026 (readable chart labels, a PowerPoint chart-label fix, and two rounds of wording fixes so claims match what the analysis supports). Those intermediate edits were made in place and not saved as separate versions, so only the final state is committed here, through two pull requests: one adding the source scripts and data, and one updating the deliverables to their final wording.
