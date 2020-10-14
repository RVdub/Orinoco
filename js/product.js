// Déclaration des variables
let theme = localStorage.getItem("theme");
let catalog = document.getElementById("catalog");
let details; // Récupération de l'objet littéral (en détails) de l'api en fonction du thème
let pageProductButtons;
let idOfMyArticle;
let objectNumberOfDetails;
let codeHtmlOption;
let myOptionChoice;

// Fonction affichage du prix
function priceDisplay(value) {
    return (value / 100).toFixed(2) + " €uros";
}

// ouverture stockage données coté client (sur son navigateur)
let db = "";
let openRequest = indexedDB.open("db", 1);

openRequest.onupgradeneeded = function () {
    db = openRequest.result;
    if (!db.objectStoreNames.contains("choices")) {
        db.createObjectStore("choices", { keyPath: "id" });
    }
};
db.onerror = function (event) {
    alert("Accès refusé: " + event.target.errorCode);
    window.location.href = "./index.html";
};
openRequest.onsuccess = function () {
    db = openRequest.result;
};


// Interrogation des APIs (bases de données distantes) en fonction du thème
askApis(theme);

function askApis(name) {
    fetch("http://localhost:3000/api/" + name + "/")
        .then(response => response.json())
        .then(data => {
            details = (data);
            console.log("data:", details); //affichage de vérification
            displayProduct();
        })
        .catch(error => alert("Une erreur est survenue: " + error))
}

// Affichage de tous les produits du thème choisi
function displayProduct() {
    document.querySelector("h1").textContent = "Nos meilleures ventes";
    for (let i = 0; i < details.length; i++) {
        catalog.innerHTML += '<div class="col-12 col-lg-4">' +
            '<div class="card mb-4 text-center border-secondary shadow">' +
            '<img class="card-img-top" src="' + details[i].imageUrl + '"alt="illustration de l\'article">' +
            '<div class="card-body">' +
            '<button id="' + details[i]._id + '" class="btn btn-secondary" type="button" role="button">' +
            '<p class="h5 card-title">' + details[i].name + '</p>' + '</button>' +
            '<p class="card-text">' + details[i].description + '</p>' +
            '<p class="card-text mt-3">Prix : ' + priceDisplay(details[i].price) + '</p>' +
            '</div></div></div>';
    }
    selectOneProduct();

}

// Sélection d'un produit au premier clic et récupération de son id (et de l'option en fonction du thème)
function selectOneProduct() {
    pageProductButtons = document.querySelectorAll("button"); //sélectionne tous les boutons
    for (let i = 1; i < pageProductButtons.length; i++) { // Le premier bouton n°0 correspond au menu
        pageProductButtons[i].onclick = function () {
            idOfMyArticle = pageProductButtons[i].getAttribute("id");
            objectNumberOfDetails = i - 1;
            // Récupération de son option en fonction du thème Oriteddies, Oricam, Orifurniture
            if (theme == "teddies") {
                for (let i = 0; i < details[objectNumberOfDetails].colors.length; i++) {
                    codeHtmlOption += '<option value="' + details[objectNumberOfDetails].colors[i] + '">' + details[objectNumberOfDetails].colors[i] + '</option>';
                }
            } else {
                if (theme == "cameras") {
                    for (let i = 0; i < details[objectNumberOfDetails].lenses.length; i++) {
                        codeHtmlOption += '<option value="' + details[objectNumberOfDetails].lenses[i] + '">' + details[objectNumberOfDetails].lenses[i] + '</option>';
                    }
                } else {
                    for (let i = 0; i < details[objectNumberOfDetails].varnish.length; i++) {
                        codeHtmlOption += '<option value="' + details[objectNumberOfDetails].varnish[i] + '">' + details[objectNumberOfDetails].varnish[i] + '</option>';
                    }
                }
            }
            console.log(idOfMyArticle, objectNumberOfDetails); //affichage de vérification
            displayOneProduct();
        }
    }
}

// Affichage du produit selectionné avec son option et ses boutons
function displayOneProduct() {
    document.querySelector("h1").textContent = "Votre judicieux choix";
    catalog.innerHTML = '<div class="col-12">' +
        '<div class="card mb-4 text-center border-secondary shadow">' +
        '<img class="card-img-top" src="' + details[objectNumberOfDetails].imageUrl + '"alt="illustration de l\'article">' +
        '<div class="card-body">' +
        '<p class="h5 card-title">' + details[objectNumberOfDetails].name + '</p>' + '</button>' +
        '<p class="card-text">' + details[objectNumberOfDetails].description + '</p>' +
        '<select class="custom-select custom-select-sm">' +
        '<option selected>Options possibles</option>' +
        codeHtmlOption +
        '</select>' +
        '<p class="card-text mt-3">Prix : ' + priceDisplay(details[objectNumberOfDetails].price) + '</p>' +
        '<style>.color-f3e9f1{background-color:#f3e9f1;}</style>' +
        '<button id="caddy" class="btn color-f3e9f1" type="button" role="button">' +
        '<img src="./images/caddy.png" alt="" /> Mon caddy</button>' +
        '</div></div></div>';
    // scrute un événement clic sur le bouton panier et sur l'option choisi
    document.querySelector("select").addEventListener("change", function (event) {
        myOptionChoice = event.target.value;
    });
    document.getElementById("caddy").addEventListener("click", putInMyCaddy);
    // scrute un événement clic sur le bouton retour à la liste
    let back = document.getElementById("back");
    back.textContent = "Retour à la liste"
    back.addEventListener("click", backToTheList);
}

// Au clic sur le bouton panier (myCaddy): enregistrement du choix utilisateur 
function putInMyCaddy() {
    let transaction = db.transaction("choices", "readwrite");
    transaction.oncomplete = function () {
        console.log("Transaction terminée");
    };
    let choices = transaction.objectStore("choices");

    let choice = {
        id: idOfMyArticle, // Base indexée sur l'id et un seul identifiant par article quelque soit l'option => la dernière option retenue efface la précédente
        option: myOptionChoice,
        imageUrl: details[objectNumberOfDetails].imageUrl,
        name: details[objectNumberOfDetails].name,
        description: details[objectNumberOfDetails].description,
        price: details[objectNumberOfDetails].price,
        quantity: 1,
        commande: new Date()
    };
    let write = choices.add(choice);
    write.onsuccess = function () {
        console.log("choix ajouté " + write.result);
    };
    alert("Enregistré au panier !")
    backToTheList();
}

// Mise à zéro du produit selectionné et retour à la page des produits du thème
function backToTheList() {
    catalog.innerHTML = "";
    back.textContent = "Votre choix thématique";
    objectNumberOfDetails = 0;
    idOfMyArticle = "";
    codeHtmlOption = "";
    myOptionChoice = "";
    pageProductButtons = "";
    displayProduct();
}

