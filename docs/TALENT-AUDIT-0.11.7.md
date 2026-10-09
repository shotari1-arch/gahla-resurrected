# Audyt wszystkich talentów — 0.11.7-beta

Baza: ukończony ZIP 0.11.6-beta. 169 wpisów, 168 nazw; Pamięć Krwi występuje dwukrotnie jako WIP. Audyt rozróżnia poprawność zachowanego opisu od pokrycia kodem. **OK nie oznacza pełnej automatyzacji.** Braki, skrócone reguły i propozycje nie są nowymi zasadami. Nie usunięto żadnego talentu.

Koszt bazowy × kupowany poziom, dotychczasowy rabat nauczyciela 50%. Wymagania rasy/archetypu/bóstwa/ścieżki, kolejność poziomów, Tier i jawne prerequisites sprawdza wspólna legalność. Wymagania fabularne (nauczyciel, warunki terenu, personalny wyzwalacz) nadal ocenia MG. Nie nadano automatycznie nowych poziomów.

## 1. Widzenie w Ciemności

**Status:** OK — zasady zachowane. **Kategoria:** racial. **Maks. poziom:** 1. **Baza EXP:** 50. **Wymagania:** wszyscy.

**Stary efekt:** Widzisz w ciemności.

**Nowy efekt:** Widzisz w ciemności.

**Problem, decyzja i uzasadnienie:** Zdolność fabularna. Nie przypisano arbitralnego zasięgu widzenia ani automatycznego uprawnienia do wszystkich języków.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/talent-balance.mjs`

## 2. Wytrzymały

**Status:** OK — zasady zachowane. **Kategoria:** racial. **Maks. poziom:** 4. **Baza EXP:** 50. **Wymagania:** wszyscy.

**Stary efekt:** +2 do Progów Obrażeń na poziom talentu.

**Nowy efekt:** +2 do Progów Obrażeń na poziom talentu.

**Problem, decyzja i uzasadnienie:** Automatyczne +2×poziom do obu progów wszystkich typów. To bezpośredni bonus progów, nie pełna odporność. Nie podwaja go Hybryda ani nie usuwa Święty Płomień.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/data-models.mjs`

## 3. Mocna Skóra

**Status:** ZMIENIONY. **Kategoria:** racial. **Maks. poziom:** 1. **Baza EXP:** 50. **Wymagania:** wszyscy.

**Stary efekt:** Redukcja obrażeń fizycznych równa Tierowi przed sprawdzeniem progu.

**Nowy efekt:** +1 do Fizycznego Progu I i II za każdy Tier postaci (T1–T4: +1/+2/+3/+4). Nie zwiększa Pancerza ani pełnej Odporności i nie odejmuje obrażeń.

**Problem, decyzja i uzasadnienie:** ZMIENIONY. Usunięta płaska redukcja; +Tier postaci tylko do obu Fizycznych Progów. Jeden zakup, wzrost automatyczny z Tierem. Dawne nadmiarowe poziomy zachowane do rozliczenia przez MG; bez samowolnego zwrotu EXP. Darmowy talent rasowy pozostaje darmowy.

**Automatyzacja:** Modyfikatory: threshold.

**Ślady w kodzie (nie dowód kompletności):** `module/creator.mjs`, `module/data-models.mjs`, `module/effects-engine.mjs`, `module/talent-balance.mjs`

## 4. Nadludzka Siła

**Status:** OK — zasady zachowane. **Kategoria:** racial. **Maks. poziom:** 1. **Baza EXP:** 50. **Wymagania:** Taurosi.

**Stary efekt:** Akcja darmowa: na 1 rundę podwajasz SF, potem Zmęczenie.

**Nowy efekt:** Akcja darmowa: na 1 rundę podwajasz SF, potem Zmęczenie.

**Problem, decyzja i uzasadnienie:** Przycisk: podwojenie SF na rundę, potem Zmęczenie. Koniec rundy/końca walki obsługiwany; wymaga Trackera do czasu rundowego. Nie dodano limitu nieobecnego w opisie.

**Automatyzacja:** Przycisk i zasób/czas w ACTIVE_RULES; pozostałe części według uwag.

**Ślady w kodzie (nie dowód kompletności):** `module/effects-engine.mjs`, `module/talent-balance.mjs`

## 5. Szarża Taurosa

**Status:** OK — zasady zachowane. **Kategoria:** racial. **Maks. poziom:** 1. **Baza EXP:** 50. **Wymagania:** Taurosi.

**Stary efekt:** 4 segmenty i cały darmowy ruch: szarża. Bonus obrażeń licz z bazowego SF przed chwilowymi mnożnikami: +1k10 za każde 20 SF, maksymalnie Tier + 2 k10. Przy bazowym SF 60+ możliwe Powalenie.

**Nowy efekt:** 4 segmenty i cały darmowy ruch: szarża. Bonus obrażeń licz z bazowego SF przed chwilowymi mnożnikami: +1k10 za każde 20 SF, maksymalnie Tier + 2 k10. Przy bazowym SF 60+ możliwe Powalenie.

**Problem, decyzja i uzasadnienie:** Zachowany osobny przelicznik bonusu z bazowego SF i limit Tier+2 k10. Dostępność celu, cały ruch i Powalenie wymagają kontekstu działania; nie uznawać istnienia helpera za pełny automat ataku.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/talent-balance.mjs`

## 6. Silnoręki

**Status:** OK — zasady zachowane. **Kategoria:** racial. **Maks. poziom:** 1. **Baza EXP:** 50. **Wymagania:** Taurosi.

**Stary efekt:** Ataki +1k10 obrażeń, ale +1 OP.

**Nowy efekt:** Ataki +1k10 obrażeń, ale +1 OP.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/talent-balance.mjs`

## 7. Pamięć Krwi

**Status:** WIP. **Kategoria:** racial. **Maks. poziom:** 4. **Baza EXP:** 50. **Wymagania:** Vampirsi.

**Stary efekt:** WIP – opis talentu w opracowaniu.

**Nowy efekt:** WIP – opis talentu w opracowaniu.

**Problem, decyzja i uzasadnienie:** WIP. Brak pełnej mechaniki; zakup blokowany, wykluczony z normalnego wyboru talentów rasowych kreatora. Dwa wpisy Pamięci Krwi w różnych kategoriach pozostają jako oznaczone WIP; nie scalano samowolnie dokumentów świata.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/setup.mjs`

## 8. Krwisty Metabolizm

**Status:** OK — zasady zachowane. **Kategoria:** racial. **Maks. poziom:** 4. **Baza EXP:** 50. **Wymagania:** Vampirsi.

**Stary efekt:** Po wypiciu krwi zyskujesz pulę 1/2/3/4 użyć Ułatwienia do wybranych testów. Każde użycie zużywa 1 punkt puli; niewykorzystana pula znika po zakończeniu sceny albo odpoczynku.

**Nowy efekt:** Po wypiciu krwi zyskujesz pulę 1/2/3/4 użyć Ułatwienia do wybranych testów. Każde użycie zużywa 1 punkt puli; niewykorzystana pula znika po zakończeniu sceny albo odpoczynku.

**Problem, decyzja i uzasadnienie:** Pula 1/2/3/4 po krwi, deklaracja Ułatwienia przed testem, zużycie i reset sceny/odpoczynku. Warunek wypicia krwi potwierdza prowadzący; system nie weryfikuje zdarzenia fabularnego.

**Automatyzacja:** Przycisk i zasób/czas w ACTIVE_RULES; pozostałe części według uwag.

**Ślady w kodzie (nie dowód kompletności):** `module/effects-engine.mjs`

## 9. Niezłomna Postawa

**Status:** OK — zasady zachowane. **Kategoria:** racial. **Maks. poziom:** 1. **Baza EXP:** 50. **Wymagania:** Krasnoludy.

**Stary efekt:** Ułatwienie do testu obronnego na Powalenie.

**Nowy efekt:** Ułatwienie do testu obronnego na Powalenie.

**Problem, decyzja i uzasadnienie:** Sytuacyjne Ułatwienie; wybór właściwego testu i okoliczności pozostaje ręczny. Nie przyznawać globalnego Ułatwienia wszystkim testom ani stałego bonusu progów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/talent-balance.mjs`

## 10. Podziemne Zmysły

**Status:** OK — zasady zachowane. **Kategoria:** racial. **Maks. poziom:** 1. **Baza EXP:** 50. **Wymagania:** Krasnoludy.

**Stary efekt:** Ułatwienie do testów PER pod ziemią.

**Nowy efekt:** Ułatwienie do testów PER pod ziemią.

**Problem, decyzja i uzasadnienie:** Sytuacyjne Ułatwienie; wybór właściwego testu i okoliczności pozostaje ręczny. Nie przyznawać globalnego Ułatwienia wszystkim testom ani stałego bonusu progów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/talent-balance.mjs`

## 11. Krasnoludzkie Rzemiosło

**Status:** OK — zasady zachowane. **Kategoria:** racial. **Maks. poziom:** 4. **Baza EXP:** 50. **Wymagania:** Krasnoludy.

**Stary efekt:** +20/+30/+40/+50 do testu wybranego fachu.

**Nowy efekt:** +20/+30/+40/+50 do testu wybranego fachu.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 12. Plotkowanie

**Status:** OK — zasady zachowane. **Kategoria:** racial. **Maks. poziom:** 4. **Baza EXP:** 50. **Wymagania:** Ludzie.

**Stary efekt:** Ułatwienie tyle razy na sesję, ile poziomów talentu, do informacji wśród ludzi.

**Nowy efekt:** Ułatwienie tyle razy na sesję, ile poziomów talentu, do informacji wśród ludzi.

**Problem, decyzja i uzasadnienie:** Opis obejmuje ograniczone użycia lub przerzut. Brak kompletnego dedykowanego licznika tej zdolności: liczy MG/gracz. Nie przeniesiono do grupy w pełni zautomatyzowanych aktywnych talentów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 13. Wszechstronny

**Status:** OK — zasady zachowane. **Kategoria:** racial. **Maks. poziom:** 1. **Baza EXP:** 50. **Wymagania:** Ludzie, Olagowie.

**Stary efekt:** Raz na poziom, przy zakupie pakietu rozwoju statystyk za 50 EXP, rozwijasz 4 różne statystyki zamiast 3.

**Nowy efekt:** Raz na poziom, przy zakupie pakietu rozwoju statystyk za 50 EXP, rozwijasz 4 różne statystyki zamiast 3.

**Problem, decyzja i uzasadnienie:** Automatycznie pakiet 4 zamiast 3 różnych cech za 50 EXP raz na poziom. Historia rozwoju zachowuje możliwość cofnięcia zakupu.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/automation-rules.mjs`, `module/talent-balance.mjs`

## 14. Zmysł Przyrody

**Status:** OK — zasady zachowane. **Kategoria:** racial. **Maks. poziom:** 1. **Baza EXP:** 50. **Wymagania:** Erusanie.

**Stary efekt:** Ułatwienie znajdowania ziół, surowców i zwierzyny w lesie.

**Nowy efekt:** Ułatwienie znajdowania ziół, surowców i zwierzyny w lesie.

**Problem, decyzja i uzasadnienie:** Sytuacyjne Ułatwienie; wybór właściwego testu i okoliczności pozostaje ręczny. Nie przyznawać globalnego Ułatwienia wszystkim testom ani stałego bonusu progów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/talent-balance.mjs`

## 15. Cztery Ręce

**Status:** OK — zasady zachowane. **Kategoria:** racial. **Maks. poziom:** 4. **Baza EXP:** 50. **Wymagania:** Erusanie.

**Stary efekt:** T1: do 4 przedmiotów; T3: tarcza z bronią dwuręczną lub +5 Obrony za wolną rękę.

**Nowy efekt:** T1: do 4 przedmiotów; T3: tarcza z bronią dwuręczną lub +5 Obrony za wolną rękę.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 16. Ciało Cienia

**Status:** OK — zasady zachowane. **Kategoria:** racial. **Maks. poziom:** 1. **Baza EXP:** 50. **Wymagania:** Kastianie.

**Stary efekt:** Możesz zamienić cień w oręż; obrażenia magiczne Cienia, min. 4 OP.

**Nowy efekt:** Możesz zamienić cień w oręż; obrażenia magiczne Cienia, min. 4 OP.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/talent-balance.mjs`

## 17. Ciało Światła

**Status:** OK — zasady zachowane. **Kategoria:** racial. **Maks. poziom:** 1. **Baza EXP:** 50. **Wymagania:** Sharii.

**Stary efekt:** Jak Ciało Cienia, dla Światła.

**Nowy efekt:** Jak Ciało Cienia, dla Światła.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/talent-balance.mjs`

## 18. Bestialska Hybryda

**Status:** ZMIENIONY. **Kategoria:** racial. **Maks. poziom:** 4. **Baza EXP:** 50. **Wymagania:** Therianie.

**Stary efekt:** Przemiana 3 segmenty; połowiczna przemiana +25%; talenty Wojownika aktywne w przemianie; Blokada Aury; wymaga spełnienia personalnego Wyzwalacza Jaźni ustalonego przy tworzeniu postaci / z MG.

**Nowy efekt:** Przemiana 3 segmenty; połowiczna przemiana +25%; talenty Wojownika aktywne w przemianie; Blokada Aury; wymaga spełnienia personalnego Wyzwalacza Jaźni ustalonego przy tworzeniu postaci / z MG. T4: po włączeniu przez MG, przez 2 rundy ignorujesz kary Zmęczenia i Krwawienia oraz podwajasz wyłącznie bonus Fizycznych Progów wynikający z dziesiątek Odporności Fizycznej. Bez nowego kosztu i limitu użyć; pozostałe bonusy Progów nie są podwajane.

**Problem, decyzja i uzasadnienie:** ZMIENIONY. Dodany zatwierdzony T4: MG włącza na 2 rundy, bez nowego kosztu i limitu. Mnożnik ×2 dotyczy tylko bonusu z dziesiątek Odp. Fizycznej, nie ŻYW, innych bonusów ani pełnej odporności. Stany nie są kasowane; kary wracają po wygaśnięciu. Pozostaje rozbieżność wcześniejszego opisu połowicznej przemiany +25% z modelem przemiany: wymaga osobnej decyzji, nie zmieniono.

**Automatyzacja:** Przycisk i zasób/czas w ACTIVE_RULES; pozostałe części według uwag.

**Ślady w kodzie (nie dowód kompletności):** `module/canon-migration.mjs`, `module/creator.mjs`, `module/effects-engine.mjs`

## 19. Zmiennokształtny

**Status:** OK — zasady zachowane. **Kategoria:** racial. **Maks. poziom:** 4. **Baza EXP:** 50. **Wymagania:** Therianie.

**Stary efekt:** Przemiana 3 segmenty, bez zbroi; wymaga spełnienia personalnego Wyzwalacza Jaźni ustalonego przy tworzeniu postaci / z MG. T1: Pazury i Kły, Blokada Aury, Naturalna Obrona, Zwierzęcy Szał, +1k10 bez broni; dalsze poziomy opisane w przewodniku.

**Nowy efekt:** Przemiana 3 segmenty, bez zbroi; wymaga spełnienia personalnego Wyzwalacza Jaźni ustalonego przy tworzeniu postaci / z MG. T1: Pazury i Kły, Blokada Aury, Naturalna Obrona, Zwierzęcy Szał, +1k10 bez broni; dalsze poziomy opisane w przewodniku.

**Problem, decyzja i uzasadnienie:** Skrócony opis odsyła po dalsze poziomy do przewodnika. Zachowano istniejące przemiany i personalny Wyzwalacz Jaźni. Nie dopisano brakujących wyższych efektów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/canon-migration.mjs`, `module/creator.mjs`

## 20. Mocne Kości

**Status:** ZMIENIONY. **Kategoria:** racial. **Maks. poziom:** 4. **Baza EXP:** 50. **Wymagania:** Olagowie.

**Stary efekt:** T1 +1 do Progu Obrażeń, T3 łącznie +2.

**Nowy efekt:** T1 +1 do Progu Obrażeń, T3 łącznie +2.

**Problem, decyzja i uzasadnienie:** ZMIENIONY (brakująca automatyzacja). +1 na T1–T2 i +2 na T3–T4 do obu progów wszystkich typów. Brak płaskiej redukcji. T2 i T4 nie dają dodatkowej wartości w skróconym opisie: pozostawiono dotychczasowe poziomy, decyzja o koszcie/skracaniu progresji wymaga zatwierdzenia.

**Automatyzacja:** Modyfikatory: threshold.

**Ślady w kodzie (nie dowód kompletności):** `module/effects-engine.mjs`

## 21. Przewodnik Mocy

**Status:** WIP. **Kategoria:** racial. **Maks. poziom:** 4. **Baza EXP:** 50. **Wymagania:** Kevru.

**Stary efekt:** WIP – rasa jeszcze niegrywalna.

**Nowy efekt:** WIP – rasa jeszcze niegrywalna.

**Problem, decyzja i uzasadnienie:** WIP. Brak pełnej mechaniki; zakup blokowany, wykluczony z normalnego wyboru talentów rasowych kreatora. Dwa wpisy Pamięci Krwi w różnych kategoriach pozostają jako oznaczone WIP; nie scalano samowolnie dokumentów świata.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 22. Czytanie/Pisanie

**Status:** OK — zasady zachowane. **Kategoria:** general. **Maks. poziom:** 1. **Baza EXP:** 50. **Wymagania:** Nauczyciel.

**Stary efekt:** Czytasz i piszesz w wybranym języku.

**Nowy efekt:** Czytasz i piszesz w wybranym języku.

**Problem, decyzja i uzasadnienie:** Zdolność fabularna. Nie przypisano arbitralnego zasięgu widzenia ani automatycznego uprawnienia do wszystkich języków.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/talent-balance.mjs`

## 23. Pierwsza Pomoc

**Status:** OK — zasady zachowane. **Kategoria:** general. **Maks. poziom:** 4. **Baza EXP:** 50. **Wymagania:** –.

**Stary efekt:** Raz na sesję na cel: zdejmujesz 1 stan i leczysz 1/2/3/4 rany wg Tieru.

**Nowy efekt:** Raz na sesję na cel: zdejmujesz 1 stan i leczysz 1/2/3/4 rany wg Tieru.

**Problem, decyzja i uzasadnienie:** Aktywacja i leczenie według Tieru, usunięcie stanu, limit sesyjny na cel zachowane. Nie mylić ze zwykłym bonusem do testu medycyny.

**Automatyzacja:** Przycisk i zasób/czas w ACTIVE_RULES; pozostałe części według uwag.

**Ślady w kodzie (nie dowód kompletności):** `module/automation-runtime.mjs`, `module/effects-engine.mjs`, `module/session-tools.mjs`

## 24. Medycyna Zaawansowana

**Status:** OK — zasady zachowane. **Kategoria:** general. **Maks. poziom:** 4. **Baza EXP:** 50. **Wymagania:** Pierwsza Pomoc T2.

**Stary efekt:** Ułatwienie diagnozy; T3: raz na sesję na cel usuwa Krwawienie lub Zatrucie akcją za 5 segmentów.

**Nowy efekt:** Ułatwienie diagnozy; T3: raz na sesję na cel usuwa Krwawienie lub Zatrucie akcją za 5 segmentów.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 25. Jeździectwo

**Status:** OK — zasady zachowane. **Kategoria:** general. **Maks. poziom:** 4. **Baza EXP:** 50. **Wymagania:** –.

**Stary efekt:** +10 do testu na Tier; od T3 egzotyczne wierzchowce.

**Nowy efekt:** +10 do testu na Tier; od T3 egzotyczne wierzchowce.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 26. Rzemieślnik (wybrany fach)

**Status:** OK — zasady zachowane. **Kategoria:** general. **Maks. poziom:** 4. **Baza EXP:** 50. **Wymagania:** Nauczyciel / historia.

**Stary efekt:** Tworzenie przedmiotów; z Tierami rośnie szansa i maleje zużycie materiałów.

**Nowy efekt:** Tworzenie przedmiotów; z Tierami rośnie szansa i maleje zużycie materiałów.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 27. Wiedza Wybrana

**Status:** OK — zasady zachowane. **Kategoria:** general. **Maks. poziom:** 4. **Baza EXP:** 50. **Wymagania:** –.

**Stary efekt:** +10 na Tier w wybranej dziedzinie, raz na Tier Ułatwienie.

**Nowy efekt:** +10 na Tier w wybranej dziedzinie, raz na Tier Ułatwienie.

**Problem, decyzja i uzasadnienie:** Opis obejmuje ograniczone użycia lub przerzut. Brak kompletnego dedykowanego licznika tej zdolności: liczy MG/gracz. Nie przeniesiono do grupy w pełni zautomatyzowanych aktywnych talentów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 28. Dyplomata

**Status:** OK — zasady zachowane. **Kategoria:** general. **Maks. poziom:** 4. **Baza EXP:** 50. **Wymagania:** –.

**Stary efekt:** +10 (T1–2) lub +20 (T3–4) do testów społecznych i Ułatwienie tyle razy na sesję, ile poziomów.

**Nowy efekt:** +10 (T1–2) lub +20 (T3–4) do testów społecznych i Ułatwienie tyle razy na sesję, ile poziomów.

**Problem, decyzja i uzasadnienie:** Opis obejmuje ograniczone użycia lub przerzut. Brak kompletnego dedykowanego licznika tej zdolności: liczy MG/gracz. Nie przeniesiono do grupy w pełni zautomatyzowanych aktywnych talentów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 29. Oburęczny

**Status:** OK — zasady zachowane. **Kategoria:** general. **Maks. poziom:** 4. **Baza EXP:** 50. **Wymagania:** –.

**Stary efekt:** T1 brak kar za 2 bronie; T2 druga broń −1 seg.; T3 −2 seg. i +10 trafienia; T4 +20.

**Nowy efekt:** T1 brak kar za 2 bronie; T2 druga broń −1 seg.; T3 −2 seg. i +10 trafienia; T4 +20.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 30. Heraldyka / Etykieta

**Status:** OK — zasady zachowane. **Kategoria:** general. **Maks. poziom:** 1. **Baza EXP:** 50. **Wymagania:** –.

**Stary efekt:** Ułatwienie w testach.

**Nowy efekt:** Ułatwienie w testach.

**Problem, decyzja i uzasadnienie:** Sytuacyjne Ułatwienie; wybór właściwego testu i okoliczności pozostaje ręczny. Nie przyznawać globalnego Ułatwienia wszystkim testom ani stałego bonusu progów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/talent-balance.mjs`

## 31. Żywotny

**Status:** OK — zasady zachowane. **Kategoria:** general. **Maks. poziom:** 4. **Baza EXP:** 50. **Wymagania:** –.

**Stary efekt:** +1/+2/+3/+4 do Żywotności.

**Nowy efekt:** +1/+2/+3/+4 do Żywotności.

**Problem, decyzja i uzasadnienie:** Automatyczne +1/+2/+3/+4 ŻYW, pochodne progi przeliczane; zachowany rebalance 0.9.6.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/data-models.mjs`

## 32. Nienaturalnie Odporny

**Status:** OK — zasady zachowane. **Kategoria:** general. **Maks. poziom:** 4. **Baza EXP:** 50. **Wymagania:** Tier 2.

**Stary efekt:** Przerzut testu odporności raz na sesję; T3 +10; T4 dwa przerzuty z +10.

**Nowy efekt:** Przerzut testu odporności raz na sesję; T3 +10; T4 dwa przerzuty z +10.

**Problem, decyzja i uzasadnienie:** Opis obejmuje ograniczone użycia lub przerzut. Brak kompletnego dedykowanego licznika tej zdolności: liczy MG/gracz. Nie przeniesiono do grupy w pełni zautomatyzowanych aktywnych talentów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 33. Odporny Fizycznie

**Status:** ZMIENIONY. **Kategoria:** general. **Maks. poziom:** 4. **Baza EXP:** 50. **Wymagania:** –.

**Stary efekt:** +5/+10/+15/+20 do Odporności Fizycznej.

**Nowy efekt:** +5/+10/+15/+20 do Odporności Fizycznej.

**Problem, decyzja i uzasadnienie:** ZMIENIONY (naprawa kodu, bez zmiany opisu). +5/+10/+15/+20 było dodawane po obliczeniu wynikowej odporności. Wspólny silnik stosuje premię do właściwej pełnej odporności przed wyliczeniem progów. +5 poprawia testy i może przekroczyć kolejną dziesiątkę; nie podniesiono go arbitralnie do +10.

**Automatyzacja:** Modyfikatory: physicalResistance.

**Ślady w kodzie (nie dowód kompletności):** `module/effects-engine.mjs`

## 34. Odporny Psychicznie

**Status:** ZMIENIONY. **Kategoria:** general. **Maks. poziom:** 4. **Baza EXP:** 50. **Wymagania:** –.

**Stary efekt:** +5/+10/+15/+20 do Odporności Psychicznej.

**Nowy efekt:** +5/+10/+15/+20 do Odporności Psychicznej.

**Problem, decyzja i uzasadnienie:** ZMIENIONY (naprawa kodu, bez zmiany opisu). +5/+10/+15/+20 było dodawane po obliczeniu wynikowej odporności. Wspólny silnik stosuje premię do właściwej pełnej odporności przed wyliczeniem progów. +5 poprawia testy i może przekroczyć kolejną dziesiątkę; nie podniesiono go arbitralnie do +10.

**Automatyzacja:** Modyfikatory: mentalResistance.

**Ślady w kodzie (nie dowód kompletności):** `module/effects-engine.mjs`

## 35. Odporny Magicznie

**Status:** ZMIENIONY. **Kategoria:** general. **Maks. poziom:** 4. **Baza EXP:** 50. **Wymagania:** –.

**Stary efekt:** +5/+10/+15/+20 do Odporności Magicznej.

**Nowy efekt:** +5/+10/+15/+20 do Odporności Magicznej.

**Problem, decyzja i uzasadnienie:** ZMIENIONY (naprawa kodu, bez zmiany opisu). +5/+10/+15/+20 było dodawane po obliczeniu wynikowej odporności. Wspólny silnik stosuje premię do właściwej pełnej odporności przed wyliczeniem progów. +5 poprawia testy i może przekroczyć kolejną dziesiątkę; nie podniesiono go arbitralnie do +10.

**Automatyzacja:** Modyfikatory: magicalResistance.

**Ślady w kodzie (nie dowód kompletności):** `module/effects-engine.mjs`

## 36. Odporny Duchowo

**Status:** ZMIENIONY. **Kategoria:** general. **Maks. poziom:** 4. **Baza EXP:** 50. **Wymagania:** –.

**Stary efekt:** +5/+10/+15/+20 do Odporności Duchowej.

**Nowy efekt:** +5/+10/+15/+20 do Odporności Duchowej.

**Problem, decyzja i uzasadnienie:** ZMIENIONY (naprawa kodu, bez zmiany opisu). +5/+10/+15/+20 było dodawane po obliczeniu wynikowej odporności. Wspólny silnik stosuje premię do właściwej pełnej odporności przed wyliczeniem progów. +5 poprawia testy i może przekroczyć kolejną dziesiątkę; nie podniesiono go arbitralnie do +10.

**Automatyzacja:** Modyfikatory: spiritualResistance.

**Ślady w kodzie (nie dowód kompletności):** `module/effects-engine.mjs`

## 37. Wnikliwość

**Status:** OK — zasady zachowane. **Kategoria:** general. **Maks. poziom:** 4. **Baza EXP:** 50. **Wymagania:** –.

**Stary efekt:** +5 do bazowej PER; T3 kolejne +5.

**Nowy efekt:** +5 do bazowej PER; T3 kolejne +5.

**Problem, decyzja i uzasadnienie:** Automatyczna premia +5 na T1 i kolejne +5 na T3 do właściwej cechy. Poziomy T2/T4 bez osobnej premii w skróconym opisie: pozostawiono dotychczasową progresję, nie dodano bonusów ani nowego kosztu.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/data-models.mjs`

## 38. Większa Muskulatura

**Status:** OK — zasady zachowane. **Kategoria:** general. **Maks. poziom:** 4. **Baza EXP:** 50. **Wymagania:** –.

**Stary efekt:** +5 do bazowej SF; T3 kolejne +5.

**Nowy efekt:** +5 do bazowej SF; T3 kolejne +5.

**Problem, decyzja i uzasadnienie:** Automatyczna premia +5 na T1 i kolejne +5 na T3 do właściwej cechy. Poziomy T2/T4 bez osobnej premii w skróconym opisie: pozostawiono dotychczasową progresję, nie dodano bonusów ani nowego kosztu.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/data-models.mjs`

## 39. Gibkość

**Status:** OK — zasady zachowane. **Kategoria:** general. **Maks. poziom:** 4. **Baza EXP:** 50. **Wymagania:** –.

**Stary efekt:** +5 do bazowej ZR; T3 kolejne +5.

**Nowy efekt:** +5 do bazowej ZR; T3 kolejne +5.

**Problem, decyzja i uzasadnienie:** Automatyczna premia +5 na T1 i kolejne +5 na T3 do właściwej cechy. Poziomy T2/T4 bez osobnej premii w skróconym opisie: pozostawiono dotychczasową progresję, nie dodano bonusów ani nowego kosztu.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/data-models.mjs`

## 40. Uczony

**Status:** OK — zasady zachowane. **Kategoria:** general. **Maks. poziom:** 4. **Baza EXP:** 50. **Wymagania:** –.

**Stary efekt:** +5 do bazowej ER; T3 kolejne +5.

**Nowy efekt:** +5 do bazowej ER; T3 kolejne +5.

**Problem, decyzja i uzasadnienie:** Automatyczna premia +5 na T1 i kolejne +5 na T3 do właściwej cechy. Poziomy T2/T4 bez osobnej premii w skróconym opisie: pozostawiono dotychczasową progresję, nie dodano bonusów ani nowego kosztu.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/data-models.mjs`

## 41. Większa Ogłada

**Status:** OK — zasady zachowane. **Kategoria:** general. **Maks. poziom:** 4. **Baza EXP:** 50. **Wymagania:** –.

**Stary efekt:** +5 do bazowej OG; T3 kolejne +5.

**Nowy efekt:** +5 do bazowej OG; T3 kolejne +5.

**Problem, decyzja i uzasadnienie:** Automatyczna premia +5 na T1 i kolejne +5 na T3 do właściwej cechy. Poziomy T2/T4 bez osobnej premii w skróconym opisie: pozostawiono dotychczasową progresję, nie dodano bonusów ani nowego kosztu.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/data-models.mjs`

## 42. Potencjał Magiczny

**Status:** OK — zasady zachowane. **Kategoria:** general. **Maks. poziom:** 4. **Baza EXP:** 50. **Wymagania:** Półmag T1.

**Stary efekt:** +5 do UM; T3 kolejne +5.

**Nowy efekt:** +5 do UM; T3 kolejne +5.

**Problem, decyzja i uzasadnienie:** Automatyczna premia +5 na T1 i kolejne +5 na T3 do właściwej cechy. Poziomy T2/T4 bez osobnej premii w skróconym opisie: pozostawiono dotychczasową progresję, nie dodano bonusów ani nowego kosztu.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/data-models.mjs`

## 43. Potencjał Duchowy

**Status:** OK — zasady zachowane. **Kategoria:** general. **Maks. poziom:** 4. **Baza EXP:** 50. **Wymagania:** Kapłan T1.

**Stary efekt:** +5 do WIA; T3 kolejne +5.

**Nowy efekt:** +5 do WIA; T3 kolejne +5.

**Problem, decyzja i uzasadnienie:** Automatyczna premia +5 na T1 i kolejne +5 na T3 do właściwej cechy. Poziomy T2/T4 bez osobnej premii w skróconym opisie: pozostawiono dotychczasową progresję, nie dodano bonusów ani nowego kosztu.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/data-models.mjs`

## 44. Odporność na Klimat

**Status:** OK — zasady zachowane. **Kategoria:** general. **Maks. poziom:** 4. **Baza EXP:** 50. **Wymagania:** –.

**Stary efekt:** T1 Ułatwienie odporności na zimno/gorąco; T2 ignorujesz kary.

**Nowy efekt:** T1 Ułatwienie odporności na zimno/gorąco; T2 ignorujesz kary.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 45. Mocne Płuca / Pływak / Wspinacz

**Status:** OK — zasady zachowane. **Kategoria:** general. **Maks. poziom:** 4. **Baza EXP:** 50. **Wymagania:** –.

**Stary efekt:** Oddech 2× dłużej; Ułatwienie pływania i wspinaczki; T3 pełna SZ w wodzie lub tańsza wspinaczka.

**Nowy efekt:** Oddech 2× dłużej; Ułatwienie pływania i wspinaczki; T3 pełna SZ w wodzie lub tańsza wspinaczka.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 46. Kowal własnego Losu

**Status:** OK — zasady zachowane. **Kategoria:** general. **Maks. poziom:** 1. **Baza EXP:** 50. **Wymagania:** –.

**Stary efekt:** 1 darmowy przerzut na sesję.

**Nowy efekt:** 1 darmowy przerzut na sesję.

**Problem, decyzja i uzasadnienie:** Opis obejmuje ograniczone użycia lub przerzut. Brak kompletnego dedykowanego licznika tej zdolności: liczy MG/gracz. Nie przeniesiono do grupy w pełni zautomatyzowanych aktywnych talentów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/talent-balance.mjs`

## 47. Naturalna Ochrona Trucizny

**Status:** OK — zasady zachowane. **Kategoria:** general. **Maks. poziom:** 4. **Baza EXP:** 50. **Wymagania:** –.

**Stary efekt:** T1 Ułatwienie przeciw Zatruciu; T4 odporność na słabe trucizny.

**Nowy efekt:** T1 Ułatwienie przeciw Zatruciu; T4 odporność na słabe trucizny.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 48. Niezmordowany

**Status:** OK — zasady zachowane. **Kategoria:** general. **Maks. poziom:** 4. **Baza EXP:** 50. **Wymagania:** –.

**Stary efekt:** T1 +5 Odp. Fiz. na zmęczenie; T3 ignorujesz karę pierwszego stopnia.

**Nowy efekt:** T1 +5 Odp. Fiz. na zmęczenie; T3 ignorujesz karę pierwszego stopnia.

**Problem, decyzja i uzasadnienie:** Sytuacyjne +5 Odp. Fiz. przeciw zmęczeniu jest aktywnym bonusem testu, nie stałą premią progów. T3 ignorowania pierwszego stopnia wymaga osobnego warunku; zachowano ręczne rozliczanie.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 49. Zwinność Akrobaty

**Status:** OK — zasady zachowane. **Kategoria:** general. **Maks. poziom:** 1. **Baza EXP:** 50. **Wymagania:** –.

**Stary efekt:** Ułatwienie testów równowagi.

**Nowy efekt:** Ułatwienie testów równowagi.

**Problem, decyzja i uzasadnienie:** Sytuacyjne Ułatwienie; wybór właściwego testu i okoliczności pozostaje ręczny. Nie przyznawać globalnego Ułatwienia wszystkim testom ani stałego bonusu progów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/talent-balance.mjs`

## 50. Otwieranie Zamków

**Status:** OK — zasady zachowane. **Kategoria:** general. **Maks. poziom:** 1. **Baza EXP:** 50. **Wymagania:** Tier 2.

**Stary efekt:** Ułatwienie testów zamków.

**Nowy efekt:** Ułatwienie testów zamków.

**Problem, decyzja i uzasadnienie:** Sytuacyjne Ułatwienie; wybór właściwego testu i okoliczności pozostaje ręczny. Nie przyznawać globalnego Ułatwienia wszystkim testom ani stałego bonusu progów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/talent-balance.mjs`

## 51. Rozbrajanie Pułapek

**Status:** OK — zasady zachowane. **Kategoria:** general. **Maks. poziom:** 1. **Baza EXP:** 50. **Wymagania:** –.

**Stary efekt:** Ułatwienie testów pułapek.

**Nowy efekt:** Ułatwienie testów pułapek.

**Problem, decyzja i uzasadnienie:** Sytuacyjne Ułatwienie; wybór właściwego testu i okoliczności pozostaje ręczny. Nie przyznawać globalnego Ułatwienia wszystkim testom ani stałego bonusu progów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/talent-balance.mjs`

## 52. Kartograf / Sztuka Rysunku / Poliglota

**Status:** OK — zasady zachowane. **Kategoria:** general. **Maks. poziom:** 4. **Baza EXP:** 50. **Wymagania:** Czytanie/Pisanie.

**Stary efekt:** Ułatwienia w mapach, rysunku i językach; T3 fałszerstwa, ukryte znaczenia, negocjacje.

**Nowy efekt:** Ułatwienia w mapach, rysunku i językach; T3 fałszerstwa, ukryte znaczenia, negocjacje.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 53. Sztuka Kulinarna / Zielarstwo

**Status:** OK — zasady zachowane. **Kategoria:** general. **Maks. poziom:** 4. **Baza EXP:** 50. **Wymagania:** –.

**Stary efekt:** Ułatwienia; T3 posiłek daje +1 tymczasowej ŻYW, mikstura leczy 1 ranę.

**Nowy efekt:** Ułatwienia; T3 posiłek daje +1 tymczasowej ŻYW, mikstura leczy 1 ranę.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 54. Opanowanie Instrumentu / Uzdolnienie Artystyczne / Znawca Bestii

**Status:** OK — zasady zachowane. **Kategoria:** general. **Maks. poziom:** 4. **Baza EXP:** 50. **Wymagania:** Instrument: Większa Ogłada T1.

**Stary efekt:** Ułatwienia w występach i oswajaniu; T3 muzyka może dać Ułatwienie lub +5.

**Nowy efekt:** Ułatwienia w występach i oswajaniu; T3 muzyka może dać Ułatwienie lub +5.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 55. Strateg

**Status:** OK — zasady zachowane. **Kategoria:** general. **Maks. poziom:** 4. **Baza EXP:** 50. **Wymagania:** Uczony T1.

**Stary efekt:** Ułatwienie taktyki; T3: 5 seg. daje sojusznikowi +1 segment w następnej rundzie.

**Nowy efekt:** Ułatwienie taktyki; T3: 5 seg. daje sojusznikowi +1 segment w następnej rundzie.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 56. Znawca Rynku

**Status:** OK — zasady zachowane. **Kategoria:** general. **Maks. poziom:** 4. **Baza EXP:** 50. **Wymagania:** –.

**Stary efekt:** +10 T1 / +30 T3 do wyceny; Ułatwienie handlu.

**Nowy efekt:** +10 T1 / +30 T3 do wyceny; Ułatwienie handlu.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 57. Łamacz Zbroi

**Status:** OK — zasady zachowane. **Kategoria:** general. **Maks. poziom:** 4. **Baza EXP:** 50. **Wymagania:** Tier 2.

**Stary efekt:** Broń dwuręczna dostaje Penetrację 1 (T2), 2 (T3), T4 Ułatwienie przeciw ciężkiej zbroi.

**Nowy efekt:** Broń dwuręczna dostaje Penetrację 1 (T2), 2 (T3), T4 Ułatwienie przeciw ciężkiej zbroi.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 58. Celny Cios

**Status:** ZMIENIONY. **Kategoria:** general. **Maks. poziom:** 4. **Baza EXP:** 50. **Wymagania:** –.

**Stary efekt:** +5/+10/+15/+20 do trafienia w zwarciu.

**Nowy efekt:** +5/+10/+15/+20 do trafienia w zwarciu.

**Problem, decyzja i uzasadnienie:** ZMIENIONY (naprawa kodu). Opis i premia na karcie +5/+10/+15/+20 pozostają; rzeczywisty atak wręcz wcześniej pomijał tę premię. Wspólny modyfikator hit stosuje ją raz, wyłącznie w zwarciu. Testy obejmują każdy poziom oraz brak premii dystansowej.

**Automatyzacja:** Modyfikatory: hit.

**Ślady w kodzie (nie dowód kompletności):** `module/data-models.mjs`, `module/effects-engine.mjs`

## 59. Szybki

**Status:** OK — zasady zachowane. **Kategoria:** general. **Maks. poziom:** 4. **Baza EXP:** 50. **Wymagania:** –.

**Stary efekt:** +5/+10/+15/+20 do Obrony.

**Nowy efekt:** +5/+10/+15/+20 do Obrony.

**Problem, decyzja i uzasadnienie:** Automatyczne +5/+10/+15/+20 Obrony. Nazwa nie oznacza premii SZ; nie zmieniono balansu.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/ability-builder-rules.mjs`, `module/ability-builder.mjs`, `module/canon-mechanics.mjs`, `module/canon-names.mjs`, `module/data-models.mjs`

## 60. Umiejętności Magiczne

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Półmag.

**Stary efekt:** Rzucanie i tworzenie zaklęć o koszcie 5/10/15/20.

**Nowy efekt:** Rzucanie i tworzenie zaklęć o koszcie 5/10/15/20.

**Problem, decyzja i uzasadnienie:** Kreator sprawdza dostęp i limity 5/10/15/20. Nie wszystkie opisowe bonusy bóstw mają pełną automatyzację; szczegóły przy konkretnych talentach.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/canonical-rules.mjs`

## 61. Biegłość Magiczna

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Półmag.

**Stary efekt:** T1 brak kary za księgi i zwoje; T2–T4 −1/−2/−3 OP czarów, brak gestów T3, brak słów T4.

**Nowy efekt:** T1 brak kary za księgi i zwoje; T2–T4 −1/−2/−3 OP czarów, brak gestów T3, brak słów T4.

**Problem, decyzja i uzasadnienie:** Zniżki OP czarów/księgi automatyczne, twarde minima OP zachowane. Brak gestów/słów to warunki deklaracji/fabuły, nie nowy bonus liczbowy.

**Automatyzacja:** Modyfikatory: spellDelay, bookDelay.

**Ślady w kodzie (nie dowód kompletności):** `module/data-models.mjs`, `module/documents.mjs`, `module/effects-engine.mjs`

## 62. Pamięć Maga

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Półmag.

**Stary efekt:** Zapamiętujesz 1/2/3/4 zaklęcia więcej.

**Nowy efekt:** Zapamiętujesz 1/2/3/4 zaklęcia więcej.

**Problem, decyzja i uzasadnienie:** Automatyczna liczba slotów/darmowy koszt zgodnie z opisem i limitami kreatora. Zachowano zwiększone limity Specjalnego Manewru.

**Automatyzacja:** Modyfikatory: mageSlots.

**Ślady w kodzie (nie dowód kompletności):** `module/effects-engine.mjs`

## 63. Modlitwa

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan.

**Stary efekt:** Cuda i błogosławieństwa o koszcie 5/10/15/20; bonusy od bóstwa; bez Ryzyk.

**Nowy efekt:** Cuda i błogosławieństwa o koszcie 5/10/15/20; bonusy od bóstwa; bez Ryzyk.

**Problem, decyzja i uzasadnienie:** Kreator sprawdza dostęp i limity 5/10/15/20. Nie wszystkie opisowe bonusy bóstw mają pełną automatyzację; szczegóły przy konkretnych talentach.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/canonical-rules.mjs`

## 64. Ulubione zaklęcie / cud

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Mag / Kapłan.

**Stary efekt:** Jedno zaklęcie/cud z dodatkowymi efektami 2/3/4/5 kosztu bez dodatkowego OP.

**Nowy efekt:** Jedno zaklęcie/cud z dodatkowymi efektami 2/3/4/5 kosztu bez dodatkowego OP.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 65. Nasycenie Źródła Mocy

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Półmag / Kapłan.

**Stary efekt:** Zaklinasz zwykłe przedmioty na źródła mocy i ulepszasz ich umagicznienie.

**Nowy efekt:** Zaklinasz zwykłe przedmioty na źródła mocy i ulepszasz ich umagicznienie.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 66. Mistrzostwo Aury

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Półmag / Kapłan.

**Stary efekt:** +2/+3/+4/+5 punktów maksymalnej Aury.

**Nowy efekt:** +2/+3/+4/+5 punktów maksymalnej Aury.

**Problem, decyzja i uzasadnienie:** Automatyczne +2/+3/+4/+5 maks. Aury; bez zmiany kosztu aspektów ani twardych minimów OP.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/data-models.mjs`

## 67. Osłona Koncentracji

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Półmag / Kapłan T2.

**Stary efekt:** T2: 2 Aury dla +10 Obrony przeciw pojedynczemu atakowi; T3–T4 ochrona przed przerwaniem czaru.

**Nowy efekt:** T2: 2 Aury dla +10 Obrony przeciw pojedynczemu atakowi; T3–T4 ochrona przed przerwaniem czaru.

**Problem, decyzja i uzasadnienie:** Talenty reakcji wymagają osobnego kontekstu. Sprawdzony rdzeń deklaracji przed k100 pozostaje; dostępne akcje okna wynikają z defense-declarations/defense-rules. Sam opis nie oznacza pełnej automatyzacji wszystkich dodatkowych korzyści i kosztów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/canonical-rules.mjs`

## 68. Magiczne Powidoki

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Półmag.

**Stary efekt:** Bonus 2k10–5k10 z poprzedniego czaru tej samej szkoły.

**Nowy efekt:** Bonus 2k10–5k10 z poprzedniego czaru tej samej szkoły.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 69. Energia Krwi

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Półmag / Kapłan Kardy.

**Stary efekt:** Zadajesz sobie ranę, aby zyskać 2–5 punktów kosztu aspektów.

**Nowy efekt:** Zadajesz sobie ranę, aby zyskać 2–5 punktów kosztu aspektów.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 70. Święte Dłonie

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan.

**Stary efekt:** Leczysz 1/2/3/4 rany więcej przy leczeniu akcją.

**Nowy efekt:** Leczysz 1/2/3/4 rany więcej przy leczeniu akcją.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 71. Doświadczenie Magiczne / Kapłańskie

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Półmag / Kapłan.

**Stary efekt:** 1/1/2/2 przerzuty testu rzucania czaru lub cudu na walkę (T1/T2/T3/T4).

**Nowy efekt:** 1/1/2/2 przerzuty testu rzucania czaru lub cudu na walkę (T1/T2/T3/T4).

**Problem, decyzja i uzasadnienie:** Automatyczne 1/1/2/2 przerzuty na walkę odpowiedniego ostatniego testu. Zachowano ograniczenie kontekstu i brak ponownego kosztu akcji.

**Automatyzacja:** Przycisk i zasób/czas w ACTIVE_RULES; pozostałe części według uwag.

**Ślady w kodzie (nie dowód kompletności):** `module/effects-engine.mjs`

## 72. Walka Wręcz

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Wojownik / Łowca / Bestia.

**Stary efekt:** Własne manewry i sekwencje.

**Nowy efekt:** Własne manewry i sekwencje.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/automation-rules.mjs`, `module/documents.mjs`

## 73. Mistrz Sekwencji

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Walka Wręcz.

**Stary efekt:** Zniżka OP następnego manewru po sekwencji i dodatkowe kości bonusu.

**Nowy efekt:** Zniżka OP następnego manewru po sekwencji i dodatkowe kości bonusu.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 74. Żelazne Natarcie

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Wojownik T3.

**Stary efekt:** Ułatwienie odporności na Powalenie/Pchnięcie w sekwencji.

**Nowy efekt:** Ułatwienie odporności na Powalenie/Pchnięcie w sekwencji.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 75. Kontrolowana Sekwencja

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Łowca T3.

**Stary efekt:** T3: jeden manewr Sekwencji, poza pierwszym, ignoruje karę −30 za celowanie w lokację. T4: ostatni, czwarty manewr pełnej Sekwencji ignoruje Pancerz ALBO zadaje +1 Ranę.

**Nowy efekt:** T3: jeden manewr Sekwencji, poza pierwszym, ignoruje karę −30 za celowanie w lokację. T4: ostatni, czwarty manewr pełnej Sekwencji ignoruje Pancerz ALBO zadaje +1 Ranę.

**Problem, decyzja i uzasadnienie:** Zachowane T3 jedno pominięcie kary celowania poza pierwszym manewrem, T4 czwarty manewr pełnej sekwencji. System sprawdza porządek i alternatywę Pancerz/Rana.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/canon-mechanics.mjs`, `module/canon-migration.mjs`, `module/sheets.mjs`

## 76. Specjalny Manewr

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Wojownik / Łowca.

**Stary efekt:** Dodatkowy manewr poza slotami z darmowym kosztem 2/3/4/5 i zwiększonymi limitami.

**Nowy efekt:** Dodatkowy manewr poza slotami z darmowym kosztem 2/3/4/5 i zwiększonymi limitami.

**Problem, decyzja i uzasadnienie:** Automatyczna liczba slotów/darmowy koszt zgodnie z opisem i limitami kreatora. Zachowano zwiększone limity Specjalnego Manewru.

**Automatyzacja:** Modyfikatory: maneuverFreeStars, maneuverSlots.

**Ślady w kodzie (nie dowód kompletności):** `module/ability-automation.mjs`, `module/ability-builder.mjs`, `module/automation-rules.mjs`, `module/canonical-rules.mjs`, `module/effects-engine.mjs`

## 77. Mocny Cios

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Wojownik / Łowca / Bestia.

**Stary efekt:** Do ataków wręcz dodajesz cyfrę dziesiątek SF.

**Nowy efekt:** Do ataków wręcz dodajesz cyfrę dziesiątek SF.

**Problem, decyzja i uzasadnienie:** Automatyczny dodatek dziesiątek właściwej cechy do obrażeń odpowiedniego typu ataku. Nie jest odpornością i pozostaje. Opis nie definiuje nowych efektów dla kolejnych zakupów; nie wymyślono skalowania.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/data-models.mjs`

## 78. Precyzyjny Strzał

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Wojownik / Łowca.

**Stary efekt:** Do ataków zasięgowych dodajesz cyfrę dziesiątek PER.

**Nowy efekt:** Do ataków zasięgowych dodajesz cyfrę dziesiątek PER.

**Problem, decyzja i uzasadnienie:** Automatyczny dodatek dziesiątek właściwej cechy do obrażeń odpowiedniego typu ataku. Nie jest odpornością i pozostaje. Opis nie definiuje nowych efektów dla kolejnych zakupów; nie wymyślono skalowania.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/data-models.mjs`

## 79. Mistrz Broni

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** –.

**Stary efekt:** +10 do trafienia z 1/2/3/4 wybranych rodzajów broni (liczba rodzajów rośnie z poziomem talentu).

**Nowy efekt:** +10 do trafienia z 1/2/3/4 wybranych rodzajów broni (liczba rodzajów rośnie z poziomem talentu).

**Problem, decyzja i uzasadnienie:** Zachowano +10 do wybranych 1/2/3/4 typów broni. Brak kompletnego selektora specjalizacji i automatycznego warunku rodzaju broni: premię uwzględnia MG/gracz przy teście. Nie zamieniono na globalne +10.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 80. Szkolenie Oręża

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Wojownik.

**Stary efekt:** Przy sukcesie z bonusem lub krytyku otrzymujesz +1 dodatkowy punkt bonusu za każdy poziom talentu. Krytyk nie podwaja bonusu z tego talentu.

**Nowy efekt:** Przy sukcesie z bonusem lub krytyku otrzymujesz +1 dodatkowy punkt bonusu za każdy poziom talentu. Krytyk nie podwaja bonusu z tego talentu.

**Problem, decyzja i uzasadnienie:** Automatyczne +poziom punktów tylko przy bonusie/krytyku. Krytyk nie podwaja premii talentu.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/documents.mjs`

## 81. Wojak

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Wojownik T3.

**Stary efekt:** Pierwszy wybrany bonus w ataku kosztuje o 1 mniej.

**Nowy efekt:** Pierwszy wybrany bonus w ataku kosztuje o 1 mniej.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/canon-names.mjs`, `module/effects-engine.mjs`

## 82. Śmiertelny Cios

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Wojownik / Łowca / Bestia T2.

**Stary efekt:** Dodatkowe +10 do LW; jakość trafienia jest już uwzględniona w bazowej formule.

**Nowy efekt:** Dodatkowe +10 do LW; jakość trafienia jest już uwzględniona w bazowej formule.

**Problem, decyzja i uzasadnienie:** Automatyczne +10 LW; nie dolicza jakości trafienia drugi raz.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/canon-migration.mjs`, `module/documents.mjs`

## 83. Doświadczony Wojak / Doświadczenie Strzelca

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Wojownik / Łowca.

**Stary efekt:** 1/1/2/2 przerzuty trafienia w zwarciu / z dystansu na walkę (T1/T2/T3/T4).

**Nowy efekt:** 1/1/2/2 przerzuty trafienia w zwarciu / z dystansu na walkę (T1/T2/T3/T4).

**Problem, decyzja i uzasadnienie:** Automatyczne 1/1/2/2 przerzuty na walkę odpowiedniego ostatniego testu. Zachowano ograniczenie kontekstu i brak ponownego kosztu akcji.

**Automatyzacja:** Przycisk i zasób/czas w ACTIVE_RULES; pozostałe części według uwag.

**Ślady w kodzie (nie dowód kompletności):** `module/canon-names.mjs`, `module/effects-engine.mjs`

## 84. Szybki Refleks

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Wojownik / Łowca.

**Stary efekt:** Możesz mieć w turze Unik i Parowanie jako dwie reakcje na różne rzeczy.

**Nowy efekt:** Możesz mieć w turze Unik i Parowanie jako dwie reakcje na różne rzeczy.

**Problem, decyzja i uzasadnienie:** Talenty reakcji wymagają osobnego kontekstu. Sprawdzony rdzeń deklaracji przed k100 pozostaje; dostępne akcje okna wynikają z defense-declarations/defense-rules. Sam opis nie oznacza pełnej automatyzacji wszystkich dodatkowych korzyści i kosztów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 85. Szybka Wymiana

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Wojownik T2 / Łowca T2.

**Stary efekt:** Wymiana broni jako reakcja za 3.

**Nowy efekt:** Wymiana broni jako reakcja za 3.

**Problem, decyzja i uzasadnienie:** Talenty reakcji wymagają osobnego kontekstu. Sprawdzony rdzeń deklaracji przed k100 pozostaje; dostępne akcje okna wynikają z defense-declarations/defense-rules. Sam opis nie oznacza pełnej automatyzacji wszystkich dodatkowych korzyści i kosztów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 86. Rozmach Olbrzyma

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Wojownik.

**Stary efekt:** Tańszy Zamaszysty z bronią dwuręczną; więcej celów; pełne obrażenia w kolejne cele.

**Nowy efekt:** Tańszy Zamaszysty z bronią dwuręczną; więcej celów; pełne obrażenia w kolejne cele.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 87. Nieustępliwe Uderzenie

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Wojownik T2.

**Stary efekt:** Bonusy dla broni dwuręcznej przeciw Powalonym i po sukcesie manewru.

**Nowy efekt:** Bonusy dla broni dwuręcznej przeciw Powalonym i po sukcesie manewru.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 88. Mistrz Parowania

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Wojownik / Łowca.

**Stary efekt:** +5/+10/+15/+20 do parowania.

**Nowy efekt:** +5/+10/+15/+20 do parowania.

**Problem, decyzja i uzasadnienie:** Premia +5/+10/+15/+20 do właściwej reakcji; obrona deklarowana przed ujawnieniem k100 ataku.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/documents.mjs`

## 89. Mistrz Tarczy

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Wojownik.

**Stary efekt:** T1: 2 lokacje tarczy; T2: 3; T3–T4: 4. T4: zakres ignorowanych niskich wyników tarczy +1 wyłącznie na chronionej lokacji. Bez zmiany bazowego Pancerza.

**Nowy efekt:** T1: 2 lokacje tarczy; T2: 3; T3–T4: 4. T4: zakres ignorowanych niskich wyników tarczy +1 wyłącznie na chronionej lokacji. Bez zmiany bazowego Pancerza.

**Problem, decyzja i uzasadnienie:** Automatyczne lokacje 2/3/4/4 i T4 +1 ignorowanego niskiego wyniku tylko w chronionej lokacji. Nie zwiększa Pancerza.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/armor-rules.mjs`, `module/canon-migration.mjs`

## 90. Mistrz Bloku

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Wojownik.

**Stary efekt:** +5/+10/+15/+20 do bloku tarczą.

**Nowy efekt:** +5/+10/+15/+20 do bloku tarczą.

**Problem, decyzja i uzasadnienie:** Talenty reakcji wymagają osobnego kontekstu. Sprawdzony rdzeń deklaracji przed k100 pozostaje; dostępne akcje okna wynikają z defense-declarations/defense-rules. Sam opis nie oznacza pełnej automatyzacji wszystkich dodatkowych korzyści i kosztów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 91. Garda Weterana

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Wojownik T1.

**Stary efekt:** Zmiana lokacji tarczy, silniejszy Unik, tańszy atak po Uniku/Parowaniu.

**Nowy efekt:** Zmiana lokacji tarczy, silniejszy Unik, tańszy atak po Uniku/Parowaniu.

**Problem, decyzja i uzasadnienie:** Talenty reakcji wymagają osobnego kontekstu. Sprawdzony rdzeń deklaracji przed k100 pozostaje; dostępne akcje okna wynikają z defense-declarations/defense-rules. Sam opis nie oznacza pełnej automatyzacji wszystkich dodatkowych korzyści i kosztów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/canon-names.mjs`

## 92. Uderzenie Tarczą

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Wojownik T2.

**Stary efekt:** Darmowy manewr ogłuszający tarczą; 5 seg. potem taniej.

**Nowy efekt:** Darmowy manewr ogłuszający tarczą; 5 seg. potem taniej.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 93. Szybkie Przeładowanie

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Łowca.

**Stary efekt:** −1/−2/−3/−4 do przeładowania; koszt przeładowania nigdy nie spada poniżej 1 segmentu, chyba że efekt mówi wprost inaczej.

**Nowy efekt:** −1/−2/−3/−4 do przeładowania; koszt przeładowania nigdy nie spada poniżej 1 segmentu, chyba że efekt mówi wprost inaczej.

**Problem, decyzja i uzasadnienie:** Automatycznie −1/−2/−3/−4, minimum 1 segment zgodnie z wyjątkiem przeładowania; Przyspieszenie nie narusza minimum.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/canon-mechanics.mjs`

## 94. Przycelowanie

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Wojownik / Łowca.

**Stary efekt:** Wydajesz segmenty: +5 trafienia za segment (max 4), +1k10 za każde +10.

**Nowy efekt:** Wydajesz segmenty: +5 trafienia za segment (max 4), +1k10 za każde +10.

**Problem, decyzja i uzasadnienie:** Automatyczny koszt segmentów, premia trafienia i kości Przycelowania. Sokole Oko zastępuje stawkę, nie sumuje drugiej premii.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/canon-mechanics.mjs`, `module/sheets.mjs`

## 95. Sokole Oko

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Łowca T3 + Przycelowanie.

**Stary efekt:** Przycelowanie: +15 trafienia/segment zamiast +5. Pierwsze 2 segmenty dają +2k10; kolejne pełne 2 dają +1k10.

**Nowy efekt:** Przycelowanie: +15 trafienia/segment zamiast +5. Pierwsze 2 segmenty dają +2k10; kolejne pełne 2 dają +1k10.

**Problem, decyzja i uzasadnienie:** Automatyczny koszt segmentów, premia trafienia i kości Przycelowania. Sokole Oko zastępuje stawkę, nie sumuje drugiej premii.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/canon-mechanics.mjs`, `module/canon-migration.mjs`

## 96. Celny Strzał

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Sokole Oko.

**Stary efekt:** Mniejsza kara za celowanie w lokację, do 6 przyszłych segmentów.

**Nowy efekt:** Mniejsza kara za celowanie w lokację, do 6 przyszłych segmentów.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 97. Wielostrzał

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Łowca T3.

**Stary efekt:** T3: 2 strzały naraz w jeden cel; T4: 3. Każda dodatkowa strzała dodaje połowę bazowego OP przeładowania.

**Nowy efekt:** T3: 2 strzały naraz w jeden cel; T4: 3. Każda dodatkowa strzała dodaje połowę bazowego OP przeładowania.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/canon-actions.mjs`, `module/canon-mechanics.mjs`, `module/canon-migration.mjs`, `module/canon-names.mjs`, `module/documents.mjs`

## 98. Grad Strzał

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Łowca.

**Stary efekt:** Jeden rzut na trafienie w 2–3 cele lub obszar 5 m.

**Nowy efekt:** Jeden rzut na trafienie w 2–3 cele lub obszar 5 m.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 99. Taktyczny Wybór

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Łowca.

**Stary efekt:** Bonusy z dystansu i ukrycia oraz utrudnienie ataków dystansowych na Ciebie.

**Nowy efekt:** Bonusy z dystansu i ukrycia oraz utrudnienie ataków dystansowych na Ciebie.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 100. Błyskawiczne Otwarcie

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Łowca T2.

**Stary efekt:** Jedna akcja w rundzie kosztuje o 3 mniej (min. 2).

**Nowy efekt:** Jedna akcja w rundzie kosztuje o 3 mniej (min. 2).

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/canon-names.mjs`

## 101. Akrobatyczny Unik

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Łowca.

**Stary efekt:** Do bonusu z Uniku dodajesz cyfrę dziesiątek ZR.

**Nowy efekt:** Do bonusu z Uniku dodajesz cyfrę dziesiątek ZR.

**Problem, decyzja i uzasadnienie:** Talenty reakcji wymagają osobnego kontekstu. Sprawdzony rdzeń deklaracji przed k100 pozostaje; dostępne akcje okna wynikają z defense-declarations/defense-rules. Sam opis nie oznacza pełnej automatyzacji wszystkich dodatkowych korzyści i kosztów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/canon-names.mjs`, `module/defense-declarations.mjs`

## 102. Przygotowany Atak

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Łowca.

**Stary efekt:** Atak z zaskoczenia: Penetracja, Ułatwienie, dodatkowa Rana.

**Nowy efekt:** Atak z zaskoczenia: Penetracja, Ułatwienie, dodatkowa Rana.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 103. Ruch Cienia

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Łowca T2.

**Stary efekt:** 2 m ruchu po ataku, tańszy Unik w lekkiej zbroi, cięcie kosztu pierwszej akcji.

**Nowy efekt:** 2 m ruchu po ataku, tańszy Unik w lekkiej zbroi, cięcie kosztu pierwszej akcji.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 104. Mistrz Ukrywania / Cichy Ruch

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Łowca.

**Stary efekt:** Ułatwienia w skradaniu i ukrywaniu przedmiotów.

**Nowy efekt:** Ułatwienia w skradaniu i ukrywaniu przedmiotów.

**Problem, decyzja i uzasadnienie:** Sytuacyjne Ułatwienie; wybór właściwego testu i okoliczności pozostaje ręczny. Nie przyznawać globalnego Ułatwienia wszystkim testom ani stałego bonusu progów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 105. Blokada Aury

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Bestia.

**Stary efekt:** Aura zablokowana bez zbroi; 1/5 max Aury konwertuje się na bonus do progu (5 Aury = +1).

**Nowy efekt:** Aura zablokowana bez zbroi; 1/5 max Aury konwertuje się na bonus do progu (5 Aury = +1).

**Problem, decyzja i uzasadnienie:** Zachowane blokowanie Aury i przeliczenie 5 maks. Aury→+1 progu. To inny bonus niż dziesiątki odporności; Hybryda go nie podwaja. Warunki postaci/przemiany jak w bazie.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/canonical-rules.mjs`, `module/creator.mjs`, `module/data-models.mjs`

## 106. Zwierzęcy Szał

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Bestia.

**Stary efekt:** Ułatwienie Twoich ataków i ataków na Ciebie; także po przekroczeniu połowy max Ran.

**Nowy efekt:** Ułatwienie Twoich ataków i ataków na Ciebie; także po przekroczeniu połowy max Ran.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/creator.mjs`

## 107. Szybka Regeneracja

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Bestia.

**Stary efekt:** Raz na walkę, T4 dwa razy: leczysz 1/2/3/4 Rany lub zdejmujesz stan.

**Nowy efekt:** Raz na walkę, T4 dwa razy: leczysz 1/2/3/4 Rany lub zdejmujesz stan.

**Problem, decyzja i uzasadnienie:** Leczenie 1/2/3/4 Ran lub stan, 1/1/1/2 użycia na walkę, automatyczny licznik i reset.

**Automatyzacja:** Przycisk i zasób/czas w ACTIVE_RULES; pozostałe części według uwag.

**Ślady w kodzie (nie dowód kompletności):** `module/effects-engine.mjs`

## 108. Pazury i Kły

**Status:** OK — zasady zachowane. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Bestia.

**Stary efekt:** Pazury jako broń; +1k10 i +1 Penetracji bez broni, rośnie z Tierem.

**Nowy efekt:** Pazury jako broń; +1k10 i +1 Penetracji bez broni, rośnie z Tierem.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/creator.mjs`

## 109. Naturalna Obrona

**Status:** ZMIENIONY. **Kategoria:** archetype. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Bestia.

**Stary efekt:** Próg Obrażeń +1 do +3 oraz redukcja fizyczna +2 do +6 wg Tieru.

**Nowy efekt:** T1/T2/T3/T4: łącznie +1/+2/+3/+4 do Fizycznego Progu I i II. T4: raz na rundę Ułatwienie do jednego testu Odporności Fizycznej przeciw stanowi wywołanemu otrzymanym trafieniem. Nie odejmuje obrażeń.

**Problem, decyzja i uzasadnienie:** ZMIENIONY. Zamiast uniwersalnego +1/+2/+3/+3 i płaskiej redukcji 2×poziom: +1/+2/+3/+4 tylko do Fizycznych Progów. T4: osobny licznik raz na rundę i test pełnej Odporności z Ułatwieniem, deklarowany przed rzutem przeciw stanowi z otrzymanego trafienia. Anulowanie/błąd oddaje użycie. Wymaga rozpoczętej walki do liczenia rund.

**Automatyzacja:** Przycisk i zasób/czas w ACTIVE_RULES; pozostałe części według uwag.

**Ślady w kodzie (nie dowód kompletności):** `module/automation-runtime.mjs`, `module/creator.mjs`, `module/data-models.mjs`, `module/effects-engine.mjs`, `module/spell-quality.mjs`

## 110. Szkolenie Mnicha

**Status:** OK — zasady zachowane. **Kategoria:** special. **Maks. poziom:** 2. **Baza EXP:** 100. **Wymagania:** Kapłan – Ścieżka Ojczulek / Księżyna.

**Stary efekt:** Talent specjalny, 2 poziomy. T1: ręce i nogi liczą się jak broń, otrzymujesz Walka Wręcz, +20 BGŁ i +1k10 przy walce bez broni; otwierasz most do talentów Wojownika/Łowcy do połowy Tieru Kapłana (zaokrąglonej w górę). T2: łącznie +30 BGŁ, +10 Obrony i +1 SZ.

**Nowy efekt:** Talent specjalny, 2 poziomy. T1: ręce i nogi liczą się jak broń, otrzymujesz Walka Wręcz, +20 BGŁ i +1k10 przy walce bez broni; otwierasz most do talentów Wojownika/Łowcy do połowy Tieru Kapłana (zaokrąglonej w górę). T2: łącznie +30 BGŁ, +10 Obrony i +1 SZ.

**Problem, decyzja i uzasadnienie:** Zachowano 2 poziomy, ograniczenie Ojczulek / Księżyna, Walka Wręcz i most Wojownik/Łowca do połowy Tieru w górę. Model ma bonus BGŁ ogólny, podczas gdy T1 opisuje walkę bez broni: wykryta starsza rozbieżność do osobnej korekty, bez nowej zmiany balansu w tej paczce.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/automation-rules.mjs`, `module/data-models.mjs`, `module/documents.mjs`, `module/talent-balance.mjs`, `module/talent-eligibility.mjs`

## 111. Duchowa Pięść

**Status:** OK — zasady zachowane. **Kategoria:** special. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Ojczulek / Księżyna + Walka Wręcz.

**Stary efekt:** Kontrola Aury, obrażenia żywiołem, płacenie Aurą kosztu manewrów, Penetracja 1 bez broni.

**Nowy efekt:** Kontrola Aury, obrażenia żywiołem, płacenie Aurą kosztu manewrów, Penetracja 1 bez broni.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/automation-rules.mjs`, `module/canonical-rules.mjs`, `module/talent-eligibility.mjs`

## 112. Magiczne Manewry

**Status:** OK — zasady zachowane. **Kategoria:** special. **Maks. poziom:** 1. **Baza EXP:** 100. **Wymagania:** Wojownik/Łowca T2 + Półmag/Kapłan T1.

**Stary efekt:** Łączysz manewr z zaklęciem lub cudem.

**Nowy efekt:** Łączysz manewr z zaklęciem lub cudem.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/talent-balance.mjs`

## 113. Runotwórstwo

**Status:** OK — zasady zachowane. **Kategoria:** special. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Znawca Run lub nauczyciel.

**Stary efekt:** Test: ceil((WIA + ZR + UM + SF) / 4) + 10 × poziom Runotwórstwa + 10 za odpowiednie Rzemiosło.

**Nowy efekt:** Test: ceil((WIA + ZR + UM + SF) / 4) + 10 × poziom Runotwórstwa + 10 za odpowiednie Rzemiosło.

**Problem, decyzja i uzasadnienie:** Zachowana pełna formuła testu i konsekwencje wszczepiania. Porażka runy w ciele zadaje koszt runy w bezpośrednich Ranach; nie przez pancerz, Aurę ani progi. Przedmioty mają osobne konsekwencje.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/canon-actions.mjs`, `module/canon-mechanics.mjs`, `module/canon-migration.mjs`

## 114. Mistrz Run

**Status:** OK — zasady zachowane. **Kategoria:** special. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Znawca Run T3.

**Stary efekt:** +5 do wszystkich odporności za każdy koszt runy w ciele.

**Nowy efekt:** +5 do wszystkich odporności za każdy koszt runy w ciele.

**Problem, decyzja i uzasadnienie:** Automatyczne +5 pełnych czterech odporności za punkt kosztu run w ciele; dziesiątki wpływają na właściwe progi. Koszt ciała nadal obniża ŻYW i rozszerza CF UM zgodnie z wcześniejszą zatwierdzoną regułą. Żadnej płaskiej redukcji.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/canon-mechanics.mjs`, `module/canon-migration.mjs`, `module/talent-eligibility.mjs`

## 115. Chwyt Tytana

**Status:** OK — zasady zachowane. **Kategoria:** special. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** SF 40/50/60 dla T2/T3/T4.

**Stary efekt:** Dwie podstawowe bronie zamiast lekkich, potem dwie ciężkie.

**Nowy efekt:** Dwie podstawowe bronie zamiast lekkich, potem dwie ciężkie.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/automation-rules.mjs`

## 116. Krok Widma

**Status:** OK — zasady zachowane. **Kategoria:** special. **Maks. poziom:** 1. **Baza EXP:** 100. **Wymagania:** Półmag T1 + Łowca T1.

**Stary efekt:** Raz na walkę test na niewidzialność do końca tury lub do ataku.

**Nowy efekt:** Raz na walkę test na niewidzialność do końca tury lub do ataku.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/canon-names.mjs`, `module/talent-balance.mjs`

## 117. Przeczucie Przyszłości

**Status:** OK — zasady zachowane. **Kategoria:** special. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Półmag czasu / Kapłan Zolana.

**Stary efekt:** Zapisujesz 1/2/3/4 wyniki k100. Aby użyć zapisanego wyniku dla siebie lub widzianej istoty, deklarujesz podmianę przed wykonaniem danego rzutu; zużyty wynik zostaje wykreślony.

**Nowy efekt:** Zapisujesz 1/2/3/4 wyniki k100. Aby użyć zapisanego wyniku dla siebie lub widzianej istoty, deklarujesz podmianę przed wykonaniem danego rzutu; zużyty wynik zostaje wykreślony.

**Problem, decyzja i uzasadnienie:** Pula wyników k100 1/2/3/4, podmiana deklarowana przed rzutem. Odnawianie nieokreślone w źródle: przyznaje MG, bez nowego automatycznego resetu.

**Automatyzacja:** Przycisk i zasób/czas w ACTIVE_RULES; pozostałe części według uwag.

**Ślady w kodzie (nie dowód kompletności):** `module/effects-engine.mjs`, `module/setup.mjs`

## 118. Wybraniec Boży

**Status:** ZMIENIONY. **Kategoria:** special. **Maks. poziom:** 1. **Baza EXP:** 100. **Wymagania:** Ścieżka: Święty Rycerz, 3. poziom.

**Stary efekt:** Własny Special Feature Świętego Rycerza: traktowany jako Kapłan o połowę słabszy.

**Nowy efekt:** Własny Special Feature Świętego Rycerza: traktowany jako Kapłan o połowę słabszy.

**Problem, decyzja i uzasadnienie:** ZMIENIONY (legalność zakupu). To Special Feature Świętego Rycerza przyznawany na poziomie postaci, nie normalny zakup EXP. Zakup z panelu i bezpośrednim wywołaniem blokowany. Istniejące dokumenty pozostają. Nie wprowadzono automatycznego zwrotu EXP za stare zakupy.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/automation-rules.mjs`, `module/talent-balance.mjs`, `module/talent-tree-rules.mjs`

## 119. Święty Wojownik

**Status:** ZMIENIONY. **Kategoria:** special. **Maks. poziom:** 1. **Baza EXP:** 100. **Wymagania:** Ścieżka: Święty Rycerz, 6. poziom.

**Stary efekt:** ¼ maksymalnej Aury jako stałe obrażenia od żywiołu bóstwa.

**Nowy efekt:** ¼ maksymalnej Aury jako stałe obrażenia od żywiołu bóstwa.

**Problem, decyzja i uzasadnienie:** ZMIENIONY (legalność zakupu). To Special Feature Świętego Rycerza przyznawany na poziomie postaci, nie normalny zakup EXP. Zakup z panelu i bezpośrednim wywołaniem blokowany. Istniejące dokumenty pozostają. Nie wprowadzono automatycznego zwrotu EXP za stare zakupy.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/automation-rules.mjs`, `module/talent-balance.mjs`, `module/talent-tree-rules.mjs`

## 120. Błogosławiony

**Status:** ZMIENIONY. **Kategoria:** special. **Maks. poziom:** 1. **Baza EXP:** 100. **Wymagania:** Ścieżka: Święty Rycerz, 11. poziom.

**Stary efekt:** Traktowany jako Kapłan Tieru 3.

**Nowy efekt:** Traktowany jako Kapłan Tieru 3.

**Problem, decyzja i uzasadnienie:** ZMIENIONY (legalność zakupu). To Special Feature Świętego Rycerza przyznawany na poziomie postaci, nie normalny zakup EXP. Zakup z panelu i bezpośrednim wywołaniem blokowany. Istniejące dokumenty pozostają. Nie wprowadzono automatycznego zwrotu EXP za stare zakupy.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/automation-rules.mjs`, `module/talent-balance.mjs`, `module/talent-tree-rules.mjs`

## 121. Pamięć Krwi

**Status:** WIP. **Kategoria:** special. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Vampirsi.

**Stary efekt:** WIP – mechanika w opracowaniu.

**Nowy efekt:** WIP – mechanika w opracowaniu.

**Problem, decyzja i uzasadnienie:** WIP. Brak pełnej mechaniki; zakup blokowany, wykluczony z normalnego wyboru talentów rasowych kreatora. Dwa wpisy Pamięci Krwi w różnych kategoriach pozostają jako oznaczone WIP; nie scalano samowolnie dokumentów świata.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/setup.mjs`

## 122. Niosący Sprawiedliwość — Gida

**Status:** OK — zasady zachowane. **Kategoria:** deity. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan Gida.

**Stary efekt:** Ułatwienie odporności Psych./Duch. przeciw wpływom Mroku.

**Nowy efekt:** Ułatwienie odporności Psych./Duch. przeciw wpływom Mroku.

**Problem, decyzja i uzasadnienie:** Sytuacyjne Ułatwienie; wybór właściwego testu i okoliczności pozostaje ręczny. Nie przyznawać globalnego Ułatwienia wszystkim testom ani stałego bonusu progów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 123. Święty Płomień — Gida

**Status:** ZMIENIONY. **Kategoria:** deity. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan Gida.

**Stary efekt:** Element Ogień w cudzie o 1 tańszy; ogień ignoruje Odp. Duchową istot Mroku.

**Nowy efekt:** Element Ogień w cudzie o 1 tańszy. Obrażenia Ognia z tego Cudu ignorują wyłącznie bonus Progów z Odporności Duchowej istoty Mroku, wskazanej przez MG. Bazowe progi ŻYW, inne bonusy, Pancerz i aktywne testy przeciw stanom pozostają.

**Problem, decyzja i uzasadnienie:** ZMIENIONY. Zniżka Ognia pozostaje. Cud Ognia Gidy pomija jedynie duchowy bonus progów oznaczonej przez MG Istoty Mroku. Nie omija ŻYW, innych bonusów, pancerza ani testów stanów. Oznaczenie celu jawne, bez zgadywania po rasie.

**Automatyzacja:** Modyfikatory: aspectCost.

**Ślady w kodzie (nie dowód kompletności):** `module/canonical-rules.mjs`, `module/effects-engine.mjs`

## 124. Gniew Gidy — Gida

**Status:** OK — zasady zachowane. **Kategoria:** deity. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan Gida.

**Stary efekt:** Nasycasz broń ognistym oczyszczeniem; magiczny ogień i Podpalenie.

**Nowy efekt:** Nasycasz broń ognistym oczyszczeniem; magiczny ogień i Podpalenie.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 125. Wola Życia — Eruel

**Status:** OK — zasady zachowane. **Kategoria:** deity. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan Eruel.

**Stary efekt:** Ułatwienie testów Pierwszej Pomocy.

**Nowy efekt:** Ułatwienie testów Pierwszej Pomocy.

**Problem, decyzja i uzasadnienie:** Sytuacyjne Ułatwienie; wybór właściwego testu i okoliczności pozostaje ręczny. Nie przyznawać globalnego Ułatwienia wszystkim testom ani stałego bonusu progów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 126. Dotyk Litości — Eruel

**Status:** OK — zasady zachowane. **Kategoria:** deity. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan Eruel.

**Stary efekt:** Leczenie ran tańsze o 1; Święte Dłonie leczą o 1 ranę więcej.

**Nowy efekt:** Leczenie ran tańsze o 1; Święte Dłonie leczą o 1 ranę więcej.

**Problem, decyzja i uzasadnienie:** Częściowa automatyzacja: jawne zniżki aspektów w TALENT_RULES, zależne od szkoły/elementu/aspektu. Dodatkowe opisowe skutki, np. obrażenia, kontakt z duszami czy nieświadomość celu, nie są przez to automatycznie zaimplementowane. Zachowano wartości i minima kosztów.

**Automatyzacja:** Modyfikatory: aspectCost.

**Ślady w kodzie (nie dowód kompletności):** `module/effects-engine.mjs`

## 127. Sanktuarium Eruela — Eruel

**Status:** OK — zasady zachowane. **Kategoria:** deity. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan Eruel.

**Stary efekt:** Strefa 10 m: sojusznicy +10/+15 do odporności; T4 leczą 1 Ranę na początku swojej tury, maksymalnie raz na rundę na postać.

**Nowy efekt:** Strefa 10 m: sojusznicy +10/+15 do odporności; T4 leczą 1 Ranę na początku swojej tury, maksymalnie raz na rundę na postać.

**Problem, decyzja i uzasadnienie:** +10/+15 pełnych odporności w strefie, nie redukcja obrażeń. Nie opisano jednoznacznie przejścia +10→+15; aura obszarowa i leczenie T4 pozostają ręczne. MG pilnuje 10 m i jednego leczenia na rundę. Nie dopisano progów Tieru.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 128. Płomyk Nadziei — Maris

**Status:** OK — zasady zachowane. **Kategoria:** deity. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan Maris.

**Stary efekt:** Ułatwienie Odp. Psych. przeciw Przerażeniu w 10 m.

**Nowy efekt:** Ułatwienie Odp. Psych. przeciw Przerażeniu w 10 m.

**Problem, decyzja i uzasadnienie:** Sytuacyjne Ułatwienie; wybór właściwego testu i okoliczności pozostaje ręczny. Nie przyznawać globalnego Ułatwienia wszystkim testom ani stałego bonusu progów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 129. Głos Otuchy — Maris

**Status:** OK — zasady zachowane. **Kategoria:** deity. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan Maris.

**Stary efekt:** Usuwanie stanów tańsze o 1; Przerażenie o 2.

**Nowy efekt:** Usuwanie stanów tańsze o 1; Przerażenie o 2.

**Problem, decyzja i uzasadnienie:** Częściowa automatyzacja: jawne zniżki aspektów w TALENT_RULES, zależne od szkoły/elementu/aspektu. Dodatkowe opisowe skutki, np. obrażenia, kontakt z duszami czy nieświadomość celu, nie są przez to automatycznie zaimplementowane. Zachowano wartości i minima kosztów.

**Automatyzacja:** Modyfikatory: aspectCost, aspectCost.

**Ślady w kodzie (nie dowód kompletności):** `module/effects-engine.mjs`

## 130. Niezłomna Wiara — Maris

**Status:** OK — zasady zachowane. **Kategoria:** deity. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan Maris.

**Stary efekt:** Dajesz sojusznikowi tymczasowy Punkt Losu. Tymczasowy Punkt Losu nie daje EXP za wydanie i nie może uruchomić efektu tworzącego kolejny Punkt Losu.

**Nowy efekt:** Dajesz sojusznikowi tymczasowy Punkt Losu. Tymczasowy Punkt Losu nie daje EXP za wydanie i nie może uruchomić efektu tworzącego kolejny Punkt Losu.

**Problem, decyzja i uzasadnienie:** Zachowano zakaz EXP za wydanie tymczasowego Losu i tworzenia kolejnego Losu z tego efektu. Przyznanie/oznaczenie tymczasowego punktu wymaga ręcznego prowadzenia; nie mieszać bez oznaczenia ze zwykłą pulą.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 131. Spojrzenie Herolda — Alēgmón

**Status:** OK — zasady zachowane. **Kategoria:** deity. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan Alēgmón.

**Stary efekt:** Ułatwienie ER/PER przy śmierci i nieumarłych; proste nieumarłe nie atakują.

**Nowy efekt:** Ułatwienie ER/PER przy śmierci i nieumarłych; proste nieumarłe nie atakują.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 132. Słowo Ostatniego Strażnika — Alēgmón

**Status:** OK — zasady zachowane. **Kategoria:** deity. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan Alēgmón.

**Stary efekt:** Przerażenie tańsze o 1; cuda kontaktu z duszami tańsze.

**Nowy efekt:** Przerażenie tańsze o 1; cuda kontaktu z duszami tańsze.

**Problem, decyzja i uzasadnienie:** Częściowa automatyzacja: jawne zniżki aspektów w TALENT_RULES, zależne od szkoły/elementu/aspektu. Dodatkowe opisowe skutki, np. obrażenia, kontakt z duszami czy nieświadomość celu, nie są przez to automatycznie zaimplementowane. Zachowano wartości i minima kosztów.

**Automatyzacja:** Modyfikatory: aspectCost.

**Ślady w kodzie (nie dowód kompletności):** `module/effects-engine.mjs`

## 133. Dwa Oblicza Śmierci — Alēgmón

**Status:** OK — zasady zachowane. **Kategoria:** deity. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan Alēgmón.

**Stary efekt:** Łaskawe: +2 do Progu sojusznika; Gniewne: −2 do Progu wroga; skaluje się z Tierem.

**Nowy efekt:** Łaskawe: +2 do Progu sojusznika; Gniewne: −2 do Progu wroga; skaluje się z Tierem.

**Problem, decyzja i uzasadnienie:** Niepełna tabela wartości lub zakres warunków w bazowym skrócie. Efekt ręczny; brak nowego skalowania Tierów, czasu lub kosztu. Nie podmieniono bonusów progów/odporności na płaską redukcję.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 134. Serce Burzy — Mürgel

**Status:** ZMIENIONY. **Kategoria:** deity. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan Mürgel.

**Stary efekt:** +10 Odp. Fiz., odporność na pogodę, Ułatwienie przeciw Powaleniu.

**Nowy efekt:** +10 Odp. Fiz., odporność na pogodę, Ułatwienie przeciw Powaleniu.

**Problem, decyzja i uzasadnienie:** ZMIENIONY (brakująca automatyzacja częściowa). Stałe +10 Odp. Fizycznej działa w pełnym teście i progach. Odporność na pogodę i sytuacyjne Ułatwienie przeciw Powaleniu nadal wybiera MG/gracz w teście. Nie podwyższono wartości.

**Automatyzacja:** Modyfikatory: physicalResistance.

**Ślady w kodzie (nie dowód kompletności):** `module/effects-engine.mjs`

## 135. Gniew Burzy — Mürgel

**Status:** OK — zasady zachowane. **Kategoria:** deity. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan Mürgel.

**Stary efekt:** Element Elektryczność lub Wiatr o 2 tańszy; dodatkowe obrażenia z dziesiątek WIA.

**Nowy efekt:** Element Elektryczność lub Wiatr o 2 tańszy; dodatkowe obrażenia z dziesiątek WIA.

**Problem, decyzja i uzasadnienie:** Częściowa automatyzacja: jawne zniżki aspektów w TALENT_RULES, zależne od szkoły/elementu/aspektu. Dodatkowe opisowe skutki, np. obrażenia, kontakt z duszami czy nieświadomość celu, nie są przez to automatycznie zaimplementowane. Zachowano wartości i minima kosztów.

**Automatyzacja:** Modyfikatory: aspectCost.

**Ślady w kodzie (nie dowód kompletności):** `module/effects-engine.mjs`

## 136. Żołnierz Burzy — Mürgel

**Status:** OK — zasady zachowane. **Kategoria:** deity. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan Mürgel.

**Stary efekt:** Nasycasz ataki wręcz Elektrycznością; +1k10/2k10, Szok, Powalenie.

**Nowy efekt:** Nasycasz ataki wręcz Elektrycznością; +1k10/2k10, Szok, Powalenie.

**Problem, decyzja i uzasadnienie:** Niepełna tabela wartości lub zakres warunków w bazowym skrócie. Efekt ręczny; brak nowego skalowania Tierów, czasu lub kosztu. Nie podmieniono bonusów progów/odporności na płaską redukcję.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 137. Pewny Krok — Alherian

**Status:** OK — zasady zachowane. **Kategoria:** deity. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan Alherian.

**Stary efekt:** Ułatwienie nawigacji i orientacji.

**Nowy efekt:** Ułatwienie nawigacji i orientacji.

**Problem, decyzja i uzasadnienie:** Sytuacyjne Ułatwienie; wybór właściwego testu i okoliczności pozostaje ręczny. Nie przyznawać globalnego Ułatwienia wszystkim testom ani stałego bonusu progów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 138. Światło Przewodnika — Alherian

**Status:** OK — zasady zachowane. **Kategoria:** deity. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan Alherian.

**Stary efekt:** Bonus do SZ i PER tańszy; ochronne cuda trwają rundę dłużej.

**Nowy efekt:** Bonus do SZ i PER tańszy; ochronne cuda trwają rundę dłużej.

**Problem, decyzja i uzasadnienie:** Niepełna tabela wartości lub zakres warunków w bazowym skrócie. Efekt ręczny; brak nowego skalowania Tierów, czasu lub kosztu. Nie podmieniono bonusów progów/odporności na płaską redukcję.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/ability-automation.mjs`

## 139. Ostoja Wędrowca — Alherian

**Status:** OK — zasady zachowane. **Kategoria:** deity. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan Alherian.

**Stary efekt:** Strefa: ignorowanie trudnego terenu, +5/+10 do Obrony.

**Nowy efekt:** Strefa: ignorowanie trudnego terenu, +5/+10 do Obrony.

**Problem, decyzja i uzasadnienie:** Niepełna tabela wartości lub zakres warunków w bazowym skrócie. Efekt ręczny; brak nowego skalowania Tierów, czasu lub kosztu. Nie podmieniono bonusów progów/odporności na płaską redukcję.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 140. Rytuał Dwoistości — Guizto i Skaebne

**Status:** OK — zasady zachowane. **Kategoria:** deity. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan Guizto i Skaebne.

**Stary efekt:** K100 na sesję: błogosławieństwo dla sojusznika albo klątwa dla wroga.

**Nowy efekt:** K100 na sesję: błogosławieństwo dla sojusznika albo klątwa dla wroga.

**Problem, decyzja i uzasadnienie:** Automatyczny przycisk/limit sesyjny; odpowiedź na pytanie lub interpretacja k100 należy do MG.

**Automatyzacja:** Przycisk i zasób/czas w ACTIVE_RULES; pozostałe części według uwag.

**Ślady w kodzie (nie dowód kompletności):** `module/effects-engine.mjs`

## 141. Kradzież Fortuny — Guizto i Skaebne

**Status:** OK — zasady zachowane. **Kategoria:** deity. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan Guizto i Skaebne.

**Stary efekt:** Droższe Utrudnienie, ale na bonusie Punkt Losu.

**Nowy efekt:** Droższe Utrudnienie, ale na bonusie Punkt Losu.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 142. Kaprys Losu — Guizto i Skaebne

**Status:** OK — zasady zachowane. **Kategoria:** deity. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan Guizto i Skaebne.

**Stary efekt:** Punkt Fortuny: zmuszasz istotę do przerzutu.

**Nowy efekt:** Punkt Fortuny: zmuszasz istotę do przerzutu.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 143. Purpurowa Maska — Prudir

**Status:** OK — zasady zachowane. **Kategoria:** deity. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan Prudir.

**Stary efekt:** Ułatwienie Ogłady przy kłamstwie i wmieszaniu się w tłum.

**Nowy efekt:** Ułatwienie Ogłady przy kłamstwie i wmieszaniu się w tłum.

**Problem, decyzja i uzasadnienie:** Sytuacyjne Ułatwienie; wybór właściwego testu i okoliczności pozostaje ręczny. Nie przyznawać globalnego Ułatwienia wszystkim testom ani stałego bonusu progów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 144. Kielich Rozpusty — Prudir

**Status:** OK — zasady zachowane. **Kategoria:** deity. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan Prudir.

**Stary efekt:** Cuda emocji i halucynacji o 2 tańsze.

**Nowy efekt:** Cuda emocji i halucynacji o 2 tańsze.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 145. Taniec Satyra — Prudir

**Status:** OK — zasady zachowane. **Kategoria:** deity. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan Prudir.

**Stary efekt:** Test OG vs Odp. Psych. daje wrogowi Utrudnienie ataku.

**Nowy efekt:** Test OG vs Odp. Psych. daje wrogowi Utrudnienie ataku.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 146. Ziarna Czasu — Zolaan

**Status:** OK — zasady zachowane. **Kategoria:** deity. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan Zolaan.

**Stary efekt:** 2 Aury: pierwsza akcja w turze −2 OP.

**Nowy efekt:** 2 Aury: pierwsza akcja w turze −2 OP.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/canonical-rules.mjs`

## 147. Przyspieszony Nurt — Zolaan

**Status:** OK — zasady zachowane. **Kategoria:** deity. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan Zolaan.

**Stary efekt:** Odjęcie OP i bonus do SZ w cudzie tańsze.

**Nowy efekt:** Odjęcie OP i bonus do SZ w cudzie tańsze.

**Problem, decyzja i uzasadnienie:** Niepełna tabela wartości lub zakres warunków w bazowym skrócie. Efekt ręczny; brak nowego skalowania Tierów, czasu lub kosztu. Nie podmieniono bonusów progów/odporności na płaską redukcję.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/ability-automation.mjs`

## 148. Pętla Przeznaczenia — Zolaan

**Status:** OK — zasady zachowane. **Kategoria:** deity. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan Zolaan.

**Stary efekt:** Zapisujesz krytyczny sukces i używasz go za sojusznika.

**Nowy efekt:** Zapisujesz krytyczny sukces i używasz go za sojusznika.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 149. Spojrzenie w Przyszłość — Lavi

**Status:** OK — zasady zachowane. **Kategoria:** deity. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan Lavi.

**Stary efekt:** Raz na sesję pytasz MG o skutki planowanego działania.

**Nowy efekt:** Raz na sesję pytasz MG o skutki planowanego działania.

**Problem, decyzja i uzasadnienie:** Automatyczny przycisk/limit sesyjny; odpowiedź na pytanie lub interpretacja k100 należy do MG.

**Automatyzacja:** Przycisk i zasób/czas w ACTIVE_RULES; pozostałe części według uwag.

**Ślady w kodzie (nie dowód kompletności):** `module/effects-engine.mjs`

## 150. Głos Wyroczni — Lavi

**Status:** OK — zasady zachowane. **Kategoria:** deity. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan Lavi.

**Stary efekt:** Bonus do PER lub ER w cudzie bez kosztu.

**Nowy efekt:** Bonus do PER lub ER w cudzie bez kosztu.

**Problem, decyzja i uzasadnienie:** Częściowa automatyzacja: jawne zniżki aspektów w TALENT_RULES, zależne od szkoły/elementu/aspektu. Dodatkowe opisowe skutki, np. obrażenia, kontakt z duszami czy nieświadomość celu, nie są przez to automatycznie zaimplementowane. Zachowano wartości i minima kosztów.

**Automatyzacja:** Modyfikatory: aspectCost.

**Ślady w kodzie (nie dowód kompletności):** `module/effects-engine.mjs`

## 151. Nić Przeznaczenia — Lavi

**Status:** OK — zasady zachowane. **Kategoria:** deity. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan Lavi.

**Stary efekt:** Dodatkowy Punkt Losu, przerzut dla sojusznika.

**Nowy efekt:** Dodatkowy Punkt Losu, przerzut dla sojusznika.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 152. Honor Wojownika — Traad

**Status:** OK — zasady zachowane. **Kategoria:** deity. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan Traad.

**Stary efekt:** Uczysz się talentu Wojownika Tieru 1.

**Nowy efekt:** Uczysz się talentu Wojownika Tieru 1.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 153. Szał Bitewny — Traad

**Status:** OK — zasady zachowane. **Kategoria:** deity. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan Traad.

**Stary efekt:** Wzmocnione modyfikacje cudów Pomocy.

**Nowy efekt:** Wzmocnione modyfikacje cudów Pomocy.

**Problem, decyzja i uzasadnienie:** Niepełna tabela wartości lub zakres warunków w bazowym skrócie. Efekt ręczny; brak nowego skalowania Tierów, czasu lub kosztu. Nie podmieniono bonusów progów/odporności na płaską redukcję.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/ability-automation.mjs`

## 154. Nieustępliwość Tępiciela — Traad

**Status:** OK — zasady zachowane. **Kategoria:** deity. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan Traad.

**Stary efekt:** Po Ranie +5 do +15 Odp. Fiz. do końca walki.

**Nowy efekt:** Po Ranie +5 do +15 Odp. Fiz. do końca walki.

**Problem, decyzja i uzasadnienie:** +5…+15 Odp. Fiz. po Ranie nadal wpływa na pełny test oraz dziesiątki progów. Opis nie podaje mapowania Tierów/stopni; brak bezpiecznej automatyzacji narastania. Efekt przyznaje i kończy MG. Nie wymyślono +10 zamiast +5.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 155. Jedność z Naturą — Anella

**Status:** OK — zasady zachowane. **Kategoria:** deity. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan Anella.

**Stary efekt:** Ułatwienie przetrwania, tropienia i ziół.

**Nowy efekt:** Ułatwienie przetrwania, tropienia i ziół.

**Problem, decyzja i uzasadnienie:** Sytuacyjne Ułatwienie; wybór właściwego testu i okoliczności pozostaje ręczny. Nie przyznawać globalnego Ułatwienia wszystkim testom ani stałego bonusu progów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 156. Szept Puszczy — Anella

**Status:** OK — zasady zachowane. **Kategoria:** deity. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan Anella.

**Stary efekt:** Cuda na zwierzęta i rośliny bez dopłaty.

**Nowy efekt:** Cuda na zwierzęta i rośliny bez dopłaty.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 157. Skóra jak Kora — Anella

**Status:** OK — zasady zachowane. **Kategoria:** deity. **Maks. poziom:** 3. **Baza EXP:** 100. **Wymagania:** Kapłan Anella.

**Stary efekt:** Bez zbroi: T1 +1 pancerza na wszystkich lokacjach; T2 nadal +1 i +5 Odp. Fiz.; T3 +2 pancerza i łącznie +10 Odp. Fiz. Talent ma maks. 3 poziomy; pancerz z talentu działa z Aurą.

**Nowy efekt:** Bez zbroi: T1 +1 pancerza na wszystkich lokacjach; T2 nadal +1 i +5 Odp. Fiz.; T3 +2 pancerza i łącznie +10 Odp. Fiz. Talent ma maks. 3 poziomy; pancerz z talentu działa z Aurą.

**Problem, decyzja i uzasadnienie:** Osobne komponenty: Pancerz +1/+1/+2 oraz Odp. Fiz. +0/+5/+10, maks. 3. Pancerz nie jest dawną odpornością i nie został usunięty. Zachowano zgodność z Aurą. Warunek bez zbroi pozostaje według istniejącego modelu; nie zmieniano klasyfikacji zbroi.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** `module/data-models.mjs`, `module/talent-balance.mjs`

## 158. Rytualna Ofiara — Karda

**Status:** OK — zasady zachowane. **Kategoria:** deity. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan Karda.

**Stary efekt:** Energia Krwi jako talent archetypowy.

**Nowy efekt:** Energia Krwi jako talent archetypowy.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 159. Krwawe Przymierze — Karda

**Status:** OK — zasady zachowane. **Kategoria:** deity. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan Karda.

**Stary efekt:** 1 własna Rana obniża koszt cudu o 2.

**Nowy efekt:** 1 własna Rana obniża koszt cudu o 2.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 160. Klątwa Krwawej Matki — Karda

**Status:** OK — zasady zachowane. **Kategoria:** deity. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan Karda.

**Stary efekt:** Krwawienie z obrażeniami cudu za darmo; T4 2k10.

**Nowy efekt:** Krwawienie z obrażeniami cudu za darmo; T4 2k10.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 161. Sługa Martwego Oblicza — Naŭcro

**Status:** OK — zasady zachowane. **Kategoria:** deity. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan Naŭcro.

**Stary efekt:** Ułatwienie społeczne z nieumarłymi; proste ożywieńce nie atakują.

**Nowy efekt:** Ułatwienie społeczne z nieumarłymi; proste ożywieńce nie atakują.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 162. Szept zza Grobu — Naŭcro

**Status:** OK — zasady zachowane. **Kategoria:** deity. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan Naŭcro.

**Stary efekt:** Cuda wskrzeszania sług o 2 tańsze.

**Nowy efekt:** Cuda wskrzeszania sług o 2 tańsze.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 163. Profanacja Spokoju — Naŭcro

**Status:** OK — zasady zachowane. **Kategoria:** deity. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan Naŭcro.

**Stary efekt:** Przerażenie utrudnione w 10 m; kara do Odp. Duchowej wrogów.

**Nowy efekt:** Przerażenie utrudnione w 10 m; kara do Odp. Duchowej wrogów.

**Problem, decyzja i uzasadnienie:** Niepełna tabela wartości lub zakres warunków w bazowym skrócie. Efekt ręczny; brak nowego skalowania Tierów, czasu lub kosztu. Nie podmieniono bonusów progów/odporności na płaską redukcję.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 164. Krok w Cieniu — Fènwe

**Status:** OK — zasady zachowane. **Kategoria:** deity. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan Fènwe.

**Stary efekt:** Ułatwienie skradania w mroku.

**Nowy efekt:** Ułatwienie skradania w mroku.

**Problem, decyzja i uzasadnienie:** Sytuacyjne Ułatwienie; wybór właściwego testu i okoliczności pozostaje ręczny. Nie przyznawać globalnego Ułatwienia wszystkim testom ani stałego bonusu progów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 165. Szept z Mroku — Fènwe

**Status:** OK — zasady zachowane. **Kategoria:** deity. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan Fènwe.

**Stary efekt:** Cień o 1 tańszy; dodatkowe obrażenia dla nieświadomego celu.

**Nowy efekt:** Cień o 1 tańszy; dodatkowe obrażenia dla nieświadomego celu.

**Problem, decyzja i uzasadnienie:** Częściowa automatyzacja: jawne zniżki aspektów w TALENT_RULES, zależne od szkoły/elementu/aspektu. Dodatkowe opisowe skutki, np. obrażenia, kontakt z duszami czy nieświadomość celu, nie są przez to automatycznie zaimplementowane. Zachowano wartości i minima kosztów.

**Automatyzacja:** Modyfikatory: aspectCost.

**Ślady w kodzie (nie dowód kompletności):** `module/effects-engine.mjs`

## 166. Ostrze Cieni — Fènwe

**Status:** OK — zasady zachowane. **Kategoria:** deity. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan Fènwe.

**Stary efekt:** Dodatkowe 1k10/2k10 na pierwszy atak wręcz z zaskoczenia.

**Nowy efekt:** Dodatkowe 1k10/2k10 na pierwszy atak wręcz z zaskoczenia.

**Problem, decyzja i uzasadnienie:** Zachowano opis i dotychczasowy koszt. Nie występuje tu stara płaska redukcja odporności. Efekt lub jego kontekst pozostaje ręczny, jeżeli nie wskazano poniżej konkretnego wykonawcy. Skrócony opis nie daje podstaw do dopisywania skalowania, nowych kosztów lub resetów.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 167. Nosiciel Niegodziwości — Lor i Malo

**Status:** OK — zasady zachowane. **Kategoria:** deity. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan Lor i Malo.

**Stary efekt:** Ułatwienie przeciw Zatruciu, +5 odporności na bagnach.

**Nowy efekt:** Ułatwienie przeciw Zatruciu, +5 odporności na bagnach.

**Problem, decyzja i uzasadnienie:** +5 odporności na bagnach zachowuje sens jako bonus aktywnego testu. Warunek terenu i Ułatwienie przeciw Zatruciu ręczne; nie traktować jako stałe +5 do wszystkich progów. Brak samowolnego zwiększenia do +10.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## 168. Spaczenie Materii — Lor i Malo

**Status:** OK — zasady zachowane. **Kategoria:** deity. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan Lor i Malo.

**Stary efekt:** Zatrucie tańsze o 1; Woda i Ziemia bez kosztu.

**Nowy efekt:** Zatrucie tańsze o 1; Woda i Ziemia bez kosztu.

**Problem, decyzja i uzasadnienie:** Częściowa automatyzacja: jawne zniżki aspektów w TALENT_RULES, zależne od szkoły/elementu/aspektu. Dodatkowe opisowe skutki, np. obrażenia, kontakt z duszami czy nieświadomość celu, nie są przez to automatycznie zaimplementowane. Zachowano wartości i minima kosztów.

**Automatyzacja:** Modyfikatory: aspectCost, aspectCost.

**Ślady w kodzie (nie dowód kompletności):** `module/effects-engine.mjs`

## 169. Plaga Zarazy — Lor i Malo

**Status:** OK — zasady zachowane. **Kategoria:** deity. **Maks. poziom:** 4. **Baza EXP:** 100. **Wymagania:** Kapłan Lor i Malo.

**Stary efekt:** Utrudnienie odporności wybranego celu i osłabienie Żywotności.

**Nowy efekt:** Utrudnienie odporności wybranego celu i osłabienie Żywotności.

**Problem, decyzja i uzasadnienie:** Niepełna tabela wartości lub zakres warunków w bazowym skrócie. Efekt ręczny; brak nowego skalowania Tierów, czasu lub kosztu. Nie podmieniono bonusów progów/odporności na płaską redukcję.

**Automatyzacja:** Brak wpisu w wspólnym rejestrze aktywacji/modyfikatorów; możliwy istniejący wykonawca poniżej lub rozliczenie ręczne.

**Ślady w kodzie (nie dowód kompletności):** Brak dedykowanego odwołania; opis i ogólna legalność.

## Wynik katalogu

ZMIENIONY: 14; WIP: 3; OK — zasady zachowane: 152; USUNIĘTY: 0.

## Runy i bonusy rasowe

- **Runa Szybkości**: +1 do Szybkości.
- **Runa Statystyk**: +5 do wybranej cechy.
- **Runa Odporności**: +10 do wybranej odporności.
- **Runa Obrony**: +10 do Obrony.
- **Runa Pancerza**: +1 pancerza na wybranej lokacji; nie do broni.
- **Runa Zaklętej Magii / Cudu**: Zaklęcie/cud zaklęty w runie, użycie raz na długi odpoczynek.
- **Runa Ułatwienia w testach magicznych/modlitwy**: Ułatwienie w testach rzucania.
- **Runa Obrażeń**: +1k10 obrażeń.
- **Runa Penetracji**: +1 Penetracji.
- **Runa Niezniszczalności**: Raz na długi odpoczynek zdejmujesz 1 Ranę, tracąc ochronę bez faktycznego zniszczenia pancerza.
- **Runa Magiczna**: Zmienia obrażenia fizyczne w magiczne lub pancerz w magiczny; dla Źródła Mocy +1 poziom umagicznienia.
- **Runa Elementu**: Broń: +1k10 obrażeń od żywiołu i efekt na bonusie; zbroja: odporność na żywioł.
- **Runa Ułatwienia w ataku / strzale**: Ułatwienie w testach ataku.

Runy Odporności i Mistrz Run zmieniają pełny wynik testu; do progów trafiają dziesiątki. Runy w ciele obniżają ŻYW i przez to bazowe progi. Zachowane limity kosztu ≤ceil(ŻYW/3), CF Półmaga 96−koszt, bezpośrednie Rany=koszt przy porażce wszczepienia. Jestestwa Taurosa, Krasnoluda i Erusanina: darmowa Mocna Skóra +Tier do Fizycznych Progów. Nie zwiększono rasowych +5 do +10.
