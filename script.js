document.addEventListener("DOMContentLoaded", function() {
    const groupId = 51; // ID группы
    const currWeekEl = document.getElementById("CurrWeek");
    const nextWeekEl = document.getElementById("NextWeek");

    // 🔹 Overrides: ключ → значение
    // Если значение содержит HTML, оно вставляется через innerHTML
    // Для глобальных замен используем только текст
    const overrides = {
		
        // "НИРС": "Физика <br><i style='color:green;'>лаб. работа</i>",
		// "": "",
		"Клиническая биохимия ": "<a href='https://jumpshare.com/share/37mbNQRsPscLlPmKkj1A'>Клиническая биохимия</a>",
		"(пат.физ.)": "",
		"(луч.д.)": "",
		"(пат.анат.)": "",
        "Лучевая диагностика": "<a href='https://chatgpt.com/share/68d51f67-d684-800b-ae86-b0d2f639597c'>Лучевая диагностика</a>",
        "Большой морфологич.лекц.зал": "БМЗ",
		"311 (фак.тер.)": "",
		"Учебная ауд.-": "Кабинет №",
		"РДЛЦ при КГМА, 3 этаж, Учебный каб.- ": "Медцентр КГМА (по Тыныстанова), 401 кабинет",
        "клин.Ахунбаева, 2 этаж, Лекц.зал-БХЗ (проп.хир.)": "Национальный госпиталь (Тоголок Молдо 1/13)",
        "Пропедевтика внутренних болезней (фак.тер)": "Пропедевтика внутренних болезней"
		// "Большой морфологич.лекц.зал": "БМЗ"
    };

    // Определяем понедельник недели
    function getMonday(d) {
        d = new Date(d);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    }

    function formatDate(d) {
        let month = d.getMonth() + 1;
        let day = d.getDate();
        return `${d.getFullYear()}-${month < 10 ? "0"+month : month}-${day < 10 ? "0"+day : day}`;
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

    // Глобальные текстовые замены
    function applyGlobalOverrides(container, overrides) {
        const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while(node = walker.nextNode()) {
            for(const key in overrides){
                if(!overrides[key].includes('<')) { // только для текстовых замен
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

    // Подгружаем расписание недели
    function loadWeek(monday, container, weekSpanId) {
        const url = `https://ksma-schedule.itismynickname9.workers.dev/proxy/${groupId}/${formatDate(monday)}/get`;

        fetch(url)
            .then(res => res.json())
            .then(data => {
                const weekSpan = document.getElementById(weekSpanId);
                if(weekSpan) {
                    weekSpan.textContent = formatWeekRange(monday);
                }

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
                        // Если в overrides есть HTML, вставляем через innerHTML
                        if(overrides[lesson.d]) {
                            nameSpan.innerHTML = overrides[lesson.d];
                        } else {
                            nameSpan.textContent = lesson.d;
                        }
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

                // Таймаут для глобальных замен, чтобы картинки успели прогрузиться
                setTimeout(() => applyGlobalOverrides(container, overrides), 300);
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
    loadWeek(monday, currWeekEl, "week");
    loadWeek(nextMonday, nextWeekEl, "week-next");
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



