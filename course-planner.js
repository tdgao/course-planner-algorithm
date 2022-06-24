class Course {
  constructor(name, termSessionOffering, prereqs, courseTakenOn, takeCourse){
    this.name = name;
  }
}

const course = new Course('myName');
console.log(course.name);


// INITIALIZE //

let courses = fetchCourses();
let addedCourses = [];

async function init(){
  // create term blocks
  cr_termBlock(20);

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


function cr_termBlock(num_termBlocks = null){
  if (num_termBlocks === null) num_termBlocks = 1;
  
  const termBlock = document.querySelector('.term-block');
  
  for (let i = 0; i < num_termBlocks; i++){ 
    const termBlockClone = termBlock.cloneNode(true);
    document.body.appendChild(termBlockClone);
  }
}


function setTermBlockData(termBlock){
  const termNumber = parseInt(document.querySelectorAll('.term-block').length);
  
  const termSessions = ['summer', 'fall', 'spring'];
  const termSession = termSessions[termNumber % 3]; // mod returns 0, 1, 2, (term 1 returns 1, term 3 returns 0, so summer term is 0th index)
  termBlock.setAttribute('data-term-session', toString(termSession));

  termBlock.setAttribute('data-term-type', 'study');
  termBlock.setAttribute('data-max-course-num', '4');
}
