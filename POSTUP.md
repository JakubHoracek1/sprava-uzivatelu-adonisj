# Správa uživatelů v AdonisJS – postup vytvoření

Zadání: udělat v Node.js jednoduchou správu uživatelů nad SQL databází podle
frameworku [AdonisJS](https://docs.adonisjs.com/installation).

Výsledek je ve složce `sprava-uzivatelu/`. Aplikace umí:

- registraci a přihlášení (`/signup`, `/login`),
- výpis uživatelů v tabulce (`/users`),
- přidání, úpravu a smazání uživatele,
- kontrolu dat (platný a neopakující se e-mail, heslo 8–32 znaků),
- ochranu proti smazání sebe sama; správa je dostupná jen po přihlášení.

Data se ukládají do **SQLite**, což je SQL databáze v jednom souboru (`tmp/db.sqlite3`).

---

## 1. Kontrola prostředí

Nejdřív jsem v PowerShellu zjistil, co je ve složce a jaká je verze Node:

```powershell
Get-Content package.json; Get-Content index.js; node -v; npm -v
```

Složka obsahovala jen prázdný `package.json` a `index.js`. Na počítači byl Node **22.16.0**.

---

## 2. Založení projektu

Podle návodu se projekt zakládá příkazem `npm create adonisjs@latest`.
Instalátor se v neinteraktivním terminálu ptá na **starter kit**. Vybral jsem
`hypermedia`: HTML stránky se generují na serveru, což je pro jednoduchou
správu uživatelů nejjednodušší varianta.

### Problém 1: PowerShell zahazuje `--`

```powershell
npm init adonisjs@latest -- sprava-uzivatelu --kit="hypermedia" --pkg="npm"
```

Windows PowerShell 5.1 bere `--` jako svůj vlastní znak a nepředá ho dál do `npm`.
Instalátor se tak k parametrům vůbec nedostal a skončil chybou
`Non-interactive environment detected`.

**Řešení:** stejný příkaz jsem spustil přes **Git Bash**, kde `--` funguje normálně:

```bash
npm init adonisjs@latest -- sprava-uzivatelu --kit="hypermedia" --pkg="npm"
```

Projekt se vytvořil a nainstalovaly se balíčky. Spadl až poslední krok, `node ace generate:key`.

---

## 3. Problémy školního PC

### Problém 2: SWC odmítá cache pod `D:\Users`

AdonisJS používá k překladu TypeScriptu nástroj **SWC**. Ten si ukládá nativní
knihovnu do cache a z bezpečnostních důvodů kontroluje, komu patří nadřazené složky:

```
ERR_SWC_NATIVE_CACHE: cache ancestor D:\Users has untrusted owner ...
set SWC_NATIVE_BINDING_CACHE to a safe absolute directory owned by your user
```

Zjistil jsem, komu složka patří:

```powershell
(Get-Acl D:\Users).Owner   # -> ORBIS-U121-PC20\admin
whoami                     # -> orbiszlin\jakub.horacek
```

Složka `D:\Users` patří lokálnímu adminovi, takže SWC nevěří ničemu v mém profilu.

**Řešení:** na disku C: jsem vytvořil vlastní složku a nechal k ní přístup jen sobě a systému:

```powershell
New-Item -ItemType Directory -Force C:\swc-cache-jakub
# vypnout dědění práv (jinak tam mohou zapisovat všichni přihlášení uživatelé)
icacls C:\swc-cache-jakub /inheritance:r /grant:r "ORBISZLIN\jakub.horacek:(OI)(CI)F" "*S-1-5-18:(OI)(CI)F"
```

Potom jsem na tuto složku nastavil proměnnou prostředí, natrvalo pro svůj účet
(admin práva nejsou potřeba):

```powershell
[Environment]::SetEnvironmentVariable('SWC_NATIVE_BINDING_CACHE','C:\swc-cache-jakub','User')
```

> Po nastavení je potřeba restartovat WebStorm nebo terminál, aby proměnnou načetl.

### Problém 3: stará verze Node.js

Nový AdonisJS (verze 7) vyžaduje **Node.js ≥ 24 a npm ≥ 11**. Na Node 22 to padalo:

- `Unknown file extension ".ts"`: Node 22 neumí sám spouštět TypeScript.
- S přepínačem `--experimental-strip-types` se to rozběhlo, ale migrace pak spadla
  na chybě `addQueryContext is not a function` v knihovně knex. Jde o chybu
  načítání modulů v Node 22.

**Řešení:** nainstaloval jsem Node **24.21.0**. Ověření:

```powershell
node -v   # v24.21.0
npm -v    # 11.19.0
```

Balíčky jsem pak přeinstaloval pod novou verzí, kvůli nativnímu modulu `better-sqlite3`:

```powershell
cd sprava-uzivatelu
npm install
```

---

## 4. Co obsahoval starter kit

Kit `hypermedia` už měl připravené:

- tabulku `users` (migrace v `database/migrations/`),
- model `User` (`app/models/user.ts`),
- registraci a přihlášení (`new_account_controller.ts`, `session_controller.ts`).

Chyběla samotná **správa** uživatelů, kterou jsem dopsal.

---

## 5. Co jsem dopsal

| Soubor | Co dělá |
|---|---|
| `app/validators/user.ts` | přidány `createUserValidator` a `updateUserValidator` (unikátní e-mail; při úpravě je heslo nepovinné) |
| `app/controllers/users_controller.ts` | metody `index`, `create`, `store`, `edit`, `update`, `destroy` |
| `start/routes.ts` | `router.resource('users', controllers.Users).except(['show'])` ve skupině s `middleware.auth()` |
| `resources/views/components/layouts/app.edge` | položka **Uživatelé** v horním menu |
| `resources/views/pages/users/index.edge` | tabulka uživatelů s tlačítky Upravit/Smazat |
| `resources/views/pages/users/create.edge` | formulář pro nového uživatele |
| `resources/views/pages/users/edit.edge` | formulář pro úpravu |
| `resources/views/pages/users/_fields.edge` | společná pole formuláře (jméno, e-mail, heslo) |
| `resources/css/app.css` | styly tabulky a formuláře |

Routy, které `router.resource` vytvoří:

| Metoda | URL | Akce |
|---|---|---|
| GET | `/users` | výpis |
| GET | `/users/create` | formulář pro přidání |
| POST | `/users` | uložení nového uživatele |
| GET | `/users/:id/edit` | formulář pro úpravu |
| PUT | `/users/:id` | uložení změn |
| DELETE | `/users/:id` | smazání |

HTML formuláře umí jen GET a POST. PUT a DELETE se proto posílají jako POST
s `?_method=PUT` nebo `?_method=DELETE` (v `config/app.ts` je zapnuté `allowMethodSpoofing`).

---

## 6. Databáze

Tabulku vytvoří migrace:

```powershell
node ace migration:run
```

Vymazání všech dat a nové vytvoření tabulek:

```powershell
node ace migration:fresh
```

---

## 7. Spuštění (podle návodu)

```powershell
cd sprava-uzivatelu
node ace serve --hmr
```

Pak otevřít **http://localhost:3333/signup**, zaregistrovat se a v menu kliknout na **Uživatelé**.

---

## 8. Testování

Celý postup jsem otestoval přes `curl` v Git Bashi. Každý formulář obsahuje
CSRF token (ochrana `shield`), takže ho test nejdřív vytáhl ze stránky
a cookies ukládal do souboru:

```bash
J=tmp/jar.txt; B=http://localhost:3333
tok() { curl -s -b "$J" -c "$J" "$B$1" | grep -o "name='_csrf' value='[^']*'" | sed "s/.*value='//;s/'//"; }

# registrace
curl -s -b $J -c $J --data-urlencode "_csrf=$(tok /signup)" \
  -d "fullName=Admin&email=admin@test.cz&password=heslo12345&passwordConfirmation=heslo12345" $B/signup
# přidání uživatele
curl -s -b $J -c $J --data-urlencode "_csrf=$(tok /users/create)" \
  -d "fullName=Jan Novak&email=jan@test.cz&password=heslo12345" $B/users
# úprava
curl -s -b $J -c $J --data-urlencode "_csrf=$(tok /users/2/edit)" \
  -d "fullName=Jan Upraveny&email=jan@test.cz&password=" "$B/users/2?_method=PUT"
# smazání
curl -s -b $J -c $J --data-urlencode "_csrf=$(tok /users)" "$B/users/2?_method=DELETE"
```

Výsledky:

| Test | Výsledek |
|---|---|
| registrace | přesměrování na `/dashboard` |
| přidání uživatele | „Uživatel jan@test.cz byl vytvořen“ |
| přidání se stejným e-mailem | chyba „The email has already been taken“ |
| úprava | „Uživatel jan@test.cz byl upraven“ |
| smazání sebe sama | „Nemůžeš smazat sám sebe“ |
| smazání jiného uživatele | „Uživatel jan@test.cz byl smazán“ |

Typová kontrola (`npx tsc --noEmit`) i lint (`npx eslint app start`) prošly bez chyb.

Drobné zádrhele při testování:

- CSRF token je v HTML v jednoduchých uvozovkách (`value='...'`), první verze testu hledala dvojité.
- Windows `curl` nerozumí cestám ve tvaru `/d/...` z Git Bashe, proto se soubor s cookies ukládal do `tmp/` v projektu.

---

## Shrnutí problémů a řešení

| Problém | Příčina | Řešení |
|---|---|---|
| `Non-interactive environment detected` | PowerShell 5.1 zahazuje `--` | spustit instalátor v Git Bashi |
| `ERR_SWC_NATIVE_CACHE` | `D:\Users` patří adminovi | složka `C:\swc-cache-jakub` s omezenými právy + proměnná `SWC_NATIVE_BINDING_CACHE` |
| `Unknown file extension ".ts"`, chyba v knex | Node 22 místo požadovaného 24 | nainstalovat Node 24.21.0, `npm install` |
| server na náhodném portu místo 3333 | port 3333 držel starý proces `node` | ukončit starý proces |
