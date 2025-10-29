# Piazza API Frontend

A simple web frontend to test all Piazza API test cases.

## Features

- User registration and login (OAuth v2)
- Create posts with expiration time
- Browse posts by topic (Politics, Health, Sport, Tech)
- Like/Dislike posts
- Comment on posts
- View expired posts
- Find most active post by topic
- Real-time post expiration tracking

## Setup

### 1. Update API URL

The API URL is already configured in `api.js`:
```javascript
const API_BASE_URL = 'http://34.31.148.75:5000';
```

If your API is running on a different URL, update this line.

### 2. Run the Frontend

#### **Option 1: Using Docker (Recommended)** 🐳

```bash
cd cam-frontend

# Build and run with docker-compose
docker compose up -d

# Or build manually
docker build -t piazza-frontend .
docker run -d -p 8080:80 --name piazza-frontend piazza-frontend
```

Then open: **http://localhost:8080**

To stop:
```bash
docker compose down
# or
docker stop piazza-frontend
```

#### Option 2: Using Python HTTP Server
```bash
cd cam-frontend
python3 -m http.server 8000
```

Then open: http://localhost:8000

#### Option 3: Using Node.js http-server
```bash
cd cam-frontend
npx http-server -p 8000
```

Then open: http://localhost:8000

#### Option 4: Using Live Server (VS Code Extension)
1. Install "Live Server" extension in VS Code
2. Right-click on `index.html` and select "Open with Live Server"

## Testing All Test Cases

### TC 1-2: Register Users
1. Open the frontend application
2. Click "Register" tab
3. Register these users:
   - Olga
   - Nick
   - Mary
   - Nestor

### TC 3: Unauthorized Access Test
1. Open browser DevTools (F12)
2. Go to Console
3. Run: `localStorage.removeItem('token')`
4. Try to create a post or like something - should fail

### TC 4-6: Create Posts with Expiration
1. Login as Olga
2. Click "Create Post"
3. Fill in:
   - Title: "Cloud is the worst technology"
   - Topics: Select "Tech"
   - Message: Your message
   - Expiration: 5 minutes
4. Click Create
5. Repeat for Nick and Mary (login as each user)

### TC 7: Browse Posts
1. Login as Nick or Olga
2. Click "Tech" in the sidebar
3. You should see 3 posts with 0 likes, 0 dislikes, 0 comments

### TC 8: Like Mary's Post
1. Login as Nick
2. Find Mary's post in Tech topic
3. Click "👍 Like" button
4. Logout and login as Olga
5. Click "👍 Like" on Mary's post

### TC 9: Mixed Interactions
1. Login as Nestor
2. Find Nick's post and click "👍 Like"
3. Find Mary's post and click "👎 Dislike"

### TC 10: Browse and See Counts
1. Login as Nick
2. Click "Tech" topic
3. You should see:
   - Mary's post: 2 likes, 1 dislike
   - Nick's post: 1 like

### TC 11: Owner Cannot Like Own Post
1. Login as Mary
2. Try to like your own post
3. The like button should be disabled

### TC 12: Round-Robin Comments
1. Login as Nick
2. Comment on Mary's post (type in the comment box and click "Post")
3. Logout and login as Olga
4. Comment on Mary's post
5. Repeat at least 2 times each

### TC 13: View Posts with Comments
1. Login as Nick
2. Click "Tech" topic
3. You should see all likes, dislikes, and comments

### TC 14-16: Health Topic Posts
1. Login as Nestor
2. Create a post in "Health" topic with expiration time
3. Logout and login as Mary
4. Click "Health" topic (should see only Nestor's post)
5. Add a comment to Nestor's post

### TC 17: Interact After Expiration
1. Wait for Nestor's post to expire (or set expiration to 1 minute)
2. Login as Mary
3. Try to dislike the post - should fail (button disabled)

### TC 18: Browse Health Posts
1. Login as Nestor
2. Click "Health" topic
3. Should see 1 post with 1 comment (Mary's)

### TC 19: Browse Expired Posts in Sport
1. Click "Sport" topic in sidebar
2. Click "View Expired Posts" button
3. Should show empty (no expired posts in Sport)

### TC 20: Most Active Post Query
1. Click "Most Active Post" button
2. Select "Tech" from dropdown
3. Click "Find Most Active"
4. Should show Mary's post (highest likes + dislikes)

## File Structure

```
cam-frontend/
├── index.html          # Login/Register page
├── home.html           # Main application page
├── styles.css          # All styling
├── api.js              # API service for backend calls
├── auth.js             # Authentication logic
├── app.js              # Main application logic
├── Dockerfile          # Docker image definition
├── docker-compose.yml  # Docker Compose configuration
├── nginx.conf          # Nginx web server config
├── .dockerignore       # Docker ignore file
└── README.md           # This file
```

## Features Implemented

✅ User registration and login
✅ JWT token authentication
✅ Create posts with custom expiration time (with quick select: 1, 5, 10 min, 1 hour)
✅ Browse posts by topic
✅ Filter live vs expired posts
✅ Like/Dislike posts (with restrictions)
✅ Comment on posts
✅ Real-time expiration tracking
✅ Most active post query
✅ View expired posts
✅ Owner cannot like own posts
✅ Cannot interact with expired posts
✅ Auto-refresh posts every 30 seconds

## Notes

- Posts auto-refresh every 30 seconds
- Time left is displayed in a human-readable format (days, hours, minutes)
- Expired posts are clearly marked
- Post owners cannot like/dislike their own posts
- All interactions are disabled for expired posts
- The UI is responsive and works on mobile devices
