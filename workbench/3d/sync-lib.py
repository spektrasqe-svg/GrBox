#!/usr/bin/env python3
"""Синхронизация встроенной копии spiderfarmer-3d.js внутри SE3000_3D.html.

SE3000_3D.html — автономный просмотрщик: он не грузит библиотеку по <script src>,
а держит её копию inline. После правок assets/site/spiderfarmer-3d.js запустите:

    python3 workbench/3d/sync-lib.py
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
LIB = ROOT / "assets" / "site" / "spiderfarmer-3d.js"
VIEWER = ROOT / "workbench" / "3d" / "SE3000_3D.html"

MARKER = "(function(global){"  # начало inline-копии библиотеки
TAIL = "})(typeof window!=='undefined'?window:this);"  # конец inline-копии


def main() -> int:
    lib = LIB.read_text(encoding="utf-8")
    if MARKER not in lib or TAIL not in lib:
        print("!! в библиотеке нет ожидаемых маркеров", file=sys.stderr)
        return 1

    html = VIEWER.read_text(encoding="utf-8")
    start = html.find(MARKER)
    end = html.find(TAIL, start)
    if start < 0 or end < 0:
        print("!! в SE3000_3D.html не найдена inline-копия библиотеки", file=sys.stderr)
        return 1
    end += len(TAIL)

    new_html = html[:start] + lib[lib.find(MARKER):lib.find(TAIL) + len(TAIL)] + html[end:]
    if new_html != html:
        VIEWER.write_text(new_html, encoding="utf-8")
        print(f"OK: inline-копия обновлена ({len(lib)} байт библиотеки)")
    else:
        print("OK: уже синхронизировано")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
