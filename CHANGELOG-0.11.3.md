# Gahla Resurrected 0.11.3-beta — deklaracje obrony przed trafieniem

Baza: dostarczona paczka 0.11.2-beta. Zachowane poprawki generatorów, kreatora i minimum OP Przyspieszenia.

## Nowa kolejność
1. Atakujący wybiera atak i jego modyfikatory. System sprawdza dostępność kosztu akcji.
2. Właściciel celu otrzymuje okno: brak reakcji, Unik z liczbą segmentów albo dostępne Parowanie. System wybiera jednego aktywnego właściciela; preferuje gracza z przypisaną postacią. Jeśli nie ma aktywnego gracza-właściciela, decyzję podejmuje aktywny MG. Bez żadnego uprawnionego aktywnego użytkownika atak nie jest wykonywany.
3. System ponownie sprawdza dostępność wybranej reakcji i nalicza jej koszt. Unik zachowuje dotychczasowe +5 Obrony/segment, a Unik Specjalny +8. Parowanie korzysta z istniejącego testu i kosztu; nie jest oferowane wobec ataku dystansowego.
4. Dopiero po potwierdzeniu następuje pobranie kosztu ataku oraz losowanie i publikacja k100 trafienia. Wynik ataku nie jest wcześniej losowany ani przekazywany właścicielowi celu. Premia Uniku obniża próg trafienia przed oceną wyniku. Udane parowanie blokuje obrażenia.

Okno nie zależy od późniejszego sukcesu trafienia: obrona jest deklarowana bez znajomości k100. Zamknięcie okna anuluje atak; nie oznacza domyślnego braku reakcji. Koszt obrony jest wydawany również wtedy, gdy późniejszy rzut ataku chybi.

## Integracja i zabezpieczenia
- Obsługa właściciela na innym kliencie przez prywatne dokumenty ChatMessage i zdarzenie createChatMessage. Wiadomość oczekiwania zawiera uczestników i identyfikator żądania, nie wynik k100 ani próg trafienia.
- Odpowiedź jest akceptowana tylko od wybranego użytkownika z prawem do celu. Powtórne dostarczenie tego samego żądania nie otwiera kolejnego okna i nie pobiera drugiego kosztu. Równoległe decyzje dla obrońcy są kolejkowane na jego kliencie.
- Stare przyciski Uniku i Parowania na ujawnionych kartach nie pozwalają deklarować reakcji po wyniku. Nowe karty pokazują zatwierdzoną obronę zamiast przycisków jej wyboru.
- Ataki bronią, manewry i darmowe kontrataki przechodzą przez wspólną procedurę ataku.
- Przerzuty trafienia z talentu i Punktu Losu zachowują pierwotną deklarację obrony; bez ponownego okna, kosztu reakcji i kosztu OP ataku. Stara karta przerzuconego ataku nie pozwala ponownie naliczyć obrażeń.
- Wynik parowania oraz jego przycisk kontrataku są publikowane po karcie trafienia, aby nie uruchamiać kontrataku podczas oczekiwania na pierwotny atak.
- Odświeżenie klienta atakującego anuluje jego stare oczekujące żądania. Usunięcie wiadomości oczekiwania przerywa lokalne oczekiwanie. Brak odpowiedzi nie powoduje automatycznego rzutu ani wyboru „brak reakcji”.

## Zakres
Okno oferuje reakcje mające istniejącą, automatyczną obsługę przeciw atakowi: Unik oraz Parowanie. Nie dopisano zasad dla opisowych talentów, WIP ani własnych reakcji MG. Oddzielne zasady rzucania czarów jako reakcji i deklarowania Aury wobec obrażeń nie zostały przebudowane.

## Testy
- 29/29 zestawów regresyjnych PASS.
- Nowy test: brak losowania przed wyborem, kolejność płatności i karty ataku, anulowanie, Unik, parowanie, blokada obrażeń, przerzut bez drugiego kosztu, autoryzacja właściciela i zduplikowane wiadomości.
- Rzeczywista metoda parowania oraz trackerReaction: koszt płacony przed testem parowania; karta odroczona.
- Dwa odizolowane konteksty przeglądarki Edge, rzeczywiste moduły systemu i formularz reakcji: prośba dociera wyłącznie do wybranego właściciela, przed potwierdzeniem oba liczniki k100 wynoszą zero, Unik kosztuje raz, a karta trafienia powstaje po odpowiedzi.
- Kontrola składni wszystkich modułów JS i plików JSON; test startu systemu oraz wcześniejsze regresje generatorów i Przyspieszenia.

Testy przeglądarkowe używają atrap API Foundry i symulowanego transportu dokumentów. Nie zastępują testu na uruchomionym serwerze Foundry V14 z dwoma zalogowanymi użytkownikami. Obsługa transportu korzysta z publicznego API [ChatMessage V14](https://foundryvtt.com/api/v14/classes/foundry.documents.ChatMessage.html).

## Pliki
- `module/defense-declarations.mjs` — nowa procedura wyboru i przekazania obrony.
- `module/documents.mjs` — kolejność ataku, koszt parowania, odroczona karta parowania.
- `module/context-reactions.mjs` — dostępność obrony i blokada deklaracji po wyniku.
- `module/sheets.mjs` — przerzut z zachowaniem obrony i blokada starego przycisku Parowania.
- `gahla-resurrected.mjs`, `system.json` — rejestracja obsługi i wersja.
- `dev-tests/defense-declarations-regression.mjs`, `dev-tests/browser/defense-handoff.mjs` — nowe testy.
- `dev-tests/automation-chat-regression.mjs`, `dev-tests/haste-minimum-regression.mjs` — dostosowanie do deklaracji przed rzutem.
- `CHANGELOG-0.11.3.md` — ten dokument.

## Instalacja
Zastąp pliki systemu zawartością ZIP, ponownie uruchom świat i odśwież klientów wszystkich graczy. Wersja nie wymaga migracji Actorów ani Itemów. Stare karty ataków nie uzyskują wstecznie deklaracji obrony — rozpocznij nowy atak.
