function showArticlesArchive(){
    document.getElementById("archive-articles").classList.remove("hidden");
    document.getElementById("archive-photos").classList.add("hidden");
}

function showPhotoArchive(){
    document.getElementById("archive-articles").classList.add("hidden");
    document.getElementById("archive-photos").classList.remove("hidden");
}