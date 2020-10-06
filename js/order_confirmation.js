// Déclaration des variables
let totalPrice = localStorage.getItem("totalPrice");
let orderId = localStorage.getItem("orderId");
let sentence = `Votre identifiant de commande est le ${orderId}.`;
let confirmTotal = document.getElementById("confirmTotal");
let confirmOrderId = document.getElementById("confirmOrderId");
let surprise = document.getElementById("surprise");


// Affichage prix total et identifiant de commande
confirmTotal.textContent = "Confirmation pour un prix total de " + totalPrice + " euros.";
console.log(sentence); // Affichage de vérification
if (!sentence.includes("undefined")) {
  confirmOrderId.textContent = sentence;
} else {
  confirmOrderId.textContent = "Nous vous enverrons par mail votre identifiant de commande. A bientôt.";
}

// Affichage remerciement supplémentaire
setTimeout(function () {
  surprise.textContent = "Merci encore ♥"
},
  10000);

// Remise à 0 de la base de données db
let db = ""; //Connexion à la base de données
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
  clearData();
};
// Exécutez la fonction clearData () pour vider les données dans le magasin d'objet
function clearData() {
  let transaction = db.transaction("choices", "readwrite");
  transaction.oncomplete = function (event) {
    console.log("Base de donnée vidée"); // Affichage de vérification
  };
  let objectStore = transaction.objectStore("choices");

  let objectStoreRequest = objectStore.clear();
  objectStoreRequest.onsuccess = function () {
    console.log(objectStoreRequest.readyState); // Affichage de vérification
  };
}


