class Course {
  constructor(name, termSessionOffering, prereqs, courseTakenOn, takeCourse){
    this.name = name;
  }

  testMethod1(test){
    console.log('running test method', test);
  }
}



// INITIALIZE //

let courses = fetchCourses();
let addedCourses = [];

async function init(){
  // create term blocks
  cr_termBlock(17);

  // fill courses
  fillCourses();
}
init();

// INITIALIZE END //

async function fetchCourses(){
  const res = await fetch('courses.json');
  const courses = await res.json();

  console.log(courses);
  return courses;
}
fetchCourses();


function fillCourses(){
  document.querySelectorAll('.term-block').forEach(term =>{
    // term 


  });
}





// Generate term blocks and set data on init //

function cr_termBlock(num_termBlocks = null){
  if (num_termBlocks === null) num_termBlocks = 1;
  
  const termBlock = document.querySelector('.term-block');
  
  for (let i = 0; i < num_termBlocks; i++){ 
    const termBlockClone = termBlock.cloneNode(true);
    setTermBlockData(termBlockClone);

    // add term block to it's year container
    const termYear = termBlockClone.getAttribute('data-year');
    const container = document.querySelector(`.year-container[data-year='${termYear}']`)
    container.appendChild(termBlockClone);
  }
}


function setTermBlockData(termBlock){
  const termNumber = parseInt(document.querySelectorAll('.term-block').length);
  
  const termSessions = ['summer', 'fall', 'spring'];
  const termSession = termSessions[termNumber % 3]; // mod returns 0, 1, 2, (term 1 returns 1, term 3 returns 0, so summer term is 0th index)
  termBlock.setAttribute('data-term-session', termSession);
  termBlock.setAttribute('data-year', parseInt(termNumber/3) + 1); // truncate num plus 1 returns term year given amount of terms

  termBlock.setAttribute('data-term-type', 'study');
  termBlock.setAttribute('data-max-course-num', '4');
}
