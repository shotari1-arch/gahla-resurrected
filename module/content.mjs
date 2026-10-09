import {CANON119,CANON_SPLITS119} from './talent-canon119.mjs';
import {SPLIT_TALENTS,rankSteps,RANK_TIERS,TRUE_FOUR} from './talent-ranks.mjs';
import {profileForName} from './weapon-profiles.mjs';
import { talentMaxLevel } from "./talent-balance.mjs";

export const RACES = {
  human: { key:"human", label:"Człowiek", playable:true, stats:{M:{zyw:4,sf:18,zr:13,sz:7,per:16,er:22,um:17,og:13,wia:7},K:{zyw:4,sf:15,zr:13,sz:7,per:17,er:22,um:17,og:15,wia:7}}, resist:{physical:5,mental:5,magical:10,spiritual:5}},
  olag: { key:"olag", label:"Olag", playable:true, stats:{M:{zyw:6,sf:20,zr:11,sz:7,per:13,er:18,um:7,og:6,wia:5},K:{zyw:6,sf:15,zr:12,sz:7,per:13,er:18,um:7,og:12,wia:3}}, resist:{physical:10,mental:5,magical:10,spiritual:5}},
  tauros: { key:"tauros", label:"Tauros", playable:true, stats:{M:{zyw:8,sf:30,zr:3,sz:4,per:10,er:10,um:12,og:7,wia:13},K:{zyw:8,sf:25,zr:5,sz:4,per:10,er:10,um:12,og:10,wia:13}}, resist:{physical:15,mental:5,magical:5,spiritual:15}},
  dwarf: { key:"dwarf", label:"Krasnolud", playable:true, stats:{M:{zyw:5,sf:24,zr:10,sz:5,per:8,er:25,um:12,og:11,wia:3},K:{zyw:5,sf:22,zr:10,sz:5,per:8,er:25,um:12,og:13,wia:3}}, resist:{physical:15,mental:5,magical:5,spiritual:5}},
  erusanin: { key:"erusanin", label:"Erusanin", playable:true, stats:{M:{zyw:3,sf:10,zr:18,sz:8,per:17,er:25,um:12,og:15,wia:13},K:{zyw:3,sf:8,zr:18,sz:8,per:17,er:25,um:12,og:17,wia:13}}, resist:{physical:5,mental:15,magical:15,spiritual:20}},
  kastianin: { key:"kastianin", label:"Kastianin", playable:true, stats:{M:{zyw:3,sf:15,zr:16,sz:8,per:17,er:27,um:13,og:17,wia:10},K:{zyw:3,sf:13,zr:17,sz:8,per:17,er:27,um:13,og:18,wia:10}}, resist:{physical:5,mental:20,magical:15,spiritual:5}},
  sharii: { key:"sharii", label:"Sharii", playable:true, stats:{M:{zyw:4,sf:12,zr:15,sz:7,per:17,er:22,um:10,og:18,wia:10},K:{zyw:4,sf:10,zr:17,sz:7,per:17,er:22,um:10,og:18,wia:10}}, resist:{physical:5,mental:15,magical:10,spiritual:15}},
  vampir: { key:"vampir", label:"Vampir", playable:true, usesHumanBase:true, resist:{physical:15,mental:5,magical:15,spiritual:0}},
  therian: { key:"therian", label:"Therianin", playable:true, usesHumanBase:true, resist:{physical:20,mental:5,magical:10,spiritual:0}},
  kevru: { key:"kevru", label:"Kevru", playable:false, wip:true },
  steelborn: { key:"steelborn", label:"Lud Stali", playable:false, wip:true },
  halfling: { key:"halfling", label:"Niziołek", playable:false, wip:true }
};

export const ARCHETYPES = {
  lowca: {key:"lowca", label:"Łowca", bgl:80, speed:3, defense:40, resist:{physical:15,mental:15,magical:5,spiritual:5}, combat:true},
  bestia: {key:"bestia", label:"Bestia", bgl:100, speed:2, defense:30, resist:{physical:25,mental:5,magical:5,spiritual:5}, combat:true},
  polmag: {key:"polmag", label:"Półmag", bgl:30, speed:1, defense:20, resist:{physical:5,mental:15,magical:25,spiritual:5}, magic:true},
  wojownik: {key:"wojownik", label:"Wojownik", bgl:80, speed:2, defense:40, resist:{physical:20,mental:10,magical:5,spiritual:5}, combat:true},
  kaplan: {key:"kaplan", label:"Kapłan", bgl:40, speed:1, defense:20, resist:{physical:5,mental:15,magical:10,spiritual:25}, faith:true}
};

const lp = (species, archetype, lifePath, zyw, values, growth, special=false) => ({species, archetype, lifePath, zyw, values, growth, special});
export const LIFE_PATHS = [
  lp("human","wojownik","Święty Rycerz",3,{sf:25,zr:5,per:15,er:10,um:5,og:25,wia:15},{sf:5,zr:1,per:3,er:2,um:1,og:5,wia:3}),
  lp("human","wojownik","Błędny Rycerz",3,{sf:25,zr:15,per:15,er:5,um:5,og:25,wia:5},{sf:5,zr:3,per:3,er:1,um:1,og:5,wia:1}),
  lp("human","wojownik","Czarny Rycerz",3,{sf:25,zr:5,per:15,er:15,um:15,og:25,wia:15},{sf:5,zr:1,per:3,er:3,um:3,og:5,wia:3}),
  lp("human","wojownik","Bojownik",3,{sf:30,zr:20,per:15,er:0,um:5,og:5,wia:5},{sf:6,zr:4,per:3,er:0,um:1,og:1,wia:1}),
  lp("human","polmag","Biały Magik",2,{sf:5,zr:15,per:20,er:20,um:25,og:15,wia:15},{sf:1,zr:3,per:4,er:4,um:5,og:3,wia:3}),
  lp("human","polmag","Dimidiagus",1,{sf:5,zr:5,per:20,er:20,um:30,og:15,wia:5},{sf:1,zr:1,per:4,er:4,um:6,og:3,wia:1}),
  lp("human","polmag","Czarnoksiężnik",0,{sf:5,zr:15,per:20,er:20,um:25,og:15,wia:15},{sf:1,zr:3,per:4,er:4,um:5,og:3,wia:3}),
  lp("human","lowca","Ręka Boga",2,{sf:15,zr:25,per:30,er:20,um:15,og:20,wia:20},{sf:3,zr:5,per:6,er:4,um:3,og:4,wia:4}),
  lp("human","lowca","Tropiciel",1,{sf:5,zr:25,per:35,er:15,um:5,og:20,wia:5},{sf:1,zr:5,per:7,er:3,um:1,og:4,wia:1}),
  lp("human","lowca","Oprawca",1,{sf:15,zr:25,per:35,er:15,um:5,og:20,wia:15},{sf:3,zr:5,per:7,er:3,um:1,og:4,wia:3}),
  lp("human","lowca","Bard",2,{sf:15,zr:25,per:15,er:25,um:5,og:30,wia:5},{sf:3,zr:5,per:3,er:5,um:1,og:6,wia:1}),
  lp("human","kaplan","Namiestnik Światła",2,{sf:5,zr:0,per:5,er:20,um:15,og:15,wia:25},{sf:1,zr:0,per:1,er:4,um:3,og:3,wia:5}),
  lp("human","kaplan","Ojczulek / Księżyna",1,{sf:5,zr:15,per:15,er:20,um:15,og:15,wia:15},{sf:1,zr:3,per:3,er:4,um:3,og:3,wia:3}),
  lp("human","kaplan","Kultysta",1,{sf:15,zr:0,per:5,er:25,um:15,og:15,wia:25},{sf:3,zr:0,per:1,er:5,um:3,og:3,wia:5}),
  lp("olag","wojownik","Wandal",4,{sf:30,zr:20,per:15,er:5,um:5,og:5,wia:15},{sf:6,zr:4,per:3,er:1,um:1,og:1,wia:3}),
  lp("olag","polmag","Szaman",2,{sf:20,zr:20,per:20,er:25,um:25,og:15,wia:25},{sf:4,zr:4,per:4,er:5,um:5,og:3,wia:5}),
  lp("tauros","wojownik","Święty Topór",3,{sf:30,zr:5,per:15,er:5,um:5,og:5,wia:15},{sf:6,zr:1,per:3,er:1,um:1,og:1,wia:3}),
  lp("tauros","wojownik","Sprawiedliwy Sędzia",3,{sf:30,zr:5,per:15,er:15,um:5,og:5,wia:5},{sf:6,zr:1,per:3,er:3,um:1,og:1,wia:1}),
  lp("tauros","wojownik","Krwawy Rzemieślnik",3,{sf:30,zr:15,per:15,er:5,um:5,og:5,wia:15},{sf:6,zr:3,per:3,er:1,um:1,og:1,wia:3}),
  lp("tauros","polmag","Dziki Czarownik",1,{sf:5,zr:5,per:20,er:20,um:30,og:15,wia:5},{sf:1,zr:1,per:4,er:4,um:6,og:3,wia:1}),
  lp("tauros","kaplan","Guślarz",1,{sf:5,zr:15,per:20,er:15,um:20,og:15,wia:30},{sf:1,zr:3,per:4,er:3,um:4,og:3,wia:6}),
  lp("dwarf","wojownik","Wartownik",3,{sf:30,zr:15,per:15,er:5,um:5,og:5,wia:5},{sf:6,zr:3,per:3,er:1,um:1,og:1,wia:1}),
  lp("dwarf","wojownik","Burzyciel Spokoju",3,{sf:30,zr:15,per:5,er:0,um:5,og:5,wia:5},{sf:6,zr:3,per:1,er:0,um:1,og:1,wia:1}),
  lp("dwarf","polmag","Pionier",2,{sf:15,zr:20,per:20,er:20,um:15,og:15,wia:15},{sf:3,zr:4,per:4,er:4,um:3,og:3,wia:3}),
  lp("dwarf","polmag","Mistyk Płomieni",1,{sf:5,zr:5,per:20,er:25,um:25,og:20,wia:25},{sf:1,zr:1,per:4,er:5,um:5,og:4,wia:5}),
  lp("dwarf","polmag","Eratyk",2,{sf:15,zr:5,per:15,er:15,um:20,og:20,wia:25},{sf:3,zr:1,per:3,er:3,um:4,og:4,wia:5}),
  lp("dwarf","polmag","Magnetyk",1,{sf:10,zr:15,per:15,er:25,um:25,og:15,wia:5},{sf:2,zr:3,per:3,er:5,um:5,og:3,wia:1}),
  lp("dwarf","kaplan","Znawca Run",2,{sf:15,zr:20,per:20,er:20,um:15,og:15,wia:15},{sf:3,zr:4,per:4,er:4,um:3,og:3,wia:3}),
  lp("dwarf","lowca","Śpiewak",3,{sf:20,zr:25,per:15,er:25,um:5,og:40,wia:5},{sf:4,zr:5,per:3,er:5,um:1,og:8,wia:1}),
  lp("erusanin","lowca","Ostrze Lasu",2,{sf:15,zr:25,per:25,er:15,um:5,og:20,wia:5},{sf:3,zr:5,per:5,er:3,um:1,og:4,wia:1}),
  lp("erusanin","polmag","Pierwotny Głos",0,{sf:5,zr:5,per:25,er:25,um:25,og:25,wia:5},{sf:1,zr:1,per:5,er:5,um:5,og:5,wia:1}),
  lp("erusanin","bestia","Starodrzew",20,{sf:40,zr:5,per:15,er:5,um:5,og:20,wia:5},{sf:8,zr:1,per:3,er:1,um:1,og:4,wia:1},true),
  lp("kastianin","lowca","Dłoń Mroku",2,{sf:25,zr:20,per:25,er:15,um:5,og:15,wia:15},{sf:5,zr:4,per:5,er:3,um:1,og:3,wia:3}),
  lp("kastianin","polmag","Dezerter Grozy",2,{sf:5,zr:20,per:20,er:25,um:25,og:15,wia:5},{sf:1,zr:4,per:4,er:5,um:5,og:3,wia:1}),
  lp("kastianin","bestia","Pradawny Cień",20,{sf:40,zr:15,per:15,er:15,um:15,og:20,wia:5},{sf:8,zr:3,per:3,er:3,um:3,og:4,wia:1},true),
  lp("sharii","lowca","Ramię Odnowy",2,{sf:25,zr:20,per:25,er:15,um:5,og:15,wia:15},{sf:5,zr:4,per:5,er:3,um:1,og:3,wia:3}),
  lp("sharii","polmag","Lśniący Odnowiciel",2,{sf:5,zr:20,per:25,er:20,um:25,og:15,wia:5},{sf:1,zr:4,per:5,er:4,um:5,og:3,wia:1}),
  lp("vampir","wojownik","Wyklęty",2,{sf:20,zr:15,per:25,er:5,um:5,og:20,wia:5},{sf:4,zr:3,per:5,er:1,um:1,og:4,wia:1}),
  lp("vampir","polmag","Zaklinacz",1,{sf:5,zr:15,per:25,er:25,um:25,og:20,wia:15},{sf:1,zr:3,per:5,er:5,um:5,og:4,wia:3}),
  lp("vampir","kaplan","Okultysta",1,{sf:15,zr:5,per:5,er:25,um:5,og:15,wia:25},{sf:3,zr:1,per:1,er:5,um:1,og:3,wia:5}),
  lp("vampir","lowca","Nemrod",1,{sf:5,zr:25,per:35,er:15,um:5,og:20,wia:5},{sf:1,zr:5,per:7,er:3,um:1,og:4,wia:1}),
  lp("therian","bestia","Mieszaniec",3,{sf:25,zr:15,per:20,er:5,um:5,og:10,wia:5},{sf:5,zr:3,per:4,er:1,um:1,og:2,wia:1})
];

export const RACIAL_TALENTS = [
  ["Widzenie w Ciemności","wszyscy","Widzisz w ciemności."],
  ["Wytrzymały","wszyscy","+2 do Progów Obrażeń na poziom talentu."],
  ["Mocna Skóra","wszyscy","+1 do Fizycznego Progu I i II za każdy Tier postaci (T1–T4: +1/+2/+3/+4). Nie zwiększa Pancerza ani pełnej Odporności i nie odejmuje obrażeń."],
  ["Nadludzka Siła","Taurosi","Raz na walkę, akcja darmowa: na 1 rundę podwajasz SF, potem Zmęczenie — także gdy walka skończy się wcześniej."],
  ["Szarża Taurosa","Taurosi","4 segmenty i cały darmowy ruch: szarża. Bonus obrażeń licz z bazowego SF przed chwilowymi mnożnikami: +1k10 za każde 20 SF, maksymalnie Tier + 2 k10. Przy bazowym SF 60+ możliwe Powalenie."],
  ["Silnoręki","Taurosi","Ataki +1k10 obrażeń, ale +1 OP."],
  ["Pamięć Krwi","Vampirsi","WIP – opis talentu w opracowaniu."],
  ["Krwisty Metabolizm","Vampirsi","Po wypiciu krwi zyskujesz pulę 1/2/3/4 użyć Ułatwienia do wybranych testów. Każde użycie zużywa 1 punkt puli; niewykorzystana pula znika po zakończeniu sceny albo odpoczynku."],
  ["Niezłomna Postawa","Krasnoludy","Ułatwienie do testu obronnego na Powalenie."],
  ["Podziemne Zmysły","Krasnoludy","Ułatwienie do testów PER pod ziemią."],
  ["Krasnoludzkie Rzemiosło","Krasnoludy","+20/+30/+40/+50 do testu wybranego fachu."],
  ["Plotkowanie","Ludzie","Ułatwienie tyle razy na sesję, ile poziomów talentu, do informacji wśród ludzi."],
  ["Wszechstronny","Ludzie, Olagowie","Raz na poziom, przy zakupie pakietu rozwoju statystyk za 50 EXP, rozwijasz 4 różne statystyki zamiast 3."],
  ["Zmysł Przyrody","Erusanie","Ułatwienie znajdowania ziół, surowców i zwierzyny w lesie."],
  ["Cztery Ręce","Erusanie","T1: do 4 przedmiotów; T3: tarcza z bronią dwuręczną lub +5 Obrony za wolną rękę."],
  ["Ciało Cienia","Kastianie","Możesz zamienić cień w oręż; obrażenia magiczne Cienia, min. 4 OP."],
  ["Ciało Światła","Sharii","Jak Ciało Cienia, dla Światła."],
  ["Bestialska Hybryda","Therianie",CANON119["Bestialska Hybryda"].description],
  ["Zmiennokształtny","Therianie",CANON119["Zmiennokształtny"].description],
  ["Mocne Kości","Olagowie","T1 +1 do Progu Obrażeń, T3 łącznie +2."],
  ["Przewodnik Mocy","Kevru","WIP – rasa jeszcze niegrywalna."]
].map(([name,requirements,description])=>({name,category:"racial",requirements,description,costBase:50}));

export const GENERAL_TALENTS = [
  ["Czytanie/Pisanie","Nauczyciel","Czytasz i piszesz w wybranym języku."],
  ["Pierwsza Pomoc","–","Raz na sesję na cel: zdejmujesz 1 stan i leczysz 1/2/3/4 rany wg Tieru."],
  ["Medycyna Zaawansowana","Pierwsza Pomoc T2","Ułatwienie diagnozy; T3: raz na sesję na cel usuwa Krwawienie lub Zatrucie akcją za 5 segmentów."],
  ["Jeździectwo","–","+10 do testu na Tier; od T3 egzotyczne wierzchowce."],
  ["Rzemieślnik (wybrany fach)","Nauczyciel / historia","Tworzenie przedmiotów; z Tierami rośnie szansa i maleje zużycie materiałów."],
  ["Wiedza Wybrana","–","+10 na Tier w wybranej dziedzinie, raz na Tier Ułatwienie."],
  ["Dyplomata","–","+10 (T1–2) lub +20 (T3–4) do testów społecznych i Ułatwienie tyle razy na sesję, ile poziomów."],
  ["Oburęczny","–","T1 brak kar za 2 bronie; T2 druga broń −1 seg.; T3 −2 seg. i +10 trafienia; T4 +20."],
  ["Heraldyka / Etykieta","–","Ułatwienie w testach."],
  ["Żywotny","–","+1/+2/+3/+4 do Żywotności."],
  ["Nienaturalnie Odporny","Tier 2","Przerzut testu odporności raz na sesję; T3 +10; T4 dwa przerzuty z +10."],
  ["Odporny Fizycznie","–","+5/+10/+15/+20 do Odporności Fizycznej."],
  ["Odporny Psychicznie","–","+5/+10/+15/+20 do Odporności Psychicznej."],
  ["Odporny Magicznie","–","+5/+10/+15/+20 do Odporności Magicznej."],
  ["Odporny Duchowo","–","+5/+10/+15/+20 do Odporności Duchowej."],
  ["Wnikliwość","–","+5 do bazowej PER; T3 kolejne +5."],
  ["Większa Muskulatura","–","+5 do bazowej SF; T3 kolejne +5."],
  ["Gibkość","–","+5 do bazowej ZR; T3 kolejne +5."],
  ["Uczony","–","+5 do bazowej ER; T3 kolejne +5."],
  ["Większa Ogłada","–","+5 do bazowej OG; T3 kolejne +5."],
  ["Potencjał Magiczny","Półmag T1","+5 do UM; T3 kolejne +5."],
  ["Potencjał Duchowy","Kapłan T1","+5 do WIA; T3 kolejne +5."],
  ["Odporność na Klimat","–","T1 Ułatwienie odporności na zimno/gorąco; T2 ignorujesz kary."],
  ["Mocne Płuca / Pływak / Wspinacz","–","Oddech 2× dłużej; Ułatwienie pływania i wspinaczki; T3 pełna SZ w wodzie lub tańsza wspinaczka."],
  ["Kowal własnego Losu","–","1 darmowy przerzut na sesję."],
  ["Naturalna Ochrona Trucizny","–","T1 Ułatwienie przeciw Zatruciu; T4 odporność na słabe trucizny."],
  ["Niezmordowany","–","T1 +5 Odp. Fiz. na zmęczenie; T3 ignorujesz karę pierwszego stopnia."],
  ["Zwinność Akrobaty","–","Ułatwienie testów równowagi."],
  ["Otwieranie Zamków","Tier 2","Ułatwienie testów zamków."],
  ["Rozbrajanie Pułapek","–","Ułatwienie testów pułapek."],
  ["Kartograf / Sztuka Rysunku / Poliglota","Czytanie/Pisanie","Ułatwienia w mapach, rysunku i językach; T3 fałszerstwa, ukryte znaczenia, negocjacje."],
  ["Sztuka Kulinarna / Zielarstwo","–","Ułatwienia; T3 posiłek daje +1 tymczasowej ŻYW, mikstura leczy 1 ranę."],
  ["Opanowanie Instrumentu / Uzdolnienie Artystyczne / Znawca Bestii","Instrument: Większa Ogłada T1","Ułatwienia w występach i oswajaniu; T3 muzyka może dać Ułatwienie lub +5."],
  ["Strateg","Uczony T1","Ułatwienie taktyki; T3: 5 seg. daje sojusznikowi +1 segment w następnej rundzie."],
  ["Znawca Rynku","–","+10 T1 / +30 T3 do wyceny; Ułatwienie handlu."],
  ["Łamacz Zbroi","Tier 2","Broń dwuręczna dostaje Penetrację 1 (T2), 2 (T3), T4 Ułatwienie przeciw ciężkiej zbroi."],
  ["Celny Cios","–","+5/+10/+15/+20 do trafienia w zwarciu."],
  ["Szybki","–","+5/+10/+15/+20 do Obrony."]
].map(([name,requirements,description])=>({name,category:"general",requirements,description,costBase:50}));

export const ARCHETYPE_TALENTS = [
  ["Umiejętności Magiczne","Półmag","Rzucanie i tworzenie zaklęć o koszcie 5/10/15/20."],
  ["Biegłość Magiczna","Półmag","T1 brak kary za księgi i zwoje; T2–T4 −1/−2/−3 OP czarów, brak gestów T3, brak słów T4."],
  ["Pamięć Maga","Półmag","Zapamiętujesz 1/2/3/4 zaklęcia więcej."],
  ["Modlitwa","Kapłan","Cuda i błogosławieństwa o koszcie 5/10/15/20; bonusy od bóstwa; bez Ryzyk."],
  ["Ulubione zaklęcie / cud","Mag / Kapłan","Jedno zaklęcie/cud z dodatkowymi efektami 2/3/4/5 kosztu bez dodatkowego OP."],
  ["Nasycenie Źródła Mocy","Półmag / Kapłan","Zaklinasz zwykłe przedmioty na źródła mocy i ulepszasz ich umagicznienie."],
  ["Mistrzostwo Aury","Półmag / Kapłan","+2/+3/+4/+5 punktów maksymalnej Aury."],
  ["Osłona Koncentracji","Półmag / Kapłan T2","T2: 2 Aury dla +10 Obrony przeciw pojedynczemu atakowi; T3–T4 ochrona przed przerwaniem czaru."],
  ["Magiczne Powidoki","Półmag","Bonus 2k10–5k10 z poprzedniego czaru tej samej szkoły."],
  ["Energia Krwi","Półmag / Kapłan Kardy","Zadajesz sobie ranę, aby zyskać 2–5 punktów kosztu aspektów."],
  ["Święte Dłonie","Kapłan","Leczysz 1/2/3/4 rany więcej przy leczeniu akcją."],
  ["Doświadczenie Magiczne / Kapłańskie","Półmag / Kapłan","1/1/2/2 przerzuty testu rzucania czaru lub cudu na walkę (T1/T2/T3/T4)."],
  ["Walka Wręcz","Wojownik / Łowca / Bestia","Własne manewry i sekwencje."],
  ["Mistrz Sekwencji","Walka Wręcz","Zniżka OP następnego manewru po sekwencji i dodatkowe kości bonusu."],
  ["Żelazne Natarcie","Wojownik T3","Ułatwienie odporności na Powalenie/Pchnięcie w sekwencji."],
  ["Kontrolowana Sekwencja","Łowca T3","T3: jeden manewr Sekwencji, poza pierwszym, ignoruje karę −30 za celowanie w lokację. T4: ostatni, czwarty manewr pełnej Sekwencji ignoruje Pancerz ALBO zadaje +1 Ranę."],
  ["Specjalny Manewr","Wojownik / Łowca","Dodatkowy manewr poza slotami z darmowym kosztem 2/3/4/5 i zwiększonymi limitami."],
  ["Mocny Cios","Wojownik / Łowca / Bestia","Do ataków wręcz dodajesz cyfrę dziesiątek SF."],
  ["Precyzyjny Strzał","Wojownik / Łowca","Do ataków zasięgowych dodajesz cyfrę dziesiątek PER."],
  ["Mistrz Broni","–","+10 do trafienia z 1/2/3/4 wybranych rodzajów broni (liczba rodzajów rośnie z poziomem talentu)."],
  ["Szkolenie Oręża","Wojownik","Przy sukcesie z bonusem lub krytyku otrzymujesz +1 dodatkowy punkt bonusu za każdy poziom talentu. Krytyk nie podwaja bonusu z tego talentu."],
  ["Wojak","Wojownik T3","Pierwszy wybrany bonus w ataku kosztuje o 1 mniej."],
  ["Śmiertelny Cios","Wojownik / Łowca / Bestia T2","Dodatkowe +10 do LW; jakość trafienia jest już uwzględniona w bazowej formule."],
  ["Doświadczony Wojak / Doświadczenie Strzelca","Wojownik / Łowca","1/1/2/2 przerzuty trafienia w zwarciu / z dystansu na walkę (T1/T2/T3/T4)."],
  ["Szybki Refleks","Wojownik / Łowca","Możesz mieć w turze Unik i Parowanie jako dwie reakcje na różne rzeczy."],
  ["Szybka Wymiana","Wojownik T2 / Łowca T2","Wymiana broni jako reakcja za 3."],
  ["Rozmach Olbrzyma","Wojownik","Tańszy Zamaszysty z bronią dwuręczną; więcej celów; pełne obrażenia w kolejne cele."],
  ["Nieustępliwe Uderzenie","Wojownik T2","Bonusy dla broni dwuręcznej przeciw Powalonym i po sukcesie manewru."],
  ["Mistrz Parowania","Wojownik / Łowca","+5/+10/+15/+20 do parowania."],
  ["Mistrz Tarczy","Wojownik","T1: 2 lokacje tarczy; T2: 3; T3–T4: 4. T4: zakres ignorowanych niskich wyników tarczy +1 wyłącznie na chronionej lokacji. Bez zmiany bazowego Pancerza."],
  ["Mistrz Bloku","Wojownik","+5/+10/+15/+20 do bloku tarczą."],
  ["Garda Weterana","Wojownik T1","Zmiana lokacji tarczy, silniejszy Unik, tańszy atak po Uniku/Parowaniu."],
  ["Uderzenie Tarczą","Wojownik T2","Darmowy manewr ogłuszający tarczą; 5 seg. potem taniej."],
  ["Szybkie Przeładowanie","Łowca","−1/−2/−3/−4 do przeładowania; koszt przeładowania nigdy nie spada poniżej 1 segmentu, chyba że efekt mówi wprost inaczej."],
  ["Przycelowanie","Wojownik / Łowca","Wydajesz segmenty: +5 trafienia za segment (max 4), +1k10 za każde +10."],
  ["Sokole Oko","Łowca T3 + Przycelowanie","Przycelowanie: +15 trafienia/segment zamiast +5. Pierwsze 2 segmenty dają +2k10; kolejne pełne 2 dają +1k10."],
  ["Celny Strzał","Sokole Oko","Mniejsza kara za celowanie w lokację, do 6 przyszłych segmentów."],
  ["Wielostrzał","Łowca T3","T3: 2 strzały naraz w jeden cel; T4: 3. Każda dodatkowa strzała dodaje połowę bazowego OP przeładowania."],
  ["Grad Strzał","Łowca","Jeden rzut na trafienie w 2–3 cele lub obszar 5 m."],
  ["Taktyczny Wybór","Łowca","Bonusy z dystansu i ukrycia oraz utrudnienie ataków dystansowych na Ciebie."],
  ["Błyskawiczne Otwarcie","Łowca T2","Jedna akcja w rundzie kosztuje o 3 mniej (min. 2)."],
  ["Akrobatyczny Unik","Łowca","Do bonusu z Uniku dodajesz cyfrę dziesiątek ZR."],
  ["Przygotowany Atak","Łowca","Atak z zaskoczenia: Penetracja, Ułatwienie, dodatkowa Rana."],
  ["Ruch Cienia","Łowca T2","2 m ruchu po ataku, tańszy Unik w lekkiej zbroi, cięcie kosztu pierwszej akcji."],
  ["Mistrz Ukrywania / Cichy Ruch","Łowca","Ułatwienia w skradaniu i ukrywaniu przedmiotów."],
  ["Blokada Aury","Bestia","Aura zablokowana bez zbroi; 1/5 max Aury konwertuje się na bonus do progu (5 Aury = +1)."],
  ["Zwierzęcy Szał","Bestia","Ułatwienie Twoich ataków i ataków na Ciebie; także po przekroczeniu połowy max Ran."],
  ["Szybka Regeneracja","Bestia","Raz na walkę, T4 dwa razy: leczysz 1/2/3/4 Rany lub zdejmujesz stan."],
  ["Pazury i Kły","Bestia","Pazury jako broń; +1k10 i +1 Penetracji bez broni, rośnie z Tierem."],
  ["Naturalna Obrona","Bestia","T1/T2/T3/T4: łącznie +2/+4/+6/+8 do Fizycznego Progu I i II oraz +0/+5/+5/+10 pełnej Odporności Fizycznej. T4: raz na rundę Ułatwienie do jednego testu Odporności Fizycznej przeciw stanowi wywołanemu otrzymanym trafieniem. Nie odejmuje obrażeń."]
].map(([name,requirements,description])=>({name,category:"archetype",requirements,description,costBase:100}));

export const SPECIAL_TALENTS = [
  ["Szkolenie Mnicha","Kapłan – Ścieżka Ojczulek / Księżyna","Talent specjalny, 2 rangi. R1 (T1): ręce i nogi jako broń, darmowa Walka Wręcz; +20 BGŁ wyłącznie w systemowym unarmed i z jednym wybranym rodzajem zwykłej broni wręcz. +1k10 wyłącznie unarmed, nigdy automatycznie Pazury/Kły ani Broń Mnicha. Most Wojownik/Łowca do połowy Tieru Kapłana w górę. R2 (T2): sytuacyjne BGŁ łącznie +30, stałe +10 Obrony i +1 SZ; unarmed nadal +1k10. Rodzaj Broni Mnicha wybiera się raz, korekta tylko przez MG."],
  ["Duchowa Pięść","Ojczulek / Księżyna + Walka Wręcz","Kontrola Aury, obrażenia żywiołem, płacenie Aurą kosztu manewrów, Penetracja 1 bez broni."],
  ["Magiczne Manewry","Wojownik/Łowca T2 + Półmag/Kapłan T1","Łączysz manewr z zaklęciem lub cudem."],
  ["Runotwórstwo","Znawca Run lub nauczyciel","Test: ceil((WIA + ZR + UM + SF) / 4) + 10 × poziom Runotwórstwa + 10 za odpowiednie Rzemiosło."],
  ["Mistrz Run","Znawca Run T3","+5 do wszystkich odporności za każdy koszt runy w ciele."],
  ["Chwyt Tytana","SF 40/50/60 dla T2/T3/T4","Dwie podstawowe bronie zamiast lekkich, potem dwie ciężkie."],
  ["Krok Widma","Półmag T1 + Łowca T1","Raz na walkę test na niewidzialność do końca tury lub do ataku."],
  ["Przeczucie Przyszłości","Półmag czasu / Kapłan Zolana","Zapisujesz 1/2/3/4 wyniki k100. Aby użyć zapisanego wyniku dla siebie lub widzianej istoty, deklarujesz podmianę przed wykonaniem danego rzutu; zużyty wynik zostaje wykreślony."],
  ["Wybraniec Boży","Ścieżka: Święty Rycerz, 3. poziom","Własny Special Feature Świętego Rycerza: traktowany jako Kapłan o połowę słabszy."],
  ["Święty Wojownik","Ścieżka: Święty Rycerz, 6. poziom","¼ maksymalnej Aury jako stałe obrażenia od żywiołu bóstwa."],
  ["Błogosławiony","Ścieżka: Święty Rycerz, 11. poziom","Traktowany jako Kapłan Tieru 3."],
  ["Pamięć Krwi","Vampirsi","WIP – mechanika w opracowaniu."]
].map(([name,requirements,description])=>({name,category:"special",requirements,description,costBase:100}));

export const DEITY_TALENTS = [
  ["Gida","Niosący Sprawiedliwość","Ułatwienie odporności Psych./Duch. przeciw wpływom Mroku."],
  ["Gida","Święty Płomień","Element Ogień w cudzie o 1 tańszy. Obrażenia Ognia z tego Cudu ignorują wyłącznie bonus Progów z Odporności Duchowej istoty Mroku, wskazanej przez MG. Bazowe progi ŻYW, inne bonusy, Pancerz i aktywne testy przeciw stanom pozostają."],
  ["Gida","Gniew Gidy","Nasycasz broń ognistym oczyszczeniem; magiczny ogień i Podpalenie."],
  ["Eruel","Wola Życia","Ułatwienie testów Pierwszej Pomocy."],
  ["Eruel","Dotyk Litości","Leczenie ran tańsze o 1; Święte Dłonie leczą o 1 ranę więcej."],
  ["Eruel","Sanktuarium Eruela","Strefa 10 m: sojusznicy +10/+15 do odporności; T4 leczą 1 Ranę na początku swojej tury, maksymalnie raz na rundę na postać."],
  ["Maris","Płomyk Nadziei","Ułatwienie Odp. Psych. przeciw Przerażeniu w 10 m."],
  ["Maris","Głos Otuchy","Usuwanie stanów tańsze o 1; Przerażenie o 2."],
  ["Maris","Niezłomna Wiara","Dajesz sojusznikowi tymczasowy Punkt Losu. Tymczasowy Punkt Losu nie daje EXP za wydanie i nie może uruchomić efektu tworzącego kolejny Punkt Losu."],
  ["Alēgmón","Spojrzenie Herolda","Ułatwienie ER/PER przy śmierci i nieumarłych; proste nieumarłe nie atakują."],
  ["Alēgmón","Słowo Ostatniego Strażnika","Przerażenie tańsze o 1; cuda kontaktu z duszami tańsze."],
  ["Alēgmón","Dwa Oblicza Śmierci","Łaskawe: +2 do Progu sojusznika; Gniewne: −2 do Progu wroga; skaluje się z Tierem."],
  ["Mürgel","Serce Burzy","+10 Odp. Fiz., odporność na pogodę, Ułatwienie przeciw Powaleniu."],
  ["Mürgel","Gniew Burzy","Element Elektryczność lub Wiatr o 2 tańszy; dodatkowe obrażenia z dziesiątek WIA."],
  ["Mürgel","Żołnierz Burzy","Nasycasz ataki wręcz Elektrycznością; +1k10/2k10, Szok, Powalenie."],
  ["Alherian","Pewny Krok","Ułatwienie nawigacji i orientacji."],
  ["Alherian","Światło Przewodnika","Bonus do SZ i PER tańszy; ochronne cuda trwają rundę dłużej."],
  ["Alherian","Ostoja Wędrowca","Strefa: ignorowanie trudnego terenu, +5/+10 do Obrony."],
  ["Guizto i Skaebne","Rytuał Dwoistości","K100 na sesję: błogosławieństwo dla sojusznika albo klątwa dla wroga."],
  ["Guizto i Skaebne","Kradzież Fortuny","Droższe Utrudnienie, ale na bonusie Punkt Losu."],
  ["Guizto i Skaebne","Kaprys Losu","Punkt Fortuny: zmuszasz istotę do przerzutu."],
  ["Prudir","Purpurowa Maska","Ułatwienie Ogłady przy kłamstwie i wmieszaniu się w tłum."],
  ["Prudir","Kielich Rozpusty","Cuda emocji i halucynacji o 2 tańsze."],
  ["Prudir","Taniec Satyra","Test OG vs Odp. Psych. daje wrogowi Utrudnienie ataku."],
  ["Zolaan","Ziarna Czasu","2 Aury: pierwsza akcja w turze −2 OP."],
  ["Zolaan","Przyspieszony Nurt","Odjęcie OP i bonus do SZ w cudzie tańsze."],
  ["Zolaan","Pętla Przeznaczenia","Zapisujesz krytyczny sukces i używasz go za sojusznika."],
  ["Lavi","Spojrzenie w Przyszłość","Raz na sesję pytasz MG o skutki planowanego działania."],
  ["Lavi","Głos Wyroczni","Bonus do PER lub ER w cudzie bez kosztu."],
  ["Lavi","Nić Przeznaczenia","Dodatkowy Punkt Losu, przerzut dla sojusznika."],
  ["Traad","Honor Wojownika","Uczysz się talentu Wojownika Tieru 1."],
  ["Traad","Szał Bitewny","Wzmocnione modyfikacje cudów Pomocy."],
  ["Traad","Nieustępliwość Tępiciela","Po Ranie +5 do +15 Odp. Fiz. do końca walki."],
  ["Anella","Jedność z Naturą","Ułatwienie przetrwania, tropienia i ziół."],
  ["Anella","Szept Puszczy","Cuda na zwierzęta i rośliny bez dopłaty."],
  ["Anella","Skóra jak Kora","Bez zbroi: T1 +1 pancerza na wszystkich lokacjach; T2 nadal +1 i +5 Odp. Fiz.; T3 +2 pancerza i łącznie +10 Odp. Fiz. Talent ma maks. 3 poziomy; pancerz z talentu działa z Aurą."],
  ["Karda","Rytualna Ofiara","Energia Krwi jako talent archetypowy."],
  ["Karda","Krwawe Przymierze","1 własna Rana obniża koszt cudu o 2."],
  ["Karda","Klątwa Krwawej Matki","Krwawienie z obrażeniami cudu za darmo; T4 2k10."],
  ["Naŭcro","Sługa Martwego Oblicza","Ułatwienie społeczne z nieumarłymi; proste ożywieńce nie atakują."],
  ["Naŭcro","Szept zza Grobu","Cuda wskrzeszania sług o 2 tańsze."],
  ["Naŭcro","Profanacja Spokoju","Przerażenie utrudnione w 10 m; kara do Odp. Duchowej wrogów."],
  ["Fènwe","Krok w Cieniu","Ułatwienie skradania w mroku."],
  ["Fènwe","Szept z Mroku","Cień o 1 tańszy; dodatkowe obrażenia dla nieświadomego celu."],
  ["Fènwe","Ostrze Cieni","Dodatkowe 1k10/2k10 na pierwszy atak wręcz z zaskoczenia."],
  ["Lor i Malo","Nosiciel Niegodziwości","Ułatwienie przeciw Zatruciu, +5 odporności na bagnach."],
  ["Lor i Malo","Spaczenie Materii","Zatrucie tańsze o 1; Woda i Ziemia bez kosztu."],
  ["Lor i Malo","Plaga Zarazy","Utrudnienie odporności wybranego celu i osłabienie Żywotności."]
].map(([deity,name,description])=>({name,category:"deity",deity,requirements:`Kapłan ${deity}`,description,costBase:100}));

for(const list of [GENERAL_TALENTS,ARCHETYPE_TALENTS])for(let i=list.length-1;i>=0;i--){const original=list[i],parts=SPLIT_TALENTS[original.name];if(parts)list.splice(i,1,...parts.map(([name,description])=>({...original,name,description,requirements:name==='Opanowanie Instrumentu'?'Większa Ogłada T1':['Uzdolnienie Artystyczne','Znawca Bestii','Poliglota','Sztuka Rysunku'].includes(name)?'–':original.requirements})));}
for(const list of [ARCHETYPE_TALENTS])for(let i=list.length-1;i>=0;i--){const original=list[i],names=CANON_SPLITS119[original.name];if(names)list.splice(i,1,...names.map(name=>({...original,name,...CANON119[name]})));}
export const ALL_TALENTS = [...RACIAL_TALENTS,...GENERAL_TALENTS,...ARCHETYPE_TALENTS,...SPECIAL_TALENTS,...DEITY_TALENTS];
for(const talent of ALL_TALENTS)if(CANON119[talent.name])Object.assign(talent,CANON119[talent.name]);
for(const talent of ALL_TALENTS){talent.maxLevel=talentMaxLevel(talent.name,4);talent.rankTiers=rankSteps(talent).map(r=>r.effectTier);talent.maxRank=talent.rankTiers.length;talent.rankNeedsDecision=!CANON119[talent.name]&&(talent.maxRank===4&&!RANK_TIERS[talent.name]&&!TRUE_FOUR.has(talent.name));}

export const WEAPONS = [
  ["Sztylet","3k10",1,4,["Lekka"],1,"piercing"], ["Lewak","2k10",1,4,["Lekka","Parująca"],1,"piercing"], ["Krótki Miecz","4k10",1,5,["Podstawowa"],2,"slashing"], ["Długi Miecz","5k10",1,6,["Podstawowa","Parująca"],2,"slashing"], ["Miecz Półtoraręczny","6k10",1.5,7,["1,5-ręczna","Parująca"],2,"slashing"], ["Dwuręczny Miecz","8k10",2,9,["2-ręczna","Nieporęczna"],3,"slashing"],
  ["Toporek","4k10",1,5,["Podstawowa"],2,"slashing"], ["Topór Bojowy","6k10",1,7,["Penetrująca 1","Nieporęczna"],2,"slashing"], ["Dwuręczny Topór Bojowy","9k10",2,10,["2-ręczna","Ciężka","Penetrująca 1"],3,"slashing"],
  ["Maczuga","4k10",1,5,["Podstawowa","Nieporęczna"],2,"blunt"], ["Buzdygan","5k10",1,6,["Penetrująca 1"],2,"blunt"], ["Młot Bojowy","6k10",1,7,["Ciężka"],2,"blunt"], ["Młot Dwuręczny","8k10",2,9,["2-ręczna","Ciężka"],3,"blunt"],
  ["Włócznia","5k10",2,6,["2-ręczna"],3,"piercing"], ["Halabarda","7k10",2,8,["2-ręczna","Penetrująca 1"],3,"slashing"],
  ["Walka bez broni","1k10",1,3,[],0,"blunt"]
].map(([name,damage,hands,delay,traits,runes,woundProfile])=>({type:"weapon",name,system:{damage,damageType:"physical",woundProfile,hands,delay,traits,equipped:false,penetration:Number((traits.find(t=>t.startsWith("Penetrująca"))||"").match(/(\d+)/)?.[1]||0),runSlots:runes,flatDamage:0,element:"",reload:0,broken:0,damageBonusDice:0,isRanged:false,range:""}}));

WEAPONS.push(...[
 ['Krótki Łuk','3k10',4,0,['2-ręczna'],2,'sf'],['Długi Łuk','4k10',5,1,['2-ręczna','Nieporęczna','Penetracja 1'],2,'sf'],['Kusza Ręczna','3k10',6,1,['Lekka','Penetracja 1'],1,''],['Kusza Lekka','6k10',8,2,['2-ręczna','Penetracja 2'],2,''],['Kusza Ciężka','10k10',10,2,['2-ręczna','Ciężka','Penetracja 2'],2,'']
].map(([name,damage,reload,penetration,traits,runSlots,damageStat])=>({name,type:'weapon',system:{damage,reload,penetration,traits,runSlots,damageStat,damageType:'physical',woundProfile:'projectile',isRanged:true,delay:2,hands:name==='Kusza Ręczna'?1:2,equipped:false}})));

for(const weapon of WEAPONS)weapon.system.profileId=profileForName(weapon.name);

export const ARMORS = [
  ["Ubranie",0,0,["body"],[],true,0],
  ["Szaty Kapłana",0,0,["body","leftArm","rightArm","leftLeg","rightLeg"],["+1 Aura","2 runy"],true,0],
  ["Szaty Półmaga",0,0,["body","leftArm","rightArm","leftLeg","rightLeg"],["+1 Aura","2 runy"],true,0],
  ["Lekka Zbroja",1,5,["leftArm","rightArm","body","leftLeg","rightLeg"],[],false,0],
  ["Średnia Zbroja",2,-10,["head","leftArm","rightArm","body","leftLeg","rightLeg"],["Ignoruje 1 na kościach","-10 skradania"],false,1],
  ["Ciężka Zbroja",4,-30,["head","leftArm","rightArm","body","leftLeg","rightLeg"],["Ignoruje 1 i 2","Wymóg SF 50"],false,2]
].map(([name,armor,defenseMod,locations,traits,auraCompatible,ignoreLow])=>({type:"armor",name,system:{armor,defenseMod,locations:Object.fromEntries([["head"],["leftArm"],["rightArm"],["body"],["leftLeg"],["rightLeg"]].map(([k])=>[k,locations.includes(k)?armor:0])),traits,equipped:false,auraCompatible,isShield:false,ignoreLow,magical:false,armorElementResistance:""}}));
export const SHIELDS = [
  ["Lekka Tarcza",1,["Ignoruje 1","Parująca +10","+1 pancerza lokacji"],1,3,1],
  ["Ciężka Tarcza",2,["Ignoruje 1 i 2","Parująca","Ciężka","+2 pancerza lokacji","Wymóg SF 50"],1,3,2]
].map(([name,armor,traits,hands,delay,ignoreLow])=>({type:"armor",name,system:{armor,defenseMod:0,locations:{head:0,leftArm:armor,rightArm:0,body:0,leftLeg:0,rightLeg:0},traits,equipped:false,auraCompatible:false,isShield:true,ignoreLow,hands,delay,damage:"1k10"}}));

export const SPELL_ASPECTS = [
  ["Leczenie ran",3,"+1 za każdą leczoną ranę"],["Tymczasowy bonus ŻYW",2,"1 pkt = +1 tymczasowej ŻYW"],["Usunięcie / odporność na wybrany stan",2,"Na następną aplikację stanu"],["Usunięcie / odporność na wszystkie stany",5,"Wszystkie stany"],
  ["Obrażenia",1,"1k10"],["Cyfra dziesiątek UM/Wiara do obrażeń",1,"Stałe obrażenia równe cyfrze dziesiątek, max 1"],["Penetracja pancerza",3,"1 Penetracji"],["Element",2,"1. element za 2/poziom; kolejne drożej"],
  ["Bonus do wybranej cechy",1,"+10"],["Bonus do trafienia",1,"+10"],["Bonus do obrażeń",2,"+1k10"],["Bonus do odporności jednej",1,"+10"],["Bonus do wszystkich odporności",3,"+10"],["Bonus do obrony",1,"+10"],["Bonus do pancerza",3,"+1 pancerza całe ciało, max 2"],["Bonus do Progu Obrażeń",1,"+1"],["Pancerz z Odpornością na Żywioł",3,"Odporność pancerza na wybrany żywioł"],["Przyspieszenie",5,"Stan Przyspieszenie"],["Bonus do szybkości",2,"+1 SZ; kolejne x2"],["Umagicznienie broni / zbroi",2,"Magiczne / element"],
  ["Zredukowanie pancerza",3,"-1 na całe ciało"],["Zredukowanie testu jednej cechy",1,"-10"],["Zredukowanie testu wszystkich",3,"-10"],["Zredukowanie szybkości",2,"-1 SZ"],["Zredukowanie progu obrażeń",1,"-1"],["Zredukowanie obrony / trafienia",1,"-10"],["Test odporności na efekt celu",2,"-10 do testu odporności"],
  ["Krwawienie",3,"Stan"],["Zatrucie",4,"Stan"],["Podpalenie",2,"Stan"],["Uśpienie",7,"Stan"],["Oszołomienie",3,"Stan"],["Ślepota",4,"Stan"],["Zmęczenie",6,"Stan"],["Przerażenie",4,"Stan"],["Spowolnienie",5,"Stan"],["Powalenie",2,"Stan"],["Nadanie nadwrażliwości na element",4,"Po nieudanym teście odporności"],
  ["Cel: rzucający",0,"Także dotyk"],["Cel: pojedynczy",1,"Za cel"],["Cel: obszar",3,"Za 10 m²"],["Zasięg – bliski",1,""],["Zasięg – średni",2,""],["Zasięg – daleki",3,""],["Długość – natychmiastowy",0,""],["Długość – 1 runda",1,"Za rundę"],["Rzucenie jako Reakcja",5,"Koszt reakcji 4; OP musi być 4"],["Odjęcie OP rzucania",2,"-3 OP, nie poniżej 4"],["Trigger",1,"Nie jest reakcją"],["Dodatkowe X","X","Własny efekt MG"]
].map(([name,cost,description])=>({name,cost,description}));

export const MANEUVER_ASPECTS = [
  ["Użycie obu rąk","+2 OP","Tylko broń 1,5- lub 2-ręczna; + połowa kości obrażeń broni, zaokrąglona w górę (raz)."],
  ["Silny","1* / +1k10","+1k10 obrażeń, maks. 2."],
  ["Celny","1* / +10","+10 do trafienia, maks. 2."],
  ["Powalający","3*","Po nieudanym teście Odporności Fizycznej cel zostaje Powalony."],
  ["Krwawy","4*","Po nieudanym teście Odporności Fizycznej cel otrzymuje Krwawienie."],
  ["Ogłuszający","4*","Po nieudanym teście Odporności Fizycznej cel otrzymuje Oszołomienie."],
  ["Szybki","1k10 / -1 OP","Odejmij 1 kość obrażeń za każde -1 OP; maks. -2 OP."],
  ["Penetrujący","2* / +1 Pen.","+1 Penetracji, maks. 2."],
  ["Zamaszysty","2* / +1 cel","+1 dodatkowy cel, któremu zadajesz połowę obrażeń; maks. +3 cele."],
  ["Kreatywny","X*","Własny efekt ustalony we współpracy z MG."],
  ["Koszt *","1*","Zapłać dowolnie: -1k10 obrażeń, +1 OP albo -10 do trafienia."]
].map(([name,cost,description])=>({name,cost,description}));

export const CONDITIONS = {
  prone:{label:"Powalenie",resist:"physical",description:"Ataki celu z Utrudnieniem; wręcz na cel Ułatwienie, dystans na cel Utrudnienie; wstanie za połowę segmentów."},
  bleeding:{label:"Krwawienie",resist:"physical",description:"1k10 obrażeń na końcu tury za każdy stos; tamowanie akcją."},
  poisoned:{label:"Zatrucie",resist:"physical",description:"Utrudnienie do ataków, testów SF i Odp. Fiz."},
  frightened:{label:"Przerażenie",resist:"mental",description:"Utrudnienie do ataków/testów wobec źródła strachu; nie możesz dobrowolnie się zbliżyć."},
  stunned:{label:"Oszołomienie",resist:"physical",description:"Następną akcję tracisz na pustą stratę 5 segmentów; ataki na Ciebie mają Ułatwienie do końca rundy."},
  blind:{label:"Ślepota",resist:"spiritual",description:"Połowa trafienia."},
  frozen:{label:"Zamarznięcie",resist:"magical",description:"Bazowo połowa ruchu; dodatkowy ruch droższy, ZR z Utrudnieniem."},
  shocked:{label:"Szok",resist:"magical",description:"Przerywa akcję przeciwnika."},
  auraWeak:{label:"Osłabienie Aury",resist:"magical",description:"Tracisz 1 Aury za poziom elementu; Utrudnienie trafienia dystansowego i PER."},
  burning:{label:"Podpalenie",resist:"magical",description:"1k10 obrażeń na poziom elementu na początku tury; gaszenie połową segmentów."},
  asleep:{label:"Uśpienie",resist:"spiritual",description:"Ataki automatycznie trafiają i są krytyczne; budzisz się po obrażeniach."},
  fatigued:{label:"Zmęczenie",resist:"physical",description:"-10 do wszystkich testów i -1 SZ za poziom."},
  slowed:{label:"Spowolnienie",resist:"spiritual",description:"-3 SZ, -20 Obrony, +1 OP wszystkich akcji."},
  hasted:{label:"Przyspieszenie",resist:"spiritual",description:"+3 SZ, +20 Obrony, -1 OP wszystkich akcji; koszt nie spada poniżej normalnego minimalnego OP akcji."}
};

export const ELEMENTS = {
  fire:{label:"Ogień",condition:"burning",resist:"magical",description:"Podpalenie; obrażenia 1k10/poziom na początku tury."},
  ice:{label:"Lód",condition:"frozen",resist:"magical",description:"Zamarznięcie; połowa ruchu, dodatkowy ruch droższy, ZR Utrudnione."},
  lightning:{label:"Elektryczność",condition:"shocked",resist:"magical",description:"Szok; przerywa akcję."},
  earth:{label:"Ziemia",condition:"prone",resist:"physical",description:"Powalenie po nieudanym teście Odp. Fiz."},
  water:{label:"Woda",condition:"auraWeak",resist:"magical",description:"Osłabienie Aury; utrata Aury i Utrudnienie dystansu/PER."},
  wind:{label:"Wiatr",condition:"pushed",resist:"physical",description:"Pchnięcie o 2 m na poziom."},
  light:{label:"Światło",condition:"blind",resist:"spiritual",description:"Ślepota po nieudanym teście Duchowej/Psychicznej."},
  shadow:{label:"Cień",condition:"frightened",resist:"spiritual",description:"Przerażenie po nieudanym teście Duchowej/Psychicznej."}
};

export const DEITIES = [...new Set(DEITY_TALENTS.map(t=>t.deity))].map(d=>({key:d,label:d}));

export const METALS = [
  {tier:1,name:"Umagiczniony metal / Magiczny ogień",weapon:"Ignoruje połowę zwykłego pancerza; brak utrudnień przeciw bytom magicznym i duchowym.",armor:"Pełny pancerz przeciw magicznym atakom."},
  {tier:1,name:"Metal Lekki / Fach elficki",weapon:"−1 OP",armor:"+10 Obrony."},
  {tier:1,name:"Metal Zbalansowany",weapon:"+10 Trafienia",armor:"+10 Obrony."},
  {tier:1,name:"Metal Ciężki / Fach krasnoludzki",weapon:"+1k10 obrażeń",armor:"+1 pancerza."},
  {tier:2,name:"Metal Ostrzejszy",weapon:"+1 Penetracji",armor:"+1 pancerza."},
  {tier:3,name:"Metal Runiczny (Rhasdar?)",weapon:"+1 miejsce na runę",armor:"+1 miejsce na runę."},
  {tier:3,name:"Fach krasnoludzkiego kowala run",weapon:"+1k10 obrażeń, +1 miejsce na runę",armor:"+1 pancerza, +1 miejsce na runę."},
  {tier:3,name:"Metal Magiczny (Adamantyt?)",weapon:"Umagicznienie zadaje 2× obrażeń od elementu",armor:"Buffy działają dłużej na nosicielu."},
  {tier:4,name:"Smoczy Oddech",weapon:"+3k10 Ognia; obrażenia magiczne; Podpalenie przy sukcesie na pół",armor:"Odporność na ogień lub żywioł zależny od smoka."},
  {tier:4,name:"Metal Antymagiczny",weapon:"Przy sukcesie z bonusem może zdjąć efekt magiczny",armor:"Zdana odporność całkowicie niweluje zaklęcie albo daje Ułatwienie na odporności."}
];

export const RUNE_TYPES = [
  {name:"Runa Szybkości",cost:2,tier:1,max:1,scope:"item",description:"+1 do Szybkości."},
  {name:"Runa Statystyk",cost:1,tier:1,scope:"item",description:"+5 do wybranej cechy."},
  {name:"Runa Odporności",cost:1,tier:1,scope:"item",description:"+10 do wybranej odporności."},
  {name:"Runa Obrony",cost:1,tier:1,scope:"item",description:"+10 do Obrony."},
  {name:"Runa Pancerza",cost:2,tier:1,scope:"armor",description:"+1 pancerza na wybranej lokacji; nie do broni."},
  {name:"Runa Zaklętej Magii / Cudu",cost:1,tier:3,scope:"item",description:"Zaklęcie/cud zaklęty w runie, użycie raz na długi odpoczynek."},
  {name:"Runa Ułatwienia w testach magicznych/modlitwy",cost:4,tier:4,max:1,scope:"item",description:"Ułatwienie w testach rzucania."},
  {name:"Runa Obrażeń",cost:1,tier:1,scope:"weapon",description:"+1k10 obrażeń."},
  {name:"Runa Penetracji",cost:1,tier:1,scope:"weapon",description:"+1 Penetracji."},
  {name:"Runa Niezniszczalności",cost:null,tier:2,scope:"item",description:"Raz na długi odpoczynek zdejmujesz 1 Ranę, tracąc ochronę bez faktycznego zniszczenia pancerza."},
  {name:"Runa Magiczna",cost:1,tier:4,scope:"item",description:"Zmienia obrażenia fizyczne w magiczne lub pancerz w magiczny; dla Źródła Mocy +1 poziom umagicznienia."},
  {name:"Runa Elementu",cost:2,tier:3,scope:"item",description:"Broń: +1k10 obrażeń od żywiołu i efekt na bonusie; zbroja: odporność na żywioł."},
  {name:"Runa Ułatwienia w ataku / strzale",cost:4,tier:4,max:1,scope:"weapon",description:"Ułatwienie w testach ataku."}
];

// Źródło: dostarczony arkusz Pechy.html. Opisy są znormalizowane do terminologii Gahli
// (k10 zamiast d10; Oszołomienie opisane zgodnie z systemem; błąd „Kapłan” w Pechu magicznym poprawiony na rzucającego).
export const FAILURE_TABLES = {
  magic:[
    [1,10,"Drobne Konsekwencje","Jeśli test UM się udał, czar się udaje, ale zużywasz reakcję 3 segmentów w tej rundzie lub tracisz ją na początku następnej."],
    [11,25,"Odskok Energii","Tracisz 2 Aury; bez Aury dostajesz 1 Ranę. Czar się nie aktywuje."],
    [26,55,"Poważna Kontuzja","Powalenie i 2k10 obrażeń ignorujących pancerz."],
    [56,75,"Niestabilne Skupienie","Czar się nie aktywuje; otrzymujesz Oszołomienie (następna akcja jest pustą stratą 5 segmentów)."],
    [76,90,"Całkowita Katastrofa","5k10 obrażeń magicznych rzucającemu ignorujących pancerz i Odp. Magiczną; Powalenie."],
    [91,100,"Czar Dziczeje","Czar aktywuje się na losowy cel albo cel wybrany przez MG; możliwe dodatkowe efekty."]
  ],
  divine:[
    [1,10,"Drobna Pokuta","Cud się nie aktywuje; zużywasz reakcję 3 segmentów w tej rundzie albo tracisz ją na początku następnej."],
    [11,25,"Utrata Łaski","Cud się nie aktywuje; tracisz 2 Aury. Bez Aury 1 osobisty Punkt Losu, a bez niego 1 Ranę."],
    [26,55,"Konfuzja Wiary","Cud się nie aktywuje; otrzymujesz Oszołomienie (następna akcja jest pustą stratą 5 segmentów)."],
    [56,75,"Boska Pokuta","Powalenie i Zmęczenie (−10 do testów) na 1k6 rund."],
    [76,90,"Klątwa Niepowodzenia","Powalenie; Utrudnienie do WIA i OG do końca następnej rundy; tracisz całą pozostałą Aurę."],
    [91,100,"Odrzucenie","Tracisz zdolność rzucania cudów na 1k6 godzin czasu fabularnego."]
  ],
  maneuver:[
    [1,10,"Drobne Odbicie","Atak/manewr się nie udaje; reakcja 3 segmentów w tej rundzie lub na początku następnej."],
    [11,25,"Nieskoordynowany Ruch","Manewr się nie udaje; tracisz niewykorzystane segmenty; cel ma Ułatwienie do pierwszego ataku w następnej rundzie."],
    [26,55,"Utrata Równowagi","Powalenie."],
    [56,75,"Uszkodzenie Broni / Sprzętu","Broń dostaje 1 punkt Uszkodzenia; przy walce bez broni otrzymujesz Oszołomienie (następna akcja = pusta strata 5 segmentów)."],
    [76,90,"Wstrząs Bojowy","Otrzymujesz Oszołomienie (następna akcja = pusta strata 5 segmentów) i 1 Ranę ignorującą pancerz."],
    [91,100,"Fatalny Błąd Pozycyjny","Przez 1k6 rund brak manewrów/sekwencji, tylko ataki podstawowe; Powalenie."]
  ],
  ranged:[
    [1,10,"Zacięcie / Strata Czasu","Natychmiast pełne przeładowanie mimo talentów."],
    [11,25,"Niezdara","Strzał nieudany; tracisz 1 Punkt Losu na przerzut albo 1k6 amunicji."],
    [26,55,"Niespodziewany Ruch","Powalenie po nagłym ruchu; cel ma Ułatwienie do pierwszego ataku."],
    [56,75,"Uszkodzenie Sprzętu Dystansowego","Broń uszkodzona; prowizoryczna naprawa 5 segmentów albo nieużywalna."],
    [76,90,"Strzał w Sojusznika","Pocisk trafia losowego sojusznika; trafienie z Utrudnieniem, losowa lokacja."],
    [91,100,"Krytyczna Awaria Sprzętu","Broń nie działa do końca walki; tracisz 3 segmenty i otrzymujesz Oszołomienie (następna akcja = pusta strata 5 segmentów)."]
  ]
};
