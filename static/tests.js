import meetsPrereqs from "./meetsPrereqs.js";
import { createScheduleBlock } from "./course-planner.js";

function main(){
  const RUN_TESTS = true;
  
  if(!RUN_TESTS) return;
  // tests here
  testMeetsPrereqs1();
  testMeetsPrereqs2();
  testMeetsPrereqs3();
}
main();

/**
 * Prints result to console
 * @param {*} expect 
 * @param {*} actual 
 * @param {String} extraInfo 
 */
function displayResult(expect, actual, extraInfo=''){
  const passed = expect === actual;
  let result = 'Passed test';
  let color = 'white';
  if (!passed){
    result = 'Failed test';
    color = '#FF7276';
  } 

  console.log(`%cResult: ${result}. ${extraInfo}`, `color:${color}`);
}

/////////////
/// TESTS ///

function testMeetsPrereqs1(){
  console.log("%cTesting meets prereqs 1", "font-weight:bold; color: cyan");
  
  const courseData = {
    "course_name": "CSC460",
    "full_title": "CSC460 - Design and Analysis of Real-time Systems",
    "requirements": [
        {
            "Complete all of the following": [
                {
                    "Complete 1 of: ": [
                        "CSC355",
                        "CENG355",
                        "ECE355"
                    ]
                },
                {
                    "Complete all of: ": [
                        "CSC360"
                    ]
                }
            ]
        }
    ],
    "url": "https://www.uvic.ca/calendar/undergrad/index.php#/courses/view/5e50324ce9601d2500427f83",
    "units": "1.5"
  };
  const sessionOffering = ['summer','spring'];

  const scheduleBlock = createScheduleBlock(courseData, sessionOffering);
  let completedCourses, curTermCourses, meets;

  completedCourses = ['CSC355', 'CSC360'];
  curTermCourses = ['ENGR141'];
  meets = meetsPrereqs(scheduleBlock, completedCourses, curTermCourses);
  displayResult(true, meets, meets);


  completedCourses = ['CSC360'];
  curTermCourses = ['ENGR141'];
  meets = meetsPrereqs(scheduleBlock, completedCourses, curTermCourses);
  displayResult(false, meets, meets);


  completedCourses = [];
  curTermCourses = [];
  meets = meetsPrereqs(scheduleBlock, completedCourses, curTermCourses);
  displayResult(false, meets, `testing empty array + ${meets}`);

}

function testMeetsPrereqs2(){
  console.log("%cTesting meets prereqs 2", "font-weight:bold; color: cyan");

  
  const courseData = {
    "course_name": "ENGR120",
    "full_title": "ENGR120 - Design and Communication II",
    "requirements": [
        {
            "Complete all of the following": [
                {
                    "Complete  1  of the following": [
                        {
                            "Complete 1 of: ": [
                                "ENGR110",
                                "ENGR111"
                            ]
                        },
                        {
                            "Complete all of the following": [
                                {
                                    "Complete all of: ": [
                                        "ENGR112"
                                    ]
                                },
                                {
                                    "Complete 1 of: ": [
                                        "ATWP135",
                                        "ENGL135"
                                    ]
                                }
                            ]
                        },
                        {
                            "Complete all of the following": [
                                {
                                    "Complete all of: ": [
                                        "ELEC199"
                                    ]
                                },
                                {
                                    "Complete 1 of: ": [
                                        "ATWP135",
                                        "ENGL135"
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    "Complete  1  of the following": [
                        {
                            "Complete all of: ": [
                                "CSC110"
                            ]
                        },
                        {
                            "Completed or concurrently enrolled in all of: ": [
                                "CSC111"
                            ]
                        }
                    ]
                }
            ]
        }
    ],
    "url": "https://www.uvic.ca/calendar/undergrad/index.php#/courses/view/5e8bc7a86fd5672600958d67",
    "units": "2.5"
};
  const sessionOffering = ['summer','spring'];

  const scheduleBlock = createScheduleBlock(courseData, sessionOffering);
  let completedCourses, curTermCourses, meets;

  completedCourses = ['ENGR110', 'CSC110'];
  curTermCourses = [];
  meets = meetsPrereqs(scheduleBlock, completedCourses, curTermCourses);
  displayResult(true, meets, meets);


  completedCourses = ['ELEC199', 'CSC110', 'ATWP135'];
  curTermCourses = [];
  meets = meetsPrereqs(scheduleBlock, completedCourses, curTermCourses);
  displayResult(true, meets, meets);


  completedCourses = ['CSC110'];
  curTermCourses = [];
  meets = meetsPrereqs(scheduleBlock, completedCourses, curTermCourses);
  displayResult(false, meets, meets);
}



function testMeetsPrereqs3(){
  console.log("%cTesting concurrent", "font-weight:bold; color: cyan");
  
  const courseData = {
    "course_name": "ECE260",
    "full_title": "ECE260 - Continuous-Time Signals and Systems",
    "requirements": [
      {
        "Complete all of the following": [
          {
            "Complete all of: ": [
              "MATH101"
            ]
          },
          {
            "Complete  1  of the following": [
              {
                "Complete all of: ": [
                  "MATH110"
                ]
              },
              {
                "Completed or concurrently enrolled in all of: ": [
                  "MATH211"
                ]
              }
            ]
          }
        ]
      }
    ],
    "url": "https://www.uvic.ca/calendar/undergrad/index.php#/courses/view/5cbdf57867a5c324003b0c2c",
    "units": "1.5"
  };
  const sessionOffering = ['summer','spring'];

  const scheduleBlock = createScheduleBlock(courseData, sessionOffering);
  let completedCourses, curTermCourses, meets;

  completedCourses = ['MATH101', 'CSC360'];
  curTermCourses = ['MATH211', 'ENGR141'];
  meets = meetsPrereqs(scheduleBlock, completedCourses, curTermCourses);
  displayResult(true, meets, meets);


  completedCourses = ['MATH101'];
  curTermCourses = ['ENGR141'];
  meets = meetsPrereqs(scheduleBlock, completedCourses, curTermCourses);
  displayResult(false, meets, meets);

  completedCourses = [];
  curTermCourses = ['MATH211'];
  meets = meetsPrereqs(scheduleBlock, completedCourses, curTermCourses);
  displayResult(false, meets, meets);
}