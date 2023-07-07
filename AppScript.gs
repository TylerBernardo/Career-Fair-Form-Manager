//Tyler Bernardo, October 2022

//stores different sessions. Dynamicly filled during runtime
class Classes {
  constructor(){

  }
}

//Stores information about a single student
class Student {
  constructor(name,grade,choices) { // class constructor
    this.name = name;
    this.grade = grade
    //their response to the form. In order from most desirable to least desirable
    this.choices = choices;
    //the classes they have been assigned to
    this.classes = []
  }
}

//stores info about a single class
class Class {
  constructor(name, maxSize,sessionNum, roomNumber) { // class constructor
    this.name = name;
    this.maxSize = maxSize;
    this.currentSize = maxSize;
    this.students = [];
    this.sessionNum = sessionNum;
    this.roomNumber = roomNumber;
  }
  //takes in a student object and adds that student to this class
  addStudent(student){
    this.currentSize--
    this.students.push(student)
    student.classes.push(this)
  }
}

const CLASS_SIZE = 30;
var classes = new Classes()
classes["Lunch"] = new Array(8)
classes["Lunch"][4] = new Class("Lunch", 1000, 5, "Lunch Room")
classes["Lunch"][5] = new Class("Lunch", 1000, 6, "Lunch Room")

function fillClassData(){
  var refSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet2");
  //console.log(refSheet)
  var rows = refSheet.getDataRange().getValues();
  var sesionTimes = rows[1]
  classes._names = []
  for(var x = 2; x < rows.length;x++){
    row = rows[x]
    for(var col = 1; col < row.length; col++){
      if(row[col] == ""){
        continue
      }
      if(!classes._names.includes(row[col])){
        classes._names.push(row[col])
      }
      //console.log(col)
      if(classes[row[col]] == undefined){
        classes[row[col]] = new Array(8)
      }
      classes[row[col]][col-1] = new Class(row[col],30,col,row[0])
    }
  }
  console.log(classes._names)
}

//-------------
//Args:
//none
//Creates Student objects from form data
//returns:
//Student[] - unsorted array of students without classes attached to them
//-------------
function collectData(){
  var done = []
  var sheet = SpreadsheetApp.getActiveSheet()
  var rows = sheet.getDataRange().getValues();
  //get response categories
  var names = rows[0]
  const exclude = ["First and Last Name","Grade Level","","Room #", "Email Address"]
  //index of where the choices appear
  var choicesIndex = []
  //stores index of name and grade. [0] = name, [1] = age
  var infoIndex = [null,null]
  //assumes first choice is first to appear, second choice is second to appear, etc
  for(var i = 1; i < names.length; i++){
    if(!exclude.includes(names[i])){
      choicesIndex.push(i)
    }else{
      if(names[i] == "First and Last Name"){
        infoIndex[0] = i;
      }else if(names[i] == "Grade Level"){
        infoIndex[1] = i;
      }
    }
  }
  
  var output = []
  for(var i = 1; i < rows.length; i++){
    //console.log(rows[i])
    if(rows[i][1] == "" || done.includes(rows[i][infoIndex[0]].toLowerCase().replace("."," ").replace("  ", " "))){
      if(done.includes(rows[i][infoIndex[0]].toLowerCase())){
        console.log("duplicate")
      }
      continue
    }
    var toSelectFrom = []
    for(_class of classes._names){
      // if class is empy
      toSelectFrom.push(_class)
    }
    var student = new Student(rows[i][infoIndex[0]].replace("."," ").replace("  ", " "), rows[i][infoIndex[1]],[])
    for(var n = 0; n < choicesIndex.length; n++){
      //console.log(rows[i][choicesIndex[n]].split(' "')[0])
      //hotfix for typo on form
      if(n == choicesIndex.length - 1 && rows[i][choicesIndex[n]].split(' "')[0] == "Surveyors"){
        if(student.choices.includes("Land Surveying")){
          student.choices.push(null)
        }else{
           student.choices.push("Land Surveying")
        }
        //errorMark = false
      }else{
        //check if class is duplicate
        if(student.choices.includes(rows[i][choicesIndex[n]].split(' "')[0])){
          student.choices.push(null)
        }else if(rows[i][choicesIndex[n]] == ""){
          var ranIndex = Math.round(Math.random() * (toSelectFrom.length - 1))
          student.choices.push = toSelectFrom[ranIndex]
          toSelectFrom.splice(ranIndex,1)
        } else {
           student.choices.push(rows[i][choicesIndex[n]].split(' "')[0])
        }
        
      }
    }
    //handle duplicate classes
    var selected = []
    for(_class of student.choices){
      if(_class != null){
        selected.push(_class)
      }
    }
    if(selected.length != student.choices.length){
      var toSelectFrom = []
      for(_class of classes._names){
        if(!selected.includes(_class)){
          toSelectFrom.push(_class)
        }
      }

      for(_class in student.choices){
        if(student.choices[_class] == null){
          var ranIndex = Math.round(Math.random() * (toSelectFrom.length - 1))
          student.choices[_class] = toSelectFrom[ranIndex]
          toSelectFrom.splice(ranIndex,1)
        }
      }
    }
    
    output.push(student);
    done.push(student.name.toLowerCase().replace("."," "))
  }
  //iterate over rows until empty row
  //  get info
  //  make person object using info
  //  push to list of people
  //return list of people
  //console.log(done)
  return output
}

//-------------
//Args:
//String grade
//Converts a student's grade to a number for use in sorting
//returns:
//Int - student's grade number
//-------------
//todo: write better logic for middle school students
function gradeToNum(grade){
  switch(grade){
    case "Freshman":
      return 9;
    case "Sophomore":
      return 10;
    case "Junior":
      return 11;
    case "Senior":
      return 12
    case "8th Grade":
      return 8
    case "7th Grade":
      return 7
    case "6th Grade":
      return 6
  }
}

//-------------
//Args:
//Student a
//Student b
//Determines which student has senority over the other
//returns:
//Int - 0 if equal senority, -1 if student a is senior, 1 if student b is senior
//-------------
function compareStudents(a,b){
  if(a.grade == b.grade){
    return 0;
  }
  if(gradeToNum(a.grade) > gradeToNum(b.grade)){
    return -1
  }else{
    return 1
  }
}

function makeStudentPicks(student){
  //zoey hartsell, 8th grade, Tessaleigh Putnam 7th grade (ALL 12 ARE THE SAME), Emma Berra (6th grade), jakobe mercado(6th grade ALL ARE THE SAME), scott martitz(6th grade)
  //hotfix for incorrectly filled out forms. TODO: filter these out in collect data phase
  /*if(student.name == "Jennah Kopperud" || student.name == "Dakota Hyland" || student.name == "zoeyhartsell " || student.name == "Tessaleigh Putnam" || student.name == "Emma Berra" || student.name == "Emma Berra" || student.name == "jakobe mercado" || student.name == "scott martitz"){
    return student
  }*/
    //console.log(student)
    var studentClasses = new Array(8)
    //console.log(student.choices)
    for(var i = 0; i < student.choices.length; i++){
      //console.log(student.choices[i])
      var current = classes[student.choices[i]]
      //console.log(classes)
       //console.log(current)
      //console.log(current.length)
      
      for(var n = 0; n < current.length; n++){
        //console.log(current[n])
        if(current[n] == undefined || current[n].currentSize <= 0){

        }else  if(studentClasses[n] == undefined){
          studentClasses[n] = [current[n]]
        }else {
          //console.log(studentClasses[n])
          studentClasses[n].push(current[n])
        }
      }
    }
    //check if there are 8 items
    for(a in studentClasses){
      if(studentClasses[a] == undefined){
        studentClasses[n] = []
      }
    }
    if(gradeToNum(student.grade) > 8){
      //highschool student
      studentClasses[5] = "Lunch"
    }else{
      //middleschool student
      studentClasses[4] = "Lunch"
    }
    if(student.name == "Joel.VanOrdstrand"){
      console.log("test")
    }
    //console.log(studentClasses)
    //console.log(studentClasses)
    var i = 0;
    var numDone = 0
    //attempt to fix placement. Find class with lowest count and search for it first
    while(numDone < 7){
      //console.log(student.choices[i])
      var toSearch = classes[student.choices[i]]
      //console.log(toSearch)
      //[0] = length, [1] = index
      var best = [10000000000,0,0]
      if(i >= student.choices.length){
          //no valid choices for students
          //console.log("Out of choices picking empty classes")
          var toSelectFrom = []
          for(_class of classes._names){
            // if class is empy
            if(!studentClasses.includes(_class)){
              toSelectFrom.push(_class)
            }
          }

          for(var k = 0; k < studentClasses.length; k++){
            if(typeof(studentClasses[k]) != "string"){
              var sessions = []

              for(name of toSelectFrom){
                sessions.push(classes[name][k])
              }
              sessions.sort((a, b) => b.currentSize - a.currentSize)
              studentClasses[k] = sessions[0].name
              numDone++
              toSelectFrom.splice(toSelectFrom[sessions[0].name],1)
            }
          }
         //console.log("did it work?")
        }else{
          try{
            for(var n = 0; n < toSearch.length; n++){
            //if the class is that time slot AND if that class has the least choices out of everything
            //in class lists of equal size, prefer the one whose class has the most openings. This will distribute kids better, and prevent schedule closures for later parts of schedule
            //there exist data sets that do not allow students to have full schedules depending on their picks, when students are allowed 4 flow picks
            if(typeof(studentClasses[n]) != "string"  && toSearch[n] != undefined && toSearch[n].currentSize > 0 && (studentClasses[n].length < best[0] || (studentClasses[n].length == best[0] && toSearch[n].currentSize > best[2]))){
              best[0] = studentClasses[n].length;
              best[1] = n
              best[2] = toSearch[n].currentSize
            }
          }
        }catch(e){
          console.log(student)
          console.log(studentClasses)
          throw e
        }
      }

      if(best[0] != 10000000000){
        var className = student.choices[i]
        //console.log(best[1])
        //console.log(studentClasses.length)
        for(var x = 0; x < studentClasses.length; x++){
          //console.log(studentClasses[x])
          //console.log(x)
          //console.log(length)
          //console.log(current)
          //TODO: Use while loop instead
          var y = 0
          //console.log(x,studentClasses.length,studentClasses)
          if(studentClasses[x] == undefined){
            continue;
          }
          while(y < studentClasses[x].length){
            if(y>=studentClasses[x].length){
              break
            }
            try{
              if(studentClasses[x][y].name == className){
                studentClasses[x].splice(y, 1)
                //console.log("splicing")
                y = y-1
              }
            }catch(e){
              console.log(studentClasses[x])
              console.log(numDone)
              console.log(studentClasses[x].length,y)
              //console.log(classes[student.choices[0]])
              console.log(student.choices)
              throw new Error(e)
            }
            y++
          }
        }
        numDone++
        studentClasses[best[1]] = className
      }
      i++
    }
    //console.log(classes)
    for(_class in studentClasses){
      //TODO: convert lunch into a class object for better working with everything else
      classes[studentClasses[_class]][_class].addStudent(student)
    }
    //console.log(studentClasses)
    return student
}


//-------------
//Args:
//Student[] students- unsorted array of Student objects assigned
//Uses each students form response to place them in classes. Olders students get their picks before younger ones
//returns:
//Student[] - sorted array of students with classes attached to them
//-------------
function makeClasses(students){
  students = students.sort(compareStudents) 
  //for each student
  var progress = 0
  for(student of students){
    //console.log(student.name)
    student = makeStudentPicks(student)
    progress++
    console.log(100 * progress/students.length)
  }
  return students
}

//define styles for writting to google docs
var heading = {};
heading[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT] = DocumentApp.HorizontalAlignment.CENTER;
heading[DocumentApp.Attribute.FONT_SIZE] = 15;
heading[DocumentApp.Attribute.UNDERLINE] = false;

var headingClear = {}
headingClear[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT] = DocumentApp.HorizontalAlignment.LEFT;
headingClear[DocumentApp.Attribute.FONT_SIZE] = 14;

var Name = {};
Name[DocumentApp.Attribute.UNDERLINE] = true;
Name[DocumentApp.Attribute.FONT_SIZE] = 15;


function sortStudentsLastName(a,b){
  if(a.name.split(" ")[1] == undefined){
    //sort "a" later
    return 1
  }else if(b.name.split(" ")[0] == undefined){
    //sort "b" later
    return -1
  }
  return a.name.split(" ")[1].localeCompare(b.name.split(" ")[1])
}

//-------------
//Args:
//Student[] students - sorted or unsorted array of Student objects who have classes assigned
//Takes students who have classes assigned and fills out a slip to be handed to them. Saves all the slips to a google doc
//Returns
//String - google doc url
//-------------
function writeToDoc(students) {
  const times = ["9:15 - 9:45",	"9:50 - 10:2",	"10:25 -10:55",	"11:00 - 11:30",	"11:35 -12:05",	"12:15 - 12:45"	,"12:50 - 1:20",	"1:25 - 1:55"]
  //https://jeffreyeverhart.com/2020/09/29/auto-fill-a-google-doc-template-from-google-sheet-data/
  var today = new Date();
  var newDoc = DocumentApp.create('Student Sheets for Career Fair ' + today.getFullYear());
  var id = newDoc.getId()
  var doc = DocumentApp.openById(id)
  //All of the content lives in the body, so we get that for editing
  var body = doc.getBody();
  //Start processing each spreadsheet row
  console.log("writing to doc")
  var i = 0;
  students = students.sort(sortStudentsLastName);
  for(student of students){
    //fill template
    try{

    
    var table = [
      ["Session","Classroom #","Time"],
      [student.classes[0].name,student.classes[0].roomNumber,times[0]],
      [student.classes[1].name,student.classes[1].roomNumber,times[1]],
      [student.classes[2].name,student.classes[2].roomNumber,times[2]],
      [student.classes[3].name,student.classes[3].roomNumber,times[3]],
      [student.classes[4].name,student.classes[4].roomNumber,times[4]],
      [student.classes[5].name,student.classes[5].roomNumber,times[5]],
      [student.classes[6].name,student.classes[6].roomNumber,times[6]],
      [student.classes[7].name,student.classes[7].roomNumber,times[7]]
    ]
    body.appendParagraph("\n__" + student.name + "__" + student.grade + "__").setAttributes(Name)
    body.appendParagraph("\nPLEASANT HILL HIGH SCHOOL’S CAREER FAIR\nNOVEMBER, 2022\n").setAttributes(heading)
    body.appendTable(table)
    body.appendPageBreak()
    i++
    if(i%100 == 0){
      doc.saveAndClose();
      doc = DocumentApp.openById(id)
      body = doc.getBody()
    }
    console.log(((i/students.length) * 100 )+ "% done")
    }catch(e){
      console.log(student)
      console.log(name)
      throw e
    }
  }
  if(i % 100 != 0){
     doc.saveAndClose();
  }
  //We make our changes permanent by saving and closing the document
 
  //Store the url of our new document in a variable
  return doc.getUrl();
}

function dataDriver(numToMake){
  const grades = [6,7,8,"Freshman", "Sophomore", "Junior","Senior"]
  var sheet = SpreadsheetApp.getActiveSheet()
  var rows = sheet.getDataRange().getValues();
  //get response categories
  var names = rows[0]
  const exclude = ["Name","Grade Level","","Room #"]
  //index of where the choices appear
  var choicesIndex = []
  //stores index of name and grade. [0] = name, [1] = age
  var infoIndex = [null,null]
  //assumes first choice is first to appear, second choice is second to appear, etc
  for(var i = 1; i < names.length; i++){
    if(!exclude.includes(names[i])){
      choicesIndex.push(i)
    }else{
      if(names[i] == "Name"){
        infoIndex[0] = i;
      }else if(names[i] == "Grade Level"){
        infoIndex[1] = i;
      }
    }
  }
  console.log(classes._names)
  console.log(classes._names.length)
  for(var i = 0; i < numToMake; i++){
    var name = "test" + i;
    var choices = classes._names.sort(() => Math.random() - 0.5).slice(0,11);
    var toAppend = new Array(row[0].length)
    toAppend[infoIndex[0]] = name
    toAppend[infoIndex[1]] = grades[Math.round(Math.random() * (grades.length-1))]
    var n = 0;
    for(index of choicesIndex){
      toAppend[index] = classes._names[n]
      n++
    }
    sheet.appendRow(toAppend);
  }
}

//create attendance sheets

function createAttendance(){
  console.log("starting attendance")
  var today = new Date();
  var newDoc = DocumentApp.create('Attendance Sheets for Career Fair ' + today.getFullYear());
  var id = newDoc.getId()
  var doc = DocumentApp.openById(id)
  //All of the content lives in the body, so we get that for editing
  var body = doc.getBody();
  //console.log(Object.keys(classes))
  var n = 0;
  for(_class of classes._names){
    for(session of classes[_class]){
      //console.log(session)
      if(session != undefined){
        if(session.currentSize == session.maxSize){
          continue;
        }
         var studentNames = session.students
         var listId = null
         body.appendParagraph(_class).setAttributes(heading)
         body.appendParagraph(" Session " + session.sessionNum).setAttributes(heading)
         for(i in studentNames){
           studentNames[i] = studentNames[i].name
           if(listId == null){
             listId = body.appendListItem(studentNames[i]).setAttributes(headingClear).setGlyphType(DocumentApp.GlyphType.BULLET);
           }else{
             body.appendListItem(studentNames[i]).setListId(listId).setGlyphType(DocumentApp.GlyphType.BULLET);
           }
           
         }
        body.appendPageBreak()
      }
    }
    n++ //
    if(n % Math.ceil(classes._names.length/4) == 0){
      console.log("saving")
      doc.saveAndClose();
      doc = DocumentApp.openById(id)
      body = doc.getBody()
    }
    console.log(((n/classes._names.length) * 100 )+ "% done")
  }
  doc.saveAndClose()
  return doc.getUrl()
}

function main(){
 fillClassData()
 console.log(writeToDoc(makeClasses(collectData())))
 console.log(createAttendance())
}
