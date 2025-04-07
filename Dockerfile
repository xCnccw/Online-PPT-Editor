# Step 1: Build the React app with Vite
FROM node:18-alpine AS build
WORKDIR /app
COPY . .
RUN npm install && npm run build

# Step 2: Serve the app with Nginx
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
