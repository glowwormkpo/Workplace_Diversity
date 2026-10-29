"""
pptxgenjs (v4.0.1) always emits category axis references as c:multiLvlStrRef /
c:multiLvlStrCache, even for a plain flat list of category names with a single
level. Some PowerPoint versions render this construct incorrectly, falling
back to showing the point index (1, 2, 3, 4...) instead of the cached string
labels. Since our categories are always flat (one c:lvl per chart), this
script flattens every c:multiLvlStrRef/c:multiLvlStrCache into an equivalent,
simpler c:strRef/c:strCache -- which is unambiguous, valid OOXML that every
PowerPoint version handles correctly -- while leaving everything else in the
chart XML untouched.
"""
import re
import sys
import zipfile
import shutil
import os

def flatten_chart_xml(xml_text: str) -> tuple[str, int]:
    count = 0

    def repl(m):
        nonlocal count
        inner = m.group(1)
        # Only flatten when there's exactly one <c:lvl> (a real flat category list)
        lvl_matches = re.findall(r'<c:lvl>(.*?)</c:lvl>', inner, re.S)
        if len(lvl_matches) != 1:
            return m.group(0)  # leave genuinely multi-level refs alone
        count += 1
        f_match = re.search(r'<c:f>.*?</c:f>', inner, re.S)
        f_tag = f_match.group(0) if f_match else ''
        ptcount_match = re.search(r'<c:ptCount val="\d+"/>', inner)
        ptcount_tag = ptcount_match.group(0) if ptcount_match else ''
        pts = lvl_matches[0]
        return f'<c:strRef>{f_tag}<c:strCache>{ptcount_tag}{pts}</c:strCache></c:strRef>'

    new_text = re.sub(
        r'<c:multiLvlStrRef>(.*?)</c:multiLvlStrRef>',
        repl,
        xml_text,
        flags=re.S,
    )
    return new_text, count

def process_pptx(path: str, out_path: str = None):
    import time
    tmpdir = path + f"_unpacked_tmp_{int(time.time()*1000)}"
    os.makedirs(tmpdir)
    with zipfile.ZipFile(path) as z:
        z.extractall(tmpdir)

    total_fixed = 0
    charts_dir = os.path.join(tmpdir, "ppt", "charts")
    if os.path.isdir(charts_dir):
        for fname in sorted(os.listdir(charts_dir)):
            if fname.startswith("chart") and fname.endswith(".xml"):
                fpath = os.path.join(charts_dir, fname)
                with open(fpath, encoding="utf-8") as f:
                    text = f.read()
                new_text, n = flatten_chart_xml(text)
                if n:
                    with open(fpath, "w", encoding="utf-8") as f:
                        f.write(new_text)
                    print(f"{fname}: flattened {n} category reference(s)")
                    total_fixed += n

    # Rezip to out_path (or path if not given), preserving the original member order
    if out_path is None:
        out_path = path
    with zipfile.ZipFile(out_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, _, files in os.walk(tmpdir):
            for fname in files:
                full = os.path.join(root, fname)
                arcname = os.path.relpath(full, tmpdir)
                zf.write(full, arcname)
    try:
        shutil.rmtree(tmpdir)
    except Exception:
        pass  # best-effort cleanup only; sandbox may not allow deleting these files
    print(f"Total category references flattened: {total_fixed}")

if __name__ == "__main__":
    out = sys.argv[2] if len(sys.argv) > 2 else None
    process_pptx(sys.argv[1], out)
