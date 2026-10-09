# Raport 0.11.9-beta

## Baza i zakres

Ukończony ZIP 0.11.8-beta; porównanie z Gahla_Resurrected_Talenty_Audyt_2026-10-04.pdf i najnowszymi jawnymi decyzjami użytkownika. Nie przebudowano systemu walki ani rozwoju. Odtworzono kanon; stopień automatyzacji opisano oddzielnie.

## Wynik porównania

43 pozycje miały status WYMAGA DECYZJI. Odzyskano 40 pozycji (41 talentów po rozdzieleniu jednego wpisu). Katalog: 177 → 178 wpisów.

Trzy pozycje nadal zawierają ograniczenie:

- Runotwórstwo: aktualna formuła zachowana, konflikt kanoniczny pozostaje.
- Przeczucie Przyszłości: zachowana późniejsza pula, brak kanonu automatycznego resetu.
- Rzemieślnik (wybrany fach): WIP zasad rzemiosła.

Klasyfikacja tabeli: 40 RESTORED CANON, 1 CURRENT RULE OVERRIDES OLD, 1 GENUINELY UNRESOLVED, 1 WIP. Pozostały konflikt starego modelu: Runotwórstwo.

## Odzyskane talenty

- Wspinacz
- Uzdolnienie Artystyczne
- Chwyt Tytana
- Mistrz Sekwencji
- Walka Wręcz
- Duchowa Pięść
- Gniew Gidy
- Sanktuarium Eruela
- Rozmach Olbrzyma
- Nieustępliwe Uderzenie
- Uderzenie Tarczą
- Celny Strzał
- Grad Strzał
- Taktyczny Wybór
- Przygotowany Atak
- Ruch Cienia
- Zwierzęcy Szał
- Pazury i Kły
- Nasycenie Źródła Mocy
- Osłona Koncentracji
- Garda Weterana
- Błyskawiczne Otwarcie
- Mistrz Ukrywania
- Cichy Ruch
- Słowo Ostatniego Strażnika
- Dwa Oblicza Śmierci
- Żołnierz Burzy
- Światło Przewodnika
- Ostoja Wędrowca
- Kradzież Fortuny
- Kaprys Losu
- Przyspieszony Nurt
- Szał Bitewny
- Nieustępliwość Tępiciela
- Klątwa Krwawej Matki
- Profanacja Spokoju
- Szept z Mroku
- Ostrze Cieni
- Plaga Zarazy
- Bestialska Hybryda
- Zmiennokształtny

## Konflikty i pierwszeństwo nowych zasad

Zachowano aktualną Mocną Skórę, Naturalną Obronę, Mnicha, Nadludzką Siłę, zatwierdzoną translację T4 Zmiennokształtnego, Święty Płomień, Odporności/Progi i jakość k100. Nie przywrócono DR.

Test tworzenia/ulepszania: ½ UM/WIA + ½ ER + 5 × Tier talentu. Bonus gotowego Źródła: bazowo stałe +5, także na T4; Tier daje 1 wybór umagicznienia na poziom, a bonus/krytyk może dać 1 dodatkową opcję procesu, bez podnoszenia bazowego +5. Pozostały konflikt strukturalny dotyczy dodatkowej opcji ponad obecny limit Tieru oraz obecnej wybieranej opcji +10 do testu. Nie przebudowano kalkulatora źródeł; samo T4 nie daje +20 do rzucania.

Słowo Ostatniego Strażnika i Szept z Mroku zachowują późniejsze minimum kosztów aspektów w silniku; starsze minimum 1 z PDF nie nadpisuje nowszego kalkulatora.

Plik canon-mechanics.mjs (w tym formuła Runotwórstwa) identyczny bajtowo z 0.11.8: **TAK**.

## Rangi i migracja

Pełne exact old → new wszystkich zmienionych struktur znajduje się w TALENT-CANON-RECONCILIATION-0.11.9.md. Zachowano rank/requiredTier/costLevel/effectTier i zniżkę nauczyciela.

Migracja obejmuje Aktorów świata, niezależne tokeny, Itemy i odpowiednie kompendia. Pierwszy Item zachowuje ID; drugi talent rozdzielonego wpisu ma deterministyczne ID, z kontrolą kolizji. Historia zachowuje faktyczne kwoty EXP; przekształcane są także migawki potrzebne do cofnięcia zakupu. Ponowne wykonanie nie zmienia danych. Niższy historyczny efekt poniżej nowego startowego Tieru nie dostaje darmowego ulepszenia. Wybór sztuki nie jest zgadywany podczas migracji.

## Automatyzacja i jej granice

Mechanicznie określony efekt ręczny pozostaje grywalny i nie jest nazywany WIP tylko dlatego, że nie ma własnego przycisku. W tej wersji nadal ręcznie rozlicza się:

- Chwyt Tytana — szczegóły walki drugą bronią
- Rozmach Olbrzyma — efekty bojowe i koszty Zamaszystego
- Nieustępliwe Uderzenie — efekty warunkowe po trafieniu
- Uderzenie Tarczą — akcja i testy celu
- Grad Strzał — wspólny atak wielu celów i obszar
- Przygotowany Atak — warunki nieświadomości i dodatkowe Rany
- Ruch Cienia — ruch T2 i aktywacja pierwszej akcji T4
- Zwierzęcy Szał — wejście, kontrola i wybór najbliższego celu
- Garda Weterana — efekty poza premią pierwszego segmentu Uniku
- Błyskawiczne Otwarcie — jednorazowa zniżka pierwszej rundy
- Dwa Oblicza Śmierci; Ostoja Wędrowca; Kradzież Fortuny; Kaprys Losu; Nieustępliwość Tępiciela; Klątwa Krwawej Matki; Profanacja Spokoju; Ostrze Cieni; Plaga Zarazy — pełne opisy, ręczne rozstrzyganie efektów
- Światło Przewodnika — dodatkowa runda ochronnego Cudu
- Szept z Mroku — dodatkowe obrażenia nieświadomego celu
- Żołnierz Burzy — Szok i Powalenie; nasycenie broni/czas/kości/użycia są automatyczne

Powyższe pozycje odzyskały opisy, legalne rangi i ceny; nie należy traktować testów profili liczbowych jako dowodu pełnej automatyzacji ich walki.

Sanktuarium: użytkownik zatwierdził promień 10 m. Pomiar, naliczanie Odporności i leczenie raz na rundę objęto testami. Nie dodano nowego szablonu graficznego strefy.

## Korekta P0: Hybryda i Zmiennokształtny

Wcześniejsze przypisanie T4 Hybrydzie było błędem. Usunięto jej aktywację i fikcyjną rangę R2/T4. Hybryda: jedna ranga, częściowa forma +25%, most Wojownika ceil(Tier Bestii/2) i efekty kupionych talentów Wojownika tylko w przemianie.

Zmiennokształtny zachowuje T1–T4. T1: darmowy zestaw talentów kreatora, +1k10 bez broni i pełna forma bez zbroi. T2: wybór Powalenia/Pchnięcia w teście Odporności Fizycznej zapewnia Ułatwienie. T3: Sukces z Bonusem udostępnia test Odporności na Krwawienie obrońcy/MG. T4: darmowo, 1/walkę, przez 2 rundy, tylko w pełnej formie; nie rozpoczyna przemiany i kończy się przy jej zakończeniu. Odp. Fizyczna 43 daje +8 zamiast +4 do obu fizycznych progów. Nie mnoży Naturalnej Obrony, Mocnej Skóry, innych bonusów, ŻYW ani bazowych progów. Stany pozostają zapisane; kary wracają po wygaśnięciu efektu.

Historyczna niepoprawna ranga/aktywacja Hybrydy jest archiwizowana i zgłaszana w Audycie Aktora. Bez automatycznej opłaty/refundu EXP i bez przyznawania darmowego Zmiennokształtnego. Kwoty i identyfikatory historii pozostają zachowane; migawki cofania zakupu otrzymują poprawione rangi. Osobista deklaracja Triggera i 3 segmenty samej przemiany pozostają do rozliczenia przez gracza/MG.

## Testy

54/54 zestawy regresji PASS, w tym 43 dotychczasowe. Dostosowano dwa testy płatności reakcji do obserwowania faktycznej zmiany zasobu zamiast dawnego wywołania metody. Zmieniono oczekiwanie ostrzeżenia o nieznanej wartości rabatu, ponieważ rabat odzyskano z kanonu.

6/6 testów przeglądarkowych PASS: kreator, przekazanie deklaracji obrony między dwoma klientami, generator, dwie wersje testu karty i kompilacja szablonów. 11 szablonów / 807 reguł CSS. Kontrola składni: 119 modułów, 7 JSON, 0 błędów. Dokładny zapis w TEST-RESULTS-0.11.9.txt.

Nie uruchomiono licencjonowanego świata Foundry V14. Testy wykonują rzeczywiste moduły i interfejs w Edge, ale zastępują cykl dokumentów oraz komunikację Foundry. Nie jest to potwierdzenie całej sesji wieloosobowej na żywym świecie.

## Zmienione pliki względem 0.11.8

- CHANGELOG-0.11.9.md
- CHANGELOG.md
- MANIFEST-INSTALL.md
- README.md
- dev-tests/attack-116-regression.mjs
- dev-tests/automation-ability-regression.mjs
- dev-tests/browser/defense-handoff.mjs
- dev-tests/canon119-actions-regression.mjs
- dev-tests/canon119-attack-regression.mjs
- dev-tests/canon119-aura-regression.mjs
- dev-tests/canon119-catalog-regression.mjs
- dev-tests/canon119-defense-regression.mjs
- dev-tests/canon119-foundation-regression.mjs
- dev-tests/canon119-infusion-regression.mjs
- dev-tests/canon119-zone-regression.mjs
- dev-tests/form119-regression.mjs
- dev-tests/migration119-regression.mjs
- dev-tests/source119-regression.mjs
- dev-tests/talents117-regression.mjs
- dev-tests/talents118-regression.mjs
- docs/CHANGELOG-0.11.9.md
- docs/REPORT-0.11.9.md
- docs/TALENT-AUDIT-0.11.9.md
- docs/TALENT-CANON-RECONCILIATION-0.11.9.md
- docs/TEST-RESULTS-0.11.9.txt
- gahla-resurrected.mjs
- module/ability-automation.mjs
- module/ability-builder.mjs
- module/automation-rules.mjs
- module/automation-runtime.mjs
- module/content.mjs
- module/context-reactions.mjs
- module/data-models.mjs
- module/defense-declarations.mjs
- module/documents.mjs
- module/effects-engine.mjs
- module/form-canon119.mjs
- module/migration119.mjs
- module/sheets.mjs
- module/talent-actions119.mjs
- module/talent-aura119.mjs
- module/talent-canon119.mjs
- module/talent-choices119.mjs
- module/talent-defense119.mjs
- module/talent-eligibility.mjs
- module/talent-infusion119.mjs
- module/talent-presentation.mjs
- module/talent-ranks.mjs
- module/talent-spirit119.mjs
- module/talent-values119.mjs
- module/talent-zones119.mjs
- system.json
- templates/actor/character-sheet.hbs
- templates/item/item-sheet.hbs
