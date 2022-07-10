/*

constructor(form){
  this.testMethod1('testing call from constructor')

  // name
  let name = form.querySelector('#course-name').value
  if (name.length === 0) name = 'Unnamed Course';
  this.name = name;

  // courseTakenOn
  const selectInput = form.querySelector('#course-taken-on');
  this.courseTakenOn = setCourseTakenOn(selectInput);

  // sessionOffering
  const sessionOffering = [];
  form.querySelectorAll('[name="session-offering"]').forEach(session =>{
    if (session.checked) sessionOffering.push(session.value);
  });
  this.sessionOffering = sessionOffering;

  // pre and corequisites
  let complete = form.querySelector('#complete').value;
  complete = complete.split(",");
  complete = complete.map(str => {return str.trim()});

  let concurrent = form.querySelector('#complete-or-concurrent').value;
  concurrent = concurrent.split(",");
  concurrent = concurrent.map(str => {return str.trim()});

  this.prereqs = {
    'complete': complete,
    'concurrentlyEnrolled': concurrent,
  }

  this.excludeFromSchedule = false;
  //name, termSessionOffering, prereqs, courseTakenOn, takeCourse
}

*/


/**
 * TODO LONG TERM
 *  - implement requirements checker (based on program requirements)
 *  - implement select program (somehow either run scraper (slow), or keep all programs on file)
 *    - follow https://towardsdatascience.com/how-to-easily-run-python-scripts-on-website-inputs-d5167bd4eb4b
 */

/** 
 * INITIALIZE APP
 *  - set all global variables
 *  - create course and term blocks
 */
let ALL_COURSES = [];

function init(){
  // create term blocks
  createTermBlock(18); // 6 years of terms

  let coursesData = localStorage.getItem('coursesData');
  if (coursesData !== null) coursesData = JSON.parse(coursesData);
  if (coursesData !== null){
    console.log(coursesData)
    coursesData.forEach( courseData => {
      createCourseBlock(courseData);
    });
  }
  ALL_COURSES = coursesData;

}
init();





/** 
 * fill courses from list into schedule
 * 
 *  - fits all courses from list into schedule
 *  - considers restrictions (pre/co reqs, session offering)
 * 
 *  - first, add all courses with set schedule
 *  - then auto schedule rest: 
 *    - if excluded from schedule, do not add
 *    - add if (pre/co reqs completed, and session is offered)
 */
function generateSchedule(){

}



//////////////////////////////////
//// TERM BLOCK IMPLEMENTATION////

// TODO - implement dynamic generation for year-containers
//  - motive: can create and remove years as needed
//  - use create year on init, within create year, create 3 term blocks
//  - add functions for create and remove year, min num years is 3

/**
 * Generate term blocks and set data on init
 * 
 * @param {number} num_termBlocks 
 */
function createTermBlock(num_termBlocks = 1){  
  for (let i = 0; i < num_termBlocks; i++){ 
    // create new term block - get from html template
    const termBlockTemplate = document.getElementById('term-block-template');
    const termBlock = termBlockTemplate.content.querySelector(".term-block").cloneNode(true);

    setTermBlockData(termBlock);

    // set term-session heading
    console.log(termBlock)
    const termSession = termBlock.getAttribute('data-term-session');
    termBlock.querySelector('.term-session-heading').innerText = capitalize(termSession);

    // add term block to it's year container
    const termYear = termBlock.getAttribute('data-year');
    const container = document.querySelector(`.year-container[data-year='${termYear}'] .term-block-container`)
    container.appendChild(termBlock);
  }
}

/**
 * set term block attributes according to sequence
 * 
 * @param {object} termBlock 
 */

function setTermBlockData(termBlock){
  const termNumber = parseInt(document.querySelectorAll('.term-block').length);
  
  const termSessions = ['fall', 'spring', 'summer'];
  const termSession = termSessions[termNumber % 3]; // mod returns 0, 1, 2, (term 1 returns 1, term 3 returns 0, so summer term is 0th index)
  termBlock.setAttribute('data-term-session', termSession);
  termBlock.setAttribute('data-year', parseInt(termNumber/3) + 1); // truncate num plus 1 returns term year given amount of terms

  termBlock.setAttribute('data-term-type', 'study');
  termBlock.setAttribute('data-max-course-num', '4');
}



////////////////////////////////////
//// COURSE BLOCK IMPLEMENTATION////

/**
 * get course data through route /get_course
 *  - following https://stackoverflow.com/questions/59975596/connect-javascript-to-python-script-with-flask
 *  - returns json with detailed course title, prereqs, and url
 * 
 * @param {String} courseName (assume course name in form of BIOL307, BME250, ED-P251)
 */
async function getCourseData(courseName){
  let response = await fetch('/get_course?course_name='+courseName);
  response = await response.json();
  console.log(response);
}

/**
 * create course block functions
 * 
 * dynamically generates course block html
 */
function getCourseBlockHTML(){
  return document.getElementById('course-block-template').content.innerHTML;
}
function createCourseBlock(courseData){
  const courseBlock = document.createElement('div');
  courseBlock.classList.add('course-block');
  courseBlock.innerHTML = getCourseBlockHTML();

  // set title
  courseBlock.querySelector('.course-title').innerText = courseData.name;

  courseBlock.courseData = courseData;

  // TODO
  // add listener functionality (i.e. set term, exclude from schedule, and remove course)
  // note: each will change element object
  addCourseBlockListeners(courseBlock);

  document.querySelector('.all-courses-container').appendChild(courseBlock);
  return courseBlock;
}

function addCourseBlockListeners(courseBlock){
  const removeBtn = courseBlock.querySelector('.remove-course-btn');
  removeBtn.addEventListener('click', () => {
    // remove course obj from ALL_COURSES
    const courseDataIndex = ALL_COURSES.indexOf(courseBlock.courseData);
    ALL_COURSES.splice(courseDataIndex, 1);

    courseBlock.remove();
    saveCoursesData();
  });
}









/**
 * save all courses data to session/local storage
 */
function saveCoursesData(){
  localStorage.setItem('coursesData', JSON.stringify(ALL_COURSES) );
}


/**
 * capitalize first letter of a string
 * @param {*} str 
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}