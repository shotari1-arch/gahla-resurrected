# Raport 0.11.5-beta

## Baza i zakres

Ukończona wersja 0.11.4-beta, przygotowana po 0.11.3 w tym czacie. Zachowano wcześniejsze UI kreatora, mechanikę Przyspieszenia, predeklarację reakcji i pojedynczy korzeń formularza generatorów. Prace 0.11.4 nad reakcjami poza walką, progiem obrażeń, chatem i historią EXP są częścią tej paczki. Nowy kanon opisuje CHANGELOG-0.11.5.md.

## Testy

- 34/34 zestawy regresji: reguły, aktorzy, arkusze, automatyka, drzewko, kreator, generatory, migracje i rozwój.
- Nowe testy rzeczywistych metod aktorów w atrapach Foundry: strzał, zużycie pocisku, opłacenie Przycelowania, przeładowanie, sumowanie SF/PER, ignorowanie Pancerza, Śmiertelny Cios, CF tylko przy czarze UM Półmaga, wszczepienie i bezpośrednie Rany.
- Model cech: obniżone ŻYW/progi, cztery Odporności Mistrza Run, aktywne efekty run, brak kumulowania przy ponownym wyliczeniu.
- Lekka i ciężka tarcza: brak talentu i T1–T4, liczba lokacji, Pancerz, ignorowanie kości na chronionej i niechronionej lokacji.
- LW: 5 profili × 6 lokacji × 16 wartości = 480 rozstrzygnięć, w tym granice 40/80/100/120/140 i 141+. Dodatkowo ciągłość przedziałów, kategorie źródeł, trwały zapis i Długi Odpoczynek, 3/1 pełne rundy, idempotencja, stabilizacja, śmierć, edycja/usunięcie i kary lokalne.
- Migracja nazw w miejscu, bez nowych dokumentów i z zachowaniem UUID; powtórzenie nie zmienia stanu; historia zakupu pozostaje możliwa do cofnięcia.
- 3 testy przeglądarkowe Edge: kreator 1200/760/480 px z aktualnym kosztem i modyfikatorem talentu; formularz generatora z pojedynczym korzeniem; dwa izolowane klienty z wyborem reakcji przez właściciela, zerem rzutów przed wyborem i jednym naliczeniem kosztu. Widok karty ataku 280 px oraz progów 640 px skontrolowano na obrazach.
- Osobny log weryfikacji zawiera liczbę sprawdzonych plików JS/JSON i wersję manifestu. Wszystkie testy są dołączone w dev-tests.

## Granice weryfikacji i automatyzacji

Nie uruchamiano pełnego serwera Foundry V14 ani rzeczywistego świata użytkownika. Testy przeglądarkowe korzystają z prawdziwych modułów systemu oraz atrap dokumentów i transportu. Zachowane oznaczenie kompatybilności manifestu pochodzi z bazy, nie jest deklaracją nowego testu na serwerze 14.368.

Runotwórca i gracz deklarują odpowiednie Rzemiosło; wyzwalacz Theriana jest uzgodnieniem fabularnym. Limit Run liczony jest od ŻYW przed odjęciem kosztu Run, aby koszt nie obniżał rekurencyjnie własnego limitu. Pierwsza Pomoc stabilizuje w swoim istniejącym przepływie; pozostałe odpowiednie metody leczenia MG potwierdza przyciskiem. Poza walką upływ pełnej rundy potwierdza MG. Mnożnik maksymalnego ruchu widnieje na karcie; system nie blokuje przesuwania tokenu po mapie. Usunięcie rany przez MG nie kasuje aktualnych zwykłych Ran. Niesprecyzowane efekty fabularne pozostają opisem, bez dopisanej matematyki.

Migracja oficjalnie nazwanych pięciu broni dystansowych aktualizuje parametry bazowe zgodnie z tabelą autora i zachowuje wcześniejszy system przedmiotu w flags.gahla-resurrected.canon115Previous.weapon. Wyposażenie, uszkodzenia, runy oraz ID pozostają. Stare dokumenty są aktualizowane, nie zastępowane. Zakupy sprzed wprowadzenia historii EXP nie mogą uzyskać odtworzonej historii, której nigdy nie zapisano.

Dawne raporty i tabela LW są zachowane jako historia. Broń palna nie była objęta nową tabelą autora — jej poprzednie wpisy i WIP pozostały. Opcjonalne Deadly Crits bez zmian.

## Do decyzji autora

Sposób nakładania stałych obrażeń i bonusów jakości na wiele strzał Wielostrzału. Kod nalicza pociski i koszt przeładowania, ale nie wymyśla ani nie wykonuje automatycznej reguły wielopociskowych obrażeń.

## Pliki zmienione względem 0.11.4-beta

- CHANGELOG-0.11.5.md
- CHANGELOG.md
- README.md
- data/bestiary_tags.json
- data/lingering-wounds.json
- data/placeholder-tables.json
- dev-tests/automation-runtime-regression.mjs
- dev-tests/canon115-actor-regression.mjs
- dev-tests/canon115-model-regression.mjs
- dev-tests/canon115-regression.mjs
- dev-tests/injury-runtime-regression.mjs
- dev-tests/lingering-wounds-regression.mjs
- dev-tests/ui-regression.mjs
- docs/MECHANICS-AUDIT.md
- docs/REPORT-0.10.0.md
- docs/REPORT-0.11.0.md
- docs/TABLES-AUDIT-0.9.3.md
- docs/historical/README-before-0.11.5.md
- docs/historical/lingering-wounds-before-0.11.5.json
- gahla-resurrected.mjs
- module/armor-rules.mjs
- module/automation-rules.mjs
- module/automation-runtime.mjs
- module/canon-actions.mjs
- module/canon-mechanics.mjs
- module/canon-migration.mjs
- module/canon-names.mjs
- module/combat.mjs
- module/content.mjs
- module/context-reactions.mjs
- module/creator.mjs
- module/data-models.mjs
- module/defense-declarations.mjs
- module/documents.mjs
- module/effects-engine.mjs
- module/injury-runtime.mjs
- module/lingering-wounds.mjs
- module/maneuver-rules.mjs
- module/setup.mjs
- module/sheets.mjs
- module/talent-balance.mjs
- module/talent-eligibility.mjs
- module/talent-tree-rules.mjs
- styles/gahla.css
- system.json
- templates/actor/character-sheet.hbs
- templates/apps/character-creator.hbs
- templates/item/item-sheet.hbs
- docs/REPORT-0.11.5.md
- docs/TEST-RESULTS-0.11.5.txt
