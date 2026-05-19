const state = {
  token: localStorage.getItem("museiToken"),
  lang: localStorage.getItem("museiLang") || "en",
  user: null,
  artifacts: [],
  virtualTours: [],
  favorites: new Set(),
  activeFilter: "all",
  query: "",
  dbSnapshot: {},
  activeTable: "users",
  lastClassification: null,
};

const categories = ["all", "Painting", "Sculpture", "Graphics", "Applied art"];

const translations = {
  en: {
    brandSubtitle: "PostgreSQL digital museum IS",
    navTour: "Tour",
    navVr: "VR sources",
    navCollection: "Collection",
    navMethodology: "Methodology",
    navAssistant: "Guide",
    navManagement: "Profile/CMS",
    navDatabase: "Database",
    signIn: "Sign in",
    signOut: "Sign out",
    register: "Register",
    profile: "Profile",
    admin: "Admin",
    welcomeTitle: "Enter the digital museum",
    welcomeBody: "Sign in first, then the system will open the tour, collection, project guide, survey classifier, CRUD forms, and PostgreSQL database viewer.",
    backendNote: "Database features require the Node server. Use <strong>node server.js</strong>, not <strong>python -m http.server</strong>.",
    heroEyebrow: "A. Kasteev Museum pilot",
    heroTitle: "Digital museum system with real database flow",
    heroBody: "A working project prototype with authentication, profile CRUD, artifact CMS, survey classification, project guide, favorites, and an admin PostgreSQL database.",
    startTour: "Start tour",
    vrSources: "VR sources",
    vrEyebrow: "Official and public VR sources",
    vrTitle: "360 tours connected to the information system",
    reloadTours: "Reload tours",
    vrNote: "These viewers stay on their own websites. Musei stores their source records in PostgreSQL and connects them to the local system features.",
    searchCollection: "Search collection",
    searchPlaceholder: "Try Itkind, painting, sculpture...",
    profileStatsGuest: "Sign in to save favorites and survey results.",
    collectionEyebrow: "Collection and CMS",
    collectionTitle: "Real artifacts prepared for a pilot exhibition",
    refreshDb: "Refresh DB",
    modelEyebrow: "3D model demo",
    modelTitle: "Abilkhan Kasteev Monument in Almaty",
    modelDescription: 'Public Sketchfab viewer for the Abilkhan Kasteev monument in Almaty. Model by Yerbol Kopeyev; embedded as an external source for the prototype. <a href="https://sketchfab.com/3d-models/40e6e181ac1c41c980512a3c9610cf97" target="_blank" rel="noreferrer">Open source page</a>.',
    methodEyebrow: "Lab 3 and Lab 4 implementation",
    methodTitle: "Survey and readiness classification",
    surveyTitle: "Submit survey response to database",
    surveyDigitalUse: "Digital platform use",
    surveyUsefulness: "Perceived usefulness",
    surveyAccessibility: "Accessibility benefits",
    surveyTours: "Interest in virtual tours",
    surveyImages: "High-quality images and 3D models",
    surveyInteractive: "Interactive features",
    surveyFuture: "Future intention to use",
    surveyNotes: "Optional open-ended feedback, like Lab 3",
    saveClassify: "Save and classify",
    classificationTitle: "Latest classification result",
    noClassification: "No survey response saved yet.",
    predictedClass: "Predicted class",
    actualClass: "Actual class",
    confusionResult: "Confusion result",
    ruleText: "Rule: readiness score >= 3.7 means likely to use the platform.",
    assistantEyebrow: "Project guide",
    assistantTitle: "Ask about the museum system",
    assistantBody: "The guide answers common questions about VR sources, database, roles, artifacts, the 3D model, survey classification, and project methodology.",
    chatPlaceholder: "Ask about tours, database, artifacts, or methodology",
    askButton: "Ask",
    managementEyebrow: "Profile and content management",
    profileCrud: "User profile CRUD",
    artifactCrud: "Artifact CMS CRUD",
    databaseEyebrow: "Admin database proof",
    databaseTitle: "PostgreSQL tables visible in the GUI",
    reloadDatabase: "Reload database",
    coverageEyebrow: "Project requirement coverage",
    coverageTitle: "Implemented functions",
    adminHypothesesTitle: "Lab hypotheses and method proof",
    h1Text: "Usefulness contributes to readiness score.",
    h2Text: "Virtual tour, 3D, and interactivity sliders raise predicted adoption.",
    h3Text: "Digital platform use is included in the predictor set.",
    h4Text: "Complement-to-physical-museum result is tracked in interpretation.",
    openVrTour: "Open VR tour",
    sourcePage: "Source page",
    rights: "Rights",
    noVirtualTours: "No virtual tour records loaded yet.",
    all: "All",
    threeDContext: "3D context",
    save: "Save",
    saved: "Saved",
    loadToCms: "Load to CMS",
    delete: "Delete",
    unknown: "Unknown",
    modelContext: "The embedded monument model demonstrates the 3D-viewer function for Musei. The selected collection item is <strong>{title}</strong>; in production, Kasteev-approved scans could be connected to each artifact record. <a href=\"https://sketchfab.com/3d-models/40e6e181ac1c41c980512a3c9610cf97\" target=\"_blank\" rel=\"noreferrer\">Open source page</a>.",
    welcomeMessage: "Welcome. Visitor accounts can use the museum features and CRUD forms. Admin can open Database to show roles, password storage status, virtual tour records, favorites, survey responses, and guide messages.",
  },
  ru: {
    brandSubtitle: "Цифровая музейная ИС на PostgreSQL",
    navTour: "Тур",
    navVr: "VR-источники",
    navCollection: "Коллекция",
    navMethodology: "Методология",
    navAssistant: "Гид",
    navManagement: "Профиль/CMS",
    navDatabase: "База данных",
    signIn: "Войти",
    signOut: "Выйти",
    register: "Регистрация",
    profile: "Профиль",
    admin: "Админ",
    welcomeTitle: "Войти в цифровой музей",
    welcomeBody: "Сначала войдите в систему, затем откроются тур, коллекция, проектный гид, классификатор опроса, CRUD-формы и просмотр PostgreSQL.",
    backendNote: "Для базы данных нужен Node-сервер. Используйте <strong>node server.js</strong>, а не <strong>python -m http.server</strong>.",
    heroEyebrow: "Пилот музея им. А. Кастеева",
    heroTitle: "Цифровой музей с настоящей базой данных",
    heroBody: "Рабочий прототип с авторизацией, CRUD профиля, CMS экспонатов, классификацией опроса, проектным гидом, избранным и админской PostgreSQL-базой.",
    startTour: "Открыть тур",
    vrSources: "VR-источники",
    vrEyebrow: "Официальные и публичные VR-источники",
    vrTitle: "360-туры, подключенные к информационной системе",
    reloadTours: "Обновить туры",
    vrNote: "Эти просмотровщики остаются на своих сайтах. Musei хранит ссылки в PostgreSQL и связывает их с локальными функциями системы.",
    searchCollection: "Поиск по коллекции",
    searchPlaceholder: "Например: Itkind, живопись, скульптура...",
    profileStatsGuest: "Войдите, чтобы сохранять избранное и результаты опроса.",
    collectionEyebrow: "Коллекция и CMS",
    collectionTitle: "Реальные экспонаты для пилотной выставки",
    refreshDb: "Обновить БД",
    modelEyebrow: "Демо 3D-модели",
    modelTitle: "Памятник Абильхану Кастееву в Алматы",
    modelDescription: 'Публичный Sketchfab-просмотрщик памятника Абильхану Кастееву в Алматы. Модель: Yerbol Kopeyev; встроена как внешний источник для прототипа. <a href="https://sketchfab.com/3d-models/40e6e181ac1c41c980512a3c9610cf97" target="_blank" rel="noreferrer">Открыть источник</a>.',
    methodEyebrow: "Реализация Lab 3 и Lab 4",
    methodTitle: "Опрос и классификация готовности",
    surveyTitle: "Сохранить ответ опроса в базу данных",
    surveyDigitalUse: "Использование цифровых платформ",
    surveyUsefulness: "Воспринимаемая полезность",
    surveyAccessibility: "Польза для доступности",
    surveyTours: "Интерес к виртуальным турам",
    surveyImages: "Качественные изображения и 3D",
    surveyInteractive: "Интерактивные функции",
    surveyFuture: "Намерение использовать в будущем",
    surveyNotes: "Дополнительный комментарий, как в Lab 3",
    saveClassify: "Сохранить и классифицировать",
    classificationTitle: "Последний результат классификации",
    noClassification: "Ответ опроса еще не сохранен.",
    predictedClass: "Предсказанный класс",
    actualClass: "Фактический класс",
    confusionResult: "Результат матрицы",
    ruleText: "Правило: readiness score >= 3.7 означает вероятное использование платформы.",
    assistantEyebrow: "Проектный гид",
    assistantTitle: "Спросите о музейной системе",
    assistantBody: "Гид отвечает на частые вопросы о VR-источниках, базе данных, ролях, экспонатах, 3D-модели, классификации и методологии проекта.",
    chatPlaceholder: "Спросите о турах, базе данных, экспонатах или методологии",
    askButton: "Спросить",
    managementEyebrow: "Профиль и управление контентом",
    profileCrud: "CRUD профиля пользователя",
    artifactCrud: "CRUD CMS экспонатов",
    databaseEyebrow: "Доказательство БД для админа",
    databaseTitle: "Таблицы PostgreSQL видны в интерфейсе",
    reloadDatabase: "Обновить базу",
    coverageEyebrow: "Покрытие требований проекта",
    coverageTitle: "Реализованные функции",
    adminHypothesesTitle: "Гипотезы Lab и методология",
    h1Text: "Полезность влияет на readiness score.",
    h2Text: "Виртуальный тур, 3D и интерактивность повышают прогноз принятия.",
    h3Text: "Использование цифровых платформ включено в набор предикторов.",
    h4Text: "Идея дополнения физического музея учитывается в интерпретации.",
    openVrTour: "Открыть VR-тур",
    sourcePage: "Источник",
    rights: "Права",
    noVirtualTours: "VR-записи еще не загружены.",
    all: "Все",
    threeDContext: "3D-контекст",
    save: "Сохранить",
    saved: "Сохранено",
    loadToCms: "В CMS",
    delete: "Удалить",
    unknown: "Неизвестно",
    modelContext: "Встроенная модель памятника показывает функцию 3D-просмотра в Musei. Выбранный экспонат: <strong>{title}</strong>; в продакшене к каждой записи можно подключать одобренные музеем сканы. <a href=\"https://sketchfab.com/3d-models/40e6e181ac1c41c980512a3c9610cf97\" target=\"_blank\" rel=\"noreferrer\">Открыть источник</a>.",
    welcomeMessage: "Добро пожаловать. Посетитель использует функции музея и CRUD-формы. Админ открывает базу данных, чтобы показать роли, хэши паролей, VR-записи, избранное, опросы и сообщения гида.",
  },
  kk: {
    brandSubtitle: "PostgreSQL негізіндегі цифрлық музей АЖ",
    navTour: "Тур",
    navVr: "VR көздері",
    navCollection: "Коллекция",
    navMethodology: "Әдістеме",
    navAssistant: "Гид",
    navManagement: "Профиль/CMS",
    navDatabase: "Дерекқор",
    signIn: "Кіру",
    signOut: "Шығу",
    register: "Тіркелу",
    profile: "Профиль",
    admin: "Админ",
    welcomeTitle: "Цифрлық музейге кіріңіз",
    welcomeBody: "Алдымен жүйеге кіріңіз, содан кейін тур, коллекция, жоба гиді, сауалнама классификаторы, CRUD формалары және PostgreSQL көрінісі ашылады.",
    backendNote: "Дерекқор функциялары үшін Node сервері керек. <strong>node server.js</strong> қолданыңыз, <strong>python -m http.server</strong> емес.",
    heroEyebrow: "А. Қастеев музейінің пилоты",
    heroTitle: "Нақты дерекқоры бар цифрлық музей",
    heroBody: "Авторизация, профиль CRUD, экспонат CMS, сауалнама классификациясы, жоба гиді, таңдаулылар және админге арналған PostgreSQL дерекқоры бар жұмыс прототипі.",
    startTour: "Турды ашу",
    vrSources: "VR көздері",
    vrEyebrow: "Ресми және ашық VR көздері",
    vrTitle: "Ақпараттық жүйеге қосылған 360 турлар",
    reloadTours: "Турларды жаңарту",
    vrNote: "Бұл қарау жүйелері өз сайттарында қалады. Musei олардың сілтемелерін PostgreSQL ішінде сақтап, жергілікті жүйе функцияларымен байланыстырады.",
    searchCollection: "Коллекциядан іздеу",
    searchPlaceholder: "Мысалы: Itkind, кескіндеме, мүсін...",
    profileStatsGuest: "Таңдаулылар мен сауалнама нәтижелерін сақтау үшін кіріңіз.",
    collectionEyebrow: "Коллекция және CMS",
    collectionTitle: "Пилоттық көрмеге дайындалған нақты экспонаттар",
    refreshDb: "ДҚ жаңарту",
    modelEyebrow: "3D модель демосы",
    modelTitle: "Алматыдағы Әбілхан Қастеев ескерткіші",
    modelDescription: 'Алматыдағы Әбілхан Қастеев ескерткішінің ашық Sketchfab қарау құралы. Модель авторы: Yerbol Kopeyev; прототипте сыртқы дереккөз ретінде енгізілді. <a href="https://sketchfab.com/3d-models/40e6e181ac1c41c980512a3c9610cf97" target="_blank" rel="noreferrer">Дереккөзді ашу</a>.',
    methodEyebrow: "Lab 3 және Lab 4 іске асырылуы",
    methodTitle: "Сауалнама және дайындық классификациясы",
    surveyTitle: "Сауалнама жауабын дерекқорға сақтау",
    surveyDigitalUse: "Цифрлық платформаны қолдану",
    surveyUsefulness: "Пайдалы деп қабылдау",
    surveyAccessibility: "Қолжетімділік пайдасы",
    surveyTours: "Виртуалды турларға қызығушылық",
    surveyImages: "Сапалы суреттер және 3D модельдер",
    surveyInteractive: "Интерактивті мүмкіндіктер",
    surveyFuture: "Болашақта қолдану ниеті",
    surveyNotes: "Lab 3 сияқты қосымша пікір",
    saveClassify: "Сақтау және жіктеу",
    classificationTitle: "Соңғы классификация нәтижесі",
    noClassification: "Сауалнама жауабы әлі сақталмады.",
    predictedClass: "Болжанған класс",
    actualClass: "Нақты класс",
    confusionResult: "Матрица нәтижесі",
    ruleText: "Ереже: readiness score >= 3.7 болса, платформаны қолдану ықтимал.",
    assistantEyebrow: "Жоба гиді",
    assistantTitle: "Музей жүйесі туралы сұраңыз",
    assistantBody: "Гид VR көздері, дерекқор, рөлдер, экспонаттар, 3D модель, классификация және жоба әдістемесі туралы жиі сұрақтарға жауап береді.",
    chatPlaceholder: "Тур, дерекқор, экспонат немесе әдістеме туралы сұраңыз",
    askButton: "Сұрау",
    managementEyebrow: "Профиль және контент басқару",
    profileCrud: "Пайдаланушы профилі CRUD",
    artifactCrud: "Экспонат CMS CRUD",
    databaseEyebrow: "Админге арналған ДҚ дәлелі",
    databaseTitle: "PostgreSQL кестелері интерфейсте көрінеді",
    reloadDatabase: "Дерекқорды жаңарту",
    coverageEyebrow: "Жоба талаптарының қамтылуы",
    coverageTitle: "Іске асырылған функциялар",
    adminHypothesesTitle: "Lab гипотезалары және әдістеме",
    h1Text: "Пайдалық readiness score мәніне әсер етеді.",
    h2Text: "Виртуалды тур, 3D және интерактивтілік қабылдау болжамын арттырады.",
    h3Text: "Цифрлық платформаны қолдану предикторлар қатарына кіреді.",
    h4Text: "Физикалық музейді толықтыру идеясы интерпретацияда ескеріледі.",
    openVrTour: "VR турды ашу",
    sourcePage: "Дереккөз",
    rights: "Құқықтар",
    noVirtualTours: "VR жазбалары әлі жүктелмеді.",
    all: "Барлығы",
    threeDContext: "3D контекст",
    save: "Сақтау",
    saved: "Сақталды",
    loadToCms: "CMS-ке",
    delete: "Жою",
    unknown: "Белгісіз",
    modelContext: "Енгізілген ескерткіш моделі Musei жүйесіндегі 3D қарау функциясын көрсетеді. Таңдалған экспонат: <strong>{title}</strong>; продакшнде әр жазбаға музей мақұлдаған скандарды қосуға болады. <a href=\"https://sketchfab.com/3d-models/40e6e181ac1c41c980512a3c9610cf97\" target=\"_blank\" rel=\"noreferrer\">Дереккөзді ашу</a>.",
    welcomeMessage: "Қош келдіңіз. Келуші музей функцияларын және CRUD формаларын қолданады. Админ рөлдерді, пароль хэштерін, VR жазбаларын, таңдаулыларды, сауалнамаларды және гид хабарламаларын көрсету үшін дерекқорды ашады.",
  },
};

function t(key) {
  return translations[state.lang]?.[key] || translations.en[key] || key;
}

const api = async (path, options = {}) => {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  let response;
  try {
    response = await fetch(path, { ...options, headers });
  } catch {
    throw new Error("Backend is not running. Start the project with node server.js, then open http://127.0.0.1:4173.");
  }
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error("Backend API not found. You are probably using python -m http.server; use node server.js instead.");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
};

const $ = (selector) => document.querySelector(selector);

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function firstLetter(name) {
  return (name || "G").trim().slice(0, 1).toUpperCase() || "G";
}

function isAdmin() {
  return state.user?.role === "admin";
}

function applyTranslations() {
  document.documentElement.lang = state.lang;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-html]").forEach((element) => {
    element.innerHTML = t(element.dataset.i18nHtml);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  });
  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.classList.toggle("active", button.dataset.lang === state.lang);
  });
  if (!state.lastClassification) {
    $("#classificationResult").textContent = t("noClassification");
  }
  $("#signInMode").textContent = t("signIn");
  $("#registerMode").textContent = t("register");
  setAuthMode($("#authForm").dataset.mode || "signin");
}

function setLanguage(language) {
  state.lang = translations[language] ? language : "en";
  localStorage.setItem("museiLang", state.lang);
  applyTranslations();
  renderCategoryFilters();
  renderArtifacts();
  renderVirtualTours();
  renderProfile();
  if (state.lastClassification) renderClassification(state.lastClassification);
}

function renderCategoryFilters() {
  $("#categoryFilters").innerHTML = categories
    .map((category) => `<button class="chip ${state.activeFilter === category ? "active" : ""}" data-filter="${category}" type="button">${category === "all" ? t("all") : category}</button>`)
    .join("");
}

function artifactMatches(artifact) {
  const matchesFilter = state.activeFilter === "all" || artifact.category === state.activeFilter;
  const haystack = `${artifact.title} ${artifact.artist} ${artifact.year} ${artifact.category} ${artifact.description} ${artifact.room}`.toLowerCase();
  return matchesFilter && haystack.includes(state.query.toLowerCase());
}

function renderArtifacts() {
  const visibleArtifacts = state.artifacts.filter(artifactMatches);
  $("#artifactGrid").innerHTML = visibleArtifacts
    .map((artifact) => {
      const saved = state.favorites.has(Number(artifact.id));
      return `
        <article class="artifact-card">
          <button class="artifact-image-button" data-zoom="${artifact.id}" type="button" aria-label="Open ${escapeHtml(artifact.title)} image">
            <img src="${escapeHtml(artifact.image_url || "assets/gallery-panorama.png")}" alt="${escapeHtml(artifact.title)}" loading="lazy" />
          </button>
          <h3>${escapeHtml(artifact.title)}</h3>
          <strong>${escapeHtml(artifact.category)} | ${escapeHtml(artifact.artist || t("unknown"))} | ${escapeHtml(artifact.year || "n.d.")}</strong>
          <p>${escapeHtml(artifact.description)}</p>
          <div class="card-actions">
            <button class="small-button" data-view-model="${artifact.id}" type="button">${t("threeDContext")}</button>
            <button class="small-button ${saved ? "saved" : ""}" data-favorite="${artifact.id}" type="button">${saved ? t("saved") : t("save")}</button>
          </div>
          ${
            isAdmin()
              ? `<div class="cms-actions">
                  <button class="text-button" data-edit-artifact="${artifact.id}" type="button">${t("loadToCms")}</button>
                  <button class="text-button danger-text" data-delete-artifact="${artifact.id}" type="button">${t("delete")}</button>
                </div>`
              : ""
          }
        </article>
      `;
    })
    .join("");
}

function renderVirtualTours() {
  const container = $("#virtualTourGrid");
  if (!container) return;
  if (!state.virtualTours.length) {
    container.innerHTML = `<p class="empty-state">${t("noVirtualTours")}</p>`;
    return;
  }
  container.innerHTML = state.virtualTours
    .map(
      (tour) => `
        <article class="tour-source-card">
          <div>
            <p class="eyebrow">${escapeHtml(tour.provider)}</p>
            <h3>${escapeHtml(tour.title)}</h3>
          </div>
          <div class="source-meta">
            <span>${escapeHtml(tour.integration_status)}</span>
            <span>${escapeHtml((tour.floor_scope || "external route").split(";")[0])}</span>
          </div>
          <p>${escapeHtml(tour.coverage)}</p>
          <p><strong>${t("rights")}:</strong> ${escapeHtml(tour.rights_note)}</p>
          <p>${escapeHtml(tour.performance_note)}</p>
          <div class="source-actions">
            <a class="primary-button link-button" href="${escapeHtml(tour.source_url)}" target="_blank" rel="noreferrer">${t("openVrTour")}</a>
            ${
              tour.official_source_url
                ? `<a class="ghost-button link-button" href="${escapeHtml(tour.official_source_url)}" target="_blank" rel="noreferrer">${t("sourcePage")}</a>`
                : ""
            }
          </div>
        </article>
      `
    )
    .join("");
}

async function loadVirtualTours() {
  const data = await api("/api/virtual-tours");
  state.virtualTours = data.tours;
  renderVirtualTours();
}

function renderProfile() {
  const user = state.user;
  renderAppAccess();
  $("#profileName").textContent = user ? user.name : "Guest visitor";
  $("#profileAvatar").textContent = firstLetter(user?.name);
  $("#loginButton").textContent = user ? (isAdmin() ? t("admin") : t("profile")) : t("signIn");
  $("#logoutButton").hidden = !user;
  $("#profileStats").textContent = user
    ? `${state.favorites.size} favorites saved | ${user.role || "visitor"} | ${user.interest || "General route"} | ${user.language || "en"}`
    : t("profileStatsGuest");

  const form = $("#profileForm");
  if (user && form) {
    form.elements.name.value = user.name || "";
    form.elements.city.value = user.city || "";
    form.elements.interest.value = user.interest || "Modern Kazakh art";
    form.elements.language.value = user.language || "en";
    form.elements.bio.value = user.bio || "";
  }
}

function renderAppAccess() {
  document.body.classList.toggle("auth-required", !state.user);
  document.body.classList.toggle("admin-user", isAdmin());
  if (state.user && (!location.hash || location.hash === "#welcome")) {
    location.hash = "#tour";
  }
  if (state.user && !isAdmin() && location.hash === "#database") {
    location.hash = "#management";
  }
}

function addMessage(text, type = "bot") {
  const message = document.createElement("div");
  message.className = `message ${type}`;
  message.textContent = text;
  $("#chatLog").append(message);
  $("#chatLog").scrollTop = $("#chatLog").scrollHeight;
}

function renderClassification(result) {
  if (!result) return;
  state.lastClassification = result;
  $("#classificationResult").innerHTML = `
    <div class="result-number">${Number(result.readiness_score).toFixed(2)}</div>
    <p><strong>${t("predictedClass")}:</strong> ${escapeHtml(result.predicted_class)}</p>
    <p><strong>${t("actualClass")}:</strong> ${escapeHtml(result.actual_class)}</p>
    <p><strong>${t("confusionResult")}:</strong> ${escapeHtml(result.result)}</p>
    <p>${t("ruleText")}</p>
  `;
}

function renderDatabase() {
  const tables = Object.keys(state.dbSnapshot);
  renderUserRegistry();
  if (!tables.includes(state.activeTable)) state.activeTable = tables[0] || "users";
  $("#dbTabs").innerHTML = tables
    .map((table) => `<button class="chip ${table === state.activeTable ? "active" : ""}" data-table="${table}" type="button">${table}</button>`)
    .join("");

  const rows = state.dbSnapshot[state.activeTable] || [];
  if (!rows.length) {
    $("#dbView").innerHTML = `<p class="empty-state">No rows in ${escapeHtml(state.activeTable)} yet.</p>`;
    return;
  }

  const columns = Object.keys(rows[0]);
  $("#dbView").innerHTML = `
    <table>
      <thead><tr>${columns.map((column) => `<th>${escapeHtml(column)}</th>`).join("")}</tr></thead>
      <tbody>
        ${rows
          .map(
            (row) => `<tr>${columns.map((column) => `<td>${escapeHtml(String(row[column] ?? "")).slice(0, 120)}</td>`).join("")}</tr>`
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function renderUserRegistry() {
  const container = $("#userRegistry");
  if (!container) return;
  const users = state.dbSnapshot.users || [];
  if (!users.length) {
    container.innerHTML = `<p class="empty-state">No registered users yet.</p>`;
    return;
  }

  container.innerHTML = `
    <table class="registry-table">
      <thead>
        <tr>
          <th>id</th>
          <th>email</th>
          <th>role</th>
          <th>name</th>
          <th>password hash stored</th>
          <th>created_at</th>
        </tr>
      </thead>
      <tbody>
        ${users
          .map(
            (user) => `
              <tr>
                <td>${escapeHtml(user.id)}</td>
                <td>${escapeHtml(user.email)}</td>
                <td><span class="role-pill ${escapeHtml(user.role)}">${escapeHtml(user.role)}</span></td>
                <td>${escapeHtml(user.name)}</td>
                <td>${user.password_hash_stored ? "yes" : "no"}</td>
                <td>${escapeHtml(user.created_at)}</td>
              </tr>
            `
          )
          .join("")}
      </tbody>
    </table>
  `;
}

async function loadMe() {
  if (!state.token) {
    state.user = null;
    state.favorites = new Set();
    renderProfile();
    return;
  }
  try {
    const data = await api("/api/me");
    state.user = data.user;
    state.favorites = new Set(data.favorites.map(Number));
  } catch {
    localStorage.removeItem("museiToken");
    state.token = null;
    state.user = null;
    state.favorites = new Set();
  }
  renderProfile();
}

async function loadArtifacts() {
  const data = await api("/api/artifacts");
  state.artifacts = data.artifacts;
  renderArtifacts();
}

async function loadDatabase() {
  if (!isAdmin()) {
    state.dbSnapshot = {};
    return;
  }
  const data = await api("/api/db/snapshot");
  state.dbSnapshot = data.tables;
  $("#dbStatus").textContent = `Database file: ${data.database}`;
  renderDatabase();
}

async function refreshAll() {
  await loadMe();
  if (!state.user) {
    renderArtifacts();
    renderVirtualTours();
    renderDatabase();
    return;
  }
  await loadArtifacts();
  await loadVirtualTours();
  if (isAdmin()) {
    await loadDatabase();
  } else {
    state.dbSnapshot = {};
  }
}

function setAuthMode(mode) {
  const register = mode === "register";
  $("#authTitle").textContent = register ? t("register") : t("signIn");
  $("#authSubmit").textContent = register ? t("register") : t("signIn");
  $("#authName").hidden = !register;
  $("#authInterest").hidden = !register;
  $("#signInMode").classList.toggle("active", !register);
  $("#registerMode").classList.toggle("active", register);
  $("#authForm").dataset.mode = mode;
  $("#authMessage").textContent = "";
}

function openZoom(artifact) {
  $("#zoomContent").innerHTML = `
    <img src="${escapeHtml(artifact.image_url)}" alt="${escapeHtml(artifact.title)}" />
    <div>
      <p class="eyebrow">High-resolution image</p>
      <h2>${escapeHtml(artifact.title)}</h2>
      <p>${escapeHtml(artifact.description)}</p>
      <p><strong>Source:</strong> <a href="${escapeHtml(artifact.source_url)}" target="_blank" rel="noreferrer">Wikimedia Commons / museum source</a></p>
    </div>
  `;
  $("#zoomDialog").showModal();
}

function loadArtifactToCms(artifact) {
  const form = $("#artifactForm");
  form.dataset.id = artifact.id;
  form.elements.title.value = artifact.title || "";
  form.elements.artist.value = artifact.artist || "";
  form.elements.year.value = artifact.year || "";
  form.elements.category.value = artifact.category || "Painting";
  form.elements.room.value = artifact.room || "";
  form.elements.imageUrl.value = artifact.image_url || "";
  form.elements.description.value = artifact.description || "";
  form.querySelector("button[type='submit']").textContent = "Update artifact";
}

document.addEventListener("click", async (event) => {
  const languageButton = event.target.closest("[data-lang]");
  const filterButton = event.target.closest("[data-filter]");
  const tableButton = event.target.closest("[data-table]");
  const favoriteButton = event.target.closest("[data-favorite]");
  const zoomButton = event.target.closest("[data-zoom]");
  const modelButton = event.target.closest("[data-view-model]");
  const editButton = event.target.closest("[data-edit-artifact]");
  const deleteButton = event.target.closest("[data-delete-artifact]");
  if (languageButton) {
    setLanguage(languageButton.dataset.lang);
  }

  if (filterButton) {
    state.activeFilter = filterButton.dataset.filter;
    renderCategoryFilters();
    renderArtifacts();
  }

  if (tableButton) {
    state.activeTable = tableButton.dataset.table;
    renderDatabase();
  }

  if (favoriteButton) {
    if (!state.user) {
      $("#authDialog").showModal();
      return;
    }
    const artifactId = Number(favoriteButton.dataset.favorite);
    if (state.favorites.has(artifactId)) {
      await api(`/api/favorites/${artifactId}`, { method: "DELETE" });
    } else {
      await api("/api/favorites", { method: "POST", body: JSON.stringify({ artifactId }) });
    }
    await refreshAll();
  }

  if (zoomButton) {
    const artifact = state.artifacts.find((item) => Number(item.id) === Number(zoomButton.dataset.zoom));
    if (artifact) openZoom(artifact);
  }

  if (modelButton) {
    const artifact = state.artifacts.find((item) => Number(item.id) === Number(modelButton.dataset.viewModel));
    if (artifact) {
      $("#modelDescription").innerHTML = t("modelContext").replace("{title}", escapeHtml(artifact.title));
      $(".model-viewer").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  if (editButton) {
    if (!isAdmin()) return;
    const artifact = state.artifacts.find((item) => Number(item.id) === Number(editButton.dataset.editArtifact));
    if (artifact) loadArtifactToCms(artifact);
  }

  if (deleteButton) {
    if (!isAdmin()) return;
    const artifactId = Number(deleteButton.dataset.deleteArtifact);
    if (window.confirm("Delete this artifact from the PostgreSQL database?")) {
      await api(`/api/artifacts/${artifactId}`, { method: "DELETE" });
      await refreshAll();
    }
  }
});

$("#searchInput").addEventListener("input", (event) => {
  state.query = event.target.value;
  renderArtifacts();
});

$("#loginButton").addEventListener("click", () => {
  if (state.user) {
    location.hash = isAdmin() ? "#database" : "#management";
  } else {
    setAuthMode("signin");
    $("#authDialog").showModal();
  }
});

$("#logoutButton").addEventListener("click", () => {
  localStorage.removeItem("museiToken");
  state.token = null;
  state.user = null;
  state.favorites = new Set();
  state.dbSnapshot = {};
  renderProfile();
  location.hash = "#welcome";
});

$("#welcomeSignIn").addEventListener("click", () => {
  setAuthMode("signin");
  $("#authDialog").showModal();
});

$("#welcomeRegister").addEventListener("click", () => {
  setAuthMode("register");
  $("#authDialog").showModal();
});

$("#signInMode").addEventListener("click", () => setAuthMode("signin"));
$("#registerMode").addEventListener("click", () => setAuthMode("register"));

$("#authForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const mode = $("#authForm").dataset.mode || "signin";
  const payload = {
    email: $("#authEmail").value,
    password: $("#authPassword").value,
    name: $("#authName").value,
    interest: $("#authInterest").value,
  };
  try {
    const data = await api(mode === "register" ? "/api/auth/register" : "/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    state.token = data.token;
    localStorage.setItem("museiToken", state.token);
    $("#authDialog").close();
    $("#authForm").reset();
    await refreshAll();
  } catch (error) {
    $("#authMessage").textContent = error.message;
  }
});

$("#profileForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!state.user) {
    $("#authDialog").showModal();
    return;
  }
  const form = event.currentTarget;
  await api("/api/profile", {
    method: "PUT",
    body: JSON.stringify({
      name: form.elements.name.value,
      city: form.elements.city.value,
      interest: form.elements.interest.value,
      language: form.elements.language.value,
      bio: form.elements.bio.value,
    }),
  });
  await refreshAll();
});

$("#deleteAccountButton").addEventListener("click", async () => {
  if (!state.user) return;
  if (window.confirm("Delete the current user, profile, favorites, survey rows, and session from PostgreSQL?")) {
    await api("/api/account", { method: "DELETE" });
    localStorage.removeItem("museiToken");
    state.token = null;
    await refreshAll();
  }
});

$("#artifactForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!isAdmin()) return;
  const form = event.currentTarget;
  const payload = {
    title: form.elements.title.value,
    artist: form.elements.artist.value,
    year: form.elements.year.value,
    category: form.elements.category.value,
    room: form.elements.room.value,
    imageUrl: form.elements.imageUrl.value,
    description: form.elements.description.value,
  };
  const id = form.dataset.id;
  await api(id ? `/api/artifacts/${id}` : "/api/artifacts", {
    method: id ? "PUT" : "POST",
    body: JSON.stringify(payload),
  });
  form.reset();
  delete form.dataset.id;
  form.querySelector("button[type='submit']").textContent = "Create artifact";
  await refreshAll();
});

$("#surveyForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const values = Object.fromEntries(new FormData(form).entries());
  const data = await api("/api/survey", {
    method: "POST",
    body: JSON.stringify(values),
  });
  renderClassification(data.result);
  if (isAdmin()) await loadDatabase();
});

$("#chatForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const input = $("#chatInput");
  const question = input.value.trim();
  if (!question) return;
  addMessage(question, "user");
  input.value = "";
  try {
    const data = await api("/api/assistant", { method: "POST", body: JSON.stringify({ question, language: state.lang }) });
    addMessage(data.answer);
    if (isAdmin()) await loadDatabase();
  } catch (error) {
    addMessage(error.message);
  }
});

$("#refreshCollectionButton").addEventListener("click", refreshAll);
$("#refreshToursButton").addEventListener("click", loadVirtualTours);
$("#refreshDbButton").addEventListener("click", loadDatabase);
$("#closeZoomButton").addEventListener("click", () => $("#zoomDialog").close());

renderCategoryFilters();
applyTranslations();
setAuthMode("signin");
addMessage(t("welcomeMessage"));
refreshAll().catch((error) => {
  $("#authMessage").textContent = error.message;
  addMessage(error.message);
});
