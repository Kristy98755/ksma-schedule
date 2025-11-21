document.addEventListener("DOMContentLoaded", async function() {
  const proxy = "https://ksma-schedule.itismynickname9.workers.dev";
  const currWeekEl = document.getElementById("CurrWeek");
  const nextWeekEl = document.getElementById("NextWeek");
  const weekBtns = {
    cur: document.getElementById("cur"),
    next: document.getElementById("next")
  };

  const cur = weekBtns.cur;
  const next = weekBtns.next;

  // --- Куки ---
  function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days*24*60*60*1000));
    document.cookie = `${name}=${value};path=/;expires=${d.toUTCString()}`;
    console.log(`[COOKIE SET] ${name}=${value}`);
  }

  function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    const val = match ? match[2] : null;
    console.log(`[COOKIE GET] ${name}=${val}`);
    return val;
  }

  // --- Утилиты ---
  function getMonday(d) {
    d = new Date(d);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  function formatDate(d) {
    let m = d.getMonth() + 1, day = d.getDate();
    return `${d.getFullYear()}-${m<10?"0"+m:m}-${day<10?"0"+day:day}`;
  }

  function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function clearSelect(sel, placeholder="—") {
    sel.innerHTML = `<option>${placeholder}</option>`;
    sel.disabled = true;
  }

  // --- Загрузка недель ---
  async function loadWeek(monday, container, weekId, groupId) {
    const url = `${proxy}/proxy/${groupId}/${formatDate(monday)}/get`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      container.innerHTML = "";
      const scheduleTable = document.createElement("ul");
      scheduleTable.className = "schedule__table";

      for (const dayKey in data) {
        const day = data[dayKey];
        const liDay = document.createElement("li");
        liDay.className = "schedule__day";

        const dateSpan = document.createElement("span");
        dateSpan.className = "schedule__date";
        const dateObj = new Date(day.d);
        const opts = { weekday: "long", day: "numeric", month: "long" };
        dateSpan.textContent = capitalizeFirst(dateObj.toLocaleDateString("ru-RU", opts));
        liDay.appendChild(dateSpan);

        const lessonsUl = document.createElement("ul");
        lessonsUl.className = "schedule__lessons";

        for (const lKey in day.l) {
          const lesson = day.l[lKey];
          const li = document.createElement("li");
          li.className = "lesson";

          const time = document.createElement("div");
          time.className = "lesson__time";
          time.textContent = lesson.tm;
          li.appendChild(time);

          const params = document.createElement("div");
          params.className = "lesson__params";

          const name = document.createElement("span");
          name.className = "lesson__name";
          name.textContent = lesson.d;
          params.appendChild(name);

          const type = document.createElement("span");
          type.className = "lesson__type";
          type.textContent = lesson.t;
          params.appendChild(type);

          if (lesson.r) {
            const room = document.createElement("span");
            room.className = "lesson__place";
            room.innerHTML = `<i class="icon-marker"></i>${lesson.r}`;
            params.appendChild(room);
          }

          li.appendChild(params);
          lessonsUl.appendChild(li);
        }
        liDay.appendChild(lessonsUl);
        scheduleTable.appendChild(liDay);
      }

      container.appendChild(scheduleTable);
    } catch (err) {
      container.innerHTML = "<p style='color:red;text-align:center;'>Ошибка загрузки расписания</p>";
      console.error(err);
    }
  }

  async function loadScheduleByGroup(groupId) {
	  
	  if (groupId == 51) { 
        window.location.href = "https://kristy98755.github.io/ksma-schedule-23gr";

        // подписка на топик через WebView
        if (window.KsmaApp && window.KsmaApp.handleCommand) {
            window.KsmaApp.handleCommand(JSON.stringify({
                action: "subscribe",
                topic: "23gr_common"
            }));
        }

        return;
    }
    const monday = getMonday(new Date());
    const nextMonday = new Date(monday);
    nextMonday.setDate(nextMonday.getDate() + 7);

    await loadWeek(monday, currWeekEl, "CurrWeek", groupId);
    await loadWeek(nextMonday, nextWeekEl, "NextWeek", groupId);

    // Показываем только текущую неделю по умолчанию
    currWeekEl.style.display = "block";
    nextWeekEl.style.display = "none";

    // Показываем кнопки недель
    document.querySelector(".week-tb").style.display = "table";

    // Ручная установка цветов кнопок, как у тебя в форке
    cur.style.backgroundColor = "#27a8e7dd";
    next.style.backgroundColor = "#bbdd";
  }

  // --- Переключение недель ---
  cur.onclick = () => {
    currWeekEl.style.display = "block";
    nextWeekEl.style.display = "none";

    cur.style.backgroundColor = "#27a8e7dd";
    next.style.backgroundColor = "#bbdd";
  };

  next.onclick = () => {
    currWeekEl.style.display = "none";
    nextWeekEl.style.display = "block";

    next.style.backgroundColor = "#27a8e7dd";
    cur.style.backgroundColor = "#bbdd";
  };

  // --- Проверяем куки ---
  const savedGroup = getCookie("selectedGroup");
  if (savedGroup) {
    await loadScheduleByGroup(savedGroup);
  } else {
    // --- Создание интерфейса выбора, стилизованного под уроки ---
    const selectorWrap = document.createElement("div");
    selectorWrap.className = "schedule__lessons";
    selectorWrap.style.margin = "20px 10px";
    selectorWrap.style.padding = "15px";
    selectorWrap.style.borderRadius = "3px";

    selectorWrap.innerHTML = `
      <div class="lesson">
        <div class="lesson__time">Факультет:</div>
        <div class="lesson__params">
          <select id="faculty" style="width:100%;padding:5px;"></select>
        </div>
      </div>
      <div class="lesson">
        <div class="lesson__time">Курс:</div>
        <div class="lesson__params">
          <select id="course" style="width:100%;padding:5px;" disabled></select>
        </div>
      </div>
      <div class="lesson">
        <div class="lesson__time">Группа:</div>
        <div class="lesson__params">
          <select id="group" style="width:100%;padding:5px;" disabled></select>
        </div>
      </div>
      <div class="lesson" style="text-align:center;">
        <button id="loadSchedule" style="padding:8px 15px;background:#009688;color:white;border:none;border-radius:6px;cursor:pointer;" disabled>
          Загрузить расписание
        </button>
      </div>
    `;

    document.querySelector(".schedule__data").prepend(selectorWrap);

    const facultySelect = document.getElementById("faculty");
    const courseSelect = document.getElementById("course");
    const groupSelect = document.getElementById("group");
    const loadBtn = document.getElementById("loadSchedule");

    // --- Загрузка факультетов/курсов/групп ---
    let data = null;
    try {
      const res = await fetch(`${proxy}/groups/get`);
      data = await res.json();
      facultySelect.innerHTML = `<option value="">Выберите факультет</option>`;
      for (const f of data.faculty) {
        const o = document.createElement("option");
        o.value = f.i;
        o.textContent = f.n;
        facultySelect.appendChild(o);
      }
    } catch (err) {
      alert("Не удалось загрузить список факультетов: " + err.message);
    }

    facultySelect.addEventListener("change", e => {
      const fid = e.target.value;
      clearSelect(courseSelect);
      clearSelect(groupSelect);
      loadBtn.disabled = true;
      if (!fid || !data.course[fid]) return;

      const courses = Object.values(data.course[fid]);
      for (const c of courses) {
        const opt = document.createElement("option");
        opt.value = c;
        opt.textContent = `${c} курс`;
        courseSelect.appendChild(opt);
      }
      courseSelect.disabled = false;
    });

    courseSelect.addEventListener("change", e => {
      const fid = facultySelect.value;
      const cid = e.target.value;
      clearSelect(groupSelect);
      loadBtn.disabled = true;
      const groups = data.groups?.[fid]?.[cid];
      if (!groups) return;

      for (const gKey in groups) {
        const g = groups[gKey];
        const opt = document.createElement("option");
        opt.value = g.i;
        opt.textContent = g.n;
        groupSelect.appendChild(opt);
      }
      groupSelect.disabled = false;
    });

    groupSelect.addEventListener("change", () => {
      loadBtn.disabled = !groupSelect.value;
    });

    loadBtn.addEventListener("click", async () => {
      const gid = groupSelect.value;
      if (!gid) return;

      setCookie("selectedGroup", gid, 30);
      await loadScheduleByGroup(gid);
    });
  }
});
