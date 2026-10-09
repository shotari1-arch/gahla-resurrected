> Raport archiwalny. Aktualny kanon i stan wdrożenia: [REPORT-0.11.5.md](REPORT-0.11.5.md).

# Gahla Resurrected 0.11.0-beta — raport zmian

Data: 4 października 2026. Baza: ukończony build 0.10.0-beta, nie 0.9.6. Poprzednia paczka pozostaje zachowana. Nie utworzono PDF-a.

## Zmiany kanoniczne

| Obszar | Działanie w 0.11 |
|---|---|
| Ataki | Bonus = 2 pkt, krytyk = 4 pkt, bez sumowania i bez mnożenia kości. 01–05 zawsze trafia krytycznie, również przy ujemnym progu. Koszty wydawania punktów i aspekty Użycia obu rąk pozostają bez zmian. |
| Reakcje | reservedSZ przechowuje dolny próg już spalonych segmentów. Initiative jest aktualną pozycją. SZ 9, reakcja 3, akcja 5 → pozycja 4, próg 3, dostępny 1. Reakcja nie zwiększa kosztu następnej akcji. |
| Przeniesienie | Przycisk kończy działania postaci w rundzie, wydaje niewykorzystaną Reakcję i zachowuje pozostały budżet jako zaliczkę. Pierwsza zwykła akcja następnej rundy ma minimum 2 OP. Zaliczka jest jednorazowa. Zwykła akcja nie tworzy długu. |
| Akcje Długie | Koszt rozliczany przez kolejne rundy. Brak Reakcji i Przeniesienia. Czar zapisuje oczekujące rzucenie; test następuje dopiero na pozycji zakończenia countdownu. Po rozstrzygnięciu postać kończy działania w rundzie. Szok kasuje oczekujący czar i dług, bez zwrotu segmentów. |
| Jakość magii | Okno po rzucie wydaje 2/4 pkt oraz legalne premie źródła. Można zwiększyć istniejące parametry po normalnej cenie przyrostu; nie można dodać nowego aspektu. Dozwolone przekroczenie budżetu Tieru. OP pozostaje ustalone przed rzutem. Wybrane wzmocnienia i niewydane punkty są zapisane w karcie czatu. |
| Rodzaj obrażeń | Szkoła Półmaga → Magiczne; szkoła Kapłana → Duchowe, także dla Ognia. Kreator odrzuca Światło/Cień u Półmaga. Usunięto sprzeczne wyjątki rasowe z opisów tworzenia postaci. |
| Odporność | Nie ma aktywnego rzutu przeciw samym obrażeniom. Przyciski dodatkowych stanów wykonują osobne testy właściwej odporności. Wynik nie zmienia obrażeń. |
| Efektywne progi | Karta pokazuje tabelę Fizyczne/Magiczne/Duchowe × Próg I/II. Pasywna odporność jest dodana raz do progów. Uniwersalne oraz warunkowe modyfikatory progów przechodzą przez wspólny silnik. Brak wiersza obrażeń psychicznych i katastrofalnych progów na karcie. |
| Katastrofalne Rany | Dla bazowego zmodyfikowanego II = B i pasywnej redukcji R: próg 5 Ran to 2B+R, 6 Ran to 3B+R itd. Nie mnożymy R. Obrażenia <= R nadal dają 0 Ran. Granice standardowe zgodnie z nową specyfikacją: dokładnie I → 2 Rany, dokładnie II → 3 Rany. |
| Kumulacja i LW | Usunięto przycinanie zapisanych Ran do maksimum. Rany pozostają do leczenia. LW = k100 + 10 × łączny aktualny nadmiar Ran + 10 za bonus albo 20 za krytyk, z zachowaniem istniejących talentów. Pierwszy LW po pierwszym przekroczeniu; przy równym maksimum tylko Śmiertelnie Ranny. Nie ma licznika rzutów ani nowego progu śmierci. |
| Pancerz | Uszkodzenie uczestniczącego elementu o 1 trwale zmniejsza jego ochronę i Rany z trafienia o 1. Przy zbroi i tarczy można wybrać uczestniczący element. Usunięto przycisk anulowania wszystkich Ran za zniszczenie. Stary przycisk jest odrzucany. |
| Aura | Pula i prawo użycia są oddzielne. Noszona zwykła zbroja blokuje wydatek oraz regenerację, zachowując pulę i maksimum. Zdjęcie nie odnawia punktów. Tarcza nie blokuje. Zachowano Blokadę Aury i jawne wyjątki; własne uprawnienie może mieć modyfikator auraAccess. |
| Źródła Mocy | Baza +5; Tier = liczba slotów. W każdym: +10 testu, +1 maks. Aury, +1k10 konkretnego elementu lub +1/+2 punktów jakości. Konfiguracja na karcie źródła. Kość Ognia działa tylko z Ogniem. Kreator postaci nie oferuje błędnego pakietu +10 i punkt bonusu. |
| Przygotowanie | Przyciski zmieniają plan po Długim Odpoczynku. Aktualny zestaw nie zmienia się od kliknięcia. Edycja przygotowanej zdolności w kreatorze zapisuje projekt, stosowany przy odpoczynku. Użycie nieprzygotowanej zdolności jest blokowane. |
| Stany | Stany czarów otrzymują czas z aspektu Długość. Używany jest format ActiveEffect V14 oraz wygaszanie rundowe istniejącego subsystemu. Stosy/poziomy zachowane. Stany manewrów i zakupione Powalenie mają własne przyciski odporności oraz własne reguły usunięcia, bez domyślnego save co rundę. |
| Broń | Okno dobycia: pusta ręka i dozwolona sytuacja 0; pełna zmiana zestawu 3; trudny dostęp — wpisany koszt MG. Bezpośrednia zmiana checkboxem w walce nie omija ścieżki rozliczenia. |
| Ścieżka / Experience | Na 3, 6, 11 pozostają trzy oddzielne wpisy fabularnych Feature'ów, z instrukcją ustalenia z MG. Experience pozwala wskazać dowolną logicznie powiązaną cechę; nie jest przywiązane do OG. Nie dodano automatycznego Ułatwienia od samego Archetypu. |
| EXP za Los | Opcja świata domyślnie wyłączona. Po włączeniu panel MG udostępnia zatwierdzenie 10/100 EXP i wybór odbiorców. Sam wydatek Punktu Losu nie narzuca EXP. Tymczasowe Punkty nie kwalifikują się. |
| Boss | Limit 3 Ran/trafienie pozostaje. Usunięto objaśnienie ochrony z publicznego czatu; pole limitu jest dostępne MG. Dashboard zachowany. |

## Zachowanie funkcji wersji 0.10

Pozostają aktywne talenty i resety zasobów, rozwój EXP, audyt buildu, silnik modyfikatorów, narzędzia sesji, dashboard Bossów, tworzenie scen/tokenów/Encounteru, szablony starć, raport walki, hotbar i kontekstowe reakcje. Nowe obliczenia korzystają z istniejącego silnika; nie utworzono drugiego niezależnego subsystemu stanów.

Nie wdrożono brainstormów: zmiany ceny Penetracji, zamiany flat SF na kości, nowego talentu Koncentracja ani limitów LW. Istniejący wcześniej opis Osłony Koncentracji nie został rozwinięty o nową mechanikę.

## Migracje i kompatybilność

Nowy moduł canonical-runtime.mjs stosuje migrację oznaczoną canonicalVersion = 11. Uruchamia ją jeden aktywny MG. Jest powtarzalna i obejmuje przedmioty świata, aktorów, ich przedmioty i niepowiązanych aktorów tokenów w scenach. Importowane później przedmioty przechodzą tę samą normalizację.

- Nie zmienia EXP, kupionych poziomów talentów, wpisów Feature'ów ani zasobów talentów.
- Źródła zachowują pełny stary zapis w flags.gahla-resurrected.legacySource. Jednoznaczne +15 → slot test; +5 i wskazany element → slot elementu. Mieszane/nieznane pakiety nie są zgadywane: flaga sourceNeedsReview, komunikat audytu i konieczność wybrania slotów na karcie źródła.
- Czarom przypisuje typ obrażeń według szkoły. Nieznana szkoła lub dawny niedozwolony element wymagają poprawienia w kreatorze. Stary projekt nie jest usuwany.
- Aktualny zestaw przygotowanych zdolności jest początkowym planem; migracja nie przełącza go sama.
- Stary Tracker zachowany w legacyTracker. Stare długi, których efekty mogły już zostać rzucone, nie są odtwarzane jako nowe czary. Oznaczenie trackerNeedsReview zgłasza MG konieczność rozliczenia trwającej walki; nie rozstrzyga efektu drugi raz.
- Stare jawne rundowe duration efektu jest konwertowane do formatu V14 z zachowaniem starego zapisu. Efekty bez ustalonego czasu nie dostają wymyślonej długości ani automatycznych testów co rundę.
- Historyczny czat pozostaje archiwum. Starych wyników obrażeń nie przelicza się wstecz; bieżące trafienie należy rzucić nową kartą. Pełne zniszczenie pancerza jest blokowane także ze starego przycisku.
- Paczka bazowa nie zawierała binarnych compendiów. Aktualizowano kod biblioteki/kreatora, dane JSON i migrację Itemów. Nie modyfikowano zewnętrznych zamkniętych compendiów użytkownika.

## Testy

26/26 zestawów regresyjnych PASS: wszystkie 22 istniejące zestawy (z poprawionymi oczekiwaniami nowych zasad), cztery nowe zestawy kanoniczne. Żaden stary zestaw nie został usunięty.

Nowe przypadki: automatyczny krytyk przy progu ujemnym; brak mnożenia kości; reakcja 9/3/5; jednorazowa zaliczka i minimum 2; długi czar 20 przy SZ 9; brak rzutu przed końcem; countdown przy innych uczestnikach; Szok; pierwszy nadmiar Ran i kolejne LW od całej puli; 280 000 porównań matematyki progów z odjęciem odporności; progi typów i modyfikatory warunkowe; Aura/zbroja/tarcza/odpoczynek; Źródła i brak kości niepasującego elementu; zakaz Światła/Cienia; legalne wzmocnienia istniejących aspektów; osobne testy stanów; czas stanu; pancerz rzeczywiście uczestniczący; idempotentne migracje; syntetyczni aktorzy; blokady przygotowania.

Kontrola składni: 61 modułów JavaScript, 6 plików JSON, 0 błędów. Test DOM w Edge ponownie PASS: rzeczywiste zdarzenia pól kreatora, zniżka Świętego Płomienia, pola dodatkowe i brak duplikatów. Korzysta z atrap Foundry i częściowo przygotowanego szablonu — nie jest sesją VTT. Nie było zainstalowanego pakietu Handlebars do osobnej pełnej kompilacji szablonów.

Nie przeprowadzono pełnego runtime Foundry VTT V14 ani testu dwóch komputerów. Schemat czasu trwania sprawdzono w oficjalnej dokumentacji [EffectDurationData](https://foundryvtt.com/api/v14/interfaces/foundry.documents.types.EffectDurationData.html) i [EffectStartData](https://foundryvtt.com/api/v14/interfaces/foundry.documents.types.EffectStartData.html); integrację kolejki względem [Combat V14](https://foundryvtt.com/api/v14/classes/foundry.documents.Combat.html). Zgodność 14.368 w manifeście odziedziczona z bazy nie oznacza nowego testu pełnej sesji.

## WIP i miejsca wymagające MG

- Zachowane oznaczenia WIP tabel i zdolności. Tabela LW oraz trwałe konsekwencje nie otrzymały nowych zatwierdzonych efektów, progów śmierci ani automatycznego nakładania amputacji.
- Własne efekty, niepodane liczbowo zniżki i limity Specjalnego Manewru pozostają do decyzji MG, tak jak w 0.10.
- Długość 0 dla trwałego stanu nie jest zamieniana arbitralnie na jedną rundę: komunikat prosi o rozstrzygnięcie natychmiastowego efektu. Nie określono przelicznika rund na sekundy poza walką. Pchnięcie wylicza odległość, MG wybiera kierunek tokena.
- Historyczne złożone czary bez builderState mogą być rzucane, lecz rozdzielanie jakości na ich aspekty wymaga odtworzenia struktury w kreatorze. System nie odgaduje aspektów z wolnego opisu.
- Wzmocnienia obrażeń, penetracji i długości stanów są używane przez odpowiednie przyciski. Pozostałe parametry wybranego czaru są zapisane w karcie, do rozliczenia według ich opisu; dowolne efekty narracyjne nie są automatycznie interpretowane.
- Dobycie za 0 wymaga rzeczywiście pustej ręki oraz potwierdzenia dozwolonej sytuacji w oknie; zaskoczenie i dostępność ekwipunku ocenia prowadzący. Dla pełnego zestawu należy świadomie wskazać wyposażenie; system nie zgaduje zawartości plecaka.
- Progi na granicy I/II zmieniają dawną interpretację nierówności na nowszą specyfikację (od progu). Samo przesunięcie odporności zachowuje matematykę, również dla katastrofalnych i zerowych obrażeń.
- Dla NPC zachowano wcześniejszą pulę Ran combat.wounds.max jako limit krytycznego zranienia; Boss nie traci swojego mnożnika puli. Płotki i Żołnierze nadal rozliczają HP zgodnie z bazą.
- Kolejki chronią przed wielokrotnym kliknięciem w jednym kliencie; nie zastępują transakcji serwera pomiędzy kilkoma klientami. To nadal wersja beta.

## Instalacja

Rozpakuj ZIP do katalogu Data/systems/gahla-resurrected tak, aby system.json leżał bezpośrednio w tym katalogu. Uruchom świat kontem MG. W audycie postaci sprawdź zgłoszenia źródeł i starych długów; źródła poprawia przycisk „Wybierz umagicznienie”. Zestaw przygotowanych zdolności zmienia „Długi Odpoczynek”. Przed grą sprawdź swoją kopię świata z kontem gracza.

## Pliki zmienione względem 0.10.0

- CHANGELOG.md
- MANIFEST-INSTALL.md
- README.md
- data/lingering-wounds.json
- dev-tests/boot-smoke.mjs
- dev-tests/canonical-actor-regression.mjs
- dev-tests/canonical-effects-regression.mjs
- dev-tests/canonical-migration-regression.mjs
- dev-tests/canonical-rules-regression.mjs
- dev-tests/combat-integration-regression.mjs
- dev-tests/core-regression.mjs
- dev-tests/rules-regression.mjs
- dev-tests/tracker-regression.mjs
- docs/REPORT-0.11.0.md
- docs/TEST-RESULTS-0.11.0.txt
- gahla-resurrected.mjs
- module/ability-automation.mjs
- module/ability-builder.mjs
- module/armor-rules.mjs
- module/automation-rules.mjs
- module/automation-runtime.mjs
- module/canonical-rules.mjs
- module/canonical-runtime.mjs
- module/combat.mjs
- module/context-reactions.mjs
- module/creator.mjs
- module/data-models.mjs
- module/documents.mjs
- module/effects-engine.mjs
- module/rules.mjs
- module/session-tools.mjs
- module/setup.mjs
- module/sheets.mjs
- module/spell-quality.mjs
- module/tracker-rules.mjs
- module/tracker.mjs
- styles/gahla.css
- system.json
- templates/actor/character-sheet.hbs
- templates/apps/initiative-tracker.hbs
- templates/apps/session-panel.hbs
- templates/item/item-sheet.hbs
