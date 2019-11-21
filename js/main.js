function navClick(clicked_id) {

    resetAllTabs();
    setTabProps(clicked_id);
    hideAllMainContent();
    
    switch (clicked_id) {
        case "navAboutMe":
            document.getElementById("aboutMe").style.display = "flex";
            document.getElementById("aboutMe").style.opacity = 1;
            document.getElementsByClassName("mainSection")[0].style.backgroundColor = "rgba(87, 82, 82, 1)";
            break;
        case "navCareer":
            document.getElementById("career").style.display = "flex";
            document.getElementById("career").style.opacity = 1;            
            break;
        case "navProjects":            
            document.getElementById("projects").style.display = "flex";
            document.getElementById("projects").style.opacity = 1;
            break;
        case "navDogs":            
            document.getElementById("dogs").style.display = "flex";
            document.getElementById("dogs").style.opacity = 1;
            break;   
    }
}

function hideAllMainContent() {
    var collection = document.getElementsByClassName("mainContent");
    for (i = 0; i < collection.length; i++) {
        // console.log("here: " + i);
        collection[i].style.display = "none";
        collection[i].style.opacity = 0;
    }
}

function setTabProps(clicked_id) {
    document.getElementById(clicked_id).style.backgroundColor = "rgba(87, 82, 82,1)";
    document.getElementById(clicked_id).style.fontSize = "1.65rem";
}

function resetAllTabs() {
    var collection = document.getElementsByClassName("navAnchor");
    for (i = 0; i < collection.length; i++) {
        // console.log("here: " + i);
        collection[i].style = "navItem";
    } 
}