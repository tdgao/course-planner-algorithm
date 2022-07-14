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
 *  1/2 done - implement select program front-end, display only programs within json file
 */

/** 
 * CURRENT STATUS
 *  - problem: seems that running scraper for whole program will be too slow
 *  - implentation idea: run scraper for all programs (only some for now, scale after)
 *     - keep large json file of of all stored courses
 *     - when add course, first search in json file, then use scraper
 *     - do similiarly with a large programs json file (each program should contain it's prereqs/required courses for each year)
 * 
 * CURRENT TODO
 *  - create all-courses.json and all-programs.json
 *  - implement the implementation idea
 *  - fill json files with all engineering programs, and associated courses
 *  - 
 *  - implement add course block (set data and generate div)
 *  - implement set program (adds all courses within program to associated years)
 *  - 
 *  - implement generate schedule - drag and drop, set as work term, create schedule algorithm, and more...
 */


/**  
 * INITIALIZE APP
 *  - set all global variables
 *  - create course and term blocks
 */
let coursesSessionData = null;

async function init(){
  // create term blocks
  createTermBlock(18); // 6 years of terms

  // fetch json data in all_programs.json
  // keep as constant
  // within courses of program - fetch all course datas needed from all_courses.json
  // for each course, create course block
  const PROGRAM = "Software Engineering (Bachelor of Software Engineering)"

  let coursesData = localStorage.getItem('courseSessions');
  if (coursesData !== null) coursesData = JSON.parse(coursesData);

  let allPrograms = await fetch("static/uvic-calendar-data/all-programs.json");
  allPrograms = await allPrograms.json();
  const program = allPrograms[PROGRAM];
  const programReqs = program.requirements;
  console.log(programReqs)

  
  let programCourses = await getProgramCourses(programReqs);
  console.log(programCourses);

  for( year in programCourses){
    for (course in programCourses[year]){
      createCourseBlock( programCourses[year][course], year );
    }
  }


}
init();


/**
 * gets all courses needed from program requirements, and returns array of the courses data
 * @param {*} programReqs 
 * @returns program courses data 
 */
async function getProgramCourses(programReqs){
  let allCourseData = await fetch("static/uvic-calendar-data/all-courses.json");
  allCourseData = await allCourseData.json();

  let programCoursesList = {}
  for (year in programReqs){
    programCoursesList[year] = getDeepValues(programReqs[year]);
  }
  
  let programCourses = {};
  for (year in programCoursesList){
    programCourses[year] = {};
    programCoursesList[year].forEach(course => {
      const courseData = allCourseData[course]
      if (courseData === undefined){ console.warn("could not find course in all-courses.json") }
      programCourses[year][course] = courseData;
    });
  }

  return programCourses
}

/**
 * returns list of courses from reqs by finding all strings in obj
 * https://stackoverflow.com/questions/42674473/get-all-keys-of-a-deep-object-in-javascript
 * @param {object} obj 
 */
 function getDeepValues(obj) {
  let values = [];
  for(let key in obj) {
      if(typeof obj[key] === "object") {
        subvalues = getDeepValues(obj[key]);
        values.push( ...subvalues );
      } else {
        values.push( obj[key] );
      }
  }
  return values;
}



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
    // console.log(termBlock)
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
  let courseData = await fetch('/get_course?course_name='+courseName);
  courseData = await courseData.json();
  // console.log(courseData);

  return courseData
}

/**
 * get, validate, and format course name from input
 * @param {element} input 
 */
function getInputCourseName(input){
  // get course name from input
  let courseName = input.value;

  // validate course name - TODO, allow only alphanumeric and dash (-)
  if (courseName === ''){
    console.warn("Empty string exception");
    return 'invalid course name';
  }

  // format course name
  courseName = courseName.replace(/\s/g, ''); //remove spaces
  courseName = courseName.toUpperCase(); //set all caps

  return courseName;
}

/**
 * add course form submit listener
 * 
 * TODO - add implementation to prevent user from spamming add course
 */
const addCourseBtn = document.querySelector('.add-course-btn');
addCourseBtn.addEventListener('click', () => addNewCourse());
async function addNewCourse(){
  console.log('running add course listener');
  // add loading text
  const statusMsg = document.createElement('span');
  statusMsg.innerText = "Loading new course."
  addCourseBtn.parentNode.appendChild(statusMsg, null);

  // get course name from input
  const courseNameInput = document.getElementById("course-name");
  const courseName = getInputCourseName(courseNameInput);
  if (courseName === "invalid course name"){
    statusMsg.remove() // remove status
    return;
  };

  // get course data
  const courseData = await getCourseData(courseName);
  console.log(courseData)

  // create and add course block

  courseNameInput.value = '';
  statusMsg.remove() // remove status
}

/**
 * create course block functions
 * 
 * dynamically generates course block html
 */
function getCourseBlockTemplate(){
  return document.getElementById('course-block-template').content.querySelector('.course-block');
}
function createCourseBlock(courseData, year){
  const courseBlock = getCourseBlockTemplate().cloneNode(true);

  // append to associated year
  const container = document.querySelector(`.all-courses-container [data-year="${year}"]`);
  container.appendChild(courseBlock);

  //set pre reqs data
  courseBlock.courseData = courseData;

  //set frontend display data
  courseBlock.querySelector('.course-title').innerText = courseData.course_name || "Unnamed course";
  courseBlock.querySelector('.course-full-title').innerText = courseData.full_title || "";
  let courseReqs = courseData.requirements
  if ( courseReqs.length !== 0) courseReqs = JSON.stringify(courseReqs);
  else courseReqs = undefined;
  courseBlock.querySelector('.course-prereqs').innerText = courseReqs || "N/A";

  addCourseBlockListeners(courseBlock)
  return courseBlock;
}

function addCourseBlockListeners(courseBlock){
  const ddBtn = courseBlock.querySelector('.dd-btn');
  ddBtn.addEventListener("click", () => {
    const ddContainer = courseBlock.querySelector('.course-block .dd-expand-container');
    const open = !ddContainer.classList.contains("hidden-none");
    closeAllCourseExpanded();
    ddContainer.classList.toggle("hidden-none", open);
  });

  const termSessionBtns = courseBlock.querySelectorAll(".section-btn");
  termSessionBtns.forEach( sessionBtn => {
    sessionBtn.addEventListener("click", () => {
      sessionBtn.dataset.selected = !(sessionBtn.dataset.selected === 'true'); // toggle selected
    });
  });
}
function closeAllCourseExpanded(){
  document.querySelectorAll('.course-block .dd-expand-container').forEach(container => {
    container.classList.add("hidden-none");
  })
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