#!/usr/bin/env python3
"""
humanize.py — снимает с русского текста машинный отпечаток.

Проходы по порядку:

  0. ПЕРЕНОСЫ     CRLF и одиночный CR → LF.
  1. НЕВИДИМЫЕ    удалить символы, которых нет на клавиатуре: пробелы нулевой
                  ширины, соединители, мягкие переносы, BOM, тег-символы,
                  метки направления. Экзотические пробелы привести к обычному
                  (узкий неразрывный → обычный неразрывный U+00A0). Сам U+00A0
                  остаётся: это русская типографика, а не след модели.
                  Соединитель внутри эмодзи (👩\u200d💻) и флаги-теги не трогаются.
  2. ДВОЙНИКИ     латинские буквы внутри русского слова (а/a, о/o, с/c…) и
                  наоборот → нужный алфавит.
  3. ТИПОГРАФИКА  "прямые" и “английские” кавычки → «ёлочки»; « - » между
                  словами → « — »; **жирный** и ### заголовки из чата → убрать.
                  Длинное тире, «ёлочки» и многоточие не трогаются.
  4. ШТАМПЫ       словарь slop.json: замена с сохранением заглавной буквы,
                  ссылки, @ники и #теги не трогаются.

Структурные признаки («не просто X, а Y», тройки, стена тегов) только
ПОКАЗЫВАЮТСЯ: менять форму предложения — работа для головы, не для регулярки.

Запуск
  python3 humanize.py draft.txt
  python3 humanize.py draft.txt --report
  pbpaste | python3 humanize.py - --report
  python3 humanize.py draft.txt --json
  python3 humanize.py draft.txt -o clean.txt
  python3 humanize.py script.txt --mode script   # сценарий рилса: ритм не проверять
"""

import argparse
import json
import os
import re
import sys
import unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
LEX = os.path.join(HERE, "slop.json")

URL_RE = re.compile(r"https?://\S+|www\.\S+|\S+@\S+\.\S+|(?<![\w])[#@][\w.]+")
SENT_RE = re.compile(r"[^.!?…\n]+[.!?…]*")
ADJ = ("(?:ого|его|ому|ему|ыми|ими|ый|ий|ой|ая|яя|ое|ее|ые|ие|ым|им|ом|ем|ую|юю|ых|их|ей)")
CYR = "А-Яа-яЁё"
LAT2CYR = dict(zip("aceopxyABCEHKMOPTXy", "асеорхуАВСЕНКМОРТХу"))
CYR2LAT = {v: k for k, v in LAT2CYR.items()}
START = r"(?:^|(?<=[.!?…]\s)|(?<=[.!?…]\s\s)|(?<=[.!?…]»\s))"


def load_lexicon(path=LEX):
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def fold(s):
    """ё = е при поиске. Длина строки не меняется, поэтому позиции совпадают."""
    return s.replace("ё", "е").replace("Ё", "Е")


def _cp(spec):
    if "-" in spec:
        a, b = spec.split("-")
        return (int(a[2:], 16), int(b[2:], 16))
    return int(spec[2:], 16)


def is_emoji(c):
    o = ord(c)
    return (0x1F000 <= o <= 0x1FAFF or 0x2600 <= o <= 0x27BF or o == 0xFE0F
            or 0x2300 <= o <= 0x23FF or 0x2B00 <= o <= 0x2BFF or o in (0x00A9, 0x00AE, 0x2640, 0x2642))


class Stash:
    """Прячет куски текста от правок (ссылки, теги, ZWJ внутри эмодзи)."""

    def __init__(self):
        self.items = []

    def put(self, s):
        self.items.append(s)
        return "\x00" + chr(0xF0000 + len(self.items) - 1) + "\x00"

    def restore(self, text):
        # Восстанавливаем с конца: в спрятанном куске может лежать другой.
        for i in range(len(self.items) - 1, -1, -1):
            text = text.replace("\x00" + chr(0xF0000 + i) + "\x00", self.items[i])
        return text


# ---------------------------------------------------------------- проходы

def pass_newlines(text):
    crlf = text.count("\r\n")
    cr = text.count("\r") - crlf
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    hits = []
    if crlf:
        hits.append({"name": "CRLF (перенос Windows)", "count": crlf, "action": "→ LF"})
    if cr:
        hits.append({"name": "одиночный CR (старый Mac)", "count": cr, "action": "→ LF"})
    return text, hits


def pass_invisible(text, lex, stash):
    hits, kept = [], []
    # 1) Флаги из тег-символов (🏴\U000e0067\U000e0062\U000e0073\U000e0063\U000e0074\U000e007f) и ZWJ между эмодзи — законная часть эмодзи.
    flags = re.findall("\U0001F3F4[\U000E0020-\U000E007E]+\U000E007F", text)
    text = re.sub("\U0001F3F4[\U000E0020-\U000E007E]+\U000E007F", lambda m: stash.put(m.group(0)), text)
    zwj_ok = 0
    out = []
    for i, c in enumerate(text):
        if c == "\u200d" and 0 < i < len(text) - 1 and is_emoji(text[i - 1]) and is_emoji(text[i + 1]):
            out.append(stash.put(c))
            zwj_ok += 1
        else:
            out.append(c)
    text = "".join(out)
    if zwj_ok:
        kept.append({"name": "U+200D соединитель внутри эмодзи", "count": zwj_ok})
    if flags:
        kept.append({"name": "тег-символы внутри эмодзи-флагов", "count": len(flags)})

    # 2) Спрятанное тег-символами сообщение: покажем, что там было написано.
    hidden = "".join(chr(ord(c) - 0xE0000) for c in text if 0xE0020 <= ord(c) <= 0xE007E)

    for entry in lex["invisible"]:
        cp = _cp(entry["cp"])
        if isinstance(cp, tuple):
            pattern = "[" + re.escape(chr(cp[0])) + "-" + re.escape(chr(cp[1])) + "]"
        else:
            pattern = re.escape(chr(cp))
        n = len(re.findall(pattern, text))
        if not n:
            continue
        act = entry["action"]
        to = {"delete": "", "space": " ", "nbsp": "\u00a0"}[act]
        h = {"name": f"{entry['cp']} {entry['ru']}", "count": n,
             "action": {"delete": "удалён", "space": "→ обычный пробел", "nbsp": "→ неразрывный U+00A0"}[act]}
        if entry["cp"].startswith("U+E0000") and hidden:
            h["hidden"] = hidden
        hits.append(h)
        text = re.sub(pattern, to, text)

    # 3) Любой оставшийся Cf-символ невидим по определению.
    stray = [c for c in text if unicodedata.category(c) == "Cf"]
    if stray:
        names = sorted({f"U+{ord(c):04X}" for c in stray})
        hits.append({"name": "прочие невидимые (" + ", ".join(names[:5]) + ")", "count": len(stray),
                     "action": "удалён"})
        text = "".join(c for c in text if unicodedata.category(c) != "Cf")

    nbsp = text.count("\u00a0")
    if nbsp:
        kept.append({"name": "U+00A0 неразрывный пробел", "count": nbsp})
    return text, hits, kept


def pass_homoglyphs(text):
    """Латинские буквы-двойники внутри русского слова и наоборот."""
    fixed_letters, fixed_words = 0, 0

    def fix(m):
        nonlocal fixed_letters, fixed_words
        w = m.group(0)
        cyr = sum(1 for c in w if "Ѐ" <= c <= "ӿ")
        lat = sum(1 for c in w if c.isascii() and c.isalpha())
        if not cyr or not lat:
            return w
        if cyr >= lat and all(c in LAT2CYR for c in w if c.isascii() and c.isalpha()):
            new = "".join(LAT2CYR.get(c, c) for c in w)
        elif lat > cyr and all(c in CYR2LAT for c in w if "Ѐ" <= c <= "ӿ"):
            new = "".join(CYR2LAT.get(c, c) for c in w)
        else:
            return w
        fixed_letters += sum(1 for a, b in zip(w, new) if a != b)
        fixed_words += 1
        return new

    text = re.sub(r"[A-Za-z" + CYR + r"]+", fix, text)
    hits = []
    if fixed_words:
        hits.append({"name": f"буквы-двойники в {fixed_words} словах", "count": fixed_letters,
                     "action": "→ нужный алфавит"})
    return text, hits


def _quotes_line(line):
    """Кавычки одной строки. Если что-то не сходится в пару — строку не трогаем."""
    if '"' not in line and "\u201c" not in line and "\u201d" not in line:
        return line, 0
    out, stack, pairs = [], [], 0          # stack: (символ, сконвертирована ли)
    for i, c in enumerate(line):
        prev = line[i - 1] if i else " "
        if c in "«„":
            stack.append((c, False))
            out.append(c)
        elif c == "»" and stack and stack[-1][0] == "«":
            stack.pop()
            out.append(c)
        elif c == "\u201c" and stack and stack[-1][0] == "„":       # “ закрывает „
            stack.pop()
            out.append(c)
        elif c in '"\u201c\u201d':
            if c == '"':
                opening = prev.isspace() or prev in "([{«„—–-/\x00"
            else:
                opening = c == "\u201c"
            if opening:
                q = "„" if any(s[0] == "«" for s in stack) else "«"
                stack.append((q, True))
                out.append(q)
            else:
                if not stack or not stack[-1][1]:
                    return line, 0
                q, _ = stack.pop()
                out.append("»" if q == "«" else "\u201c")
                pairs += 1
        else:
            out.append(c)
    if any(conv for _, conv in stack):
        return line, 0
    return "".join(out), pairs


def pass_typographic(text):
    hits = []
    # markdown из чата
    n = len(re.findall(r"\*\*([^*\n]+)\*\*", text))
    if n:
        text = re.sub(r"\*\*([^*\n]+)\*\*", r"\1", text)
        hits.append({"name": "**жирный** из чата", "count": n, "to": "без звёздочек"})
    n = len(re.findall(r"(?m)^#{1,6}[ \t]+", text))
    if n:
        text = re.sub(r"(?m)^#{1,6}[ \t]+", "", text)
        hits.append({"name": "### заголовок из чата", "count": n, "to": "убран"})
    # кавычки
    pairs, lines = 0, []
    for line in text.split("\n"):
        new, p = _quotes_line(line)
        pairs += p
        lines.append(new)
    if pairs:
        text = "\n".join(lines)
        hits.append({"name": "пары прямых/английских кавычек", "count": pairs, "to": "«…»"})
    # тире между словами
    for pat, name in ((r"(?<=\S)([ \u00a0])--(?= \S)", "« -- » вместо тире"),
                      (r"(?<=\S)([ \u00a0])-(?= \S)", "« - » дефис вместо тире"),
                      (r"(?<=[^\s\d])([ \u00a0])–(?= \S)", "« – » короткое тире между словами")):
        n = len(re.findall(pat, text))
        if n:
            text = re.sub(pat, r"\1—", text)
            hits.append({"name": name, "count": n, "to": "« — »"})
    return text, hits


# ---------------------------------------------------------------- словарь

def compile_lexicon(lex):
    """Каждая запись → (запись, полная регулярка, регулярка ядра)."""
    out = []
    entries = sorted(lex["phrases"] + lex["words"], key=lambda e: len(e["find"]), reverse=True)
    for e in entries:
        if "map" in e:
            core = "(?:" + "|".join(re.escape(fold(k)) for k in sorted(e["map"], key=len, reverse=True)) + ")"
        elif "re" in e:
            core = fold(e["re"]).replace("{ADJ}", ADJ)
        else:
            core = re.escape(fold(e["find"])).replace(r"\ ", r"\s+")
        body = r"(?<!\w)(?P<core>" + core + r")(?!\w)"
        if e.get("start"):
            body = START + r"[ \t]*" + body
        elif e.get("replace", "") == "" and "map" not in e and e.get("auto", True):
            body = r"(?P<lead>,[ \t]*)?" + body + r"(?P<trail>[ \t]*,)?"
        try:
            full = re.compile(body, re.IGNORECASE | re.MULTILINE)
            corere = re.compile(core, re.IGNORECASE)
        except re.error as err:
            print(f"slop.json: битая регулярка у «{e['find']}»: {err}", file=sys.stderr)
            continue
        out.append((e, full, corere))
    return out


def _match_case(src, repl):
    if not repl:
        return repl
    letters = [c for c in src if c.isalpha()]
    if not letters:
        return repl
    if len(letters) > 1 and all(c.isupper() for c in letters):
        return repl.upper()
    if letters[0].isupper():
        return repl[0].upper() + repl[1:]
    return repl


def _replacement(e, corere, core_src, core_folded):
    if "map" in e:
        m = {fold(k).lower(): v for k, v in e["map"].items()}
        return _match_case(core_src, m.get(core_folded.lower(), core_src))
    rep = e.get("replace", "")
    if "\\" in rep:
        mm = corere.fullmatch(core_folded)
        rep = mm.expand(rep).lower() if mm else rep
    return _match_case(core_src, rep)


def pass_lexical(text, compiled, stash):
    hits, manual = [], []
    for e, full, corere in compiled:
        folded = fold(text)
        matches = list(full.finditer(folded))
        if not matches:
            continue
        if not e.get("auto", True):
            manual.append({"find": e["find"], "count": len(matches), "family": e["family"],
                           "hint": e.get("hint", ""),
                           "examples": [text[m.start("core"):m.end("core")] for m in matches[:2]]})
            # Прячем найденное, чтобы короткая запись не посчитала то же место ещё раз.
            pieces, last = [], 0
            for m in matches:
                pieces.append(text[last:m.start("core")])
                pieces.append(stash.put(text[m.start("core"):m.end("core")]))
                last = m.end("core")
            pieces.append(text[last:])
            text = "".join(pieces)
            continue
        pieces, last, shown = [], 0, None
        for m in matches:
            core_src = text[m.start("core"):m.end("core")]
            rep = _replacement(e, corere, core_src, m.group("core"))
            gd = m.groupdict()
            if e.get("replace", "") == "" and "map" not in e:
                lead, trail = gd.get("lead"), gd.get("trail")
                nxt = text[m.end():m.end() + 3].lstrip()[:1]
                if lead and trail:
                    rep = " "
                elif lead:
                    rep = ", " if nxt and nxt.isalnum() else ""
                else:
                    rep = ""
                pieces.append(text[last:m.start()])
            else:
                pieces.append(text[last:m.start("core")])
            pieces.append(rep)
            if shown is None:
                shown = rep.strip(" ,")
            last = m.end() if e.get("replace", "") == "" and "map" not in e else m.end("core")
        pieces.append(text[last:])
        text = "".join(pieces)
        hits.append({"find": e["find"], "replace": f"«{shown}»" if shown else "(удалено)",
                     "count": len(matches), "family": e["family"]})

    # Уборка после удалений: висячая пунктуация хуже штампа.
    text = re.sub(r"[ \t]{2,}", " ", text)
    text = text.replace("...", "\x01ELL\x01")
    text = re.sub(r"(?m)^[ \t]*(?:[,.;:]+[ \t]*)+", "", text)
    text = re.sub(r"(?m)^[ \t](?=\S)", "", text)
    text = re.sub(r"[ \t]+([,.;:!?…])", r"\1", text)
    text = re.sub(r",\s*([,.;:!?])", r"\1", text)
    text = re.sub(r"\.[ \t]*\.+", ".", text)
    text = re.sub(r"([!?])[ \t]*\.", r"\1", text)
    text = text.replace("\x01ELL\x01", "...")
    text = re.sub(r"(?m)^[ \t]+$", "", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text, hits, manual


LOW_START = re.compile(r"(?:^|(?<=[^.]\. )|(?<=[!?] )|(?<=\n))([a-zа-яё][^\n]{0,24})")


def restore_capitals(original, before, text):
    """После удаления вводной следующее слово остаётся с маленькой буквы.

    Чиним только у тех, кто сам пишет предложения с большой: осознанный
    строчный стиль — это стиль, а не артефакт. И только там, где маленькая
    буква в начале предложения появилась после наших правок (before — текст
    до прохода по словарю), чтобы не трогать «и т. д. и …».
    """
    starts = re.findall(r"(?:^|(?<=[^.]\.\s)|(?<=[!?]\s)|\n)\s*([A-Za-z" + CYR + "])", original)
    if not starts or sum(1 for c in starts if c.isupper()) * 2 < len(starts):
        return text
    old = {m.group(1) for m in LOW_START.finditer(before)}
    return LOW_START.sub(lambda m: m.group(1) if m.group(1) in old else m.group(1)[0].upper() + m.group(1)[1:], text)


# Сценарий рилса — это короткие строки-биты, по одной мысли на строку
# (ig-reel, beats.py). У него ровная длина фраз по замыслу, поэтому ритм
# в нём не признак модели. 10 слов ≈ 4 с при 140 сл/мин — предел бита.
SCRIPT_BEAT_WORDS = 10


def pl(n, one, few, many):
    """Русское множественное: 1 штамп, 2 штампа, 5 штампов."""
    n = abs(int(n))
    if n % 10 == 1 and n % 100 != 11:
        return one
    if 2 <= n % 10 <= 4 and not 12 <= n % 100 <= 14:
        return few
    return many


def is_script(text):
    """Похоже ли на сценарий: от 6 строк подряд (пустых не больше одной), 80% строк —
    биты до 10 слов, типичная строка — до 8 слов. Пост с абзацами сюда не попадает:
    у него пустые строки между абзацами. Надёжнее — явно --mode script."""
    all_lines = text.strip().splitlines()
    lines = [l.strip() for l in all_lines if l.strip() and not l.lstrip().startswith("#")]
    if len(lines) < 6:
        return False
    blank = sum(1 for l in all_lines if not l.strip())
    sizes = sorted(len(l.split()) for l in lines)
    short = sum(1 for n in sizes if n <= SCRIPT_BEAT_WORDS)
    median = sizes[len(sizes) // 2]
    return blank <= 1 and short >= 0.8 * len(lines) and median <= 8


def resolve_mode(text, mode="auto"):
    """auto → script или text по виду текста."""
    if mode in ("script", "text"):
        return mode
    return "script" if is_script(text) else "text"


def scan_structures(text, lex, mode="text"):
    flags = []
    for s in lex["structures"]:
        try:
            pattern = re.compile(s["regex"], re.MULTILINE)
        except re.error:
            continue
        found = pattern.findall(text)
        if found:
            flags.append({"name": s["name"], "count": len(found), "fix": s["fix"]})
    lens = [len(s.split()) for s in SENT_RE.findall(text) if len(s.split()) > 2]
    if len(lens) >= 4 and mode != "script":
        mean = sum(lens) / len(lens)
        var = sum((n - mean) ** 2 for n in lens) / len(lens)
        cv = (var ** 0.5) / mean if mean else 0
        if cv < 0.35:
            flags.append({"name": f"Предложения одной длины (разброс {cv:.2f})", "count": len(lens),
                          "fix": "Разруби одно пополам, другому дай разогнаться. Модель пишет ровно."})
    return flags


def humanize(text, lex, mode="auto"):
    raw = text
    mode = resolve_mode(text, mode)
    stash = Stash()
    text, nl = pass_newlines(text)
    text = URL_RE.sub(lambda m: stash.put(m.group(0)), text)
    text, inv, kept = pass_invisible(text, lex, stash)
    text, homo = pass_homoglyphs(text)
    text, typo = pass_typographic(text)
    before = text
    text, lexi, manual = pass_lexical(text, compile_lexicon(lex), stash)
    text = restore_capitals(raw, before, text)
    text = stash.restore(text)
    return text.strip() + "\n", {
        "newlines": nl,
        "invisible": inv,
        "homoglyphs": homo,
        "typographic": typo,
        "lexical": lexi,
        "manual": manual,
        "structures": scan_structures(text, lex, mode),
        "kept": kept,
        "mode": mode,
    }


def render_report(r, out=sys.stderr):
    def head(title):
        print(f"\n{title}\n" + "-" * len(title), file=out)

    fixed = sum(h["count"] for k in ("newlines", "invisible", "homoglyphs", "typographic", "lexical") for h in r[k])
    head("ОТЧЁТ HUMANIZE")
    nman, nstr = sum(h["count"] for h in r["manual"]), len(r["structures"])
    print(f"Исправлено автоматически: {fixed}. Переписать руками: {nman} {pl(nman, 'штамп', 'штампа', 'штампов')} "
          f"и {nstr} {pl(nstr, 'структурный признак', 'структурных признака', 'структурных признаков')}.", file=out)
    if r.get("mode") == "script":
        print("Режим: сценарий (короткие строки-биты). Ровная длина фраз тут по замыслу, "
              "её не проверяю.", file=out)
    if r["newlines"]:
        head("0. ПЕРЕНОСЫ СТРОК")
        for h in r["newlines"]:
            print(f"  {h['count']:>3}×  {h['name']}  {h['action']}", file=out)
    if r["invisible"]:
        head("1. НЕВИДИМЫЕ СИМВОЛЫ")
        for h in r["invisible"]:
            print(f"  {h['count']:>3}×  {h['name']}  {h['action']}", file=out)
            if h.get("hidden"):
                print(f"        спрятанный текст: «{h['hidden']}»", file=out)
    if r["homoglyphs"]:
        head("2. БУКВЫ-ДВОЙНИКИ")
        for h in r["homoglyphs"]:
            print(f"  {h['count']:>3}×  {h['name']}  {h['action']}", file=out)
    if r["typographic"]:
        head("3. ТИПОГРАФИКА")
        for h in r["typographic"]:
            print(f"  {h['count']:>3}×  {h['name']}  → {h['to']}", file=out)
    if r["lexical"]:
        head("4. ШТАМПЫ (заменены)")
        for h in r["lexical"]:
            print(f"  {h['count']:>3}×  {h['find']}  → {h['replace']}   [{h['family']}]", file=out)
    if r["manual"]:
        head("5. ШТАМПЫ (перепиши сам — автозамена сломала бы падеж или смысл)")
        for h in r["manual"]:
            ex = " / ".join(f"«{x}»" for x in h["examples"])
            print(f"  {h['count']:>3}×  {ex}   [{h['family']}]\n        {h['hint']}", file=out)
    if r["structures"]:
        head("6. СТРУКТУРА (не исправляется автоматически — перепиши эти места)")
        for h in r["structures"]:
            print(f"  {h['count']:>3}×  {h['name']}\n        {h['fix']}", file=out)
    if r["kept"]:
        head("ОСТАВЛЕНО НАМЕРЕННО")
        for h in r["kept"]:
            print(f"  {h['count']:>3}×  {h['name']}", file=out)
    if not any(r[k] for k in ("newlines", "invisible", "homoglyphs", "typographic", "lexical", "manual", "structures")):
        head("ЧИСТО")
        print("  Убирать нечего.", file=out)
    print("", file=out)


def main():
    ap = argparse.ArgumentParser(description="Снять машинный отпечаток с русского текста.")
    ap.add_argument("input", nargs="?", default="-", help="файл или - для stdin")
    ap.add_argument("-o", "--out", help="записать чистый текст сюда, а не в stdout")
    ap.add_argument("--report", action="store_true", help="показать, что изменено (в stderr)")
    ap.add_argument("--json", action="store_true", help="выдать {text, report} в JSON")
    ap.add_argument("--lexicon", default=LEX, help="путь к slop.json")
    ap.add_argument("--mode", choices=("auto", "text", "script"), default="auto",
                    help="script — сценарий рилса из коротких битов: ровный ритм не считается "
                         "признаком ИИ; auto — определить по тексту (по умолчанию)")
    args = ap.parse_args()

    if args.input == "-":
        raw = sys.stdin.buffer.read().decode("utf-8")
    else:
        with open(args.input, encoding="utf-8", newline="") as fh:
            raw = fh.read()
    lex = load_lexicon(args.lexicon)
    clean, report = humanize(raw, lex, args.mode)

    if args.json:
        print(json.dumps({"text": clean, "report": report}, indent=2, ensure_ascii=False))
        return
    if args.out:
        with open(args.out, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(clean)
        print(f"записано: {args.out}", file=sys.stderr)
    else:
        sys.stdout.write(clean)
    if args.report:
        render_report(report)


if __name__ == "__main__":
    main()
