# Gahla Resurrected 0.11.5-beta

Baza: ukończona 0.11.4-beta; bez cofania funkcji 0.11.0 i późniejszych poprawek.

## Nazwy i migracja

- Łotr → Łowca w aktywnych danych i wymaganiach.
- John Cena → Krok Widma.
- Trzy Szybkie / 3 szybkie / 3 szybkie XD → Wielostrzał.
- Czatownik / Czatownik(XD) → Błyskawiczne Otwarcie.
- Doświadczone Wojaczkowe → Doświadczony Wojak (również w nazwie z Doświadczeniem Strzelca).
- Mistrz Bloków → Garda Weterana; osobny Mistrz Bloku pozostaje.
- Unik Specjalny → Akrobatyczny Unik.
- Migracja zachowuje ID, poziomy i stan nauczenia. Stare nazwy mają aliasy. Zmienia istniejące dokumenty zamiast tworzyć nowe; obejmuje przedmioty świata, aktorów i niepowiązane tokeny. Historia zakupów również jest migrowana, więc cofanie zakupów pozostaje możliwe.

## Zatwierdzone reguły

- Kontrolowana Sekwencja: Łowca min. T3; jednorazowe pominięcie −30 poza pierwszym manewrem; T4 pełnej Sekwencji: czwarty manewr ignoruje Pancerz albo +1 Rana. System pilnuje kolejności i wykorzystania T3. Przerzut nie płaci ani nie zużywa efektu ponownie.
- Mistrz Tarczy: 2/3/4/4 lokacje; na T4 +1 zakresu ignorowania niskich wyników tylko na osłanianych lokacjach, bez zmiany bazowego Pancerza.
- Runotwórstwo: zaokrąglenie w górę (WIA + ZR + UM + SF)/4, +10 za poziom talentu i +10 za zadeklarowane odpowiednie Rzemiosło.
- Mistrz Run: Znawca Run min. T3; +5 wszystkich czterech Odporności za punkt kosztu Run w ciele, bez dodatkowego limitu bonusu.
- Runy w ciele: limit ceil(ŻYW przed kosztem / 3); koszt obniża ŻYW i progi. Zwykła i krytyczna porażka wszczepienia zadają koszt runy w bezpośrednich Ranach. CF UM przy zaklęciach Półmaga: 96 − koszt; 5 → 91–100.
- Therian: personalny Wyzwalacz Jaźni, pole w kreatorze i karcie, poprawione wymagania przemian.
- Pięć oficjalnych broni dystansowych, wystrzał bazowo 2 OP; SF łuków, Penetracja i sloty Run zgodne z tabelą. Przeładowanie 4/5/6/8/10, Szybkie Przeładowanie −1/−2/−3/−4, minimum 1.
- Przycelowanie: do 4 segmentów, +5 trafienia/segment, +1k10/2 segmenty. Sokole Oko: +15/segment, +2k10 za pierwsze 2 oraz +1k10 za następne 2. Precyzyjny Strzał zachowuje cyfrę dziesiątek PER. Wielostrzał: 2 pociski na T3, 3 na T4; kolejne po +½ bazowego przeładowania. Grad Strzał i Taktyczny Wybór bez nerfów.
- LW: zatwierdzone siedem przedziałów, cztery grupy lokacji i tabele sieczne/kłute, obuchowe, strzały/bełty oraz wspólne elementy. k100 +10 za każdą aktualną Ranę ponad ŻYW +10 bonus ALBO +20 krytyk; Śmiertelny Cios tylko dodatkowe +10. Dokładnie przy maksimum nie ma LW.
- Zapis urazów na karcie, stosowanie stanów i kar przez wspólny silnik efektów, niesprawne lokacje, odliczanie pełnych rund i stabilizacja. MG edytuje lub usuwa skutki leczenia. Długi Odpoczynek nie kasuje LW. Deadly Crits bez zmian.

## Zachowane poprawki i UI

- Reakcje przed k100, również poza walką; opłata od dołu rundy bez przesunięcia inicjatywy.
- Przyspieszenie +3 SZ/+20 Obrony/−1 OP z twardym minimum; Spowolnienie bez zmiany.
- Czytelny Kreator Zaklęć/Cudów, podsumowanie kosztu/OP i walidacja; bez powrotu do starego układu.
- Generator Starć/NPC ma pojedynczy korzeń HTML wymagany przez ApplicationV2.
- Naprawiona wąska kolumna tekstu obrony w chacie; osobne czytelne progi Fizyczne/Magiczne/Duchowe.
- Brak plusów przy statystykach w Postaci; automatyczne korzyści poziomu, tabela sesji EXP, sumowanie i cofanie zakupów w Rozwoju.

## WIP

Usunięto: wzór Runotwórstwa, Trigger Theriana, podstawową tabelę dystansową, Kontrolowaną Sekwencję z błędnym wymaganiem Łotr, opisany Mistrz Tarczy i zatwierdzone tabele LW. Pozostałe niedookreślone reguły zachowane jako WIP.

## Do decyzji autora

Jedno zagadnienie: naliczanie flat damage i jakości wielu pocisków Wielostrzału. Automatyka nie dopowiada reguły; obrażenia wielopociskowego strzału rozstrzyga MG.

Wyniki testów, ograniczenia środowiska i pełna lista plików: [raport](docs/REPORT-0.11.5.md).
