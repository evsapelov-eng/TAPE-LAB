# Test fixtures

The three `.h2p` files in this folder are copied unchanged from
[Fannon/u-he-preset-randomizer](https://github.com/Fannon/u-he-preset-randomizer)
(`soundsets/Diva Generated Vol. 1/`, commit `cbf5478c`), MIT License,
Copyright (c) 2024 Simon Heimler — see `LICENSE-u-he-preset-randomizer`.

They are used only as technical test input (parsing, round-trip, editing):

| File | Layout | Notes |
|---|---|---|
| `PD Current Plum Evy.h2p` | 421 lines, PCore Rev 15152 | float values written as `0.00`, has binary block |
| `PD Bold Indigo Marja.h2p` | 402 lines, older layout | integer-style values (`Tune1=-24`), has binary block |
| `BS Leading Peach Glad.h2p` | 421 lines | Triple VCO, has binary block |

No commercial/factory preset is included in this repository.
