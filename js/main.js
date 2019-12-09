function navClick(clickedId) {
    resetAllTabs();
    hideAllMainContentItems();
    setClickedTab(clickedId);
    displayContentItem(clickedId);
}

function displayContentItem(clickedId){
    //This function will show the correct section based on the clicked
    //tab
    switch (clickedId) {
        case "navAboutMe":
            displayAboutMe();
            break;
        case "navCareer":
            document.getElementById("career").style.display = "flex";
            break;
        case "navProjects":
            document.getElementById("projects").style.display = "flex";
            break;
        case "navDogs":
            document.getElementById("dogs").style.display = "flex";
            break;
    }
}

function hideAllMainContentItems() {
    //This function will reset the main content panel
    //to hide all content

    var collection = document.getElementsByClassName("mainSectionItem");
    for (i = 0; i < collection.length; i++) {
        collection[i].style.display = "none";
    }
}

function setClickedTab(clickedId) {
    //This function will style the clicked tab
    document.getElementById(clickedId).style.backgroundColor = "rgba(87, 82, 82,.75)";
    document.getElementById(clickedId).style.fontSize = "1.65rem";
}

function resetAllTabs() {
    //This function will reset all navigation tabs
    //to their original "unclicked" style.
    var collection = document.getElementsByClassName("navAnchor");
    for (i = 0; i < collection.length; i++) {
        collection[i].style = "navItem";
    }
}

function pageLoad(){
    //This function executes on page load

    //Trigger the click event on the "about me"
    //tab so that it appears when the page is loaded.
    document.getElementById("navAboutMe").click();
}

function displayAboutMe() {
    //This function
    document.getElementById("aboutMe").style.display = "grid";
}