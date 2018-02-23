//This is a class for use with the more complicated exercises that use chunks
//or look for longer constructions. It gives functions to filter out hits or 
//concatenate nodes into chunks.
export default class CamdenTownExercises {
  static filter(nodes, topic){
    var filteredNodes = [];
    var changedNodes = [];
      switch(topic){
        case 'simPastPastProg':
          for(const node of nodes){
            var nextNode = node.nextElementSibling;
            if(nextNode==null){
              continue
            }
            var prevNode = node.previousElementSibling;
            if(prevNode==null){
              continue;
            }
            var chunk = node.getAttribute('data-chunk');
            var tag = node.getAttribute('data-morph-pos');
            var lemma = node.getAttribute('data-lemma');
            var nextChunk = nextNode.getAttribute('data-chunk');
            if(tag=='VBD'){//looks for chunks consisting of only VBD
              if(typeof chunk==='string'&&chunk=='B-VP'){
                if(this.isChunkStart(nextNode)){  
                  filteredNodes.push(node);
                }
              }
            }else if(tag=='VBG'){
              var prevChunk = prevNode.getAttribute('data-chunk');
              var prevPos = prevNode.getAttribute('data-morph-pos');
              var prevLemma = prevNode.getAttribute('data-lemma');
              if(typeof chunk==='string'&&chunk=='I-VP'){
                if(prevChunk=='B-VP'){
                  if(prevLemma=='be'){
                    if(prevPos=='VBD'){
                      if(this.isChunkStart(nextNode)){
                        var changed=null;
                        var tn = null;
                        [tn, changed]= this.makeChunk(node);
                        filteredNodes.push(tn);
                        changedNodes.push.apply(changed);
                      }                       
                    }
                  }
                }
              }
            }
          }
          return [filteredNodes, changedNodes];
        case 'allSimpleVerbs':
          for(const node of nodes){
            //Look for cases of single verb chunks for past and present
            //and chunks consisting of 'will'+VB
            var chunk = node.getAttribute('data-chunk');
            var pos = node.getAttribute('data-morph-pos');
            var nextNode = node.nextElementSibling;
            if(nextNode==null){
              continue;
            }
            var prevNode = node.previousElementSibling;
            if(prevNode==null){
              continue;
            }
            if(pos=='VBZ'||pos=='VBD'||pos=='VBP'){
              if(typeof chunk ==='string'&&chunk=='B-VP'){
                if (this.isChunkStart(nextNode)){
                  filteredNodes.push(node);
                }
              }
            }else { //catch case where chunk consists of 'will' + VB
              if(typeof chunk==='string'&&chunk=='I-VP'){
                var prevChunk = prevNode.getAttribute('data-chunk');
                var prevLemma = prevNode.getAttribute('data-lemma');
                if(typeof prevChunk==='string'&&prevChunk=='B-VP'){
                  if(prevLemma=='will'){
                    if(this.isChunkStart(nextNode)){
                      var changed=null;
                      var tn = null;
                      [tn, changed]= this.makeChunk(node);
                      filteredNodes.push(tn);
                      changedNodes.push.apply(changed);                    }
                  }
                }
              }
            }
          }
          return [filteredNodes, changedNodes];
        case 'plusqVsPerf': //look for chunks consisting of lemma:have+VBN 
          for(const node of nodes){
            var chunk = node.getAttribute('data-chunk');
            var nextNode = node.nextElementSibling;
            if(nextNode==null){
              continue;
            }
            var prevNode = node.previousElementSibling;
            if(prevNode==null){
              continue;
            }
            var prevChunk = prevNode.getAttribute('data-chunk');
            var prevTag = prevNode.getAttribute('data-morph-pos');
            var prevLemma = prevNode.getAttribute('data-lemma');
            
            if(typeof chunk==='string'&&chunk=='I-VP'){
              if(typeof prevChunk==='string'&&prevChunk=='B-VP'){
                if(this.isChunkStart(nextNode)){
                  if (prevLemma=='have'){
                    if(prevTag=='VBD'||prevTag=='VBZ'||prevTag=='VBP'){
                      var changed=null;
                      var tn = null;
                      [tn, changed]= this.makeChunk(node);
                      filteredNodes.push(tn);
                      changedNodes.push.apply(changed);
                    }
                  }
                }
              }
            }
                  

          }
          return [filteredNodes, changedNodes];
        case 'passiveVsActiveInPast': //look for chunks of only VBD or chunks of be:VBD
          for(const node of nodes){
            var chunk = node.getAttribute('data-chunk');
            var tag = node.getAttribute('data-morph-pos');
            var nextNode = node.nextElementSibling;
            if(nextNode==null){
              continue;
            }
            var prevNode = node.previousElementSibling;
            if(prevNode==null){
              continue;
            }
            var prevChunk = prevNode.getAttribute('data-chunk');
            var prevTag = prevNode.getAttribute('data-morph-pos');
            var prevLem = prevNode.getAttribute('data-lemma');
            if(tag=='VBD'){ //add chunks consisting of only VBD
              if(typeof chunk==='string'&&chunk=='B-VP'){
                if(this.isChunkStart(nextNode)){
                  filteredNodes.push(node);
                }
              }
            } else { //passive, i.e. tag=='VBN'
              if(typeof chunk==='string'&&chunk=='I-VP'){
                if(typeof prevChunk==='string'&&prevChunk=='B-VP'){
                  if(prevTag=='VBD'&&prevLem=='be'){
                    if(this.isChunkStart(nextNode)){
                      var changed=null;
                      var tn = null;
                      [tn, changed]= this.makeChunk(node);
                      filteredNodes.push(tn);
                      changedNodes.push.apply(changed);
                    }
                  }
                }
              }
            }
          }
          return [filteredNodes, changedNodes];
        case 'simPastPresPerfPastProg':
          for(const node of nodes){
            var chunk = node.getAttribute('data-chunk');
            var tag = node.getAttribute('data-morph-pos');
            var nextNode = node.nextElementSibling;
            if(nextNode==null){
              continue;
            }
            var prevNode = node.previousElementSibling;
            if(prevNode==null){
              continue;
            }
            var prevChunk = prevNode.getAttribute('data-chunk');
            var prevTag = prevNode.getAttribute('data-morph-pos');
            var prevLem = prevNode.getAttribute('data-lemma');
            if(tag=='VBD'){ //simple past: add chunks consisting of only VBD
              if(typeof chunk==='string'&&chunk=='B-VP'){
                if(this.isChunkStart(nextNode)){
                  filteredNodes.push(node);
                }
              }
            } else if(tag=='VBN'){ //pres. perf: chunks consisting of "have"+VBN
              if(typeof chunk==='string'&&chunk=='I-VP'){
                if(typeof prevChunk==='string'&&prevChunk=='B-VP'){
                  if(prevLem=='have'){
                    if(prevTag=='VBZ'||prevTag=='VBP'){
                      if(this.isChunkStart(nextNode)){
                        var changed=null;
                        var tn = null;
                        [tn, changed]= this.makeChunk(node);
                        filteredNodes.push(tn);
                        changedNodes.push.apply(changed);
                      }
                    }
                  }
                }
              }
            } else if(tag=='VBG'){
              if(typeof chunk==='string'&&chunk=='I-VP'){
                if(typeof prevChunk==='string'&&prevChunk=='B-VP'){
                  if(prevLem=='be'&&prevTag=='VBD'){
                    if(this.isChunkStart(nextNode)){
                      var changed=null;
                      var tn = null;
                      [tn, changed]= this.makeChunk(node);
                      filteredNodes.push(tn);
                      changedNodes.push.apply(changed);
                    }
                  }
                }
              }
            }
          } 
          return [filteredNodes, changedNodes];
        case 'simPresPresProg':
          for(const node of nodes){
            var chunk = node.getAttribute('data-chunk');
            var tag = node.getAttribute('data-morph-pos');
            var nextNode = node.nextElementSibling;    
            if(nextNode==null){
              continue
            }
            var prevNode = node.previousElementSibling;
            if(prevNode==null){
              continue;
            }
            
            var prevChunk = prevNode.getAttribute('data-chunk');
            var prevTag = prevNode.getAttribute('data-morph-pos');
            var  prevLem = prevNode.getAttribute('data-lemma');
            if(tag=='VBZ'||tag=='VBP'){ //simple pres: add chunks consisting of only VBZ or VBP
              if(typeof chunk==='string'&&chunk=='B-VP'){
                if(this.isChunkStart(nextNode)){
                  filteredNodes.push(node);
                }  
              }
            } else {
              if(typeof chunk==='string'&&chunk=='I-VP'){
                if(typeof prevChunk==='string'&&prevChunk=='B-VP'){
                  if(prevLem=='be'){
                    if(prevTag=='VBP'||prevTag=='VBZ'){
                      if(this.isChunkStart(nextNode)){
                        var changed=null;
                        var tn = null;
                        [tn, changed]= this.makeChunk(node);
                        filteredNodes.push(tn);
                        changedNodes.push.apply(changed);
                      }
                    }
                  }
                }
              }
            }
          }
          return [filteredNodes, changedNodes];
        default: 
          return [nodes, changedNodes];

      }
  }

  //returns original node with info from its chunk
  //changes 'data-original-text' field 
  static makeChunk(node) {
      var tag = node.getAttribute('data-chunk');
      var changed = [];
      if(typeof tag==="string"){
        
          var newText = node.getAttribute('data-original-text');
          var toRemove = null;

          if(tag.startsWith("I")){ //add left elements
              var leftNode = node.previousElementSibling;
              while(leftNode!=null
                &&leftNode.hasAttribute('data-chunk')
                &&leftNode.getAttribute('data-chunk').startsWith('I')){
                  newText= leftNode.getAttribute('data-original-text')+" "+newText;
                  toRemove = leftNode;
                  leftNode=leftNode.previousElementSibling;
                  // toRemove.remove();
                  toRemove.innerHTML='';
                  changed.push(toRemove);


              }
              if(leftNode!=null
                &&leftNode.getAttribute('data-chunk').startsWith('B')){
                  newText=leftNode.getAttribute('data-original-text')+" "+newText;
                  toRemove = leftNode;
                  toRemove.innerHTML='';
                  changed.push(toRemove);
              }
          }
          
          var rightNode = node.nextElementSibling;
          while(rightNode!=null
              &&rightNode.hasAttribute('data-chunk')
              &&typeof rightNode.getAttribute('data-chunk')==='string'
              &&rightNode.getAttribute('data-chunk').startsWith('I')){
                  newText=newText+" "+rightNode.getAttribute('data-original-text');
                  toRemove = rightNode;
                  rightNode=rightNode.nextElementSibling;
                  toRemove.innerHTML='';
                  changed.push(toRemove);


          }
        node.innerHTML=newText;
        node.setAttribute('text-before-chunking', node.getAttribute('data-original-text'));
        node.setAttribute('data-original-text', newText);
      }
    return [node, changed];
  }

  //Returns true if node is the start of a new chunk.
  static isChunkStart(node){
    return !node.hasAttribute('data-chunk')||node.getAttribute('data-chunk').startsWith('B');
  }
}
