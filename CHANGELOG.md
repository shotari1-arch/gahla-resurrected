Aktualna wersja: [0.11.9-beta](CHANGELOG-0.11.9.md). Poniżej historia starszych wydań.

# 0.11.0-beta — kanoniczne zasady walki i magii

- Delta względem ukończonego 0.10.0; zachowane narzędzia automatyki.
- Punkty jakości zamiast mnożenia kości; krytyk 01–05 automatyczny.
- Reakcje od dołu, Przeniesienie z minimum 2, opóźnione rozstrzyganie Akcji Długich i przerwanie Szokiem.
- Efektywne trzy typy progów, kumulacja Ran, LW +10 od całego nadmiaru, uszkodzenie pancerza −1.
- Magia Magiczna / Cuda Duchowe; Światło i Cień tylko kapłańskie. Jakość magii i konfigurowalne źródła.
- Aura niezależna od dostępu, plany przygotowania po odpoczynku, długość stanów V14, broń i Experience.
- Migracja 11, zachowanie niejednoznacznych źródeł do decyzji MG, 26 zestawów regresji.
- Szczegóły i ograniczenia: docs/REPORT-0.11.0.md.

# 0.10.0-beta — 2026-10-04

- Wspólny silnik modyfikatorów i deklaratywne aktywacje talentów.
- Zasoby walki/sceny/sesji, deklarowane wyniki k100, przerzuty i Pierwsza Pomoc.
- Kreator: dodatkowe aspekty, zniżki, Źródło Mocy, walidacja i przeliczanie przy rzucaniu.
- Rozwój EXP, audyt, stany, Dashboard Bossa, Panel sesji MG.
- Generator tworzy scenę, tokeny i Encounter; szablony oraz raporty walk.
- Hotbar, Unik/Parowanie w kontekście ataku, zabezpieczenie nowych kart obrażeń przed ponownym użyciem.
- Idempotentna migracja flag; 6 nowych zestawów regresji.
- Pełny opis i ograniczenia: docs/REPORT-0.10.0.md.

# Changelog — Gahla Resurrected Foundry VTT

## 0.9.6-beta
- Rebalans talentów: Żywotny +1/+2/+3/+4, Celny Cios +5/+10/+15/+20, Mistrzostwo Aury +2/+3/+4/+5.
- Szkolenie Oręża: +1 pkt bonusu za poziom talentu na sukcesie z bonusem/krytyku, bez podwajania premii talentu na krytyku.
- Mistrz Broni: stałe +10 trafienia dla 1/2/3/4 wybranych rodzajów broni.
- Krwisty Metabolizm: pula 1/2/3/4 użyć Ułatwienia po wypiciu krwi, wygasająca po scenie/odpoczynku.
- Szarża Taurosa używa bazowego SF i limitu dodatkowych kości `Tier + 2`. Wszechstronny działa maksymalnie raz na poziom.
- Skóra jak Kora ma maks. 3 poziomy: +1/+1/+2 pancerza bez zbroi, +5 Odp. Fiz. od T2 i +10 łącznie od T3.
- Przeczucie Przyszłości wymaga deklaracji zapisanej kości przed rzutem; przerzuty bojowe/magiczne/kapłańskie mają 1/1/2/2 użycia na walkę.
- Dodano globalną zasadę minimum OP dla redukcji; Szybkie Przeładowanie nie schodzi poniżej 1 segmentu bez jawnego wyjątku.
- Tymczasowe Punkty Losu nie dają EXP i nie mogą generować kolejnych Punktów Losu. Sanktuarium Eruela T4 leczy cel najwyżej raz na rundę.
- Talenty binarne mają jawny `maxLevel=1`; UI drzewa, zakup i biblioteka respektują maksymalny poziom talentu.
- Szkolenie Mnicha pozostaje mocnym specjalnym mostem Ojczulek/Księżyna → Wojownik/Łowca, ale zostało rozdzielone na dwa poziomy: T1 +20 BGŁ, +1k10 bez broni, Walka Wręcz i most do połowy Tieru Kapłana (zaokrąglonej w górę); T2 łącznie +30 BGŁ, +10 Obrony i +1 SZ.
- Migracja aktualizuje opisy/maxLevel istniejących talentów i dodaje darmową Walkę Wręcz istniejącym postaciom ze Szkoleniem Mnicha.
- Pamięć Krwi i pozostałe WIP pozostają WIP.

## 0.9.5-beta
- SBSM v3: PP/MC używają poziomu zamiast Tieru; statystyki NPC skalują się do średniego poziomu drużyny, podczas gdy Tier pozostaje bramką dla tagów.
- Dodano poziomowe skalowanie BGŁ/Obrony/ŻYW/Ran/cech/odporności, milestone SZ 3/6/11 i wolniejsze skalowanie kości obrażeń według tieru mocy wynikającego z poziomu.
- Boss: maksymalnie 3 Rany z pojedynczego trafienia; podwójne zabezpieczenie w podglądzie obrażeń i w `applyDamage()`.
- Boss/Elita: próg Trwałych Ran korzysta z rzeczywistej puli Ran NPC zamiast bazowej ŻYW.
- Generator pokazuje Lvl bojowy, PP/MC v3 oraz diagnostyczne v2/v1.
- Płotka ma 0 Reakcji.

# Changelog

## 0.9.4-beta

- Naprawiono reset głównego scrolla Generatora Starć po wyborze/odznaczeniu tagu przeciwnika: właściwy scrollowany kontener jest teraz jawnie śledzony przez wspólny mechanizm stanu UI.
- Przywrócono pojedynczy przycisk **Tracker Gahla** u góry natywnej zakładki Encounter/Combat Tracker Foundry. Nie przywrócono usuniętego wcześniej rozbudowanego mini-panelu.

## 0.9.3-beta

- Dialog rozdzielania punktów bonusu poszerzony do 620 px; dłuższe dialogi dostały jawne rozmiary i wewnętrzny scroll, aby tekst/kontrolki nie były ucinane.
- Zaimportowano i znormalizowano dostarczone tabele Trwałych Ran: sieczna, obuchowa, strzały/bełty i broń palna.
- Dodano tabelę broni kłutej jako jawną adaptację **WIP**.
- Tabela Trwałych Ran żywiołowych pozostaje **WIP**, zgodnie z oznaczeniem źródłowego arkusza AI.
- Rozliczenie LW automatycznie dobiera tabelę po profilu broni/lokacji albo żywiole i pokazuje wynik w czytelnej karcie czatu. Skutki trwałe nie są automatycznie wpisywane na Aktora.
- Naprawiono przekazywanie jakości trafienia do wyniku LW: sukces z bonusem daje +10, krytyczny sukces +20; bonus Śmiertelnego Ciosu pozostaje osobnym modyfikatorem.
- Karta broni ma pole `Tabela Trwałej Rany`; dodano migrację istniejących broni do trybu `auto`.
- Wbudowane bronie Tier 1 mają jawne profile: sieczna/kłuta/obuchowa.
- Tabela Pechów została zestawiona z `Pechy.html`; poprawiono terminologię Oszołomienia i zachowano wcześniejsze poprawki oczywistych błędów źródła.
- Usunięto z opisów Trwałych Ran pozostałości obcej terminologii (m.in. WW/SW/WT/PŻ/PB, Punkt Obłędu, `d10`, „Bardzo Trudny -30”). Niepewne zasady pozostawiono jako WIP zamiast dopisywać mechanikę.
- Wpisy tabel korzystające z obcych mechanik procentowej śmierci, infekcji lub „wartości następnego krytyka” są oznaczane WIP na poziomie konkretnego wyniku; Oszołomienie i leczenie zostały opisane zgodnie z terminologią Gahli.
- Naprawiono znany błąd jakości fizycznego trafienia: krytyk podwaja bazową pulę kości, ale nie kumuluje jednocześnie premii „sukces z bonusem” (+½ bazowych kości).
- Dodano `docs/TABLES-AUDIT-0.9.3.md` z audytem obu zestawów arkuszy HTML i listą świadomie niewdrożonych elementów WIP.
- Dodano test regresyjny tabel Trwałych Ran; zestaw testów wzrósł do 15.

## 0.9.2-beta

- Kreator: startowy wybór talentu archetypowego ograniczony do legalnych bazowych talentów T1; dodano walidację także przy tworzeniu Aktora.
- Kreator: jawny podgląd bazowych statystyk rasy (zależnych od płci) oraz bazowych statystyk Ścieżki Życia obok przyrostów.
- Karta postaci: osobiste Punkty Losu dostały przyciski `−` / `+`.
- Progi obrażeń: dokładnie `2 × najwyższy próg` daje 5 Ran; następne pełne wielokrotności najwyższego progu dodają po 1 Ranie.
- NPC: Płotka i Żołnierz używają wyłącznie HP zamiast progów Ran. Płotka: `HP = ŻYW × 5`; Żołnierz: `HP = ŻYW × 10`. Elita i Boss zachowują Rany/progi.
- Dodano migrację istniejących wygenerowanych Płotek/Żołnierzy z 0.9.1 do nowej puli HP; zachowuje już otrzymane obrażenia zamiast leczyć przeciwnika przy aktualizacji.
- Naprawiono zachowanie `HP = 0` i `Aura = 0` przy przeliczaniu danych — zero nie odskakuje już do maksimum.
- Generator Starć, kreator i drzewko talentów jawnie zachowują scroll przed rerenderem; wspólny helper dodatkowo śledzi scroll na żywo.
- Karty testu/ataku/parowania/obrażeń dostały jasny, kontrastowy zestaw kolorów niezależny od motywu Foundry.
- Zwykły test k100 używa teraz tej samej czytelnej struktury karty czatu co atak i obrażenia.

## 0.9.1-beta

- Naprawiono resetowanie scrolla do góry po akcjach powodujących rerender w arkuszach i głównych aplikacjach Gahli.
- Usunięto ogólne ofensywne użycie Aury. Aura jest teraz deklarowana przez obrońcę przed rzutem obrażeń i odejmuje kości z nadchodzącego trafienia.
- Przy zgodnej odporności na żywioł 1 punkt Aury może usunąć 2k10; zwykle usuwa 1k10.
- Przebudowano karty czatu ataku, parowania i obrażeń: czytelne etapy, pula kości, pancerz, Aura, wyniki każdej k10, redukcje i końcowy wynik.
- Dialog punktów bonusu waliduje koszt kombinacji i nie pozwala wydać więcej punktów niż uzyskano.
- Generator Starć nadaje NPC pełne bazowe SF/ZR/PER/ER/UM/OG/WIA oraz Odporności; wartości skalują się z archetypem, Tierem i kategorią.
- Podgląd Generatora Starć pokazuje nowe cechy i Odporności przed utworzeniem Actorów.
- Duży panel edycji NPC przeniesiono z góry arkusza do ostatniej zakładki „Edycja NPC”.

## 0.9.0-beta

- Usunięto dodatkowy mini-panel Gahli z małego natywnego Combat Trackera Foundry. Natywny tracker pozostaje czystym widokiem Encounteru, a pełne sterowanie segmentami znajduje się w osobnym oknie **Tracker Gahla**.
- Przebudowano semantykę `nextTurn()` dla inicjatywy segmentowej: przejście na kolejny wpis Foundry nie uruchamia już automatycznie nowej rundy po przejściu przez listę Combatantów. Aktywny jest uczestnik z największą pozostałą SZ, a nowa runda zaczyna się dopiero, gdy wszyscy niepokonani zejdą do 0.
- Naprawiono reset SZ przy zmianie aktywnego Combatanta: `_onEnter()` nie odnawia już segmentów. Jedynym miejscem odnowienia puli jest `_onStartRound()`, więc dynamiczne przetasowanie initiative nie może rozpocząć rundy przedwcześnie.
- Ujednolicono synchronizację pełnego Trackera z Encounterem; akcje z osobnego okna również po wydaniu kosztu wybierają następną postać według pozostałej SZ.
- Dodano przeciąganie szybkich akcji **Atak / manewr** oraz **Zaklęcie / cud** na hotbar Foundry. Upuszczenie tworzy makro, które później otwiera ten sam normalny popup wyboru broni/manewru/czaru.
- Dodano bezpośrednio edytowalny tryb NPC dla Actorów `minion / standard / elite / boss / bossPart`: Tier, BGŁ, SZ, Obrona, ŻYW, SF/ZR/PER/ER/UM/OG/WIA, pula Ran/HP, bazowe kości ataku, odporności, Aura, naturalny pancerz, reakcje i bonus progów.
- Naprawiono krytyczny błąd NPC: wyłącznie `minion` korzysta z HP. Żołnierz, Elita i Boss używają systemu Ran, zgodnie z danymi Generatora Starć.
- Zintegrowano dostarczony **Generator Starć** i `bestiary_tags.json` jako natywną aplikację Foundry. Generator tworzy gotowych Actorów przeciwników z bazowym atakiem i tagami zapisanymi jako zdolności opisowe.
- Generator Starć jest dostępny z **Gahla — Narzędzia** oraz bezpośrednio z katalogu Actorów dla MG.
- Poprawiono oczywisty błąd starego generatora: maksymalny Tier tagu jest teraz ograniczony zarówno kategorią przeciwnika, jak i jego własnym Tierem. Boss Tier 1 nie może więc kupić tagu Tier 4.
- Dodano eksperymentalny budżet SBSM v2: `PP = Σ(Tier × bazowa SZ / 5)` oraz analogiczny koszt przeciwników uwzględniający ich bazową SZ. Stary PP/MC pozostaje widoczny diagnostycznie. Progi trudności nadal są heurystyką wymagającą playtestów.
- Boss nadal ma rzeczywistą SZ mnożoną przez liczbę wybranych graczy; już dodane wpisy starcia przeliczają się, gdy zmienia się skład drużyny.
- Bestia/Brutal otrzymuje +1 do progów jako osobny bonus progu, zamiast błędnego traktowania go jak zwiększenie ŻYW.
- Dodano regresje generatora starć, wieloaktorowej kolejki segmentowej oraz realnego `hotbarDrop` tworzącego makro.

## 0.8.0-beta

- Zintegrowano segmentową inicjatywę Gahli z natywnym **Encounter / Combat Trackerem Foundry**. `system.combat.currentSegments` i rezerwa reakcji są kanonicznym stanem, a `Combatant.initiative` jest jego projekcją jako **dostępna SZ**.
- Ręczna zmiana inicjatywy w natywnym Combat Trackerze synchronizuje się z Aktorem; zmiany segmentów po stronie Aktora synchronizują się z Combatantem. Dodano ochronę przed pętlami synchronizacji.
- Dodano kompaktowy panel Gahla bezpośrednio do natywnego Combat Trackera: aktualna SZ, rezerwa, reakcje, szybkie −1/−2/−3 segmenty, własny koszt, reakcja, synchronizacja i wejście do pełnego Trackera.
- Atak, manewr, zwykłe rzucenie zaklęcia/cudu i ręczne wydanie segmentów korzystają teraz z jednego przepływu `GahlaCombat.spendSegments()`. Czar/cud w Encounterze faktycznie zużywa swoje OP.
- Czar z aspektem **Reakcja** może zostać wykonany jako reakcja za 4 segmenty bez późniejszego, drugiego rozliczenia w czacie.
- Naprawiono podwójny koszt Parowania: koszt reakcji nie jest już jednocześnie rezerwowany i dopisywany drugi raz jako `reactionPenalty` do kolejnej akcji.
- Przebudowano pełny Tracker Gahla: czytelny stan synchronizacji Foundry ↔ Gahla, aktywny uczestnik, dostępna/raw SZ, rezerwy, długi akcji i czytelniejsze kontrolki.
- Przebudowano wizualnie Kreator Zaklęć/Cudów i Manewrów. Formularz pokazuje teraz wyraźny przepływ **baza → efekty → koszt/płatność → wynik**, a Ryzyka Półmaga są osobnym blokiem.
- Powiększono dialog **Atak / Manewr** do 780 px i **Rzuć zaklęcie / cud** do 760 px; broń, manewr/czar, podgląd i opcje rzutu są rozdzielone w osobnych sekcjach.
- Ujednolicono wizualnie Kreator Postaci i **Gahla — Narzędzia** z resztą systemu: wspólne nagłówki, kroki, hierarchia sekcji i responsywny układ.
- Dodano regresję integracji Encounteru (`combat-integration-regression.mjs`) obejmującą rezerwę reakcji, wydanie segmentów i synchronizację inicjatywy.

## 0.7.2-beta

- Przebudowano Kreator Manewrów po ponownym porównaniu starego HTML-a i zasad źródłowych. Świeży manewr zaczyna się teraz od **czystego ataku wybranej wyposażonej broni**: 0*, 0 płatności, 0 modyfikatora trafienia i bez automatycznej zmiany OP/obrażeń.
- Usunięto demonstracyjne wartości starego HTML-a z domyślnego stanu kreatora (`Silny 1`, `Penetrujący 1`, `Powalający`, `Użycie obu rąk`, płatności 2/2/2). Były przykładem interfejsu, nie regułą każdego manewru.
- Kreator rozdziela teraz trzy etapy: **wybór aspektów za gwiazdki → modyfikacje niezależne (Użycie obu rąk/Szybki) → świadoma płatność gwiazdek** przez −1k10, +1 OP albo −10 trafienia za 1*.
- `Użycie obu rąk` jest osobnym checkboxem, działa tylko z bronią 1,5-/2-ręczną i dodaje +2 OP oraz połowę bazowych kości broni (w górę). Podgląd pokazuje już końcową liczbę kości.
- `Szybki` pozostaje niezależną wymianą −1k10 za −1 OP (max 2), a minimalne OP broni jest respektowane w podglądzie.
- Cecha broni **Ciężka** obniża koszt Powalającego i Ogłuszającego o 1* zgodnie ze źródłem.
- Poprawiono runtime broni Ciężkiej: −25 Obrony działa zawsze, a przy SF < 50 dochodzi kolejne −25 Obrony oraz +2 OP ataku.
- Dodano regresję źródłowego przykładu „Podcięcie”: Długi Miecz 5k10 / OP 6 + Powalający 3*, płatność −1k10, +1 OP, −10 trafienia = 4k10 / OP 7 / −10.

## 0.7.1-beta

- Talenty Boskie są teraz bezwzględnie dostępne wyłącznie dla archetypu Kapłana. Inne archetypy nie widzą ich w Drzewku Talentów nawet po włączeniu pełnego katalogu.
- Kapłan widzi w drzewku tylko Talenty Boskie przypisane do wybranego bóstwa; talenty innych bóstw nie są renderowane.
- Walidacja zakupu po stronie Aktora blokuje próbę kupna Talentu Boskiego przez postać niebędącą Kapłanem.
- Gałąź „Specjalne / Boskie” jest opisana jako „Specjalne” dla nie-Kapłanów i rozszerza się o Boskie dopiero dla Kapłana.
- Rozszerzono test regresyjny Drzewka Talentów o widoczność i blokadę Talentów Boskich.


## 0.7.0-beta

- Poprawiono interpretację Progów Obrażeń zgodnie z doprecyzowaniem autora: wartość progu pozostaje jeszcze w niższym paśmie Ran (ŻYW 8 + Wytrzymały +2: 1–18 = 1 Rana, 19+ wchodzi w kolejne pasmo).
- Akcja rzucania zaklęcia/cudu w Walce jest dostępna dla Półmaga/Kapłana oraz każdej postaci, która faktycznie posiada Item typu spell.
- Kreator postaci dostał tryb ręczny/korekty rzutów startowych z natychmiastowym przeliczeniem podglądu.
- Archetypy i Ścieżki Życia w kreatorze są filtrowane wyłącznie do gotowych kombinacji istniejących w tabelach LIFE_PATHS danej rasy; ścieżki specjalne nie są oferowane na starcie.
- Talenty rasowe w kreatorze są filtrowane źródłowo; Widzenie w Ciemności / Wytrzymały / Mocna Skóra pozostają dostępne wszystkim rasom zgodnie z przewodnikiem.
- Filtrowanie talentów archetypowych dziedziczy wymagania przez jawne zależności (np. Mistrz Sekwencji -> Walka Wręcz, Celny Strzał -> Sokole Oko), więc Półmag nie widzi talentów bojowych tylko dlatego, że wymaganie nie zawiera nazwy archetypu.
- Drzewko Talentów ma cztery wizualne gałęzie: Rasa / Ogólne / Archetyp / Specjalne-Boskie, domyślnie pokazuje talenty pasujące do postaci i ma opcję odsłonięcia pełnej biblioteki.
- Poprawiono premie startowe z Jestestwa: Olag otrzymuje 1 dodatkowy losowy talent ogólny, Tauros/Krasnolud/Erusanin Mocną Skórę, a Therianin darmowego Zmiennokształtnego lub Bestialską Hybrydę poza normalnym wyborem rasowym; darmowe talenty wynikające z przemiany są dodawane jako Itemy.

## 0.6.2-beta

- Kreator Manewru pobiera bazę bezpośrednio z aktualnie **wyposażonych broni** Aktora. Przy jednej broni ustawia ją automatycznie; przy kilku pozwala wybrać bazę, a nazwa/OP/kości są tylko do odczytu i synchronizują się z dokumentem broni.
- Popup **Atak / manewr** pokazuje teraz dynamiczny podgląd wybranej broni i manewru: obrażenia, OP, penetrację, modyfikatory nakładki oraz opis.
- Popup **Rzuć zaklęcie / cud** pokazuje opis i parametry aktualnie wybranego czaru (koszt, OP, zasięg, cel, czas i aspekty). Szybki przycisk rzucania jest dostępny również w zakładce **Walka**.
- Dodano źródłowy **atak celowany**: checkbox −30 i wybór konkretnej lokacji ciała; wybrana lokacja jest zachowana również przy przerzucie za Punkt Losu.
- Usuwanie Itemów jest jawne: przyciski kosza przy broni, pancerzu, źródłach mocy, ekwipunku, manewrach i czarach oraz przycisk **Usuń** w każdym edytowalnym ItemSheet.
- W karcie postaci nazwa rasy jest prezentowana po ludzku (np. `Człowiek`, nie `human`), a Faza Vampira / Jaźń Therianina korzystają z kontrolowanych list wyboru zamiast dowolnego tekstu.
- Otwieranie osadzonego przedmiotu ma fallback na `GahlaItemSheet`, dzięki czemu przycisk **Edytuj** nie zależy wyłącznie od getteru `item.sheet`.
- Uporządkowano sekcję **Walka**: główne akcje są pierwsze, a aktualny loadout (wyposażone bronie, przygotowane manewry i magia) jest widoczny bez przechodzenia między zakładkami.
- Audyt źródeł wskazał dwa nadal liberalnie traktowane punkty: zmiana zestawu broni w walce ma w materiale koszt 3 segmentów, a zmiana przygotowanych manewrów jest opisana przy długim odpoczynku. W 0.6.2 nie wymuszamy ich po cichu; są zapisane jako jawne punkty audytu do decyzji projektowej.
- Rozszerzono regresje UI/boot o bazę manewru z wyposażonego Sztyletu 3k10 / OP 4, podglądy dialogów, usuwanie Itemów i wybór lokacji ataku celowanego.

## 0.6.1-beta
- Naprawiono zapis arkuszy Itemów w ApplicationV2: `GahlaItemSheet` używa `submitOnChange` i normalizuje dane przed walidacją dokumentu.
- Pola tablicowe (`runes`, `traits`, `aspects`, `risks`, `effects` itd.) nie są już wysyłane jako niezgodny z DataModelem tekst; wpisy rozdzielone przecinkiem/nową linią są zamieniane na prawdziwe tablice.
- Dodano jawny przycisk **Zapisz** i czytelny tryb „Item świata” vs „Item na karcie postaci”.
- Ręcznie utworzony `equipment` ma pełny arkusz: opis, kategorię, Tier, wymagania, cechy i stan wyposażenia po osadzeniu na Actorze.
- Zwykły ekwipunek można wyposażać/zdejmować także z zakładki Ekwipunek postaci.
- Kreator czarów zapisuje końcowe OP do `system.delay`; rzucanie czaru odczytuje ten zapis zamiast odtwarzać uproszczony wzór.
- Dodano migrację istniejących Itemów: stare czary odzyskują OP z `builderState`, stare manewry są przepisywane do kanonicznych delt nakładki v2.
- Arkusze broni i pancerzy pozwalają edytować cechy/runy jako listy bez ryzyka odrzucenia całego zapisu przez ArrayField.
- Dodano brakujące klucze lokalizacji `TYPES.Item.*` dla typów Itemów.
- Dodano regresję `item-data-regression.mjs` oraz test normalizacji formularza ItemSheetu.

## 0.6.0-beta

- Przebudowano kartę postaci według czynności gracza: **Postać / Walka / Ekwipunek / Manewry / Talenty / Magia-Cuda / Rozwój**. Manewry nie są już mieszane z magią, a Experience/Special Features pozostają wyłącznie w Rozwoju.
- Progi obrażeń są stale widoczne pod nagłówkiem karty oraz mają większy, czytelny panel w zakładce **Walka**.
- Zakładka **Ekwipunek** dostała anatomiczną mapę pancerza dla Głowy, obu Rąk, Korpusu i obu Nóg. Każdy Item pancerza pokazuje lokacje, na które realnie działa.
- Poprawiono mechanikę tarcz: lekka tarcza dodaje +1, ciężka +2 pancerza do jednej wybranej lokacji; bonus jest dodawany do noszonej zbroi zamiast zastępować jej wartość. Ciężka tarcza miała wcześniej błędną wartość 1.
- Redukcja niskich wyników k10 ze zbroi i tarczy sumuje się na lokacji chronionej tarczą (wybierana jest najlepsza zbroja + najlepsza tarcza, bez sumowania kilku nakładających się zbroi).
- Ponowne **Wczytaj broń, zbroje, talenty** aktualizuje biblioteczny szablon Ciężkiej Tarczy do +2 pancerza, ale celowo nie zmienia egzemplarzy na Actorach, które mogły zostać uszkodzone podczas gry.
- Dodano szybki wybór chronionej lokacji tarczy z karty postaci.
- Małe etykiety pancerza przy Itemach pokazują wartości efektywne z metalem/runą oraz informację o ignorowaniu niskich wyników kości.
- Przebudowano manewry jako **nakładki na zwykły atak broni**. Kreator zapisuje delty kości obrażeń, OP, trafienia i Penetracji; bazowe parametry zawsze pochodzą z broni wybranej w momencie ataku.
- Koszt `*` manewru jest rozliczany zgodnie ze źródłem: −1k10 obrażeń, +1 OP albo −10 trafienia. Zapłata np. −20 trafienia nie zmienia sama z siebie OP sztyletu.
- **Użycie obu rąk** wymaga broni 1,5- lub 2-ręcznej i dodaje połowę bazowych kości broni, zaokrągloną w górę.
- Naprawiono edycję utworzonego manewru/czaru: przycisk z karty i ItemSheet otwiera Kreator Zdolności przez poprawne `ApplicationV2.render({force:true})`.
- Uporządkowano źródłową listę aspektów manewrów (m.in. Ogłuszający 4*, Krwawy 4*, Silny/Celny, zasada kosztu `*`).
- Dodano regresje `armor-regression.mjs` i `maneuver-overlay-regression.mjs`, obejmujące pancerz per lokacja i nakładanie manewru na rzeczywistą broń.
- Drobna redukcja szumu UI: EXP nie zajmuje stałego paska zasobów i jest eksponowane w zakładce Rozwój.

## 0.5.1-beta

- Naprawiono podgląd Ścieżki Życia w Kreatorze Postaci: zmiana Ścieżki od razu przelicza statystyki startowe oraz pokazuje osobno jej przyrosty SF/ZR/PER/ER/UM/OG/WIA.
- Zakładka **Rozwój** ma teraz edytowalne pola Experience i Special Features, z dodawaniem/usuwaniem wpisów. Special Feature jest traktowany jako treść wymyślona przez gracza, nie jako WIP.
- Dodano przed każdym testem k100 okno ręcznego modyfikatora od −40 do +40. Automatyczne bonusy/kary systemu pozostają widoczne i są sumowane z wyborem użytkownika.
- **Atak wyposażoną bronią** otwiera teraz dialog wyboru wyposażonej broni, opcjonalnego przygotowanego manewru oraz modyfikatora. Manewr pilnuje zgodności z bronią, dla której został utworzony.
- W Magia/Cuda dodano przycisk **Rzuć zaklęcie / cud**, który wybiera przygotowaną zdolność i ręczny modyfikator. Bezpośrednie użycie konkretnego Itemu nadal działa i otwiera tylko dialog modyfikatora.
- Naprawiono pozorne „zacinanie” zakładek karty: listenery kart nie są już jednorazowe (`once:true`), a aktywna zakładka jest zapamiętywana przez rerender dokumentu.
- Rerolle z Punktu Losu nie otwierają ponownie dialogu modyfikatora i nie dublują kar ze stanów.
- Dodano test regresyjny UI obejmujący Ścieżki Życia, edycję Rozwoju, trwałe zakładki oraz selektory ataku/czaru.

## 0.5.0-beta

- Przeniesiono pełną bibliotekę talentów z karty postaci do osobnej aplikacji **Drzewko talentów**. Arkusz Actor przygotowuje i renderuje teraz tylko talenty faktycznie posiadane przez postać, co usuwa koszt renderowania ponad 150 wpisów przy każdym przełączeniu zakładki.
- Dodano wyszukiwarkę i filtry Drzewka Talentów: kategoria, tylko posiadane, tylko możliwe do zakupu teraz. Zakup i ulepszanie aktualizuje Item talentu na Actorze i odświeża kartę.
- Dodano źródłowe zależności talentów. Gałąź powstaje tylko wtedy, gdy pole wymagań wprost wymienia inny istniejący talent; np. `Pierwsza Pomoc T2 → Medycyna Zaawansowana`, `Przycelowanie → Sokole Oko → Celny Strzał`. Wymagania opisowe/WIP nie są interpretowane.
- Zakup talentu sprawdza teraz jawne wymagania innego talentu i jego poziomu także po stronie dokumentu Actor, a nie tylko w UI drzewa.
- Przebudowano kartę postaci na czytelne zakładki: **Postać, Walka, Ekwipunek, Talenty, Magia / Cuda, Rozwój**. Dodano portret, czytelniejszy pasek zasobów, sekcje wartości wynikowych i szybkie akcje.
- Ekwipunek nie jest już globalną listą pod każdą zakładką. Broń, pancerz, źródła mocy, runy i pozostałe przedmioty mają osobną zakładkę; talenty, czary i manewry są z niej wykluczone.
- Zakładka Magia / Cuda pokazuje wyłącznie manewry oraz zaklęcia/cuda, z przygotowaniem do slotu, użyciem i edycją. Przygotowanie pilnuje liczby dostępnych slotów.
- Dodano test regresyjny Drzewka Talentów i rozszerzono boot-smoke o sprawdzenie, że ActorSheet nie przygotowuje już pełnego katalogu talentów.

## 0.4.2-beta

- Naprawiono krytyczną kolizję z `ApplicationV2.state` w Foundry VTT V14. `state` jest właściwością tylko do odczytu używaną przez cykl renderowania aplikacji, dlatego Kreator Postaci nie może zapisywać do `this.state`. Wewnętrzny stan kreatora został przeniesiony do `this.draft`.
- Tę samą poprawkę zastosowano w Kreatorze Zaklęć/Cudów i Manewrów, który miał identyczną kolizję i z tego samego powodu mógł się nie otwierać.
- Smoke test emuluje teraz prawdziwy getter `ApplicationV2.state` bez settera, dzięki czemu ponowne użycie `this.state = ...` w aplikacjach Gahla powoduje błąd testu zamiast przejść niezauważone.

## 0.4.1-beta

- Dodano jawny przycisk **Kreator postaci** bezpośrednio w katalogu Aktorów, obok standardowego tworzenia; istniejące przechwycenie `Create Actor → character` pozostaje jako drugi sposób uruchomienia kreatora.
- Zakładkę Talentów na karcie postaci przebudowano na kategorie: Rasowe, Ogólne, Archetypowe, Specjalne i Boskie; wpisy pokazują wymagania, bóstwo i koszt bazowy.
- Naprawiono podwójne `{{#each talents}}` w template karty postaci.
- Biblioteka świata jest teraz porządkowana do folderów: Ekwipunek/Broń, Ekwipunek/Pancerze i tarcze, Runy oraz osobne foldery talentów: Rasowe, Ogólne, Archetypowe, Specjalne i Boskie; talenty boskie dostają dodatkowe podfoldery bóstw.
- Naprawiono seed biblioteki, który mógł dodawać talenty boskie drugi raz. Ponowne uruchomienie **Wczytaj broń, zbroje, talenty** migruje stare wpisy do nowych folderów i usuwa duplikaty tego samego typu/nazwy wewnątrz biblioteki Gahla.

## 0.4.0-beta

- Przebudowano tworzenie postaci na workflow **kreator-first**: standardowe utworzenie Aktora typu `character` jest anulowane przez `preCreateActor`, a następnie otwierany jest Kreator postaci. Gotowy Aktor powstaje dopiero po walidacji wyborów.
- Dodano ustawienie świata pozwalające wyłączyć automatyczne przechwytywanie tworzenia postaci.
- Statystyki na karcie postaci są teraz tylko do odczytu i pokazują rozbicie: rasa / Ścieżka Życia / rzut / rozwój. Eliminuje to pozorne „zerowanie” ręcznie wpisanych wartości, które i tak były przeliczane przez DataModel.
- Kreator postaci zachowuje wybory podczas przeładowania formularza i waliduje talenty, rasę, archetyp i Ścieżkę Życia przed utworzeniem dokumentu.
- Poprawiono aplikacje ApplicationV2 kreatora postaci, kreatora zdolności, trackera i narzędzi: własne formularze mają teraz `form.handler`.
- Kreator zaklęć/manewrów nie przekazuje już dokumentów Actor/Item przez opcje bazowej aplikacji; kontekst jest przechowywany osobno.
- Kreator zaklęcia otwarty z Kapłana domyślnie tworzy Cud, a Tier jest pobierany z postaci. Kreator manewru wstępnie pobiera nazwę, OP i kości obrażeń z głównej broni postaci.
- Usunięto duplikaty `id` w podglądzie kreatora zdolności.
- Rozszerzono smoke test o workflow kreatora postaci, kontekst kreatora zdolności, wymagane handlery formularzy oraz przechwytywanie `preCreateActor`.

## 0.3.3-beta

- Naprawiono krytyczny błąd startu wprowadzony w 0.2.0: usunięto bare-import `from "foundry.applications.api"`; API Foundry V14 jest pobierane z globalnego `foundry.applications.api`.
- Naprawiono drugi krytyczny błąd ESM: `sheets.mjs` importował `DEITIES` z `rules.mjs`, lecz `rules.mjs` nie eksportował tej wartości.
- Rejestracja arkuszy Actor/Item używa wzorca Foundry VTT V14: `DocumentSheetConfig.registerSheet(foundry.documents.Actor/Item, ...)` w hooku `init`.
- Dla typów Gahla bezpiecznie usuwane są generyczne core fallback sheets, a przy starcie preferowany jest arkusz Gahla, jeśli zapisany default nadal wskazuje na `core.*`.
- GM automatycznie usuwa z dokumentów Gahla stare przypięcia `flags.core.sheetClass` wskazujące na generyczny core sheet; wybory arkuszy innych modułów nie są naruszane.
- Dodano `game.gahla.debugSheets()` i `game.gahla.repairSheets()` do diagnostyki/naprawy wyboru arkusza.
- Arkusz postaci i Itemu korzysta z `super._prepareContext()`; dodano test wykonywania `_prepareContext()` na danych testowych.
- Usunięto zagnieżdżone znaczniki `<form>` z template’ów ApplicationV2/DocumentSheetV2.
- Naprawiono `SPELL_ASPECTS` i `MANEUVER_ASPECTS` w ItemSheet: dane są obiektami, a nie krotkami; przywrócono także handlery `toggleAspect`, `recalculate` i `setShieldLocation`.
- Naprawiono tracker: handlery `undo` i `refresh` są prawidłowymi statycznymi akcjami ApplicationV2.
- Dodano test boot-smoke, który importuje główny moduł, wykonuje hook `init`, potwierdza domyślny `GahlaActorSheet`/`GahlaItemSheet`, uruchamia kontekst obu arkuszy i sprawdza mapowanie akcji z template’ów.

## 0.3.2-beta

- Próba naprawy rejestracji arkuszy pod Foundry VTT V14.
- Dodano defensywny kontekst arkusza i konfigurację formularza ApplicationV2.
- Ta wersja nadal była blokowana przez wcześniejsze błędy ESM startu systemu, naprawione dopiero w 0.3.3-beta.

## 0.3.1-beta

- Tracker i kreator zdolności zostały przeniesione na lazy loading, aby ich błędy nie blokowały bezpośrednio arkusza postaci.
- Ta zmiana nie usuwała błędów startowych obecnych już w 0.2.0.

## 0.3.0-beta

- Dodano natywny Tracker Inicjatywy oparty na przekazanym narzędziu HTML: efektywna SZ po rezerwie reakcji, reakcje, akcje przenoszone, akcje długie, długi między rundami, BOSS 3 reakcje oraz Undo.
- Zintegrowano stan trackera z dokumentem Aktora i wartością inicjatywy Combatant.
- Dodano natywny Kreator Zdolności 1.5: kalkulator zaklęć/cudów i manewrów, z zapisem `builderState` w Itemie.
- Dodano tworzenie/edycję Itemów z kreatora bez osobnej strony HTML.
- Dodano automatyczne rozliczanie rzutu manewru z wyliczonym OP, obrażeniami i modyfikatorem trafienia; efekty specjalne pozostają opisem tam, gdzie brak domkniętej automatyzacji.
- Dodano testy regresyjne kalkulatora zdolności i trackera.
- Nie zmieniono jawnych WIP w źródłach; „Kreatywny” i własne ryzyka pozostają decyzją MG.

## 0.2.0-beta

- Pełne dane z Przewodnika Gracza Sesja 0 zostały włączone do systemu.
- Dodano wszystkie opisane Ścieżki Życia.
- Rozbudowano katalog ras, archetypów, talentów, bóstw, stanów, żywiołów, broni, zbroi, tarcz, metali i run.
- Rozbudowano kreator postaci.
- Startowe rzuty są wykonywane automatycznie przy otwarciu kreatora, z możliwością ponownego rzutu.
- Kapłan wybiera darmowy talent wybranego bóstwa.
- Uporządkowano obliczanie fazy Vampira/Therianina: modyfikator dotyczy aktualnych wartości statystyk.
- Poprawiono liczenie Biegłości po Szkoleniu Mnicha.
- Poprawiono progi nadmiarowych Ran.
- Dodano podstawową mechanikę run statystyk, odporności, obrony, pancerza, szybkości i run bojowych.
- Dodano wsparcie run magicznych/elementalnych do rozliczenia obrażeń.
- Rozbudowano automatyzację warunków Ułatwienia/Utrudnienia dla stanów.
- WIP pozostały jawne i nie są zastępowane własną interpretacją systemu.
