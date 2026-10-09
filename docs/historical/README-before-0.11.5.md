# Gahla Resurrected 0.11.0-beta

Aktualne zasady i migracje: [raport 0.11](docs/REPORT-0.11.0.md). Baza: ukończona 0.10.0-beta. Sekcje wcześniejszych wersji poniżej są historią zmian; reguły 0.11 mają pierwszeństwo.

# Gahla Resurrected — Foundry VTT V14

Wersja: **0.10.0-beta**

## 0.10.0-beta — automatyka i narzędzia sesji

Pełny zakres, instrukcja migracji, testy i ograniczenia: [raport wydania](docs/REPORT-0.10.0.md).

Na karcie postaci: **Aktywne talenty**, **Rozwój postaci**, **Audyt buildu**. W katalogu Actorów MG: **Gahla — Panel sesji MG**. Generator Starć pozwala zapisać szablon oraz rozstawić nową scenę z Encounterem i Trackerem. Narzędzia i aktywne talenty można przeciągać na hotbar.

To wersja beta. Testy automatyczne używają atrap API Foundry; pełna sesja wieloosobowa w V14 wymaga osobnego sprawdzenia. Zdolności bez reguły wykonawczej pozostają opisowe, zgodnie z raportem.


To jest pełna wersja systemu oparta na dostarczonym **Gahla Resurrected — Kompendium Mechaniczne** oraz **Przewodniku Gracza na Sesję 0**. Reguły oznaczone w materiałach jako **WIP / w opracowaniu / do potwierdzenia przez MG** pozostają jawnie WIP i system nie dopisuje ich własną interpretacją.

## 0.9.6-beta — balans talentów i most Mnicha

- **Żywotny**: +1/+2/+3/+4 ŻYW; **Celny Cios**: +5/+10/+15/+20 do trafienia w zwarciu; **Mistrzostwo Aury**: +2/+3/+4/+5 maks. Aury.
- **Szkolenie Oręża** daje +1 dodatkowy punkt bonusu za poziom talentu przy sukcesie z bonusem lub krytyku; krytyk nie podwaja już premii samego talentu.
- **Mistrz Broni** zachowuje +10 trafienia, ale obejmuje 1/2/3/4 wybrane rodzaje broni zamiast skalować sam bonus trafienia.
- **Krwisty Metabolizm** daje pulę 1/2/3/4 użyć Ułatwienia do wybranych testów po wypiciu krwi; niewykorzystana pula wygasa po scenie/odpoczynku.
- **Szarża Taurosa** liczy dodatkowe kości z bazowego SF przed chwilowymi mnożnikami i ma limit `Tier + 2 k10`.
- **Wszechstronny** działa przy zakupie statystyk maksymalnie raz na poziom postaci.
- **Skóra jak Kora** ma maks. 3 poziomy: +1/+1/+2 pancerza bez zbroi; od T2 +5 Odp. Fiz., od T3 łącznie +10. Pancerz talentu działa z Aurą.
- **Przeczucie Przyszłości** wymaga zadeklarowania podmiany zapisanym wynikiem przed rzutem.
- Talenty przerzutów bojowych/magicznych/kapłańskich mają progresję 1/1/2/2 użycia na walkę.
- Redukcje OP mogą się sumować, ale nie przebijają minimalnego OP akcji, chyba że efekt mówi wprost inaczej. Przeładowanie ma minimum 1 segment.
- Tymczasowe Punkty Losu nie dają EXP za wydanie i nie mogą uruchamiać efektu tworzącego kolejny Punkt Losu. **Sanktuarium Eruela** na T4 leczy daną postać najwyżej raz na rundę.
- Talenty binarne mogą mieć maksymalny poziom 1; Drzewko Talentów, biblioteka i arkusz Itemu respektują `maxLevel`.
- **Szkolenie Mnicha** pozostaje celowo mocnym, specjalnym mostem dla Ścieżki `Ojczulek / Księżyna`, ale ma dwa poziomy: T1 daje Walka Wręcz, ręce/nogi jako broń, +20 BGŁ i +1k10 bez broni oraz dostęp do talentów Wojownika/Łowcy do połowy Tieru Kapłana (zaokrąglonej w górę); T2 podnosi pakiet łącznie do +30 BGŁ, +10 Obrony i +1 SZ.
- `Pamięć Krwi` i wszystkie pozostałe mechaniki wcześniej oznaczone **WIP** pozostają WIP.

## 0.9.5-beta — SBSM v3: poziom zamiast Tieru + ochrona Bossa

- Generator rozdziela **Tier tagów** od **poziomu bojowego**. Tier określa dostęp do tagów/specjalnych zdolności, a BGŁ, Obrona, ŻYW/HP, pula Ran, cechy i odporności skalują się z poziomem referencyjnym drużyny.
- Poziom referencyjny NPC = średni poziom wybranej drużyny, zaokrąglony do najbliższej liczby całkowitej (1–11). Bez wybranej drużyny używane jest minimum poziomu danego Tieru: T1=1, T2=2, T3=5, T4=8.
- BGŁ i Obrona NPC: +10 za każdy poziom powyżej 1; ŻYW i pula Ran: +1/poziom; cechy: +5/poziom; odporności: +2/poziom poza wzrostem wynikającym z cech. Kości obrażeń rosną wolniej — o +1k10 wraz z tierem mocy wynikającym z poziomu (lvl 1 / 2–4 / 5–7 / 8–11). SZ dostaje +1 na poziomach 3, 6 i 11.
- **PP v3 = Σ(Poziom × bazowa SZ / 5)**. **MC v3 = ilość × mnożnik kategorii × poziom bojowy × bazowa SZ / 5**. Stare v2/v1 pozostają w Generatorze diagnostycznie.
- Boss z generatora ma `Limit Ran / trafienie = 3`: jedno trafienie nie może zadać mu więcej niż 3 Rany, niezależnie od tego, ile Ran wynikałoby z progów. Karta obrażeń pokazuje, kiedy limit zadziałał.
- Rozliczanie stanu krytycznego i Trwałych Ran NPC używa rzeczywistej puli `combat.wounds.max`, więc Boss z pulą Ran ×3 nie jest traktowany jako przekraczający limit już po przekroczeniu samego ŻYW.
- Płotka ma jawnie 0 Reakcji w danych i model danych pozwala NPC mieć 0 Reakcji.


## 0.9.4-beta — scroll Generatora i skrót do Trackera

- Generator Starć zachowuje pozycję głównego scrolla także po wyborze/odznaczeniu tagu przeciwnika oraz innych rerenderach formularza.
- Przywrócono pojedynczy, kompaktowy przycisk **Tracker Gahla** u góry natywnej zakładki Encounter/Combat Tracker Foundry. Pełny stary mini-panel nie wraca.

## 0.9.3-beta — Trwałe Rany, audyt tabel i dialogi

- Zaimportowano dostarczone tabele Trwałych Ran: broń sieczna, obuchowa, strzały/bełty i broń palna.
- Dodano profil **broń kłuta** jako jawną adaptację **WIP** oraz zachowano tabelę żywiołową jako **WIP**, ponieważ źródłowy arkusz był oznaczony jako AI.
- Po przekroczeniu ŻYW system oblicza wynik LW, uwzględnia +10 za sukces z bonusem / +20 za krytyk oraz bonusy talentów, a następnie pokazuje dopasowany skutek tabeli w czacie. Trwałych konsekwencji nie nakłada automatycznie — zatwierdza je MG.
- Karta broni ma wybór profilu Trwałej Rany; istniejące bronie migrują do `Automatycznie wg broni`.
- Tabela Pechów została porównana z dostarczonym arkuszem i oczyszczona z niespójnej terminologii.
- Wiersze Trwałych Ran zawierające mechaniki bez odpowiednika w Gahli (np. procentowa śmierć lub infekcja) są jawnie oznaczane WIP w karcie czatu.
- Fizyczny krytyk nie nakłada już jednocześnie premii za sukces z bonusem: w 0.11 daje 4 punkty bonusu bez mnożenia kości.
- Poszerzono dialog rozdzielania punktów bonusu oraz ustawiono bezpieczne rozmiary dla pozostałych dłuższych dialogów. CSS dialogów ma ograniczenie wysokości i własny scroll zamiast ucinania treści.
- Przeprowadzono audyt pozostałych arkuszy HTML. Zasady oznaczone jako WIP pozostają WIP; szczegóły w `docs/TABLES-AUDIT-0.9.3.md`.

## 0.9.2-beta — progi obrażeń, HP przeciwników, kreator i UX czatu

- Kreator postaci pokazuje bazy rasy i Ścieżki Życia oraz filtruje startowe talenty archetypowe do prawidłowych wyborów T1.
- Osobiste Punkty Losu mają przyciski +/− na karcie postaci.
- Poprawiono granicę ciężkich obrażeń: dokładnie 2× najwyższy próg = 5 Ran; kolejne wielokrotności dają +1 Ranę.
- Płotki i Żołnierze używają HP zamiast progów Ran (odpowiednio ŻYW×5 i ŻYW×10).
- Przy pierwszym uruchomieniu 0.9.2 istniejący wygenerowani przeciwnicy tych dwóch kategorii są migrowani do nowych pul HP z zachowaniem już otrzymanych obrażeń.
- Generator Starć i wybory w kreatorze/drzewku zachowują pozycję scrolla.
- Karty testów/ataku/obrażeń mają jasny, kontrastowy motyw niezależny od ciemnego motywu Foundry.

## 0.9.1-beta — UX walki, Aura defensywna i statystyki NPC

- arkusze i narzędzia zachowują pozycję scrolla po rerenderze,
- Aura jest rozliczana wyłącznie defensywnie przed rzutem obrażeń; usunięto ogólną ofensywną akcję Aury,
- karty czatu ataku/parowania/obrażeń dostały krokowy układ, jawną pulę kości i wyniki każdej k10,
- generator nadaje NPC bazowe SF/ZR/PER/ER/UM/OG/WIA zależne od archetypu, Tieru i kategorii,
- edycja NPC została przeniesiona do ostatniej zakładki „Edycja NPC”.


## Wymagania

- Foundry VTT **V14.x**.
- System wymaga minimum V14; manifest jest przygotowany pod V14.368.

## Tworzenie postaci: kreator jako źródło danych

Nowa postać typu **character** jest tworzona przez Kreator postaci. W katalogu Aktorów znajduje się jawny przycisk **Kreator postaci** obok standardowego tworzenia. Nadal działa też drugi wariant: standardowa próba utworzenia Aktora typu `character` jest przechwytywana i kieruje do kreatora. Kreator prowadzi przez gotowe elementy: rasę, archetyp, Ścieżkę Życia, rzuty startowe, talenty, Źródło Mocy i wyposażenie. Dopiero po zatwierdzeniu powstaje gotowy Actor.

Statystyki na karcie postaci są **wartościami wyliczanymi** z danych utworzenia i rozwoju, dlatego są prezentowane jako pola tylko do odczytu z rozbiciem źródeł. Zmiany rozwoju wykonuje się przez mechanizmy EXP/kreatora, a nie przez ręczne nadpisywanie wyniku końcowego.

Zmiana **Ścieżki Życia** w kreatorze natychmiast aktualizuje podgląd statystyk oraz pokazuje jej przyrosty rozwojowe.

Starsze lub surowo utworzone postacie, które nie mają danych kreatora, są oznaczane na karcie ostrzeżeniem i można dla nich otworzyć kreator ręcznie.

## Instalacja ZIP

Rozpakuj **zawartość** archiwum bezpośrednio do:

```text
Data/systems/gahla-resurrected/
```

Końcowa struktura musi wyglądać tak:

```text
Data/
└── systems/
    └── gahla-resurrected/
        ├── system.json
        ├── gahla-resurrected.mjs
        ├── module/
        ├── templates/
        ├── styles/
        └── lang/
```

Nie może powstać dodatkowy poziom `gahla-resurrected-vX/...` wewnątrz katalogu systemu.

## Szybkie akcje podczas sesji

Zakładka **Walka** jest punktem startowym dla najczęstszych czynności. **Atak / manewr** pozwala wybrać wyposażoną broń, przygotowany manewr, ręczny modyfikator oraz opcjonalny atak celowany (−30) z konkretną lokacją. **Rzuć zaklęcie / cud** pozwala wybrać przygotowaną zdolność i pokazuje jej opis oraz najważniejsze parametry jeszcze przed rzutem.

Kreator Manewru korzysta z aktualnie wyposażonej broni jako bazy. Jeśli postać ma kilka wyposażonych broni, baza jest wybierana z listy; dane broni nie są ręcznie kopiowane do manewru. Manewr nadal zapisuje tylko delty nakładane na broń podczas ataku.

Itemy można usuwać z list na karcie Aktora przez ikonę kosza albo z własnego ItemSheetu przez przycisk **Usuń** z potwierdzeniem.

## Co system obsługuje

### Tworzenie postaci

- pełne grywalne rasy z Przewodnika,
- płeć M/K tam, gdzie źródło rozdziela wartości,
- wszystkie opisane archetypy,
- wszystkie dostępne Ścieżki Życia,
- rzuty startowe ŻYW 1k3 i pozostałych cech 1k10,
- startowe BGŁ, SZ i Obrona,
- odporności rasowe i archetypowe,
- Jestestwo rasy,
- wybór talentu rasowego,
- 2 talenty ogólne albo 1 archetypowy,
- 2 dodatkowe losowe talenty dla Człowieka,
- wybór talentu bóstwa dla Kapłana,
- Źródło Mocy dla Półmaga/Kapłana,
- startowy ekwipunek Tier 1 dla Wojownika/Łowcy/Bestii,
- Experience i 100 EXP.

### Rdzeń testów

- przed testem k100 opcjonalny ręczny modyfikator od −40 do +40, sumowany z automatycznymi bonusami/karami,
- k100 ≤ cecha,
- krytyk 01–05,
- sukces z bonusem ≤ połowy celu,
- krytyczna porażka 96–100,
- Ułatwienie/Utrudnienie przez odwrócenie cyfr,
- dublety są przerzucane przy Ułatwieniu/Utrudnieniu,
- Punkty Losu.

### Walka

- dialog ataku wybierający wyposażoną broń, opcjonalny przygotowany manewr i ręczny modyfikator; manewr jest liczony jako nakładka na faktycznie wybraną broń,
- Szybkość i segmenty zamiast inicjatywy,
- natywny Tracker Inicjatywy inspirowany trackerem HTML: reakcje od dołu, zaliczka po zakończeniu rundy, Akcje Długie z opóźnionym rozstrzygnięciem, BOSS z 3 reakcjami, cofanie zmian,
- opóźnienia akcji,
- Unik i Parowanie,
- trafienie i Obrona,
- lokacje trafienia,
- punkty bonusu z trafienia,
- pancerz na sześciu lokacjach ciała z mapą na karcie; zbroja wnosi wartości tylko na zapisane lokacje, a tarcza dodaje +1/+2 do jednej wybranej lokacji,
- Penetracja,
- obrażenia fizyczne i magiczne,
- odporności pasywne,
- Aura,
- progi Ran,
- Śmiertelne Zagrożenie,
- LW Score dla Trwałych Ran,
- opcjonalne Deadly CRITS,
- podstawowa obsługa statusów.

### Magia i cuda

- dialog rzucania wybierający przygotowane zaklęcie/cud i ręczny modyfikator,
- koszt czaru z aspektów,
- natywny Kreator Zdolności 1.5 dla zaklęć/cudów z liczbowymi aspektami i ryzykami Półmaga,
- natywny Kreator Manewrów z bilansem gwiazdek i zapisem **delt** do zwykłego ataku (kości, OP, trafienie, Penetracja), zamiast tworzenia osobnej „broni manewru”,
- minimalne opóźnienie 4/5/6/7,
- Źródła Mocy,
- bonus testu i bonusy efektów źródła,
- obrażenia, penetracja, elementy, buffy i debuffy,
- stany,
- zasięg, cele i długość,
- Ryzyka Półmaga,
- tabele Pecha magicznego i Gniewu Bożego.

### Manewry i sekwencje

- osobna zakładka **Manewry** na karcie postaci,
- manewr jest nakładką na aktualnie wybraną broń: bazowe obrażenia, OP i Penetracja pochodzą z broni, a manewr zapisuje tylko modyfikatory,
- koszt `*` można opłacić przez −1k10 obrażeń, +1 OP lub −10 do trafienia zgodnie ze źródłem,
- **Użycie obu rąk** działa wyłącznie z bronią 1,5- lub 2-ręczną i dodaje połowę bazowych kości broni zaokrągloną w górę,
- Szybki respektuje minimalne OP rodzaju broni,
- przygotowywanie manewrów i bezpośrednie wykonanie z wyborem wyposażonej broni,
- tabela Pecha przy krytycznej porażce.

### Ekwipunek, metale i runy

- osobna zakładka **Ekwipunek** z mapą pancerza Głowa / obie ręce / Korpus / obie nogi,
- broń z tabeli Tier 1,
- zbroje i tarcze z pancerzem liczonym per lokacja; tarcza ma szybki wybór chronionej części ciała,
- cechy broni,
- metale/fachy rzemieślnicze,
- runy przedmiotowe,
- podstawowe efekty run na statystyki, odporności, obronę, pancerz, obrażenia, penetrację, magię, elementy i Ułatwienia.

### Rozwój

- edytowalne Experience i Special Features wpisywane przez gracza,
- EXP jako waluta,
- limity rozwoju statystyk zależne od Tieru,
- zakup talentów za 50×/100× Tier,
- nauczyciel −50%,
- poziomy 1–11,
- automatyczne +1 ŻYW / +10 BGŁ / +10 Obrony od 2 poziomu,
- +1 SZ na 3/6/11,
- Experience i Special Feature przechowywane na karcie.

## Biblioteka talentów

Przycisk **Wczytaj broń, zbroje, talenty** w **Gahla — Narzędzia** porządkuje światową bibliotekę do folderów zamiast jednej płaskiej listy. Talenty trafiają do osobnych folderów **Rasowe**, **Ogólne**, **Archetypowe**, **Specjalne** i **Boskie**, a talenty boskie dodatkowo do podfolderów konkretnych bóstw. Ponowne uruchomienie tej funkcji migruje starszą bibliotekę 0.4.0 do nowego układu i usuwa duplikaty wygenerowane przez dawny błąd seeda.

Na karcie postaci zakładka **Talenty** pokazuje wyłącznie talenty już posiadane przez postać, pogrupowane na Rasowe, Ogólne, Archetypowe, Specjalne i Boskie. Pełna biblioteka nie jest renderowana razem z kartą.

Zakup i ulepszanie odbywa się w osobnym oknie **Drzewko talentów**. Okno ma wyszukiwarkę, filtry kategorii, filtr talentów posiadanych/dostępnych, koszt następnego poziomu oraz zależności źródłowe. Połączenia drzewa są tworzone tylko wtedy, gdy pole wymagań wprost wymienia inny talent; pozostałe wymagania pozostają tekstem źródłowym i system ich nie dopowiada.

## Jawne punkty audytu mechaniki

Dwa opisane w źródłach zachowania pozostają w tym buildzie celowo niewymuszane, aby nie zmienić przebiegu istniejących światów bez decyzji MG/projektowej:

- zmiana zestawu trzymanej broni podczas walki: źródło podaje koszt **3 segmentów**;
- zmiana przygotowanych manewrów: źródło wiąże ją z **długim odpoczynkiem**.

Interfejs nadal pozwala na bardziej swobodne wyposażanie/przygotowanie. Nie są to WIP źródła — to jawne luki automatyzacji do ewentualnego zaostrzenia w kolejnej wersji.

## Jawne WIP

Poniższe rzeczy pozostają WIP, ponieważ w materiałach źródłowych nie są jeszcze domknięte:

- **Multiklasowość**.
- **Pamięć Krwi**.
- **Łączenie żywiołów**.
- **Skutki Trwałych Ran** — przewodnik podaje wzór LW Score, ale nie pełną tabelę konsekwencji.
- **Broń dystansowa** — w Przewodniku znajduje się nagłówek tabeli, ale brak wartości broni.
- **Kevru, Lud Stali i Niziołki** jako pełnoprawne rasy grywalne.
- **Poziomy powyżej 11**.
- **Warunek/Trigger przemiany Therianina**.
- Miejsca, w których źródło wskazuje „do ustalenia z MG”.
- Sprzeczne wzory testu wykuwania runy: system używa wersji z Przewodnika i oznacza temat jako wymagający potwierdzenia.

W żadnym z tych miejsc system nie tworzy własnej reguły udającej kanon Gahla.


## Encounter / Tracker Gahla (0.9.0-beta)

Natywny **Combat Tracker Foundry** pozostaje czystym, małym widokiem Encounteru. Gahla przechowuje aktualne segmenty na Actorze, a initiative Combatanta pokazuje aktualną pozycję segmentową; dolny próg spalonych reakcji zmniejsza dostępny budżet, nie initiative. Ręczna korekta initiative aktualizuje segmenty Aktora, a wydawanie segmentów przez atak, manewr, czar/cud albo pełny Tracker natychmiast aktualizuje Encounter.

Pełne sterowanie Gahlą znajduje się w osobnym oknie **Tracker Gahla**. Kolejność nie jest klasyczną listą „każdy raz na turę”: po każdej akcji system ponownie wybiera postać z największą pozostałą SZ. Nowa runda zaczyna się dopiero wtedy, gdy wszyscy niepokonani uczestnicy mają 0 dostępnej SZ.

Zwykły czar/cud w Encounterze zużywa zapisane OP tak samo jak atak bronią. Zaklęcia posiadające aspekt **Reakcja** można zadeklarować jako reakcję za 4 segmenty w dialogu rzucania.

## Visual pass 0.8

Tracker, Kreator Zaklęć/Cudów, Kreator Manewrów, Kreator Postaci i Narzędzia MG korzystają teraz ze wspólnej hierarchii wizualnej: nagłówek → kontekst → kroki/sekcje → wynik. Dialog wyboru ataku ma szerokość 780 px, a dialog magii 760 px, dzięki czemu opisy i podglądy nie są ściskane w wąskim oknie.

## Diagnostyka arkusza V14

Wersja 0.9.0-beta zachowuje naprawy startu z 0.3.3-beta i workflow kreator-first z 0.4.0. Karta jest ułożona według czynności gracza: **Postać / Walka / Ekwipunek / Manewry / Talenty / Magia-Cuda / Rozwój**. Progi obrażeń są stale widoczne pod nagłówkiem i dodatkowo powiększone w Walce, Ekwipunek pokazuje mapę pancerza lokacyjnego, a Experience/EXP są skupione w Rozwoju. Jeżeli po aktualizacji świat nadal był wcześniej przypięty do generycznego arkusza core, system przy `ready` usuwa wyłącznie przypięcia `core.*` dla dokumentów Gahla i ponownie preferuje `GahlaActorSheet`/`GahlaItemSheet`. Nie nadpisuje arkuszy dostarczanych przez inne moduły.

W konsoli Foundry dostępne są:

```js
game.gahla.debugSheets()
await game.gahla.repairSheets()
```

Pierwsza funkcja pokazuje klasy dokumentów, domyślne arkusze i ewentualne stare przypięcia; druga ponawia naprawę.

## Narzędzia GM

W menu ustawień systemu znajduje się **Gahla — Narzędzia**:

- kreator postaci,
- tracker inicjatywy,
- kreator zaklęć/cudów i manewrów 1.5,
- wczytanie biblioteki Itemów,
- grupowe Punkty Losu,
- lista jawnych WIP.

## Makra na hotbarze

Przyciski **Atak / manewr** oraz **Zaklęcie / cud** na karcie są przeciągalne. Upuszczenie ich na pasek makr Foundry tworzy makro przypisane do danego Aktora. Kliknięcie makra nie omija interfejsu Gahli — otwiera normalny popup wyboru wyposażonej broni/manewru albo przygotowanego czaru/cudu. Jeśli powiązany Actor nie istnieje, makro próbuje użyć aktualnie zaznaczonego tokena lub postaci użytkownika.

## NPC i Generator Starć

Aktory typu **Płotka (Minion), Żołnierz, Elita, Boss i Część Bossa** nie korzystają z Kreatora Postaci. Ich karta ma bezpośredni edytor wartości potrzebnych MG: Tier, BGŁ, SZ, Obrona, cechy, ŻYW, pula Ran/HP, bazowe kości ataku, odporności, Aura, naturalny pancerz, reakcje i bonus progów. Dzięki temu ręcznie utworzony Goblin jest normalnie edytowalnym przeciwnikiem.

W **Gahla — Narzędzia** i katalogu Actorów znajduje się **Generator Starć** oparty na dostarczonym `bestiary_tags.json`. Wybiera drużynę z istniejących Actorów, buduje Płotki/Żołnierzy/Elity/Bossów, pilnuje budżetu TP i Tieru tagów, pokazuje statystyki oraz tworzy gotowych Actorów w folderze `Gahla — Przeciwnicy`. Tagi są zapisywane jako opisowe zdolności; generator nie wymyśla automatyzacji dla efektów, których tekst wymaga sytuacyjnej decyzji MG.

Generator używa teraz **SBSM v3**. PP liczy każdą postać osobno jako `Σ(Poziom × bazowa SZ / 5)`, a MC używa poziomu bojowego przeciwnika i jego bazowej SZ. Tier przeciwnika jest oddzielony od surowych statystyk: steruje dostępem do tagów/specjalnych zdolności, natomiast BGŁ, Obrona, ŻYW/HP, cechy i odporności reagują na średni poziom wybranej drużyny. W szczegółach diagnostycznych nadal widać v2 (Tier) i v1. Progi trudności pozostają heurystyką wymagającą kalibracji na sesjach.

## Testy deweloperskie

W katalogu `dev-tests/` znajdują się testy regresyjne mechaniki, kreatorów, trackera i Drzewka Talentów oraz test `boot-smoke.mjs`. Boot-smoke ładuje główny moduł z atrapą publicznego API Foundry V14, wykonuje `init`, sprawdza domyślne arkusze, uruchamia `_prepareContext()` dla Actor/Item/Drzewka Talentów i weryfikuje akcje ApplicationV2 z template’ów.

Przed użyciem kampanijnym zalecany jest test w rzeczywistym kliencie Foundry VTT V14 z włączoną konsolą deweloperską.

## Kreator Manewrów — czysta baza broni

Od 0.7.2 kreator nie startuje z demonstracyjnym „Miażdżącym Ciosem”. Punktem wyjścia jest dokładnie atak aktualnie wyposażonej broni. Aspekty tworzą koszt w `*`, a dopiero osobna sekcja płatności pozwala zapłacić każdą gwiazdkę przez −1k10 obrażeń, +1 OP albo −10 trafienia. `Użycie obu rąk` i `Szybki` są osobnymi modyfikacjami niezależnymi od budżetu `*`.

## Kanoniczny zapis Itemów (0.9.0-beta)

System używa jednego `GahlaItemData` dla wszystkich typów Itemów, ale każdy typ odczytuje tylko właściwe pola:

- **weapon** — `damage`, `delay`, `hands`, `penetration`, `traits`, `runes`, metal i stan wyposażenia;
- **armor** — pancerz bazowy, `locations` per część ciała, tarcza/lokacja tarczy, redukcja niskich kości, runy i metal;
- **equipment** — opis, kategoria, Tier, wymagania, cechy oraz stan wyposażenia po osadzeniu na Actorze;
- **maneuver** — od wersji nakładkowej v2 zapisuje przede wszystkim delty `maneuverDamageDiceDelta`, `maneuverDelayDelta`, `maneuverHitMod`, `maneuverPenetrationBonus`, `maneuverHalfWeaponDice`, `maneuverExtraTargets`; bazowa broń nie jest częścią manewru;
- **spell** — koszt aspektów, końcowe OP (`delay`), minimum OP, test, zasięg/cel/czas, obrażenia, element, aspekty i ryzyka. `builderState` pozostaje kopią danych kreatora, ale mechanika nie powinna polegać wyłącznie na nim;
- **talent/rune/powerSource** — własne pola opisowe i mechaniczne zgodne z modelem danych.

Pola będące `ArrayField` (`traits`, `runes`, `aspects`, `risks`, `effects` itd.) są zawsze zapisywane jako tablice. Arkusz pozwala wpisywać cechy i runy tekstowo, ale przed aktualizacją dokumentu rozdziela przecinki/nowe linie i normalizuje je do tablicy. Dzięki temu walidacja Foundry V14 nie odrzuca całej edycji Itemu z powodu jednego pola o złym typie.
