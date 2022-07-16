export default function meetsPrereqs(scheduleBlock, completedCourses, curTermCourses, obj = null){
  const prereqs = scheduleBlock.courseData.requirements;
  if (obj = null) obj = prereqs;

  let booleanList = []

  for (let key in obj){
    if ( key === "Complete 1 of the following" || key === "Complete 1 of: " ){
      if (typeof obj[key] === "object"){
      // check if one of the values are met
        let metReqs = meetsPrereqs(scheduleBlock, obj);
        if ( metReqs.includes(true) ) return [true];
      }
      else {
        let metReqs = [];
        obj[key].forEach(course => {
          if ( completedCourses.includes( course ) ) metReqs.push(true);
          else metReqs.push(false);
        });
        return [metReqs.includes(true)];
      }
    }
    else if ( key === "Complete all of the following" || key === "Complete all of: " ){
      if (typeof obj[key] === "object"){
        // check if one of the values are met
        let metReqs = meetsPrereqs(scheduleBlock, obj);
        if ( metReqs.includes(false) ) return [false];
      }
      else {
        let metReqs = [];
        obj[key].forEach(course => {
          if ( completedCourses.includes( course ) ) metReqs.push(true);
          else metReqs.push(false)
        });
        return [!metReqs.includes(false)];
      }
    }
    else if ( key === "Completed or concurrently enrolled in 1 of: " ){
      if (typeof obj[key] === "object"){
        // check if one of the values are met
          let metReqs = meetsPrereqs(scheduleBlock, obj);
          if ( metReqs.includes(true) ) return [true];
        }
        else {
          let metReqs = [];
          obj[key].forEach(course => {
            if ( completedCourses.includes( course ) || curTermCourses.includes( course ) ) metReqs.push(true);
            else metReqs.push(false);
          });
          return [metReqs.includes(true)];
        }
      }
    else { console.warn("key not checked for pre req: ", key)};
  }


  return ( !booleanList.includes(false) );
}