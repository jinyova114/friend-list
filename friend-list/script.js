const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users/";
const dataPanel = document.querySelector("#data-panel");

const friends = [];
let filteredFriends = [];
const friendsPerPage = 12;

const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector('#paginator')

// 功能一: Render friend list
function renderFriendList(data) {
  let rawHTML = "";
  data.forEach((item) => {
    rawHTML += `
        <div class="col">
          <div class="card h-100" style="max-width: 18rem">
            <img src= "${item.avatar}" class="card-img-top card-image" alt="Friend Avatar">
            <div id="friend-name" class="card-body fs-5 text-center">
              <div class='name'>${item.name} ${item.surname}</div>
            </div>
            <div class="d-flex justify-content-center">
              <button type="button" class="btn btn-secondary btn-sm btn-show-friend"  data-bs-toggle="modal" data-bs-target="#friend-modal" data-id=${item.id}> More </button>
              <button type="button" class="btn btn-success btn-sm btn-add-favorite" data-id=${item.id}> + </button>
            </div>
          </div>
        </div>
    `;
  });
  dataPanel.innerHTML = rawHTML;
}

// 功能二: Render modals
function showFriendModal(id) {
  const modalName = document.querySelector("#modal-name");
  const modalInfo = document.querySelector("#modal-info");
  const modalImage = document.querySelector("#modal-image");

  // 先清空內容，避免出現上一個的資料
  modalName.textContent = "";
  modalImage.src = "";
  modalInfo.textContent = "";

  // 取資料，render modal
  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const data = response.data;
      modalName.innerText = data.name + " " + data.surname;
      modalImage.src = data.avatar;
      modalInfo.innerHTML = `
        <p id="modal-gender">Gender: ${data.gender} </p>
        <p id="modal-age">Age: ${data.age} </p>
        <p id="modal-bday">Birthday: ${data.birthday} </p>
        <p id="modal-region">Region: ${data.region}</p>
        <p id="modal-email">Email: ${data.email}</p>`;
    })
    .catch((error) => {
      console.log(error);
    });
}

// 功能三: 儲存到local storage (加入最愛)
function addToFavorite(id) {
  const favoriteList = JSON.parse(localStorage.getItem('favoriteFriends')) || []
  const friend = friends.find((friend) => friend.id === id)
  console.log(friend)

  if (favoriteList.some((friend) => friend.id === id)) {
    return alert('Already added!')
  } else {
    favoriteList.push(friend)
  }
  localStorage.setItem('favoriteFriends', JSON.stringify(favoriteList))
}

// 功能四: Render Paginator
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / friendsPerPage);
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

// 功能五: 每一頁呈現指定數量的朋友
function getFriendsByPage(page) {
  const startIndex = (page - 1) * friendsPerPage
  return friends.slice(startIndex, startIndex + friendsPerPage)
}


// 監聽: 點擊到more按鈕，呼叫功能二。 
// 點擊到'+'，呼叫功能三
dataPanel.addEventListener("click", (event) => {
  if (event.target.matches(".btn-show-friend")) {
    showFriendModal(Number(event.target.dataset.id));
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id))
  }
});

// 監聽: Search Form
searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();
  filteredFriends = friends.filter(
    (friend) =>
      friend.name.toLowerCase().includes(keyword) ||
      friend.surname.toLowerCase().includes(keyword)
  );
  if (keyword.length === 0) {
    return alert("查無此人");
  }
  renderFriendList(filteredFriends);
});

// 監聽: 點頁數，跑畫面
paginator.addEventListener('click', (event) => {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  renderFriendList(getFriendsByPage(page))
})

// 抓取資料，render the friend list
axios
  .get(INDEX_URL)
  .then((response) => {
    friends.push(...response.data.results);
    renderPaginator(friends.length);
    renderFriendList(getFriendsByPage(1));
  })
  .catch((error) => console.log(error));


