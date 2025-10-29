// Global state
let currentTopic = 'All';
let currentUser = null;

// Check authentication on page load
window.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    // Get user data
    const userData = localStorage.getItem('user');
    if (userData) {
        currentUser = JSON.parse(userData);
        document.getElementById('userName').textContent = currentUser.username;
    }

    // Load posts
    await loadPosts();

    // Auto-refresh posts every 30 seconds
    setInterval(loadPosts, 30000);
});

// Logout
function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Filter by topic
async function filterByTopic(topic) {
    currentTopic = topic;

    // Update UI
    document.querySelectorAll('.topic-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    document.getElementById('topicTitle').textContent =
        topic === 'All' ? 'All Topics' : `${topic} Posts`;

    // Load posts
    await loadPosts();
}

// Load posts
async function loadPosts() {
    const container = document.getElementById('postsContainer');
    const showOnlyLive = document.getElementById('showOnlyLive').checked;

    try {
        container.innerHTML = '<div class="loading">Loading posts...</div>';

        const filters = {};

        if (currentTopic !== 'All') {
            filters.topic = currentTopic;
        }

        if (showOnlyLive) {
            filters.status = 'Live';
        }

        const response = await api.getPosts(filters);

        if (response.success && response.data.posts.length > 0) {
            container.innerHTML = '';
            response.data.posts.forEach(post => {
                container.appendChild(createPostCard(post));
            });
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No posts found</h3>
                    <p>Be the first to create a post!</p>
                </div>
            `;
        }
    } catch (error) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>Error loading posts</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// Create post card
function createPostCard(post) {
    const card = document.createElement('div');
    card.className = 'post-card';

    const isOwner = currentUser && post.owner._id === currentUser.id;
    const isExpired = post.status === 'Expired';

    // Check if current user has liked/disliked
    const hasLiked = currentUser && post.likes.some(like =>
        (typeof like === 'object' ? like._id : like) === currentUser.id
    );
    const hasDisliked = currentUser && post.dislikes.some(dislike =>
        (typeof dislike === 'object' ? dislike._id : dislike) === currentUser.id
    );

    // Get usernames for likes and dislikes
    console.log('Post likes:', post.likes);
    console.log('Post dislikes:', post.dislikes);

    const likeUsernames = post.likes.map(like =>
        typeof like === 'object' ? like.username : 'Unknown'
    );
    const dislikeUsernames = post.dislikes.map(dislike =>
        typeof dislike === 'object' ? dislike.username : 'Unknown'
    );

    console.log('Like usernames:', likeUsernames);
    console.log('Dislike usernames:', dislikeUsernames);

    // Calculate time left
    const timeLeft = calculateTimeLeft(post.expirationTime);

    card.innerHTML = `
        <div class="post-header">
            <div>
                <h3 class="post-title">${escapeHtml(post.title)}</h3>
                <div class="post-meta">
                    <span class="post-status ${post.status.toLowerCase()}">${post.status}</span>
                    ${post.topics.map(topic => `<span class="post-topic">${topic}</span>`).join('')}
                    <span>by ${escapeHtml(post.owner.username)}</span>
                    <span>${timeLeft}</span>
                </div>
            </div>
        </div>

        <p class="post-message">${escapeHtml(post.message)}</p>

        <div class="post-actions">
            <button
                class="action-btn like ${hasLiked ? 'active' : ''}"
                onclick="handleLike('${post._id}')"
                ${isExpired || isOwner ? 'disabled' : ''}
            >
                👍 Like (${post.likesCount || 0})
            </button>
            <button
                class="action-btn dislike ${hasDisliked ? 'active' : ''}"
                onclick="handleDislike('${post._id}')"
                ${isExpired || isOwner ? 'disabled' : ''}
            >
                👎 Dislike (${post.dislikesCount || 0})
            </button>
            <button class="action-btn" onclick="showInteractionsModal('${post._id}', ${JSON.stringify(likeUsernames)}, ${JSON.stringify(dislikeUsernames)})">
                👥 View Who Reacted (${(post.likesCount || 0) + (post.dislikesCount || 0)})
            </button>
            <button class="action-btn">
                💬 Comments (${post.commentsCount || 0})
            </button>
        </div>

        <!-- Who Liked/Disliked Section -->
        <div class="interactions-details">
            ${likeUsernames.length > 0 ? `
                <div class="interaction-box likes-box">
                    <div class="interaction-header">👍 People who liked this post:</div>
                    <div class="user-list">
                        ${likeUsernames.map(username => `
                            <span class="user-badge like-badge">${escapeHtml(username)}</span>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            ${dislikeUsernames.length > 0 ? `
                <div class="interaction-box dislikes-box">
                    <div class="interaction-header">👎 People who disliked this post:</div>
                    <div class="user-list">
                        ${dislikeUsernames.map(username => `
                            <span class="user-badge dislike-badge">${escapeHtml(username)}</span>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            ${likeUsernames.length === 0 && dislikeUsernames.length === 0 ? `
                <div class="no-interactions">No likes or dislikes yet. Be the first!</div>
            ` : ''}
        </div>

        <div class="comments-section">
            <div class="comments-header">Comments</div>
            ${!isExpired ? `
                <div class="comment-form">
                    <input
                        type="text"
                        class="comment-input"
                        id="comment-${post._id}"
                        placeholder="Add a comment..."
                    >
                    <button
                        class="btn btn-primary"
                        onclick="handleAddComment('${post._id}')"
                    >
                        Post
                    </button>
                </div>
            ` : '<p style="color: #999; font-size: 14px;">This post is expired. No more comments allowed.</p>'}

            <div class="comment-list" id="comments-${post._id}">
                ${post.comments && post.comments.length > 0 ?
                    post.comments.map(comment => `
                        <div class="comment">
                            <div class="comment-author">${escapeHtml(comment.user.username)}</div>
                            <div class="comment-text">${escapeHtml(comment.text)}</div>
                            <div class="comment-date">${formatDate(comment.createdAt)}</div>
                        </div>
                    `).join('')
                : '<p style="color: #999; font-size: 14px;">No comments yet</p>'}
            </div>
        </div>
    `;

    return card;
}

// Handle like
async function handleLike(postId) {
    try {
        const response = await api.likePost(postId);
        if (response.success) {
            await loadPosts();
        }
    } catch (error) {
        alert(error.message);
    }
}

// Handle dislike
async function handleDislike(postId) {
    try {
        const response = await api.dislikePost(postId);
        if (response.success) {
            await loadPosts();
        }
    } catch (error) {
        alert(error.message);
    }
}

// Handle add comment
async function handleAddComment(postId) {
    const input = document.getElementById(`comment-${postId}`);
    const text = input.value.trim();

    if (!text) {
        alert('Please enter a comment');
        return;
    }

    try {
        const response = await api.addComment(postId, text);
        if (response.success) {
            input.value = '';
            await loadPosts();
        }
    } catch (error) {
        alert(error.message);
    }
}

// Show create post modal
function showCreatePostModal() {
    document.getElementById('createPostModal').style.display = 'block';
}

// Close create post modal
function closeCreatePostModal() {
    document.getElementById('createPostModal').style.display = 'none';
    document.getElementById('postTitle').value = '';
    document.getElementById('postMessage').value = '';
    document.getElementById('expirationMinutes').value = '5';

    // Clear topic selection
    const topicsSelect = document.getElementById('postTopics');
    for (let option of topicsSelect.options) {
        option.selected = false;
    }
}

// Handle create post
async function handleCreatePost(event) {
    event.preventDefault();

    const title = document.getElementById('postTitle').value;
    const message = document.getElementById('postMessage').value;
    const expirationMinutes = parseInt(document.getElementById('expirationMinutes').value);

    // Get selected topics
    const topicsSelect = document.getElementById('postTopics');
    const topics = Array.from(topicsSelect.selectedOptions).map(option => option.value);

    if (topics.length === 0) {
        alert('Please select at least one topic');
        return;
    }

    try {
        const response = await api.createPost({
            title,
            topics,
            message,
            expirationMinutes
        });

        if (response.success) {
            closeCreatePostModal();
            alert('Post created successfully!');
            await loadPosts();
        }
    } catch (error) {
        alert(error.message);
    }
}

// Show most active modal
function showMostActiveModal() {
    document.getElementById('mostActiveModal').style.display = 'block';
    document.getElementById('mostActiveResult').innerHTML = '';
}

// Close most active modal
function closeMostActiveModal() {
    document.getElementById('mostActiveModal').style.display = 'none';
}

// Find most active post
async function findMostActivePost() {
    const topic = document.getElementById('mostActiveTopic').value;
    const resultDiv = document.getElementById('mostActiveResult');

    try {
        resultDiv.innerHTML = '<div class="loading">Loading...</div>';

        const response = await api.getMostActivePost(topic);

        if (response.success) {
            const post = response.data.post;
            resultDiv.innerHTML = '';
            resultDiv.appendChild(createPostCard(post));
        }
    } catch (error) {
        resultDiv.innerHTML = `
            <div class="empty-state">
                <h3>No active posts found</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// Show interactions modal
function showInteractionsModal(postId, likeUsernames, dislikeUsernames) {
    const modal = document.getElementById('interactionsModal') || createInteractionsModal();
    const modalContent = modal.querySelector('.interactions-modal-content');

    let html = '<h2>👥 Who Reacted to This Post</h2>';

    if (likeUsernames.length > 0) {
        html += `
            <div class="interaction-section">
                <h3>👍 Liked by (${likeUsernames.length})</h3>
                <ul class="user-list-modal">
                    ${likeUsernames.map(username => `
                        <li class="user-item like-item">
                            <span class="user-icon">👤</span>
                            <span class="username">${username}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    } else {
        html += `<div class="interaction-section"><p class="no-data">👍 No likes yet</p></div>`;
    }

    if (dislikeUsernames.length > 0) {
        html += `
            <div class="interaction-section">
                <h3>👎 Disliked by (${dislikeUsernames.length})</h3>
                <ul class="user-list-modal">
                    ${dislikeUsernames.map(username => `
                        <li class="user-item dislike-item">
                            <span class="user-icon">👤</span>
                            <span class="username">${username}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    } else {
        html += `<div class="interaction-section"><p class="no-data">👎 No dislikes yet</p></div>`;
    }

    modalContent.innerHTML = html;
    modal.style.display = 'block';
}

// Create interactions modal if it doesn't exist
function createInteractionsModal() {
    const modal = document.createElement('div');
    modal.id = 'interactionsModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content interactions-modal">
            <span class="close" onclick="closeInteractionsModal()">&times;</span>
            <div class="interactions-modal-content"></div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

// Close interactions modal
function closeInteractionsModal() {
    const modal = document.getElementById('interactionsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Show expired posts
async function showExpiredPosts() {
    currentTopic = 'Expired';
    document.getElementById('topicTitle').textContent = 'Expired Posts';

    // Uncheck "show only live"
    document.getElementById('showOnlyLive').checked = false;

    // Clear active topic buttons
    document.querySelectorAll('.topic-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    const container = document.getElementById('postsContainer');

    try {
        container.innerHTML = '<div class="loading">Loading expired posts...</div>';

        const response = await api.getPosts({ status: 'Expired' });

        if (response.success && response.data.posts.length > 0) {
            container.innerHTML = '';
            response.data.posts.forEach(post => {
                container.appendChild(createPostCard(post));
            });
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No expired posts found</h3>
                </div>
            `;
        }
    } catch (error) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>Error loading expired posts</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
}

function calculateTimeLeft(expirationTime) {
    const now = new Date();
    const expiration = new Date(expirationTime);
    const diff = expiration - now;

    if (diff <= 0) {
        return 'Expired';
    }

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return `${days}d ${hours % 24}h left`;
    } else if (hours > 0) {
        return `${hours}h ${minutes % 60}m left`;
    } else {
        return `${minutes}m left`;
    }
}

// Close modals when clicking outside
window.onclick = function(event) {
    const createModal = document.getElementById('createPostModal');
    const activeModal = document.getElementById('mostActiveModal');
    const interactionsModal = document.getElementById('interactionsModal');

    if (event.target === createModal) {
        closeCreatePostModal();
    }
    if (event.target === activeModal) {
        closeMostActiveModal();
    }
    if (event.target === interactionsModal) {
        closeInteractionsModal();
    }
}
