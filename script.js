let users = JSON.parse(localStorage.getItem("users")) || [];
let posts = JSON.parse(localStorage.getItem("posts")) || [];
let currentUser = localStorage.getItem("currentUser");

function saveData() {
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("posts", JSON.stringify(posts));
}

function showNavbar() {
    let nav = document.getElementById("navbar");

    if (currentUser) {
        nav.innerHTML = `
            <button onclick="home()">Home</button>
            <button onclick="people()">People</button>
            <button onclick="profile()">Profile</button>
            <button onclick="logout()">Logout</button>
        `;
    } else {
        nav.innerHTML = "";
    }
}

function registerPage() {
    document.getElementById("app").innerHTML = `
        <div class="box">
            <h2>Register</h2>
            <input id="regUser" placeholder="Username">
            <input id="regPass" type="password" placeholder="Password">
            <button onclick="register()">Register</button>
            <p>Already registered? <button onclick="loginPage()">Login</button></p>
        </div>
    `;
}

function register() {
    let username = document.getElementById("regUser").value.trim();
    let password = document.getElementById("regPass").value;

    if (!username || !password) {
        alert("Enter all details");
        return;
    }

    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        alert("Username already exists");
        return;
    }

    users.push({
        username: username,
        password: password,
        bio: "Welcome to my profile",
        following: []
    });

    saveData();
    alert("Registration successful");
    loginPage();
}

function loginPage() {
    document.getElementById("app").innerHTML = `
        <div class="box">
            <h2>Login</h2>
            <input id="loginUser" placeholder="Username">
            <input id="loginPass" type="password" placeholder="Password">
            <button onclick="login()">Login</button>
            <p>New user? <button onclick="registerPage()">Register</button></p>
        </div>
    `;
}

function login() {
    let username = document.getElementById("loginUser").value.trim();
    let password = document.getElementById("loginPass").value;

    let user = users.find(u =>
        u.username.toLowerCase() === username.toLowerCase() &&
        u.password === password
    );

    if (!user) {
        alert("Invalid username or password");
        return;
    }

    currentUser = user.username;
    localStorage.setItem("currentUser", currentUser);

    showNavbar();
    home();
}

function logout() {
    currentUser = null;
    localStorage.removeItem("currentUser");
    showNavbar();
    loginPage();
}

function home() {
    showNavbar();

    let user = users.find(u => u.username === currentUser);
    let following = user.following || [];

    let feed = posts.filter(p =>
        p.username === currentUser || following.includes(p.username)
    );

    document.getElementById("app").innerHTML = `
        <h2>Home Feed</h2>

        <div class="box">
            <h3>Create Post</h3>
            <textarea id="postText" placeholder="What's happening?"></textarea>
            <button onclick="createPost()">Post</button>
        </div>

        <div id="feed"></div>
    `;

    let feedDiv = document.getElementById("feed");

    if (feed.length === 0) {
        feedDiv.innerHTML = "<p>No posts available. Follow people to see their posts!</p>";
    }

    feed.forEach(p => {
        feedDiv.innerHTML += `
            <div class="post">
                <h3>@${escapeHTML(p.username)}</h3>
                <p>${escapeHTML(p.content)}</p>

                <button onclick="likePost(${p.id})">
                    ${p.likes.includes(currentUser) ? "❤️ Liked" : "🤍 Like"}
                    (${p.likes.length})
                </button>

                <h4>Comments (${p.comments.length})</h4>

                ${p.comments.map(c => `
                    <div class="comment">
                        <b>@${escapeHTML(c.username)}</b>:
                        ${escapeHTML(c.text)}
                    </div>
                `).join("")}

                <input id="comment${p.id}" placeholder="Write a comment">
                <button onclick="addComment(${p.id})">Comment</button>
            </div>
        `;
    });
}

function createPost() {
    let content = document.getElementById("postText").value.trim();

    if (!content) {
        alert("Write something");
        return;
    }

    posts.unshift({
        id: Date.now(),
        username: currentUser,
        content: content,
        likes: [],
        comments: []
    });

    saveData();
    home();
}

function likePost(id) {
    let post = posts.find(p => p.id === id);

    if (post.likes.includes(currentUser)) {
        post.likes = post.likes.filter(u => u !== currentUser);
    } else {
        post.likes.push(currentUser);
    }

    saveData();
    home();
}

function addComment(id) {
    let input = document.getElementById("comment" + id);
    let text = input.value.trim();

    if (!text) {
        alert("Write a comment");
        return;
    }

    let post = posts.find(p => p.id === id);

    post.comments.push({
        username: currentUser,
        text: text
    });

    saveData();
    home();
}

function people() {
    showNavbar();

    let app = document.getElementById("app");

    app.innerHTML = "<h2>Discover People</h2>";

    users.filter(u => u.username !== currentUser).forEach(u => {

        let isFollowing = users.find(
            x => x.username === currentUser
        ).following.includes(u.username);

        let followers = users.filter(x =>
            x.following.includes(u.username)
        ).length;

        app.innerHTML += `
            <div class="person">
                <div>
                    <h3>@${escapeHTML(u.username)}</h3>
                    <p>${escapeHTML(u.bio)}</p>
                    <p>Followers: ${followers}</p>
                </div>

                <button onclick="followUser('${encodeURIComponent(u.username)}')">
                    ${isFollowing ? "Unfollow" : "Follow"}
                </button>
            </div>
        `;
    });
}

function followUser(encodedUsername) {
    let username = decodeURIComponent(encodedUsername);

    let user = users.find(u => u.username === currentUser);

    if (user.following.includes(username)) {
        user.following = user.following.filter(u => u !== username);
    } else {
        user.following.push(username);
    }

    saveData();
    people();
}

function profile() {
    showNavbar();

    let user = users.find(u => u.username === currentUser);

    let followers = users.filter(u =>
        u.following.includes(currentUser)
    ).length;

    let myPosts = posts.filter(p =>
        p.username === currentUser
    );

    document.getElementById("app").innerHTML = `
        <div class="box">
            <h2>My Profile</h2>
            <h3>@${escapeHTML(currentUser)}</h3>

            <p>Followers: ${followers}</p>
            <p>Following: ${user.following.length}</p>

            <textarea id="bio">${escapeHTML(user.bio)}</textarea>
            <button onclick="updateBio()">Update Profile</button>
        </div>

        <h2>My Posts</h2>
        <div id="myPosts"></div>
    `;

    let div = document.getElementById("myPosts");

    myPosts.forEach(p => {
        div.innerHTML += `
            <div class="post">
                <p>${escapeHTML(p.content)}</p>
                <p>❤️ ${p.likes.length} Likes</p>
                <p>💬 ${p.comments.length} Comments</p>
            </div>
        `;
    });
}

function updateBio() {
    let user = users.find(u => u.username === currentUser);

    user.bio = document.getElementById("bio").value;

    saveData();
    alert("Profile updated");
    profile();
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

showNavbar();

if (currentUser && users.some(u => u.username === currentUser)) {
    home();
} else {
    currentUser = null;
    localStorage.removeItem("currentUser");
    loginPage();
}
