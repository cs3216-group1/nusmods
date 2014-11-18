'use strict';

var localforage = require('localforage');

module.exports = {
  getLessonType: function (fullLessonType) {  
    var lessonTypeCode = fullLessonType.substr(0, 3);
    if (fullLessonType === "TUTORIAL TYPE 2") {
      lessonTypeCode="TUT2"; 
    } else if (fullLessonType === "TUTORIAL TYPE 3") {
      lessonTypeCode="TUT3"; 
    } else if (fullLessonType === "DESIGN LECTURE") {
      lessonTypeCode="DLEC"; 
    } else if (fullLessonType === "PACKAGED LECTURE") {
      lessonTypeCode="PLEC"; 
    } else if (fullLessonType === "PACKAGED TUTORIAL") {
      lessonTypeCode="PTUT"; 
    }
    return lessonTypeCode;
  },
  generateNusmodsLink: function (timetable_json, callback) {
    var lesson = {};
    var result = '';
    for (var i = 0; i < timetable_json.length; ++i) {
      if (timetable_json[i].hasOwnProperty('ModuleCode') && 
          timetable_json[i].hasOwnProperty('LessonType') && 
          timetable_json[i].hasOwnProperty('ClassNo')) {   
        var lessonTypeCode = this.getLessonType(timetable_json[i].LessonType.toUpperCase());
        var x = timetable_json[i].ModuleCode + lessonTypeCode;
        var y = timetable_json[i].ModuleCode + '[' + lessonTypeCode + ']=' + timetable_json[i].ClassNo + '&';
        lesson[x] = y;
      } else {
        callback(true);
        return;
      }
    }
    for (var key in lesson) {
      result = result.concat(lesson[key]);
    }
    result = result.substr(0, result.length - 1);
    callback(false, result);
  }
};
