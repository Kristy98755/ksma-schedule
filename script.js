document.addEventListener("DOMContentLoaded", function() {
    const groupId = 51; // ID твоей группы
    const currWeekEl = document.getElementById("CurrWeek");
    const nextWeekEl = document.getElementById("NextWeek");

    // Определяем даты текущей недели (понедельник)
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

    const monday = getMonday(new Date());
    const url = `https://ksma-schedule.itismynickname9.workers.dev/proxy/${groupId}/${formatDate(monday)}/get`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            const scheduleTable = document.createElement("ul");
            scheduleTable.className = "schedule__table";

            for (const dayKey in data) {
                const day = data[dayKey];
                const liDay = document.createElement("li");
                liDay.className = "schedule__day";

                // Дата и день недели
                const dateSpan = document.createElement("span");
                dateSpan.className = "schedule__date";
                const dateObj = new Date(day.d);
                const options = { weekday: 'long', day: 'numeric', month: 'long' };
                dateSpan.textContent = dateObj.toLocaleDateString('ru-RU', options);
                liDay.appendChild(dateSpan);

                const lessonsUl = document.createElement("ul");
                lessonsUl.className = "schedule__lessons";

                for (const lessonKey in day.l) {
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

                    if (lesson.r) {
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

            currWeekEl.innerHTML = "";
            currWeekEl.appendChild(scheduleTable);
        })
        .catch(err => {
            currWeekEl.innerHTML = "<p style='color:red; text-align:center;'>Не удалось загрузить расписание</p>";
            console.error(err);
        });

    // Переключение недель
    document.getElementById("cur").onclick = () => {
        showWeek("curr");
    };
    document.getElementById("next").onclick = () => {
        showWeek("next");
    };

    function showWeek(week) {
        if (week === "curr") {
            nextWeekEl.style.display = "none";
            currWeekEl.style.display = "block";
        } else {
            currWeekEl.style.display = "none";
            nextWeekEl.style.display = "block";
        }
    }
});
