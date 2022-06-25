class Course {
  constructor(form){
    this.testMethod1('testing call from constructor')

    // name
    let name = form.querySelector('#course-name').value
    if (name.length === 0) name = 'Unnamed Course';
    this.name = name;

    // courseTakenOn
    const selectInput = form.querySelector('#course-taken-on');
    this.setCourseTakenOn(selectInput);

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

    let concurrent = form.querySelector('#complete').value;
    concurrent = concurrent.split(",");
    concurrent = concurrent.map(str => {return str.trim()});

    this.prereqs = {
      'complete': complete,
      'concurrentlyEnrolled': concurrent,
    }


    //name, termSessionOffering, prereqs, courseTakenOn, takeCourse
  }

  testMethod1(test){
    console.log('running test method', test);
  }

  setCourseTakenOn(selectInput){
    const selectedOption = selectInput.selectedOptions[0]; // assume only one option selected
    this.courseTakenOn = {
      'selected': selectInput.value,
      'year': selectedOption.getAttribute('data-year'),
      'termSession': selectedOption.getAttribute('data-term-session'),
    }
  }
}


/** 
 *  INITIALIZE - creates all term blocks
 */
function init(){
  // create term blocks
  createTermBlock(18); // 6 years of terms


  autoExpandTextareas()
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
function fillCourses(){

}





/**
 * Generate term blocks and set data on init
 * 
 * @param {number} num_termBlocks 
 */

function createTermBlock(num_termBlocks = null){
  if (num_termBlocks === null) num_termBlocks = 1;
  

  
  for (let i = 0; i < num_termBlocks; i++){ 
    // create new term block
    const termBlock = document.createElement('div');
    termBlock.classList.add('term-block')
    setTermBlockData(termBlock);

    // add term block to it's year container
    const termYear = termBlock.getAttribute('data-year');
    const container = document.querySelector(`.year-container[data-year='${termYear}'] .term-block-container`)
    container.appendChild(termBlock);
  }
}


/**
 * set term block attributes
 * 
 * data-term-session: fall, spring, summer
 * data-term-type: work, study
 * data-term-number: 1, 2, .. n (study and work terms are included in the same sequence)
 * data-max-course-num: 1, 2 .. n (maximum number of courses allowed in term)
 * 
 * @param {object} termBlock 
 */

function setTermBlockData(termBlock){
  const termNumber = parseInt(document.querySelectorAll('.term-block').length);
  
  const termSessions = ['summer', 'fall', 'spring'];
  const termSession = termSessions[termNumber % 3]; // mod returns 0, 1, 2, (term 1 returns 1, term 3 returns 0, so summer term is 0th index)
  termBlock.setAttribute('data-term-session', termSession);
  termBlock.setAttribute('data-year', parseInt(termNumber/3) + 1); // truncate num plus 1 returns term year given amount of terms

  termBlock.setAttribute('data-term-type', 'study');
  termBlock.setAttribute('data-max-course-num', '4');
}


// Event Listeners // 

/**
 * submit form listener
 * 
 * gets form data from element, creates and adds new course object and element
 */
const form = document.querySelector('#myform');
form.addEventListener( 'submit', (e) => {
  e.preventDefault();

  // get data
  const form = e.target
  const courseData = new Course(form);
  console.log(courseData);

  // TODO
  // keep global array of all courses, objects in array must always match with courses on screen

  // create courseBlock
  const courseBlock = createCourseBlock(courseData);
  document.querySelector('.all-courses-container').appendChild(courseBlock)

  // clear form
  console.log('submitted course form');
});



/**
 * create course block functions
 * 
 * dynamically generates course block html
 */
function getCourseBlockHTML(){
  return `
  <div class="course-title"></div>
  <div class="course-input-container">
    <label for="course-taken-on">Set Term:</label>
    <select name="course-taken-on" class="course-taken-on">
      <option value="auto">Auto Schedule</option>
      <option data-year="1" data-term-session="fall">Year 1 Fall</option>
      <option data-year="1" data-term-session="fall">Year 1 Spring</option>
      <option data-year="1" data-term-session="fall">Year 1 Summer</option>
      
      <option data-year="2" data-term-session="fall">Year 2 Fall</option>
      <option data-year="2" data-term-session="fall">Year 2 Spring</option>
      <option data-year="2" data-term-session="fall">Year 2 Summer</option>

      <option data-year="3" data-term-session="fall">Year 3 Fall</option>
      <option data-year="3" data-term-session="fall">Year 3 Spring</option>
      <option data-year="3" data-term-session="fall">Year 3 Summer</option>

      <option data-year="4" data-term-session="fall">Year 4 Fall</option>
      <option data-year="4" data-term-session="fall">Year 4 Spring</option>
      <option data-year="4" data-term-session="fall">Year 4 Summer</option>

      <option data-year="5" data-term-session="fall">Year 5 Fall</option>
      <option data-year="5" data-term-session="fall">Year 5 Spring</option>
      <option data-year="5" data-term-session="fall">Year 5 Summer</option>

    </select>
  </div>
  <div class="course-input-container">
    <input type="checkbox" name="exclude-from-schedule" class="exclude-from-schedule">
    <label for="exclude-from-schedule">Exclude from schedule</label>
  </div>
  <button class="remove-course">Remove</button>
  `
}

function createCourseBlock(courseData){
  const courseBlock = document.createElement('div');
  courseBlock.classList.add('course-block')
  courseBlock.innerHTML = getCourseBlockHTML();

  courseBlock.querySelector('.course-title').innerText = courseData.name;
  courseBlock.querySelector('select').selected = courseData.selected;

  courseBlock.courseData = courseData

  // TODO
  // add listener functionality (i.e. set term, exclude from schedule, and remove course)
  // note: each will change element object
  addCourseBlockListeners(courseBlock);

  return courseBlock;
}

function addCourseBlockListeners(courseBlock){
  const select = courseBlock.querySelector('.course-taken-on');
  select.addEventListener('change', () =>{
    // course taken on has changed
    courseBlock.courseData.setCourseTakenOn(select);
  });

}






/** 
 * auto expand textarea
 * copied from https://stackoverflow.com/questions/7745741/auto-expanding-textarea
 */
function autoExpandTextareas(){
  document.querySelectorAll("textarea").forEach(textarea => {
    var heightLimit = 200; /* Maximum height: 200px */
    
    textarea.oninput = function() {
      textarea.style.height = ""; /* Reset the height*/
      textarea.style.height = Math.min(textarea.scrollHeight, heightLimit) + "px";
    };
  });
}