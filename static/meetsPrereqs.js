/**
 * ASSUMPTIONS 
 *  - requirement objects always contain only one key
 *  - every object has array entrie and array entry has object vice versa
 *  - course requirements contain master bullet (1 bullet that contains all other bullets)
 *    - TODO - stated above is not true, and needs to be account for (ex. MATH101)
 * 
 * @param {Element} scheduleBlock 
 * @param {Array} completedCourses 
 * @param {Array} curTermCourses 
 * @param {Object} requirement 
 * @returns 
 */
export function meetsPrereqs(scheduleBlock, completedCourses, curTermCourses, requirement = null){
  // if (requirement === null) addAssumeCompleted(completedCourses);

  if (scheduleBlock.courseData.requirements.length === 0) return true;
  const prereqs = scheduleBlock.courseData.requirements[0];
  if (requirement === null) requirement = prereqs;

  const requirementType = Object.keys(requirement)[0] // assume one key for every object

  // console.log(requirement)
  let meets = [];

  requirement[requirementType].forEach(item => {
    // console.log(item)
    // if its another object, run recurse with type
    if ( typeof item === "object"){
      meets.push( meetsPrereqs(scheduleBlock, completedCourses, curTermCourses, item) )
    }
    // is string
    else { 
      // if can take concurrently
      if ( requirementType.split(" ").includes("concurrently") ){
        meets.push( [...completedCourses, ...curTermCourses].includes(item) );
      }
      else{
        meets.push( completedCourses.includes(item) );
      }
    }

  });

  // console.log(requirementType)
  // console.log(meets)
  if ( 
    requirementType === "Complete all of the following" || 
    requirementType === "Complete all of: " ||
    requirementType === "Completed or concurrently enrolled in all of: " ||
    requirementType === "Earn a minimum grade of C+ in each of the following: "
    // requirementType === "Complete all of the following" || //note: yet to find mentioned pattern
    ){
    return meets.includes(true) && !meets.includes(false); 
  }
  else if ( 
    requirementType === "Complete  1  of the following" || 
    requirementType === "Complete 1 of: " ||
    requirementType === "Completed or concurrently enrolled in 1 of: "
    ){
    return meets.includes(true); 
  }
  else {
    console.warn("not accounting for the following requirement type: ", requirementType, meets, requirement);
  }

}

export function addAssumeCompleted(completed){
  const assumeCompleted = [
    'Foundations of Math 12',
    'Mathematics 12',
    'Pre-Calculus 12',
    'Completed Pre-Calculus 12 or Principles of Mathematics 12  with a minimum grade of B (73%) ',
  ];
  completed.push(...assumeCompleted);
}