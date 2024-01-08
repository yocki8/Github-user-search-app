'use strict';

/***** Declare Variables *******************************************/
const body = document.body;
const container = document.getElementById('container');
const input = document.getElementById('search');
const menu = document.getElementById('suggestions_menu');
const overlay = document.getElementById('overlay');
const linkArrow = document.getElementById('link_arrow');
const userCard = document.getElementById('user_card');
const userImage = document.getElementById('user_image');
const userDescreption = document.getElementById('user_descreption');
const userName = document.getElementById('user_name');
const userBio = document.getElementById('user_bio');
const userFollower = document.getElementById('user_followers');
const userFollowing = document.getElementById('user_following');
const userUsername = document.getElementById('user_username');
const userURL = document.getElementById('user_url');
let intervalId;
let userData = [];
let index = -1;

/********** Arrow Functions (not hoisted) ******************************************/

// Functions with concise arrow syntax, not hoisted
const loadBodyBackground = () => {
    const tempImage = new Image();
    tempImage.src = 'img/space.jpg';
    tempImage.addEventListener('load', () => {
        body.style.backgroundImage = `url('${tempImage.src}')`;
    });
};

const unselect = () => {
    index = -1;
    userData     &&
        userData.forEach((user) => {
            user.classList.remove('bg-[#484f6683]');
        });
};

const showUserCard = () => {
    overlay.classList.add('custom');
    container.classList.add('custom');
    userCard.classList.add('custom');
};

const hideUserCard = () => {
    overlay.classList.remove('custom');
    container.classList.remove('custom');
    userCard.classList.remove('custom');
};

const deleteMenu = () => {
    index = -1;
    menu.innerHTML = '';
};

const loadAvatar = (url, original) => {
    const tempImage = new Image();
    tempImage.src = url;
    tempImage.addEventListener('load', () => {
        original.src = tempImage.src;
    });
};

const highlight = (index) => {
    const ele = userData[index];
    userData.forEach((user) => {
        user.classList.remove('bg-[#484f6683]');
    });
    ele.classList.add('bg-[#484f6683]');
};

const getAverageColor = async (tempImage) => {
    var canvas = document.createElement('canvas'),
        context = canvas.getContext && canvas.getContext('2d'),
        imgData,
        width,
        height,
        length,
        rgb = { r: 0, g: 0, b: 0 },
        count = 0;

    height = canvas.height = tempImage.naturalHeight || tempImage.offsetHeight || tempImage.height;
    width = canvas.width = tempImage.naturalWidth || tempImage.offsetWidth || tempImage.width;

    context.drawImage(tempImage, 0, 0);

    imgData = context.getImageData(0, 0, width, height);

    length = imgData.data.length;

    for (var i = 0; i < length; i += 4) {
        rgb.r += imgData.data[i];
        rgb.g += imgData.data[i + 1];
        rgb.b += imgData.data[i + 2];
        count++;
    }

    rgb.r = Math.floor(rgb.r / count);
    rgb.g = Math.floor(rgb.g / count);
    rgb.b = Math.floor(rgb.b / count);
};

/**************** Functions. ********************/
// Function to render user card information
const renderCard = async function () {
    // Async function to fetch user data and render the card

    const selectedUser = userData[index].getAttribute('name');
    console.log(selectedUser);
    const user =await fetch(`https://api.github.com/users/${selectedUser}`)
        .then((res) => res.json())
        .then((data) => data)
        .catch(err=>{});  

    input.value = '';
    userURL.href = user.html_url;
    userImage.src="img/github-user.png";
    userName.textContent = user.name;
    userUsername.textContent = user.login;
    userFollower.textContent = user.followers;
    userFollowing.textContent = user.following;

    loadAvatar(user.avatar_url,userImage);
    let typeIt;
    if (!user.bio) typeIt = 'No bio :-(';
    else typeIt = user.bio;

    const typewriter = new Typewriter(userBio, {
        delay: 30,
    });

    typewriter.typeString(typeIt).start();

    deleteMenu();
    showUserCard();
    deleteMenu();
};

const hideCard = function () {
    hideUserCard();
};
// Function to render the suggestion menu
const renderMenu = function () {
    menu.style.display = '';
    menu.innerHTML = '';
    userData = userData.map((user, i) => {
        // Generate HTML for each user in the menu
        const html = `<li class="user_list p-3 flex rounded-lg m-2 transition-all duration-100" data-index='${i}' name='${user.login}'>
            &nbsp;
            <img
            src="img/github-user.png"
            alt="${user.login} png"
            class="h-10 my-auto rounded-full" />

            <h5 class="leading-10 transition duration-300 ">
            &nbsp;${user.login}&nbsp;</h5>
        </li>`;

        menu.insertAdjacentHTML('beforeend', html);

        // Load user avatar asynchronously
        loadAvatar(user.avatar_url, menu.lastChild.querySelector('img'));

        return menu.lastChild;
    });
};

// Function to display search suggestions
const displaySuggestions = async function (inputText) {
    try {
        userData = await fetch(`https://api.github.com/search/users?q=${inputText}&per_page=5&page=1`)
            .then((res) => {
                if (!res.ok) throw new Error('Data is not fetched');
                return res.json();
            })
            .then((data) => data.items)
            .catch((err) => {});

        // Render the suggestion menu
        renderMenu();
    } catch (error) {
        // Handle errors
    }
};

/******************* Event Listeners ******************************/
// Event listener to close the menu when clicking outside of it

body.addEventListener('click', (e) => {
    if (e.target == overlay) {
        menu.style.display = 'none';
        hideCard();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key == 'Escape') hideCard();
});

// Event listener to highlight the user on mouseover in the menu
menu.addEventListener('mouseover', (e) => {
    const ele = e.target.closest('.user_list');

    if (ele) {
        index = ele && e.target.closest('.user_list').dataset.index;
        highlight(index);
    }
});

menu.addEventListener('click', renderCard);

// Event listener to handle keyboard interactions in the input field
input.addEventListener('keydown', (event) => {
    const key = event.key;
    if (key == 'ArrowDown' || key == 'ArrowUp') {
        // Handle arrow key navigation
        if (key == 'ArrowDown') index++;
        else {
            if (index <= 0) index = userData.length - 1;
            else index--;
        }

        index = index && index % userData.length;

        // Highlight the selected user
        highlight(index);
    } else if (key == 'Enter') {
        // Handle Enter key press
        if (index == -1) index = 0;
        if (userData.length) {
            renderCard();
        }
    } else {
        // Handle other key presses for search suggestions

        index = -1;
        clearTimeout(intervalId);
        if (input.value.length > 1) {
            intervalId = setTimeout(function () {
                input.value.length && displaySuggestions(input.value);
            }, 200);
        } else deleteMenu();
    }
});

// Event listener to display the menu on input click
input.addEventListener('click', () => {
    menu.style.display = '';
    unselect();
});

userUsername.addEventListener('mouseover', (e) => {
    linkArrow.classList.add('custom');
});

userUsername.addEventListener('mouseout', () => {
    linkArrow.classList.remove('custom');
});

/**************** After Page loads. **********/
loadBodyBackground();
