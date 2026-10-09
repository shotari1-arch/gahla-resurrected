# Gahla Resurrected 0.11.4-beta

Baza: 0.11.3-beta. Dokończenie poprawek karty i rozwoju przed kolejnym pakietem kanonu.

- Reakcje poza walką: pierwsza próba przygotowuje pulę SZ i reakcji obrońcy. Kolejne próby zachowują wydatki; w oknie jest jawne odnowienie puli poza walką. W rozpoczętej walce nic nie odnawia się automatycznie. Okno pokazuje dostępne segmenty i reakcje. Brak k100 przed potwierdzeniem pozostaje.
- Poprawiono tekst obrony na karcie ataku: zajmuje całą szerokość zamiast kolumny 25 px przeznaczonej na numer kroku. Sprawdzono przy 280 px.
- Progi Fizyczne/Magiczne/Duchowe mają osobne czytelne pola; poprawiono tabelę progów.
- Usunięto plusy przy statystykach z zakładki Postać. Zakup przyrostów jest w Rozwoju.
- Liczbowe bonusy poziomu pozostają automatyczne; wpisy Experience/Feature poziomów 3/6/11 są teraz dodawane przy zmianie poziomu, bez osobnego przycisku i bez podwajania.
- Dodano tabelę sesji EXP, automatyczne sumowanie i historię zakupów talentów/przyrostów. Cofanie od ostatniego zakupu zwraca EXP i przywraca zakupione cechy/talenty. Powtórne cofnięcie jest blokowane, podobnie jak nadpisanie późniejszych ręcznych zmian. Historia zachowuje wpis zakupu i zwrotu.
- Experience to doświadczenia fabularne do testów z Ułatwieniem, nie EXP. Zachowano je z jaśniejszą etykietą.
- Migracja zapisuje aktualne EXP jako saldo początkowe i uzupełnia brakujące wpisy poziomów. Nie odtwarza nieznanej historii starych zakupów.

Testy: regresje automatyczne, rzeczywiste metody naliczania reakcji i rozwoju w atrapach Foundry, dwa odizolowane klienty przeglądarkowe z symulowanym transportem, kontrola obrazów karty ataku i progów. Pełny serwer Foundry V14 nie był uruchamiany.

Pliki: module/development-ledger.mjs (nowy), module/automation-runtime.mjs, module/documents.mjs, module/sheets.mjs, module/defense-declarations.mjs, templates/actor/character-sheet.hbs, styles/gahla.css, gahla-resurrected.mjs, system.json, dev-tests/development-ledger-regression.mjs (nowy), dev-tests/defense-declarations-regression.mjs, dev-tests/browser/defense-handoff.mjs, CHANGELOG-0.11.4.md.
