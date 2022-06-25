class Course {
  constructor(form){
    console.log(form)
    this.name = form.querySelector('#course-name').value;
    this.courseTakenOn = form.querySelector('#course-taken-on').value;

    const sessionOffering = [];
    form.querySelectorAll('[name="session-offering"]').forEach(session =>{
      if (session.checked) sessionOffering.push(session.value);
    });
    this.sessionOffering = sessionOffering;

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
}




/** 
 *  INITIALIZE - creates all term blocks
 */
function init(){
  // create term blocks
  cr_termBlock(18); // 6 years of terms


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

function cr_termBlock(num_termBlocks = null){
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

document.querySelector('#myform').addEventListener( 'submit', (e) => {
  e.preventDefault();

  // get data
  // create and add new course object and element
  const obj = new Course(e.target);
  console.log(obj)

  // clear form
  console.log('submitted');
});








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