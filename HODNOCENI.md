# AdonisJS – moje zkušenost, pro a proti, srovnání s Laravelem

Zadání bylo vyzkoušet AdonisJS a udělat v něm správu uživatelů nad SQLite.
Aplikace je ve složce `sprava-uzivatelu/`, podrobný postup i s chybami, které
jsem cestou řešil, je v [POSTUP.md](POSTUP.md). Tady je spíš to, co si o
frameworku myslím.

## Co jsem vlastně udělal

Jde o malou aplikaci, kde se dá zaregistrovat, přihlásit a pak v tabulce
spravovat uživatele: přidat, upravit, smazat. E-mail musí být platný a unikátní,
heslo má mít 8 až 32 znaků a při úpravě se dá nechat prázdné, pak se nezmění.
Smazat sám sebe nejde, což je drobnost, ale bez ní by si člověk snadno usekl větev,
na které sedí. Všechno je dostupné jen po přihlášení. Data jsou v SQLite
(`tmp/db.sqlite3`) a tabulku vytváří migrace.

Ke spuštění je potřeba Node.js 24 nebo novější:

```bash
cd sprava-uzivatelu
npm install
cp .env.example .env
node ace generate:key
node ace migration:run
node ace serve --hmr
```

Pak na http://localhost:3333/signup udělat účet a v menu kliknout na Uživatelé.

## Jak se mi s tím pracovalo

Vlastní programování šlo překvapivě rychle. Starter kit `hypermedia` už přinesl
model `User`, migraci, registraci i přihlášení, takže jsem dopisoval jen to, co
v něm chybělo: kontroler, validátory, routy a tři šablony. Jedna řádka
`router.resource('users', ...)` vyrobí všech šest cest a kontroler pak jen
doplní metody se stejnými názvy. Připomnělo mi to resource controllery, které
znám z Laravelu, takže jsem se v tom neztrácel.

Největší část času mi ale nezabral kód, nýbrž **prostředí na školním počítači**.
Nejdřív instalátor v PowerShellu nepochopil `--` a hlásil „Non-interactive
environment“. Pak se SWC (to je nástroj, který překládá TypeScript) odmítl
spustit, protože složka `D:\Users` patří lokálnímu adminovi a on nevěří ničemu
pod ní. A nakonec se ukázalo, že AdonisJS 7 chce Node 24, kdežto já měl 22.
Na něm to padalo na `Unknown file extension ".ts"` a po dalším obejití na
`addQueryContext is not a function`, kde z hlášky nepoznáte, že je za tím
vlastně jen stará verze Node. Po updatu všechno naráz fungovalo. Nebyla to chyba
frameworku, ale kdyby mi to na začátku někdo řekl, ušetřil bych si hodně hodin.

Co se mi líbilo, byla validace. VineJS umí zkontrolovat unikátnost e-mailu přímo
v databázi a při úpravě stačí předat `meta` s ID právě upravovaného uživatele,
aby se nehádal sám se sebou. Líbilo se mi i to, že TypeScript hlídá celý řetěz
od modelu po šablonu a chyby vyskočí hned při `tsc`, ne až když kliknu na tlačítko.
Naopak mě trochu zlobilo, že formuláře v HTML znají jen GET a POST, takže se
PUT a DELETE musí posílat přes `?_method=`. To ale není vina Adonisu, v Laravelu
je to stejné.

## Pro

- TypeScript všude. Model, validátor, kontroler, vše má typy a editor
  napovídá.
- Dostanete hodně hotového: autentizaci, session, CSRF ochranu, hashování
  hesel, ORM i migrace. Nemusí se nic lepit z cizích balíčků.
- Dobře čitelná struktura složek (`app/controllers`, `app/models`,
  `start/routes.ts`, `database/migrations`). Kdo zná MVC, najde všechno hned.
- SQLite funguje bez jakékoli konfigurace, žádný databázový server.
- Příkazová řádka `node ace` je pohodlná, migrace a generování souborů jdou
  jedním příkazem.

## Proti

- Tvrdé požadavky na prostředí. Aktuální verze potřebuje Node 24, což na
  školních počítačích a ve starších instalacích prostě není.
- Menší komunita. Když jsem hledal řešení, odpovědí bylo mnohem míň než u
  Laravelu a často byly pro starší verzi, která už tak nefunguje.
- Dokumentace a návody občas zaostávají za novými verzemi. Třeba generované
  importy kontrolerů (`#generated/controllers`) jsem v tutoriálech nenašel.
- Chybové hlášky kolem ESM, aliasů importů a SWC nejsou vždy nápomocné.
  Dá se v nich zabloudit.
- Na administraci, role nebo oprávnění není skoro nic hotového, tohle se píše
  ručně.

## Srovnání s Laravelem

Srovnání vychází z toho, co jsem viděl při práci v Adonisu a v dokumentaci
obou frameworků.

| | AdonisJS | Laravel |
|---|---|---|
| Jazyk | TypeScript (Node.js) | PHP |
| ORM | Lucid | Eloquent |
| Šablony | Edge | Blade |
| Validace | VineJS | Form Requests / Validator |
| CLI | `node ace` | `php artisan` |
| Hotová admin řešení | skoro žádná | Filament, Nova a další |
| Komunita a návody | malá | velká |
| Typová bezpečnost | silná | slabší |

Podobnost je až nápadná. Lucid je prakticky Eloquent, Edge se tváří jako Blade,
`ace` jako `artisan`, a i resource routy a migrace fungují stejně. Kdo umí
Laravel, přepne se na Adonis za odpoledne.

Rozdíl vidím hlavně ve dvou věcech. Adonis má **TypeScript**, takže víc chyb
chytí překladač a kód je jistější. Laravel zase má **ekosystém**: spoustu
balíčků, generátory administrace jako Filament a díky velké komunitě
okamžitě najdete odpověď na skoro jakýkoli problém. Správu uživatelů bych
v Laravelu s Filamentem složil možná za půl hodiny, kdežto tady jsem všechno
psal ručně. Na druhou stranu Laravel potřebuje PHP a Composer, tedy zase jiné
prostředí, ale nároky jsou menší a nic mi tam nepadalo kvůli verzi.

## Závěr

Do AdonisJS jsem se nakonec moc nezamiloval. Samotná správa uživatelů se
napsala rychle, ale kód mi nepřišel nijak zvlášť příjemný. Spousta věcí se
děje „na pozadí“ (generované importy, aliasy `#models/...`, spouštění
TypeScriptu přes SWC) a když něco nefunguje, špatně se hledá proč. Většinu času
jsem nestrávil psaním aplikace, ale bojem s prostředím, a chybové hlášky mi
při tom moc nepomáhaly. K tomu menší komunita a méně návodů, takže jsem si
musel poradit sám. Z téhle zkušenosti bych si příště nejdřív ověřil, jestli na
počítači běží správná verze Node.

Pokud bych si mohl vybrat, vzal bych raději Laravel. Je pro mě přehlednější,
má hotová řešení (třeba administraci) a když si nevím rady, najdu odpověď
během chvilky. AdonisJS bych znovu zkusil nanejvýš tam, kde mi opravdu záleží
na TypeScriptu.
