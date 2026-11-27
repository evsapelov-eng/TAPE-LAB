#!/usr/bin/env python3
"""
detect.py — пять проверок: насколько русский текст похож на написанный моделью.

Что это: пять локальных эвристик по тем же сигналам, на которые смотрят
публичные детекторы: разброс длины предложений, конкретика, штампы,
типографский отпечаток и живой голос. Всё считается на твоём компьютере по
одному тексту. Ничего никуда не отправляется.

Чего это НЕ делает: это не GPTZero, Originality, Copyleaks, Winston и не
Антиплагиат. Их API не вызываются, их вердикт не обещается. Скрипт ловит то,
на что они все смотрят, поэтому правки обычно двигают и их цифры — но честное
утверждение только это.

Русская поправка: длинное тире «—», «ёлочки», «…» и неразрывный пробел —
нормальная русская типографика, за них баллы НЕ снимаются.

Каждая проверка даёт оценку «человечности» 0–100. Больше — лучше.

Запуск
  python3 detect.py draft.txt
  pbpaste | python3 detect.py -
  python3 detect.py draft.txt --json
  python3 detect.py before.txt after.txt      # сравнить до и после
  python3 detect.py script.txt --mode script  # сценарий рилса: РИТМ не в итоге

Сценарий рилса (ig-reel) — короткие строки-биты по одной мысли. Ровная длина
фраз у него по замыслу, поэтому в режиме script РИТМ показывается, но в итог
не идёт. Режим auto (по умолчанию) сам узнаёт сценарий: от 6 строк, не
больше одной пустой, 80% строк не длиннее 10 слов, типичная — до 8. Пост с
абзацами считается текстом. Надёжнее явно передать --mode script.
"""

import argparse
import json
import os
import re
import statistics
import sys
import unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
LEX = os.path.join(HERE, "slop.json")
sys.dont_write_bytecode = True      # не мусорить __pycache__ в папке скилла
sys.path.insert(0, HERE)           # общий разбор словаря живёт в humanize.py
from humanize import compile_lexicon, fold, is_emoji, URL_RE, LAT2CYR, pl, resolve_mode  # noqa: E402

L = "A-Za-zА-Яа-яЁё"
SENT_RE = re.compile(r"[^.!?…\n]+[.!?…]*")
WORD_RE = re.compile(r"[" + L + r"]+(?:-[" + L + r"]+)*")
NUMBERS = re.compile(r"(?<!\w)\d+(?:[\s\u00a0.,]\d+)*\s?(?:%|₽|руб\w*|тыс\w*|млн|к\b|\$|€)?|[₽$€]\s?\d")
MONTHS = re.compile(r"(?i)\b(?:январ|феврал|март|апрел|ма[яе]\b|июн|июл|август|сентябр|октябр|ноябр|декабр|"
                    r"понедельник|вторник|сред[ауые]\b|четверг|пятниц|суббот|воскресень)\w*")
# В русском нет «don't/it's» — живую речь выдают частицы и разговорные слова.
COLLOQ = re.compile(r"(?i)(?<!\w)(?:же|ж|ведь|ну|типа|короче|кароч|кстати|блин|прям|щас|чё|че|ага|окей|ок|"
                    r"реально|честно|вообще|слушай|смотри|кажется|наверное|походу|вроде|норм|"
                    r"пипец|капец|офигенно|кайф\w*)(?!\w)|\w+-(?:то|ка|таки)(?!\w)")
PRONOUNS = re.compile(r"(?i)(?<!\w)(?:я|меня|мне|мной|мой|моя|мое|моё|мои|моих|моим|мы|нас|нам|нами|наш|наша|"
                      r"наше|наши|ты|тебя|тебе|тобой|твой|твоя|твое|твоё|твои|вы|вас|вам|вами|ваш|ваша|ваше|"
                      r"ваши)(?!\w)")
TY = re.compile(r"(?i)(?<!\w)(?:ты|тебя|тебе|тобой|твой|твоя|твое|твоё|твои)(?!\w)")
# Повелительное на «ты» — тоже обращение к зрителю: «напиши», «сохрани», «смотри».
# Список, а не окончание: «-и» и «-ай» в конце слова дают слишком много ложных.
IMPERATIVE_TY = re.compile(
    r"(?i)(?<!\w)(?:напиши|пиши|сохрани|сохраняй|смотри|посмотри|глянь|попробуй|пробуй|сделай|делай"
    r"|возьми|бери|начни|начинай|забери|лови|держи|жми|нажми|ставь|поставь|подпишись|подписывайся"
    r"|переходи|перейди|открой|слушай|послушай|запомни|проверь|скачай|отправь|перешли|подумай|представь"
    r"|забудь|найди|выбери|добавь|убери|замени|сними|снимай|повтори|используй|читай|прочитай|оставь"
    r"|расскажи|покажи|загляни|вспомни|перестань|брось|включи|выключи|пришли|скинь|монтируй|режь"
    r"|пойми|узнай|спроси|ответь|давай|погнали|сравни|вставь|приходи|заходи|жди|не бойся)(?!\w)")
VY = re.compile(r"(?i)(?<!\w)(?:вы|вас|вам|вами|ваш|ваша|ваше|ваши)(?!\w)")


def clamp(n):
    return max(0.0, min(100.0, n))


def scale(value, human, machine):
    if human == machine:
        return 50.0
    return clamp((value - machine) / (human - machine) * 100)


def sentences(text):
    return [s.strip() for s in SENT_RE.findall(text) if len(s.split()) > 2]


def words(text):
    return WORD_RE.findall(text)


def check_burstiness(text):
    """Люди пишут рвано. Модель — ровно."""
    lens = [len(s.split()) for s in sentences(text)]
    if len(lens) < 4:
        return 50.0, "мало предложений для оценки"
    mean = statistics.mean(lens)
    cv = statistics.pstdev(lens) / mean if mean else 0
    return scale(cv, human=0.70, machine=0.22), (f"разброс {cv:.2f} по {len(lens)} "
                                                  f"{pl(len(lens), 'предложению', 'предложениям', 'предложениям')} (нужно 0.55+)")


def proper_names(text):
    """Слова с большой буквы не в начале предложения: имена, бренды, города, КОДОВЫЕ слова."""
    found = set()
    for sent in re.split(r"(?<=[.!?…])\s+|\n+", text):
        toks = WORD_RE.findall(sent)
        for t in toks[1:]:
            if len(t) >= 3 and t[0].isupper() and not re.fullmatch(r"В(?:ы|ас|ам|ами|аш\w*)", t):
                found.add(t)
    return found


def check_specificity(text):
    """Цифры, имена, даты. Штамп всегда абстрактный."""
    w = words(text)
    if len(w) < 25:
        return 50.0, "мало слов для оценки"
    nums = len(NUMBERS.findall(text))
    names = proper_names(text)
    dates = len(MONTHS.findall(text))
    hits = nums + len(names) + dates
    density = hits * 100 / len(w)
    return (scale(density, human=6.0, machine=0.5),
            f"{hits} {pl(hits, 'конкретная деталь', 'конкретные детали', 'конкретных деталей')} "
            f"({nums} {pl(nums, 'цифра', 'цифры', 'цифр')}, "
            f"{len(names)} {pl(len(names), 'имя или название', 'имени или названия', 'имён или названий')}, "
            f"{dates} {pl(dates, 'дата', 'даты', 'дат')}), "
            f"{density:.1f} на 100 слов (нужно 4+)")


def count_slop(text, compiled):
    """Считаем каждое место один раз: длинные записи первыми, найденное закрашиваем."""
    t = fold(URL_RE.sub(lambda m: " " * len(m.group(0)), text))
    hits, found = 0, []
    for e, full, _ in compiled:
        ms = list(full.finditer(t))
        if not ms:
            continue
        hits += len(ms)
        found.append(e["find"])
        for m in reversed(ms):
            a, b = m.start("core"), m.end("core")
            t = t[:a] + "\x00" * (b - a) + t[b:]
    return hits, found


def check_slop(text, compiled):
    w = words(text)
    if not w:
        return 50.0, "пусто"
    hits, found = count_slop(text, compiled)
    density = hits * 100 / len(w)
    detail = f"{hits} {pl(hits, 'штамп', 'штампа', 'штампов')}, {density:.1f} на 100 слов"
    if found:
        detail += " (" + ", ".join(found[:4]) + (", …" if len(found) > 4 else "") + ")"
    return scale(density, human=0.0, machine=4.0), detail


def fingerprint_counts(text):
    invisible = 0
    for i, c in enumerate(text):
        if unicodedata.category(c) != "Cf" and c not in "\u00ad":
            continue
        if c == "\u200d" and 0 < i < len(text) - 1 and is_emoji(text[i - 1]) and is_emoji(text[i + 1]):
            continue                                         # 👩\u200d💻 — законный эмодзи
        if 0xE0020 <= ord(c) <= 0xE007F and "\U0001F3F4" in text[max(0, i - 40):i]:
            continue                                         # флаг 🏴\U000e0067\U000e0062\U000e0073\U000e0063\U000e0074\U000e007f
        invisible += 1
    exotic = sum(text.count(c) for c in "\u202f\u2007\u2009\u200a\u2002\u2003\u2004\u2005\u2006\u2008\u205f\u3000\u1680")
    homo = 0
    for w in re.findall(r"[" + L + r"]+", text):
        cyr = sum(1 for c in w if "Ѐ" <= c <= "ӿ")
        lat = sum(1 for c in w if c.isascii() and c.isalpha())
        if cyr and lat and (all(c in LAT2CYR for c in w if c.isascii() and c.isalpha()) or lat > cyr):
            homo += 1
    cyr_text = sum(1 for c in text if "Ѐ" <= c <= "ӿ") > len(text) * 0.2
    eng_quotes = (text.count("“") + text.count("”")) if cyr_text else 0
    eng_quotes -= min(text.count("„"), text.count("“")) if cyr_text else 0   # „…“ — законно
    markdown = len(re.findall(r"\*\*[^*\n]+\*\*", text)) + len(re.findall(r"(?m)^#{1,6}[ \t]+", text))
    return invisible, exotic, homo, max(eng_quotes, 0), markdown


def check_fingerprint(text):
    """Символы, которых не даёт клавиатура телефона. Тире «—» и «ёлочки» сюда не входят."""
    inv, exotic, homo, eq, md = fingerprint_counts(text)
    total = inv * 4 + homo * 3 + md * 2 + exotic + eq
    per1k = total * 1000 / max(len(text), 1)
    return (scale(per1k, human=0.0, machine=12.0),
            f"невидимых символов: {inv}, слов с буквами-двойниками: {homo}, markdown-разметки: {md}, "
            f"экзотических пробелов: {exotic}, английских кавычек: {eq} (тире и «ёлочки» не считаются)")


def check_voice(text, lex):
    """Разговорные частицы, лицо, форма предложений."""
    w = words(text)
    if len(w) < 25:
        return 50.0, "мало слов для оценки"
    per100 = 100 / len(w)
    colloq = len(COLLOQ.findall(text)) * per100
    imper = len(IMPERATIVE_TY.findall(text))
    person = (len(PRONOUNS.findall(text)) + imper) * per100
    ty, vy = len(TY.findall(text)) + imper, len(VY.findall(text))
    tells, names = 0, []
    for s in lex["structures"]:
        try:
            n = len(re.compile(s["regex"], re.MULTILINE).findall(text))
        except re.error:
            continue
        if n:
            tells += n
            names.append(s["id"])
    bullets = [len(b.split()) for b in re.findall(r"(?m)^\s*[-*•—]\s+(.+)$", text)]
    uniform = len(bullets) >= 3 and statistics.pstdev(bullets) < 1.6
    score = (scale(colloq, human=2.5, machine=0.0) * 0.35
             + scale(person, human=6.0, machine=0.5) * 0.35
             + clamp(100 - tells * 22) * 0.30)
    if uniform:
        score -= 12
        names.append("ровный-список")
    detail = (f"на 100 слов: разговорные частицы {colloq:.1f}, обращения и местоимения лица {person:.1f} "
              f"(на «ты»: {ty}, из них повелительных {imper}; на «вы»: {vy}), "
              f"{tells} {pl(tells, 'структурный признак', 'структурных признака', 'структурных признаков')}")
    if names:
        detail += " [" + ", ".join(names[:4]) + "]"
    return clamp(score), detail


CHECKS = [("burstiness", "РИТМ"), ("specificity", "КОНКРЕТИКА"), ("slop", "ШТАМПЫ"),
          ("fingerprint", "ОТПЕЧАТОК"), ("voice", "ГОЛОС")]
VERDICT = {"PASS": "ПРОШЁЛ", "REVIEW": "ДОРАБОТАТЬ", "FLAGGED": "ПОХОЖЕ НА ИИ"}


SHORT_WORDS = 40      # короче — комментарий или сообщение, не пост


def run(text, lex, compiled=None, mode="auto"):
    compiled = compiled or compile_lexicon(lex)
    mode = resolve_mode(text, mode)
    r = {
        "burstiness": check_burstiness(text),
        "specificity": check_specificity(text),
        "slop": check_slop(text, compiled),
        "fingerprint": check_fingerprint(text),
        "voice": check_voice(text, lex),
    }
    counted = [k for k, _ in CHECKS if not (mode == "script" and k == "burstiness")]
    if len(words(text)) < SHORT_WORDS:
        # коммент, ответ, сообщение в директ: ритм, конкретику и голос на 1–3 фразах
        # не измерить, считаем только штампы и машинные следы
        mode = "short"
        counted = ["slop", "fingerprint"]
        for k in ("burstiness", "specificity", "voice"):
            score, detail = r[k]
            r[k] = (score, detail + " — не в итоге: короткий текст")
    if mode == "script":
        score, detail = r["burstiness"]
        r["burstiness"] = (score, detail + " — не в итоге: сценарий из коротких битов")
    scores = [r[k][0] for k in counted]
    overall = statistics.mean(scores) * 0.6 + min(scores) * 0.4    # детектору хватает одного сигнала
    verdict = "PASS" if overall >= 70 and min(scores) >= 55 else ("REVIEW" if overall >= 50 else "FLAGGED")
    r["_counted"] = counted
    r["_mode"] = mode
    return r, overall, verdict


def bar(score, width=24):
    filled = round(score / 100 * width)
    return "#" * filled + "." * (width - filled)


def render(r, overall, verdict, label=None, out=sys.stdout):
    title = "ПРОВЕРКА НА ИИ" + (f"  —  {label}" if label else "")
    if r.get("_mode") == "script":
        title += "  ·  режим: сценарий"
    elif r.get("_mode") == "short":
        title += "  ·  короткий текст: считаю только штампы и следы ИИ"
    print("\n" + title, file=out)
    print("=" * max(len(title), 62), file=out)
    counted = r.get("_counted", [k for k, _ in CHECKS])
    for key, name in CHECKS:
        score, detail = r[key]
        mark = "" if key in counted else "  (не в итоге)"
        print(f"  {name:<11} {bar(score)} {score:5.1f}{mark}", file=out)
        print(f"  {'':<11} {detail}", file=out)
    print("-" * 62, file=out)
    print(f"  {'ИТОГ':<11} {bar(overall)} {overall:5.1f}   {VERDICT[verdict]}", file=out)
    if verdict != "PASS":
        key, name = min((c for c in CHECKS if c[0] in counted), key=lambda c: r[c[0]][0])
        print(f"\n  Слабее всего: {name}. Начни с него.", file=out)
    print("", file=out)


def main():
    ap = argparse.ArgumentParser(description="Оценить, насколько русский текст похож на машинный.")
    ap.add_argument("input", nargs="?", default="-", help="файл или - для stdin")
    ap.add_argument("compare", nargs="?", help="второй файл — показать до/после")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--lexicon", default=LEX)
    ap.add_argument("--mode", choices=("auto", "text", "script"), default="auto",
                    help="script — сценарий рилса из коротких битов, РИТМ не в итоге; "
                         "auto — определить по тексту (по умолчанию)")
    args = ap.parse_args()

    with open(args.lexicon, encoding="utf-8") as fh:
        lex = json.load(fh)
    compiled = compile_lexicon(lex)

    def read(p):
        if p == "-":
            return sys.stdin.buffer.read().decode("utf-8")
        with open(p, encoding="utf-8", newline="") as fh:
            return fh.read()

    targets = [(args.input, read(args.input))]
    if args.compare:
        targets.append((args.compare, read(args.compare)))

    payload, runs = [], []
    for name, text in targets:
        r, overall, verdict = run(text, lex, compiled, args.mode)
        runs.append((r, overall, verdict))
        payload.append({
            "source": name,
            "mode": r["_mode"],
            "checks": {k: {"label": lbl, "score": round(r[k][0], 1), "detail": r[k][1],
                           "counted": k in r["_counted"]} for k, lbl in CHECKS},
            "human_score": round(overall, 1),
            "verdict": verdict,
            "verdict_ru": VERDICT[verdict],
        })

    if args.json:
        print(json.dumps(payload if args.compare else payload[0], indent=2, ensure_ascii=False))
    else:
        for (name, _), (r, overall, verdict) in zip(targets, runs):
            render(r, overall, verdict, label=os.path.basename(name) if args.compare else None)
        if args.compare:
            a, b = payload
            print(f"  {a['human_score']:.1f} {a['verdict_ru']}  →  {b['human_score']:.1f} {b['verdict_ru']}   "
                  f"({b['human_score'] - a['human_score']:+.1f})\n")
    sys.exit(0 if payload[-1]["verdict"] == "PASS" else 1)


if __name__ == "__main__":
    main()
