document.getElementById('nutritionForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const resultDiv = document.getElementById('result');
  const caloriesSpan = document.getElementById('calories');
  const mealPlanDiv = document.getElementById('mealPlan');

  // Показываем результат и очищаем предыдущий план
  resultDiv.style.display = 'block';
  mealPlanDiv.replaceChildren(); // Современная замена innerHTML = ''

  const age = parseFloat(document.getElementById('age').value);
  const gender = document.getElementById('gender').value;
  const weight = parseFloat(document.getElementById('weight').value);
  const height = parseFloat(document.getElementById('height').value);
  const activity = parseFloat(document.getElementById('activity').value);
  const goal = document.getElementById('goal').value;
  const diet = document.getElementById('diet').value;
  const allergies = Array.from(document.querySelectorAll('#allergies input:checked')).map(cb => cb.value);

  // Расчёт калорий
  let bmr = calculateBMR(weight, height, age, gender);
  let dailyCalories = bmr * activity;
  if (goal === 'lose') dailyCalories *= 0.8;
  if (goal === 'gain') dailyCalories *= 1.2;

  const targetCalories = Math.round(dailyCalories);
  caloriesSpan.textContent = targetCalories;

  // Генерация плана на 7 дней с вкладками
  const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
  const tabsContainer = document.createElement('div');
  tabsContainer.className = 'tabs';

  const tabButtons = document.createElement('div');
  tabButtons.className = 'tab-buttons';
  tabsContainer.appendChild(tabButtons);

  const tabContents = document.createElement('div');
  tabContents.className = 'tab-contents';
  tabsContainer.appendChild(tabContents);

  // Создаём вкладки
  days.forEach((dayName, index) => {
    // Кнопка вкладки
    const button = document.createElement('button');
    button.className = 'tab-button';
    button.textContent = dayName;
    button.dataset.day = index + 1;
    button.setAttribute('role', 'tab');
    button.setAttribute('tabindex', '0');
    if (index === 0) {
      button.classList.add('active');
      button.setAttribute('aria-selected', 'true');
    } else {
      button.setAttribute('aria-selected', 'false');
    }

    // Переключение вкладок
    button.onclick = () => {
      setActiveTab(button, tabButtons, tabContents);
    };

    // Клавиатурные стрелки
    button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        button.click();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const buttons = Array.from(tabButtons.children);
        const dir = e.key === 'ArrowRight' ? 1 : -1;
        const nextIndex = (buttons.indexOf(button) + dir + buttons.length) % buttons.length;
        buttons[nextIndex].focus();
        buttons[nextIndex].click();
      }
    });

    tabButtons.appendChild(button);

    // Содержимое вкладки
    const pane = document.createElement('div');
    pane.className = 'tab-pane';
    pane.id = `day-${index + 1}`;
    pane.setAttribute('role', 'tabpanel');
    pane.setAttribute('aria-labelledby', button.id || '');
    if (index !== 0) pane.style.display = 'none';

    const dayDiv = document.createElement('div');
    dayDiv.innerHTML = `<h3>${dayName}</h3>`;
    dayDiv.className = 'daily-meal';

    let totalDailyCalories = 0;

    // Завтрак (~30%)
    const breakfastOpt = recipesDB.breakfast.filter(r => isRecipeAllowed(r, diet, allergies));
    const breakfast = generateSimpleMeal(Math.round(targetCalories * 0.3), breakfastOpt, diet, allergies);
    addMealToDay(dayDiv, breakfast, "Завтрак");
    if (breakfast) totalDailyCalories += breakfast.calories;

    // Обед (~35%)
    const lunchMeals = generateLunch(Math.round(targetCalories * 0.35), diet, allergies);
    addMealWithHeader(dayDiv, lunchMeals, "Обед");
    lunchMeals.forEach(m => totalDailyCalories += m.calories);

    // Перекус — адаптивный
    let snackTarget = 0;
    if (goal === 'lose') {
      snackTarget = Math.round(targetCalories * 0.05); // 5%
    } else if (goal === 'maintain') {
      snackTarget = Math.round(targetCalories * 0.06); // 6%
    } else {
      snackTarget = Math.round(targetCalories * 0.07); // 7%
    }
    const snack = generateSnack(snackTarget, diet, allergies);
    addMealToDay(dayDiv, snack, "Перекус");
    if (snack) totalDailyCalories += snack.calories;

    // Полдник — для всех целей, с увеличенными лимитами
    if (goal === 'gain' || goal === 'maintain' || goal === 'lose') {
      const alreadyEaten = totalDailyCalories;
      const remaining = targetCalories - alreadyEaten;

      let polundnikTarget = 0;
      let shouldAddSnack = false;

      if (goal === 'gain') {
        if (remaining >= 300) {
          polundnikTarget = Math.max(500, Math.min(800, remaining * 0.75));
          shouldAddSnack = true;
        }
      } else if (goal === 'maintain') {
        if (remaining >= 180) {
          polundnikTarget = Math.max(200, Math.min(400, remaining * 0.65));
          shouldAddSnack = true;
        }
      } else if (goal === 'lose') {
        if (remaining >= 140) {
          polundnikTarget = Math.max(150, Math.min(300, remaining * 0.55));
          shouldAddSnack = true;
        }
      }

      if (shouldAddSnack) {
        const useSoup = goal === 'gain' && Math.random() < 0.3;
        const polundnikMeals = useSoup
          ? generateLunch(polundnikTarget, diet, allergies)
          : generateFullMeal(Math.round(polundnikTarget), diet, allergies);

        addMealWithHeader(dayDiv, polundnikMeals, "Полдник");
        polundnikMeals.forEach(m => totalDailyCalories += m.calories);
      }
    }

    // Ужин — не больше 30% от нормы
    const minDinnerCalories = Math.round(targetCalories * 0.1);
    const maxDinnerCalories = Math.round(targetCalories * 0.3);
    const remainingForDinner = Math.min(
      maxDinnerCalories,
      Math.max(minDinnerCalories, targetCalories - totalDailyCalories)
    );
    const dinnerMeals = generateDinner(remainingForDinner, diet, allergies);
    addMealWithHeader(dayDiv, dinnerMeals, "Ужин");
    dinnerMeals.forEach(m => totalDailyCalories += m.calories);

    // Итог
    const summary = document.createElement('div');
    summary.className = 'summary';
    const diff = Math.abs(totalDailyCalories - targetCalories);
    summary.classList.add(diff <= 50 ? 'good' : 'bad');
    summary.textContent = `Итого: ${totalDailyCalories} ккал (цель: ${targetCalories})`;
    dayDiv.appendChild(summary);

    pane.appendChild(dayDiv);
    tabContents.appendChild(pane);
  });

  mealPlanDiv.appendChild(tabsContainer);
});

// Универсальная функция переключения вкладок
function setActiveTab(activeButton, tabButtons, tabContents) {
  // Обновляем кнопки
  tabButtons.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-selected', 'false');
  });
  activeButton.classList.add('active');
  activeButton.setAttribute('aria-selected', 'true');

  // Обновляем панели
  tabContents.querySelectorAll('.tab-pane').forEach(pane => {
    pane.style.display = 'none';
  });
  const targetId = activeButton.dataset.day;
  document.getElementById(`day-${targetId}`).style.display = 'block';
}

// UI-функции
function createMealItem(meal) {
  const item = document.createElement('div');
  item.className = 'meal-item';
  item.innerHTML = `
    <div style="
      width: 64px;
      height: 64px;
      background: #f1f5f9;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      border: 1px solid var(--border);
      flex-shrink: 0;
    ">
      ${getEmojiForTitle(meal.title)}
    </div>
    <div class="meal-info">
      <h4>${meal.title}</h4>
      <p><span class="calories">${meal.calories} ккал</span> &bull; ${meal.weight} г</p>
    </div>
  `;
  return item;
}

function addMealToDay(dayDiv, meal, header) {
  if (!meal) return;
  const container = document.createElement('div');
  container.innerHTML = `<div class="meal-header">${header}</div>`;
  container.appendChild(createMealItem(meal));
  dayDiv.appendChild(container);
}

function addMealWithHeader(dayDiv, meals, header) {
  const container = document.createElement('div');
  container.innerHTML = `<div class="meal-header">${header}</div>`;
  meals.forEach(meal => container.appendChild(createMealItem(meal)));
  dayDiv.appendChild(container);
}

// Сброс формы
document.getElementById('nutritionForm').addEventListener('reset', function() {
  const resultDiv = document.getElementById('result');
  resultDiv.style.display = 'none';
});