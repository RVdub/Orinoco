// Déclaration des variables
let theme = localStorage.getItem("theme");
let myCaddy = document.getElementById("myCaddy");
let totalPrice = 0;
let orderId = "";
let products = []; // tableau des produits contenant les id à commander
let counter = 0;
let firstName;
let lastName;
let address;
let city;
let email;

// Ouverture base de donnée (db) du navigateur client
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
  displayData();
};



// Affichage écran des articles selectionnés (du panier)
function displayData() {
  let transaction = db.transaction("choices", "readwrite");
  let choices = transaction.objectStore("choices");
  let request = choices.openCursor();
  request.onsuccess = function (event) {
    let cursor = event.target.result;
    if (cursor) {
      // Affichage du panier sur la page html
      myCaddy.innerHTML += '<ul class="list-unstyled col-12"></ul>' +
        '<script src="./src/bootstrap-input-spinner.js"></script>' + '<script>$("input[type=\'number\']").inputSpinner()</script>' +
        '<li class="media">' +
        '<img src="' + cursor.value.imageUrl + '" class="mr-3" height="60px" alt="Votre choix d\'article">' +
        '<div class="media-body">' +
        '<p class="h5 mt-0 mb-1">' + cursor.value.name + ' ' + cursor.value.option + '</p>' +
        '<p>Prix: ' + cursor.value.price + ' euros. Quantité: ' +
        '<input class="btn-quty" type="number" value="' + cursor.value.quantity + '" size="2" min="1" max="10" step="1"/>' + "&#x09" +
        '<button class="btn btn-secondary btn-sm" type="button" role="button" id="' + cursor.value.id + '">supprimer</button></p>' +
        '</div></li></ul>';
      totalPrice += (cursor.value.price * cursor.value.quantity); // Calcul du prix total
      products[counter] = cursor.value.id; // Tableau de tous les id des produits selectionnés
      counter++
      cursor.continue();
    } else {
      console.log("Toutes les entrées lues !"); // Affichage de vérfication
    }
  };
  transaction.oncomplete = function () {
    console.log("Transaction terminée"); // Affichage de vérfication
    console.log(products); // Affichage de vérfication
    // vérification si panier avec article
    let alertHead = document.getElementById("alertHead"); // gestion de l'alerte
    if (alertHead != null && totalPrice > 0) {
      alertHead.textContent = "Votre sélection d'article(s)";
    }
    if (totalPrice > 0) { // affichage du prix différent de 0
      myCaddy.innerHTML += '<p class="h3 col-12 text-center" id="total">PRIX TOTAL = ' + totalPrice + ' euros</p>';
    } else {
      myCaddy.innerHTML = "";
    }
    modifyChoice();
  };
}

// Scrute les saisies utilisateur: <Supprimer> et <quantité>
function modifyChoice() {
  // Bouton <supprimer>
  let buttonsSupprimer = document.getElementsByClassName("btn-sm");
  for (let i = 0; i < buttonsSupprimer.length; i++) {
    buttonsSupprimer[i].addEventListener("click", function () {
      let id = buttonsSupprimer[i].getAttribute("id");
      let transaction = db.transaction("choices", "readwrite");

      transaction.oncomplete = function () {
        console.log("Transaction terminée"); // Affichage de vérfication
        myCaddy.innerHTML = "";
        totalPrice = 0;
        counter = 0;
        products = [];
        displayData();
      };

      let choices = transaction.objectStore("choices");
      let suppr = choices.delete(id); // Suppression de la donnée liée à l'id
      suppr.onsuccess = function () {
        console.log("choix supprimé de la base de données"); // Affichage de vérfication
      };
    });
  }
  // Bouton <quantité>
  let buttonsQuantity = document.getElementsByClassName("btn-quty");
  for (let j = 0; j < buttonsQuantity.length; j++) {
    buttonsQuantity[j].addEventListener("change", function (event) {
      let myQuantityChoice = event.target.value;
      let id = buttonsSupprimer[j].getAttribute("id");
      let transaction = db.transaction("choices", "readwrite");

      transaction.oncomplete = function () {
        console.log("Transaction terminée"); // Affichage de vérfication
        myCaddy.innerHTML = "";
        totalPrice = 0;
        counter = 0;
        products = [];
        displayData();
      };

      let choices = transaction.objectStore("choices");
      let request = choices.get(id); // appel de la donnée indexée par son id
      request.onsuccess = function () {
        let data = request.result;
        data.quantity = myQuantityChoice; // modification de la quantité
        let requestUpdate = choices.put(data); // Mise à jour de l'objet dans la base
        requestUpdate.onsuccess = function () {
          console.log("quantité de l'id modifiée"); // Affichage de vérfication
        };
      };
    });
  };
}

// Scrute le bouton <Envoyer>
document.getElementById("form").addEventListener("submit", function (event) {
  event.preventDefault(); // Blocage de l'envoi du formulaire s'il est bien rempli
  if (totalPrice == 0) {
    alert("Vous ne pouvez pas commander, il n'y a rien dans le panier ;)")
  } else {
    dataRetrievalContactForm();
  }
});

// Récupération des données du formulaire de contact
function dataRetrievalContactForm() {
  firstName = document.forms["contact"].elements["firstName"].value;
  lastName = document.forms["contact"].elements["name"].value;
  address = document.forms["contact"].elements["address"].value;
  city = document.forms["contact"].elements["city"].value;
  email = document.forms["contact"].elements["email"].value;
  askApis(theme);
}

// Envoi à l'API du contact et du tableau de produits
function askApis(choix) {
  let dataPost = JSON.stringify({
    "contact": {
      "firstName": firstName,
      "lastName": lastName,
      "address": address,
      "city": city,
      "email": email
    },
    "products": products
  });
  console.log(dataPost); //affichage de vérification
  alert("Traitement en cours de votre commande. Notez bien votre numéro de commande");
  fetch("http://localhost:3000/api/" + choix + "/order",
    {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-type": "application/json",
      },
      body: dataPost,
    })
    .then(response => response.json())
    .then((responseJson) => {
      let orderId = responseJson.orderId;
      console.log("orderId: " + orderId); //affichage de vérification
      localStorage.setItem("totalPrice", totalPrice);
      localStorage.setItem("orderId", orderId);
      window.location.href = "./order_confirmation.html";
    })
    .catch(error => alert("Une erreur est survenue: " + error))
}


