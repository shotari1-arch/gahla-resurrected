# Audyt przycisków i powtórzeń — 0.11.7

Zliczanie statycznego szablonu (warianty warunkowe też są liczone). Test przeglądarkowy dodatkowo sprawdza gotowy DOM, filtry i dostęp MG/gracza.

| Akcja | 0.11.6 | 0.11.7 |
|---|---:|---:|
| openTalentTree | 3 | 2 |
| openTracker | 1 | 1 |
| openCreator | 1 | 1 |
| adjustFate | 2 | 2 |
| rollStat | 1 | 1 |
| attack | 3 | 2 |
| openAbilityBuilder | 4 | 4 |
| castSpell | 2 | 2 |
| spendFate | 1 | 1 |
| longRest | 1 | 1 |
| toggleCondition | 1 | 1 |
| toggleEquip | 4 | 4 |
| itemRoll | 2 | 2 |
| reload | 1 | 1 |
| openItem | 4 | 4 |
| removeItem | 6 | 6 |
| moveShield | 1 | 1 |
| bodyRune | 1 | 1 |
| togglePrepared | 2 | 2 |
| useManeuver | 1 | 1 |
| editAbility | 2 | 2 |
| injury | 5 | 5 |
| runecraft | 1 | 1 |
| spendXp | 1 | 1 |
| awardSessionXP | 1 | 1 |
| undoPurchase | 1 | 1 |
| addExperience | 1 | 1 |
| rollExperience | 1 | 1 |
| removeExperience | 1 | 1 |
| addFeature | 1 | 1 |
| removeFeature | 1 | 1 |
| npcBasicAttack | 1 | 1 |
| sheetTool | 0 | 6 |
| toggleDarkness | 0 | 1 |
| useActiveTalent | 0 | 1 |

## Mapa przeniesienia

| Narzędzie | Wcześniejsze miejsca | Docelowe miejsce |
|---|---|---|
| Tracker | nagłówek i szybkie akcje | Narzędzia |
| Drzewko talentów | nagłówek, szybkie akcje, Talenty | Narzędzia i kontekstowy przycisk zakładki Talenty |
| Kreatory zdolności | szybkie akcje i zakładki | Narzędzia oraz właściwa zakładka |
| Aktywne talenty | wstrzyknięty pasek nad kartą | Narzędzia i przyciski poszczególnych talentów |
| Rozwój | wstrzyknięty pasek | Narzędzia; zakładka nadal zawiera historię EXP |
| Audyt | wstrzyknięty pasek dla każdego | Narzędzia GM; blokada wykonania dla gracza |
| Sesja, boss, biblioteka | rozproszone globalne skróty | Narzędzia GM; generatory dostępne z panelu sesji/biblioteki |

Usunięto panel Szybkich akcji i dynamiczne wstrzykiwanie paska wraz z jego listenerami. Kontekstowe przyciski w Walce, Magii, Talentach i Rozwoju są zachowane celowo. Zakładki nie znikają. Menu kreatora magii sprawdza również mosty i posiadane zaklęcia. Brak przycisków plus przy statystykach; plus/minus osobistego Losu pozostaje. Hotbar nadal obsługuje dotychczasowe makra.
