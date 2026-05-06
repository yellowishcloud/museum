const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { DatabaseSync } = require("node:sqlite");

const PORT = Number(process.env.PORT || 4173);
const ROOT = __dirname;
const DEFAULT_DB_DIR = path.join(process.env.USERPROFILE || ROOT, "Documents", "fbis");
const DB_FILE = process.env.MUSEI_DB_FILE || path.join(DEFAULT_DB_DIR, "musei-kasteev.sqlite");
const LEGACY_DB_FILE = path.join(ROOT, "musei-kasteev.sqlite");

fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
if (!fs.existsSync(DB_FILE) && fs.existsSync(LEGACY_DB_FILE)) {
  fs.copyFileSync(LEGACY_DB_FILE, DB_FILE);
}
const db = new DatabaseSync(DB_FILE);

db.exec("PRAGMA foreign_keys = ON");
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_salt TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    interest TEXT,
    language TEXT DEFAULT 'en',
    role TEXT NOT NULL DEFAULT 'visitor',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    city TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    accessibility_mode TEXT DEFAULT 'standard',
    visit_goal TEXT DEFAULT '',
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS artifacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    artist TEXT,
    year TEXT,
    category TEXT NOT NULL,
    floor TEXT DEFAULT 'floor1',
    room TEXT DEFAULT '',
    description TEXT NOT NULL,
    image_url TEXT,
    source_url TEXT,
    model_type TEXT DEFAULT 'image-card',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    artifact_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, artifact_id),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(artifact_id) REFERENCES artifacts(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS survey_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    digital_use INTEGER NOT NULL,
    usefulness INTEGER NOT NULL,
    accessibility INTEGER NOT NULL,
    virtual_tours INTEGER NOT NULL,
    images_3d INTEGER NOT NULL,
    interactive_features INTEGER NOT NULL,
    future_intention INTEGER NOT NULL,
    readiness_score REAL NOT NULL,
    actual_class TEXT NOT NULL,
    predicted_class TEXT NOT NULL,
    result TEXT NOT NULL,
    notes TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS assistant_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS virtual_tours (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    provider TEXT NOT NULL,
    source_url TEXT NOT NULL,
    official_source_url TEXT DEFAULT '',
    coverage TEXT DEFAULT '',
    floor_scope TEXT DEFAULT '',
    integration_status TEXT NOT NULL DEFAULT 'external-link',
    rights_note TEXT NOT NULL,
    performance_note TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

function columnExists(table, column) {
  return db.prepare(`PRAGMA table_info(${table})`).all().some((item) => item.name === column);
}

if (!columnExists("users", "role")) {
  db.exec("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'visitor'");
}

const seeded = db.prepare("SELECT COUNT(*) AS count FROM artifacts").get().count;
if (!seeded) {
  const insert = db.prepare(`
    INSERT INTO artifacts (title, artist, year, category, floor, room, description, image_url, source_url, model_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  [
    [
      "Youth, Earth and Time",
      "K. Mullashev",
      "20th century",
      "Painting",
      "floor1",
      "Kazakh modern art",
      "A large expressive work from the A. Kasteev Museum category. It supports the pilot focus on Kazakh art, high-resolution viewing, and cultural storytelling.",
      "assets/museum/youth-earth-time.jpg",
      "https://commons.wikimedia.org/wiki/File:Youth_earth_and_time_by_K._Mullashev.jpg",
      "image-zoom",
    ],
    [
      "The Legend of the World",
      "Isaac Itkind",
      "1957",
      "Sculpture",
      "floor2",
      "Sculpture and 3D studio",
      "Sculpture by Isaac Itkind. This item is useful for explaining how a real museum sculpture can become a scanned 3D model in the final system.",
      "assets/museum/itkind-legend-world.jpg",
      "https://commons.wikimedia.org/wiki/File:Isaac_Itkind_%E2%80%94_The_Legend_of_the_World_(1957).jpg",
      "future-3d",
    ],
    [
      "Apples of Alma-Ata",
      "Evgeniy Sidorkin",
      "1980",
      "Graphics",
      "floor2",
      "Graphics and sketches",
      "Graphic work connected to Almaty identity. It fits the Lab 1 theme of cultural pride and digital access to heritage.",
      "assets/museum/apples-alma-ata.jpg",
      "https://commons.wikimedia.org/wiki/File:Evgeniy_Sidorkin_%E2%80%94_Apples_of_Alma-Ata_(1980).jpg",
      "image-zoom",
    ],
    [
      "Gallery Room View",
      "A. Kasteev Museum interior",
      "2019",
      "Applied art",
      "floor1",
      "Virtual tour",
      "Interior view used as the tour background. It demonstrates the virtual route requirement before official 360-degree footage is available.",
      "assets/museum/kasteev-gallery-03.jpg",
      "https://commons.wikimedia.org/wiki/File:Rooms_of_State_Museum_of_Arts,_Almaty_03.jpg",
      "tour-panorama",
    ],
  ].forEach((item) => insert.run(...item));
}

const tourSeeded = db.prepare("SELECT COUNT(*) AS count FROM virtual_tours").get().count;
if (!tourSeeded) {
  const insertTour = db.prepare(`
    INSERT INTO virtual_tours (
      title, provider, source_url, official_source_url, coverage, floor_scope,
      integration_status, rights_note, performance_note
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  [
    [
      "3D tour: From Durer to Eifert",
      "BKDR / GMIRK public virtual exhibition",
      "https://bkdr.de/VRundgang/AlmatyKunstmuseum/",
      "https://www.gmirk.kz/ru/media-links/virtualnye-vystavki/233-3d-tur-po-vystavke-ot-dyurera-do-ejferta",
      "High-quality 360-degree exhibition route with artwork labels and room navigation.",
      "External exhibition route; exact official floor plan is not supplied in the public page.",
      "external-link",
      "Linked as an official public source. Copying, mirroring, or embedding the 360 assets requires permission from the museum/provider.",
      "The original viewer can be slow; Musei adds fast local login, profile, favorites, CMS, database proof, and guide functions around the source.",
    ],
    [
      "Artsteps Kasteev-style virtual exhibition",
      "Artsteps public viewer",
      "https://www.artsteps.com/view/6357caff66dd51fc4b199ac6?currentUser",
      "https://www.artsteps.com/",
      "Public WebGL exhibition space useful for comparing VR-style navigation and object information.",
      "External virtual gallery; not an official architectural floor layer.",
      "external-link",
      "Linked as an external public viewer. Assets and descriptions should not be copied into Musei without author permission or a clear license.",
      "Useful as a competitor/reference for virtual navigation, but not used as a copied local asset package.",
    ],
  ].forEach((item) => insertTour.run(...item));
}

db.prepare(`
  UPDATE virtual_tours
  SET performance_note = ?
  WHERE source_url = ?
`).run(
  "The original viewer can be slow; Musei adds fast local login, profile, favorites, CMS, database proof, and guide functions around the source.",
  "https://bkdr.de/VRundgang/AlmatyKunstmuseum/"
);

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 32, "sha256").toString("hex");
  return { salt, hash };
}

function timingSafeEqualHex(left, right) {
  const a = Buffer.from(left, "hex");
  const b = Buffer.from(right, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function ensureSeedAccount(account) {
  const { salt, hash } = hashPassword(account.password);
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(account.email);
  if (existing) {
    db.prepare(`
      UPDATE users
      SET password_salt = ?, password_hash = ?, name = ?, interest = ?, language = ?, role = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(salt, hash, account.name, account.interest, account.language, account.role, existing.id);
    db.prepare(`
      INSERT INTO profiles (user_id, city, bio, visit_goal, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id) DO UPDATE SET visit_goal = excluded.visit_goal, updated_at = CURRENT_TIMESTAMP
    `).run(existing.id, account.city, account.bio, account.visitGoal);
    return;
  }

  const result = db.prepare(`
    INSERT INTO users (email, password_salt, password_hash, name, interest, language, role)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(account.email, salt, hash, account.name, account.interest, account.language, account.role);
  db.prepare("INSERT INTO profiles (user_id, city, bio, visit_goal) VALUES (?, ?, ?, ?)")
    .run(result.lastInsertRowid, account.city, account.bio, account.visitGoal);
}

const seedAccounts = [];

if (process.env.MUSEI_DEMO_VISITOR_PASSWORD) {
  seedAccounts.push({
    email: "demo@musei.local",
    password: process.env.MUSEI_DEMO_VISITOR_PASSWORD,
    name: "Demo Visitor",
    interest: "Modern Kazakh art",
    language: "en",
    role: "visitor",
    city: "Almaty",
    bio: "Student demo visitor account.",
    visitGoal: "Explore VR sources, collection, 3D demo, and survey classifier",
  });
}

if (process.env.MUSEI_DEMO_ADMIN_PASSWORD) {
  seedAccounts.push({
    email: process.env.MUSEI_DEMO_ADMIN_EMAIL || "admin@musei.local",
    password: process.env.MUSEI_DEMO_ADMIN_PASSWORD,
    name: "Musei Admin",
    interest: "Database and project review",
    language: "en",
    role: "admin",
    city: "Almaty",
    bio: "Admin account for showing SQLite tables and implemented functions.",
    visitGoal: "Review database tables and SIS requirement coverage",
  });
}

seedAccounts.forEach(ensureSeedAccount);

function json(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function notFound(res) {
  json(res, 404, { error: "Not found" });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) req.destroy();
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

function tokenFrom(req) {
  const value = req.headers.authorization || "";
  return value.startsWith("Bearer ") ? value.slice(7) : "";
}

function currentUser(req) {
  const token = tokenFrom(req);
  if (!token) return null;
  return db
    .prepare(`
      SELECT users.*, profiles.city, profiles.bio, profiles.accessibility_mode, profiles.visit_goal
      FROM sessions
      JOIN users ON users.id = sessions.user_id
      LEFT JOIN profiles ON profiles.user_id = users.id
      WHERE sessions.token = ?
    `)
    .get(token);
}

function requireUser(req, res) {
  const user = currentUser(req);
  if (!user) {
    json(res, 401, { error: "Please sign in first" });
    return null;
  }
  return user;
}

function requireAdmin(req, res) {
  const user = requireUser(req, res);
  if (!user) return null;
  if (user.role !== "admin") {
    json(res, 403, { error: "Admin account is required to view raw database tables" });
    return null;
  }
  return user;
}

function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    interest: user.interest,
    language: user.language,
    role: user.role || "visitor",
    city: user.city || "",
    bio: user.bio || "",
    accessibilityMode: user.accessibility_mode || "standard",
    visitGoal: user.visit_goal || "",
  };
}

function createSession(userId) {
  const token = crypto.randomBytes(32).toString("hex");
  db.prepare("INSERT INTO sessions (user_id, token) VALUES (?, ?)").run(userId, token);
  return token;
}

function numberInRange(value, fallback = 3) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(5, Math.max(1, Math.round(number)));
}

function classifySurvey(input) {
  const digitalUse = numberInRange(input.digitalUse);
  const usefulness = numberInRange(input.usefulness);
  const accessibility = numberInRange(input.accessibility);
  const virtualTours = numberInRange(input.virtualTours);
  const images3d = numberInRange(input.images3d);
  const interactive = numberInRange(input.interactive);
  const futureIntention = numberInRange(input.futureIntention);
  const readiness = (digitalUse + usefulness + accessibility + virtualTours + images3d + interactive) / 6;
  const predicted = readiness >= 3.7 ? "Positive" : "Negative";
  const actual = futureIntention >= 4 ? "Positive" : "Negative";
  const result = predicted === "Positive" && actual === "Positive"
    ? "TP"
    : predicted === "Positive" && actual === "Negative"
      ? "FP"
      : predicted === "Negative" && actual === "Positive"
        ? "FN"
        : "TN";
  return {
    digitalUse,
    usefulness,
    accessibility,
    virtualTours,
    images3d,
    interactive,
    futureIntention,
    readiness,
    predicted,
    actual,
    result,
  };
}

function assistantAnswer(question, language = "en") {
  const lang = ["en", "ru", "kk"].includes(language) ? language : "en";
  const q = question.toLowerCase();
  const has = (...words) => words.some((word) => q.includes(word));
  const answer = {
    overview: {
      en: "Musei Kasteev is a working digital museum information system prototype. It combines public VR tour links, a searchable collection, favorites, profile CRUD, admin-only artifact CMS CRUD, survey classification, an embedded 3D monument model, and an admin-only SQLite database viewer.",
      ru: "Musei Kasteev — рабочий прототип цифровой музейной информационной системы. Он объединяет публичные VR-туры, поиск по коллекции, избранное, CRUD профиля, админский CRUD CMS экспонатов, классификацию опроса, встроенную 3D-модель памятника и админский просмотр SQLite.",
      kk: "Musei Kasteev — цифрлық музей ақпараттық жүйесінің жұмыс прототипі. Онда ашық VR турлар, коллекция іздеу, таңдаулылар, профиль CRUD, админге арналған экспонат CMS CRUD, сауалнама классификациясы, 3D ескерткіш моделі және админге арналған SQLite көрінісі бар.",
    },
    tour: {
      en: "The tour function opens official/public external sources instead of copying 360 files. The main source is the GMIRK page that links to the BKDR 360 exhibition. Musei stores those links in SQLite and adds login, profile, favorites, CMS, guide, and database proof around them.",
      ru: "Функция тура открывает официальные/публичные внешние источники и не копирует 360-файлы. Главный источник — страница GMIRK со ссылкой на BKDR 360. Musei хранит эти ссылки в SQLite и добавляет авторизацию, профиль, избранное, CMS, гид и доказательство БД.",
      kk: "Тур функциясы 360 файлдарды көшірмейді, ресми/ашық сыртқы көздерді ашады. Негізгі дереккөз — BKDR 360-қа сілтеме беретін GMIRK беті. Musei бұл сілтемелерді SQLite ішінде сақтап, авторизация, профиль, таңдаулылар, CMS, гид және ДҚ дәлелін қосады.",
    },
    database: {
      en: "The database is a local SQLite file selected by MUSEI_DB_FILE, or musei-kasteev.sqlite during local development. The users table stores email, role, password_salt, and password_hash; plain passwords are not stored. Visitors can use profile settings and collection features, while only the admin account can view raw database tables and manage artifact CMS records.",
      ru: "База данных — локальный SQLite-файл, выбранный через MUSEI_DB_FILE, или musei-kasteev.sqlite при локальной разработке. Таблица users хранит email, role, password_salt и password_hash; обычный пароль не сохраняется. Посетитель использует профиль и коллекцию, а сырые таблицы и CMS экспонатов доступны только админу.",
      kk: "Дерекқор MUSEI_DB_FILE арқылы таңдалатын жергілікті SQLite файлы, ал локалды әзірлеуде musei-kasteev.sqlite қолданылады. users кестесінде email, role, password_salt және password_hash сақталады; қарапайым пароль сақталмайды. Келуші профиль мен коллекция функцияларын қолданады, ал raw кестелер мен экспонат CMS тек админге қолжетімді.",
    },
    roles: {
      en: "There are two demo roles: visitor and admin. The visitor sees VR sources, collection, 3D model, survey classifier, guide, profile settings, and favorites. The admin sees all of that plus artifact CMS CRUD, raw SQLite tables, hypotheses, and implemented-functions proof.",
      ru: "Есть две демо-роли: посетитель и админ. Посетитель видит VR-источники, коллекцию, 3D-модель, классификатор, гид, настройки профиля и избранное. Админ видит все это плюс CRUD CMS экспонатов, сырые таблицы SQLite, гипотезы и блок реализованных функций.",
      kk: "Екі демо-рөл бар: келуші және админ. Келуші VR көздерін, коллекцияны, 3D модельді, классификаторды, гидті, профиль баптауларын және таңдаулыларды көреді. Админ бұған қоса экспонат CMS CRUD, SQLite кестелерін, гипотезаларды және іске асқан функциялар блогын көреді.",
    },
    survey: {
      en: "The survey implements Lab 3 and Lab 4. Six predictor sliders create a readiness score. If the score is at least 3.7, the predicted class is Positive. Future intention rating 4 or 5 is the actual Positive class. Hypotheses H1-H4 are kept in the admin section as method proof.",
      ru: "Опрос реализует Lab 3 и Lab 4. Шесть слайдеров формируют readiness score. Если score не ниже 3.7, прогнозируемый класс Positive. Оценка future intention 4 или 5 — фактический Positive. Гипотезы H1-H4 оставлены в админ-разделе как доказательство методологии.",
      kk: "Сауалнама Lab 3 және Lab 4 логикасын іске асырады. Алты слайдер readiness score есептейді. Score кемінде 3.7 болса, болжанған класс Positive. Future intention 4 немесе 5 болса, нақты класс Positive. H1-H4 гипотезалары әдістемелік дәлел ретінде админ бөлімінде.",
    },
    model: {
      en: "The 3D demo embeds the public Sketchfab model of the Abilkhan Kasteev monument in Almaty by Yerbol Kopeyev. It is embedded with attribution instead of being downloaded or rehosted, which is safer for a prototype.",
      ru: "3D-демо встраивает публичную Sketchfab-модель памятника Абильхану Кастееву в Алматы, автор Yerbol Kopeyev. Модель встроена с атрибуцией, а не скачана и не перезалита, что безопаснее для прототипа.",
      kk: "3D демо Алматыдағы Әбілхан Қастеев ескерткішінің Yerbol Kopeyev жасаған ашық Sketchfab моделін енгізеді. Модель жүктелмей, атрибуциямен embed жасалған, бұл прототип үшін қауіпсізірек.",
    },
    artifacts: {
      en: "Artifacts are read from the SQLite artifacts table. The CMS form can create and update records, collection cards can delete records, and favorites connect a user ID with an artifact ID.",
      ru: "Экспонаты читаются из таблицы artifacts в SQLite. CMS-форма создает и обновляет записи, карточки коллекции удаляют записи, а избранное связывает user ID и artifact ID.",
      kk: "Экспонаттар SQLite ішіндегі artifacts кестесінен оқылады. CMS формасы жазбаларды құрып/жаңартады, коллекция карточкалары жояды, ал таңдаулылар user ID мен artifact ID байланыстырады.",
    },
    map: {
      en: "The fake route map was removed. A real museum map should use Kasteev-approved floor plans and gallery labels. Until then, the prototype shows public VR sources and database-backed system functions.",
      ru: "Фейковая карта маршрута удалена. Настоящая карта музея должна использовать утвержденные Кастеевым планы этажей и названия залов. Пока прототип показывает публичные VR-источники и функции системы с базой данных.",
      kk: "Жалған маршрут картасы алынды. Нақты музей картасы Қастеев музейі бекіткен қабат жоспарлары мен зал атауларын қолдануы керек. Әзірге прототип ашық VR көздерін және дерекқорға қосылған функцияларды көрсетеді.",
    },
    review: {
      en: "For project review, show visitor features first: VR sources, collection, favorites, 3D model, survey classifier, guide, and profile settings. Then sign in as admin and show role-based database tables, artifact CMS CRUD, survey responses, guide messages, and implemented functions.",
      ru: "Для проверки проекта сначала покажите функции посетителя: VR-источники, коллекцию, избранное, 3D-модель, классификатор, гид и настройки профиля. Затем войдите как админ и покажите таблицы с ролями, CRUD CMS экспонатов, ответы опроса, сообщения гида и реализованные функции.",
      kk: "Жобаны тексеру үшін алдымен келуші функцияларын көрсетіңіз: VR көздері, коллекция, таңдаулылар, 3D модель, классификатор, гид және профиль баптаулары. Кейін админ болып кіріп, рөлдерге негізделген кестелерді, экспонат CMS CRUD, сауалнама жауаптарын, гид хабарламаларын және іске асқан функцияларды көрсетіңіз.",
    },
  };

  if (has("tour", "vr", "360", "bkdr", "artsteps", "virtual", "тур")) return answer.tour[lang];
  if (has("database", "sqlite", "hash", "password", "bd", "db", "база", "данн", "парол", "хэш", "дерек")) return answer.database[lang];
  if (has("role", "admin", "visitor", "user", "админ", "роль", "келуші")) return answer.roles[lang];
  if (has("hypothesis", "survey", "classification", "readiness", "method", "опрос", "сауалнама", "гипот")) return answer.survey[lang];
  if (has("3d", "model", "sketchfab", "monument", "kasteev", "модель", "памятник", "ескерткіш")) return answer.model[lang];
  if (has("artifact", "collection", "cms", "favorite", "экспон", "коллек", "таңда")) return answer.artifacts[lang];
  if (has("map", "floor", "route", "карта", "этаж", "қабат")) return answer.map[lang];
  if (has("review", "teacher", "show", "защит", "қорға")) return answer.review[lang];
  if (q.length < 8 || has("this", "project", "system", "what is", "что это", "бұл")) return answer.overview[lang];
  return answer.overview[lang];
}

function snapshot() {
  const safeSessions = db
    .prepare("SELECT id, user_id, substr(token, 1, 12) || '...' AS token_preview, created_at FROM sessions ORDER BY id DESC")
    .all();
  return {
    users: db.prepare("SELECT id, email, role, password_salt, password_hash, name, interest, language, created_at, updated_at FROM users ORDER BY id DESC").all(),
    profiles: db.prepare("SELECT * FROM profiles ORDER BY id DESC").all(),
    artifacts: db.prepare("SELECT * FROM artifacts ORDER BY id DESC").all(),
    virtual_tours: db.prepare("SELECT * FROM virtual_tours ORDER BY id DESC").all(),
    favorites: db.prepare("SELECT * FROM favorites ORDER BY id DESC").all(),
    survey_responses: db.prepare("SELECT * FROM survey_responses ORDER BY id DESC").all(),
    assistant_messages: db.prepare("SELECT * FROM assistant_messages ORDER BY id DESC").all(),
    sessions: safeSessions,
  };
}

async function handleApi(req, res, pathname) {
  try {
    if (req.method === "GET" && pathname === "/api/healthz") {
      return json(res, 200, {
        status: "ok",
        app: "musei-kasteev",
        database: path.basename(DB_FILE),
      });
    }

    if (req.method === "POST" && pathname === "/api/auth/register") {
      const body = await readBody(req);
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      const name = String(body.name || "").trim();
      if (!email || !password || !name) return json(res, 400, { error: "Name, email, and password are required" });
      if (password.length < 6) return json(res, 400, { error: "Use at least 6 password characters for the demo" });
      const { salt, hash } = hashPassword(password);
      const result = db
        .prepare("INSERT INTO users (email, password_salt, password_hash, name, interest) VALUES (?, ?, ?, ?, ?)")
        .run(email, salt, hash, name, body.interest || "Modern Kazakh art");
      db.prepare("INSERT INTO profiles (user_id, visit_goal) VALUES (?, ?)").run(result.lastInsertRowid, "Explore Kasteev digital route");
      const token = createSession(Number(result.lastInsertRowid));
      return json(res, 201, { token });
    }

    if (req.method === "POST" && pathname === "/api/auth/login") {
      const body = await readBody(req);
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
      if (!user) return json(res, 401, { error: "Invalid email or password" });
      const { hash } = hashPassword(password, user.password_salt);
      if (!timingSafeEqualHex(hash, user.password_hash)) return json(res, 401, { error: "Invalid email or password" });
      return json(res, 200, { token: createSession(user.id) });
    }

    if (req.method === "GET" && pathname === "/api/me") {
      const user = requireUser(req, res);
      if (!user) return;
      const favorites = db.prepare("SELECT artifact_id FROM favorites WHERE user_id = ?").all(user.id).map((row) => row.artifact_id);
      return json(res, 200, { user: publicUser(user), favorites });
    }

    if (req.method === "PUT" && pathname === "/api/profile") {
      const user = requireUser(req, res);
      if (!user) return;
      const body = await readBody(req);
      db.prepare("UPDATE users SET name = ?, interest = ?, language = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
        .run(body.name || user.name, body.interest || user.interest, body.language || user.language, user.id);
      db.prepare(`
        INSERT INTO profiles (user_id, city, bio, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id) DO UPDATE SET city = excluded.city, bio = excluded.bio, updated_at = CURRENT_TIMESTAMP
      `).run(user.id, body.city || "", body.bio || "");
      return json(res, 200, { ok: true });
    }

    if (req.method === "DELETE" && pathname === "/api/account") {
      const user = requireUser(req, res);
      if (!user) return;
      db.prepare("DELETE FROM users WHERE id = ?").run(user.id);
      return json(res, 200, { ok: true });
    }

    if (req.method === "GET" && pathname === "/api/artifacts") {
      const artifacts = db.prepare("SELECT * FROM artifacts ORDER BY id DESC").all();
      return json(res, 200, { artifacts });
    }

    if (req.method === "GET" && pathname === "/api/virtual-tours") {
      const tours = db.prepare("SELECT * FROM virtual_tours ORDER BY id").all();
      return json(res, 200, { tours });
    }

    if (req.method === "POST" && pathname === "/api/artifacts") {
      if (!requireAdmin(req, res)) return;
      const body = await readBody(req);
      if (!body.title || !body.description) return json(res, 400, { error: "Title and description are required" });
      db.prepare(`
        INSERT INTO artifacts (title, artist, year, category, room, description, image_url, source_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(body.title, body.artist || "", body.year || "", body.category || "Painting", body.room || "", body.description, body.imageUrl || "assets/museum/kasteev-gallery-03.jpg", body.sourceUrl || "local demo entry");
      return json(res, 201, { ok: true });
    }

    const artifactMatch = pathname.match(/^\/api\/artifacts\/(\d+)$/);
    if (artifactMatch && req.method === "PUT") {
      if (!requireAdmin(req, res)) return;
      const body = await readBody(req);
      db.prepare(`
        UPDATE artifacts
        SET title = ?, artist = ?, year = ?, category = ?, room = ?, description = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(body.title, body.artist || "", body.year || "", body.category || "Painting", body.room || "", body.description, body.imageUrl || "assets/museum/kasteev-gallery-03.jpg", Number(artifactMatch[1]));
      return json(res, 200, { ok: true });
    }

    if (artifactMatch && req.method === "DELETE") {
      if (!requireAdmin(req, res)) return;
      db.prepare("DELETE FROM artifacts WHERE id = ?").run(Number(artifactMatch[1]));
      return json(res, 200, { ok: true });
    }

    if (req.method === "POST" && pathname === "/api/favorites") {
      const user = requireUser(req, res);
      if (!user) return;
      const body = await readBody(req);
      db.prepare("INSERT OR IGNORE INTO favorites (user_id, artifact_id) VALUES (?, ?)").run(user.id, Number(body.artifactId));
      return json(res, 201, { ok: true });
    }

    const favoriteMatch = pathname.match(/^\/api\/favorites\/(\d+)$/);
    if (favoriteMatch && req.method === "DELETE") {
      const user = requireUser(req, res);
      if (!user) return;
      db.prepare("DELETE FROM favorites WHERE user_id = ? AND artifact_id = ?").run(user.id, Number(favoriteMatch[1]));
      return json(res, 200, { ok: true });
    }

    if (req.method === "POST" && pathname === "/api/survey") {
      const user = currentUser(req);
      const body = await readBody(req);
      const c = classifySurvey(body);
      const result = db.prepare(`
        INSERT INTO survey_responses (
          user_id, digital_use, usefulness, accessibility, virtual_tours, images_3d,
          interactive_features, future_intention, readiness_score, actual_class,
          predicted_class, result, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        user?.id || null,
        c.digitalUse,
        c.usefulness,
        c.accessibility,
        c.virtualTours,
        c.images3d,
        c.interactive,
        c.futureIntention,
        c.readiness,
        c.actual,
        c.predicted,
        c.result,
        body.notes || ""
      );
      return json(res, 201, {
        result: {
          id: result.lastInsertRowid,
          readiness_score: c.readiness,
          actual_class: c.actual,
          predicted_class: c.predicted,
          result: c.result,
        },
      });
    }

    if (req.method === "POST" && pathname === "/api/assistant") {
      const user = currentUser(req);
      const body = await readBody(req);
      const question = String(body.question || "").trim();
      if (!question) return json(res, 400, { error: "Question is required" });
      const answer = assistantAnswer(question, body.language || user?.language || "en");
      db.prepare("INSERT INTO assistant_messages (user_id, question, answer) VALUES (?, ?, ?)").run(user?.id || null, question, answer);
      return json(res, 201, { answer });
    }

    if (req.method === "GET" && pathname === "/api/db/snapshot") {
      if (!requireAdmin(req, res)) return;
      return json(res, 200, { database: DB_FILE, tables: snapshot() });
    }

    notFound(res);
  } catch (error) {
    if (String(error.message).includes("UNIQUE constraint failed: users.email")) {
      return json(res, 409, { error: "This email is already registered" });
    }
    json(res, 500, { error: error.message || "Server error" });
  }
}

function serveStatic(req, res, pathname) {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.normalize(path.join(ROOT, safePath));
  if (!filePath.startsWith(ROOT)) return notFound(res);
  fs.readFile(filePath, (error, data) => {
    if (error) return notFound(res);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "text/javascript; charset=utf-8",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".svg": "image/svg+xml",
    }[ext] || "application/octet-stream";
    const headers = { "Content-Type": contentType };
    if ([".html", ".css", ".js"].includes(ext)) {
      headers["Cache-Control"] = "no-store";
    }
    res.writeHead(200, headers);
    res.end(data);
  });
}

http
  .createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname.startsWith("/api/")) {
      handleApi(req, res, url.pathname);
      return;
    }
    serveStatic(req, res, decodeURIComponent(url.pathname));
  })
  .listen(PORT, "0.0.0.0", () => {
    console.log(`Musei Kasteev server running at http://0.0.0.0:${PORT}`);
    console.log(`SQLite database: ${DB_FILE}`);
  });
