> Raport archiwalny. Aktualny kanon i stan wdrożenia: [REPORT-0.11.5.md](REPORT-0.11.5.md).

# Gahla Resurrected 0.10.0-beta — raport wydania

Data: 4 października 2026. Baza: dostarczony ZIP Gahla Resurrected Foundry V14 0.9.6-beta.

## Status

Nowa wersja rozbudowuje istniejący system; nie zastępuje go osobnym modułem. Zawiera nowe narzędzia dla wszystkich 12 obszarów zamówienia, wspólny silnik modyfikatorów, migrację i testy regresyjne. **Nie oznacza to automatycznej interpretacji każdego opisu talentu i tagu.** Poniżej wskazano dokładnie, co wykonuje kod, a co nadal prowadzi MG.

Weryfikacja obejmuje 22 zestawy regresji, składnię modułów, pliki JSON i test formularza w przeglądarce. **Nie przeprowadzono pełnej sesji w działającym Foundry V14 ani testu kilku jednocześnie połączonych klientów.** Jest to wydanie beta do sprawdzenia na kopii świata.

## Zakres 12 funkcji

| Obszar | Wdrożone działanie |
|---|---|
| Aktywne talenty | Panel na karcie, przyciski użycia, trwałe zasoby, deklarowanie Ułatwienia i wyniku k100, wygaszanie efektów, resety walki/sceny/sesji. Dokładna lista poniżej. |
| Kreator Czarów/Cudów/Manewrów | Zachowany dotychczasowy kreator; 24 dodatkowe aspekty, cel własny/liczba celów/wielkość obszaru, wybór wyposażonego Źródła Mocy, źródła zniżek, wymagania Tieru, minimum OP, walidacja reakcji, Specjalny Manewr. Zapisany czar jest przeliczany dla aktualnego aktora przy rzucaniu. |
| Rozwój postaci | Pakiet za 50 EXP, wybór legalnych cech, limit każdej z nich, Wszechstronny raz na poziom, lista kolejnych poziomów talentów z kosztem i powodami blokad. Dotychczasowe Drzewko Talentów korzysta z tej samej kontroli zakupu. |
| Stany | Zmęczenie ze stosami, Spowolnienie, Przyspieszenie, Powalenie, Zatrucie, Ślepota, Zamarznięcie i Osłabienie Aury wpływają na odpowiednie obliczenia. Oszołomienie zużywa następną akcję zamiast dodawać stale +5 OP. Przerażenie można powiązać z konkretnym źródłem. |
| Boss Dashboard | SZ, reakcje, limit Ran/trafienie, tagi, stany, aktywne zdolności i opisy pozostałych. MG może dodać własny licznik zdolności, w tym Legendarną Odporność, z własną regułą i limitem. |
| Generator → scena | Tworzy nowych przeciwników, osobną pustą scenę, tokeny przeciwników i wybranej drużyny, Combat Encounter i otwiera Tracker. Uruchomienie walki jest opcją. |
| Szablony starć | Zapis nazwanych zestawów w ustawieniach świata, odtworzenie z Panelu sesji, usunięcie szablonu. Zapisywana jest kopia statystyk; odtworzenie nie przeskalowuje potworów po cichu. |
| Combat log i raport | Rejestr ataków bronią, trafień, przyrostu Ran/utraty HP, wydanej Aury, reakcji, wejść w stan śmiertelny i numeru rundy. Raport bieżący, archiwum po usunięciu Encounteru i eksport JSON. |
| GM Session Dashboard | Grupowe Punkty Losu, aktywna walka i runda, Tracker, generator starć/NPC, biblioteka, Pech, Trwałe Rany, szablony, raporty i resety sesji/sceny. |
| Hotbar | Przeciąganie narzędzi i konkretnych aktywnych talentów; utworzone makra wskazują aktora i talent. Są skróty do Pierwszej Pomocy, kreatora, Trackera i narzędzi MG. |
| Audyt buildu | Wymagania znanych talentów, ich poziomy, rasa/archetyp/bóstwo/ścieżka, most Mnicha, Tier, rozwinięcia cech, przygotowane zdolności, koszt/pojemność i znane limity run, ostrzeżenia o ciężkim ekwipunku i SF. Wymagania opisowe są oznaczane do sprawdzenia. |
| Reakcje w chacie | Kontekstowe Unik i Parowanie, kontrola liczby reakcji, SZ i akcji długiej; brak parowania ataku dystansowego. Po udanej obronie nowa karta ataku blokuje obrażenia. Nowe karty obrażeń blokują ponowne zastosowanie i ponowne poświęcenie pancerza. Defensywna Aura pozostaje w istniejącym kroku przed rzutem obrażeń. |

## Aktywne talenty i odnowienia

| Talent | Automatyka |
|---|---|
| Szybka Regeneracja | 1 użycie na walkę, 2 na T4; leczenie 1/2/3/4 Ran albo usunięcie jednego posiadanego stanu. Nie wymyślono przelicznika Ran na HP. |
| Krwisty Metabolizm | Przycisk potwierdzający wypicie krwi uzupełnia pulę 1/2/3/4. Użycie rezerwuje Ułatwienie przed następnym obsługiwanym rzutem k100. Koniec sceny lub odpoczynek kasuje pulę i niewykorzystaną deklarację. |
| Nadludzka Siła | Podwojenie aktualnego SF jako efekt tymczasowy; przy przejściu do następnej rundy albo zakończeniu walki efekt znika i pojawia się Zmęczenie. Ponowne włączenie podczas trwania efektu jest blokowane. |
| Przeczucie Przyszłości | MG przyznaje pulę 1/2/3/4 zapisanych wyników. Gracz wybiera wynik i deklaruje podmianę przed rzutem. Wynik jest wykreślany. Źródło nie określa odnowienia puli — nie dodano resetu raz na walkę ani raz na sesję. Widoczność celu potwierdza gracz/MG. |
| Doświadczenie Magiczne / Kapłańskie | 1/1/2/2 przerzuty na walkę. Powtarza ostatnie rzucanie czaru/cudu bez ponownego kosztu segmentów. |
| Doświadczone Wojaczkowe / Doświadczenie Strzelca | 1/1/2/2 przerzuty na walkę. Powtarza ostatni atak z jego parametrami bez ponownego kosztu OP; nie pozwala przerzucić ataku po wygenerowaniu obrażeń przez nowy mechanizm. |
| Pierwsza Pomoc | Raz na sesję na dany cel dla wykonawcy: leczenie Ran według Tieru i opcjonalne usunięcie stanu. Pamięta leczone cele. Działania na cudzych postaciach wykonuje ich właściciel lub MG. |
| Spojrzenie w Przyszłość | Licznik jednego użycia na sesję i komunikat; odpowiedzi fabularnej udziela MG. |
| Rytuał Dwoistości | Jeden rzut k100 na sesję; interpretacja błogosławieństwa/klątwy pozostaje przy MG. |

Walka odnawia swoje zasoby przy rozpoczęciu nowego Encounteru. Ponowne wejście w pierwszą rundę tego samego Encounteru nie daje kolejnej pełnej puli. Nową sesję oznacza MG w panelu. Dla sceny dostępny jest przycisk zakończenia; dezaktywowanie sceny również uruchamia jej reset. Pozostałe talenty mają nadal opis i dotychczasowe działanie pasywne.

## Silnik modyfikatorów

Nowe reguły są danymi, a wspólny interpreter obsługuje dodawanie, mnożenie, ustawianie wartości i ograniczenia minimum/maksimum. Warunki mogą dotyczyć szkoły, aspektu, elementu, cechy, rodzaju akcji, celu i ataku dystansowego. Nie wykonuje kodu zawartego w opisach.

Źródłami są poznane talenty, wyposażone przedmioty, aktywne efekty, stany i efekty tymczasowe. Rozstrzygnięcie kosztu udostępnia listę źródeł zmian. Reguły można rozszerzać przez `flags.gahla-resurrected.modifiers` na przedmiotach i ActiveEffect; deklaratywne aktywacje znajdują się w `effects-engine.mjs`. Parametry własnego zasobu MG można ustawić z Dashboardu.

Obsługiwane zniżki/bonusy obejmują: Święty Płomień, Dotyk Litości, Głos Otuchy, Gniew Burzy, Szept z Mroku, Spaczenie Materii, koszt Przerażenia ze Słowa Ostatniego Strażnika, Głos Wyroczni, Biegłość Magiczną, Pamięć Maga oraz darmowe gwiazdki Specjalnego Manewru. Zniżka aspektu nie daje ujemnego kosztu. Biegłość Magiczna nie przebija minimum OP; Przyspieszenie może je obniżyć zgodnie z opisem stanu.

Dotychczasowa matematyka pasywnych talentów z 0.9.6 została zachowana poza wskazanymi poprawkami. Nie przepisano całej starej logiki na nowy interpreter naraz.

## Poprawki wykryte podczas integracji

- Pakiet rozwoju sprawdza limit wszystkich wybranych cech; nie ucina nadmiarowych zaznaczeń do wymaganej liczby.
- Zakup talentu wymaga kolejnego poziomu, respektuje `maxLevel` i korzysta ze wspólnej kontroli legalności. W razie błędu zapisu EXP cofa nowo utworzone przedmioty/zmianę talentu.
- Wszechstronny nadal działa najwyżej raz na poziom; most Mnicha i darmowa Walka Wręcz pozostają zachowane.
- Pamięć Maga dodaje sloty po wyliczeniu podstawy — wcześniej premia mogła zostać nadpisana przez dalsze obliczenia.
- Parowanie nie jest oferowane przy zerowych reakcjach, bez broni ani wobec ataku dystansowego; przy kliknięciu stan sprawdzany jest ponownie.
- Stan reakcji obrońcy jest zapisywany na jego aktorze, a nie w cudzej wiadomości czatu, do której gracz może nie mieć prawa zapisu.
- Identyfikator wykorzystanej nowej karty obrażeń jest zapisywany wraz ze zmianą zdrowia.
- Usunięto fikcyjne adresy `PLACEHOLDER_OWNER` z manifestu. To instalacja z ZIP-a, bez publikacji internetowej.

## Co pozostaje opisowe / WIP

Zachowano wcześniejsze oznaczenia WIP, m.in. Pamięć Krwi, wieloklasowość, łączenie żywiołów, niegrywalne rasy, poziomy powyżej 11, niektóre tabele Trwałych Ran i nieuzgodnione reguły run.

- **Przyspieszony Nurt, Światło Przewodnika i podobne opisy bez wartości zniżki:** kreator ostrzega; nie odejmuje wymyślonej liczby.
- **Specjalny Manewr:** darmowe 2/3/4/5 gwiazdek i dodatkowy slot działają. Wielkość „zwiększonych limitów” nie jest podana w danych, więc zwykłe limity aspektów nie zostały arbitralnie podniesione.
- **Legendarna Odporność:** baza nie definiuje jej reguły ani liczby użyć. Własny licznik MG zapisuje użycia i odnowienia, ale sam nie nadaje odporności i nie anuluje skutków ataku.
- **Pozostałe zdolności opisowe**, m.in. strefy Sanktuarium, tymczasowy Los z Niezłomnej Wiary, złożone tagi potworów i własne Special Features: nie otrzymują automatycznie zgadniętych zasięgów, kosztów, warunków aktywacji lub efektów. Widoczne są w panelu opisów.
- **Krwawienie i Podpalenie:** nie dodano nowych automatycznych obrażeń okresowych. „Tura” w segmentowym Trackerze wymaga uzgodnienia momentu wyzwalania, aby przestawianie kolejności nie mnożyło obrażeń.
- **Ruch, widoczność i źródło strachu:** nie powstał silnik egzekwujący zakaz zbliżania się, zasięg widzenia lub ruch w terenie. Przerażenie z ustawionym źródłem wpływa na ataki wobec tego celu.
- **Własne efekty i ryzyka:** ich znaczenie i koszt nadal ustala MG; kreator nie interpretuje swobodnego tekstu.
- **Raport walki:** trafienia liczone są z kart ataków bronią; przerzuty tworzą kolejne rzuty w logu. Nie jest to pełna analityka wszystkich czarów wsparcia, ręcznych makr i zewnętrznych modułów. Ręczne zmniejszenie zasobu w trakcie walki jest widoczne jako jego zużycie.
- **Scena generatora:** jest pustą planszą z rozstawionymi tokenami, bez generowania mapy, ścian czy oświetlenia.

## Migracja i przechowywanie danych

Nowe dane są przechowywane w przestrzeni flag `gahla-resurrected`. Migracja dodaje schemat automatyki aktorom świata oraz osobnym aktorom niepowiązanych tokenów. Jest idempotentna: ponowne uruchomienie nie odnawia wydanych zasobów i nie odejmuje ponownie EXP. Zachowuje dotychczasowe flagi, poziomy i dane postaci. Migracje 0.9.6 pozostają uruchamiane zgodnie z dotychczasową procedurą.

Szablony i archiwalne raporty znajdują się w ustawieniach świata. Dziennik trwającej walki jest na Combat. Makra są zwykłymi dokumentami Foundry. Nie zmieniano danych żadnej rzeczywistej kampanii podczas przygotowania tego wydania.

## Instalacja i pierwsze uruchomienie

1. Zamknij świat i zachowaj jego kopię.
2. Rozpakuj ZIP do `Data/systems/gahla-resurrected/`. Plik `system.json` musi być bezpośrednio w tym katalogu.
3. Uruchom Foundry V14 ponownie i otwórz świat jako MG. Poczekaj na migracje; ewentualny błąd nowej migracji wyświetli powiadomienie.
4. Na karcie postaci otwórz **Aktywne talenty**, **Rozwój postaci** lub **Audyt buildu**.
5. W katalogu Actorów otwórz **Gahla — Panel sesji MG**. Generator Starć zawiera przyciski zapisania szablonu i rozstawienia sceny.
6. Przeciągnij przycisk narzędzia albo talentu na hotbar. Używaj przycisku **Nowa sesja** w momencie rozpoczęcia kolejnej sesji.

Przed grą sprawdź w kopii świata własną postać, NPC, nową scenę, deklarację Aury oraz obronę z konta gracza. Nowe blokady kart dotyczą kart utworzonych przez tę wersję; stary czat nie jest przebudowywany.

## Testy i ich granice

Uruchomienie: `node dev-tests/run-regressions.mjs`.

**22/22 zestawy PASS**: 16 istniejących oraz 6 nowych. Nowe testy obejmują:

- modyfikatory, stosy stanów, brak podwójnego naliczenia, warunki efektów, EXP i audyt;
- zniżki aspektów, elementy, minimum OP, księgę, Przyspieszenie, źródła, Specjalny Manewr i pozostawienie nieokreślonych zniżek;
- zasoby, odnowienia, Przeczucie, wygaszenie Nadludzkiej Siły, Pierwszą Pomoc, przerzuty i migrację;
- tworzenie sceny/tokenów/Encounteru, szablony, uprawnienia MG i wycofanie tworzonych dokumentów po symulowanym błędzie;
- kontekstowe reakcje, brak prawa zapisu cudzej wiadomości, nieaktualne karty i ponowne naliczanie obrażeń;
- kolejność zakupów talentów, równoczesne kliknięcia w jednym kliencie i cofnięcie zakupu przy symulowanym błędzie zapisu EXP.

Dodatkowy test DOM w niewidocznej przeglądarce Edge sprawdził rzeczywiste nasłuchiwanie pól kreatora, przeliczanie zniżki Świętego Płomienia, synchronizację leczenia/celu własnego oraz brak duplikowania dodatkowego formularza. Test korzysta z atrap środowiska i danych selectów; nie jest pełnym renderowaniem aplikacji Foundry/Handlebars. Skrypt znajduje się w `dev-tests/browser/ability-dom.mjs` i wymaga Playwright oraz Edge.

Kontrole składni, JSON i komplet regresji są ponawiane po rozpakowaniu finalnego ZIP-a. Log weryfikacji towarzyszy paczce.

Nie potwierdzono działania z obcymi modułami, wszystkimi uprawnieniami kont graczy ani równoległym wydawaniem tego samego zasobu z dwóch komputerów. Kolejki operacji zapobiegają podwójnym kliknięciom w jednym kliencie; nie zastępują transakcji serwera pomiędzy klientami. Rejestrowanie walki i resety automatyczne wykonuje jeden aktywny MG.

## Dokumentacja API

Integracja tworzenia dokumentów opiera się na publicznym API Foundry V14: [Combat](https://foundryvtt.com/api/v14/classes/foundry.documents.Combat.html) i [Scene](https://foundryvtt.com/api/v14/classes/foundry.documents.Scene.html). Metadane zgodności V14 pochodzą z wersji bazowej; nie są deklaracją przeprowadzenia nowej pełnej sesji w VTT.
