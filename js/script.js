const digitalArtworks = [];
const file = "../data/data.json";
const myForm = document.getElementById("myForm");
const shop = document.getElementById("shop");
const modal = document.getElementById("modalPopUp");
const cart = document.getElementById("cart");
const totalcart = document.getElementById("total");
const closeButton = document.querySelector(".close"); //getElementsByClassName('close')[0]
const cartContent = document.querySelector(".modal-body");
const productContainer = document.querySelector(".cart-container");
const productQty = document.querySelector(".count-products");
const buyCart = document.getElementById("buy-cart");
const emptyCart = document.getElementById("empty-cart");
const Toast = Swal.mixin([
  (toast = true),
  (position = "top-end"),
  (showConfirmButton = false),
  (width = 200),
  (timer = 1000),
  (timerProgressBar = true),
]);

let cartProducts = [];
const contacts = [];

class Contact {
  constructor(firstName, lastName, email, country, subject) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.country = country;
    this.subject = subject;
  }
}

class digitalArtwork {
  static artworkCounter = 0;
  subtotal = 0;
  quantity = 1;
  constructor(name, price, img, description) {
    this.id = ++digitalArtwork.artworkCounter;
    this.name = name;
    this.price = price;
    this.img = img;
    this.description = description;
    this.subtotal = this.quantity * this.price;
  }
}

/*********************************************************************************/
/*                                 PRODUCTS                                      */
/*********************************************************************************/

async function petition(data) {
  try {
    const response = await fetch(data);
    if (!response.ok) {
      throw new Error(
        `An error has occured in the petition: ${response.status} ${response.statusText}`
      );
    }
    const dataOk = await response.json();
    return dataOk;
  } catch (error) {
    console.error(error);
  }
}

async function renderProducts() {
  const fetchedData = await petition(file);

  for (const digitalArtwork of fetchedData) {
    let card = document.createElement("div");
    let cardClass = `column${digitalArtwork.id}`;
    card.classList.add(cardClass);

    card.innerHTML = `<a 
                          ><img src="./images/${digitalArtwork.img}" alt="image of ${digitalArtwork.name}" class="image image-full";
                        /></a>
                        <h3><b>${digitalArtwork.name}</b></h3>
                        <p id=${digitalArtwork.id}>${digitalArtwork.description}</p>
                        <h4>$${digitalArtwork.price}</h4>
                        <a class="button">Add to cart</a>`;

    document.getElementById("shop").appendChild(card);
  }
}

/*********************************************************************************/
/*                                  CONTACT                                      */
/*********************************************************************************/

function isNotEmpty(value) {
  if (value == null || value == "" || typeof value == "undefined") {
    return false;
  } else {
    return true;
  }
}

function isEmail(email) {
  let regex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return regex.test(String(email).toLowerCase());
}

function fieldValidation(field, validationFunction) {
  if (field == null) return false;

  let isFieldValid = validationFunction(field.value);

  return isFieldValid;
}

function isValid(field) {
  if (
    isNotEmpty(field.firstName) &&
    isNotEmpty(field.lastName) &&
    isNotEmpty(field.country) &&
    isEmail(field.email) &&
    isNotEmpty(field.subject)
  ) {
    return true;
  }
}

myForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const contact = new Contact(
    document.getElementById("firstName").value,
    document.getElementById("lastName").value,
    document.getElementById("email").value,
    document.getElementById("country").value,
    document.getElementById("subject").value
  );
  if (isValid(contact)) {
    contacts.push(contact);

    saveToLS("Contacts", contacts);

    myForm.reset();

    alert(
      `${contact.firstName} thanks for contacting, we'll get back to you as soon as possible.`
    );
  } else {
    alert("There was an error, please check all the fields.");
  }
});

function saveToLS(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function cleanLS(key) {
  localStorage.removeItem(key);
}
/*********************************************************************************/
/*                               MODAL & CART                                    */
/*********************************************************************************/

function eventLoader() {
  document.addEventListener("DOMContentLoaded", () => {
    renderProducts();
    loadCartToLS();
    showCartProducts();
  });

  function loadCartToLS() {
    cartProducts = JSON.parse(localStorage.getItem("cartProducts")) || [];
  }

  shop.addEventListener("click", addProduct);
  cartContent.addEventListener("click", deleteProduct);
  buyCart.addEventListener("click", buyCartContent);
  emptyCart.addEventListener("click", emptyCartContent);

  cart.onclick = function () {
    modal.style.display = "block";
  };

  closeButton.onclick = function () {
    closeCart();
  };

  window.onclick = function (event) {
    if (event.target == modal) {
      closeCart();
    }
  };
}

function closeCart() {
  modal.style.display = "none";
}

function deleteProduct(e) {
  e.preventDefault();
  if (e.target.classList.contains("delete-product")) {
    const productId = parseInt(e.target.getAttribute("id"));

    cartProducts = cartProducts.filter((product) => product.id !== productId);
    saveToLS("cartProducts", cartProducts);
    Swal.fire({
      icon: "success",
      title: "Your product has been deleted from the car",
      allowOutsideClick: true,
      allowEscapeKey: true,
      allowEnterKey: true,
    });
    showCartProducts();
  }
}

function addProduct(e) {
  e.preventDefault();
  if (e.target.classList.contains("button")) {
    const addedProduct = e.target.parentElement;
    retrieveProductData(addedProduct);
    Swal.fire({
      icon: "success",
      title: "Your product has been added from the car",
      allowOutsideClick: true,
      allowEscapeKey: true,
      allowEnterKey: true,
    });
  }
}

function retrieveProductData(product) {
  const productData = {
    name: product.querySelector("h3").textContent,
    price: Number(product.querySelector("h4").textContent.replace("$", "")),
    img: product.querySelector("img").src,
    id: parseInt(product.querySelector("p").getAttribute("id")),
    quantity: 1,
  };

  (productData.subtotal = productData.price * productData.quantity),
    addToCart(productData);
}

function addToCart(productToAdd) {
  const existsInCart = cartProducts.some(
    (product) => product.id === productToAdd.id
  );

  if (existsInCart) {
    const products = cartProducts.map((product) => {
      if (product.id === productToAdd.id) {
        product.quantity++;
        product.subtotal = product.price * product.quantity;

        return product;
      } else {
        return product;
      }
    });
    cartProducts = products;
  } else {
    cartProducts.push(productToAdd);
  }
  saveToLS("cartProducts", cartProducts);
  showCartProducts();
}

function showCartProducts() {
  cleanHTML();

  cartProducts.forEach((product) => {
    const { img, name, price, quantity, subtotal, id } = product;

    const div = document.createElement("div");
    div.classList.add("product-container");
    div.innerHTML = `
			<img src="${img}" width="100">
			<P>${name}</P>
			<P>$${price}</P>
			<P>${quantity}</P>
			<P>$${subtotal}</P>
			<a href="#" class="delete-product" id="${id}"> X </a>
		`;

    cartContent.appendChild(div);
  });

  sumTotal();
  showCartQty();
}

function showCartQty() {
  let qtyCounter;

  if (cartProducts.length > 0) {
    productContainer.style.display = "flex";
    productContainer.style.alignItems = "center";
    productQty.style.display = "flex";
    qtyCounter = Number(
      cartProducts.reduce((quantity, product) => quantity + product.quantity, 0)
    );
    productQty.innerText = `${qtyCounter}`;
  } else {
    productContainer.style.display = "block";
    productQty.style.display = "none";
  }
}

function sumTotal() {
  let total = cartProducts.reduce(
    (sumaTotal, producto) => sumaTotal + producto.subtotal,
    0
  );
  totalcart.innerHTML = `Total: $ ${total}`;
}

function cleanHTML() {
  while (cartContent.firstChild) {
    cartContent.removeChild(cartContent.firstChild);
  }
}

function buyCartContent() {
  Swal.fire({
    icon: "success",
    title: "Thank you for your order!",
    timer: 5000,
    timerProgressBar: true,
    allowOutsideClick: true,
    allowEscapeKey: true,
    allowEnterKey: true,
  });
  cleanLS("cartProducts");
  loadCartToLS();
  showCartProducts();
  closeCart();
}

function emptyCartContent() {
  Swal.fire({
    title: "Empty cart",
    text: "Are you sure you want to clean your cart?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "No",
  }).then((btnResponse) => {
    if (btnResponse.isConfirmed) {
      Swal.fire({
        title: "Your cart is empty",
        icon: "success",
        text: "Now you have a fesh start!",
        timerProgressBar: true,
        timer: 5000,
      });
      cleanLS("cartProducts");
      loadCartToLS();
      closeCart();
    } else {
      closeCart();
    }
  });
}

eventLoader();
