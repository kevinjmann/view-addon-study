import StudyData from './studyData';
const tippy = require('tippy.js');
// import * as tooltips from './opentip-native.min.js';
module.exports = function(view){
  return {
    //Topics eligible for study feature (currently only supports English)
    //Order of topics is used for choosing correct one
    eligibleTopics: ['articles', 
                     'simplePast',
                     'gerunds',
                     'simPresPresProg',
                     'simPastPastProg',
                     'allSimpleVerbs',
                     'willWouldHaveHad', //Might remove this one too
                     'whoWhich',
                     'plusqVsPerf',
                     'passiveVsActiveInPast',
                     'adjCompSuperl',
                    //  'prepositions',
                     'simPastPresPerfPastProg'],
    
    performance: [],

    complexityPerformance: [0, 0, 0, 0, 0],

    compThresholds: [10, 40, 90, 160, 250],

    totalTasksToProcess: 0,

    tasksProcessed: 0,

    readMode: false,


     /**
     * Send a request to the background script to get all tasks.
     */                 
    requestToGetAllTasks: function() {
        return view.getToken().then(
          token => chrome.runtime.sendMessage({
            action: "getAllTasksForStudy",
            ajaxTimeout: view.ajaxTimeout,
            serverTaskURL: view.serverTaskURL,
            queryParam: "?token=" + token
          })
        );
    },

    requestToGetTask: function(taskId, topic, complexity) {
        return view.getToken().then(
          token => chrome.runtime.sendMessage({
            action: "getTaskPerformanceForStudy",
            ajaxTimeout: view.ajaxTimeout,
            serverTrackingURL: view.serverTrackingURL,
            queryParam: "?token=" + token + "&taskId=" + taskId,
            topic: topic,
            complexity: complexity
          })
        );
    },

    populatePerformanceData: function(performanceData, topic, complexity){
        //console.log('trying to populate performance data')
        var indexToIncrement = view.study.eligibleTopics.indexOf(topic);
        var numCorrect = 0;
        var totalTries = 0;
        var item;
        for(item in performanceData){
          if(performanceData[item]['assessment']=='EXACT_MATCH'){
            numCorrect+=1;
          }
          totalTries+=performanceData[item]['number-of-tries'];
        }
        var score = numCorrect-(totalTries-numCorrect)*0.5;
        //increment performance at the relevant complexity level
        //Incorrect guesses are heavily punishing to this score
        view.study.complexityPerformance[complexity-1] += numCorrect-(totalTries-numCorrect)*2;
        //if performance at this complexity falls below zero, just reset it back to 0.
        if(view.study.complexityPerformance[complexity-1]<0){
          view.study.complexityPerformance[complexity-1]=0;
        }
        view.study.performance[indexToIncrement]+=score;
        view.study.tasksProcessed+=1
        //console.log(view.study.tasksProcessed+' out of '+view.study.totalTasksToProcess);
        if(view.study.tasksProcessed==view.study.totalTasksToProcess){
          if(view.study.readMode){
            var readingLevel = view.study.getMaxReadingLevelIdx()+1;
            var possibleReadingLevels = [];
            console.log('max reading level is '+readingLevel);
            console.log(view.study.complexityPerformance);
            for(var i =0;i<3;i++){
              possibleReadingLevels.push(readingLevel)
            }
            if(readingLevel==1){
              possibleReadingLevels.push(readingLevel+1);
            }else if(readingLevel==5){
              possibleReadingLevels.push(readingLevel-1);
            }else{
              possibleReadingLevels.push(readingLevel-1);
              possibleReadingLevels.push(readingLevel+1);
            }
            var chosenLevel = possibleReadingLevels[Math.floor(Math.random()*possibleReadingLevels.length)];
            view.blur.remove();
            //reset global variables
            view.study.readMode=false;
            view.study.performance=[];
            view.study.complexityPerformance=[0,0,0,0,0];
            view.study.tasksProcessed=0;
            view.study.totalTasksToProcess=0;
            chrome.runtime.sendMessage({action: "openPageForReadMode", level: chosenLevel});
            
          }
          else{
            view.study.selectAppropriateTopic();

          }
          
        }
    },

    /**
     * Only looks for user performance on cloze tasks in English and in desired topics.
     * Leads to chain of actions that populates overall performance data.
     */
    getRelevantTasks: function(tasksData){
        var relevantTasks= tasksData.filter(item=>item.activity=='cloze')
                 .filter(item=>item.language=='en')
                 .filter(item=>view.study.eligibleTopics.indexOf(item.topic)>-1);
        view.study.totalTasksToProcess=relevantTasks.length;
        //if overall performance array is empty, initialize it.
        if(view.study.performance.length==0){
          var t;
          //console.log("initializing performance data");
          for(t in view.study.eligibleTopics){
            view.study.performance.push(0);
          }
          //console.log("performance data initialized");
        }
        
        
        var task;
        for(task in relevantTasks){
            var url = relevantTasks[task]['url'];
            var complexity = 1;
            if(url.startsWith("http://localhost:8000/")){
              complexity = view.study.getComplexityNumber(url[url.length-6]);
              //console.log(view.study.complexityPerformance);
            }
            view.study.requestToGetTask(relevantTasks[task]['task-id'], relevantTasks[task]['topic'], complexity);
        }
        //handle case when there are no previous exercises logged.
        if(relevantTasks.length==0){
          view.study.selectAppropriateTopic();
        }

    },
    /**
     * 
     */
    selectAppropriateTopic: function(){
        ////console.log('select appropriate topic reached');
        var totalScore = 0;
        var minTopicScore = 10;
        var minScoreForRandom = 1000;
        var i;
        for(i in view.study.performance){
          var curScore = view.study.performance[i];
          if(curScore < minTopicScore){
            var topic = view.study.eligibleTopics[i];
            view.study.selectArticleAndComplexity(topic, curScore);
            return;
          }
          totalScore+=view.study.performance[i];
        }
        if(totalScore < minScoreForRandom){
          var weakestTopicIdx=view.study.performance.indexOf(Math.min.apply(null,view.study.performance));
          var topic = view.study.eligibleTopics[weakestTopicIdx];
          //console.log('selectarticle and complexity called');
          view.study.selectArticleAndComplexity(topic, view.study.performance[weakestTopicIdx]);

          return;
        }else {
          var randomTopicIdx = view.study.getRandomIdx(view.study.performance.length);
          var randomTopic = view.study.eligibleTopics[randomTopicIdx];
          var randomTopicScore = view.study.performance[randomTopicIdx];
          //console.log('selectarticle and complexity called');
          view.study.selectArticleAndComplexity(randomTopic, randomTopicScore);
          return;
        }

    },

    selectArticleAndComplexity: function(topic, score){
      //console.log('reached here');
      var maxReadingLevel = this.getMaxReadingLevelIdx()+1; //add one to convert index to reading level on 1-5 scale
      var potentialReadingLevel=1;
      var complexScore = 0;
      //console.log('topic index is '+this.eligibleTopics.indexOf(topic));
      var topicScore = view.study.performance[this.eligibleTopics.indexOf(topic)];
      //console.log('got topic score');
      for(var i in this.complexityPerformance){
        //console.log(i);
        complexScore+=this.complexityPerformance[i]*(i+1); //compPerformance*level term
      }
      complexScore+=topicScore;
      //console.log('complexity stuff started');
      for(var i=0; i<this.compThresholds.length; i++){
        if(complexScore>this.compThresholds[i]){
          potentialReadingLevel=i+1;
        }
      }
      var readingLevel = Math.min(maxReadingLevel+1, potentialReadingLevel);
     
      view.blur.remove();
      //reset global variables:
      view.study.performance=[];
      view.study.complexityPerformance=[0,0,0,0,0];
      view.study.tasksProcessed=0;
      view.study.totalTasksToProcess=0;
     
      //tells background to open one of the suitable pages for the topic at the given reading level
      chrome.runtime.sendMessage({action:"openStudyPage", topic:topic, readingLevel:readingLevel});


      

      
    },

    getRandomIdx: function(max){
      return Math.floor(Math.random() * Math.floor(max));
    },

    getComplexityNumber: function(aChar){
      if(/[12345]/.test(aChar)){
        return parseInt(aChar);
      }
      else{
        return 1;
      }
    },

    handleTooltips: function(){
      var elems = document.getElementsByClassName('def-wrapped-31245');
      for(var i = 0; i < elems.length; i++){
        var elem = elems[i];
        var defRaw = elem.getAttribute('data');
        var defs = defRaw.split('SEPARATOR');
        var defsText = "";
        for(var j=0; j<defs.length; j++){
            defsText+="<p class=definition>"+(j+1)+". "+ defs[j]+"</p>";
        }   
        const tempElem=document.createElement('div');
        tempElem.innerHTML=defsText
        
        new tippy(elem, {html: tempElem}); 


    }
    },

    /**
     * Returns max reading level index for the user based on their previous performance.
     */
    getMaxReadingLevelIdx: function(){
      var level = 0;
      for(var i =0; i<this.complexityPerformance.length; i++){
        if(this.complexityPerformance[i]>0){
          level=i;
        }
      }
      return level;
    }

  };
};