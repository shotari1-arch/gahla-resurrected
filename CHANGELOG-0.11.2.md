# Gahla Resurrected 0.11.2-beta

Poprawka na bazie gotowej paczki 0.11.1-beta.

- Naprawiono otwieranie Generatora Starć i Generatora NPC. Oba przyciski korzystają z `GahlaEncounterBuilder`.
- Przyczyną błędu „Template part form must render a single HTML element” były dwa elementy główne szablonu. Pasek rozstawiania starcia/zapisu szablonu przeniesiono do istniejącego głównego elementu formularza. Zachowano wszystkie przyciski, pola oraz ich akcje.
- Brak zmian mechaniki, balansu, danych świata i kreatora zaklęć. Poprawki 0.11.1, w tym minimum OP Przyspieszenia, pozostają.

Zmienione/dodane pliki: `templates/apps/encounter-builder.hbs`, `system.json`, `gahla-resurrected.mjs`, `dev-tests/encounter-template-regression.mjs`, `dev-tests/browser/encounter-template.mjs`, `CHANGELOG-0.11.2.md`.

Weryfikacja: 28/28 zestawów regresyjnych PASS; składnia 64 modułów JS i 6 plików JSON bez błędów. Test parsera HTML w Edge potwierdził jeden element główny i obecność przycisków/pól w jego wnętrzu; odtworzenie starego układu wykazuje dwa elementy i wykrywa regresję. Sprawdzono oba wywołania z panelu narzędzi. Testy używają atrap API Foundry; nie przeprowadzono uruchomienia w pełnym Foundry V14.

Instalacja: zastąp pliki systemu zawartością ZIP (system.json w katalogu systemu gahla-resurrected), następnie ponownie uruchom świat i odśwież przeglądarkę. Migracja danych nie jest potrzebna.
