import './styles/style.scss';
import { GradeGroup, Grade, Semester } from './classes.js';


/** adding a grade field to the form */
const courseListElement = document.querySelector<HTMLDivElement>("[data-course-list]")!;
const addGradeBtn = document.querySelector<HTMLButtonElement>("[data-btn-grade]")!;
const calcGradeBtn = document.querySelector<HTMLButtonElement>("[data-btn-calculate]")!;

addGradeBtn.addEventListener("click", () => {
  const formField = addGradeFormField();
  courseListElement.append(formField);
});

function addGradeFormField(grade?: GradeGroup): HTMLDivElement {
  // each form field has three inputs; course, unit and score.
  const inputFields = [ 'course', 'score', 'unit' ];
  const gradeInputEl = document.createElement('div');
  gradeInputEl.className = 'grade';

  let inputFieldElements: HTMLDivElement[] = [];
  inputFields.forEach(field => {
    const fieldGroupEl = document.createElement('div');
    fieldGroupEl.className = 'form-group';
    if (field === 'score') fieldGroupEl.classList.add('form-group--one');
    if (field === 'unit') fieldGroupEl.classList.add('form-group--two');

    const fieldGroupHeaderEl = document.createElement('h4');
    fieldGroupHeaderEl.className = 'form-group__title';
    fieldGroupHeaderEl.innerText = `${field}:`;

    const fieldInputWrapEl = document.createElement('div');
    fieldInputWrapEl.classList.add('wrap');
    fieldInputWrapEl.classList.add('wrap--input');

    const fieldInputEl = document.createElement('input');
    fieldInputEl.dataset[field] = 'true';

    // set values for input fields if grade object available
    if (grade) {
      fieldInputEl.value = <string>grade[field];
      fieldInputEl.setAttribute('disabled', 'true');
    } else fieldInputEl.setAttribute('required', 'true');

    // input fields depending on field type
    if (field === 'course') fieldInputEl.type = 'text';
    else {
      fieldInputEl.min = '0';
      fieldInputEl.max = '100';
      fieldInputEl.type = 'number';
    };

    fieldInputWrapEl.append(fieldInputEl);
    fieldGroupEl.append(fieldGroupHeaderEl, fieldInputWrapEl);
    inputFieldElements.push(fieldGroupEl);
  })

  const flexWrapEl = document.createElement('div');
  flexWrapEl.className = 'grade__info';
  flexWrapEl.append(inputFieldElements[1], inputFieldElements[2]);
  gradeInputEl.append(inputFieldElements[0], flexWrapEl);

  return gradeInputEl;
};


/** calculate gpa */
const gradeForm = document.querySelector<HTMLFormElement>("[data-grade-form]")!;
const partSelect = document.querySelector<HTMLSelectElement>("[data-part]")!;
const semesterSelect = document.querySelector<HTMLSelectElement>("[data-semester]")!;

function calculateGPA(gradePoints: Array<number>, allUnits: Array<number>): number {
    // add grade points and divide by total no of units
  const totalGradePoints = gradePoints.reduce((a, b) => a + b, 0);
  const totalUnits = allUnits.reduce((a, b) => a + b, 0);
  const gpa = totalGradePoints / totalUnits;

  return Number(gpa.toFixed(2));
};

gradeForm.addEventListener("submit", (e: SubmitEvent) => {
  e.preventDefault();

  // get list of all courses, units, scores where the indexes coresponds
  const coursesList = [...document.querySelectorAll<HTMLInputElement>("[data-course=true]")].map(input => input.value);
  const unitsList = [...document.querySelectorAll<HTMLInputElement>("[data-unit=true]")].map(input => input.valueAsNumber);
  const scoresList = [...document.querySelectorAll<HTMLInputElement>("[data-score=true]")].map(input => input.valueAsNumber);

  // check if there's already grade information existing for the same part and semester
  const allSemesters: Array<Semester> = JSON.parse(localStorage.getItem("semesters") || '[]');
  const semesterAlreadyExists = allSemesters.some(semesterItem => semesterItem.part === partSelect.value && semesterItem.semester === semesterSelect.value);

  if (!semesterAlreadyExists) {
    // calculate gpa
    const gradesList: Array<Grade> = [];
    coursesList.forEach((course, index) => {
      let gradeParamsTuple: [string, number, number];
      gradeParamsTuple = [course.toLowerCase(), unitsList[index], scoresList[index]];

      let gradeObj = new Grade(...gradeParamsTuple);
      gradesList.push(gradeObj);
    });
    const totalGradePoints = gradesList.map(grade => grade.gradeTotal);
    const gpa = calculateGPA(totalGradePoints, unitsList);

    
    // create semester object
    let semesterParamsTuple: [string, 'first' | 'second', number, Array<Grade>];
    semesterParamsTuple = [partSelect.value, <'first' | 'second'>semesterSelect.value, gpa, gradesList];
    const semesterObj = new Semester(...semesterParamsTuple);

    // save semester object to local storage
    allSemesters.push(semesterObj);
    localStorage.setItem("semesters", JSON.stringify(allSemesters));

    // calculate cummulative gpa and set student object
    setStudentDetails();

    // close the modal
    toggleVisible();

    // update page with new content
    displayMainContent();
  } else {
    /** @todo: display some kind of warning on the ui that semester already exists */
    window.alert(`there's already information for part ${partSelect.value}, ${semesterSelect.value} semester.`)
  };
});


/** get student info, calculate cummulative gpa */
function setStudentDetails(): void {
  const allSemesters: Array<Semester> = JSON.parse(localStorage.getItem("semesters") || '[]');
  const semesterExists = Boolean(allSemesters.length);

  // check for student profile object or create a new object if it doesn't exist
  const studentProfile: { cgpa: number, honours: string } = JSON.parse(localStorage.getItem("student") || '{}');

  if (semesterExists) {
    const gradesList = allSemesters.map(semester => semester.grades);

    let cummulativeGradePoints: Array<number> = [];
    let cummulativeUnits: Array<number> = [];

    gradesList.forEach(gradeArray => {
      let semesterGradesList: Array<Grade> = [];

      gradeArray.forEach(grade => {
        let gradeParamsTuple: [string, number, number];
        gradeParamsTuple = [grade.course, grade.unit, grade.score];
    
        let gradeObj = new Grade(...gradeParamsTuple);
        semesterGradesList.push(gradeObj);
      });

      cummulativeGradePoints.push(...semesterGradesList.map(gr => gr.gradeTotal));
      cummulativeUnits.push(...semesterGradesList.map(gr => gr.unit));
    });
    
    const cgpa = calculateGPA(cummulativeGradePoints, cummulativeUnits);

    let hons: string;
    if (cgpa > 4.5) hons = "first class 🏆";
    else if (cgpa > 3.49 && cgpa < 4.5) hons = "second class upper 💪🏾";
    else if (cgpa > 2.39 && cgpa < 3.5) hons = "second class lower 🤞🏾";
    else if (cgpa > 1.49 && cgpa < 2.4) hons = "third class 😬";
    else if (cgpa > 0.9 && cgpa < 1.5) hons = "pass 🤡";
    else hons = "no way 💀";

    studentProfile.cgpa = cgpa;
    studentProfile.honours = hons;
  } else {
    studentProfile.cgpa = 0;
    studentProfile.honours = '——'
  };

  localStorage.setItem("student", JSON.stringify(studentProfile));
};


/** displaying semester tiles  */
const mainContentEl = document.querySelector<HTMLDivElement>('[data-main-content]')!;

function displaySemesterInfo(semesterArg: Semester): void {
  // create and display tile element
  const tileEl = document.createElement('div');  
  tileEl.className = "tile";

  const tileImgEl = document.createElement('div');
  const tileIconSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <g stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">
      <path d="M22 10v5c0 5-2 7-7 7H9c-5 0-7-2-7-7V9c0-5 2-7 7-7h5"/>
      <path d="M22 10h-4c-3 0-4-1-4-4V2l8 8ZM7 13h6M7 17h4" opacity=".75"/>
    </g>
  </svg>
  `;
  tileImgEl.className = "tile__img";
  tileImgEl.innerHTML = tileIconSvg;

  const tileDetailsEl = document.createElement('div');
  tileDetailsEl.className = "tile__details";
  const tileDetailsWrapEl = document.createElement('div');
 
  const tileBtnWrapEl = document.createElement('div');
  tileBtnWrapEl.className = "tile__btn";

  const tileBtnEl = document.createElement('button');
  tileBtnEl.classList.add("btn");
  tileBtnEl.classList.add("btn--close");
  tileBtnEl.type = "button";

  const tileBtnTextEl = document.createElement('span');
  tileBtnTextEl.innerText = "delete";

  const tileBtnIconEl = document.createElement('span');
  const tileBtnIconSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h8m-4-4v8m9-4a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
    </svg>
  `;
  tileBtnIconEl.className = "btn__icon";
  tileBtnIconEl.innerHTML = tileBtnIconSvg;

  const tileSemesterEl = document.createElement('h4');
  tileSemesterEl.innerText = `part ${semesterArg.part.toUpperCase()}, ${semesterArg.semester} semester`;

  const tileGpaEl = document.createElement('p');
  tileGpaEl.innerText = `GPA: ${semesterArg.gpa.toFixed(2)}`;

  tileBtnEl.append(tileBtnTextEl);
  tileBtnEl.append(tileBtnIconEl);
  tileBtnWrapEl.append(tileBtnEl);
  tileDetailsWrapEl.append(tileSemesterEl);
  tileDetailsWrapEl.append(tileBtnWrapEl);
  tileDetailsEl.append(tileDetailsWrapEl);
  tileDetailsEl.append(tileGpaEl);
  tileEl.append(tileImgEl);
  tileEl.append(tileDetailsEl);

  // add delete functionality to the clear button;
  tileBtnEl.addEventListener("click", () => {
    deleteSemester(semesterArg);

    // update page with new content
    displayMainContent();
  });

  // view semester courses and grades functionality
  tileSemesterEl.addEventListener("click", () => {
    // open semester grades form modal
    toggleVisible();
    openSemesterGrades(semesterArg);
  });

  mainContentEl.appendChild(tileEl);
};


/** opening and closing the semester grades form */
const semesterBtn = document.querySelector<HTMLButtonElement>("[data-btn-semester]")!;
const closeModalBtn = document.querySelector<HTMLButtonElement>("[data-btn-close]")!;
const mainEl = document.querySelector<HTMLDivElement>("[data-main]")!;
const modalContentEl = document.querySelector<HTMLDivElement>("[data-modal]")!;

// toggle open/close classe on modal 
function toggleVisible(): void {
  // resets
  partSelect.value = "I";
  partSelect.removeAttribute("disabled");
  partSelect.parentElement!.classList.remove('wrap--disabled');

  semesterSelect.value = "first";
  semesterSelect.removeAttribute("disabled");
  semesterSelect.parentElement!.classList.remove('wrap--disabled');

  addGradeBtn.removeAttribute("disabled");
  calcGradeBtn.removeAttribute("disabled");
  
  courseListElement.innerHTML = addGradeFormField().outerHTML;

  // close / open modal
  mainEl.classList.toggle('main--blur');
  modalContentEl.classList.toggle('modal--visible');
};

// open modal
semesterBtn.addEventListener("click", toggleVisible);

// close modal
modalContentEl.addEventListener("click", (e: Event) => {
  if (e.target === e.currentTarget) toggleVisible();
});

window.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.key.toLowerCase() === 'escape') {
    const isModalVisible =  modalContentEl.classList.contains('modal--visible');
    if (isModalVisible) toggleVisible();
  };
});

// open/close modal with the close button
closeModalBtn.addEventListener("click", toggleVisible);


/** kickstarting the app with available data */
document.addEventListener("DOMContentLoaded", displayMainContent);

function displayMainContent(): void {
  // create and display student tile element
  let studentProfile: { cgpa: number, honours: string } = JSON.parse(localStorage.getItem("student")!);
  
  if (!studentProfile) {
    setStudentDetails();
    studentProfile = JSON.parse(localStorage.getItem("student")!);
  };

  const tileEl = document.createElement('div');  
  tileEl.className = "tile";

  const tileImgEl = document.createElement('div');
  const tileIconSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <g stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">
        <path d="M12.12 12.78a.963.963 0 0 0-.24 0 3.269 3.269 0 0 1-3.16-3.27c0-1.81 1.46-3.28 3.28-3.28a3.276 3.276 0 0 1 .12 6.55Z" opacity=".5"/>
        <path d="M18.74 19.38A9.934 9.934 0 0 1 12 22c-2.6 0-4.96-.99-6.74-2.62.1-.94.7-1.86 1.77-2.58 2.74-1.82 7.22-1.82 9.94 0 1.07.72 1.67 1.64 1.77 2.58Z" opacity=".5"/>
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z"/>
      </g>
    </svg>
  `;
  tileImgEl.className = "tile__img";
  tileImgEl.innerHTML = tileIconSvg;

  const tileDetailsEl = document.createElement('div');
  tileDetailsEl.className = "tile__details";

  const tileDetailsTitleEl = document.createElement('h3');
  tileDetailsTitleEl.innerText = "student";

  const tileCgpaEl = document.createElement('p');
  const tileCgpaTextEl = document.createElement('b');
  tileCgpaTextEl.innerText = `${studentProfile.cgpa.toFixed(2)}`
  tileCgpaEl.innerHTML = `cummulative GPA: ${tileCgpaTextEl.outerHTML}`;

  const tileHonsEl = document.createElement('p');
  const tileHonsTextEl = document.createElement('b');
  tileHonsTextEl.innerText = `${studentProfile.honours}`
  tileHonsEl.innerHTML = `honours: ${tileHonsTextEl.outerHTML}`;

  tileDetailsEl.append(tileDetailsTitleEl);
  tileDetailsEl.append(tileCgpaEl);
  tileDetailsEl.append(tileHonsEl);
  tileEl.append(tileImgEl);
  tileEl.append(tileDetailsEl);

  mainContentEl.innerHTML = "";
  mainContentEl.appendChild(tileEl);

  // display semester tiles
  const allSemesters: Array<Semester> = JSON.parse(localStorage.getItem("semesters")!);
  if (allSemesters) allSemesters.forEach(semester => displaySemesterInfo(semester));
};


/** delete semester information */
function deleteSemester(semester: Semester): void {
  const allSemesters: Array<Semester> = JSON.parse(localStorage.getItem("semesters")!);
  const selectedSemesterIndex = allSemesters.findIndex(semesterItem => semesterItem.part === semester.part && semesterItem.semester === semester.semester);
  allSemesters.splice(selectedSemesterIndex, 1);
  localStorage.setItem("semesters", JSON.stringify(allSemesters));
  setStudentDetails();
};


/** clear all app data */
const clearBtn = document.querySelector<HTMLButtonElement>("[data-btn-clear]")!;

function clearApp(): void {
  localStorage.clear();
  displayMainContent();
};

clearBtn.addEventListener("click", clearApp);


/** view semester courses and grades */
function openSemesterGrades(semesterObj: Semester): void {
  // set part and semester values and disable the input values
  partSelect.value = semesterObj.part;
  partSelect.setAttribute("disabled", "true");
  partSelect.parentElement!.classList.add('wrap--disabled');

  semesterSelect.value = semesterObj.semester;
  semesterSelect.setAttribute("disabled", "true");
  semesterSelect.parentElement!.classList.add('wrap--disabled');
  
  // show all grades avaiable    
  courseListElement.innerHTML = "";

  semesterObj.grades.forEach(grade => {
    const gradeElement = addGradeFormField(grade);
    courseListElement.appendChild(gradeElement);
  });

  // disable calculate and add grade buttons
  addGradeBtn.setAttribute("disabled", "true");
  calcGradeBtn.setAttribute("disabled", "true");
};