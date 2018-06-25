var parentHeight = 100;
var prevPage = '';    
var resizeParentContainer = function() {
    var myHeight = $('#mainContainer').height();    
    if (myHeight > parentHeight ||
            parentHeight - myHeight > 50) {
        var parentHeightJSON = {"parentHeight" : myHeight} ;
        parentHeight = myHeight;
        window.parent.postMessage(JSON.stringify(parentHeightJSON), "*");       
	if (prevPage == location.href) {
	} else {
		prevPage = location.href;
		window.parent.scroll(0,0);
	}
    }
};

resizeParentContainer();

setInterval( function() { resizeParentContainer(); }, 400);
// window.addEventListener("resize",resizeParentContainer);

var showfeedback = function() {
    //console.log("Client = Showing feedback");
     window.parent.postMessage('{"feedback":"true"}', "*");
};
var hidefeedback = function() {
     window.parent.postMessage('{"feedback":"false"}', "*");
};

var showfeedback_dialog = function(experiencejson) {
    console.log("Client = Showing feedback dialog " + experiencejson);
    experiencejson.feedbackDialog = true;
    window.parent.postMessage(JSON.stringify(experiencejson), "*");
};

/************* Listen *****************/

function listener(event) {
  // Only listen to events from the top-level page.
  if (event.origin !== "http://intranet" &&
      event.origin !== "https://www.epg.ae" &&
      event.origin !== "https://www.epg.gov.ae"
  ) {
    return;
  }
  
   importParentStyles();
  // toggle_contrast();
  // update_font();
   
}
// We attach this differently for older  versions of IE.
if (window.addEventListener) {
  addEventListener("message", listener, false);
}
else {
  attachEvent("onmessage", listener);
}

/*****************************************************/



function importParentStyles() {
    if (parent) {
	 var parloc = ""+parent.location;
	 if (parloc.indexOf("/esvc/") > 0) {
	        var parHead = document.getElementsByTagName("head")[0];
       	 var styleSheetArray = parent.document.getElementsByTagName("link");
	        for (var i = 0; i < styleSheetArray .length; i++){    	     
       	     parHead.appendChild(styleSheetArray [i].cloneNode(true));
	        }            
	 }
    }    

}


//importParentStyles();