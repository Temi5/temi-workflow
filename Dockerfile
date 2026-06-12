FROM nginx:alpine

# Copy all your local project assets (landing page and calculator) into the Nginx web directory
COPY . /usr/share/nginx/html/

# Expose port 80 so web traffic can reach it
EXPOSE 80