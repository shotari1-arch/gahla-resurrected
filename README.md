# Gahla Resurrected 0.11.9-beta — Foundry V14

Baza: ukończone 0.11.8-beta. Odzyskano kanon 38 dawnych nierozstrzygniętych pozycji z audytu PDF i najnowszych decyzji użytkownika. Wersja zawiera 178 wpisów talentów; efekty automatyczne i ręczne są rozróżnione w audycie.

Rozpakuj zawartość ZIP do Data/systems/gahla-resurrected, tak aby system.json leżał bezpośrednio w tym folderze. Otwórz świat jako MG, aby wykonać migrację zachowującą ID, EXP, historię i wybory. Zachowaj kopię świata przed aktualizacją.

[Changelog](docs/CHANGELOG-0.11.9.md) · [Raport i ograniczenia automatyzacji](docs/REPORT-0.11.9.md) · [Audyt wszystkich talentów](docs/TALENT-AUDIT-0.11.9.md) · [Porównanie kanonu i rang](docs/TALENT-CANON-RECONCILIATION-0.11.9.md) · [Testy](docs/TEST-RESULTS-0.11.9.txt)

## Codzienna obsługa

- Reakcja obrońcy pojawia się przed rzutem ataku, również poza walką. Poza walką można jawnie odnowić pulę prób; w Trackerze pulę odnawia nowa runda. Reakcje spalają segmenty od dołu i nie przesuwają inicjatywy.
- Rozwój: wpisz nazwę sesji i EXP. Historia sumuje nagrody i zakupy; cofaj od najnowszego zakupu. Statystyki poziomu liczą się automatycznie, a Experience i Feature poziomów 3/6/11 dodają się bez duplikowania. Experience fabularne nie jest EXP.
- Tarcza: przycisk zmiany lokacji pozwala wskazać 1/2/3/4 lokacje zależnie od Mistrza Tarczy. T4 daje +1 ignorowania niskich kości tylko tam, gdzie osłania tarcza.
- Dystans: przy broni użyj „Przeładuj”. Przed strzałem można zadeklarować Przycelowanie 0–4. Broń zużywa załadowane pociski; nierozpoczęta ewidencja starej broni przyjmuje jeden pocisk na pierwszą próbę.
- Sekwencja: rozwiń sekcję w oknie ataku i wybieraj kolejne numery manewrów. Numer 0 kończy Sekwencję; 1 zaczyna nową. T3 pomija karę celowania tylko raz, poza pierwszym manewrem. T4 czwartego manewru wybiera ignorowanie Pancerza albo +1 Ranę.
- Runy: dodaj Item Runa do aktora, ustaw jej parametry i użyj przycisku wszczepienia w Ekwipunku. Wybierz runotwórcę i właściwe Rzemiosło. MG może zapisać już rozstrzygniętą runę lub usunąć ją z ciała. Limit to zaokrąglona w górę ⅓ ŻYW przed odjęciem kosztu Run. Każdy punkt kosztu obniża ŻYW i progi; Mistrz Run dodaje +5 do czterech Odporności za punkt, bez dodatkowego limitu.
- Nieudane wszczepienie: bezpośrednie Rany równe kosztowi runy. CF testów UM Półmaga przy rzucaniu: od 96 minus koszt Run w ciele (5 kosztu → 91–100). Zwykłe testy UM nie dostają tej kary.
- Trwałe Rany: wynik zapisuje się w Rozwoju i czacie; przycisk zastosowania uruchamia stany, kary i odliczanie. MG może leczyć/edytować poszczególne skutki. Stabilizacja zatrzymuje Ryzyko Śmierci, nie kasując rany. Pierwsza Pomoc stabilizuje automatycznie; dla innych właściwych metod MG używa przycisku stabilizacji. Poza Trackerem MG potwierdza pełne rundy ręcznie. Ruch na mapie nie jest blokowany: karta pokazuje jego mnożnik, a niesprawne kończyny i kary testów uwzględnia okno czynności.
- Therian: personalny Wyzwalacz Jaźni zapisuje się w kreatorze i na karcie. Jego spełnienie rozstrzygają gracz i MG; system nie wymyśla uniwersalnego bodźca.

## WIP i decyzje

WIP: Pamięć Krwi, Łączenie Żywiołów, Multiklasowość, pełny subsystem Rzemiosła, poziomy powyżej 11, nieukończone rasy i ostateczne odnawianie Przeczucia Przyszłości. Dawna tabela broni palnej zachowuje swoje nierozstrzygnięte uwagi; archiwalne Deadly Crits pozostają nieaktywne — jakość daje Punkty Bonusu zgodnie z 0.11.

Do decyzji autora: sposób nakładania stałych obrażeń i bonusów jakości na wiele strzał Wielostrzału. Koszt przeładowania i liczba pocisków działają, lecz obrażenia takiego strzału rozstrzyga MG. Pojedynczy strzał jest w pełni rozliczany.

Pełny zakres bieżących zmian: [CHANGELOG-0.11.8.md](docs/CHANGELOG-0.11.8.md) oraz [raport](docs/REPORT-0.11.8.md). Starsze raporty i README w katalogu historical opisują historię, nie aktualny kanon.


## Nowe w 0.11.7

Czytelne trzy karty Progów, menu Narzędzia/GM, filtry i przyciski talentów. Odporność zwiększa progi, nie odejmuje obrażeń. Mocna Skóra i Naturalna Obrona działają tylko na Fizyczne Progi. W 0.11.8 Hybrydę T4 aktywuje Owner/MG raz na walkę na 2 rundy, wyłącznie podczas aktywnej formy. Cel Świętego Płomienia MG oznacza jako Istotę Mroku. [Aktualny audyt talentów](docs/TALENT-AUDIT-0.11.8.md) rozróżnia mechanikę i automatyzację.
