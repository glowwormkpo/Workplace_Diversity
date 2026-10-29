const pptxgen = require("pptxgenjs");

// Palette: "Executive Navy & Amber" — corporate trust (navy) with a warning-amber
// accent used specifically to flag the equity gaps this deck surfaces.
const NAVY = "1E2761";
const NAVY_DARK = "141B47";
const ICE = "CADCFC";
const AMBER = "E8A33D";
const ROSE = "C0435C";   // Female series
const SLATE = "5B6B8C";  // Male series (muted navy-blue, distinct from NAVY headers)
const WHITE = "FFFFFF";
const OFFWHITE = "F5F7FB";
const GRAY = "6B7280";
const DARKTEXT = "1F2430";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5 in

const FONT = "Calibri";
const HEAD_FONT = "Cambria";

function bgSlide(color) {
  const s = pres.addSlide();
  s.background = { color };
  return s;
}

// ---------- Slide 1: Title ----------
{
  const s = bgSlide(NAVY);
  s.addShape("rect", { x: 0, y: 0, w: 13.33, h: 7.5, fill: { color: NAVY } });
  s.addText("WORKPLACE DIVERSITY ANALYSIS", {
    x: 0.9, y: 2.55, w: 11.5, h: 1.1, fontFace: HEAD_FONT, fontSize: 40, bold: true, color: WHITE, align: "left",
  });
  s.addText("Employee Levels, Compensation, and Pay Equity", {
    x: 0.9, y: 3.55, w: 11.5, h: 0.6, fontFace: FONT, fontSize: 20, color: ICE, align: "left",
  });
  s.addText("Prepared for the Head of HR   •   July 2026", {
    x: 0.9, y: 4.55, w: 11.5, h: 0.4, fontFace: FONT, fontSize: 14, color: ICE, align: "left",
  });
  s.addText("10,000 employees analyzed", {
    x: 0.9, y: 6.55, w: 6, h: 0.4, fontFace: FONT, fontSize: 13, color: "8FA3D4", align: "left", italic: true,
  });
}

// ---------- Slide 2: Executive summary / headline ----------
{
  const s = bgSlide(WHITE);
  s.addText("The Headline Finding", { x: 0.6, y: 0.45, w: 12, h: 0.7, fontFace: HEAD_FONT, fontSize: 30, bold: true, color: NAVY });
  s.addText(
    "There is a real 14% pay gap between men and women. We find no significant gap within the same level and department — the pattern points to representation and promotion differences that show up downstream as a pay gap.",
    { x: 0.6, y: 1.2, w: 12.1, h: 0.9, fontFace: FONT, fontSize: 16, color: DARKTEXT, align: "left" }
  );

  const cardY = 2.5, cardH = 3.9, cardW = 3.85, gap = 0.35;
  const cards = [
    { stat: "$27,562", label: "Raw pay gap (men earn more)", sub: "14.0% higher • statistically significant, p < 0.001", color: AMBER },
    { stat: "–$703", label: "Adjusted gap, same level & dept", sub: "Not significant, p = 0.65 — no significant gap within the same level and department (no performance control)", color: SLATE },
    { stat: "18.8% vs 31.4%", label: "Share of women vs. men working in Engineering", sub: "The highest-paying department, p < 0.001", color: ROSE },
  ];
  cards.forEach((c, i) => {
    const x = 0.6 + i * (cardW + gap);
    s.addShape("roundRect", { x, y: cardY, w: cardW, h: cardH, rectRadius: 0.08, fill: { color: OFFWHITE }, shadow: { type: "outer", color: "888888", opacity: 0.25, blur: 6, offset: 2, angle: 90 } });
    s.addShape("rect", { x: x + 0.3, y: cardY + 0.35, w: 0.5, h: 0.5, fill: { color: c.color } });
    s.addText(c.stat, { x: x + 0.25, y: cardY + 1.0, w: cardW - 0.5, h: 0.9, fontFace: HEAD_FONT, fontSize: 27, bold: true, color: NAVY, align: "left" });
    s.addText(c.label, { x: x + 0.25, y: cardY + 1.95, w: cardW - 0.5, h: 0.7, fontFace: FONT, fontSize: 14, bold: true, color: DARKTEXT, align: "left" });
    s.addText(c.sub, { x: x + 0.25, y: cardY + 2.6, w: cardW - 0.5, h: 1.0, fontFace: FONT, fontSize: 11.5, color: GRAY, align: "left" });
  });
}

// ---------- Slide 3: Methodology ----------
{
  const s = bgSlide(WHITE);
  s.addText("Data & Method", { x: 0.6, y: 0.45, w: 12, h: 0.7, fontFace: HEAD_FONT, fontSize: 30, bold: true, color: NAVY });

  const items = [
    { t: "Two data tables", d: "company_hierarchy (employee, boss, department) and employee (salary, degree, sex, experience, signing bonus) — 10,000 employees, no missing or duplicate records." },
    { t: "Levels derived from the org chart", d: "Six levels built bottom-up from reporting lines: IC → MM → D → VP → E → CEO." },
    { t: "Salary modeled with OLS regression", d: "OLS implemented directly in NumPy; significance from the normal approximation, accurate at n ≈ 10,000." },
    { t: "Fairness tested, not assumed", d: "Compared raw pay gaps to gaps after controlling for level, department, degree, experience, and signing bonus." },
  ];
  const colW = 5.85, rowH = 1.5, startY = 1.45;
  items.forEach((it, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.6 + col * (colW + 0.35);
    const y = startY + row * (rowH + 0.35);
    s.addShape("ellipse", { x, y: y + 0.05, w: 0.45, h: 0.45, fill: { color: NAVY } });
    s.addText(String(i + 1), { x, y: y + 0.05, w: 0.45, h: 0.45, fontFace: FONT, fontSize: 16, bold: true, color: WHITE, align: "center", valign: "middle" });
    s.addText(it.t, { x: x + 0.65, y, w: colW - 0.65, h: 0.4, fontFace: FONT, fontSize: 15, bold: true, color: NAVY });
    s.addText(it.d, { x: x + 0.65, y: y + 0.42, w: colW - 0.65, h: 1.0, fontFace: FONT, fontSize: 12, color: DARKTEXT });
  });
}

// ---------- Slide 4: Org structure ----------
{
  const s = bgSlide(WHITE);
  s.addText("Six Levels, One Pyramid", { x: 0.6, y: 0.4, w: 12, h: 0.7, fontFace: HEAD_FONT, fontSize: 30, bold: true, color: NAVY });
  s.addText("Share of the 10,000-person company at each level (bar not to scale)", { x: 0.6, y: 1.05, w: 12, h: 0.4, fontFace: FONT, fontSize: 14, color: GRAY });

  const levels = [
    { name: "IC", pct: 90.0, n: "9,001" },
    { name: "MM", pct: 8.0, n: "800" },
    { name: "D", pct: 1.6, n: "159" },
    { name: "VP", pct: 0.35, n: "35" },
    { name: "E", pct: 0.04, n: "4" },
    { name: "CEO", pct: 0.01, n: "1" },
  ];
  const colors = [ICE, "9FB8E8", SLATE, NAVY, NAVY_DARK, AMBER];
  const barX = 0.6, barY = 1.9, barW = 11.6, barH = 0.9;
  let cx = barX;
  // minimum visual width per segment so tiny ones are still visible/legible
  const minW = 0.85;
  const rawWidths = levels.map(l => Math.max((l.pct / 100) * barW, minW));
  const scale = barW / rawWidths.reduce((a, b) => a + b, 0);
  levels.forEach((l, i) => {
    const w = rawWidths[i] * scale;
    s.addShape("rect", { x: cx, y: barY, w, h: barH, fill: { color: colors[i] }, line: { color: WHITE, width: 1 } });
    s.addText(l.name, { x: cx, y: barY, w, h: barH * 0.55, fontFace: FONT, fontSize: 11, bold: true, color: i >= 2 ? WHITE : DARKTEXT, align: "center", valign: "bottom" });
    cx += w;
  });
  cx = barX;
  levels.forEach((l, i) => {
    const w = rawWidths[i] * scale;
    s.addText(`${l.n}`, { x: cx, y: barY + barH + 0.08, w, h: 0.35, fontFace: FONT, fontSize: 11, bold: true, color: DARKTEXT, align: "center" });
    cx += w;
  });

  s.addText("IC = Individual Contributor   •   MM = Middle Manager   •   D = Director   •   VP = Vice President   •   E = Executive", {
    x: 0.6, y: 3.5, w: 11.8, h: 0.35, fontFace: FONT, fontSize: 11.5, bold: true, color: NAVY,
  });
  s.addText("Levels are defined recursively from the reporting hierarchy: an IC manages no one; each level up manages only people from the level directly below it.", {
    x: 0.6, y: 3.85, w: 11.8, h: 0.5, fontFace: FONT, fontSize: 12, color: DARKTEXT, italic: true,
  });

  // Span of control mini-table
  s.addText("Span of Control (direct + indirect reports)", { x: 0.6, y: 4.5, w: 11, h: 0.4, fontFace: FONT, fontSize: 15, bold: true, color: NAVY });
  const rows = [
    ["Level", "Min", "Max", "Average"],
    ["MM", "2", "23", "11.3"],
    ["D", "6", "166", "61.6"],
    ["VP", "111", "607", "284.6"],
    ["E", "1,693", "3,598", "2,498.8"],
    ["CEO", "9,999", "9,999", "9,999"],
  ];
  s.addTable(rows.map((r, ri) => r.map(c => ({ text: c, options: {
    fontFace: FONT, fontSize: 12, color: ri === 0 ? WHITE : DARKTEXT, bold: ri === 0,
    fill: { color: ri === 0 ? NAVY : (ri % 2 === 0 ? OFFWHITE : WHITE) }, align: "center", valign: "middle",
  } }))), { x: 0.6, y: 4.95, w: 8.6, colW: [2.15, 2.15, 2.15, 2.15], h: 1.9, rowH: 0.32, border: { type: "solid", color: "DDDDDD", pt: 0.5 } });

  s.addText("Sanity check: the CEO manages 9,999 people — everyone else in the company.", {
    x: 9.4, y: 5.55, w: 3.3, h: 1.0, fontFace: FONT, fontSize: 12, color: GRAY, italic: true,
  });
}

// ---------- Slide 5: What drives salary ----------
{
  const s = bgSlide(WHITE);
  s.addText("What Drives Salary?", { x: 0.6, y: 0.4, w: 12, h: 0.7, fontFace: HEAD_FONT, fontSize: 30, bold: true, color: NAVY });
  s.addText("Level and department dominate; experience, degree, and signing bonus show no significant effect", { x: 0.6, y: 1.05, w: 12, h: 0.4, fontFace: FONT, fontSize: 14, color: GRAY });

  s.addChart("bar", [{
    name: "Avg Salary",
    labels: ["IC", "MM", "D", "VP", "E", "CEO"],
    values: [187895, 192474, 213302, 258029, 562500, 700000],
  }], {
    x: 0.5, y: 1.6, w: 6.0, h: 5.2,
    barDir: "col", chartColors: [NAVY],
    showTitle: true, title: "Average Salary by Level", titleFontFace: FONT, titleFontSize: 14, titleColor: DARKTEXT,
    showValue: true, dataLabelFontSize: 9, dataLabelColor: DARKTEXT, dataLabelFormatCode: "$#,##0",
    dataLabelPosition: "outEnd",
    catAxisLabelFontSize: 11, catAxisLabelColor: DARKTEXT, catGridLine: { style: "none" },
    valAxisLabelFontSize: 9, valAxisLabelColor: GRAY, valAxisLabelFormatCode: "$#,##0",
    valGridLine: { color: "EAEAEA", size: 0.75 }, showLegend: false,
  });

  s.addChart("bar", [{
    name: "Avg Salary",
    labels: ["HR", "Marketing", "Sales", "Engineering"],
    values: [84560, 194623, 194342, 243525],
  }], {
    x: 6.8, y: 1.6, w: 6.0, h: 5.2,
    barDir: "col", chartColors: [AMBER],
    showTitle: true, title: "Average Salary by Department", titleFontFace: FONT, titleFontSize: 14, titleColor: DARKTEXT,
    showValue: true, dataLabelFontSize: 9, dataLabelColor: DARKTEXT, dataLabelFormatCode: "$#,##0",
    dataLabelPosition: "outEnd",
    catAxisLabelFontSize: 11, catAxisLabelColor: DARKTEXT, catGridLine: { style: "none" },
    valAxisLabelFontSize: 9, valAxisLabelColor: GRAY, valAxisLabelFormatCode: "$#,##0",
    valGridLine: { color: "EAEAEA", size: 0.75 }, showLegend: false,
  });

  s.addText("IC = Individual Contributor   •   MM = Middle Manager   •   D = Director   •   VP = Vice President   •   E = Executive", {
    x: 0.5, y: 6.85, w: 12.3, h: 0.35, fontFace: FONT, fontSize: 10.5, color: GRAY, italic: true, align: "center",
  });
}

// ---------- Slide 6: Regression model ----------
{
  const s = bgSlide(WHITE);
  s.addText("The Salary Model", { x: 0.6, y: 0.4, w: 12, h: 0.7, fontFace: HEAD_FONT, fontSize: 30, bold: true, color: NAVY });
  s.addText("Effect of each factor on salary, holding everything else constant  (R² = 0.35, n = 9,999)", { x: 0.6, y: 1.05, w: 12, h: 0.4, fontFace: FONT, fontSize: 14, color: GRAY });

  // Only chart the factors with a visually meaningful, statistically significant
  // effect. The near-zero, not-significant factors (degree, tenure, signing bonus,
  // sex) are covered as text in the side panel instead of as unreadable tiny bars.
  const rows = [
    ["Executive (vs. Director)", 354841],
    ["Engineering dept (vs. HR)", 159643],
    ["Sales dept (vs. HR)", 110421],
    ["Marketing dept (vs. HR)", 110418],
    ["Vice President (vs. Director)", 41777],
  ];
  s.addChart("bar", [{
    name: "Effect on salary ($)",
    labels: rows.map(r => r[0]),
    values: rows.map(r => r[1]),
  }], {
    x: 0.5, y: 1.55, w: 8.7, h: 5.3,
    barDir: "bar", chartColors: [NAVY],
    showTitle: false,
    showValue: true, dataLabelFontSize: 11, dataLabelColor: DARKTEXT, dataLabelFormatCode: "$#,##0", dataLabelPosition: "outEnd",
    catAxisLabelFontSize: 13, catAxisLabelColor: DARKTEXT, catGridLine: { style: "none" },
    valAxisLabelFontSize: 9, valAxisLabelColor: GRAY, valAxisLabelFormatCode: "$#,##0",
    valGridLine: { color: "EAEAEA", size: 0.75 }, showLegend: false,
  });
  s.addText("Individual Contributors and Middle Managers earn $16,000–$19,000 less than Directors (p < 0.01) — a modest, expected step down the ladder, not shown above to keep the scale readable.", {
    x: 0.5, y: 6.75, w: 8.7, h: 0.5, fontFace: FONT, fontSize: 10.5, color: GRAY, italic: true,
  });

  s.addShape("roundRect", { x: 9.4, y: 1.6, w: 3.35, h: 5.15, rectRadius: 0.08, fill: { color: OFFWHITE } });
  s.addText("Reference employee:", { x: 9.65, y: 1.8, w: 2.9, h: 0.35, fontFace: FONT, fontSize: 12, bold: true, color: NAVY });
  s.addText("Director, HR dept, High School diploma, Female, 0 yrs experience, no signing bonus", { x: 9.65, y: 2.15, w: 2.9, h: 0.9, fontFace: FONT, fontSize: 11, color: DARKTEXT, italic: true });
  s.addShape("line", { x: 9.65, y: 3.15, w: 2.9, h: 0, line: { color: "DDDDDD", width: 1 } });
  s.addText("Statistically significant:", { x: 9.65, y: 3.3, w: 2.9, h: 0.3, fontFace: FONT, fontSize: 12, bold: true, color: NAVY });
  s.addText("Level and department, all p < 0.01", { x: 9.65, y: 3.62, w: 2.9, h: 0.4, fontFace: FONT, fontSize: 11, color: DARKTEXT });
  s.addText("Not significant:", { x: 9.65, y: 4.15, w: 2.9, h: 0.3, fontFace: FONT, fontSize: 12, bold: true, color: AMBER });
  s.addText("Degree, experience, signing bonus, and sex — all p ≥ 0.13. Sex in particular: p = 0.65.", { x: 9.65, y: 4.47, w: 2.9, h: 0.9, fontFace: FONT, fontSize: 11, color: DARKTEXT });
  s.addShape("line", { x: 9.65, y: 5.5, w: 2.9, h: 0, line: { color: "DDDDDD", width: 1 } });
  s.addText("Bottom line: level and department set pay. With them held constant, sex has no significant effect.", { x: 9.65, y: 5.65, w: 2.9, h: 1.0, fontFace: FONT, fontSize: 12, bold: true, color: NAVY });
}

// ---------- Slide 7: Raw vs adjusted gap ----------
{
  const s = bgSlide(WHITE);
  s.addText("The Pay Gap, Explained", { x: 0.6, y: 0.4, w: 12, h: 0.7, fontFace: HEAD_FONT, fontSize: 30, bold: true, color: NAVY });
  s.addText("A real raw gap that (almost) fully disappears once level and department are held constant", { x: 0.6, y: 1.05, w: 12, h: 0.4, fontFace: FONT, fontSize: 14, color: GRAY });

  s.addChart("bar", [{
    name: "Gap vs. reference",
    labels: ["Raw gap\n(unadjusted)", "Adjusted gap\n(same level & dept)"],
    values: [27562, -703],
  }], {
    x: 1.2, y: 1.7, w: 6.6, h: 5.0,
    barDir: "col", chartColors: [AMBER],
    invertedColors: [SLATE],
    showTitle: true, title: "Male minus Female average salary ($)", titleFontFace: FONT, titleFontSize: 14, titleColor: DARKTEXT,
    showValue: true, dataLabelFontSize: 13, dataLabelColor: DARKTEXT, dataLabelFormatCode: "$#,##0", dataLabelPosition: "outEnd",
    catAxisLabelFontSize: 13, catAxisLabelColor: DARKTEXT, catGridLine: { style: "none" },
    valAxisLabelFontSize: 9, valAxisLabelColor: GRAY, valAxisLabelFormatCode: "$#,##0",
    valGridLine: { color: "EAEAEA", size: 0.75 }, showLegend: false,
  });

  s.addShape("roundRect", { x: 8.15, y: 1.9, w: 4.6, h: 2.0, rectRadius: 0.08, fill: { color: OFFWHITE } });
  s.addText("$27,562 gap", { x: 8.4, y: 2.05, w: 4.1, h: 0.4, fontFace: HEAD_FONT, fontSize: 18, bold: true, color: AMBER });
  s.addText("Statistically significant, p < 0.001 — men earn 14.0% more on average, company-wide.", { x: 8.4, y: 2.5, w: 4.1, h: 1.3, fontFace: FONT, fontSize: 12.5, color: DARKTEXT });

  s.addShape("roundRect", { x: 8.15, y: 4.1, w: 4.6, h: 2.0, rectRadius: 0.08, fill: { color: OFFWHITE } });
  s.addText("–$703 gap", { x: 8.4, y: 4.25, w: 4.1, h: 0.4, fontFace: HEAD_FONT, fontSize: 18, bold: true, color: SLATE });
  s.addText("Not significant, p = 0.65 — no detectable pay difference for the same level and department.", { x: 8.4, y: 4.7, w: 4.1, h: 1.3, fontFace: FONT, fontSize: 12.5, color: DARKTEXT });
}

// ---------- Slide 8: Representation gap ----------
{
  const s = bgSlide(WHITE);
  s.addText("The Real Gap: Representation", { x: 0.6, y: 0.4, w: 12, h: 0.7, fontFace: HEAD_FONT, fontSize: 30, bold: true, color: NAVY });
  s.addText("A larger share of women than men work in the lowest-paying department, and a smaller share in the highest-paying one", { x: 0.6, y: 1.05, w: 12, h: 0.4, fontFace: FONT, fontSize: 14, color: GRAY });

  s.addChart("bar", [
    { name: "Female", labels: ["Engineering", "Marketing", "Sales", "HR"], values: [18.8, 18.3, 33.2, 29.7] },
    { name: "Male", labels: ["Engineering", "Marketing", "Sales", "HR"], values: [31.4, 21.1, 37.6, 9.9] },
  ], {
    x: 0.6, y: 1.6, w: 8.4, h: 5.2,
    barDir: "col", barGapWidthPct: 35,
    chartColors: [ROSE, SLATE],
    showTitle: true, title: "% of each sex working in each department", titleFontFace: FONT, titleFontSize: 14, titleColor: DARKTEXT,
    showValue: true, dataLabelFontSize: 9, dataLabelColor: DARKTEXT, dataLabelFormatCode: "0.0\"%\"", dataLabelPosition: "outEnd",
    catAxisLabelFontSize: 12, catAxisLabelColor: DARKTEXT, catGridLine: { style: "none" },
    valAxisLabelFontSize: 9, valAxisLabelColor: GRAY, valAxisLabelFormatCode: "0\"%\"",
    valGridLine: { color: "EAEAEA", size: 0.75 },
    showLegend: true, legendPos: "b", legendFontSize: 11,
  });

  s.addShape("roundRect", { x: 9.3, y: 1.6, w: 3.45, h: 2.4, rectRadius: 0.08, fill: { color: OFFWHITE } });
  s.addText("Engineering (highest pay: $243,525 avg)", { x: 9.55, y: 1.78, w: 2.95, h: 0.6, fontFace: FONT, fontSize: 12, bold: true, color: NAVY });
  s.addText("18.8% of women  vs.  31.4% of men", { x: 9.55, y: 2.4, w: 2.95, h: 0.4, fontFace: FONT, fontSize: 13, bold: true, color: ROSE });
  s.addText("p < 0.001", { x: 9.55, y: 2.8, w: 2.95, h: 0.3, fontFace: FONT, fontSize: 11, color: GRAY, italic: true });

  s.addShape("roundRect", { x: 9.3, y: 4.35, w: 3.45, h: 2.4, rectRadius: 0.08, fill: { color: OFFWHITE } });
  s.addText("HR (lowest pay: $84,560 avg)", { x: 9.55, y: 4.53, w: 2.95, h: 0.6, fontFace: FONT, fontSize: 12, bold: true, color: NAVY });
  s.addText("29.7% of women  vs.  9.9% of men", { x: 9.55, y: 5.15, w: 2.95, h: 0.4, fontFace: FONT, fontSize: 13, bold: true, color: ROSE });
  s.addText("p < 0.001", { x: 9.55, y: 5.55, w: 2.95, h: 0.3, fontFace: FONT, fontSize: 11, color: GRAY, italic: true });
}

// ---------- Slide 9: Experience by level ----------
{
  const s = bgSlide(WHITE);
  s.addText("Experience at Senior Levels", { x: 0.6, y: 0.4, w: 12, h: 0.7, fontFace: HEAD_FONT, fontSize: 30, bold: true, color: NAVY });
  s.addText("Women at senior levels have more experience on average than men at the same level", { x: 0.6, y: 1.05, w: 12, h: 0.4, fontFace: FONT, fontSize: 14, color: GRAY });

  s.addChart("bar", [
    { name: "Female", labels: ["IC", "MM", "D", "VP", "E"], values: [3.3, 8.2, 16.5, 25.6, 28.0] },
    { name: "Male", labels: ["IC", "MM", "D", "VP", "E"], values: [3.2, 7.6, 12.9, 19.0, 25.3] },
  ], {
    x: 0.6, y: 1.6, w: 8.1, h: 5.2,
    barDir: "col", barGapWidthPct: 35,
    chartColors: [ROSE, SLATE],
    showTitle: true, title: "Average years of experience at each level", titleFontFace: FONT, titleFontSize: 14, titleColor: DARKTEXT,
    showValue: true, dataLabelFontSize: 9, dataLabelColor: DARKTEXT, dataLabelFormatCode: "0.0", dataLabelPosition: "outEnd",
    catAxisLabelFontSize: 12, catAxisLabelColor: DARKTEXT, catGridLine: { style: "none" },
    valAxisLabelFontSize: 9, valAxisLabelColor: GRAY, valAxisLabelFormatCode: "0",
    valGridLine: { color: "EAEAEA", size: 0.75 },
    showLegend: true, legendPos: "b", legendFontSize: 11,
  });
  s.addText("IC = Individual Contributor   •   MM = Middle Manager   •   D = Director   •   VP = Vice President   •   E = Executive", {
    x: 0.6, y: 6.85, w: 8.1, h: 0.5, fontFace: FONT, fontSize: 10, color: GRAY, italic: true,
  });

  s.addShape("roundRect", { x: 9.0, y: 1.6, w: 3.75, h: 2.55, rectRadius: 0.08, fill: { color: OFFWHITE } });
  s.addText("Director level", { x: 9.25, y: 1.78, w: 3.25, h: 0.4, fontFace: FONT, fontSize: 12, bold: true, color: NAVY });
  s.addText("16.5 yrs (women)  vs.  12.9 yrs (men) (not significance-tested)", { x: 9.25, y: 2.2, w: 3.25, h: 0.7, fontFace: FONT, fontSize: 13, bold: true, color: ROSE });

  s.addShape("roundRect", { x: 9.0, y: 4.4, w: 3.75, h: 2.55, rectRadius: 0.08, fill: { color: OFFWHITE } });
  s.addText("Vice President level", { x: 9.25, y: 4.58, w: 3.25, h: 0.4, fontFace: FONT, fontSize: 12, bold: true, color: NAVY });
  s.addText("25.6 yrs (women)  vs.  19.0 yrs (men) (not significance-tested)", { x: 9.25, y: 5.0, w: 3.25, h: 0.7, fontFace: FONT, fontSize: 13, bold: true, color: ROSE });
  s.addText("1.60% of women reach Director or above, vs. 2.21% of men (p = 0.038).", { x: 9.25, y: 5.7, w: 3.25, h: 1.1, fontFace: FONT, fontSize: 11.5, color: DARKTEXT, italic: true });
}

// ---------- Slide 10: Recommendations ----------
{
  const s = bgSlide(NAVY);
  s.addText("Recommendations for the Head of HR", { x: 0.6, y: 0.45, w: 12, h: 0.7, fontFace: HEAD_FONT, fontSize: 28, bold: true, color: WHITE });

  const recs = [
    { t: "Don't stop at “equal pay for equal role.”", d: "The model finds no significant gap within level and department — not proof of fairness (no performance control). It can mask who gets into which department and who gets promoted." },
    { t: "Investigate the Engineering pipeline.", d: "Audit hiring, transfer, and retention funnels into the highest-paying department." },
    { t: "Audit promotion timelines and criteria.", d: "Review calibration and manager decisions for bias; track time-to-promotion by sex and level." },
    { t: "Set representation targets and monitor over time.", d: "Track department mix and leadership representation on a recurring cadence, not a one-time check." },
    { t: "Broaden and repeat the analysis.", d: "Extend to other protected characteristics as data allows, and re-run periodically to track progress." },
  ];
  const startY = 1.5, rowH = 1.06;
  recs.forEach((r, i) => {
    const y = startY + i * rowH;
    s.addShape("ellipse", { x: 0.6, y: y + 0.03, w: 0.5, h: 0.5, fill: { color: AMBER } });
    s.addText(String(i + 1), { x: 0.6, y: y + 0.03, w: 0.5, h: 0.5, fontFace: FONT, fontSize: 18, bold: true, color: NAVY_DARK, align: "center", valign: "middle" });
    s.addText(r.t, { x: 1.35, y: y - 0.02, w: 11.2, h: 0.4, fontFace: FONT, fontSize: 15, bold: true, color: WHITE });
    s.addText(r.d, { x: 1.35, y: y + 0.38, w: 11.2, h: 0.5, fontFace: FONT, fontSize: 12.5, color: ICE });
  });
}

// ---------- Slide 11: Closing ----------
{
  const s = bgSlide(NAVY);
  s.addText("Bottom line", { x: 0.9, y: 2.7, w: 11.5, h: 0.6, fontFace: FONT, fontSize: 18, color: AMBER, bold: true });
  s.addText("No significant pay gap within level and department. Representation and promotion speed are where to look next.", {
    x: 0.9, y: 3.25, w: 11.5, h: 1.6, fontFace: HEAD_FONT, fontSize: 28, bold: true, color: WHITE,
  });
  s.addText("Questions & discussion welcome.", { x: 0.9, y: 5.1, w: 11.5, h: 0.5, fontFace: FONT, fontSize: 14, color: ICE });
}

pres.writeFile({ fileName: "Workplace_Diversity_Analysis_Deck.pptx" }).then(() => {
  console.log("Deck written.");
});
