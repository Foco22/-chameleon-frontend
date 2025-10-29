# Dockerfile for Piazza Frontend
FROM nginx:alpine

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy frontend files
COPY index.html /usr/share/nginx/html/
COPY home.html /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/
COPY api.js /usr/share/nginx/html/
COPY auth.js /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
