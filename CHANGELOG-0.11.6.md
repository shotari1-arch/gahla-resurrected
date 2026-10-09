# Gahla Resurrected 0.11.6-beta

Baza: ukończony ZIP 0.11.5-beta. Poprawki wynikają z audytu tej paczki; nie zmieniono innych zasad balansu.

## k100 i lokacja

- Naturalne 100 oraz zapis 00 odwracają się do 100. Ułatwienie nie zamienia 100 w 01; Ułatwienie/Utrudnienie nie przerzuca 100 jako dubletu.
- Usunięto pomijanie pierwszego fizycznego rzutu przy Ułatwieniu/Utrudnieniu. Przerzucane są tylko zwykłe dublety 11–99.
- Wspólny wynik zawiera `rawRoll`, `mirrorRoll`, `effectiveRoll`, `locationRoll`; zachowano stare aliasy dla zgodności z makrami.
- Zwykły atak ustala lokację z odwróconego fizycznego rzutu, niezależnie od wyniku efektywnego. Cztery wartości trafiają do rezultatu i flags karty ataku.
- Atak celowany zachowuje wybraną lokację i karę −30 z istniejącymi wyjątkami talentów; jego `locationRoll` jest `null`.
- Karta ataku z Ułatwieniem/Utrudnieniem pokazuje wynik fizyczny, odwrócony, efektywny i lokację. Przerzut wylicza je ponownie, zachowując wcześniej opłaconą obronę.

## Pauza Bossa

- Natywny Encounter i istniejący panel Gahla korzystają ze wspólnego wyboru aktywnej postaci. Po głównej ofensywnej akcji Boss przepuszcza najwyższą legalną postać niebędącą Bossem, nawet gdy nadal ma więcej SZ.
- Samo opłacenie segmentów, Unik, Parowanie, reakcja czarem, darmowy kontratak i przerzut nie tworzą nowej Pauzy ani nie zwalniają poprzedniej.
- Zakończona główna akcja nie-Bossa zwalnia Pauzę. Dotyczy to także płatnego przeładowania/zmiany wyposażenia. Przeniesienie i rozpoczęcie Akcji Długiej nie zastępują jej zakończenia.
- Ataki, manewry ofensywne i czary o jawnych aspektach obrażeń/debuffów oznaczają akcję automatycznie. Dla własnej akcji Bossa panel ma checkbox „Główna akcja ofensywna — Pauza Bossa”; makra mogą podać `bossPauseEligible`.
- Zwolnienie Pauzy zapisuje potwierdzenie na własnym aktorze gracza, bez konieczności edycji nieposiadanego Bossa. „Cofnij” przywraca też dane Pauzy i kolejkę.

## Weryfikacja i zgodność

Dodano 3 zestawy regresyjne: k100/progi/LW, rzeczywisty atak i przycisk Punktu Losu, rzeczywisty Combat/Actor/Item i Pauza Bossa. Łącznie 37 zestawów PASS, 0 FAIL; dodatkowo 3 testy przeglądarkowe PASS. Sprawdzono składnię JS i JSON.

Zachowano jakość 2/4 Punktów Bonusu bez mnożnika kości, 0 obrażeń przy 0k10, progi 0.11 bez pasma 4 Ran, LW +10, minimum OP Przyspieszenia, reakcje przed rzutem, limit Ran Bossa oraz cały kanon 0.11.5. Brak nowej migracji świata. Szczegółowy audyt i ograniczenia testów: [REPORT-0.11.6.md](docs/REPORT-0.11.6.md).
