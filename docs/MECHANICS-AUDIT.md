> Raport archiwalny. Aktualny kanon i stan wdrożenia: [REPORT-0.11.7.md](REPORT-0.11.7.md).

# Gahla Resurrected → Foundry VTT V14: audyt implementacji

Status: **0.9.1-beta**

Źródła implementacji:

1. `Gahla Resurrected - Kompendium Mechaniczne.pdf`
2. `Gahla_Przewodnik_Gracza_Sesja0.pdf`

## Zasada projektu

Źródła są traktowane jako specyfikacja. Jeżeli reguła jest określona — jest implementowana możliwie mechanicznie. Jeżeli reguła jest oznaczona jako WIP, w opracowaniu albo do ustalenia przez MG — system zachowuje WIP i nie dopisuje własnego efektu.

## Zaimplementowane źródłowo

### Postać

- Rasy i ich wartości bazowe z Przewodnika.
- Odporności rasowe.
- Archetypy i ich BGŁ/SZ/Obrona/odporności.
- 42 opisane Ścieżki Życia.
- Rzuty startowe.
- 100 EXP.
- Punkty Losu 1+1k3.
- Startowe Jestestwo, talenty i wyposażenie.
- Faza Vampira/Therianina.

### Wartości wynikowe

- Odporności 4 typów.
- Obrona.
- Trafienie.
- Aura.
- Progi Ran.
- Sloty manewrów, czarów i cudów.

### Testy

- k100 poniżej/równe cesze.
- 01–05 krytyczny sukces.
- ≤ połowy cechy — sukces z bonusem.
- 96–100 — krytyczna porażka.
- Ułatwienie/Utrudnienie przez odwracanie cyfr; dublet przy takim rzucie jest przerzucany.
- Experience jako Ułatwienie.

### Walka

- kolejność segmentowa,
- Tracker Inicjatywy z efektywną SZ, rezerwą reakcji, długiem zwykłym/długim i rundami, zintegrowany dwukierunkowo z natywnym Encounter/Combat Trackerem Foundry,
- BOSS z 3 reakcjami w trackerze,
- ręczne cofanie zmian trackera,
- OP akcji, w tym automatyczne zużywanie OP przez ataki, manewry i czary/cuda podczas aktywnego Encounteru,
- reakcja i rezerwowanie segmentów widoczne jako dostępna initiative,
- Unik,
- Parowanie,
- trafienie,
- losowa lokacja trafienia oraz atak celowany −30 z wyborem konkretnej lokacji,
- punkty bonusu,
- pancerz,
- Penetracja,
- obrażenia magiczne,
- odporności,
- progi Ran,
- uszkadzanie pancerza zamiast części Ran.

### Stany i elementy

- wszystkie stany wymienione w Przewodniku,
- Ogień, Lód, Elektryczność, Ziemia, Woda, Wiatr, Światło, Cień,
- podstawowe skutki statusów i testy odporności.

### Magia

- Umiejętności Magiczne / Modlitwa,
- Kreator Zdolności 1.5 odwzorowujący kalkulator HTML,
- liczbowy kalkulator aspektów i Ryzyk Półmaga,
- koszt aspektów,
- minimalne OP,
- Źródło Mocy,
- test rzucania,
- Ryzyka,
- Pech magiczny / Gniew Boży,
- podstawowy rozlicznik obrażeń zaklęć.

### Manewry

- Kreator Manewrów 1.5: budżet gwiazdek i płatność przez obrażenia/OP/trafienie,
- kreator używa aktualnie wyposażonej broni jako bazy podglądu,
- Item manewru przechowuje delty nakładane w chwili ataku na faktycznie wybraną broń (kości, OP, trafienie, Penetracja),
- efekty specjalne pozostają opisem tam, gdzie materiał nie daje pełnej automatyzacji.

### Ekwipunek

- bronie z tabeli Tier 1 dostępne w źródle,
- zbroje,
- tarcze,
- metale/fachy,
- runy przedmiotowe, których mechanika jest jednoznaczna.

### Talenty

- katalog talentów z dostarczonego przewodnika,
- tierowanie,
- ceny EXP,
- nauczyciel −50%,
- szereg prostych efektów automatycznych (m.in. statystyki, Obrona, próg obrażeń, redukcje, Biegłość Mnicha, sloty).

## Doprecyzowanie autora po dokumentach

- W 0.7.0 autor doprecyzował sposób czytania Progów Obrażeń: sama wartość progu nadal należy do niższego pasma. System stosuje to doprecyzowanie jako nowszą regułę roboczą, nawet jeśli przykład w aktualnym PDF-ie używa wcześniejszej granicy. Przykład implementacyjny: ŻYW 8 +2 do progu => 1–18 = 1 Rana, 19–26 = 2 Rany.


## Generator Starć / NPC (0.9.0)

- Dostarczony `genstarc.html` i `bestiary_tags.json` są traktowane jako dodatkowa specyfikacja narzędzia MG.
- Kategorie **Płotka (Minion)** i **Żołnierz** używają prostego HP zamiast Progów Ran (odpowiednio ŻYW×5 i ŻYW×10). Elita i Boss używają Ran i Progów.
- Tagi są ograniczone do `min(Tier przeciwnika, maksymalny Tier kategorii)`. To jest korekta bezpieczeństwa/balansu narzędzia: stary HTML ograniczał je wyłącznie kategorią i pozwalał Bossowi T1 wybrać T4.
- Od 0.9.5 surowe statystyki NPC nie rosną już skokowo tylko z Tierem. Generator bierze średni poziom wybranej drużyny (1–11): BGŁ/Obrona +10 na poziom, ŻYW/Rany +1 na poziom, cechy +5 na poziom, odporności +2 na poziom; DMG rośnie wolniej według tieru mocy wynikającego z poziomu, a SZ na milestone’ach 3/6/11.
- SBSM v3 liczy `PP = Σ(Poziom × bazowa SZ / 5)`. MC używa poziomu bojowego przeciwnika zamiast Tieru. Tier pozostaje bramką tagów/specjalnych zdolności. v2/v1 są zachowane wyłącznie diagnostycznie.
- Progi trudności 0.7 / 1.2 / 1.6 pozostają heurystyką z dostarczonego narzędzia. Bez danych z playtestów nie traktujemy ich jako dowiedzionego modelu CR.
- Boss zachowuje mechanikę SZ × liczba graczy oraz 3 reakcje. W MC v3 nie mnożymy ponownie SZ × graczy, ponieważ mnożnik kategorii ×4 reprezentuje pakiet solo. Dodatkowo wygenerowany Boss ma limit 3 Ran z pojedynczego trafienia, aby ograniczyć alpha strike bez dokładania sztucznego HP.
- Cecha bazowa Bestii `+1 do Progu Obrażeń` jest przechowywana jako bonus progu, a nie sztuczne +1 ŻYW.

## Jawne luki automatyzacji (reguła źródłowa istnieje)

- Zmiana zestawu broni podczas walki ma w materiale koszt **3 segmentów**. Obecne szybkie wyposażanie na karcie jeszcze tego kosztu nie pobiera.
- Zmianę przygotowanych manewrów źródło opisuje przy długim odpoczynku. Obecny przycisk Przygotuj/Usuń ze slotu jest bardziej liberalny.

Te punkty nie są oznaczane jako WIP, ponieważ źródło podaje regułę; pozostają jawnie zapisanym zakresem brakującej automatyzacji.

## Mechaniki zależne od opisu / kontekstu

Część talentów ma w źródle efekt fabularny albo zależny od decyzji MG. Te talenty są w Itemach z pełnym opisem i nie są zamieniane na wymyślone automatyczne efekty.

## WIP

- Multiklasowość.
- Pamięć Krwi.
- Łączenie żywiołów.
- Tabela skutków Trwałych Ran.
- Ranged weapon table.
- Kevru / Lud Stali / Niziołki jako grywalne rasy.
- Poziomy >11.
- Triggery przemiany Therianina.
- Wszystko, co źródło zostawia do ustalenia przez MG.

## Rzeczy wymagające potwierdzenia przez MG

- trzy różne wzory testu wykuwania runy pomiędzy dokumentami,
- szczegóły pełnej automatyzacji talentów kontekstowych,
- sposób łączenia efektów specjalnych opisanych jako „X” i „do ustalenia z MG”.

## Testy regresyjne

Obecny build uruchamia pełny zestaw `dev-tests/*.mjs`, w tym testy reguł, rdzenia, Itemów, pancerza, manewrów, Drzewka Talentów, kreatorów, trackera, UI oraz `combat-integration-regression.mjs`, który sprawdza synchronizację segmentów Aktora z initiative Combatanta.

## Analiza narzędzi HTML

Dostarczony Tracker Inicjatywy i Kreator Zdolności zostały potraktowane jako dodatkowa specyfikacja użytkownika. Ich działające funkcje są przenoszone do Foundry, ale miejsca nazwane przez autora „Kreatywny / GM” nie dostają własnej interpretacji systemu.

Uwaga: wartości startowe w dostarczonym HTML były także danymi demonstracyjnymi formularza, a nie automatyczną regułą każdego manewru. Od 0.7.2 kreator manewru świadomie **nie kopiuje** demo `Silny 1 / Penetrujący 1 / Powalający / obie ręce / płatności 2-2-2`. Startuje od czystego ataku wyposażonej broni, a gracz sam wybiera aspekty i sposób zapłaty gwiazdek. Logika kosztów nadal odwzorowuje HTML oraz aktualny Przewodnik: 1* = −1k10, +1 OP albo −10 trafienia; Użycie obu rąk i Szybki są rozliczane osobno. Domyślny kreator zaklęcia nadal daje 8 kosztu / 9 OP.
