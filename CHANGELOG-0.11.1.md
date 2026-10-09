# Gahla Resurrected 0.11.1-beta — changelog

Baza: gotowy ZIP 0.11.0-beta. Zachowano funkcje tej wersji oraz istniejące WIP. Jedyna zmiana zasad: zatwierdzone minimum OP Przyspieszenia.

## Kreator i UI
- Osobne sekcje: podstawowe dane, cel/zasięg, czas, obrażenia, pomoc, utrudnienia, stany, elementy, rzucanie/OP, własny efekt MG i ryzyka Półmaga.
- Wszystkie dotychczasowe pola oraz 24 dodatkowe aspekty pozostają dostępne. Dodatkowe aspekty przeniesiono do odpowiednich grup zamiast jednej długiej listy.
- Większe odstępy, czytelniejsze nagłówki, etykiety i koszty; uporządkowane checkboxy, szerokości pól, kontrast i zaznaczenie klawiaturą.
- Przyklejony pasek kosztu/limitu, końcowego OP, minimum OP i wyniku walidacji. Odnośnik prowadzi do szczegółowych błędów, uwag i źródeł modyfikatorów. Nielegalna zdolność ma nieaktywny przycisk zapisu; po korekcie zapis ponownie działa.
- Na wąskich oknach pola układają się w jedną kolumnę, a podgląd pod formularzem. Poprawiono przepełnienie podglądu. Styl pozostaje w dotychczasowej ciemnej, pergaminowej kolorystyce.
- Formuły kosztów, talentów i źródeł mocy nie zostały zmienione.

## Przyspieszenie
Nadal +3 SZ, +20 Obrony i −1 OP. Usunięto z jego wspólnej definicji obniżanie minimum OP. Broń lekka OP 3 pozostaje przy 3; OP 4/minimum 3 spada do 3. Minima pozostają zabezpieczeniem również przy nakładających się redukcjach, manewrach oraz czarach/cudach.
Spowolnienie: bez zmian (−3 SZ, −20 Obrony, +1 OP).
Nie dodano nowych reguł reakcji: dotychczas Przyspieszenie nie modyfikowało oddzielnego kosztu reakcji. Zachowano również wcześniejsze, niezależne wyjątki, np. zasady przenoszenia segmentów.

## Weryfikacja
- 27/27 zestawów regresyjnych PASS, w tym nowy test Przyspieszenia: koszt rzeczywistego ataku/manewru, minima broni, czary i cuda Tier 1–4, kumulowanie redukcji, Spowolnienie i reakcje.
- Kontrola składni 62 modułów JavaScript i poprawności 6 plików JSON: bez błędów.
- Test DOM w Edge: oryginalny szablon i moduł, 24 aspekty bez duplikacji po ponownym renderze, synchronizacja danych, działająca zniżka Świętego Płomienia, przeliczenie leczenia/celu, błędy walidacji oraz ponowne odblokowanie zapisu.
- HTML/CSS: brak zduplikowanych identyfikatorów, zachowane identyfikatory wszystkich starych pól, brak poziomego przepełnienia przy 480/760/1200 px, wizualna kontrola zrzutów; brak błędów JavaScript w teście przeglądarkowym.
- Test przeglądarkowy korzysta z atrap API Foundry i częściowego przygotowania szablonu. Nie jest testem uruchomienia pełnego Foundry V14 ani pełnej kompilacji Handlebars. Nie deklaruję przeprowadzenia sesji gry w VTT.

## Poza zakresem — bez automatycznej zmiany balansu
Ręczne przyciski Trackera przyjmują końcowy koszt podany przez użytkownika; nie mają metadanych minimum konkretnej akcji. Opisowe sekwencje oraz część akcji specjalnych również nie mają wspólnego, jawnego minimum. Nie dopisano im nieokreślonych zasad ani drugiej redukcji już obliczonego kosztu. W przyszłości można nadać takim akcjom profile kosztu/minimum i objąć je automatyzacją po ustaleniu zasad. Zmiana w tej wersji usuwa obniżanie minimum przez Przyspieszenie we wszystkich istniejących ścieżkach korzystających ze wspólnego silnika efektów.

## Zmienione pliki względem 0.11.0
- `templates/apps/ability-builder.hbs` — sekcje, podsumowanie, walidacja i opisy kosztów.
- `styles/gahla.css` — style ograniczone do kreatora, responsywność i czytelność.
- `module/ability-builder.mjs` — grupowanie dodatkowych pól i aktualizacja podsumowania/walidacji.
- `module/effects-engine.mjs` — Przyspieszenie nie obniża minimum.
- `module/content.mjs` — zgodny opis Przyspieszenia.
- `dev-tests/automation-ability-regression.mjs` — aktualne oczekiwanie minimum.
- `dev-tests/haste-minimum-regression.mjs` — nowy test regresyjny.
- `dev-tests/browser/ability-dom.mjs` — rozszerzona kontrola kreatora.
- `system.json`, `gahla-resurrected.mjs` — wersja 0.11.1-beta.
- `CHANGELOG-0.11.1.md` — ten dokument.

Nie zmieniono struktury zapisów świata; nowa migracja danych nie jest potrzebna. Dotychczasowe migracje pozostają w paczce. Istniejące zdolności z zapisanym stanem kreatora są przeliczane podczas użycia przez aktualny silnik. Ręczne/legacy zdolności zachowują swoje zapisane minimum.
