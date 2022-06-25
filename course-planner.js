class Course {
  constructor(name, termSessionOffering, prereqs, courseTakenOn, takeCourse){
    this.name = name;
  }

  testMethod1(test){
    console.log('running test method', test);
  }
}




/** INITIALIZE
 *   - creates all term blocks
 */
function init(){
  // create term blocks
  cr_termBlock(18); // 6 years of terms



}
init();






/** fill courses
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





// Generate term blocks and set data on init //

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


// term block attributes
// data-term-session: fall, spring, summer
// data-term-type: work, study
// data-term-number: 1, 2, .. n (study and work terms are included in the same sequence)
// data-max-course-num: 1, 2 .. n (maximum number of courses allowed in term)

function setTermBlockData(termBlock){
  const termNumber = parseInt(document.querySelectorAll('.term-block').length);
  
  const termSessions = ['summer', 'fall', 'spring'];
  const termSession = termSessions[termNumber % 3]; // mod returns 0, 1, 2, (term 1 returns 1, term 3 returns 0, so summer term is 0th index)
  termBlock.setAttribute('data-term-session', termSession);
  termBlock.setAttribute('data-year', parseInt(termNumber/3) + 1); // truncate num plus 1 returns term year given amount of terms

  termBlock.setAttribute('data-term-type', 'study');
  termBlock.setAttribute('data-max-course-num', '4');
}
