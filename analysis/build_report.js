const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle, ImageRun, AlignmentType, PageBreak,
  LevelFormat, convertInchesToTwip
} = require("docx");

const LETTER = { width: 12240, height: 15840 };

function img(path, w, h) {
  return new ImageRun({ type: "png", data: fs.readFileSync(path), transformation: { width: w, height: h } });
}

function h1(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 320, after: 160 } });
}
function h2(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 260, after: 120 } });
}
function p(text, opts = {}) {
  return new Paragraph({ children: [new TextRun({ text, ...opts })], spacing: { after: 160 } });
}
function pRuns(runs, opts = {}) {
  return new Paragraph({ children: runs, spacing: { after: 160 }, ...opts });
}
function bullet(text, bold_lead) {
  const children = [];
  if (bold_lead) {
    children.push(new TextRun({ text: bold_lead, bold: true }));
    children.push(new TextRun({ text: " " + text }));
  } else {
    children.push(new TextRun({ text }));
  }
  return new Paragraph({ children, numbering: { reference: "bullets", level: 0 }, spacing: { after: 100 } });
}
function numbered(text, bold_lead) {
  const children = [];
  if (bold_lead) {
    children.push(new TextRun({ text: bold_lead, bold: true }));
    children.push(new TextRun({ text: " " + text }));
  } else {
    children.push(new TextRun({ text }));
  }
  return new Paragraph({ children, numbering: { reference: "numbers", level: 0 }, spacing: { after: 120 } });
}

function hrParagraph() {
  return new Paragraph({
    border: { bottom: { color: "999999", space: 1, style: BorderStyle.SINGLE, size: 6 } },
    spacing: { after: 200 },
  });
}

function simpleTable(headers, rows, colWidths) {
  const total = colWidths.reduce((a, b) => a + b, 0);
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((htext, i) => new TableCell({
      width: { size: colWidths[i], type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: "1F3864" },
      children: [new Paragraph({ children: [new TextRun({ text: htext, bold: true, color: "FFFFFF" })] })],
    })),
  });
  const dataRows = rows.map((r, ri) => new TableRow({
    children: r.map((cell, i) => new TableCell({
      width: { size: colWidths[i], type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: ri % 2 === 0 ? "FFFFFF" : "F2F2F2" },
      children: [new Paragraph({ children: [new TextRun({ text: String(cell) })] })],
    })),
  }));
  return new Table({ width: { size: total, type: WidthType.DXA }, columnWidths: colWidths, rows: [headerRow, ...dataRows] });
}

const doc = new Document({
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 460, hanging: 260 } } } }] },
      { reference: "numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 460, hanging: 260 } } } }] },
    ],
  },
  sections: [{
    properties: { page: { size: LETTER, margin: { top: 1080, bottom: 1080, left: 1260, right: 1260 } } },
    children: [
      // Title page
      new Paragraph({ spacing: { before: 2000 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Workplace Diversity Analysis", bold: true, size: 56, color: "1F3864" })] }),
      new Paragraph({ spacing: { before: 200 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Employee Levels, Compensation, and Pay Equity", size: 30, color: "444444" })] }),
      new Paragraph({ spacing: { before: 600 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Prepared for: Head of HR", size: 24 })] }),
      new Paragraph({ spacing: { before: 100 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "July 2026", size: 24, color: "666666" })] }),
      new Paragraph({ children: [new PageBreak()] }),

      // Executive Summary
      h1("Executive Summary"),
      p("The Head of HR asked for an analysis of whether the company treats all employees fairly, using internal hierarchy and compensation data covering 10,000 employees. This report classifies every employee into one of six organizational levels, measures how many people each employee manages (directly and indirectly), builds a model of what drives salary, and tests whether pay differs by gender after accounting for role."),
      p("The headline finding is nuanced. There is a large raw pay gap between men and women (men earn about 14% more on average), and that gap is statistically significant. However, once we account for the department and level an employee sits in, the gap all but disappears — we find no statistically significant pay gap within the same level and department. (A non-significant result is the absence of evidence of a gap, not proof of fairness; the data include no performance measure, so it cannot rule out differences driven by factors we did not observe.) The larger pattern is representation: a much larger share of women than men work in the lowest-paying department (HR), a smaller share work in the highest-paying one (Engineering), and women who do reach senior levels have needed more years of experience to get there than men at the same level. In short, the data point to a pipeline and promotion pattern that shows up downstream as a pay gap, rather than a gap within the same role."),
      h2("Key Numbers"),
      simpleTable(
        ["Metric", "Finding"],
        [
          ["Employees analyzed", "10,000"],
          ["Raw gender pay gap", "Men earn $27,562 more on average (+14.0%), p < 0.001"],
          ["Adjusted gender pay gap", "–$703 (no significant gap, p = 0.65) within the same level and department, controlling also for degree, experience, signing bonus; no performance control"],
          ["Share working in Engineering (highest-paid dept.)", "18.8% of women vs. 31.4% of men (p < 0.001)"],
          ["Share working in HR (lowest-paid dept.)", "29.7% of women vs. 9.9% of men (p < 0.001)"],
          ["Share reaching Director level or above", "1.60% of women vs. 2.21% of men (p = 0.038)"],
          ["Experience needed to reach Director", "16.5 yrs (women) vs. 12.9 yrs (men)"],
        ],
        [4300, 5540]
      ),
      new Paragraph({ children: [new PageBreak()] }),

      // Data & Methodology
      h1("Data & Methodology"),
      p("Two tables were provided:"),
      bullet("employee_id, boss_id, and dept (Engineering, Marketing, Sales, HR, or CEO).", "company_hierarchy —"),
      bullet("employee_id, signing_bonus, salary, degree_level, sex, and yrs_experience.", "employee —"),
      p("Both tables cover the same 10,000 employees with no missing values (aside from the CEO's boss_id, which is null by definition) and no duplicate IDs. All analysis and modeling was performed in Python (pandas / numpy); the regression model (ordinary least squares via the normal equations) was implemented directly in NumPy. Statistical significance was assessed using the standard normal approximation, which is very accurate at this sample size (n ≈ 10,000)."),

      // Section 1: Levels
      h1("1. Employee Levels"),
      p("Employees were classified into six levels using the reporting hierarchy, working bottom-up: an Individual Contributor (IC) manages no one; a Middle Manager (MM) directly supervises only ICs; a Director (D) supervises only MMs; a Vice President (VP) supervises only Directors; an Executive (E) supervises only VPs; and the CEO supervises the Executives. The classification resolved cleanly for all 10,000 employees with no ambiguous or cyclical cases."),
      pRuns([new img("chart_level_distribution.png", 570, 366)], { alignment: AlignmentType.CENTER }),
      simpleTable(
        ["Level", "Employees", "% of company"],
        [
          ["IC — Individual Contributor", "9,001", "90.0%"],
          ["MM — Middle Manager", "800", "8.0%"],
          ["D — Director", "159", "1.6%"],
          ["VP — Vice President", "35", "0.35%"],
          ["E — Executive", "4", "0.04%"],
          ["CEO", "1", "0.01%"],
        ],
        [4800, 2540, 2500]
      ),

      // Section 2: span of control
      h1("2. Span of Control (Total People Managed)"),
      p("For every employee we calculated the total number of people they manage, directly and indirectly (e.g., a manager with 2 direct reports who each manage 5 people effectively manages 12). This was computed recursively from the bottom of the org chart up, and cross-validated against the level classification: as a sanity check, the CEO's total should equal every other employee in the company, which it does (9,999)."),
      simpleTable(
        ["Level", "Min managed", "Max managed", "Average managed"],
        [
          ["IC", "0", "0", "0"],
          ["MM", "2", "23", "11.3"],
          ["D", "6", "166", "61.6"],
          ["VP", "111", "607", "284.6"],
          ["E", "1,693", "3,598", "2,498.8"],
          ["CEO", "9,999", "9,999", "9,999"],
        ],
        [2500, 2500, 2500, 2340]
      ),
      p("Span of control scales sensibly and monotonically with level, which further confirms the hierarchy data and level classification are internally consistent."),
      new Paragraph({ children: [new PageBreak()] }),

      // Section 3: salary drivers
      h1("3. What Drives Salary?"),
      p("Before modeling, we looked at how salary varies with each factor individually. Salary rises steeply with level and varies a great deal by department, while years of experience, degree level, and signing bonus show only weak raw relationships with pay."),
      pRuns([new img("chart_salary_by_level.png", 480, 309)], { alignment: AlignmentType.CENTER }),
      pRuns([new img("chart_salary_by_dept.png", 480, 309)], { alignment: AlignmentType.CENTER }),
      p("Correlation of numeric factors with salary: years of experience (r = 0.05), total people managed (r = 0.10), signing bonus (r = 0.11) — all weak. This is the first sign that level and department, not experience or credentials, are the dominant pay drivers at this company."),

      // Section 4: Regression model
      h1("4. Salary Prediction Model"),
      p("We built a multiple linear regression predicting salary from level, department, degree, years of experience, signing bonus, and sex (reference group: a Director, in HR, with a High School diploma, female, 0 years of experience, no signing bonus). The CEO was excluded from the model as a single-point outlier with no variance. The model explains about 35% of the variance in salary (R² = 0.349, adjusted R² = 0.348, n = 9,999)."),
      pRuns([new img("chart_regression_coefficients.png", 540, 360)], { alignment: AlignmentType.CENTER }),
      simpleTable(
        ["Factor", "Effect on salary", "Statistically significant?"],
        [
          ["Level: Executive (vs. Director)", "+$354,841", "Yes (p < 0.001)"],
          ["Level: VP (vs. Director)", "+$41,777", "Yes (p = 0.002)"],
          ["Level: MM (vs. Director)", "–$16,789", "Yes (p = 0.010)"],
          ["Level: IC (vs. Director)", "–$19,310", "Yes (p = 0.004)"],
          ["Dept: Engineering (vs. HR)", "+$159,643", "Yes (p < 0.001)"],
          ["Dept: Sales (vs. HR)", "+$110,421", "Yes (p < 0.001)"],
          ["Dept: Marketing (vs. HR)", "+$110,418", "Yes (p < 0.001)"],
          ["Degree: PhD / Master / Bachelor (vs. High School)", "+$700 to +$2,900", "No (p ≥ 0.19)"],
          ["Years of experience (per year)", "+$478", "No (p = 0.13)"],
          ["Signing bonus", "–$1,175", "No (p = 0.46)"],
          ["Sex: Male (vs. Female)", "–$703", "No (p = 0.65)"],
        ],
        [4600, 2340, 2900]
      ),
      p("The takeaway: level and department overwhelmingly determine pay. Degree, experience, and signing bonus show no significant effect once level and department are accounted for. Likewise, sex has no statistically significant effect on pay once level and department are held constant."),
      new Paragraph({ children: [new PageBreak()] }),

      // Section 5: fairness
      h1("5. Fairness Assessment: Is the Company Treating Employees Fairly?"),
      h2("5.1 The raw pay gap is real — but no significant gap remains within level and department"),
      p("Women earn $171,315 on average versus $198,954 for men — a $27,562 (14.0%) gap that is highly statistically significant (p < 0.001). But when we compare men and women at the same level in the same department, that gap shrinks to –$703 and is no longer statistically distinguishable from zero (p = 0.65, and the same holds in a level+department-only version of the model, p = 0.60). This means we find no significant gap between men and women within the same level and department. Because the data contain no performance measure, this does not prove pay is fair; it shows that, among the factors we can observe, sex does not explain pay once role is held constant."),
      h2("5.2 The larger difference is in representation"),
      pRuns([new img("chart_dept_by_sex.png", 480, 307)], { alignment: AlignmentType.CENTER }),
      p("A far larger share of women than men work in HR, the lowest-paying department (29.7% of women vs. 9.9% of men), and a smaller share work in Engineering, the highest-paying department (18.8% of women vs. 31.4% of men). Both differences are highly significant (p < 0.001). These are shares within each sex, not the share of each department that is female. Because department is one of the two strongest drivers of pay, this distribution alone explains most of the raw gap."),
      pRuns([new img("chart_leadership_by_sex.png", 380, 285)], { alignment: AlignmentType.CENTER }),
      p("A smaller share of women also reach leadership: 1.60% of women hold a Director-level role or above, versus 2.21% of men (p = 0.038)."),
      h2("5.3 Senior women have more experience than senior men"),
      pRuns([new img("chart_experience_by_level_sex.png", 480, 288)], { alignment: AlignmentType.CENTER }),
      p("Among employees currently at senior levels, women have more years of experience on average than men at the same level: 16.5 years vs. 12.9 years at Director, and 25.6 vs. 19.0 years at VP (these differences were not significance-tested). This snapshot shows experience at each level, not how long promotion took, so it is a flag for follow-up with promotion-timing data rather than evidence of a glass ceiling. The adjusted model finds no significant pay gap once level and department are held constant."),
      new Paragraph({ children: [new PageBreak()] }),

      // Recommendations
      h1("6. Recommendations for the Head of HR"),
      numbered("The compensation model finds no significant gap within level and department — but that is not proof of fairness (no performance control), and it can mask the structural issue: who gets into which department, who gets promoted, and how fast.", "Do not stop at “equal pay for equal role.”"),
      numbered("Audit hiring, internal transfer, and retention funnels into Engineering (the highest-paying department) to understand why a smaller share of women than men work in Engineering, relative to HR, Sales, and Marketing.", "Investigate the Engineering pipeline."),
      numbered("The experience gap at Director/VP/Executive level suggests women face a longer or higher bar to promotion. Review promotion criteria, calibration processes, and manager decision patterns for bias, and track median time-to-promotion by sex and level going forward.", "Audit promotion timelines and criteria."),
      numbered("Track department mix and leadership representation by sex on a recurring (e.g., quarterly) basis, rather than treating this as a one-time pay-equity check.", "Set representation targets and monitor over time."),
      numbered("Extend this analysis to other protected characteristics (e.g., race/ethnicity, age, disability status) if and when that data becomes available, and re-run it periodically to check whether interventions are closing the representation and promotion gaps.", "Broaden and repeat the analysis."),
    ],
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync("Workplace_Diversity_Analysis_Report.docx", buf);
  console.log("Report written.");
});
