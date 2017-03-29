view.selector = {
  select: function(filter) {
    if("all" === filter ||
        "no-filter" === filter){
      $("viewenhancement").addClass("selected");
    }
    else{
      $("[data-filters~='" + filter + "']").addClass("selected");
    }
  }
};