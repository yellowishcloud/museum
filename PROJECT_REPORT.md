# Musei Kasteev Digital Museum Information System

## 1. Introduction

Musei Kasteev is a working prototype of a Digital Museum Information System for the A. Kasteev National Museum of Arts of the Republic of Kazakhstan. The project is designed as the "Project" submission option from Lecture 10. It combines the previous laboratory work with a functional application, a database, and architecture documentation.

The prototype is not an official museum product. It is a proof of concept that can be shown to a teacher or museum representative before asking for permission to use official panoramic footage, collection records, and 3D scans.

## 2. Museum Context

The official e-museum page says the museum history begins on September 23, 1935, the building opened to visitors on September 16, 1976, and the museum was named after Abilkhan Kasteev in January 1984. It also describes the museum as the largest museum of visual arts in Kazakhstan, with over 25,000 exhibits. Source: [e-museum.kz](https://e-museum.kz/en/museum/68da37adf0a2e8a5d-en/).

The official GMIRK navigation lists collection sections such as Decorative and Applied Art of Kazakhstan, Fine Arts of Kazakhstan, Painting, Sculpture, Graphics, Western European Art, Russian Art, and Art of the Orient. It also links to 3D and audio-tour resources. Source: [gmirk.kz](https://gmirk.kz/en/component/content/?Itemid=101).

## 3. Relevance, Novelty, And Practical Significance

Relevance: Many users cannot visit physical museums because of distance, time, disability, renovation, or limited access. A digital museum can make cultural heritage available remotely.

Novelty: The project combines official/public VR source integration, a topic-based project guide, user profile, favorites, admin-only artifact CMS, survey classifier, role-based access, three-language UI switching, and a visible admin SQLite database in one prototype.

Practical significance: The system can be used as a demonstrator before official acceptance by the museum. Real media can replace demo media after legal permission is granted.

## 4. Main Functionalities

- Authentication with salted password hashing
- User profile create, read, update, and delete
- Project guide with topic-based answers and database-stored message history
- Virtual tour access with real gallery photo and public 360 source links
- External 360 tour source records stored in SQLite
- Role-based accounts: visitor and admin
- Search and category filter for artifacts
- English, Russian, and Kazakh interface switch
- Favorites linked to authenticated user ID
- Admin-only artifact CMS create, read, update, and delete
- High-resolution image zoom
- Embedded 3D model viewer using a public Sketchfab model of the Abilkhan Kasteev monument in Almaty
- Survey form and readiness classification
- Admin-only SQLite database viewer in the GUI

The project also links to the official GMIRK virtual exhibition page and its public BKDR 360 tour. The prototype does not copy or mirror those panoramic assets, because production use requires permission from the museum or the tour provider. Instead, Musei stores the public tour records in the `virtual_tours` table and adds local information-system functions around them.

The prototype intentionally does not show a fake architectural route map. Public VR sources show that the building and exhibition spaces are more complex than a simple three-floor diagram. A production version should use only Kasteev-approved floor plans and gallery labels.

## 5. Competitive Analysis

| Competitor | Strengths | Weaknesses | Opportunity for Musei Kasteev |
|---|---|---|---|
| Google Arts & Culture | Strong virtual tours, polished interface, global reach | Less local control over branding, local user data, and Kasteev-specific learning routes | Build a focused platform for Kazakh art with local profile, database, and methodology features |
| Louvre Online Collection | Strong official metadata and large collection database | More collection-search focused than personalized for beginner users | Combine searchable collection with AI explanations and a route-based visit |
| British Museum Online Collection | Rich object database and learning materials | Can feel database-heavy for casual visitors | Make the experience more visual, guided, and student-friendly |

## 6. Methodology And Statistical Analysis

The project uses the work from Lab 1, Lab 2, Lab 3, and Lab 4.

Lab 1 found that users expect digital museums to feel game-like, immersive, high-quality, and easy to navigate. Users also said digital museums cannot fully replace physical museums but can improve access and preservation.

Lab 2 defined functional requirements: 360-degree tours, high-resolution zoom, 3D models, interactive storytelling, multilingual support, and secure user data. Audio narration and true low-bandwidth media delivery are treated as future production functions because the prototype does not include approved audio files or alternative compressed media packages.

Lab 3 included a survey of 50 respondents. It tested usefulness, accessibility, virtual tours, high-quality images and 3D models, interactive features, digital platform use, and intention to use.

Lab 4 implemented a classification rule:

- Readiness score = average of six predictor variables
- Predicted positive class = readiness score at least 3.7
- Actual positive class = future intention rating 4 or 5

The application now implements this rule in the survey form and stores the result in the `survey_responses` table.

## 7. Classification Metrics

Use the Lab 4 result in project review:

- Precision: 86.21%
- Recall: 71.43%
- F1-score: 78.13%
- Valid samples: 49

## 8. Used Technologies

- HTML, CSS, JavaScript
- Node.js local server
- SQLite database using Node `node:sqlite`
- PBKDF2 password hashing with salt
- Local image assets from Wikimedia Commons
- External VR source links from GMIRK/BKDR and Artsteps
- Sketchfab embedded 3D viewer for the Abilkhan Kasteev monument
- Three-language UI strings for English, Russian, and Kazakh
- Mermaid diagrams in documentation

## 9. Source Notes

Real museum facts were checked from:

- [A. Kasteev National Museum on e-museum.kz](https://e-museum.kz/en/museum/68da37adf0a2e8a5d-en/)
- [Official GMIRK website](https://gmirk.kz/en/component/content/?Itemid=101)
- [GMIRK virtual exhibition: 3D tour "From Durer to Eifert"](https://www.gmirk.kz/ru/media-links/virtualnye-vystavki/233-3d-tur-po-vystavke-ot-dyurera-do-ejferta)
- [BKDR public 360 tour linked from GMIRK](https://bkdr.de/VRundgang/AlmatyKunstmuseum/)
- [Artsteps public virtual exhibition reference](https://www.artsteps.com/view/6357caff66dd51fc4b199ac6?currentUser)
- [Sketchfab model: Abilkhan Kasteev monument in Almaty](https://sketchfab.com/3d-models/40e6e181ac1c41c980512a3c9610cf97)
- [A. Kasteyev State Museum of Arts on Wikipedia](https://en.wikipedia.org/wiki/A._Kasteyev_State_Museum_of_Arts)
- [Wikimedia Commons category: State Museum of Arts, Almaty](https://commons.wikimedia.org/wiki/Category:State_Museum_of_Arts,_Almaty)

The 2GIS link provided points to the Abilkhan Kasteev Home Museum, not the main A. Kasteev National Museum of Arts. Source: [2GIS](https://2gis.kz/almaty/firm/9429940001387369/tab/photos).

## 10. Conclusion

Musei Kasteev is a complete project prototype that demonstrates more than four required functionalities and includes a real database. It supports the idea that a digital museum should complement physical visits, improve access to cultural heritage, and provide a modern, interactive experience for students and remote users.
