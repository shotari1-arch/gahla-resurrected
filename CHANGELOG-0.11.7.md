# 0.11.7-beta — 2026-10-08

Baza 0.11.6-beta.

- UI: duże karty Progów z rozpisaniem źródeł, uporządkowany nagłówek/statystyki, menu Narzędzia i Narzędzia GM zamiast duplikatów.
- Talenty: filtry, zasoby, aktywacja i hotbar; audyt wszystkich 169 wpisów.
- Odporność: bez odejmowania obrażeń; poprawione Mocna Skóra, Naturalna Obrona, Hybryda T4 i Święty Płomień. Naprawione cztery Odporny, Serce Burzy, Mocne Kości i wykonanie Celnego Ciosu.
- WIP/Special Features poza normalnymi zakupami; migracja opisów i historii bez kasowania EXP/dokumentów.
- Kreator zachowuje wcześniejszy układ, koszty i walidację. Przyspieszenie bez dalszego rebalance: +3 SZ, +20 Obrony, −1 OP z twardym minimum każdej akcji.
- 39 regresji i 5 skryptów przeglądarkowych PASS. Pełny serwer Foundry nie był dostępny do testów.

## Pliki zmienione/dodane względem bazy

- `CHANGELOG.md`
- `gahla-resurrected.mjs`
- `README.md`
- `system.json`
- `dev-tests/canon115-model-regression.mjs`
- `dev-tests/migration117-regression.mjs`
- `dev-tests/talents117-regression.mjs`
- `docs/MECHANICS-AUDIT.md`
- `docs/REPORT-0.11.7.md`
- `docs/TALENT-AUDIT-0.11.7.md`
- `docs/UI-AUDIT-0.11.7.md`
- `module/automation-rules.mjs`
- `module/automation-runtime.mjs`
- `module/canonical-rules.mjs`
- `module/content.mjs`
- `module/creator.mjs`
- `module/data-models.mjs`
- `module/documents.mjs`
- `module/effects-engine.mjs`
- `module/rules.mjs`
- `module/session-tools.mjs`
- `module/sheets.mjs`
- `module/spell-quality.mjs`
- `module/talent-balance.mjs`
- `module/talent-migration117.mjs`
- `module/talent-presentation.mjs`
- `module/talent-tree-rules.mjs`
- `styles/gahla.css`
- `dev-tests/browser/defense-handoff.mjs`
- `dev-tests/browser/sheet117.mjs`
- `dev-tests/browser/templates117.mjs`
- `docs/screenshots/sheet117-1366.png`
- `docs/screenshots/sheet117-1920.png`
- `docs/screenshots/sheet117-700.png`
- `docs/screenshots/sheet117-900.png`
- `docs/screenshots/sheet117-talents.png`
- `templates/actor/character-sheet.hbs`
- `templates/apps/session-panel.hbs`
- `CHANGELOG-0.11.7.md`
- `docs/TEST-RESULTS-0.11.7.txt`

Szczegóły, migracja, ograniczenia i sugestie: [raport](docs/REPORT-0.11.7.md).
