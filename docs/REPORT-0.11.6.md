# Audyt Gahla Resurrected 0.11.6-beta

Data: 2026-10-08.

## 1. Stan wejściowy i zakres

Bazą był gotowy `Gahla-Resurrected-Foundry-V14-0.11.5-beta.zip`, rozpakowany do osobnego katalogu roboczego. Przed zmianami potwierdzono `system.json`: `0.11.5-beta`; przeczytano changelogi 0.11.1–0.11.5 oraz aktualne implementacje rzutów, deklaracji, ataku, przerzutów, obrażeń, progów, LW, reakcji i trackera. Nie korzystano z 0.9.x jako źródła reguł.

SHA-256 wejściowego ZIP: `6327766da3bc4a9041528cb90d812d48c6c7ef6e41b589dd9ccbfb68f2ebc2c7`.

Potwierdzone rozbieżności: odwrócenie 100 dawało 1; gałąź Ułatwienia/Utrudnienia pomijała pierwszy rzut także wtedy, gdy nie był dubletem; brakowało czterech jawnych pól wyniku; lokacja przy Ułatwieniu/Utrudnieniu korzystała z niewłaściwej wartości; `justActed` nie wpływało na wybór aktywnego Combatanta, a ogólne płatności ustawiały/zwalniały tę flagę bez rozróżnienia rodzaju akcji.

## 2. Audyt wymagań

| Wymaganie | Status | Wynik kontroli |
|---|---|---|
| A. Baza i kanon 0.11.x | JUŻ BYŁO POPRAWNE | Zachowano punktową jakość, progi, LW, reakcje, OP, WIP i wcześniejsze automatyzacje. |
| B. Audyt aktualnego builda | JUŻ BYŁO POPRAWNE | Wejściowy manifest rzeczywiście wskazuje 0.11.5-beta; analizowano jego kod i 34 istniejące zestawy. |
| C. raw/mirror/effective/location | NAPRAWIONE | Wspólny `d100Result`; stare aliasy `raw`, `final`, `alternate` nadal działają. Ocena testu i jakość używają efektywnego wyniku. |
| D. 100/00 i dublety | NAPRAWIONE | 100 pozostaje 100/CF w każdym trybie. 00 normalizowane do 100. Zwykłe dublety 11–99 przerzucane tylko przy jednym aktywnym Ułatwieniu/Utrudnieniu; poprawiono zbędny pierwszy przerzut. |
| E. Zwykła lokacja | NAPRAWIONE | `reverseD100(rawRoll)`: 27 z Ułatwieniem → 72/Korpus, 72 z Utrudnieniem → 27/Prawa ręka. Tabela lokacji bez zmian. |
| E. Atak celowany | JUŻ BYŁO POPRAWNE | Wybrana lokacja, −30 i istniejące wyjątki pozostają. Nowy `locationRoll=null` jasno oznacza brak losowania lokacji. |
| E. Pełny przerzut | NAPRAWIONE | Nowy fizyczny rzut daje nową lokację według poprawionej reguły. Już poprawne zachowanie deklaracji obrony i brak drugiej opłaty zachowano. |
| F. Chat i dane ataku | NAPRAWIONE | Cztery pola w rezultacie i flags nowych kart, czytelne wyjaśnienie rzutu przy Ułatwieniu/Utrudnieniu. |
| G. 0k10 | JUŻ BYŁO POPRAWNE | Zachowano early return: 0 zwykłych obrażeń, w tym flat broni, cech/talentów i nadmiarowej Penetracji. Niezależna +1 Rana Sekwencji T4 pozostaje osobnym efektem. |
| H. Granice Progów Ran | JUŻ BYŁO POPRAWNE | ŻYW 9: 17→1, 18→2, 26→2, 27→3, 53→3, 54→5, 80→5, 81→6, 108→7. Brak pasma 4 Ran. |
| H. Pasywna odporność | JUŻ BYŁO POPRAWNE | R dodane raz; katastrofalne granice 2×B2+R, 3×B2+R itd.; obrażenia ≤R dają 0 Ran. |
| I. Jakość fizycznego ataku | JUŻ BYŁO POPRAWNE | Bonus=2, krytyk=4, bez sumowania i bez automatycznego mnożnika kości. |
| J. LW | JUŻ BYŁO POPRAWNE | +10 × aktualny łączny nadmiar Ran; jakość +10 ALBO +20. Brak przywrócenia +15. |
| K. Reakcja przed atakiem | JUŻ BYŁO POPRAWNE | Opłacona i zatwierdzona obrona poprzedza fizyczny k100. Chybienie nie zwraca kosztu. Brak dopłaty do następnej akcji. |
| K. Reakcja i przerzut | JUŻ BYŁO POPRAWNE | Punkt Losu nadal zachowuje deklarację i nie pobiera ponownie OP/reakcji; potwierdzone rzeczywistym handlerem przycisku. |
| L. Kolejka Bossa | NAPRAWIONE | Wspólny wybór Combatanta uwzględnia Pauzę. Przykład 20→17 / A8 / B7 wskazuje A, po jego głównej akcji ponownie Bossa. |
| L. Rodzaj akcji | NAPRAWIONE | Jawne zakończenie głównej akcji, parametr `bossPauseEligible`; `spendSegments` tylko pobiera koszt. Reakcje i darmowe kontrataki nie tworzą/nie zwalniają Pauzy. |
| L. Koszt reakcji Bossa | JUŻ BYŁO POPRAWNE | `reservedSZ` zmniejsza dostępną pulę od dołu; sama reakcja nie przesuwa pozycji inicjatywy. Zachowano tę regułę A/K i limit 3 reakcji. |
| L. Limit Ran Bossa | JUŻ BYŁO POPRAWNE | Istniejący limit Ran/trafienie niezmieniony. |
| M. Przyspieszenie/Spowolnienie | JUŻ BYŁO POPRAWNE | +3/+20/−1 i −3/−20/+1, twarde normalne minimum OP, przeładowanie min. 1. |
| N. Regresje | NAPRAWIONE | Dodano brakujące przypadki w trzech zestawach; wszystkie stare testy zachowane. |
| O. Wspólne helpery | NAPRAWIONE | Jedno wyliczenie k100 i jeden wybór kolejki; istniejący pipeline, istniejący tracker. |
| P. Wersja i dokumentacja | NAPRAWIONE | 0.11.6-beta, osobny changelog/raport i aktualne README. Historia starszych wersji pozostaje bez zmian. |
| P. Nowa migracja świata | NIE DOTYCZY | Brak zmiany schematu dokumentów. Nowe informacje są w flags; stare karty zachowują stare dane i obsługę. Nie da się wiarygodnie odtworzyć ich dawnych fizycznych rzutów. |
| C. Aktywne Deadly Crits | NIE DOTYCZY | W faktycznej bazie ustawienie jest opisane jako archiwalne i nieaktywne. Pipeline nie wykonuje dawnego mnożnika/tabeli. Nie przywrócono tej mechaniki; poprawiono niejednoznaczne zdanie README. |
| Q. Raport i ZIP | NAPRAWIONE | Gotowa paczka zawiera kod, testy, changelog i ten audyt. |

Przy Przeczuciu Przyszłości zachowano istniejącą regułę: zadeklarowany wynik zastępuje test, bez ponownego stosowania Ułatwienia ani przerzutu dubletu. Wyprowadzane są jego jawne pola i lokacja. Reguła CF Półmaga przy rzucaniu UM nadal wynosi 96 minus koszt Run w ciele; koszt 5 daje 91–100.

## 3. Pauza — szczegóły obsługi

Zakończony zwykły atak/manewr oznacza główną ofensywę niezależnie od sukcesu. Czary rozpoznawane są po jawnych kościach obrażeń, obniżeniu pancerza/trafienia/odporności, negatywnych stanach lub aspektach kar. Samo Przyspieszenie i leczenie nie oznaczają ofensywy. Dla własnych efektów opisowych MG oznacza główną ofensywę checkboxem istniejącego Trackera; wywołanie makrem może przekazać `bossPauseEligible`. Nie odgaduje się działania z tekstu opisu.

Akcja Długa rozlicza Pauzę dopiero przy zakończeniu. Przeniesienie, reakcja i samo odjęcie SZ nie wystarczają. Jeśli brak legalnego nie-Bossa, wybór przechodzi do innego legalnego niepauzującego uczestnika, a w ostateczności pozostawia pierwszego dostępnego Bossa, aby nie blokować walki. Wykluczeni są pokonani, postacie z zakończoną rundą lub niedokończonym długiem Akcji Długiej.

Nowa Pauza ma osobny identyfikator w flags. Gracz zwalnia ją potwierdzeniem na swoim aktorze; nie musi modyfikować aktora Bossa. Kolejna ofensywa generuje nowy identyfikator, więc stare potwierdzenie nie zwalnia nowej Pauzy. Powtórna akcja gracza nie cofa zwolnienia. Obsługiwane jest także stare `justActed` bez nowych flags. „Cofnij” zapisuje/przywraca metadane Pauzy razem ze stanem segmentów i turą.

## 4. Zmienione pliki

| Plik | Uzasadnienie |
|---|---|
| `system.json`, `gahla-resurrected.mjs` | Numer wersji. |
| `module/rules.mjs` | 100/00, wspólny wynik k100 i poprawny warunek przerzutu dubletów. |
| `module/automation-runtime.mjs` | Jawne pola także dla deklarowanego wyniku; bez zmiany reguł talentu. |
| `module/documents.mjs` | Fizyczna lokacja, dane/czytelność czatu, zakończenie głównych akcji i Akcji Długich. |
| `module/tracker-rules.mjs` | Wspólny wybór aktywnego i identyfikacja Pauzy, usunięcie automatycznego pauzowania z niskopoziomowej płatności. |
| `module/combat.mjs` | Integracja wyboru z Encounterem i jawne zakończenie głównej akcji. |
| `module/tracker.mjs` | Ten sam wybór aktywnego w panelu; oznaczenie własnej ofensywy i pełne cofnięcie Pauzy. |
| `module/spell-quality.mjs` | Rozpoznanie jawnych aspektów ofensywnych, z wyłączeniem Przyspieszenia. |
| `module/canon-actions.mjs` | Zakończenie przeładowania zwalnia Pauzę dla nie-Bossa. Koszt bez zmian. |
| `module/canonical-runtime.mjs` | Zakończenie płatnej zmiany wyposażenia rozlicza kolejkę po efekcie. Koszt bez zmian. |
| `templates/apps/initiative-tracker.hbs` | Checkbox ofensywnej własnej akcji Bossa. |
| `dev-tests/d100-116-regression.mjs` | 100/00, cyfry 0, dublety, deklaracje, progi z R=0/7, LW. |
| `dev-tests/attack-116-regression.mjs` | Faktyczny Actor, flags, wybrana/losowa lokacja, przycisk Fate, efektywna jakość i 0k10 z flat/Penetracją. |
| `dev-tests/boss-116-regression.mjs` | Faktyczny Combat/Actor/Item/panel: kolejka, reakcje, uprawnienia, czary/manewry, transfer, akcje długie, Undo. |
| `README.md` | Aktualna baza, wersja, brak nowej migracji, odnośniki i wyjaśnienie nieaktywnego Deadly Crits. |
| `CHANGELOG-0.11.6.md`, `docs/REPORT-0.11.6.md` | Nowa dokumentacja, bez przepisywania historii. |

## 5. Testy i ograniczenia

- Pełny runner: **37 PASS / 0 FAIL** (34 istniejące zestawy i 3 nowe).
- Przeglądarka Edge: **3 PASS / 0 FAIL** — kreator z kosztami i CSS przy 1200/760/480 px; pojedynczy korzeń generatora i jego przyciski/pola; dwa izolowane klienty z deklaracją właściciela przed ujawnieniem k100.
- Składnia: **81 modułów JS**, **7 JSON**, **0 błędów**. Dotychczasowe smoke/UI testy obejmują szablony i uruchomienie systemu w atrapach API.
- Początkowe uruchomienie Edge w piaskownicy nie wystartowało (błąd uprawnień procesu); ponowienie poza piaskownicą przeszło. Nie zaliczono nieudanego startu jako PASS.
- Podczas budowania nowych testów poprawiono ich dane/oczekiwania: brak typu fizycznego broni w fixture, wybór B po wcześniejszym wydaniu segmentów przez A oraz zachowany `parryChat:null` przy przerzucie. Końcowy pełny runner nie ma FAIL; nie usunięto żadnego starego testu.
- Nie uruchomiono pełnego serwera Foundry V14 ani świata użytkownika. Testy używają rzeczywistych modułów z atrapami API Foundry oraz rzeczywistej przeglądarki. Nie jest to potwierdzenie sesji w docelowej instalacji z modułami użytkownika.

## 6. Jawna kontrola regresji

Zachowano i sprawdzono testami: reakcje 0.11.3 przed k100 (także poza walką), minimum OP Przyspieszenia, jakość 2/4 bez mnożnika, LW +10, Progi 0.11 bez 4 Ran, pipeline obrażeń/0k10/Aury/Pancerza i limit Bossa. Nie zmieniono kreatora, generatora NPC/starć ani ich szablonów; ich testy nadal przechodzą. Tracker ma poprawioną Pauzę, a istniejące reakcje, segmenty, reset i dług pozostają.

Zachowano Runy, dystans/przeładowanie, Sekwencje, trwałe Rany, rozwój/EXP z cofaniem, aktywne talenty, źródła mocy, biblioteki, raport walki, szablony encounterów, makra/hotbar i wcześniejsze migracje. WIP pozostały WIP. Nie zmieniono plików modeli ani migracji i nie wykonano żadnej operacji na świecie użytkownika. Nie usunięto żadnego pliku bazy; dane, istniejące testy, style i historyczne raporty pozostały identyczne. Porównanie SHA-256: 115 plików wejściowych, 102 identyczne, 13 zmienionych, 5 dodanych, 0 usuniętych; paczka wynikowa ma 120 plików.

## 7. Paczka

`Gahla-Resurrected-Foundry-V14-0.11.6-beta.zip`, z `system.json` bezpośrednio w korzeniu. Po spakowaniu wykonano ponowne rozpakowanie, porównanie zawartości i pełną weryfikację modułów/testów z paczki. Log weryfikacji jest dostarczony obok ZIP.
