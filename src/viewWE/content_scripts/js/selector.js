view.selector = {
  select: function(filter) {
    if("all" === filter){
      $("viewenhancement").addClass("selected");
    }
    else{
      $("viewenhancement[data-filters='" + filter + "']").addClass("selected");
    }
  }
};