document.addEventListener("DOMContentLoaded", function() {
    const groupId = 51; // ID группы
    const currWeekEl = document.getElementById("CurrWeek");
    const nextWeekEl = document.getElementById("NextWeek");

    // 🔹 Overrides: ключ → значение
    // Формат ключей:
    // "Предмет|Тип|Неделя" → конкретная неделя + тип
    // "Предмет|Тип" → любой неделя
    // "Предмет" → глобально
    const overrides = {
		
		// GLOBAL
		"Большой морфологич.лекц.зал": "БМЗ",
        "311 (фак.тер.)": "",
        "Учебная ауд.-": "кабинет №",
        "РДЛЦ при КГМА, 3 этаж, Учебный каб.- ": "Медцентр КГМА (по Тыныстанова), 401 кабинет",
        "клин.Ахунбаева, 2 этаж, Лекц.зал-БХЗ (проп.хир.)": "Национальный госпиталь (Тоголок Молдо 1/13)",
		"(общ.г.)": "",
		"Кафедра: Общей гигиены": "4 корпус (вход справа), кабинет №325",

		
		// TARGETED
		"Клиническая биохимия|Практика|NextWeek": "<a href='https://jumpshare.com/share/mGKaxdNZ5G7TGIFHOpZf' target='_blank'>Клиническая биохимия</a>",

		"Общая гигиена|Практика|NextWeek": "<a href='https://jumpshare.com/share/W378sP6WnSnSTv5mmMUr' target='_blank'>Общая гигиена</a>",
        // "Патологическая анатомия|Практика|CurrWeek": "<a href='https://jumpshare.com/share/ksMMPvfZbsdFOBqlK2DU'>Патологическая анатомия</a>",
        // "Лучевая диагностика": "<a href='https://chatgpt.com/share/68d51f67-d684-800b-ae86-b0d2f639597c'>Лучевая диагностика</a>",
        
        // "Пропедевтика внутренних болезней (фак.тер)": "<a href='https://jumpshare.com/share/FjHF0OFfd47Z3eOQqXPi'>Пропедевтика внутренних болезней</a>"
    };

    function getMonday(d) {
        d = new Date(d);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    }

    function formatDate(d) {
        let month = d.getMonth() + 1;
        let day = d.getDate();
        return `${d.getFullYear()}-${month<10?"0"+month:month}-${day<10?"0"+day:day}`;
    }

    function capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function formatWeekRange(startDate) {
        const options = { day: "numeric", month: "long" };
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        return `Расписание с ${startDate.toLocaleDateString("ru-RU", options)} по ${endDate.toLocaleDateString("ru-RU", options)}`;
    }

    // 🔹 Контекстный override по предмету, типу и неделе
    function applyOverride(span, weekId) {
        const text = span.textContent.trim();
        const typeSpan = span.parentElement.querySelector(".lesson__type");
        const type = typeSpan ? typeSpan.textContent.trim() : "";

        const keysToCheck = [
            `${text}|${type}|${weekId}`,
            `${text}|${type}`,
            `${text}`
        ];

        for (const key of keysToCheck) {
            if (overrides[key]) {
                span.innerHTML = overrides[key]; // HTML вставляем через innerHTML
                return;
            }
        }
    }

    function applyOverridesToWeek(container, weekId) {
        const lessons = container.querySelectorAll(".lesson__name");
        lessons.forEach(span => applyOverride(span, weekId));
    }

    // Глобальные текстовые замены (по всему HTML)
    function applyGlobalOverrides(container) {
        const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while(node = walker.nextNode()) {
            for(const key in overrides){
                if(!overrides[key].includes('<')) {
                    function escapeRegExp(string) {
                        return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                    }
                    const safeKey = escapeRegExp(key);
                    const regex = new RegExp(safeKey, "g");
                    node.nodeValue = node.nodeValue.replace(regex, overrides[key]);
                }
            }
        }
    }

    // Загрузка недели
    function loadWeek(monday, container, weekId) {
        const url = `https://ksma-schedule.itismynickname9.workers.dev/proxy/${groupId}/${formatDate(monday)}/get`;

        fetch(url)
            .then(res => res.json())
            .then(data => {
                container.innerHTML = "";
                const scheduleTable = document.createElement("ul");
                scheduleTable.className = "schedule__table";

                for(const dayKey in data){
                    const day = data[dayKey];
                    const liDay = document.createElement("li");
                    liDay.className = "schedule__day";

                    const dateSpan = document.createElement("span");
                    dateSpan.className = "schedule__date";
                    const dateObj = new Date(day.d);
                    const options = { weekday: "long", day: "numeric", month: "long" };
                    dateSpan.textContent = capitalizeFirst(dateObj.toLocaleDateString("ru-RU", options));
                    liDay.appendChild(dateSpan);

                    const lessonsUl = document.createElement("ul");
                    lessonsUl.className = "schedule__lessons";

                    for(const lessonKey in day.l){
                        const lesson = day.l[lessonKey];
                        const lessonLi = document.createElement("li");
                        lessonLi.className = "lesson";

                        const timeDiv = document.createElement("div");
                        timeDiv.className = "lesson__time";
                        timeDiv.textContent = lesson.tm;
                        lessonLi.appendChild(timeDiv);

                        const paramsDiv = document.createElement("div");
                        paramsDiv.className = "lesson__params";

                        const nameSpan = document.createElement("span");
                        nameSpan.className = "lesson__name";
                        nameSpan.textContent = lesson.d;
                        paramsDiv.appendChild(nameSpan);

                        const typeSpan = document.createElement("span");
                        typeSpan.className = "lesson__type";
                        typeSpan.textContent = lesson.t;
                        paramsDiv.appendChild(typeSpan);

                        if(lesson.r){
                            const placeSpan = document.createElement("span");
                            placeSpan.className = "lesson__place";
                            placeSpan.innerHTML = `<i class="icon-marker"></i>${lesson.r}`;
                            paramsDiv.appendChild(placeSpan);
                        }

                        lessonLi.appendChild(paramsDiv);
                        lessonsUl.appendChild(lessonLi);
                    }

                    liDay.appendChild(lessonsUl);
                    scheduleTable.appendChild(liDay);
                }

                container.appendChild(scheduleTable);

                // 🔹 Таймаут для глобальных замен и overrides
                setTimeout(() => {
                    applyGlobalOverrides(container);
                    applyOverridesToWeek(container, weekId);
                }, 300);
            })
            .catch(err => {
                container.innerHTML = "<p style='color:red; text-align:center;'>Не удалось загрузить расписание</p>";
                console.error(err);
            });
    }

    const monday = getMonday(new Date());
    const nextMonday = new Date(monday);
    nextMonday.setDate(nextMonday.getDate() + 7);

    // Сразу загружаем обе недели
    loadWeek(monday, currWeekEl, "CurrWeek");
    loadWeek(nextMonday, nextWeekEl, "NextWeek");
    nextWeekEl.style.display = "none";

    // Переключение недель
    document.getElementById("cur").onclick = () => {
        currWeekEl.style.display = "block";
        nextWeekEl.style.display = "none";
    };
    document.getElementById("next").onclick = () => {
        currWeekEl.style.display = "none";
        nextWeekEl.style.display = "block";
    };
});
