import json, io, base64, ast, contextlib, sys

NB_PATH = "Workplace_Diversity_Analysis.ipynb"

nb = json.load(open(NB_PATH))

glb = {"__name__": "__main__"}

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

exec_count = 0

def run_cell(source):
    global exec_count
    exec_count += 1
    outputs = []
    buf = io.StringIO()

    # capture any matplotlib figures created; we'll grab them after exec via plt.get_fignums()
    tree = ast.parse(source)
    body = tree.body
    last_expr = None
    if body and isinstance(body[-1], ast.Expr):
        last_expr = body.pop()

    try:
        with contextlib.redirect_stdout(buf), contextlib.redirect_stderr(buf):
            exec(compile(ast.Module(body=body, type_ignores=[]), "<cell>", "exec"), glb)
            result = None
            if last_expr is not None:
                result = eval(compile(ast.Expression(last_expr.value), "<cell>", "eval"), glb)
    except Exception as e:
        text = buf.getvalue()
        if text:
            outputs.append({"output_type": "stream", "name": "stdout", "text": text.splitlines(keepends=True)})
        outputs.append({
            "output_type": "error",
            "ename": type(e).__name__,
            "evalue": str(e),
            "traceback": [f"{type(e).__name__}: {e}"]
        })
        return outputs, exec_count

    text = buf.getvalue()
    if text:
        outputs.append({"output_type": "stream", "name": "stdout", "text": text.splitlines(keepends=True)})

    # capture any figures drawn in this cell
    fignums = plt.get_fignums()
    for num in fignums:
        fig = plt.figure(num)
        imgbuf = io.BytesIO()
        fig.savefig(imgbuf, format="png", bbox_inches="tight")
        imgbuf.seek(0)
        b64 = base64.b64encode(imgbuf.read()).decode("ascii")
        outputs.append({
            "output_type": "display_data",
            "data": {"image/png": b64, "text/plain": ["<Figure>"]},
            "metadata": {}
        })
        plt.close(fig)

    if result is not None:
        rep = repr(result)
        outputs.append({
            "output_type": "execute_result",
            "execution_count": exec_count,
            "data": {"text/plain": rep.splitlines(keepends=True)},
            "metadata": {}
        })

    return outputs, exec_count

for cell in nb["cells"]:
    if cell["cell_type"] != "code":
        continue
    source = "".join(cell["source"])
    outputs, n = run_cell(source)
    cell["outputs"] = outputs
    cell["execution_count"] = n
    print(f"--- executed cell {n} ---")

with open(NB_PATH, "w") as fh:
    json.dump(nb, fh, indent=1)

print("Notebook executed and saved with outputs.")
