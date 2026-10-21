# Správa uživatelů v AdonisJS – dojmy, pro a proti, srovnání s Laravelem

Projekt je ve složce `sprava-uzivatelu/`. Technický postup včetně problémů
a jejich řešení je v [POSTUP.md](POSTUP.md).

## Co aplikace umí

- registrace a přihlášení (`/signup`, `/login`),
- správa uživatelů (`/users`): výpis, přidání, úprava, smazání,
- validace (platný a unikátní e-mail, heslo 8–32 znaků, při úpravě je heslo nepovinné),
- uživatel nemůže smazat sám sebe, správa je dostupná jen přihlášeným,
- databáze **SQLite** (`tmp/db.sqlite3`), schéma vytváří migrace.

## Spuštění

Je potřeba Node.js ≥ 24 a npm ≥ 11.

```bash
cd sprava-uzivatelu
npm install
cp .env.example .env
node ace generate:key
node ace migration:run
node ace serve --hmr
```

Pak otevřít http://localhost:3333/signup, zaregistrovat se a v menu zvolit **Uživatelé**.

## Moje dojmy

Samotná správa uživatelů šla napsat rychle. Starter kit `hypermedia` už měl tabulku
`users`, model, registraci a přihlášení. Zbývalo dopsat kontroler, validátory,
routy a Edge šablony. Jedna řádka `router.resource('users', ...)` vytvořila
všechny CRUD routy. Kód je čistý a TypeScript při psaní opravdu pomáhá,
třeba u modelů a validátorů.

Nejvíc času mi ale zabralo **prostředí, ne framework**. Na školním PC jsem musel řešit
práva ke cache nástroje SWC a hlavně příliš starý Node (AdonisJS 7 chce Node 24,
na Node 22 padaly migrace i spouštění TypeScriptu). Chybové hlášky přitom
nebyly vždy nápovědou k příčině (`addQueryContext is not a function`).

## Pro

- **TypeScript od základu.** Typované modely, validátory i kontrolery, chyby se
  najdou už při `tsc`, ne až za běhu.
- **Rychlý start.** Starter kit dá hotovou autentizaci, sessions, CSRF ochranu
  (`shield`) a layout.
- **Vestavěné nástroje.** Lucid ORM, migrace, validátor (VineJS), hashování hesel
  a Edge šablony jsou součástí, nemusí se skládat z cizích balíčků.
- **Dobrá validace.** VineJS umí unikátnost v databázi i `meta` pro vynechání
  právě upravovaného záznamu.
- **Přehledná struktura.** `app/controllers`, `app/models`, `start/routes.ts`,
  `database/migrations`. Rychle se v tom orientuje, kdo zná MVC.
- **SQLite bez nastavování.** Stačí driver `better-sqlite3`, žádný databázový server.

## Proti

- **Přísné požadavky na prostředí.** Nejnovější verze vyžaduje Node ≥ 24, což
  na běžném (zejména školním) počítači často není nainstalované.
- **Menší komunita a méně materiálů.** Většina odpovědí, tutoriálů a balíčků
  existuje pro Laravel, u Adonisu jsem jich našel mnohem méně.
- **Dokumentace za vývojem zaostává.** Mezi verzemi se mění API (např. generované
  kontrolery `#generated/controllers`) a starší návody nesedí.
- **Hodně „magie“ kolem ESM a TypeScriptu.** Aliasy importů (`#models/...`),
  spouštění `.ts` přímo v Node a konfigurace SWC dělají problémy, když něco
  v prostředí nesedí.
- **Méně hotových řešení.** Na věci jako role, oprávnění nebo administrační
  rozhraní je potřeba víc psát ručně.
- **HTML formuláře.** PUT a DELETE se musí posílat přes method spoofing
  (`?_method=DELETE`), což je ale stejné i v Laravelu.

## Srovnání s Laravelem

| Oblast | AdonisJS | Laravel (PHP) |
|---|---|---|
| Jazyk | TypeScript / Node.js | PHP |
| Architektura | MVC, podobná struktura jako Laravel | MVC |
| ORM | Lucid (Active Record) | Eloquent (Active Record) |
| Šablony | Edge | Blade |
| Validace | VineJS | `Validator` / Form Requests |
| CLI | `node ace` | `php artisan` |
| Migrace | ano, vestavěné | ano, vestavěné |
| Autentizace | `@adonisjs/auth`, starter kit | Breeze, Jetstream, Fortify |
| Typová bezpečnost | silná (TypeScript) | slabší, volitelné typy |
| Komunita, balíčky, návody | menší | obrovská |
| Hotová admin řešení | téměř žádná | Filament, Nova, Backpack |
| Nároky na prostředí | Node 24+, nativní moduly | PHP + Composer, nenáročné |
| Souběžnost | async/await, jedno vlákno | tradiční request/response |

Adonis se Laravelu **hodně podobá**: Lucid vs. Eloquent, Edge vs. Blade, `ace`
vs. `artisan`, resource routy, migrace. Kdo zná Laravel, naučí se Adonis rychle.

Hlavní rozdíl je v **TypeScriptu**. V Adonisu je typová kontrola
přirozená a dává jistotu, v Laravelu je PHP volnější. Naopak Laravel vyhrává
**ekosystémem**: balíčky, generátory admin panelů, spousta návodů a snazší
hostování. U Laravelu by správa uživatelů zabrala podobně dlouho a hotový
admin panel (Filament) by ji ještě zkrátil.

## Závěr

AdonisJS je moderní a příjemný framework pro ty, kdo chtějí psát v TypeScriptu a
mají jednotné prostředí. Zadání se v něm dalo splnit rychle a výsledek je
přehledný. Pro školní projekt bych ho použil znovu, ale s předem ověřenou verzí
Node. Pro větší produkční aplikaci bych při nutnosti rychle najít hotová
řešení a hodně materiálů sáhl spíš po Laravelu.
