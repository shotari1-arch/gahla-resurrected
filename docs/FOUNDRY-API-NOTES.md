# Gahla Resurrected — założenia implementacyjne Foundry VTT

Docelowa wersja: Foundry VTT V14, zweryfikowana na dokumentacji API V14.368.

## Architektura

- `system.json` jest manifestem systemu.
- `documentTypes` definiuje własne podtypy Actor i Item.
- `TypeDataModel` definiuje schemat `system` dla tych podtypów.
- `ActorSheetV2` i `ItemSheetV2` są użyte przez `HandlebarsApplicationMixin`.
- Arkusze rejestrowane są w hooku `init` przez `DocumentSheetConfig.registerSheet`.
- Reguły obliczeniowe są oddzielone od Documentów w `module/rules.mjs`.
- Dane pochodne są obliczane w `prepareDerivedData()`.

## Dlaczego V14

Stan na 1 października 2026: V14.368 jest aktualnym stabilnym wydaniem V14. Projekt celuje w API V14 zamiast starszych arkuszy V1.

## Główne moduły

- `module/rules.mjs` — czyste funkcje matematyczne i tabele bazowe.
- `module/data-models.mjs` — dane Actor/Item oraz pola pochodne.
- `module/documents.mjs` — rzuty, ataki, obrażenia, Punkty Losu, aura, awans poziomu.
- `module/sheets.mjs` — arkusze V2 i statusy.
- `module/combat.mjs` — segmentowy tracker walki.
- `module/setup.mjs` — dane DEMO i lista placeholderów.
