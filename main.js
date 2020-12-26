// Module Pattern

// Local Storage module to store the items into the local storage
const LocalStorage = (() => {
  const checkStorage = () => {
    let storageItem;

    if (localStorage.length === 0) {
      // There is no data in the storage, initialize an empty array
      storageItem = [];
    } else {
      // There is some data insert that data into the storageItem
      storageItem = JSON.parse(localStorage.getItem("calItem"));
    }

    return storageItem;
  };

  // Returning public methods to access the private data
  return {
    // Method to send the data into the local storage
    sendToStorage: (item) => {
      const storageItem = checkStorage(); // First check there is data or not
      storageItem.push(item); // Push the new data into the existing data
      localStorage.setItem("calItem", JSON.stringify(storageItem)); // Now store it into the ls
    },
    // Method to fetch the data from the local storage
    fetchFromStorage: () => checkStorage(),
    // Method to get the existing data present in the storage
    getStorageData: () => checkStorage(),
    // Method to update the storage after updation
    updateStorage: (newItems) => {
      localStorage.setItem("calItem", JSON.stringify(newItems));
    },
    // Method to clear all the data present in the storage
    clearItems: () => {
      localStorage.clear();
    },
  };
})();

// Item control module to fetch and process the calorie data
const ItemCtrl = (() => {
  // Item constructor to create an item
  const Item = function (id, name, calories) {
    this.id = id;
    this.name = name;
    this.calories = calories;
  };

  // Item have the datastructure which contains all its data
  const itemData = {
    items: [],
    currentItem: null,
    totalCalories: 0,
  };

  // Returning public methods to access the private data
  return {
    // Method to inspect the data inside the ItemCtrl
    logData: () => itemData,
    // Method to set the data
    setItemData: (items) => {
      itemData.items = items; // Storing the data from the local storage
    },
    // Method to hand over the data to the UI
    getItemData: () => itemData.items,
    // Method to create an item fetched from the user
    createItem: (item) => {
      const { name, calories } = item; // Fetching each name and calorie through destructuring
      const items = ItemCtrl.getItemData();
      let id;
      // We have to generate a specific id for the item
      if (items.length > 0) {
        id = items[items.length - 1].id + 1;
      } else {
        id = 1;
      }
      const newItem = new Item(id, name, parseInt(calories)); // Creating item
      LocalStorage.sendToStorage(newItem); // Storing to local storage
      return newItem; // Return the item to render it on the UI
    },
    // Method to calculate and get total calories
    getTotalCal: () => {
      let totalCal = 0; // Total calories intitially zero
      const items = ItemCtrl.getItemData(); // Fetching items

      // Looping through the items
      items.forEach((item) => {
        totalCal += item.calories;
      });

      itemData.totalCalories = totalCal; // Update the total calories
      return itemData.totalCalories; // Return the total calories
    },
    // Method to set the current item to the item list which is selected
    setCurrentItem: (item) => {
      itemData.currentItem = item; // Update the current item
      return itemData.currentItem; // Finally return the item
    },
    // Method to get only the current item data
    getCurrentItem: () => {
      return itemData.currentItem;
    },
    // Method to update the current item from the datastructure
    updateItemList: (id, newName, newCalorie) => {
      let updatedItem = "";
      // First looping through the item lists to search our current data through its id
      itemData.items.forEach((item) => {
        if (item.id === id) {
          // We got our current data lets update it
          item.name = newName;
          item.calories = newCalorie;
          updatedItem = item;
        }
      });
      return updatedItem; // Also returning the updated data for the UI
    },
    // Method to remove an item with its id
    removeItem: (id) => {
      // Deleting from items first
      const newItems = itemData.items.filter((item) => item.id !== id);
      itemData.items = newItems;
      return itemData.items;
    },
    // Method to remove item from items datastructure
    clearItemData: () => {
      itemData.items.splice(0, itemData.items.length);
    },
  };
})();

// UI control module to render that calorie data into the UI
const UICtrl = (() => {
  // Object consisting of all the selectors
  const selectors = {
    itemField: "#item-field",
    caloriesField: "#calories-field",
    itemLists: "#item-lists",
    itemList: ".item",
    addBtn: ".add-btn",
    updateBtn: ".update-btn",
    backBtn: ".back-btn",
    delBtn: ".delete-btn",
    resetBtn: ".reset-btn",
    totalCal: "#total-cal",
    btnDefaultState: ".btn-default-state",
    btnEditState: ".btn-edit-state",
  };

  // Returning public methods to access the private data
  return {
    // Method to get all the selectors through another module
    getSelectors: () => selectors,
    // Method to render all the items into the UI
    renderItems: (items) => {
      // Looping through the items and rendering each item
      items.forEach((item) => {
        UICtrl.setItem(item);
      });
    },
    // Method to render individual item into the UI
    setItem: (item) => {
      const { id, name, calories } = item;
      const itemList = document.createElement("li");
      itemList.id = `item-${id}`;
      itemList.className = "item bg-secondary";
      itemList.innerHTML = `<p class="lead-2 primary">
                                <span class="item-name">${name}</span> consists of
                                <span class="item-cal">${calories}</span> calories
                            </p>
                            <div class="edit-btn" title="Edit Item">
                                <i class="fa fa-edit primary"></i>
                            </div>`;
      document.querySelector(selectors.itemLists).appendChild(itemList);
    },
    // Method to carry out the user's inputted values from the UI
    getInputValue: () => {
      // Return the values
      return {
        name: document.querySelector(selectors.itemField).value,
        calories: document.querySelector(selectors.caloriesField).value,
      };
    },
    // Method to do validation stuffs
    validateInput: () => {
      const addItemBtn = document.querySelector(selectors.addBtn);
      return {
        enableBtn: () => {
          addItemBtn.disabled = false;
          addItemBtn.classList.replace("btn-deactive", "btn-primary");
        },
        disableBtn: () => {
          addItemBtn.disabled = true;
          addItemBtn.classList.replace("btn-primary", "btn-deactive");
        },
        noNegativeCal: () => {
          const calorie = document.querySelector(selectors.caloriesField);
          if (calorie.value === 0 || calorie.value < 0) {
            // Let the calorie be 1
            calorie.value = 1;
          }
        },
      };
    },
    // Method to vanish/clear items on the UI
    vanishItems: () => {
      document
        .querySelectorAll(selectors.itemList)
        .forEach((item) => item.remove());
    },
    // Method to clear the input fields
    clearInput: () => {
      document.querySelector(selectors.itemField).value = "";
      document.querySelector(selectors.caloriesField).value = "";
      UICtrl.validateInput().disableBtn(); // Also disable the button
    },
    // Method to display total calories
    showTotalCal: (totalCal) => {
      document.querySelector(selectors.totalCal).textContent = totalCal;
    },
    // Method to show an edit state when user clicks on the edit
    showEditState: (item) => {
      // Show the item's data on the fields to be edited
      const { name, calories } = item;
      document.querySelector(selectors.itemField).value = name;
      document.querySelector(selectors.caloriesField).value = calories;

      // Also show the edit buttons
      document.querySelector(selectors.btnDefaultState).style.display = "none"; // Hide the default btns
      document.querySelector(selectors.btnEditState).style.display = "flex"; // Show the edit state btns
    },
    // Method to show the default state
    showDefaultState: () => {
      UICtrl.clearInput(); // First clear the inputs
      // Show the default state
      document.querySelector(selectors.btnEditState).style.display = "none";
      document.querySelector(selectors.btnDefaultState).style.display = "flex";
    },
    // Method to render the updated item on the UI
    showUpdatedItem: (item) => {
      const { id, name, calories } = item;
      // Fetching all the items listed on the UI
      document.querySelectorAll(selectors.itemList).forEach((item) => {
        if (item.id === `item-${id}`) {
          // Updated item's id matched with the id of the item in the UI
          item.firstElementChild.firstElementChild.textContent = name; // Updating name
          item.firstElementChild.lastElementChild.textContent = calories; // Updating calories
        }
      });
    },
    // Method to show the default state when there is no item left on the UI
    checkItemUI: () => {
      // Get the no. of items
      const itemCount = document.querySelectorAll(selectors.itemList).length;
      if (itemCount === 0) {
        // Show the default state when there is no item left
        UICtrl.showDefaultState();
      }
    },
  };
})();

// App module to initialize both UI control and Item control
const App = ((ItemCtrl, UICtrl) => {
  // Fetching all the selectors
  const selectors = UICtrl.getSelectors();

  // Function to load the event listeners
  const loadEventListeners = function () {
    // To fetch the items from the UI and then displaying the data
    document.querySelector(selectors.addBtn).addEventListener("click", addItem);
    // To validate both the input fields
    document.querySelectorAll("input").forEach((inputField) => {
      inputField.addEventListener("keyup", validateFields);
    });
    // To edit the item
    document
      .querySelector(selectors.itemLists)
      .addEventListener("click", editItem);
    // To update an item
    document
      .querySelector(selectors.updateBtn)
      .addEventListener("click", updateItem);
    // To get back to the default state
    document
      .querySelector(selectors.backBtn)
      .addEventListener("click", backToDefaultState);
    // To delete an item
    document
      .querySelector(selectors.delBtn)
      .addEventListener("click", deleteItem);
    // To reset or clear all the items
    document
      .querySelector(selectors.resetBtn)
      .addEventListener("click", resetItem);
  };

  // Listener functions
  function addItem(e) {
    const inputItems = UICtrl.getInputValue(); // Fetching the user input
    const newItem = ItemCtrl.createItem(inputItems); // Creating item through ItemCtrl
    ItemCtrl.setItemData(LocalStorage.fetchFromStorage()); // Fetching the item from LS and then storing the data into the items
    UICtrl.setItem(newItem); // Displaying item on the UI
    UICtrl.clearInput(); // Clear the input after submission

    // Also updating the total calories after updation
    const totalCal = ItemCtrl.getTotalCal();
    UICtrl.showTotalCal(totalCal);

    console.log(ItemCtrl.getItemData());
  }

  function validateFields(e) {
    const { name, calories } = UICtrl.getInputValue();
    // Checking if the fields are currently empty
    if (name !== "" && calories !== "") {
      // Fields are not empty, activate the btn
      UICtrl.validateInput().enableBtn();
    } else {
      // Fields are empty, let the button remain deactive
      UICtrl.validateInput().disableBtn();
    }
  }

  function editItem(e) {
    // Targetting the edit btn through event delegation
    if (e.target.classList.contains("edit-btn")) {
      // Fetching the current item's id,name and calories
      const id = parseInt(e.target.parentElement.id.split("-")[1]);
      const currentItem = {
        id,
        name: e.target.previousElementSibling.firstElementChild.textContent,
        calories: parseInt(
          e.target.previousElementSibling.lastElementChild.textContent
        ),
      };
      const item = ItemCtrl.setCurrentItem(currentItem); // Set this as a current item to and get back this to display it in the UI
      UICtrl.showEditState(item);
    }
  }

  function updateItem(e) {
    // First get the updated item from the fields
    const name = document.querySelector(selectors.itemField).value;
    const calories = parseInt(
      document.querySelector(selectors.caloriesField).value
    );

    const curItem = ItemCtrl.getCurrentItem(); // Get the current item
    const updatedItem = ItemCtrl.updateItemList(curItem.id, name, calories); // Send the data to be updated
    LocalStorage.updateStorage(ItemCtrl.getItemData()); // Updating the storage
    UICtrl.showUpdatedItem(updatedItem); // Updating the item on the UI
    // Also updating the total calories after updation
    UICtrl.showTotalCal(ItemCtrl.getTotalCal());
  }

  function backToDefaultState(e) {
    UICtrl.showDefaultState(); // Show the default state only
  }

  function deleteItem(e) {
    // First fetching the current item's id
    const id = ItemCtrl.getCurrentItem().id;
    const item = ItemCtrl.removeItem(id);
    LocalStorage.updateStorage(item);
    UICtrl.vanishItems();
    UICtrl.renderItems(item);
    UICtrl.clearInput();
    UICtrl.showTotalCal(ItemCtrl.getTotalCal());
    UICtrl.checkItemUI();
    console.log(item);
  }

  function resetItem(e) {
    // Clear the local storage
    LocalStorage.clearItems();
    ItemCtrl.clearItemData();
    UICtrl.vanishItems();
    UICtrl.showTotalCal(ItemCtrl.getTotalCal());
  }

  // Returning the init method to initialize our app
  return {
    init: function () {
      UICtrl.showDefaultState(); // Show the default state initially
      UICtrl.validateInput().disableBtn(); // Let the add btn be disabled initially for validation
      loadEventListeners(); // Load the event listeners
      ItemCtrl.setItemData(LocalStorage.fetchFromStorage()); // Storing data form local storage to the items
      const items = ItemCtrl.getItemData(); // Fetch the items from the ItemCtrl
      UICtrl.renderItems(items); // Rendering all the items initially

      // Also updating the total calories after updation
      const totalCal = ItemCtrl.getTotalCal();
      UICtrl.showTotalCal(totalCal);
    },
  };
})(ItemCtrl, UICtrl);

// Initialize the app
App.init();
