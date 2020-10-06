//barre de recherche jQuery prête à l'emploi avec Bootstrap
$(document).ready(function () {
    $("#searchInput").on("keyup", function () {
        let value = $(this).val().toLowerCase();
        $("#itemList .col-12").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });
});


//scrute un événement clic sur la page d'accueil
document.getElementById("bear").addEventListener("click", displayBear);
document.getElementById("cam").addEventListener("click", displayCam);
document.getElementById("oak").addEventListener("click", displayOak);

// puis redirige vers la page thématique Oriteddies, Oricam, Orifurniture
function displayBear() {
    localStorage.setItem("theme", "teddies");
    window.location.href = "./product.html";
}

function displayCam() {
    localStorage.setItem("theme", "cameras");
    window.location.href = "./product.html";
}

function displayOak() {
    localStorage.setItem("theme", "furniture");
    window.location.href = "./product.html";
}

