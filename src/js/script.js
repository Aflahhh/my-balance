document.addEventListener("DOMContentLoaded", function () {
  const incomeForm = document.getElementById("income-form");
  const expenseForm = document.getElementById("expense-form");

  incomeForm.addEventListener("submit", function (e) {
    e.preventDefault();
    saveTransaction("income");
    clearForm(incomeForm);
  });

  expenseForm.addEventListener("submit", function (e) {
    e.preventDefault();
    saveTransaction("expense");
    clearForm(expenseForm);
  });

  loadTransactions();
  updateBalance();

  function saveTransaction(type) {
    const date = document.querySelector(`#${type}-form input[name="date"]`).value;
    let amount = document.querySelector(`#${type}-form input[name="number"]`).value;
    const description = document.querySelector(`#${type}-form input[name="text"]`).value;

    // Remove thousand separators before saving
    amount = amount.replace(/[^0-9]/g, "");

    const transactionId = document.querySelector(`#${type}-form`).dataset.transactionId;
    let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

    if (transactionId) {
      // Editing existing transaction
      transactions = transactions.map((transaction) => {
        if (transaction.id === parseInt(transactionId)) {
          return { ...transaction, date, amount: parseInt(amount), description };
        }
        return transaction;
      });
    } else {
      // Adding new transaction
      const transaction = {
        id: Date.now(), // Use timestamp as a unique ID
        date,
        amount: parseInt(amount), // Ensure the amount is saved as an integer
        description,
        type,
      };
      transactions.push(transaction);
    }

    localStorage.setItem("transactions", JSON.stringify(transactions));

    loadTransactions();
    updateBalance(); // Update balance after saving the transaction

    // Remove the transactionId attribute
    delete document.querySelector(`#${type}-form`).dataset.transactionId;
  }

  function loadTransactions() {
    const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    const tableBody = document.querySelector("table tbody");
    tableBody.innerHTML = "";

    transactions.forEach((transaction) => {
      const row = document.createElement("tr");
      row.classList.add("dark:bg-gray-800", "dark:border-gray-700", "border-b", "border-[#6d798d]");
      row.setAttribute("data-id", transaction.id); // Set a data attribute for the ID

      row.innerHTML = `
        <th scope="row" class="px-6 py-4 font-normal whitespace-nowrap dark:text-white">${transaction.date}</th>
        <td class="px-6 py-4">${transaction.type === "income" ? "Rp, " + new Intl.NumberFormat("id-ID").format(transaction.amount) : "-"}</td>
        <td class="px-6 py-4">${transaction.type === "expense" ? "Rp, " + new Intl.NumberFormat("id-ID").format(transaction.amount) : "-"}</td>
        <td class="px-6 py-4">${transaction.description}</td>
        <td class="px-7 py-4 block">
          <button class="edit-btn" onclick="editTransaction(${transaction.id})">Ubah</button>
          <button class="delete-btn" onclick="deleteTransaction(${transaction.id})">Hapus</button>
          

        </td>
      `;

      tableBody.appendChild(row);
    });
  }

  function getTransactions() {
    const transactions = localStorage.getItem("transactions");
    return transactions ? JSON.parse(transactions) : [];
  }

  function saveTransactions(transactions) {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }

  window.deleteTransaction = function (id) {
    let transactions = getTransactions();
    transactions = transactions.filter((transaction) => transaction.id !== id);
    saveTransactions(transactions);
    loadTransactions(); // Reload transactions to update the table
    updateBalance(); // Update balance after deleting a transaction
  };

  window.editTransaction = function (id) {
    const transactions = getTransactions();
    const transaction = transactions.find((transaction) => transaction.id === id);

    if (transaction) {
      const form = document.querySelector(`#${transaction.type}-form`);
      form.querySelector('input[name="date"]').value = transaction.date;
      form.querySelector('input[name="number"]').value = new Intl.NumberFormat("id-ID").format(transaction.amount);
      form.querySelector('input[name="text"]').value = transaction.description;
      form.dataset.transactionId = transaction.id;

      // Show the modal
      showModal(transaction.type);
    }
  };

  function showModal(type) {
    const modalId = type === "income" ? "authentication-modal" : "authentication-modal-2";
    const modal = document.getElementById(modalId);

    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }
  }

  function updateBalance() {
    const transactions = getTransactions();
    const balance = transactions.reduce((acc, transaction) => {
      return acc + (transaction.type === "income" ? transaction.amount : -transaction.amount);
    }, 0);
    const balanceAmount = document.getElementById("balance-amount");
    balanceAmount.textContent = "Balance : " + "Rp, " + new Intl.NumberFormat("id-ID").format(balance);
  }

  function clearForm(form) {
    form.reset();
  }

  const angkaElements = document.querySelectorAll("#number");

  angkaElements.forEach((element) => {
    element.addEventListener("input", function (e) {
      let value = e.target.value;
      value = value.replace(/[^0-9]/g, ""); // Remove any non-digit characters
      const formattedValue = new Intl.NumberFormat("id-ID").format(value); // Format the number with thousand separators
      e.target.value = formattedValue; // Set the formatted value back to the input field
    });
  });
});
