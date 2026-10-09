> Raport archiwalny. Aktualny kanon i stan wdrożenia: [REPORT-0.11.5.md](REPORT-0.11.5.md).

# Audyt dostarczonych tabel — Gahla Resurrected 0.9.3-beta

Źródła przeanalizowane w tej iteracji:

- `Gahla resurrected tabelki.zip`: Rasa, Archetyp/Ścieżka Życia, Elementy, Stany, Zbrojownia Tier 1, Zbrojownia Tier 2+, generator przedmiotów magicznych, Odporności, opcjonalna tabela EXP.
- `Tabelki2 rng_pech_crit_talenty.zip`: Pechy, Trwałe Rany — broń sieczna, obuchowa, strzały/bełty, broń palna oraz tabela Trwałych Ran żywiołowych oznaczona w pliku jako AI.

## Zmiany wdrożone

1. **Pechy** — tabela w kodzie była już bardzo bliska arkuszowi. Opisy znormalizowano do Gahli: `k10` zamiast `d10`, Oszołomienie opisane jako pusta następna akcja za 5 segmentów, a oczywisty błąd „Kapłan” w Pechu magicznym pozostaje poprawiony na rzucającego.
2. **Trwałe Rany** — dodano strukturalny plik `data/lingering-wounds.json` oraz automatyczne wyszukanie skutku po wyniku LW, typie obrażeń i lokacji.
3. **Broń kłuta** — brakowała w źródłach. Dodano osobną tabelę jako **WIP**, adaptowaną do Gahli na bazie rozkładu ciężkości tabeli pocisków, ale bez mechaniki utkniętego pocisku.
4. **Trwałe Rany żywiołowe** — zachowane jako **WIP**, bo sam arkusz jest oznaczony jako tabela AI. Terminologię poprawiono, ale system nie traktuje jej jako mechaniki zatwierdzonej.
5. **Pozostałości z innych systemów** — usunięto/zmieniono m.in. skróty i terminy typu WW/SW/WT/PŻ/PB, Punkt Obłędu, „Bardzo Trudny (-30)” i notację `d10`. Tam, gdzie źródło używało mechaniki nieistniejącej w Gahli, wpis oznaczono jako WIP zamiast wymyślać nową zasadę.
   - Dotyczy to także procentowych szans śmierci, infekcji bez osobnego podsystemu oraz zapisów typu „wartość następnego krytyka”. Takie niepewności są oznaczone WIP na poziomie konkretnego wiersza, nawet gdy cała tabela fizyczna jest aktywna.
   - Wielorundowe „ogłuszenia” z arkuszy nie redefiniują stanu: w Gahli Oszołomienie oznacza następną pustą akcję za 5 segmentów. Jeśli źródło zakładało kilka rund, zapis mówi o ponownym otrzymaniu Oszołomienia w kolejnych rundach i jest oznaczony WIP.
6. **Skutki trwałe** — Foundry pokazuje sugerowany wynik tabeli, ale celowo nie wpisuje automatycznie amputacji, trwałych kar, paraliżu ani Ryzyka Śmierci. MG zatwierdza i prowadzi te konsekwencje.

## Dane potwierdzające istniejące mechaniki

- `Rasa.html`, `Archetyp Sciezka.html` i `Tabelki odpornosci.html` potwierdzają statystyki grywalnych ras, archetypów i Ścieżek Życia już używane przez system.
- `Stany.html` potwierdza obecny model stanów; szczególnie Oszołomienie = następna pusta akcja o koszcie 5 segmentów.
- `Element.html` potwierdza osiem obecnych żywiołów. Sekcja łączenia żywiołów jest jawnie **WIP** i nadal pozostaje WIP.
- `Tabelka Expa.html` opisuje **opcjonalny** wariant rozwoju poziomu przez zebraną pulę EXP. Nie zastępuje obecnej bazowej zasady milestone od MG.

## Dane świadomie niewłączone automatycznie w 0.9.3

### Broń dystansowa Tier 1

Arkusz `Zbrojownia Tier1.html` zawiera już pełne wartości łuków i kusz. Nie seedujemy ich jeszcze automatycznie, ponieważ łuki mają specjalne obrażenia `Xk10 + cyfra dziesiątek SF`, a kod broni wymaga osobnego, jawnego pola na ten modyfikator. Dodanie samych Itemów bez tej obsługi dawałoby błędne obrażenia. Integracja zostaje oznaczona jako WIP zamiast tworzyć niepełną mechanikę.

### Generator przedmiotów magicznych / Zbrojownia Tier 2+

Tabele zostały przejrzane. Nie zostały automatycznie podpięte do losowania przedmiotów w tej iteracji, ponieważ jest to osobny większy moduł (budżet mocy, aspekty, metale/fachy, przedmioty przeklęte). Obecne zatwierdzone metale/runy w systemie pozostają bez zmian.

### Rasy niegrywalne

Kevru i Lud Stali mają w arkuszach część wartości, Niziołki pozostają WIP. Wszystkie trzy pozostają niegrywalne/WIP zgodnie z dotychczasową decyzją projektową.
