# Workplace Diversity Analysis

Analysis of internal HR data (10,000 employees): organizational levels, span of control, a salary regression, and tests for a gender pay gap and for differences in representation and promotion.

The deliverables (notebook, report, deck) are in the repo root. The data and the scripts that produce them are in `analysis/`.

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
