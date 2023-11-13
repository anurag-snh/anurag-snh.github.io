const form = document.querySelector('form');
const userDay = document.querySelector('#day');
const userMonth = document.querySelector('#month');
const userYear = document.querySelector('#year');
const allInputs = document.querySelectorAll('.input');
const submitButton = document.querySelector('.submit-btn');
const totalYears = document.querySelector('[data-id="total-years"]');
const totalMonths = document.querySelector('[data-id="total-months"]');
const totalDays = document.querySelector('[data-id="total-days"]');

let invalid = false;
let currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth();
let currentDay = currentDate.getDate();

form.addEventListener('submit', formChecker);

//Remove invalid state when click a input.
allInputs.forEach((input) => {
  input.addEventListener('click', () => removeErrorOf(input));
});

function formChecker(e) {
  e.preventDefault();

  let intUserDay = parseInt(userDay.value);
  let intUserMonth = parseInt(userMonth.value);
  let intUserYear = parseInt(userYear.value);

  allInputs.forEach((input) => {
    removeErrorOf(input);
  });

  //!Empty field
  if (userDay.value.length < 1 || userMonth.value.length < 1 || userYear.value.length < 1) {

    for (let input of allInputs) {
      if (input.nextElementSibling !== null) {
        input.nextElementSibling.remove();
      };

      if (input.value.length < 1) {
        createErrorIn(input, 'This field is required');
      };
    };

    return;
  };

  //!Invalid value.
  if (intUserDay < 1 || intUserDay > 31) {
    createErrorIn(userDay, 'Must be a valid day');
  };

  if (intUserMonth < 1 || intUserMonth > 12) {
    createErrorIn(userMonth, 'Must be a valid month');
  };

  if (intUserYear > currentYear) {
    createErrorIn(userYear, 'Must be in the past');

  } else if (intUserYear < 1900) {
    createErrorIn(userYear, "You aren't that old");

  } else if (intUserYear === currentYear && intUserMonth-1 > currentMonth) {
    createErrorIn(userMonth, 'Must be in the past');

  } else if (intUserYear === currentYear && intUserMonth-1 === currentMonth && intUserDay > currentDay) {
    createErrorIn(userDay, 'Must be in the past');
  };

  if (invalid) {
    totalYears.textContent = '--';
    totalMonths.textContent = '--';
    totalDays.textContent = '--';
    return;
  };

  ageCalculator(intUserYear, intUserMonth, intUserDay);
};

function createErrorIn(field, message) {

  invalid = true;

  if (field.nextElementSibling !== null) {
    field.nextElementSibling.remove();
  };

  let errorMessage = document.createElement('p');
  errorMessage.textContent = `${message}`;
  errorMessage.classList.add('invalid');

  field.classList.add('invalid');
  field.after(errorMessage);
};

function removeErrorOf(field) {
  invalid = false;

  //Remove errorMessage
  if (field.nextElementSibling !== null) {
    field.nextElementSibling.remove();
    field.classList.remove('invalid');
  };
};

function ageCalculator(intUserYear, intUserMonth, intUserDay) {
  let dateToCheck = new Date(intUserYear, intUserMonth, 0);
  let birthOfDate = new Date(intUserYear, intUserMonth-1, intUserDay);

  console.log(birthOfDate);

  //Check if the date is valid
  if (dateToCheck.getDate() < intUserDay) {
    createErrorIn(userDay, 'Must be a valid date');
    createErrorIn(userMonth, '');
    createErrorIn(userYear, '');
    return;
  };

  let yearOfBirth = birthOfDate.getFullYear();
  let monthOfBirth = birthOfDate.getMonth();
  let dateOfBirth = birthOfDate.getDate();
  let maxDaysInMonth = 31;

  let age = currentYear - yearOfBirth;
  let months = currentMonth - monthOfBirth;
  let days = currentDay - dateOfBirth;
  let finalDay;

  if (days !== 0) {
    finalDay = maxDaysInMonth + days;
  };

  if (finalDay > maxDaysInMonth) {
    finalDay -= maxDaysInMonth;
  };

  //Ensure that the months do not give negative numbers and correct age.
  if (months < 0) {
    let monthsofYear = 12;
    months += monthsofYear;
    age -= 1;
    console.log(months);

  } else if (months === 0 && currentDay < dateOfBirth) {
    age -= 1;
  };
  
  animationOf(totalYears, age);
  animationOf(totalMonths, months);

  if (finalDay === undefined) {
    animationOf(totalDays, days);
  } else {
    animationOf(totalDays, finalDay);
  };
};

function animationOf(date, referencer) {
  let count = 0;

  let intervalID = setInterval(() => {
    date.textContent = count;
    count++

    if (count > referencer) {
      clearInterval(intervalID);
    };
  }, 150);
};